"use client";
import { useState, useRef, useEffect } from 'react';
import { REGIONS, Region, City, getCitiesByRegion } from '@/lib/constants';

interface LocationSelectorProps {
    onSelect: (cityId: string) => void;
    currentCityId?: string;
    className?: string;
}

export default function LocationSelector({ onSelect, currentCityId, className = '' }: LocationSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Find initial region based on current city
    useEffect(() => {
        if (currentCityId) {
            const city = REGIONS.flatMap(r => r.cities).find(c => c.id === currentCityId);
            if (city) {
                const region = REGIONS.find(r => r.id === city.regionId);
                if (region) {
                    setSelectedRegion(region);
                }
            }
        } else {
            setSelectedRegion(null);
        }
    }, [currentCityId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentCity = currentCityId
        ? REGIONS.flatMap(r => r.cities).find(c => c.id === currentCityId)
        : null;

    const filteredRegions = REGIONS.filter(region =>
        region.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCities = selectedRegion
        ? getCitiesByRegion(selectedRegion.id).filter(city =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
                <span className="text-gray-700">
                    {currentCity && selectedRegion
                        ? `${currentCity.name}, ${selectedRegion.name}`
                        : "Manzilni tanlang"}
                </span>
                <svg
                    className={`w-5 h-5 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {!selectedRegion ? (
                            // Show regions
                            <div className="py-1">
                                {filteredRegions.map(region => (
                                    <button
                                        key={region.id}
                                        onClick={() => setSelectedRegion(region)}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 focus:outline-none"
                                    >
                                        {region.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // Show cities of selected region
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setSelectedRegion(null);
                                        setSearchQuery('');
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-100 focus:outline-none flex items-center"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    {selectedRegion.name}
                                </button>
                                {filteredCities.map(city => (
                                    <button
                                        key={city.id}
                                        onClick={() => {
                                            onSelect(city.id);
                                            setIsOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 focus:outline-none"
                                    >
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 