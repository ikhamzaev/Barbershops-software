"use client";
import { FiHeart, FiScissors, FiMapPin } from "react-icons/fi";
import Link from "next/link";

const mockFavorites = [
    {
        id: 1,
        name: "Uncle Barbers",
        address: "24 Green Street, Kaliforniya",
        photo: "/images/barbershop-1.jpg",
        rating: 4.9,
        open: true,
    },
    {
        id: 2,
        name: "Baraka Sartaroshxona",
        address: "Toshkent ko'chasi, Andijon",
        photo: "/images/barbershop-2.jpg",
        rating: 4.7,
        open: false,
    },
];

export default function FavoritesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col pb-8 px-4">
            <h1 className="text-2xl font-bold text-white mt-6 mb-6 text-center flex items-center justify-center gap-2">
                <FiHeart className="text-pink-400" /> Sevimli sartaroshxonalarim
            </h1>
            {mockFavorites.length === 0 ? (
                <div className="text-gray-400 text-center mt-12">Hozircha sevimli sartaroshxonalar yo'q.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {mockFavorites.map((shop) => (
                        <div key={shop.id} className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden relative flex flex-col">
                            <div className="h-32 w-full overflow-hidden relative">
                                <img src={shop.photo} alt={shop.name} className="object-cover w-full h-full" />
                                <span className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                                    <FiHeart className="text-pink-400 text-xl" />
                                </span>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                                        <FiScissors className="text-pink-400" /> {shop.name}
                                    </div>
                                    <div className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                                        <FiMapPin className="text-gray-500" /> {shop.address}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-yellow-400 font-bold">★ {shop.rating}</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${shop.open ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"}`}>
                                            {shop.open ? "Ochiq" : "Yopiq"}
                                        </span>
                                    </div>
                                </div>
                                <Link href="#">
                                    <button className="w-full mt-2 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                        Bron qilish
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 