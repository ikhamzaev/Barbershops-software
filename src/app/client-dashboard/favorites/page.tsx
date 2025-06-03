"use client";
import { FiHeart, FiScissors, FiMapPin, FiUser } from "react-icons/fi";
import Link from "next/link";
import { AiFillHeart } from "react-icons/ai";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FavoritesPage() {
    const [favoriteBarbershops, setFavoriteBarbershops] = useState<any[]>([]);
    const [favoriteBarbers, setFavoriteBarbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch favorites function (moved outside useEffect)
    async function fetchFavorites() {
        setLoading(true);
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }
        setUserId(user.id);
        // Fetch favorite barbershops
        const { data: favShops } = await supabase
            .from('favorites')
            .select('favorite_id, barbershops:favorite_id (id, name, address, photo, rating, open)')
            .eq('user_id', user.id)
            .eq('favorite_type', 'barbershop');
        setFavoriteBarbershops((favShops || []).map(f => f.barbershops));
        // Two-step fetch for favorite barbers
        const { data: favBarbers } = await supabase
            .from('favorites')
            .select('favorite_id')
            .eq('user_id', user.id)
            .eq('favorite_type', 'barber');
        const barberIds = favBarbers?.map(f => f.favorite_id) || [];
        let barbers: any[] = [];
        if (barberIds.length > 0) {
            const { data: barberDetails } = await supabase
                .from('barbers')
                .select('id, name, photo_url, barbershop_id')
                .in('id', barberIds);
            barbers = barberDetails || [];
            // Fetch barbershop names for each barber
            const barbershopIds = Array.from(new Set(barbers.map(b => b.barbershop_id).filter(Boolean)));
            let barbershopMap: Record<string, string> = {};
            if (barbershopIds.length > 0) {
                const { data: barbershopDetails } = await supabase
                    .from('barbershops')
                    .select('id, name')
                    .in('id', barbershopIds);
                if (barbershopDetails) {
                    barbershopMap = Object.fromEntries(barbershopDetails.map(bs => [bs.id, bs.name]));
                }
            }
            barbers = barbers.map(b => ({
                ...b,
                barbershop: barbershopMap[b.barbershop_id] || '',
            }));
        }
        setFavoriteBarbers(barbers);
        setLoading(false);
    }

    useEffect(() => {
        fetchFavorites();
    }, []);

    // Refresh favorites for external use
    function refreshFavorites() {
        fetchFavorites();
    }

    return (
        <div className="min-h-screen bg-white flex flex-col pb-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-10 text-center flex items-center justify-center gap-2">
                <FiHeart className="text-pink-400" /> Sevimlilar
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Favorite Barbershops - Left Column */}
                <div className="flex flex-col flex-1 min-h-[60vh] max-h-[70vh]">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiScissors className="text-pink-400" /> Sevimli sartaroshxonalar
                    </h2>
                    {loading ? (
                        <div className="text-gray-400 text-center mt-6">Yuklanmoqda...</div>
                    ) : favoriteBarbershops.length === 0 ? (
                        <div className="text-gray-400 text-center mt-6">Hozircha sevimli sartaroshxonalar yo'q.</div>
                    ) : (
                        <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 pr-2">
                            {favoriteBarbershops.map((shop) => (
                                <Link key={shop.id} href={`/client-dashboard/barbershop/${shop.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden relative flex flex-col border border-gray-100 min-h-[210px] hover:ring-2 hover:ring-yellow-400 transition">
                                    <div className="h-32 w-full overflow-hidden relative">
                                        <img src={shop.photo || '/images/barbershop-1.jpg'} alt={shop.name} className="object-cover w-full h-full" />
                                        <span className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                                            <AiFillHeart className="text-pink-400 text-xl" />
                                        </span>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-gray-900 font-semibold text-lg mb-1 flex items-center gap-2">
                                                <FiScissors className="text-pink-400" /> {shop.name}
                                            </div>
                                            <div className="text-gray-500 text-sm flex items-center gap-2 mb-2">
                                                <FiMapPin className="text-gray-400" /> {shop.address}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-yellow-500 font-bold">★ {shop.rating || '5.0'}</span>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${shop.open !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400"}`}>
                                                    {shop.open !== false ? "Ochiq" : "Yopiq"}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="w-full mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                            Bron qilish
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                {/* Favorite Barbers - Right Column */}
                <div className="flex flex-col flex-1 min-h-[60vh] max-h-[70vh]">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUser className="text-purple-400" /> Sevimli sartaroshlar
                    </h2>
                    {loading ? (
                        <div className="text-gray-400 text-center mt-6">Yuklanmoqda...</div>
                    ) : favoriteBarbers.length === 0 ? (
                        <div className="text-gray-400 text-center mt-6">Hozircha sevimli sartaroshlar yo'q.</div>
                    ) : (
                        <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 pr-2">
                            {favoriteBarbers.map((barber) => (
                                <Link key={barber.id} href={`/client-dashboard/barbershop/${barber.barbershop_id}/schedule?barber=${barber.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden relative flex flex-col border border-gray-100 min-h-[210px] hover:ring-2 hover:ring-yellow-400 transition">
                                    <div className="h-32 w-full overflow-hidden relative flex items-center justify-center">
                                        {barber.photo_url ? (
                                            <img src={barber.photo_url} alt={barber.name} className="object-cover w-24 h-24 rounded-full border-4 border-pink-400 shadow-lg" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400 border-4 border-pink-200 shadow-lg">
                                                {barber.name[0]}
                                            </div>
                                        )}
                                        <span className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                                            <AiFillHeart className="text-pink-400 text-xl" />
                                        </span>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-gray-900 font-semibold text-lg mb-1 flex items-center gap-2">
                                                <FiUser className="text-purple-400" /> {barber.name}
                                            </div>
                                            <div className="text-gray-500 text-sm flex items-center gap-2 mb-2">
                                                <FiScissors className="text-pink-400" /> {barber.barbershop}
                                            </div>
                                        </div>
                                        <button className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                            Bron qilish
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 