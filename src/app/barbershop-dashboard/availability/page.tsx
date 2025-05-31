'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { FaSave, FaCheck } from 'react-icons/fa';
import Select from 'react-select';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

interface BusinessHours {
    [key: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

// Generate time options in 30-minute intervals
const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const label = `${displayHour.toString().padStart(2, '0')}:${minute} ${period}`;
    return { value: label, label };
});

export default function AvailabilityPage() {
    const [businessHours, setBusinessHours] = useState<BusinessHours>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        fetchBusinessHours();
    }, []);

    const fetchBusinessHours = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('barbershops')
                .select('business_hours')
                .eq('owner_id', user.id)
                .single();

            if (error) throw error;

            // Always merge with defaults to ensure all days are present
            const defaultHours: BusinessHours = {};
            DAYS_OF_WEEK.forEach(day => {
                defaultHours[day] = {
                    isOpen: true,
                    openTime: '09:00 AM',
                    closeTime: '06:00 PM'
                };
            });

            if (data?.business_hours) {
                const merged = { ...defaultHours, ...data.business_hours };
                setBusinessHours(merged);
            } else {
                setBusinessHours(defaultHours);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDayToggle = (day: string) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: {
                ...(prev[day] || { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' }),
                isOpen: !(prev[day]?.isOpen ?? true)
            }
        }));
    };

    const handleTimeChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('barbershops')
                .update({ business_hours: businessHours })
                .eq('owner_id', user.id);

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <DashboardLayout activePage="Availability"><div>Loading...</div></DashboardLayout>;
    if (error) return <DashboardLayout activePage="Availability"><div className="text-red-500">{error}</div></DashboardLayout>;

    return (
        <DashboardLayout activePage="Availability">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Business Hours</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <FaSave />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                {saveSuccess && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <FaCheck />
                        Business hours updated successfully!
                    </div>
                )}

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {DAYS_OF_WEEK.map((day) => (
                            <div key={day} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={businessHours[day]?.isOpen}
                                                onChange={() => handleDayToggle(day)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                        <span className="font-medium text-gray-700">{day}</span>
                                    </div>
                                    {businessHours[day]?.isOpen && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-500">Open</label>
                                                <Select
                                                    options={TIME_OPTIONS}
                                                    value={TIME_OPTIONS.find(opt => opt.value === businessHours[day].openTime)}
                                                    onChange={option => handleTimeChange(day, 'openTime', option?.value || businessHours[day].openTime)}
                                                    isSearchable={false}
                                                    menuPlacement="auto"
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 50,
                                                            maxHeight: 200,
                                                            backgroundColor: '#f9fafb',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: state.isFocused ? '#e5e7eb' : '#f9fafb',
                                                            color: '#111827',
                                                            cursor: 'pointer',
                                                        }),
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-500">Close</label>
                                                <Select
                                                    options={TIME_OPTIONS}
                                                    value={TIME_OPTIONS.find(opt => opt.value === businessHours[day].closeTime)}
                                                    onChange={option => handleTimeChange(day, 'closeTime', option?.value || businessHours[day].closeTime)}
                                                    isSearchable={false}
                                                    menuPlacement="auto"
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 50,
                                                            maxHeight: 200,
                                                            backgroundColor: '#f9fafb',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: state.isFocused ? '#e5e7eb' : '#f9fafb',
                                                            color: '#111827',
                                                            cursor: 'pointer',
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    <p>Note: These hours will be visible to clients when they book appointments.</p>
                </div>
            </div>
        </DashboardLayout>
    );
} 