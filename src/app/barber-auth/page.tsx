"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUser, FaLock, FaEnvelope, FaKey, FaUserPlus, FaSignInAlt, FaImage, FaArrowLeft, FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function BarberAuthContent() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signup');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBarbershopOwner = searchParams.get('type') === 'barbershop';

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

    if (isBarbershopOwner) {
        // Modern design for barbershop admin
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
                        <BarbershopOwnerSignUpForm onSwitch={() => setMode('signin')} />
                    ) : (
                        <BarbershopOwnerSignInForm onSwitch={() => setMode('signup')} />
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

    // Default (barber) design remains unchanged
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
                    <BarberSignUpForm onSwitch={() => setMode('signin')} />
                ) : (
                    <BarberSignInForm onSwitch={() => setMode('signup')} />
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

export default function BarberAuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BarberAuthContent />
        </Suspense>
    );
}

function BarberSignUpForm({ onSwitch }: { onSwitch: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isValidEmail(email)) {
            setError("Invalid email address");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (!name) {
            setError("Name is required");
            return;
        }
        if (!inviteCode) {
            setError("Invite code is required");
            return;
        }

        setLoading(true);
        try {
            // Check if barber is invited
            const { data: inviteData, error: inviteError } = await supabase
                .from('barber_invites')
                .select('*')
                .eq('code', inviteCode)
                .eq('barber_email', email)
                .maybeSingle();

            if (inviteError) throw inviteError;
            if (!inviteData) {
                setError("Invalid invite code or email");
                setLoading(false);
                return;
            }

            // Create user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;
            if (!data.user) throw new Error('Failed to create user');

            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: data.user.id,
                    email,
                    name,
                    role: 'barber',
                });

            if (profileError) throw profileError;

            // Create barber profile
            const { error: barberError } = await supabase
                .from('barbers')
                .insert({
                    user_id: data.user.id,
                    name,
                    email,
                    barbershop_id: inviteData.barbershop_id
                });

            if (barberError) throw barberError;

            // Sign in immediately after signup
            const { data: loginData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw signInError;

            // Poll for barber profile (wait for DB/session propagation)
            let found = false;
            for (let i = 0; i < 10; i++) { // Try for up to ~5 seconds
                await new Promise(res => setTimeout(res, 500));
                const { data: { user: sessionUser } } = await supabase.auth.getUser();
                if (!sessionUser) continue;
                const { data: barber, error } = await supabase
                    .from('barbers')
                    .select('*')
                    .eq('user_id', sessionUser.id)
                    .maybeSingle();
                if (barber && !error) {
                    found = true;
                    break;
                }
            }
            if (found) {
                await router.push('/barber-dashboard/calendar');
            } else {
                setError('Barber profile not found after sign-up. Please try logging in.');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-black mb-1">
                    Name
                </label>
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
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-1">
                    Email
                </label>
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
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-1">
                    Password
                </label>
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
                <label htmlFor="inviteCode" className="block text-sm font-semibold text-black mb-1">
                    Invite Code
                </label>
                <input
                    type="text"
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
                {loading ? "Loading..." : "Sign Up"}
            </button>

            <div className="text-sm text-center">
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-purple-400 hover:text-purple-300"
                >
                    Already have an account? Sign In
                </button>
            </div>
        </form>
    );
}

function BarberSignInForm({ onSwitch }: { onSwitch: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isValidEmail(email)) {
            setError("Invalid email address");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            // Sign in
            const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
            if (!user) throw new Error('Failed to sign in');

            // Poll for barber profile (wait for DB/session propagation)
            let found = false;
            for (let i = 0; i < 10; i++) { // Try for up to ~5 seconds
                await new Promise(res => setTimeout(res, 500));
                const { data: barber, error } = await supabase
                    .from('barbers')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (barber && !error) {
                    found = true;
                    break;
                }
            }
            if (found) {
                await router.push('/barber-dashboard/calendar');
            } else {
                setError('No barber profile found. Please sign up with your invite code first.');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-1">
                    Email
                </label>
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
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-1">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none placeholder-gray-400"
                    required
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
                {loading ? "Loading..." : "Sign In"}
            </button>

            <div className="text-sm text-center">
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-purple-400 hover:text-purple-300"
                >
                    Don't have an account? Sign Up
                </button>
            </div>
        </form>
    );
}

function BarbershopOwnerSignUpForm({ onSwitch }: { onSwitch: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Invalid email address");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
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
                {
                    id: data.user.id,
                    name,
                    email,
                    role: 'barbershop_owner'
                },
            ]);

            if (insertError) throw insertError;

            await router.push('/barbershop-onboarding');
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
            {error && <div className="text-red-500 text-sm">{error}</div>}
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

function BarbershopOwnerSignInForm({ onSwitch }: { onSwitch: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isValidEmail(email)) {
            setError("Invalid email address");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            await router.push('/barbershop-onboarding');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
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