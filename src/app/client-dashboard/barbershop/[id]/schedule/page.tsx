"use client";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { format, addHours, parseISO, addDays, isToday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { getAppointmentsByBarber, subscribeToAppointments } from '@/lib/booking';
import ServiceSelection from '@/components/booking/ServiceSelection';
import { BarberService } from '@/lib/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const mockDates = [
    { date: 20, month: 3, year: 2024, day: 'Wednesday' },
    { date: 21, month: 3, year: 2024, day: 'Thursday' },
    { date: 22, month: 3, year: 2024, day: 'Friday' },
    { date: 23, month: 3, year: 2024, day: 'Saturday' },
    { date: 24, month: 3, year: 2024, day: 'Sunday' },
    { date: 25, month: 3, year: 2024, day: 'Monday' },
    { date: 26, month: 3, year: 2024, day: 'Tuesday' },
];

const mockTimes = [
    "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const mockBarbershop = {
    name: "Chris Knight Barbershop",
};
const mockBarber = {
    name: "Cody Fisher",
    avatar: "/images/barber-cody.jpg",
};
const mockService = "Soch olish & Qirqish +1";
const mockPrice = 125;

function getDayOfWeek(date: Date) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
}

function getTotalDuration(services: BarberService[]) {
    return services.reduce((sum, s) => sum + (s.duration || 0), 0);
}

function generateSlots(start: string, end: string, interval: number) {
    // interval in minutes
    const slots = [];
    let [h, m] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    while (h < endH || (h === endH && m < endM)) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        m += interval;
        if (m >= 60) { h++; m -= 60; }
    }
    return slots;
}

interface TimeSlot {
    start_time: string;
    end_time: string;
    isAvailable: boolean;
}

interface PageProps {
    params: {
        id: string;
    };
}

