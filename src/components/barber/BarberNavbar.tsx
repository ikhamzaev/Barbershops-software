import React from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaCalendarAlt, FaUsers, FaUser, FaUserCircle } from 'react-icons/fa';

interface BarberNavbarProps {
    activeTab: 'dashboard' | 'calendar' | 'clients' | 'profile';
}

const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <FaUserCircle /> },
    { key: 'calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
    { key: 'clients', label: 'Clients', icon: <FaUsers /> },
    { key: 'profile', label: 'Profile', icon: <FaUser /> },
];

const BarberNavbar: React.FC<BarberNavbarProps> = ({ activeTab }) => {
    const router = useRouter();
    const handleNav = (key: string) => {
        switch (key) {
            case 'dashboard':
                router.push('/barber-dashboard');
                break;
            case 'calendar':
                router.push('/barber-dashboard/calendar');
                break;
            case 'clients':
                router.push('/barber-dashboard/clients');
                break;
            case 'profile':
                router.push('/barber-dashboard/profile');
                break;
        }
    };
    return (
        <nav className="bg-white rounded-t-2xl shadow-lg max-w-md mx-auto flex justify-between items-center px-4 py-2 mb-0 border-t border-gray-100">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => router.push(`/barber-dashboard${tab.key === 'dashboard' ? '' : '/' + tab.key}`)}
                    className={`flex flex-col items-center flex-1 py-1 px-2 rounded-xl transition-colors duration-200 ${activeTab === tab.key ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <span className="text-2xl mb-1">{tab.icon}</span>
                    <span className="text-xs font-semibold">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BarberNavbar; 