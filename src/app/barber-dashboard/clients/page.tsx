"use client";
import { useState, useEffect } from 'react';
import BarberSidebarNav from '@/components/barber/BarberSidebarNav';
import BarberBottomNav from '@/components/barber/BarberBottomNav';
import { supabase } from '@/lib/supabaseClient';

type ClientsGrouped = { dateMap: Record<string, any[]>; sortedDates: string[] };
export default function ClientsPage() {
    const [search, setSearch] = useState('');
    const [clients, setClients] = useState<ClientsGrouped>({ dateMap: {}, sortedDates: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClients() {
            setLoading(true);
            // Get current barber id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return setLoading(false);
            const { data: barberData, error: barberError } = await supabase
                .from('barbers')
                .select('id')
                .eq('user_id', user.id)
                .single();
            if (!barberData) return setLoading(false);
            // Fetch all appointments for this barber (not cancelled)
            const { data: appts, error: apptError } = await supabase
                .from('appointments')
                .select('id, appointment_date, appointment_time, status, client:client_id(id, name, phone), notes')
                .eq('barber_id', barberData.id)
                .neq('status', 'cancelled')
                .order('appointment_date', { ascending: false })
                .order('appointment_time', { ascending: false });
            if (!appts) return setLoading(false);
            // Group appointments by date
            const dateMap: Record<string, any[]> = {};
            appts.forEach(appt => {
                let name = Array.isArray(appt.client) ? (appt.client as any[])[0]?.name || '' : (appt.client as any)?.name || '';
                let phone = Array.isArray(appt.client) ? (appt.client as any[])[0]?.phone || '' : (appt.client as any)?.phone || '';
                // For manual bookings, parse from notes if needed
                if (!name && appt.notes && appt.notes.startsWith('Manual booking:')) {
                    const info = appt.notes.replace('Manual booking:', '').trim();
                    const [parsedName, parsedPhone] = info.split(',').map((s: any) => s.trim());
                    name = parsedName || 'Unknown';
                    phone = parsedPhone || '';
                }
                if (!dateMap[appt.appointment_date]) dateMap[appt.appointment_date] = [];
                dateMap[appt.appointment_date].push({
                    name,
                    phone,
                    time: appt.appointment_time,
                    id: appt.id
                });
            });
            // Sort dates descending
            const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            setClients({ dateMap, sortedDates });
            setLoading(false);
        }
        fetchClients();
    }, []);

    return (
        <div className="h-screen bg-gray-50">
            {/* Sidebar Navigation - fixed */}
            <div className="fixed inset-y-0 left-0 w-64 z-30">
                <BarberSidebarNav activeTab="clients" />
            </div>
            {/* Main Content with left margin */}
            <div className="ml-64 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                        Mijozlar
                    </h1>
                    {/* Search Input */}
                    <div className="max-w-md mx-auto mb-8">
                        <input
                            type="text"
                            placeholder="Ism yoki telefon raqami bo'yicha qidiring..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        />
                    </div>
                    {loading ? (
                        <div className="text-gray-400 text-center mt-6">Yuklanmoqda...</div>
                    ) : (clients.sortedDates.length === 0) ? (
                        <div className="text-gray-400 text-center mt-6">Mijozlar topilmadi.</div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {clients.sortedDates.map((date: string) => {
                                // Filter appointments for this date by search
                                const filtered = clients.dateMap[date].filter((client: any) =>
                                    client.name.toLowerCase().includes(search.toLowerCase()) ||
                                    (client.phone && client.phone.toLowerCase().includes(search.toLowerCase()))
                                );
                                if (filtered.length === 0) return null;
                                return (
                                    <div key={date} className="">
                                        <div className="text-lg font-bold text-purple-700 mb-3 pl-1">
                                            {formatDateUz(date)}
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {filtered.map((client: any, idx: number) => (
                                                <div key={client.id} className="flex items-center gap-4 bg-white border-l-4 border-purple-400 rounded-lg px-4 py-3 shadow-sm">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900 text-base">{client.name}</div>
                                                        <div className="text-gray-500 text-sm">{client.phone}</div>
                                                    </div>
                                                    <div className="text-purple-700 font-bold text-lg">{client.time}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <BarberBottomNav activeTab="clients" />
            </div>
        </div>
    );
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function stringToColor(str: string) {
    // Simple pastel color generator based on string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 70%)`;
}

// Uzbek date formatter
function formatDateUz(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Bugun';
    if (d.toDateString() === yesterday.toDateString()) return 'Kecha';
    // Uzbek weekdays and months
    const weekdays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
    const weekday = weekdays[d.getDay()];
    const month = months[d.getMonth()];
    return `${weekday}, ${d.getDate()}-${month} ${d.getFullYear()} yil`;
} 