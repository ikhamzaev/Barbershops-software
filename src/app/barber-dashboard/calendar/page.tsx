"use client";
import { useState, useEffect } from 'react';
import { FaPlus, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import BarberSidebarNav from '@/components/barber/BarberSidebarNav';
import BarberBottomNav from '@/components/barber/BarberBottomNav';
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getAppointmentsByBarber, subscribeToAppointments, Appointment } from '@/lib/booking';

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [barberId, setBarberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch barber ID from Supabase auth/profile
    useEffect(() => {
        const fetchBarberId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // Fetch barber profile by user id
            const { data, error } = await supabase
                .from('barbers')
                .select('id')
                .eq('user_id', user.id)
                .single();
            if (data) {
                setBarberId(data.id);
                console.log('Barber ID:', data.id);
            } else {
                console.warn('No barber profile found for user', user.id);
            }
        };
        fetchBarberId();
    }, []);

    // Fetch appointments for the selected date
    useEffect(() => {
        if (!barberId) return;
        setLoading(true);

        // Format date to YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        console.log('Fetching appointments for date:', formattedDate);

        getAppointmentsByBarber(barberId, formattedDate)
            .then((data) => {
                console.log('Received appointments:', data);
                setAppointments(data);
                if (data && data.length > 0) {
                    data.forEach((apt) => {
                        console.log('Appointment:', {
                            id: apt.id,
                            time: apt.appointment_time,
                            client: apt.client?.name,
                            service: apt.services?.name,
                            date: apt.appointment_date
                        });
                    });
                }
            })
            .catch((error) => {
                console.error('Error fetching appointments:', error);
            })
            .finally(() => setLoading(false));
    }, [barberId, selectedDate]);

    // Subscribe to real-time updates
    useEffect(() => {
        if (!barberId) return;
        console.log('Setting up real-time subscription for barber:', barberId);

        const unsubscribe = subscribeToAppointments(barberId, (appointment) => {
            console.log('Real-time update received:', appointment);
            // Format date to YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];
            getAppointmentsByBarber(barberId, formattedDate)
                .then((data) => {
                    console.log('Updated appointments after real-time change:', data);
                    setAppointments(data);
                })
                .catch((error) => {
                    console.error('Error fetching updated appointments:', error);
                });
        });

        return () => {
            console.log('Cleaning up real-time subscription');
            unsubscribe();
        };
    }, [barberId, selectedDate]);

    const handlePrevDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        setSelectedDate(next);
    };

    // Use 30-minute slots from 8:00 to 23:00
    const hours = Array.from({ length: ((23 - 8) * 2) + 2 }, (_, i) => {
        const hour = 8 + Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    function formatDate(date: Date) {
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Helper to get total duration in minutes
    function getTotalDuration(services: any) {
        if (Array.isArray(services)) {
            return services.reduce((sum, s) => sum + (s.duration || 0), 0);
        } else if (services && typeof services === 'object') {
            return services.duration || 0;
        }
        return 0;
    }

    // Helper to check if a slot is the start of an appointment (now with 30-min precision)
    function isSlotStart(slotTime: string, appt: any) {
        // Handles '09:00', '09:00:00', etc.
        const [apptHour, apptMinute] = appt.appointment_time.split(':');
        const [slotHour, slotMinute] = slotTime.split(':');
        return apptHour === slotHour && apptMinute === slotMinute;
    }

    // Helper to check if a slot overlaps with an appointment
    function doesSlotOverlap(slotTime: string, slotDuration: number, appt: any) {
        const apptStart = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
        const totalDuration = getTotalDuration(appt.services);
        const apptEnd = new Date(apptStart.getTime() + totalDuration * 60000);
        const [slotHour, slotMinute] = slotTime.split(':');
        const slotStart = new Date(`${appt.appointment_date}T${slotHour}:${slotMinute}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
        return slotStart < apptEnd && slotEnd > apptStart;
    }

    // Build a map of slotTime -> { appt, isStart } for each slot, only if not already filled by an earlier appointment
    const slotMap: Record<string, { appt: any, isStart: boolean } | null> = {};
    appointments.forEach(appt => {
        const apptStart = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
        const totalDuration = getTotalDuration(appt.services);
        const numSlots = Math.ceil(totalDuration / 30);
        // Find the index of the slot that matches the appointment start
        const startIdx = hours.findIndex(slotTime => {
            const [slotHour, slotMinute] = slotTime.split(':');
            return apptStart.getHours() === parseInt(slotHour) && apptStart.getMinutes() === parseInt(slotMinute);
        });
        if (startIdx !== -1) {
            for (let i = 0; i < numSlots; i++) {
                const slotIdx = startIdx + i;
                if (slotIdx < hours.length && !slotMap[hours[slotIdx]]) {
                    slotMap[hours[slotIdx]] = { appt, isStart: i === 0 };
                }
            }
        }
    });

    // Helper to get the index of a slot by time
    function getSlotIndex(slotTime: string) {
        return hours.findIndex(h => h === slotTime);
    }

    // Helper to format time as HH:mm
    function formatTime(date: Date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Color palette for appointments
    const appointmentColors = [
        'bg-yellow-100 border-yellow-300 text-yellow-900',
        'bg-blue-100 border-blue-300 text-blue-900',
        'bg-green-100 border-green-300 text-green-900',
        'bg-pink-100 border-pink-300 text-pink-900',
        'bg-purple-100 border-purple-300 text-purple-900',
        'bg-orange-100 border-orange-300 text-orange-900',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] flex">
            {/* Sidebar for desktop */}
            <BarberSidebarNav activeTab="calendar" />
            {/* Main content */}
            <div className="flex-1 flex flex-col items-center px-2 pb-24 md:ml-20">
                {/* Date Picker/Header */}
                <div className="w-full max-w-2xl flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-4">
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><FaChevronLeft /></button>
                        <FaCalendarAlt className="text-purple-500 text-xl" />
                        <h2 className="text-2xl font-bold text-gray-800">{formatDate(selectedDate)}</h2>
                        <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><FaChevronRight /></button>
                    </div>
                </div>
                <div className="w-full max-w-2xl text-gray-500 text-base mb-2 text-left">
                    {loading ? 'Loading...' : `You have ${appointments.length} scheduled visit${appointments.length !== 1 ? 's' : ''} today. Have a nice day!`}
                </div>
                {/* Timeline Schedule */}
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
                    {/* CSS Grid for time slots and appointments */}
                    <div
                        className="grid relative"
                        style={{
                            gridTemplateColumns: '64px 1fr',
                            gridTemplateRows: `repeat(${hours.length}, 56px)`
                        }}
                    >
                        {/* Time labels */}
                        {hours.map((slotTime, idx) => (
                            <div
                                key={slotTime}
                                className={`relative flex items-start h-[56px]`}
                                style={{ gridColumn: 1, gridRow: idx + 1, zIndex: 1, background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}
                            >
                                {/* Time label, flush with the line */}
                                <span className="text-xs text-gray-700 font-bold mr-2" style={{ minWidth: 40, textAlign: 'right', lineHeight: '1', height: '16px', position: 'relative', top: '-8px', display: 'inline-block' }}>{slotTime}</span>
                                {/* Horizontal line starting after the label */}
                                <div className="flex-1 flex items-center" style={{ height: '16px', position: 'relative', top: '-8px' }}>
                                    <div className="border-t border-gray-300 w-full" />
                                </div>
                            </div>
                        ))}
                        {/* Slot backgrounds */}
                        {hours.map((slotTime, idx) => (
                            <div
                                key={slotTime + '-bg'}
                                className={`border-t border-gray-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                style={{ gridColumn: 2, gridRow: idx + 1 }}
                            />
                        ))}
                        {/* Appointment blocks */}
                        {appointments.map((appt, i) => {
                            const apptStart = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
                            const totalDuration = getTotalDuration(appt.services);
                            const numSlots = Math.ceil(totalDuration / 30);
                            // Find the slot index for the appointment start
                            const startIdx = hours.findIndex(slotTime => {
                                const [slotHour, slotMinute] = slotTime.split(':');
                                return apptStart.getHours() === parseInt(slotHour) && apptStart.getMinutes() === parseInt(slotMinute);
                            });
                            if (startIdx === -1) return null;
                            const apptEnd = new Date(apptStart.getTime() + totalDuration * 60000);
                            const colorClass = appointmentColors[i % appointmentColors.length];
                            return (
                                <div
                                    key={appt.id}
                                    className={`rounded-lg px-3 py-2 shadow-md border flex flex-col justify-between transition-all hover:shadow-lg absolute ${colorClass}`}
                                    style={{
                                        gridColumn: 2,
                                        gridRowStart: startIdx + 1,
                                        gridRowEnd: startIdx + 1 + numSlots,
                                        zIndex: 10,
                                        left: 0,
                                        right: 0,
                                        marginLeft: 0,
                                        marginRight: 0,
                                        position: 'relative',
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold">
                                            {formatTime(apptStart)} – {formatTime(apptEnd)}
                                        </span>
                                        <span className="text-xs text-gray-500">{appt.barbershops?.name || ''}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                        <span className="font-semibold text-base">{appt.client?.name || 'Unknown Client'}</span>
                                        <span className="text-xs text-gray-500">{appt.client?.phone || ''}</span>
                                        {(() => {
                                            const servicesArr = Array.isArray(appt.services) ? appt.services : null;
                                            if (servicesArr && servicesArr.length > 0) {
                                                return (
                                                    <span className="text-xs font-medium uppercase tracking-wide">
                                                        {servicesArr.map((s: any, idx: number) => (
                                                            <span key={idx}>
                                                                {s.name}{s.duration ? ` (${s.duration} min)` : ''}{s.price ? `, $${s.price}` : ''}{idx < servicesArr.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </span>
                                                );
                                            } else {
                                                return (
                                                    <span className="text-xs font-medium uppercase tracking-wide">{appt.services?.name || ''}</span>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Bottom nav for mobile */}
            <BarberBottomNav activeTab="calendar" />
        </div>
    );
} 