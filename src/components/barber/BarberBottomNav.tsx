import { FaCalendarAlt, FaUsers, FaComments, FaChartBar, FaCog, FaCut } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const navItems = [
    { key: 'calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
    { key: 'clients', label: 'Clients', icon: <FaUsers /> },
    { key: 'services', label: 'Services', icon: <FaCut /> },
    { key: 'chat', label: 'Chat', icon: <FaComments /> },
    { key: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
    { key: 'settings', label: 'Settings', icon: <FaCog /> },
];

export default function BarberBottomNav({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex md:hidden justify-between items-center px-2 py-2">
            {navItems.map(item => (
                <button
                    key={item.key}
                    onClick={() => router.push(`/barber-dashboard/${item.key === 'calendar' ? 'calendar' : item.key}`)}
                    className={`flex flex-col items-center flex-1 py-1 px-2 rounded-xl transition-colors duration-200 ${activeTab === item.key ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                </button>
            ))}
        </nav>
    );
} 