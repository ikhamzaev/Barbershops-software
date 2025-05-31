"use client";
import { REGIONS, ALL_CITIES } from '@/lib/constants';

interface CitySelectorProps {
    region: string;
    city: string;
    onRegionChange: (region: string) => void;
    onCityChange: (city: string) => void;
    className?: string;
}

export default function CitySelector({
    region,
    city,
    onRegionChange,
    onCityChange,
    className = ''
}: CitySelectorProps) {
    const citiesInRegion = region
        ? ALL_CITIES.filter(cityObj => cityObj.regionId === region)
        : [];

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <label className="block text-sm font-semibold text-black mb-1">Region</label>
            <select
                value={region}
                onChange={e => {
                    onRegionChange(e.target.value);
                    onCityChange(''); // Reset city when region changes
                }}
                className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none"
            >
                <option value="">Select Region</option>
                {REGIONS.map(regionObj => (
                    <option key={regionObj.id} value={regionObj.id}>{regionObj.name}</option>
                ))}
            </select>
            <label className="block text-sm font-semibold text-black mb-1">City</label>
            <select
                value={city}
                onChange={e => onCityChange(e.target.value)}
                className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-white text-black text-base focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none"
                disabled={!region}
            >
                <option value="">{region ? 'Select City' : 'Select a region first'}</option>
                {citiesInRegion.map(cityObj => (
                    <option key={cityObj.id} value={cityObj.name}>{cityObj.name}</option>
                ))}
            </select>
        </div>
    );
} 