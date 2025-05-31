'use client';

import React from 'react';
import { FaChartBar, FaCut, FaCalendarAlt, FaUsers, FaBoxOpen, FaBell, FaSignOutAlt, FaToggleOn, FaUserFriends, FaCog } from 'react-icons/fa';
import Link from 'next/link';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activePage?: string;
}

const navItems = [
    { name: 'Dashboard', icon: <FaChartBar />, href: '/barbershop-dashboard' },
    { name: 'Service', icon: <FaCut />, href: '/barbershop-dashboard/services' },
    { name: 'Barbers', icon: <FaUserFriends />, href: '/barbershop-dashboard/barbers' },
    { name: 'Availability', icon: <FaCalendarAlt />, href: '/barbershop-dashboard/availability' },
    { name: 'Products', icon: <FaBoxOpen />, href: '/barbershop-dashboard/products' },
    { name: 'Settings', icon: <FaCog />, href: '/barbershop-dashboard/settings' },
];

export default function DashboardLayout({ children, activePage }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4">
                <div className="mb-8 flex items-center gap-2">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg text-gray-700">CT</div>
                    <span className="font-bold text-xl text-gray-700 tracking-wide">CLASSIC TRIM</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {navItems.map(item => (
                        <Link href={item.href} key={item.name} legacyBehavior>
                            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition ${activePage === item.name ? 'bg-green-100 text-green-700' : ''}`}>
                                {item.icon}
                                {item.name}
                            </a>
                        </Link>
                    ))}
                </nav>
                <div className="mt-8 space-y-2">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition w-full">
                        <FaToggleOn />
                        Demo Mode
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition w-full">
                        <FaBell />
                        Booking Alerts
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-red-100 hover:text-red-700 transition w-full">
                        <FaSignOutAlt />
                        Log Out
                    </button>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
                    <div className="text-lg font-semibold text-gray-700">Dashboard</div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">JD</div>
                    </div>
                </header>
                <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
} 