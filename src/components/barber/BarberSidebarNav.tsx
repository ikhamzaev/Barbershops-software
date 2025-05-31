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

export default function BarberSidebarNav({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    return (
        <aside className="hidden md:flex flex-col w-20 bg-[#23283a]/95 border-r border-gray-900 py-6 items-center gap-6 fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 shadow-xl">
            {navItems.map(item => (
                <button
                    key={item.key}
                    onClick={() => router.push(`/barber-dashboard/${item.key === 'calendar' ? 'calendar' : item.key}`)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors duration-200 ${activeTab === item.key ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                </button>
            ))}
        </aside>
    );
} 