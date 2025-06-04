"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { StandardService, BarberService } from '@/lib/types';
import { toast } from 'react-hot-toast';
import BarberSidebarNav from '@/components/barber/BarberSidebarNav';
import BarberBottomNav from '@/components/barber/BarberBottomNav';
import { FaCut, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function BarberServicesPage() {
    const [standardServices, setStandardServices] = useState<StandardService[]>([]);
    const [barberServices, setBarberServices] = useState<BarberService[]>([]);
    const [loading, setLoading] = useState(true);
    const [barberId, setBarberId] = useState<string | null>(null);
    const [editingService, setEditingService] = useState<BarberService | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStandardModal, setShowStandardModal] = useState<StandardService | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch barber ID
    useEffect(() => {
        const fetchBarberId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('barbers')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setBarberId(data.id);
            }
        };
        fetchBarberId();
    }, []);

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            if (!barberId) return;
            setLoading(true);

            try {
                // Fetch standard services
                const { data: standardData } = await supabase
                    .from('standard_services')
                    .select('*')
                    .order('name');

                // Fetch barber's services
                const { data: barberData } = await supabase
                    .from('barber_services')
                    .select(`
                        *,
                        standard_service:standard_service_id (*)
                    `)
                    .eq('barber_id', barberId)
                    .order('name');

                setStandardServices(standardData || []);
                setBarberServices(barberData || []);
            } catch (error) {
                console.error('Error fetching services:', error);
                toast.error('Error loading services');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [barberId]);

    // Helper to fetch barber services
    const fetchBarberServices = async (barberId: string) => {
        const { data, error } = await supabase
            .from('barber_services')
            .select(`*, standard_service:standard_service_id (*)`)
            .eq('barber_id', barberId)
            .order('name');
        if (error) {
            console.error('Error fetching barber services:', error);
            toast.error('Error loading services');
            return [];
        }
        return data || [];
    };

    const handleAddStandardService = (standardService: StandardService) => {
        setShowStandardModal(standardService);
    };

    const handleConfirmAddStandardService = async (serviceData: { price: number; duration: number; }) => {
        if (!barberId || !showStandardModal) return;
        setIsSubmitting(true);
        try {
            // Validate input
            if (!serviceData.price || !serviceData.duration) {
                toast.error('Please provide both price and duration.');
                setIsSubmitting(false);
                return;
            }
            const { data, error } = await supabase
                .from('barber_services')
                .insert({
                    barber_id: barberId,
                    service_type: 'standard',
                    standard_service_id: showStandardModal.id,
                    name: showStandardModal.name,
                    description: showStandardModal.description,
                    duration: serviceData.duration,
                    price: serviceData.price,
                    is_active: true
                })
                .select()
                .single();
            if (error) {
                toast.error('Error adding service: ' + error.message);
                setIsSubmitting(false);
                return;
            }
            const updated = await fetchBarberServices(barberId);
            setBarberServices(updated);
            toast.success('Service added successfully');
            setShowStandardModal(null);
        } catch (error: any) {
            toast.error('Error adding service: ' + (error.message || error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddCustomService = async (serviceData: {
        name: string;
        description: string;
        duration: number;
        price: number;
    }) => {
        if (!barberId) return;
        setIsSubmitting(true);
        try {
            // Validate input
            if (!serviceData.name || !serviceData.duration || !serviceData.price) {
                toast.error('Please provide name, price, and duration.');
                setIsSubmitting(false);
                return;
            }
            const { data, error } = await supabase
                .from('barber_services')
                .insert({
                    barber_id: barberId,
                    service_type: 'custom',
                    name: serviceData.name,
                    description: serviceData.description,
                    duration: serviceData.duration,
                    price: serviceData.price,
                    is_active: true
                })
                .select()
                .single();
            if (error) {
                toast.error('Error adding custom service: ' + error.message);
                setIsSubmitting(false);
                return;
            }
            const updated = await fetchBarberServices(barberId);
            setBarberServices(updated);
            toast.success('Custom service added successfully');
            setShowAddModal(false);
        } catch (error: any) {
            toast.error('Error adding custom service: ' + (error.message || error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateService = async (serviceId: string, updates: {
        name?: string;
        description?: string;
        duration?: number;
        price?: number;
        is_active?: boolean;
    }) => {
        try {
            const { data, error } = await supabase
                .from('barber_services')
                .update(updates)
                .eq('id', serviceId)
                .select()
                .single();

            if (error) throw error;

            setBarberServices(prev =>
                prev.map(service =>
                    service.id === serviceId ? { ...service, ...data } : service
                )
            );
            toast.success('Service updated successfully');
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error('Error updating service');
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        try {
            const { error } = await supabase
                .from('barber_services')
                .delete()
                .eq('id', serviceId);

            if (error) throw error;

            setBarberServices(prev =>
                prev.filter(service => service.id !== serviceId)
            );
            toast.success('Service deleted successfully');
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('Error deleting service');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <BarberSidebarNav activeTab="services" />
                <div className="p-4 max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
                        ))}
                    </div>
                </div>
                <BarberBottomNav activeTab="services" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BarberSidebarNav activeTab="services" />

            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mening xizmatlarim</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                        Xizmat qoʼshish
                    </button>
                </div>

                {/* Standard Services Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Standart xizmatlar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {standardServices.map(service => {
                            const isAdded = barberServices.some(
                                bs => bs.standard_service_id === service.id
                            );

                            return (
                                <div
                                    key={service.id}
                                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                                >
                                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                    <div className="text-sm text-gray-500 mb-2">
                                        Davomiyligi: {service.default_duration} daqiqa
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4">
                                        Narxi: ${service.default_price}
                                    </div>
                                    {!isAdded && (
                                        <button
                                            onClick={() => handleAddStandardService(service)}
                                            className="w-full bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 font-semibold flex items-center justify-center gap-2"
                                        >
                                            <FaCut className="mr-1" /> Qoʼshish va sozlash
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* My Services Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Mening xizmatlarim</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {barberServices.map(service => (
                            <div
                                key={service.id}
                                className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <FaCut className="text-purple-400" />
                                        <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{service.is_active ? 'Faol' : 'Nofaol'}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                                <div className="flex justify-between text-sm text-gray-500 mb-2">
                                    <span>Davomiyligi: <span className="font-semibold text-gray-800">{service.duration} daqiqa</span></span>
                                    <span>Narxi: <span className="font-semibold text-purple-600">${service.price}</span></span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setEditingService(service)} className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1"><FaEdit /> Tahrirlash</button>
                                    <button onClick={() => handleDeleteService(service.id)} className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 flex items-center gap-1"><FaTrash /> Oʻchirish</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Service Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Maxsus xizmat qoʼshish</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddCustomService({
                                name: formData.get('name') as string,
                                description: formData.get('description') as string,
                                duration: parseInt(formData.get('duration') as string),
                                price: parseFloat(formData.get('price') as string)
                            });
                            setShowAddModal(false);
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Xizmat nomi
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tavsif
                                </label>
                                <textarea
                                    name="description"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Davomiyligi (daqiqa)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Narxi ($)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Xizmat qoʼshish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Service Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Edit Service</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleUpdateService(editingService.id, {
                                name: formData.get('name') as string,
                                description: formData.get('description') as string,
                                duration: parseInt(formData.get('duration') as string),
                                price: parseFloat(formData.get('price') as string),
                                is_active: formData.get('is_active') === 'true'
                            });
                            setEditingService(null);
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingService.name}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={editingService.description || ''}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    defaultValue={editingService.duration}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    defaultValue={editingService.price}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        defaultChecked={editingService.is_active}
                                        value="true"
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Service is active
                                    </span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingService(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Standard Service Modal */}
            {showStandardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Add & Customize Service</h2>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleConfirmAddStandardService({
                                price: parseFloat(formData.get('price') as string),
                                duration: parseInt(formData.get('duration') as string)
                            });
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                <input type="text" value={showStandardModal.name} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={showStandardModal.description || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input type="number" name="duration" defaultValue={showStandardModal.default_duration} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input type="number" name="price" defaultValue={showStandardModal.default_price} min="0" step="0.01" required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowStandardModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                                    {isSubmitting ? 'Adding...' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <BarberBottomNav activeTab="services" />
        </div>
    );
} 