export default function SchedulePage({ params }: PageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedServices, setSelectedServices] = useState<BarberService[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const barberId = searchParams.get("barber") || '';
    const [showSummary, setShowSummary] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    // Helper to generate next 14 days
    function getNextDays(numDays = 14) {
        const days = [];
        for (let i = 0; i < numDays; i++) {
            const date = addDays(new Date(), i);
            days.push(date);
        }
        return days;
    }
    const days = getNextDays();

    // Fetch user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    // When services are selected, auto-select today if not already set
    useEffect(() => {
        if (selectedServices.length > 0 && !selectedDate) {
            setSelectedDate(new Date());
        }
    }, [selectedServices, selectedDate]);

    // Fetch slots when services or date changes
    useEffect(() => {
        async function fetchSlots() {
            if (!barberId || selectedServices.length === 0 || !selectedDate) return;
            setIsLoading(true);
            const dayOfWeek = getDayOfWeek(selectedDate);
            // Debug: Log selected date and barberId
            console.log('fetchSlots: Selected date:', selectedDate, 'Barber ID:', barberId);
            // Fetch barber availability for this day
            const { data: availData, error: availError } = await supabase
                .from("barber_availability")
                .select("*")
                .eq("barber_id", barberId)
                .eq("day_of_week", dayOfWeek)
                .single();
            if (availError && availError.code !== "PGRST116") {
                toast.error("Could not fetch availability");
                setIsLoading(false);
                return;
            }
            // Fetch appointments for this barber and date
            const dateStr = [
                selectedDate.getFullYear(),
                String(selectedDate.getMonth() + 1).padStart(2, '0'),
                String(selectedDate.getDate()).padStart(2, '0')
            ].join('-');
            const { data: apptData, error: apptError } = await supabase
                .from("appointments")
                .select("*")
                .eq("barber_id", barberId)
                .eq("appointment_date", dateStr);
            // Debug: Log fetched appointments
            console.log('fetchSlots: Fetched appointments for', dateStr, apptData);
            if (apptError) {
                toast.error("Could not fetch appointments");
                setIsLoading(false);
                return;
            }
            // Determine working hours (default 09:00-20:00 if not set)
            const startTime = availData?.start_time || "09:00";
            const endTime = availData?.end_time || "20:00";
            // Calculate total duration for selected services
            const interval = Math.max(getTotalDuration(selectedServices), 1); // in minutes
            // Generate slots at intervals equal to the selected service duration
            const slots = generateSlots(startTime, endTime, interval);
            // Debug: Log generated slots
            console.log('fetchSlots: Generated slots:', slots);
            // Build slot objects and filter out those that overlap with existing appointments
            const slotObjs: TimeSlot[] = slots.map((slotStart) => {
                const [h, m] = slotStart.split(":").map(Number);
                const slotStartDate = new Date(selectedDate);
                slotStartDate.setHours(h, m, 0, 0);
                const slotEndDate = new Date(slotStartDate.getTime() + interval * 60000);
                // Robust overlap check for all appointments
                const overlaps = apptData.some((appt: any) => {
                    if (appt.status === 'cancelled') return false;
                    // Only consider appointments for the selected date
                    const apptDateStr = appt.appointment_date;
                    const selectedDateStr = [
                        selectedDate.getFullYear(),
                        String(selectedDate.getMonth() + 1).padStart(2, '0'),
                        String(selectedDate.getDate()).padStart(2, '0')
                    ].join('-');
                    if (apptDateStr !== selectedDateStr) return false;

                    // Parse appointment start time in local time
                    const [apptHour, apptMinute] = appt.appointment_time.split(':');
                    const apptStart = new Date(selectedDate);
                    apptStart.setHours(parseInt(apptHour), parseInt(apptMinute), 0, 0);

                    // Calculate appointment duration robustly
                    let apptDuration = 60; // default duration
                    let apptServices = appt.services;

                    // Always try to parse services as JSON if it's a string
                    if (typeof apptServices === 'string') {
                        try {
                            apptServices = JSON.parse(apptServices);
                        } catch (e) {
                            apptServices = null;
                        }
                    }

                    if (Array.isArray(apptServices) && apptServices.length > 0) {
                        apptDuration = apptServices.reduce((sum: number, s: any) => {
                            if (typeof s === 'object' && s.duration) return sum + s.duration;
                            if (typeof s === 'number') return sum + s;
                            return sum;
                        }, 0);
                    } else if (apptServices && typeof apptServices === 'object' && apptServices.duration) {
                        apptDuration = apptServices.duration;
                    }

                    if (typeof apptDuration !== 'number' || isNaN(apptDuration)) apptDuration = 60;

                    const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000);

                    // Debug logging
                    console.log('[OverlapCheck]',
                        'slot:', slotStartDate.toISOString(), '-', slotEndDate.toISOString(),
                        '| appt:', apptStart.toISOString(), '-', apptEnd.toISOString(),
                        '| duration:', apptDuration,
                        '| services:', apptServices,
                        '| apptId:', appt.id,
                        '| overlaps:', slotStartDate < apptEnd && slotEndDate > apptStart
                    );

                    return slotStartDate < apptEnd && slotEndDate > apptStart;
                });

                return {
                    start_time: slotStartDate.toISOString(),
                    end_time: slotEndDate.toISOString(),
                    isAvailable: !overlaps
                };
            });
            setTimeSlots(slotObjs);
            setIsLoading(false);
        }
        fetchSlots();

        // Subscribe to real-time updates for appointments
        if (barberId && selectedDate) {
            const dateStr = [
                selectedDate.getFullYear(),
                String(selectedDate.getMonth() + 1).padStart(2, '0'),
                String(selectedDate.getDate()).padStart(2, '0')
            ].join('-');
            console.log('Setting up real-time subscription for:', { barberId, dateStr });
            const channel = supabase
                .channel('appointments')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'appointments',
                        filter: `barber_id=eq.${barberId}`
                    },
                    (payload) => {
                        console.log('Real-time update received:', payload);
                        // Only refetch if the appointment is for the selected date
                        const appointment = payload.new as any;
                        if (appointment.appointment_date === dateStr) {
                            console.log('Refetching slots due to appointment change:', appointment);
                            fetchSlots();
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('Subscription status:', status);
                });

            return () => {
                console.log('Cleaning up real-time subscription');
                supabase.removeChannel(channel);
            };
        }
    }, [barberId, selectedDate, selectedServices]);

    // Helper to check if a slot is in the future (for today)
    function isSlotInFuture(slot: TimeSlot, date: Date) {
        if (!isToday(date)) return true;
        const now = new Date();
        const slotStart = new Date(slot.start_time);
        return slotStart > now;
    }

    // Booking logic
    const handleBookAppointment = async () => {
        if (!selectedSlot || selectedServices.length === 0) return;
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please sign in to book an appointment');
                return;
            }
            // Fetch client name and email from users table
            const { data: userRow, error: userError } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', user.id)
                .single();
            if (userError || !userRow) {
                toast.error('Could not fetch client info');
                return;
            }
            const appointmentDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
            const appointmentTime = format(new Date(selectedSlot.start_time), 'HH:mm');
            const endTime = format(new Date(selectedSlot.end_time), 'HH:mm');
            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    client_id: user.id,
                    client_name: userRow.name,
                    client_email: userRow.email,
                    barber_id: barberId,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    end_time: endTime,
                    status: 'booked',
                    services: selectedServices.map(service => ({
                        service_id: service.id,
                        name: service.name,
                        price: service.price,
                        duration: service.duration
                    }))
                })
                .select()
                .single();
            if (error) throw error;
            toast.success('Appointment booked successfully!');
            // Redirect to booking success/confirmation page
            router.push(`/client-dashboard/booking-success?appointmentId=${data.id}`);
        } catch (error) {
            console.error('Error booking appointment:', error);
            toast.error('Failed to book appointment');
        } finally {
            setIsLoading(false);
        }
    };

    // UI rendering: all-in-one flow
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <div className="max-w-2xl w-full pt-4 px-4 pb-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-2">Select Services</h2>
                <ServiceSelection
                    barberId={barberId}
                    onServicesSelected={setSelectedServices}
                />

                {/* Show horizontal date picker only after service is selected */}
                {selectedServices.length > 0 && (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Select Date</h2>
                        <div className="flex overflow-x-auto gap-2 pb-2 mb-6">
                            {days.map((date) => (
                                <button
                                    key={date.toDateString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex flex-col items-center px-4 py-2 rounded-lg border transition font-semibold min-w-[80px] ${selectedDate && date.toDateString() === selectedDate.toDateString()
                                        ? "bg-yellow-300 border-yellow-400 text-gray-900"
                                        : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-yellow-100"}`}
                                >
                                    <span className="text-sm">{isToday(date) ? "Today" : date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                    <span className="text-xs mt-1">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Show time slots only after date is picked */}
                {selectedServices.length > 0 && selectedDate && (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Select Time</h2>
                        {isLoading ? (
                            <div className="text-center py-4">Loading time slots...</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {timeSlots.filter(slot => slot.isAvailable && isSlotInFuture(slot, selectedDate)).length === 0 ? (
                                    <div className="col-span-full text-center text-gray-400">No available slots for this day.</div>
                                ) : (
                                    timeSlots.filter(slot => slot.isAvailable && isSlotInFuture(slot, selectedDate)).map((slot) => (
                                        <button
                                            key={slot.start_time}
                                            onClick={() => { setSelectedSlot(slot); setShowSummary(true); }}
                                            className={`p-4 rounded-lg text-center transition-all bg-white border border-gray-200 hover:border-purple-500 hover:shadow-md`}
                                        >
                                            {format(new Date(slot.start_time), 'H:mm')} - {format(new Date(slot.end_time), 'H:mm')}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Booking summary/confirmation */}
                {showSummary && selectedSlot && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-center">Confirm Your Booking</h2>
                            <div className="mb-4">
                                <div className="font-semibold">Date:</div>
                                <div>{selectedDate ? format(selectedDate, 'PPP') : ''}</div>
                                <div className="font-semibold mt-2">Time:</div>
                                <div>{format(new Date(selectedSlot.start_time), 'p')} - {format(new Date(selectedSlot.end_time), 'p')}</div>
                                <div className="font-semibold mt-2">Services:</div>
                                <ul className="list-disc ml-6">
                                    {selectedServices.map(s => (
                                        <li key={s.id}>{s.name} ({s.duration} min, {s.price.toLocaleString()} so'm)</li>
                                    ))}
                                </ul>
                                <div className="font-semibold mt-2">Total Duration:</div>
                                <div>{getTotalDuration(selectedServices)} minut</div>
                                <div className="font-semibold mt-2">Total Price:</div>
                                <div>{selectedServices.reduce((sum, s) => sum + s.price, 0).toLocaleString()} so'm</div>
                            </div>
                            <button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mb-2"
                                onClick={handleBookAppointment}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Booking...' : 'Confirm & Book'}
                            </button>
                            <button
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold transition"
                                onClick={() => setShowSummary(false)}
                                disabled={isLoading}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 