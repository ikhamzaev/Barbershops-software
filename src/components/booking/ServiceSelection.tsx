"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarberService } from '@/lib/types';
import { FiPlus, FiMinus } from 'react-icons/fi';

interface ServiceSelectionProps {
    barberId: string;
    onServicesSelected: (services: BarberService[]) => void;
}

export default function ServiceSelection({ barberId, onServicesSelected }: ServiceSelectionProps) {
    const [services, setServices] = useState<BarberService[]>([]);
    const [selectedServices, setSelectedServices] = useState<BarberService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('barber_services')
                    .select('*')
                    .eq('barber_id', barberId)
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;
                setServices(data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [barberId]);

    const toggleService = (service: BarberService) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            let newSelection;

            if (isSelected) {
                newSelection = prev.filter(s => s.id !== service.id);
            } else {
                newSelection = [...prev, service];
            }

            onServicesSelected(newSelection);
            return newSelection;
        });
    };

    const calculateTotal = () => {
        return selectedServices.reduce((sum, service) => sum + service.price, 0);
    };

    const calculateTotalDuration = () => {
        return selectedServices.reduce((sum, service) => sum + service.duration, 0);
    };

    if (loading) {
        return <div className="text-center py-4">Loading services...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => {
                    const isSelected = selectedServices.some(s => s.id === service.id);

                    return (
                        <div
                            key={service.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                                }`}
                            onClick={() => toggleService(service)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                    {service.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <span className="text-lg font-semibold text-purple-600">
                                        ${service.price}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({service.duration} min)
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 