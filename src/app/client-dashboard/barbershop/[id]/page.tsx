"use client";
import { FiUser, FiShuffle, FiStar, FiClock } from "react-icons/fi";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, addDays } from "date-fns";
import { AiFillHeart } from "react-icons/ai";
import { FiHeart } from "react-icons/fi";

function getDayOfWeek(date: Date) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
}

function generateSlots(start: string, end: string, interval = 30) {
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

const mockRatings = [
    { rating: 5, reviews: 7 },
    { rating: 0, reviews: 0 },
    { rating: 0, reviews: 0 },
];

export default function BarbershopPage() {
    const router = useRouter();
    const params = useParams();
    const barbershopId = params.id;
    const [barbers, setBarbers] = useState<any[]>([]);
    const [barbershop, setBarbershop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState<Record<string, any>>({});
    const [appointments, setAppointments] = useState<Record<string, any[]>>({});
    const [favoriteBarberIds, setFavoriteBarberIds] = useState<string[]>([]);

    useEffect(() => {
        async function fetchBarbershopAndBarbers() {
            setLoading(true);
            const trimmedId = typeof barbershopId === 'string' ? barbershopId.trim() : String(barbershopId);
            console.log('Barbershop ID:', trimmedId, 'Type:', typeof trimmedId);
            // Fetch barbershop info
            const { data: barbershopData, error: barbershopError } = await supabase
                .from('barbershops')
                .select('*')
                .eq('id', trimmedId)
                .single();
            setBarbershop(barbershopData);
            // Fetch barbers for this barbershop
            const { data: barbersData, error: barbersError } = await supabase
                .from('barbers')
                .select('*')
                .eq('barbershop_id', trimmedId);
            if (barbersData) {
                barbersData.forEach((barber, idx) => {
                    console.log(`Barber[${idx}] barbershop_id:`, barber.barbershop_id, 'Type:', typeof barber.barbershop_id);
                });
            }
            console.log('Barbers error:', barbersError);
            console.log('Barbers data:', barbersData);
            setBarbers(barbersData || []);
            // Fetch availability and appointments for each barber
            const avail: Record<string, any> = {};
            const appts: Record<string, any[]> = {};
            for (const barber of barbersData || []) {
                // Get today's day of week
                const today = new Date();
                const dayOfWeek = getDayOfWeek(today);
                const { data: availData } = await supabase
                    .from('barber_availability')
                    .select('*')
                    .eq('barber_id', barber.id)
                    .eq('day_of_week', dayOfWeek)
                    .single();
                avail[barber.id] = availData;
                // Get today's appointments
                const dateStr = today.toISOString().split('T')[0];
                const { data: apptData } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('barber_id', barber.id)
                    .eq('appointment_date', dateStr);
                appts[barber.id] = apptData || [];
            }
            setAvailability(avail);
            setAppointments(appts);
            setLoading(false);
        }
        if (barbershopId) fetchBarbershopAndBarbers();
    }, [barbershopId, router]);

    useEffect(() => {
        async function fetchFavorites() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('favorites')
                .select('favorite_id')
                .eq('user_id', user.id)
                .eq('favorite_type', 'barber');
            if (data) {
                setFavoriteBarberIds(data.map(f => f.favorite_id));
            }
        }
        fetchFavorites();
    }, []);

    const handleSlotClick = (barberId: string, slot: string) => {
        router.push(`/client-dashboard/barbershop/${barbershopId}/schedule?barber=${barberId}&time=${slot}`);
    };

    const handleToggleFavoriteBarber = async (barberId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const isFavorite = favoriteBarberIds.includes(barberId);
        if (isFavorite) {
            // Remove from favorites
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('favorite_type', 'barber')
                .eq('favorite_id', barberId);
            setFavoriteBarberIds(ids => ids.filter(id => id !== barberId));
        } else {
            // Add to favorites
            await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    favorite_type: 'barber',
                    favorite_id: barberId,
                });
            setFavoriteBarberIds(ids => [...ids, barberId]);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pb-8 px-4">
            {/* Barbershop Info */}
            <div className="w-full max-w-md mx-auto mt-6 mb-6">
                <div className="rounded-2xl overflow-hidden shadow-lg mb-4">
                    <img src={barbershop?.photo || '/images/barbershop-1.jpg'} alt={barbershop?.name || ''} className="w-full h-40 object-cover" />
                </div>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{barbershop?.name || ''}</h1>
                    <div className="flex items-center gap-2 text-yellow-600 font-semibold mb-1">
                        ★ {barbershop?.rating || ''} <span className="text-gray-500 font-normal">({barbershop?.reviews || 0} sharh)</span>
                        <span className="text-gray-400 ml-2">• {barbershop?.distance || ''}</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-2">{barbershop?.address || ''}</div>
                </div>
            </div>

            {/* Barber List */}
            <div className="w-full max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Sartaroshni tanlang</h2>
                {loading ? (
                    <div className="text-center text-gray-400">Loading...</div>
                ) : (
                    <div className="space-y-6">
                        {barbers.length === 0 ? (
                            <div className="text-center text-gray-400">No barbers found.</div>
                        ) : (
                            barbers.map((barber, idx) => {
                                const avail = availability[barber.id];
                                const appts = appointments[barber.id] || [];
                                // Generate slots for today
                                let slots: string[] = [];
                                if (avail && avail.enabled) {
                                    slots = generateSlots(avail.start_time, avail.end_time, 30);
                                }
                                // Filter out booked slots
                                const bookedTimes = appts.filter(a => a.status === 'booked').map(a => a.appointment_time.length > 5 ? a.appointment_time.slice(0, 5) : a.appointment_time);
                                const availableSlots = slots.filter(slot => !bookedTimes.includes(slot)).slice(0, 4);
                                const nextSession = availableSlots.length > 0 ? availableSlots[0] : 'No slots';
                                const rating = mockRatings[idx % mockRatings.length];
                                return (
                                    <div key={barber.id} className="relative">
                                        <button
                                            className={`absolute top-3 right-3 z-10 transition-transform duration-150 focus:outline-none group`}
                                            onClick={e => { e.stopPropagation(); handleToggleFavoriteBarber(barber.id); }}
                                            aria-label={favoriteBarberIds.includes(barber.id) ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
                                        >
                                            <span
                                                className={`
                                                    inline-flex items-center justify-center
                                                    rounded-full p-2
                                                    bg-black/40
                                                    shadow-lg
                                                    transition-all duration-200
                                                    group-hover:scale-110
                                                    group-hover:bg-black/60
                                                    ${favoriteBarberIds.includes(barber.id) ? 'ring-2 ring-pink-400' : ''}
                                                `}
                                            >
                                                {favoriteBarberIds.includes(barber.id) ? (
                                                    <AiFillHeart className="text-pink-500 transition-colors duration-150" />
                                                ) : (
                                                    <FiHeart className="text-gray-700 transition-colors duration-150" />
                                                )}
                                            </span>
                                        </button>
                                        <button className="w-full text-left bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100 hover:ring-2 hover:ring-yellow-400 transition" onClick={() => router.push(`/client-dashboard/barbershop/${barbershopId}/schedule?barber=${barber.id}`)}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    {barber.photo_url || barber.avatar ? (
                                                        <img src={barber.photo_url || barber.avatar} alt={barber.name} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <FiUser className="text-gray-400 text-3xl" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">{barber.name}</div>
                                                    <div className="text-xs text-green-700 font-semibold mb-1">Barber seti BORODACH</div>
                                                    <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <FiStar key={i} className={i < rating.rating ? 'text-yellow-400' : 'text-gray-300'} />
                                                        ))}
                                                        <span className="text-gray-600 ml-1 text-xs">({rating.reviews})</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-1">Ближайший сеанс: {nextSession}</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 