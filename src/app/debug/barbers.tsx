"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DebugBarbersPage() {
    const [barbershops, setBarbershops] = useState<any[]>([]);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            const { data: barbershopsData, error: barbershopsError } = await supabase
                .from('barbershops')
                .select('*');
            const { data: barbersData, error: barbersError } = await supabase
                .from('barbers')
                .select('*');
            if (barbershopsError || barbersError) {
                setError('Error fetching data');
            }
            setBarbershops(barbershopsData || []);
            setBarbers(barbersData || []);
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug: All Barbershops & Barbers</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Barbershops</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(barbershops, null, 2)}
                </pre>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Barbers</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(barbers, null, 2)}
                </pre>
            </div>
        </div>
    );
} 