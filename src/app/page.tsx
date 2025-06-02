"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaUser, FaUserTie, FaStore } from 'react-icons/fa';
import TrimmerViewer from '@/components/TrimmerViewer';

export default function Home() {
    const [isNavigating, setIsNavigating] = useState(false);
    const [showBarbershopOptions, setShowBarbershopOptions] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [chairReady, setChairReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setShowBarbershopOptions(false);
    }, []);

    const handleTypeSelect = async (type: string) => {
        setIsNavigating(true);
        try {
            switch (type) {
                case 'client':
                    window.location.href = '/client-auth';
                    break;
                case 'barber':
                    window.location.href = '/barber-auth';
                    break;
                case 'barbershop_admin':
                    window.location.href = '/barber-auth?type=barbershop';
                    break;
            }
        } catch (error) {
            console.error('Navigation error:', error);
            setIsNavigating(false);
        }
    };

    const handleBarbershopClick = () => setShowBarbershopOptions(true);
    const handleBack = () => setShowBarbershopOptions(false);

    // Only show video and 3D chair when both are ready
    const ready = videoReady && chairReady;

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center">
            {/* Background Video */}
            {ready && (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="/barbershop-bg.mp4"
                    onCanPlayThrough={() => setVideoReady(true)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        objectFit: 'cover',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}
            {/* 3D Animation Background */}
            {ready && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <TrimmerViewer onLoaded={() => setChairReady(true)} />
                </div>
            )}
            {/* Logo */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div className="bg-yellow-400 rounded-full p-3 shadow-lg mb-2">
                    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="12" fill="#FFD600" />
                        <rect x="8" y="12" width="24" height="4" rx="2" fill="white" />
                        <rect x="8" y="24" width="24" height="4" rx="2" fill="white" />
                    </svg>
                </div>
                <span className="text-white text-lg font-bold tracking-widest drop-shadow-lg">UZBEK BARBERS</span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
                <div className="max-w-xl text-center mt-32 mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-xl">
                        Barberingizdan online joy oling!
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 font-medium drop-shadow-lg">
                        O'z shaxringizdagi barberni tanlang va qulay vaqtga joy oling!
                    </p>
                </div>
                {showBarbershopOptions ? (
                    <>
                        <button
                            onClick={handleBack}
                            className="absolute top-8 left-8 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-20"
                        >
                            ← Orqaga
                        </button>
                        <div className="flex flex-col md:flex-row gap-6 w-full max-w-md justify-center">
                            <button
                                onClick={() => handleTypeSelect('barber')}
                                disabled={isNavigating}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-yellow-500 font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
                            >
                                <FaUserTie className="text-2xl" /> Barber
                            </button>
                            <button
                                onClick={() => handleTypeSelect('barbershop_admin')}
                                disabled={isNavigating}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaStore className="text-2xl" /> Barbershop Admini
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-md justify-center">
                        <button
                            onClick={() => handleTypeSelect('client')}
                            disabled={isNavigating}
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaUser className="text-2xl" /> Mijoz
                        </button>
                        <button
                            onClick={handleBarbershopClick}
                            disabled={isNavigating}
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-gray-100 text-yellow-500 font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
                        >
                            <FaStore className="text-2xl" /> Sartaroshxona
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 