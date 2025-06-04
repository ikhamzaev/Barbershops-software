"use client";
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { getAppointmentsByClient, cancelAppointment, Appointment } from '@/lib/booking';
import { supabase } from '@/lib/supabaseClient';
import { FiCalendar, FiUser, FiScissors, FiClock, FiCheckCircle, FiXCircle, FiRepeat } from "react-icons/fi";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchAppointments = async () => {
            try {
                const data = await getAppointmentsByClient(user.id);
                setAppointments(data);
            } catch (error) {
                toast.error('Error loading appointments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);

    const handleCancelAppointment = async (appointmentId: string) => {
        try {
            await cancelAppointment(appointmentId);
            setAppointments((current) =>
                current.map((apt) =>
                    apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
                )
            );
            toast.success('Appointment cancelled successfully');
        } catch (error) {
            toast.error('Error cancelling appointment');
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="text-center py-8">Loading appointments...</div>
            </div>
        );
    }

    // Split appointments into upcoming and past
    const now = new Date();
    const upcoming = appointments.filter(a => {
        const [year, month, day] = a.appointment_date.split('-').map(Number);
        const [hours, minutes] = a.appointment_time.split(':').map(Number);
        const apptDate = new Date(year, month - 1, day, hours, minutes);
        return apptDate >= now;
    });
    const past = appointments.filter(a => {
        const [year, month, day] = a.appointment_date.split('-').map(Number);
        const [hours, minutes] = a.appointment_time.split(':').map(Number);
        const apptDate = new Date(year, month - 1, day, hours, minutes);
        return apptDate < now;
    });

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Mening bronlarim</h1>

            {/* Upcoming Appointments */}
            <h2 className="text-lg font-semibold mb-2 text-green-700">Kelgusi bronlar</h2>
            {upcoming.length === 0 ? (
                <div className="text-center py-4 text-gray-400">Kelgusi bronlar yo'q.</div>
            ) : (
                <div className="space-y-4 mb-8">
                    {upcoming.map((appointment) => (
                        <div
                            key={appointment.id}
                            className={`bg-white rounded-2xl shadow p-4 flex items-center justify-between ${appointment.status === 'cancelled' ? 'opacity-60 border border-red-300' : ''}`}
                        >
                            <div>
                                <div className="text-gray-900 font-medium">
                                    {appointment.services?.name || (Array.isArray(appointment.services) && appointment.services.length > 0 ? appointment.services.map(s => s.name).join(', ') : 'Service')}
                                </div>
                                <div className="text-gray-500 text-sm flex items-center gap-2">
                                    <FiCalendar /> {appointment.appointment_date} <FiClock /> {appointment.appointment_time}
                                </div>
                                <div className="text-gray-500 text-sm flex items-center gap-2">
                                    <FiUser /> {appointment.barbers?.name || 'Barber'} <FiScissors /> {appointment.barbershops?.name || 'Barbershop'}
                                </div>
                                {appointment.status === 'cancelled' && (
                                    <div className="mt-2 text-red-600 font-semibold flex items-center gap-2">
                                        <FiXCircle className="inline" /> Cancelled by barber
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-400 mb-1">
                                    {appointment.appointment_time}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-blue-100 text-blue-700'
                                    }`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                                {appointment.status !== 'cancelled' && (
                                    <button
                                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-semibold"
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Past Appointments */}
            <h2 className="text-lg font-semibold mb-2 text-gray-700">O'tgan bronlar</h2>
            {past.length === 0 ? (
                <div className="text-center py-4 text-gray-400">O'tgan bronlar yo'q.</div>
            ) : (
                <div className="space-y-4">
                    {past.map((appointment) => (
                        <div
                            key={appointment.id}
                            className={`bg-gray-50 rounded-lg shadow p-6 border border-gray-100 opacity-80 ${appointment.status === 'cancelled' ? 'opacity-60 border border-red-300' : ''}`}
                        >
                            {/* Date at the top */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                    <FiCalendar className="inline-block" />
                                    {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                                    <span className="ml-2 text-gray-500 font-normal">{appointment.appointment_time}</span>
                                </div>
                                <div
                                    className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'booked' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {appointment.status === 'booked' ? 'Faol' :
                                        appointment.status === 'confirmed' ? 'Tasdiqlangan' :
                                            appointment.status === 'cancelled' ? 'Bekor qilingan' :
                                                appointment.status === 'completed' ? 'Tugatildi' :
                                                    'Yakunlangan'}
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <img
                                    src={appointment.barbers?.photo_url || '/default-avatar.png'}
                                    alt={appointment.barbers?.name}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {appointment.barbers?.name}
                                    </h3>
                                    <p className="text-gray-600">{appointment.barbershops?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {appointment.barbershops?.address}
                                    </p>
                                    {Array.isArray(appointment.services) && appointment.services.length > 0 && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {appointment.services.map((service: any, idx: number) => (
                                                <div key={idx}>
                                                    {service.name} ({service.duration} daqiqa, {service.price} so'm)
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 