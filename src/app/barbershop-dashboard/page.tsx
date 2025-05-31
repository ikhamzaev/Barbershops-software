'use client';

import DashboardLayout from '../components/DashboardLayout';
import { FaUserFriends, FaCut, FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { useRouter } from 'next/navigation';
import CitySelector from '@/components/CitySelector';

export default function BarbershopDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [region, setRegion] = useState('');
    const [city, setCity] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // Fetch user role
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (userError || !userData) throw new Error('User not found');

                if (userData.role === 'barber') {
                    // If user is a barber, redirect to barber dashboard
                    router.push('/barber-dashboard');
                    return;
                }

                if (userData.role !== 'barbershop_owner') {
                    throw new Error('Access denied: not a barbershop owner');
                }

                // Fetch barbershop data for owner
                const { data: barbershopData, error: barbershopError } = await supabase
                    .from('barbershops')
                    .select('id, name, city, logo_url')
                    .eq('owner_id', user.id)
                    .maybeSingle();
                if (barbershopError || !barbershopData) throw new Error('Barbershop not found');

                // Fetch barbers for this barbershop
                const { data: barbersData, error: barbersError } = await supabase
                    .from('barbers')
                    .select('id, name, email')
                    .eq('barbershop_id', barbershopData.id);
                if (barbersError) throw barbersError;

                // ...set state as needed for your dashboard...
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [router]);

    // Placeholder data
    const stats = [
        { label: 'Total Clients', value: 530, icon: <FaUserFriends />, change: '+2.5%', changeType: 'up', sub: 'to last month', subChange: '+35%' },
        { label: 'Total Service', value: 26, icon: <FaCut />, change: '-0.5%', changeType: 'down', sub: 'to last month', subChange: '-11%' },
        { label: 'Total Employee', value: 80, icon: <FaUserTie />, change: '+1.2%', changeType: 'up', sub: 'to last month', subChange: '+15%' },
        { label: 'Total Appointment', value: 150, icon: <FaCalendarAlt />, change: '+1.3%', changeType: 'up', sub: 'to last month', subChange: '+12%' },
    ];

    const bookings = [
        { service: 'Hair Cut', start: '9.30 AM', end: '5.15 PM', client: 23, employee: 'John Smith' },
        { service: 'Hair Trimming', start: '11.30 AM', end: '6.15 PM', client: 21, employee: 'Emily Davis' },
        { service: 'Hair Artistry', start: '12.30 AM', end: '8.15 PM', client: 35, employee: 'Olivia Wilson' },
    ];

    if (loading) return <DashboardLayout activePage="Barbers"><div>Loading...</div></DashboardLayout>;
    if (error) return <DashboardLayout activePage="Barbers"><div className="text-red-500">{error}</div></DashboardLayout>;

    return (
        <DashboardLayout activePage="Dashboard">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 text-xl">{stat.icon}</div>
                            <div className="flex-1">
                                <div className="text-gray-500 text-xs font-medium">{stat.label}</div>
                                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className={stat.changeType === 'up' ? 'text-green-500' : 'text-red-500'}>{stat.change}</span>
                            <span className="text-gray-400">{stat.sub}</span>
                            <span className={stat.changeType === 'up' ? 'text-green-500' : 'text-red-500'}>{stat.subChange}</span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Chart and Revenue Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 min-h-[300px] flex flex-col">
                    <div className="font-semibold text-gray-700 mb-2">Clients Growth</div>
                    <div className="flex-1 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 min-h-[300px] flex flex-col">
                    <div className="font-semibold text-gray-700 mb-2">Revenue</div>
                    <div className="flex-1 flex items-center justify-center text-gray-400">[Revenue Chart Placeholder]</div>
                </div>
            </div>
            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="font-semibold text-gray-700 mb-4">Upcoming Booking</div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase">
                                <th className="px-4 py-2 text-left">Service Name</th>
                                <th className="px-4 py-2 text-left">Start Time</th>
                                <th className="px-4 py-2 text-left">End Time</th>
                                <th className="px-4 py-2 text-left">Client</th>
                                <th className="px-4 py-2 text-left">Employee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                    <td className="px-4 py-2 font-medium text-gray-700">{b.service}</td>
                                    <td className="px-4 py-2">{b.start}</td>
                                    <td className="px-4 py-2">{b.end}</td>
                                    <td className="px-4 py-2">{b.client}</td>
                                    <td className="px-4 py-2">{b.employee}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <CitySelector
                region={region}
                city={city}
                onRegionChange={setRegion}
                onCityChange={setCity}
            />
        </DashboardLayout>
    );
} 