'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { UZBEKISTAN_CITIES, BUSINESS_HOURS } from '@/lib/constants';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

interface BarbershopSettings {
    owner_id: string;
    name: string;
    description: string;
    address: string;
    region: string;
    city: string;
    phone: string;
    email: string;
    businessHours: typeof BUSINESS_HOURS;
    photo_url: string;
    photos: string[];
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<BarbershopSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');

    useEffect(() => {
        fetchBarbershopSettings();
    }, []);

    const fetchBarbershopSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('barbershops')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (error) throw error;
            setSettings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field: string) => {
        setEditing(field);
        setTempValue(settings?.[field as keyof BarbershopSettings] as string || '');
    };

    const handleSave = async (field: string) => {
        if (!settings) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('barbershops')
                .update({ [field]: tempValue })
                .eq('owner_id', user.id);

            if (error) throw error;

            setSettings({ ...settings, [field]: tempValue });
            setEditing(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !settings) return;
        try {
            const { data, error } = await supabase.storage
                .from('barbershop-images')
                .upload(`${Date.now()}-${file.name}`, file, { upsert: true });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage
                .from('barbershop-images')
                .getPublicUrl(data.path);
            const publicUrl = publicUrlData.publicUrl;
            const { error: updateError } = await supabase
                .from('barbershops')
                .update({ photo_url: publicUrl })
                .eq('owner_id', settings.owner_id);
            if (updateError) throw updateError;
            setSettings({ ...settings, photo_url: publicUrl });
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <DashboardLayout activePage="Settings"><div>Loading...</div></DashboardLayout>;
    if (error) return <DashboardLayout activePage="Settings"><div className="text-red-500">{error}</div></DashboardLayout>;
    if (!settings) return <DashboardLayout activePage="Settings"><div>No settings found</div></DashboardLayout>;

    return (
        <DashboardLayout activePage="Settings">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Barbershop Settings</h1>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h2>

                    {/* Barbershop Photo */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Barbershop Photo</label>
                        <div className="flex items-center gap-4">
                            {settings.photo_url ? (
                                <img src={settings.photo_url} alt="Barbershop Photo" className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Barbershop Name</label>
                        <div className="flex items-center gap-2">
                            {editing === 'name' ? (
                                <>
                                    <input
                                        type="text"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={() => handleSave('name')}
                                        className="p-2 text-green-600 hover:text-green-700"
                                    >
                                        <FaSave />
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{settings.name}</span>
                                    <button
                                        onClick={() => handleEdit('name')}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaEdit />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <div className="flex items-center gap-2">
                            {editing === 'description' ? (
                                <>
                                    <textarea
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        rows={3}
                                    />
                                    <button
                                        onClick={() => handleSave('description')}
                                        className="p-2 text-green-600 hover:text-green-700"
                                    >
                                        <FaSave />
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="flex-1">{settings.description}</p>
                                    <button
                                        onClick={() => handleEdit('description')}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaEdit />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h2>

                    {/* Phone */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="flex items-center gap-2">
                            {editing === 'phone' ? (
                                <>
                                    <input
                                        type="tel"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={() => handleSave('phone')}
                                        className="p-2 text-green-600 hover:text-green-700"
                                    >
                                        <FaSave />
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{settings.phone}</span>
                                    <button
                                        onClick={() => handleEdit('phone')}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaEdit />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="flex items-center gap-2">
                            {editing === 'email' ? (
                                <>
                                    <input
                                        type="email"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={() => handleSave('email')}
                                        className="p-2 text-green-600 hover:text-green-700"
                                    >
                                        <FaSave />
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{settings.email}</span>
                                    <button
                                        onClick={() => handleEdit('email')}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaEdit />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Location</h2>

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="flex items-center gap-2">
                            {editing === 'address' ? (
                                <>
                                    <input
                                        type="text"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={() => handleSave('address')}
                                        className="p-2 text-green-600 hover:text-green-700"
                                    >
                                        <FaSave />
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{settings.address}</span>
                                    <button
                                        onClick={() => handleEdit('address')}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaEdit />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* City */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <div className="flex items-center gap-2">
                            {editing === 'city' ? (
                                <>
                                    <select
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        {UZBEKISTAN_CITIES.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleSave('city')}
                                        className="p-2 text-green-600 hover:text-green-700"
                                    >
                                        <FaSave />
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{settings.city}</span>
                                    <button
                                        onClick={() => handleEdit('city')}
                                        className="p-2 text-gray-600 hover:text-gray-700"
                                    >
                                        <FaEdit />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 