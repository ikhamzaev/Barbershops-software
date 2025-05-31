'use client';

import DashboardLayout from '../../components/DashboardLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FaUserPlus, FaTrash } from 'react-icons/fa';

interface Barber {
    id?: string;
    name: string;
    email: string;
    status?: 'active' | 'inactive';
}

interface BarberInvite {
    id: string;
    barber_email: string;
    code: string;
}

export default function BarbersPage() {
    const [barbershop, setBarbershop] = useState<any>(null);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [barberInvites, setBarberInvites] = useState<BarberInvite[]>([]);
    const [newBarberEmail, setNewBarberEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState(false);

    useEffect(() => {
        const fetchBarbershopData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: barbershopData } = await supabase
                .from('barbershops')
                .select('id, name')
                .eq('owner_id', user.id)
                .maybeSingle();
            setBarbershop(barbershopData);
            if (barbershopData) {
                const { data: barbersData } = await supabase
                    .from('barbers')
                    .select('*')
                    .eq('barbershop_id', barbershopData.id);
                setBarbers(barbersData || []);
                const { data: invitesData } = await supabase
                    .from('barber_invites')
                    .select('*')
                    .eq('barbershop_id', barbershopData.id);
                setBarberInvites(invitesData || []);
            }
        };
        fetchBarbershopData();
    }, []);

    const handleAddInvite = async () => {
        if (!barbershop || !newBarberEmail) return;
        setInviteLoading(true);
        setInviteError(null);
        setInviteSuccess(false);
        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const { error } = await supabase
                .from('barber_invites')
                .insert({
                    barbershop_id: barbershop.id,
                    barber_email: newBarberEmail,
                    code
                });
            if (error) throw error;
            setInviteSuccess(true);
            setNewBarberEmail('');
            // Refresh invites
            const { data } = await supabase
                .from('barber_invites')
                .select('*')
                .eq('barbershop_id', barbershop.id);
            if (data) setBarberInvites(data);
        } catch (err: any) {
            setInviteError(err.message || 'Failed to add invite.');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveInvite = async (inviteId: string) => {
        if (!barbershop) return;
        await supabase
            .from('barber_invites')
            .delete()
            .eq('id', inviteId);
        // Refresh invites
        const { data } = await supabase
            .from('barber_invites')
            .select('*')
            .eq('barbershop_id', barbershop.id);
        if (data) setBarberInvites(data);
    };

    return (
        <DashboardLayout activePage="Barbers">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Barbers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {barbers.length === 0 ? (
                        <div className="text-gray-400 col-span-3">No barbers yet.</div>
                    ) : (
                        barbers.map((barber) => (
                            <div key={barber.id || barber.email} className="bg-white rounded-xl shadow p-4 flex items-center justify-between border border-gray-100">
                                <div>
                                    <h3 className="text-gray-800 font-medium">{barber.name}</h3>
                                    <p className="text-gray-500 text-sm">{barber.email}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${barber.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{barber.status || 'active'}</span>
                            </div>
                        ))
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Invites</h3>
                <div className="space-y-3 mb-8">
                    {barberInvites.length === 0 ? (
                        <div className="text-gray-400">No pending invites.</div>
                    ) : (
                        barberInvites.map((invite) => (
                            <div key={invite.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100">
                                <div>
                                    <p className="text-gray-800 font-medium">{invite.barber_email}</p>
                                    <span className="text-xs text-gray-500">Invite Code:</span>
                                    <span className="ml-2 px-3 py-1 bg-green-50 text-green-700 rounded font-mono tracking-widest select-all">{invite.code}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveInvite(invite.id)}
                                    className="mt-2 md:mt-0 md:ml-6 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                    <FaTrash /> Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Add New Barber</h3>
                <div className="flex gap-2 mb-2">
                    <input
                        type="email"
                        value={newBarberEmail}
                        onChange={e => setNewBarberEmail(e.target.value)}
                        placeholder="Barber email"
                        className="flex-1 rounded bg-gray-100 border border-gray-300 text-gray-800 px-3 py-2"
                    />
                    <button
                        onClick={handleAddInvite}
                        disabled={inviteLoading || !newBarberEmail}
                        className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-md"
                    >
                        {inviteLoading ? 'Adding...' : 'Add'}
                    </button>
                </div>
                {inviteError && <div className="text-red-500 mt-2">{inviteError}</div>}
                {inviteSuccess && <div className="text-green-500 mt-2">Invite sent!</div>}
            </div>
        </DashboardLayout>
    );
} 