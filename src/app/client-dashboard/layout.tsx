"use client";
import Link from "next/link";
import { FiHome, FiCalendar, FiHeart, FiGrid, FiMessageCircle } from "react-icons/fi";
import { usePathname } from "next/navigation";

const navItems = [
    {
        href: "/client-dashboard",
        icon: FiHome,
        label: "Bosh sahifa",
        match: (pathname: string) => pathname === "/client-dashboard" || pathname === "/client-dashboard/",
        activeClass: "text-purple-500",
    },
    {
        href: "/client-dashboard/appointments",
        icon: FiCalendar,
        label: "Uchrashuvlar",
        match: (pathname: string) => pathname.startsWith("/client-dashboard/appointments"),
        activeClass: "text-purple-500",
    },
    {
        href: "/client-dashboard/favorites",
        icon: FiHeart,
        label: "Sevimlilar",
        match: (pathname: string) => pathname.startsWith("/client-dashboard/favorites"),
        activeClass: "text-pink-400",
    },
    {
        href: null,
        icon: FiGrid,
        label: "Ilovalar",
        match: () => false,
        activeClass: "text-purple-500",
    },
    {
        href: "/client-dashboard/messages",
        icon: FiMessageCircle,
        label: "Xabarlar",
        match: (pathname: string) => pathname.startsWith("/client-dashboard/messages"),
        activeClass: "text-purple-500",
    },
];

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen flex flex-col bg-white pb-20">
            <div className="flex-1 w-full">{children}</div>
            <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50 shadow">
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    return item.href ? (
                        <Link href={item.href} key={item.label}>
                            <button
                                className={`flex flex-col items-center transition-colors duration-150
                  ${item.match(pathname) ? item.activeClass : "text-gray-400 hover:text-purple-400"}`}
                            >
                                <Icon className="text-2xl" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </button>
                        </Link>
                    ) : (
                        <button
                            key={item.label}
                            className="flex flex-col items-center text-gray-400 hover:text-purple-400"
                            disabled
                        >
                            <Icon className="text-2xl" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
} 