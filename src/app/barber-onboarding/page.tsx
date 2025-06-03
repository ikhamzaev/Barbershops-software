"use client";
import { Suspense } from 'react';
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

function BarberOnboardingContent() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [barbershopId, setBarbershopId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [postSignUpLoading, setPostSignUpLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [signedUpUserId, setSignedUpUserId] = useState<string | null>(null);
    const [inviteValid, setInviteValid] = useState(false);

    // Check for invite code in URL
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && !inviteCode) {
        setInviteCode(codeFromUrl);
    }

    // If the user is authenticated and already has a barber profile, redirect to dashboard
    useEffect(() => {
        if (signedUpUserId) return; // Don't run initial check after sign-up
        const checkBarberProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('DEBUG: Session user:', user);
            if (!user) return;
            // Use only a simple select for maximum compatibility
            const { data: barber, error } = await supabase
                .from('barbers')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            console.log('DEBUG: Barber profile query for user_id', user.id, 'result:', barber, 'error:', error);
            if (barber && !error) {
                router.push('/barber-dashboard');
            } else {
                setError('Barber profile not found. Please check your credentials or contact your admin.');
                console.log('DEBUG: No barber profile found for user_id', user.id);
            }
        };
        checkBarberProfile();
    }, [router, signedUpUserId]);

    const handleInviteCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Validate invite code and email using correct column names
            const { data: inviteData, error: inviteError } = await supabase
                .from('barber_invites')
                .select('*')
                .eq('code', inviteCode)
                .eq('barber_email', email)
                .maybeSingle();
            if (inviteError) throw inviteError;
            if (!inviteData) {
                setError('Invite code and email do not match any invite.');
                setLoading(false);
                setInviteValid(false);
                return;
            }
            // Store barbershop_id for later use
            setBarbershopId(inviteData.barbershop_id);
            setInviteValid(true);
            setStep(2);
        } catch (error: any) {
            setError(error.message);
            setInviteValid(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Double-check invite code and email before sign-up
            const { data: inviteData, error: inviteError } = await supabase
                .from('barber_invites')
                .select('*')
                .eq('code', inviteCode)
                .eq('barber_email', email)
                .maybeSingle();
            if (inviteError) throw inviteError;
            if (!inviteData) {
                setError('Invite code and email do not match any invite.');
                setLoading(false);
                return;
            }
            // Create user account
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });
            console.log('DEBUG: After signUp, user:', user, 'error:', signUpError);

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
            console.log('DEBUG: After user profile insert, error:', profileError);

            if (profileError) throw profileError;

            // Create barber profile
            const { error: barberError } = await supabase
                .from('barbers')
                .insert({
                    user_id: user.id,
                    barbershop_id: inviteData.barbershop_id,
                    name: name,
                    email: email
                });
            console.log('DEBUG: After barber profile insert, error:', barberError);

            if (barberError) throw barberError;

            // Immediately log the user in to ensure session is established
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            console.log('DEBUG: After signInWithPassword, loginData:', loginData, 'loginError:', loginError);
            if (loginError) throw loginError;

            // Now check for barber profile and redirect
            setSignedUpUserId(user.id);
            setPostSignUpLoading(true);
            let found = false;
            for (let i = 0; i < 10; i++) { // Try for up to ~5 seconds
                await new Promise(res => setTimeout(res, 500));
                const { data: { user: sessionUser } } = await supabase.auth.getUser();
                console.log('DEBUG: Polling for session user:', sessionUser);
                if (!sessionUser) continue;
                // Use only a simple select for maximum compatibility
                const { data: barber, error } = await supabase
                    .from('barbers')
                    .select('*')
                    .eq('user_id', sessionUser.id)
                    .maybeSingle();
                console.log('DEBUG: Polling for barber profile for user_id', sessionUser.id, 'result:', barber, 'error:', error);
                if (barber && !error) {
                    found = true;
                    break;
                }
            }
            setPostSignUpLoading(false);
            if (found) {
                router.push('/barber-dashboard');
            } else {
                setError('Barber profile not found after sign-up. Please try logging in.');
                console.log('DEBUG: Final fail - barber profile not found after polling.');
            }
        } catch (error: any) {
            setError(error.message);
            console.log('DEBUG: Error in handleSignUp:', error);
        } finally {
            setLoading(false);
        }
    };

    // Only show the account creation form (step 2) if barbershopId is set and invite is valid
    if (Number(step) === 2 && barbershopId && inviteValid) {
        if (postSignUpLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="text-white text-xl">Profil yaratilmoqda...</div>
                </div>
            );
        }
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            {Number(step) === 1 ? 'Join a Barbershop' : 'Create Your Account'}
                        </h2>
                        {/* Optionally show barbershopId for debugging */}
                        <div className="mt-2 text-gray-400 text-xs">Barbershop ID: {barbershopId}</div>
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
    // Otherwise, show invite code form or loading spinner
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl">
                {loading ? 'Yuklanmoqda...' : (
                    <form onSubmit={handleInviteCodeSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="invite-code" className="block mb-2">Taklif kodi</label>
                            <input
                                id="invite-code"
                                type="text"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white"
                                placeholder="Taklif kodini kiriting"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white"
                                placeholder="Email manzilingiz"
                                required
                            />
                        </div>
                        {error && <div className="text-red-400 text-sm">{error}</div>}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold"
                            disabled={loading}
                        >
                            Tekshirish
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function BarberOnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BarberOnboardingContent />
        </Suspense>
    );
} 