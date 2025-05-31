"use client";
import { useState, useEffect } from 'react';
import BarberSidebarNav from '@/components/barber/BarberSidebarNav';
import BarberBottomNav from '@/components/barber/BarberBottomNav';
import { supabase } from '@/lib/supabaseClient';

export default function ClientsPage() {
    const [search, setSearch] = useState('');
    const [clients, setClients] = useState<any[]>([]);
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
            // Fetch all appointments for this barber, join client
            const { data: appts, error: apptError } = await supabase
                .from('appointments')
                .select('id, appointment_date, appointment_time, client:client_id(id, name, phone)')
                .eq('barber_id', barberData.id)
                .order('appointment_date', { ascending: false })
                .order('appointment_time', { ascending: false });
            if (!appts) return setLoading(false);
            // Group by client id, get last visit
            const clientMap: Record<string, any> = {};
            appts.forEach((appt: any) => {
                if (!appt.client) return;
                const cid = appt.client.id;
                if (!clientMap[cid] || new Date(appt.appointment_date + 'T' + appt.appointment_time) > new Date(clientMap[cid].lastVisit + 'T' + clientMap[cid].time)) {
                    clientMap[cid] = {
                        id: cid,
                        name: appt.client.name,
                        phone: appt.client.phone,
                        lastVisit: appt.appointment_date,
                        time: appt.appointment_time,
                    };
                }
            });
            setClients(Object.values(clientMap));
            setLoading(false);
        }
        fetchClients();
    }, []);

    function groupByDate(clients: any[]) {
        return clients.reduce((acc: Record<string, any[]>, client) => {
            if (!acc[client.lastVisit]) acc[client.lastVisit] = [];
            acc[client.lastVisit].push(client);
            return acc;
        }, {});
    }

    const grouped = groupByDate(
        clients.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.phone && c.phone.toLowerCase().includes(search.toLowerCase()))
        )
    );
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] flex">
            <BarberSidebarNav activeTab="clients" />
            <div className="flex-1 flex flex-col items-center px-2 pb-24 md:ml-20">
                <div className="w-full max-w-2xl mt-6 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Clients</h2>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or phone"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none mb-4"
                    />
                </div>
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-0 divide-y divide-gray-100">
                    {loading && <div className="text-gray-400 text-center py-8">Loading clients...</div>}
                    {!loading && sortedDates.length === 0 && (
                        <div className="text-gray-400 text-center py-8">No clients found.</div>
                    )}
                    {sortedDates.map(date => (
                        <div key={date} className="py-2">
                            <div className="text-xs font-semibold text-gray-400 px-6 py-2">{formatDate(date)}</div>
                            {grouped[date].map(client => (
                                <div key={client.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition">
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-lg" style={{ background: stringToColor(client.name) }}>
                                        {getInitials(client.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 truncate">{client.name}</div>
                                        <div className="text-gray-500 text-sm truncate">{client.phone}</div>
                                    </div>
                                    <div className="text-xs text-gray-400 font-semibold ml-2 whitespace-nowrap">{client.time}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <BarberBottomNav activeTab="clients" />
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

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
} 