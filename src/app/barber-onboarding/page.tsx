'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUser, FaCut, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

interface Barbershop {
    id: string;
    name: string;
    city: string;
    address: string;
    phone: string;
    logo_url: string;
}

interface InviteData {
    barbershop_id: string;
    barbershops: Barbershop;
}

export default function BarberOnboarding() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for invite code in URL
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && !inviteCode) {
        setInviteCode(codeFromUrl);
    }

    // If the user is authenticated and already has a barber profile, redirect to dashboard
    useEffect(() => {
        const checkBarberProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: barber, error } = await supabase
                .from('barbers')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
            if (barber && !error) {
                router.push('/barber-dashboard');
            }
        };
        checkBarberProfile();
    }, [router]);

    const handleInviteCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Verify invite code and get barbershop info
            const { data: inviteData, error: inviteError } = await supabase
                .from('barber_invites')
                .select('barbershop_id, barbershops:barbershops(*)')
                .eq('code', inviteCode)
                .single() as { data: InviteData | null, error: any };

            if (inviteError) throw inviteError;
            if (!inviteData) {
                setError('Invalid invite code');
                setLoading(false);
                return;
            }

            setBarbershop(inviteData.barbershops);
            setStep(2);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Create user account
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;
            if (!user) throw new Error('Failed to create user account');

            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: name,
                    role: 'barber',
                });

            if (profileError) throw profileError;

            // Create barber profile
            const { error: barberError } = await supabase
                .from('barbers')
                .insert({
                    user_id: user.id,
                    barbershop_id: barbershop?.id,
                    name: name,
                    email: email
                });

            if (barberError) throw barberError;

            // Redirect to barber dashboard
            router.push('/barber-dashboard');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Only show the account creation form (step 2) if barbershop is set
    if (step === 2 && barbershop) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            {step === 1 ? 'Join a Barbershop' : 'Create Your Account'}
                        </h2>
                        {step === 2 && barbershop && (
                            <div className="mt-4 bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    {barbershop.logo_url && (
                                        <img
                                            src={barbershop.logo_url}
                                            alt={barbershop.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    )}
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-white">{barbershop.name}</h3>
                                        <div className="flex items-center text-gray-400 text-sm">
                                            <FaMapMarkerAlt className="mr-1" />
                                            {barbershop.city}
                                        </div>
                                        <div className="flex items-center text-gray-400 text-sm">
                                            <FaPhone className="mr-1" />
                                            {barbershop.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="name" className="sr-only">
                                    Your Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email-address" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    // Otherwise, show a loading spinner
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl">Loading...</div>
        </div>
    );
} 