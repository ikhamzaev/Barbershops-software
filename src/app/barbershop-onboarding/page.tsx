'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import BarbershopOnboarding from '@/components/BarbershopOnboarding';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // If no user is authenticated, redirect to sign up
                    await router.push('/barber-auth?type=barbershop');
                    return;
                }

                // Check if user is a barbershop owner
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error || userData?.role !== 'barbershop_owner') {
                    // Update user role to barbershop_owner
                    const { error: updateError } = await supabase
                        .from('users')
                        .upsert({
                            id: user.id,
                            role: 'barbershop_owner'
                        });

                    if (updateError) throw updateError;
                }

                // Check if barbershop already exists
                const { data: barbershop, error: barbershopError } = await supabase
                    .from('barbershops')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();

                if (barbershop && !barbershopError) {
                    // If barbershop exists, redirect to dashboard
                    await router.push('/barbershop-dashboard');
                    return;
                }
            } catch (error) {
                console.error('Error in onboarding:', error);
                await router.push('/barber-auth?type=barbershop');
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return <BarbershopOnboarding />;
} 