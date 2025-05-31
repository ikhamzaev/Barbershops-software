'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { UZBEKISTAN_CITIES, BUSINESS_HOURS, DEFAULT_SERVICES, ALL_CITIES, REGIONS } from '@/lib/constants';
import Image from 'next/image';

interface OnboardingStep {
    title: string;
    description: string;
}

const steps: OnboardingStep[] = [
    {
        title: 'Basic Information',
        description: 'Tell us about your barbershop'
    },
    {
        title: 'Location & Hours',
        description: 'Set your business location and operating hours'
    },
    {
        title: 'Services & Pricing',
        description: 'Define your services and set prices'
    },
    {
        title: 'Add Barbers',
        description: 'Invite your barbers to join'
    }
];

interface Service {
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
}

interface Barber {
    name: string;
    email: string;
    specialties: string[];
    code?: string;
    photo?: string;
}

export default function BarbershopOnboarding() {
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        region: '',
        city: '',
        phone: '',
        email: '',
        businessHours: BUSINESS_HOURS,
        services: DEFAULT_SERVICES as Service[],
        barbers: [] as Barber[],
        photo_url: '' as string,
    });

    const [newService, setNewService] = useState<Service>({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        category: 'Hair'
    });

    const [newBarber, setNewBarber] = useState<Barber>({
        name: '',
        email: '',
        specialties: []
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { data, error } = await supabase.storage
                .from('barbershop-logos')
                .upload(`${Date.now()}-${file.name}`, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('barbershop-logos')
                .getPublicUrl(data.path);

            setFormData({ ...formData, photo_url: publicUrl });
        } catch (error) {
            console.error('Error uploading logo:', error);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { data, error } = await supabase.storage
                .from('barbershop-images')
                .upload(`${Date.now()}-${file.name}`, file, { upsert: true });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage
                .from('barbershop-images')
                .getPublicUrl(data.path);
            setFormData({ ...formData, photo_url: publicUrlData.publicUrl });
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    const addService = () => {
        if (!newService.name || !newService.description || newService.price <= 0) return;
        setFormData({
            ...formData,
            services: [...formData.services, newService]
        });
        setNewService({
            name: '',
            description: '',
            duration: 30,
            price: 0,
            category: 'Hair'
        });
    };

    const addBarber = () => {
        if (!newBarber.name || !newBarber.email) return;
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData({
            ...formData,
            barbers: [...formData.barbers, { ...newBarber, code }]
        });
        setNewBarber({
            name: '',
            email: '',
            specialties: []
        });
    };

    const handleNext = async () => {
        if (currentStep === steps.length - 1) {
            setLoading(true);
            setErrorMsg(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No user found');
                // Insert barbershop data and get the new barbershop id
                const { data: barbershopInsert, error } = await supabase
                    .from('barbershops')
                    .insert({
                        owner_id: user.id,
                        name: formData.name || 'Untitled Barbershop',
                        description: formData.description || '',
                        address: formData.address || '',
                        region: formData.region || '',
                        city: formData.city || '',
                        phone: formData.phone || '',
                        email: formData.email || user.email,
                        business_hours: formData.businessHours,
                        services: formData.services,
                        photo_url: formData.photo_url,
                    })
                    .select('id')
                    .single();
                if (error) throw error;
                const barbershopId = barbershopInsert.id;
                // Save barbers and invite codes using the correct barbershop id
                const invitePromises = formData.barbers.map(async (barber) => {
                    const { error } = await supabase
                        .from('barber_invites')
                        .insert({
                            barbershop_id: barbershopId,
                            barber_email: barber.email,
                            code: barber.code
                        });
                    if (error) throw error;
                });
                await Promise.all(invitePromises);
                // Redirect to dashboard
                router.push('/barbershop-dashboard');
            } catch (error: any) {
                setErrorMsg(error.message || 'An error occurred while saving.');
            } finally {
                setLoading(false);
            }
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Modern Stepper/Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        {steps.map((step, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center z-10">
                                <div
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors duration-300
                                        ${index < currentStep ? 'bg-blue-600 border-blue-600 text-white' : index === currentStep ? 'bg-white border-blue-500 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                                >
                                    <span className="font-bold text-lg">{index + 1}</span>
                                </div>
                                <span className={`mt-2 text-xs font-medium text-center ${index === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>{step.title}</span>
                            </div>
                        ))}
                        {/* Progress Bar Line */}
                        <div className="absolute top-5 left-0 right-0 h-1 z-0 flex">
                            {steps.map((_, index) => (
                                index < steps.length - 1 && (
                                    <div
                                        key={index}
                                        className={`flex-1 h-1 mx-1 rounded-full transition-colors duration-300
                                            ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </div>
                {/* Step Content */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 transition-all duration-300">
                    <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight font-display">{steps[currentStep].title}</h2>
                    <p className="text-gray-500 mb-8 text-lg">{steps[currentStep].description}</p>

                    {(() => {
                        switch (currentStep) {
                            case 0:
                                return (
                                    <div className="space-y-4">
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Barbershop Photo</label>
                                            <div className="flex items-center gap-4">
                                                {formData.photo_url ? (
                                                    <img src={formData.photo_url} alt="Barbershop Photo" className="w-20 h-20 rounded-full object-cover" />
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
                                        <div>
                                            <label className="block text-sm font-semibold text-black">Barbershop Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                placeholder="Enter your barbershop name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-black">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                rows={4}
                                                placeholder="Tell us about your barbershop"
                                            />
                                        </div>
                                    </div>
                                );
                            case 1:
                                return (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-black">Region (Province)</label>
                                            <select
                                                value={formData.region}
                                                onChange={(e) => setFormData({ ...formData, region: e.target.value, city: '' })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                            >
                                                <option value="">Select a region</option>
                                                {REGIONS.map((region) => (
                                                    <option key={region.id} value={region.id}>{region.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-black">City</label>
                                            <select
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                disabled={!formData.region}
                                            >
                                                <option value="">Select a city</option>
                                                {ALL_CITIES.filter(city => city.regionId === formData.region).map((city) => (
                                                    <option key={city.id} value={city.id}>{city.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-black">Address</label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                placeholder="Enter your address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-black">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-black">Business Hours</label>
                                            {Object.entries(formData.businessHours).map(([day, hours]) => (
                                                <div key={day} className="mt-2 flex items-center space-x-4">
                                                    <span className="text-gray-500 w-24 capitalize">{day}</span>
                                                    <input
                                                        type="time"
                                                        value={hours.open}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            businessHours: {
                                                                ...formData.businessHours,
                                                                [day]: { ...hours, open: e.target.value }
                                                            }
                                                        })}
                                                        className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2"
                                                    />
                                                    <span className="text-gray-400">to</span>
                                                    <input
                                                        type="time"
                                                        value={hours.close}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            businessHours: {
                                                                ...formData.businessHours,
                                                                [day]: { ...hours, close: e.target.value }
                                                            }
                                                        })}
                                                        className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-3 py-2"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            case 2:
                                return (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            {formData.services.map((service, index) => (
                                                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <h3 className="text-black font-semibold">{service.name}</h3>
                                                    <p className="text-gray-600">{service.description}</p>
                                                    <div className="mt-2 flex justify-between text-gray-500">
                                                        <span>{service.duration} minutes</span>
                                                        <span>{service.price.toLocaleString()} UZS</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 space-y-4">
                                            <h3 className="text-black font-semibold">Add New Service</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={newService.name}
                                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                                    placeholder="Service name"
                                                    className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                />
                                                <input
                                                    type="text"
                                                    value={newService.description}
                                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                                    placeholder="Service description"
                                                    className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                />
                                                <input
                                                    type="number"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                                                    placeholder="Duration (minutes)"
                                                    className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                />
                                                <input
                                                    type="number"
                                                    value={newService.price}
                                                    onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) })}
                                                    placeholder="Price (UZS)"
                                                    className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                />
                                            </div>
                                            <button
                                                onClick={addService}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                                            >
                                                Add Service
                                            </button>
                                        </div>
                                    </div>
                                );
                            case 3:
                                return (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            {formData.barbers.map((barber, index) => (
                                                <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <h3 className="text-black font-semibold">{barber.name}</h3>
                                                        <p className="text-gray-600">{barber.email}</p>
                                                        <div className="mt-2">
                                                            <span className="text-gray-500">Specialties: </span>
                                                            {barber.specialties.join(', ')}
                                                        </div>
                                                    </div>
                                                    {barber.code && (
                                                        <div className="mt-2 md:mt-0 md:ml-6">
                                                            <span className="text-xs text-gray-400">Invite Code:</span>
                                                            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-600 rounded font-mono tracking-widest select-all border border-blue-200">{barber.code}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 space-y-4">
                                            <h3 className="text-black font-semibold">Add New Barber</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    value={newBarber.name}
                                                    onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                                                    placeholder="Barber name"
                                                    className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                />
                                                <input
                                                    type="email"
                                                    value={newBarber.email}
                                                    onChange={(e) => setNewBarber({ ...newBarber, email: e.target.value })}
                                                    placeholder="Barber email"
                                                    className="rounded-lg border border-gray-300 bg-white text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3"
                                                />
                                            </div>
                                            <button
                                                onClick={addBarber}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                                            >
                                                Add Barber
                                            </button>
                                        </div>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })()}

                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <span className="text-blue-600 animate-pulse">Saving, please wait...</span>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="text-red-500 text-center py-2">{errorMsg}</div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-10 flex justify-between gap-4">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 border border-gray-200 shadow-sm
                                ${currentStep === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md focus:ring-2 focus:ring-blue-400'}
                            `}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-md"
                        >
                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 