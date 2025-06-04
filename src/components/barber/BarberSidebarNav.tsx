import { FaCalendarAlt, FaUsers, FaComments, FaChartBar, FaCog, FaCut } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const navItems = [
    { key: 'calendar', label: 'Kalendar', icon: <FaCalendarAlt /> },
    { key: 'clients', label: 'Mijozlar', icon: <FaUsers /> },
    { key: 'services', label: 'Servislar', icon: <FaCut /> },
    { key: 'chat', label: 'Chat', icon: <FaComments /> },
    { key: 'analytics', label: 'Analitikalar', icon: <FaChartBar /> },
    { key: 'settings', label: 'Sozlamalar', icon: <FaCog /> },
];

export default function BarberSidebarNav({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    return (
        <aside className="hidden md:flex flex-col w-56 bg-[#18191A] min-h-screen fixed left-0 top-0 bottom-0 z-40 shadow-lg py-8 px-2">
            {navItems.map(item => (
                <button
                    key={item.key}
                    onClick={() => router.push(`/barber-dashboard/${item.key === 'calendar' ? 'calendar' : item.key}`)}
                    className={`flex items-center gap-3 w-full px-4 py-3 mb-1 rounded-lg transition-colors duration-200 text-left
                        ${activeTab === item.key
                            ? 'bg-[#23272f] text-white border-l-4 border-purple-500 font-semibold'
                            : 'text-gray-300 hover:bg-[#23272f] hover:text-white'}
                    `}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-base">{item.label}</span>
                </button>
            ))}
        </aside>
    );
} 