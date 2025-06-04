"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { FaCalendarAlt, FaClock, FaUser, FaSignOutAlt, FaUsers, FaUserCircle } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import BarberProfileCard from '@/components/barber/BarberProfileCard';
import BarberNavbar from '@/components/barber/BarberNavbar';

interface Appointment {
    id: string;
    barber_id: string;
    client_id: string;
    barbershop_id: string;
    service_id?: string | null;
    appointment_date: string;
    appointment_time: string;
    status: 'booked' | 'completed' | 'cancelled';
    notes?: string | null;
    created_at: string;
    client?: {
        id: string;
        name: string;
        phone: string;
    };
    services?: {
        id: string;
        name: string;
        price: number;
    };
}

interface Barber {
    id: string;
    name: string;
    email: string;
    barbershop_id: string;
    user_id: string;
}

export default function BarberDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [barber, setBarber] = useState<Barber | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/barber-auth');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchBarberData = async () => {
            if (!user) return;

            try {
                const { data: barberData, error: barberError } = await supabase
                    .from('barbers')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (barberError || !barberData) {
                    setError('No barber profile found. Please contact support or try signing up again.');
                    setLoading(false);
                    return;
                }

                setBarber(barberData);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBarberData();
        }
    }, [user]);

    useEffect(() => {
        if (barber) {
            router.replace('/barber-dashboard/calendar');
        }
    }, [barber, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/barber-auth');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] flex flex-col pb-20">
            {/* Profile Card */}
            <div className="max-w-md w-full mx-auto mt-6">
                <BarberProfileCard barber={barber} />
            </div>
            {/* Stat Cards */}
            <div className="max-w-md w-full mx-auto mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
                    <span className="text-gray-500 text-xs">Total Booking</span>
                    <span className="text-2xl font-bold text-gray-800">2K</span>
                    <span className="text-green-500 text-xs mt-1">+8% from last week</span>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
                    <span className="text-gray-500 text-xs">Today's Schedule</span>
                    <span className="text-2xl font-bold text-gray-800">6</span>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                        <div className="bg-purple-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-purple-500 text-xs mt-1">78%</span>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center col-span-1">
                    <span className="text-gray-500 text-xs">Retention</span>
                    <span className="text-2xl font-bold text-gray-800">12%</span>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center col-span-1">
                    <span className="text-gray-500 text-xs">Productivity</span>
                    <span className="text-2xl font-bold text-gray-800">45%</span>
                </div>
            </div>
            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <BarberNavbar activeTab="dashboard" />
            </div>
        </div>
    );
} 