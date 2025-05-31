"use client";
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

function BookingSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!appointmentId) return;
        async function fetchAppointment() {
            setLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    barbers:barber_id (
                        id, name, photo_url, email
                    ),
                    barbershops:barbershop_id (
                        id, name, address, phone, location, logo_url
                    ),
                    services:service_id (
                        id, name, price
                    )
                `)
                .eq('id', appointmentId)
                .single();
            setAppointment(data);
            setLoading(false);
        }
        fetchAppointment();
    }, [appointmentId]);

    useEffect(() => {
        // Redirect to appointments page after 5 seconds
        const timer = setTimeout(() => {
            router.push('/client-dashboard/appointments');
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    if (loading || !appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
                <div className="text-gray-600 text-lg">Loading appointment details...</div>
            </div>
        );
    }

    const { barbers, barbershops, services, appointment_date, appointment_time } = appointment;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Confirmed!
                </h1>
                <p className="text-gray-600 mb-8">
                    Your appointment has been successfully booked.
                </p>
                {/* Barber and Barbershop Info */}
                <div className="flex flex-col items-center mb-6">
                    {barbers?.photo_url && (
                        <img src={barbers.photo_url} alt={barbers.name} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400 mb-2" />
                    )}
                    <div className="font-semibold text-lg text-gray-900">{barbers?.name}</div>
                    <div className="text-gray-500 text-sm">{barbers?.email}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                    <div className="mb-2">
                        <span className="font-medium text-gray-700">Barbershop:</span> {barbershops?.name}
                    </div>
                    <div className="mb-2">
                        <span className="font-medium text-gray-700">Address:</span> {barbershops?.address}
                    </div>
                    {barbershops?.phone && (
                        <div className="mb-2">
                            <span className="font-medium text-gray-700">Phone:</span> {barbershops.phone}
                        </div>
                    )}
                    {barbershops?.location && (
                        <div className="mb-2">
                            <span className="font-medium text-gray-700">Location:</span>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barbershops.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline ml-1"
                            >
                                View on Map
                            </a>
                        </div>
                    )}
                    <div className="mb-2">
                        <span className="font-medium text-gray-700">Date:</span> {appointment_date}
                    </div>
                    <div className="mb-2">
                        <span className="font-medium text-gray-700">Time:</span> {appointment_time}
                    </div>
                    {services && (
                        <div className="mb-2">
                            <span className="font-medium text-gray-700">Service:</span> {services.name} {services.price && (<span className="text-gray-500">(${services.price})</span>)}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/client-dashboard/messages?barber=${barbers?.id}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mb-4"
                >
                    Message Barber
                </button>
                <p className="text-sm text-gray-500 mb-6">
                    Redirecting to your appointments page in 5 seconds...
                </p>
                <button
                    onClick={() => router.push('/client-dashboard/appointments')}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
                >
                    View My Appointments
                </button>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingSuccessContent />
        </Suspense>
    );
} 