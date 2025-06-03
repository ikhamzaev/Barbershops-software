"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FiBell, FiSearch, FiSliders, FiHome, FiHeart, FiGrid, FiMessageCircle, FiCalendar } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import Link from "next/link";
import CitySelector from "@/components/CitySelector";
import { CityId } from "@/lib/constants";
import LocationSelector from '@/components/LocationSelector';
import { getAppointmentsByClient } from '@/lib/booking';

const services = [
    { name: "Soch olish", img: "/images/service-haircut.jpg" },
    { name: "Qirqish", img: "/images/service-shaving.jpg" },
    { name: "Bo'yash", img: "/images/service-coloring.jpg" },
    { name: "Buklash", img: "/images/service-curls.jpg" },
    { name: "Dizayn", img: "/images/service-design.jpg" },
];

export default function ClientDashboard() {
    const [barbershops, setBarbershops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<{ [id: string]: boolean }>({});
    const [user, setUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [selectedCity, setSelectedCity] = useState<CityId | null>(null);
    const [recentVisit, setRecentVisit] = useState<any>(null);
    const [favoriteBarbershopIds, setFavoriteBarbershopIds] = useState<string[]>([]);

    useEffect(() => {
        async function fetchBarbershops() {
            setLoading(true);
            let query = supabase.from('barbershops').select('*');
            if (selectedCity) {
                query = query.eq('city', selectedCity);
            }
            const { data, error } = await query.order('id', { ascending: true });
            if (!error && data) {
                setBarbershops(data);
            }
            setLoading(false);
        }
        fetchBarbershops();
    }, [selectedCity]);

    useEffect(() => {
        async function fetchUser() {
            setLoadingUser(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoadingUser(false);
                return;
            }
            const { data } = await supabase
                .from('users')
                .select('name, city_id')
                .eq('id', user.id)
                .single();
            if (data) {
                setUser(data);
                if (data.city_id) {
                    setSelectedCity(data.city_id as CityId);
                }
            }
            setLoadingUser(false);
        }
        fetchUser();
    }, []);

    useEffect(() => {
        async function fetchFavorites() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('favorites')
                .select('favorite_id')
                .eq('user_id', user.id)
                .eq('favorite_type', 'barbershop');
            if (data) {
                setFavoriteBarbershopIds(data.map(f => f.favorite_id));
            }
        }
        fetchFavorites();
    }, []);

    const fetchRecentVisit = async () => {
        if (!user) return;
        console.log('Fetching appointments for user:', user.id);
        const appointments = await getAppointmentsByClient(user.id);
        console.log('All appointments:', appointments);

        const now = new Date();
        console.log('Current time:', now.toISOString());

        const filteredAppointments = appointments.filter(a => {
            // Parse the appointment date and time
            const [year, month, day] = a.appointment_date.split('-').map(Number);
            const [hours, minutes] = a.appointment_time.split(':').map(Number);

            const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
            console.log('Appointment details:', {
                date: a.appointment_date,
                time: a.appointment_time,
                parsedDateTime: appointmentDateTime.toISOString(),
                status: a.status,
                isPast: appointmentDateTime <= now,
                barberName: a.barbers?.name,
                barbershopName: a.barbershops?.name
            });

            return (a.status === 'booked' || a.status === 'completed') && appointmentDateTime <= now;
        });

        console.log('Filtered past appointments:', filteredAppointments);

        const latest = filteredAppointments
            .sort((a, b) => {
                const [yearA, monthA, dayA] = a.appointment_date.split('-').map(Number);
                const [hoursA, minutesA] = a.appointment_time.split(':').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);

                const [yearB, monthB, dayB] = b.appointment_date.split('-').map(Number);
                const [hoursB, minutesB] = b.appointment_time.split(':').map(Number);
                const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);

                return dateB.getTime() - dateA.getTime();
            })[0];

        console.log('Latest appointment:', latest);
        setRecentVisit(latest || null);
    };

    useEffect(() => {
        fetchRecentVisit();
        const interval = setInterval(fetchRecentVisit, 60 * 1000); // re-check every minute
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel('appointments')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments', filter: `client_id=eq.${user.id}` },
                () => {
                    fetchRecentVisit();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleCityChange = async (cityId: CityId | null) => {
        setSelectedCity(cityId);
        // Update user's city in the database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('users')
                .update({ city_id: cityId })
                .eq('id', user.id);
        }
    };

    const handleToggleFavoriteBarbershop = async (barbershopId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const isFavorite = favoriteBarbershopIds.includes(barbershopId);
        if (isFavorite) {
            // Remove from favorites
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('favorite_type', 'barbershop')
                .eq('favorite_id', barbershopId);
            setFavoriteBarbershopIds(ids => ids.filter(id => id !== barbershopId));
        } else {
            // Add to favorites
            await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    favorite_type: 'barbershop',
                    favorite_id: barbershopId,
                });
            setFavoriteBarbershopIds(ids => [...ids, barbershopId]);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col pb-20">
            {/* Centered main content container */}
            <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl px-4">
                    {/* Header/Profile */}
                    <div className="flex items-center justify-between pt-8 pb-4">
                        <div className="flex items-center space-x-4">
                            <LocationSelector
                                onSelect={handleCityChange}
                                currentCityId={selectedCity || undefined}
                                className="w-64"
                            />
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-700 text-lg font-semibold">{user?.name}</span>
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name || 'User'}
                                        className="w-10 h-10 rounded-full border-2 border-purple-500"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 text-lg font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-purple-500 text-2xl" title="Bildirishnomalar">
                            <FiBell />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 flex-1">
                            <FiSearch className="text-gray-400 text-lg mr-2" />
                            <input
                                type="text"
                                placeholder="Yaqin atrofdagi sartaroshxonani toping"
                                className="bg-transparent outline-none text-gray-700 placeholder-gray-400 flex-1"
                            />
                        </div>
                        <button className="ml-2 bg-purple-600 p-3 rounded-xl text-white text-xl hover:bg-purple-700" title="Filterlar">
                            <FiSliders />
                        </button>
                    </div>

                    {/* Latest Visit */}
                    <div className="mb-8">
                        <div className="text-gray-400 text-xs mb-2">SO'NGI TASHRIF</div>
                        {recentVisit ? (
                            <div className="bg-white rounded-2xl flex items-center p-4 shadow mb-4 border border-gray-100">
                                <img src={recentVisit.barbers?.photo_url || '/default-avatar.png'} alt={recentVisit.barbers?.name} className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500 mr-3" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-gray-900 font-semibold text-base flex items-center gap-2">
                                        {recentVisit.barbers?.name}
                                        <span className="bg-yellow-600 text-xs text-white px-2 py-0.5 rounded ml-1">PRO</span>
                                    </div>
                                    <div className="text-yellow-500 text-xs flex items-center gap-1 mt-1">
                                        {recentVisit.barbershops?.name}
                                    </div>
                                    <div className="text-gray-400 text-xs mt-1">
                                        {recentVisit.appointment_date} {recentVisit.appointment_time}
                                    </div>
                                </div>
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold ml-3 transition"
                                    onClick={() => {
                                        if (recentVisit.barbers?.id && recentVisit.barbershops?.id) {
                                            window.location.href = `/client-dashboard/barbershop/${recentVisit.barbershops.id}/schedule?barber=${recentVisit.barbers.id}`;
                                        }
                                    }}
                                >
                                    Book
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl flex items-center p-4 shadow mb-4 border border-gray-100 text-gray-400">
                                No recent visits yet. Book your first appointment!
                            </div>
                        )}
                    </div>

                    {/* Services Carousel */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-gray-900 font-semibold text-lg">Xizmatlarimiz</div>
                            <button className="text-purple-600 text-sm font-medium hover:underline">Hammasi</button>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-2 hide-scrollbar">
                            {services.map((service) => (
                                <div key={service.name} className="flex flex-col items-center min-w-[70px]">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 mb-2 flex items-center justify-center">
                                        <img src={service.img} alt={service.name} className="object-cover w-full h-full" />
                                    </div>
                                    <span className="text-gray-700 text-xs font-medium text-center">{service.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Barbershops Near You */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-gray-900 font-semibold text-lg">Yaqin atrofdagi sartaroshxonalar</div>
                            <button className="text-purple-600 text-sm font-medium hover:underline">Hammasi</button>
                        </div>
                        {loading ? (
                            <div className="text-gray-400 text-center py-8">Yuklanmoqda...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {barbershops.length === 0 ? (
                                    <div className="text-gray-400 text-center w-full col-span-full">Sartaroshxonalar topilmadi.</div>
                                ) : (
                                    barbershops.map((shop) => (
                                        <Link
                                            key={shop.id}
                                            href={`/client-dashboard/barbershop/${shop.id}`}
                                            className="bg-white rounded-2xl shadow-lg overflow-hidden relative transition hover:shadow-2xl hover:ring-2 hover:ring-yellow-400 cursor-pointer flex flex-col border border-gray-100"
                                        >
                                            <button
                                                className={`absolute top-3 right-3 z-10 transition-transform duration-150 focus:outline-none group`}
                                                onClick={e => { e.preventDefault(); handleToggleFavoriteBarbershop(shop.id); }}
                                                aria-label={favoriteBarbershopIds.includes(shop.id) ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
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
                                                        ${favoriteBarbershopIds.includes(shop.id) ? 'ring-2 ring-pink-400' : ''}
                                                    `}
                                                >
                                                    {favoriteBarbershopIds.includes(shop.id) ? (
                                                        <AiFillHeart className="text-pink-500 transition-colors duration-150" />
                                                    ) : (
                                                        <FiHeart className="text-gray-700 transition-colors duration-150" />
                                                    )}
                                                </span>
                                            </button>
                                            <div className="h-32 w-full overflow-hidden">
                                                <img src={shop.img || shop.photo || shop.profile_image_url || shop.photo_url || '/images/barbershop-1.jpg'} alt={shop.name} className="object-cover w-full h-full" />
                                            </div>
                                            <div className="p-3 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-gray-900 font-semibold text-base">{shop.name}</span>
                                                        <span className="text-yellow-500 text-sm font-bold flex items-center gap-1">
                                                            ★ {shop.rating || '5.0'}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                                                        <span className="material-icons text-sm">place</span> {shop.address || ''}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-gray-400 text-xs">{shop.distance || ''}</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${shop.open !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400"}`}>
                                                        {shop.open !== false ? "Ochiq" : "Yopiq"}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <nav
                className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 shadow"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    minHeight: '60px',
                }}
                role="navigation"
                aria-label="Asosiy navigatsiya"
            >
                <Link href="/client-dashboard">
                    <button className="flex flex-col items-center text-purple-500 focus:outline-none" style={{ minWidth: 44, minHeight: 44 }}>
                        <FiHome className="text-2xl" aria-hidden="true" />
                        <span className="text-xs mt-1">Bosh sahifa</span>
                    </button>
                </Link>
                <Link href="/client-dashboard/appointments">
                    <button className="flex flex-col items-center text-gray-400 hover:text-purple-400 focus:outline-none" style={{ minWidth: 44, minHeight: 44 }}>
                        <FiCalendar className="text-2xl" aria-hidden="true" />
                        <span className="text-xs mt-1">Uchrashuvlar</span>
                    </button>
                </Link>
                <Link href="/client-dashboard/favorites">
                    <button className="flex flex-col items-center text-gray-400 hover:text-pink-400 focus:outline-none" style={{ minWidth: 44, minHeight: 44 }}>
                        <FiHeart className="text-2xl" aria-hidden="true" />
                        <span className="text-xs mt-1">Sevimlilar</span>
                    </button>
                </Link>
                <button className="flex flex-col items-center text-gray-400 hover:text-purple-400 focus:outline-none" style={{ minWidth: 44, minHeight: 44 }}>
                    <FiGrid className="text-2xl" aria-hidden="true" />
                    <span className="text-xs mt-1">Ilovalar</span>
                </button>
                <Link href="/client-dashboard/messages">
                    <button className="flex flex-col items-center text-gray-400 hover:text-purple-400 focus:outline-none" style={{ minWidth: 44, minHeight: 44 }}>
                        <FiMessageCircle className="text-2xl" aria-hidden="true" />
                        <span className="text-xs mt-1">Xabarlar</span>
                    </button>
                </Link>
            </nav>
        </div>
    );
}
// Add this to your global CSS to hide scrollbars for carousels:
// .hide-scrollbar::-webkit-scrollbar { display: none; }
// .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 