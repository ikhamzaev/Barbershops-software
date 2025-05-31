"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CitySelector from '@/components/CitySelector';
import { CityId } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';

function isValidEmail(email: string) {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ClientAuthPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signup');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200">
            <div className="w-full max-w-md rounded-3xl shadow-2xl bg-white p-8 relative">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="12" fill="#FFD600" />
                            <rect x="8" y="12" width="24" height="4" rx="2" fill="white" />
                            <rect x="8" y="24" width="24" height="4" rx="2" fill="white" />
                        </svg>
                    </div>
                    <div className="flex w-full mb-6">
                        <button
                            className={`flex-1 py-2 rounded-l-xl font-semibold text-lg transition-colors duration-200 ${mode === 'signup' ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500'}`}
                            onClick={() => setMode('signup')}
                        >
                            Sign Up
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-r-xl font-semibold text-lg transition-colors duration-200 ${mode === 'signin' ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500'}`}
                            onClick={() => setMode('signin')}
                        >
                            Login
                        </button>
                    </div>
                </div>
                {mode === 'signup' ? (
                    <SignUpForm onSwitch={() => setMode('signin')} />
                ) : (
                    <SignInForm onSwitch={() => setMode('signup')} />
                )}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="mx-4 text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex justify-center gap-6 mb-4">
                    <button className="bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition"><FaGoogle className="text-xl text-yellow-500" /></button>
                    <button className="bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition"><FaFacebook className="text-xl text-blue-600" /></button>
                    <button className="bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition"><FaTwitter className="text-xl text-blue-400" /></button>
                </div>
                <div className="text-center text-gray-400 text-xs mt-2">
                    By Signing Up, you agree to our <span className="underline cursor-pointer">Terms & Privacy Policy</span>
                </div>
            </div>
        </div>
    );
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [region, setRegion] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Invalid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (!region) {
            setError("Region is required.");
            return;
        }
        if (!city) {
            setError("City is required.");
            return;
        }
        if (!phone.trim()) {
            setError("Phone number is required.");
            return;
        }

        setLoading(true);
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;
            if (!data.user) throw new Error('Failed to create user');

            const { error: insertError } = await supabase.from('users').insert([
                { id: data.user.id, name, email, phone, role: 'client', region, city },
            ]);

            if (insertError) throw insertError;

            setSuccess(true);
            await router.push('/client-dashboard');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-black mb-1">Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-black mb-1">Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-1">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-1">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <CitySelector
                    region={region}
                    city={city}
                    onRegionChange={setRegion}
                    onCityChange={setCity}
                    className=""
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">Sign up successful! Please check your email.</div>}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-lg bg-yellow-400 hover:bg-yellow-500 text-black transition disabled:opacity-50"
            >
                {loading ? "Signing Up..." : "Sign Up"}
            </button>
            <div className="text-center text-gray-500 text-sm mt-2">
                Already have an account?{' '}
                <button type="button" onClick={onSwitch} className="text-yellow-500 font-semibold hover:underline">Login</button>
            </div>
        </form>
    );
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isValidEmail(email)) {
            setError("Invalid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("Authentication failed. Please try again.");
                setLoading(false);
                return;
            }
            console.log('Authenticated user:', user);

            const { data: barberData, error: barberError } = await supabase
                .from('barbers')
                .select(`
                    id,
                    name,
                    email,
                    barbershop:barbershops (
                        id,
                        name,
                        city,
                        logo_url
                    )
                `)
                .eq('user_id', user.id)
                .maybeSingle();

            console.log('Barber query result:', barberData, 'Error:', barberError);

            await router.push('/client-dashboard');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-1">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-1">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-lg bg-yellow-400 hover:bg-yellow-500 text-black transition disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
            <div className="text-center text-gray-500 text-sm mt-2">
                Don't have an account?{' '}
                <button type="button" onClick={onSwitch} className="text-yellow-500 font-semibold hover:underline">Sign Up</button>
            </div>
        </form>
    );
} 