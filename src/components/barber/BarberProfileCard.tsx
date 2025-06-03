import React from 'react';

interface BarberProfileCardProps {
    barber: {
        name: string;
        email: string;
        photo_url?: string;
    } | null;
}

const BarberProfileCard: React.FC<BarberProfileCardProps> = ({ barber }) => {
    if (!barber) return null;
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {barber.photo_url ? (
                    <img src={barber.photo_url} alt={barber.name} className="h-16 w-16 object-cover" />
                ) : (
                    <span className="text-2xl text-gray-400 font-bold">{barber.name[0]}</span>
                )}
            </div>
            <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900">{barber.name}</div>
                <div className="text-gray-500 text-sm">{barber.email}</div>
            </div>
        </div>
    );
};

export default BarberProfileCard; 