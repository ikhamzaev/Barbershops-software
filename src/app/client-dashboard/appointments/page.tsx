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

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

            {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    You don't have any appointments yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="bg-white rounded-lg shadow p-6 border border-gray-200"
                        >
                            <div className="flex items-start justify-between">
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
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                                    </div>
                                    <div className="font-medium">
                                        {appointment.appointment_time}
                                    </div>
                                    {Array.isArray(appointment.services) && appointment.services.length > 0 && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {appointment.services.map((service: any, idx: number) => (
                                                <div key={idx}>
                                                    {service.name} ({service.duration} min, ${service.price})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div
                                    className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'booked'
                                        ? 'bg-green-100 text-green-800'
                                        : appointment.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {appointment.status.charAt(0).toUpperCase() +
                                        appointment.status.slice(1)}
                                </div>
                                {appointment.status === 'booked' && (
                                    <button
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Cancel Appointment
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 