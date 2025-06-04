"use client";
import { useState } from "react";
import { FiBarChart2, FiScissors, FiUser, FiTrendingUp, FiArrowLeft } from "react-icons/fi";
import BarberSidebarNav from '@/components/barber/BarberSidebarNav';
import BarberBottomNav from '@/components/barber/BarberBottomNav';
import { useRouter } from 'next/navigation';

// Dummy data for now
const summary = {
    revenue: 4200000, // so'm
    appointments: 86,
    avgPerAppointment: 48837,
};

// Helper for Uzbek month abbreviations
const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function getNiceMax(value: number, step: number) {
    return Math.ceil(value / step) * step;
}

function getNiceMin(value: number, step: number) {
    return Math.floor(value / step) * step;
}

const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
        date: d,
        revenue: 120000 + Math.floor(Math.random() * 400000),
        appointments: 4 + Math.floor(Math.random() * 8),
    };
});

const rawMaxRevenue = Math.max(...last14Days.map(d => d.revenue));
const revenueStep = 100000;
const minRevenue = 0;
const maxRevenue = getNiceMax(rawMaxRevenue, revenueStep);
const revenueTicks = 5;
const revenueTickValues = Array.from({ length: revenueTicks + 1 }, (_, i) => Math.round((maxRevenue * i) / revenueTicks));

const rawMaxAppointments = Math.max(...last14Days.map(d => d.appointments));
const appointmentsStep = 2;
const minAppointments = 0;
const maxAppointments = getNiceMax(rawMaxAppointments, appointmentsStep);
const appointmentsTicks = 5;
const appointmentsTickValues = Array.from({ length: appointmentsTicks + 1 }, (_, i) => Math.round((maxAppointments * i) / appointmentsTicks));

const topServices = [
    { name: "Soch olish", count: 38 },
    { name: "Soqol olish", count: 22 },
    { name: "Qirqish", count: 14 },
    { name: "Styling", count: 7 },
];
const busiestDay = last14Days.reduce((prev, curr) => (curr.appointments > prev.appointments ? curr : prev), last14Days[0]);
const busiestHour = "16:00-17:00";

export default function BarberAnalyticsPage() {
    const [selectedMonth, setSelectedMonth] = useState("Iyun");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar for desktop */}
            <BarberSidebarNav activeTab="analytics" />
            {/* Bottom nav for mobile */}
            <BarberBottomNav activeTab="analytics" />
            {/* Main content */}
            <div className="md:ml-56 pb-20">
                {/* Back button for mobile */}
                <button
                    className="md:hidden flex items-center gap-2 mt-4 ml-2 text-gray-600 hover:text-purple-600 text-base font-medium"
                    onClick={() => router.push('/barber-dashboard/calendar')}
                >
                    <FiArrowLeft className="text-lg" /> Asosiyga qaytish
                </button>
                {/* Summary KPIs */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 sm:px-4 md:px-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FiBarChart2 className="text-blue-500" /> Analitika
                        </h1>
                        <div className="text-gray-500 mt-1 text-sm">{selectedMonth} oyi uchun umumiy ko'rsatkichlar</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                        >
                            <option>Yanvar</option>
                            <option>Fevral</option>
                            <option>Mart</option>
                            <option>Aprel</option>
                            <option>May</option>
                            <option>Iyun</option>
                            <option>Iyul</option>
                            <option>Avgust</option>
                            <option>Sentyabr</option>
                            <option>Oktyabr</option>
                            <option>Noyabr</option>
                            <option>Dekabr</option>
                        </select>
                        <span className="text-gray-400">📅</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 px-2 sm:px-4 md:px-0">
                    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold text-green-500">{summary.revenue.toLocaleString()} so'm</span>
                        <span className="text-gray-500 mt-1 text-sm">Umumiy daromad</span>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold text-blue-500">{summary.appointments}</span>
                        <span className="text-gray-500 mt-1 text-sm">Umumiy bronlar</span>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold text-purple-500">{summary.avgPerAppointment.toLocaleString()} so'm</span>
                        <span className="text-gray-500 mt-1 text-sm">O'rtacha bron uchun</span>
                    </div>
                </div>
                {/* Revenue Bar Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-10 overflow-x-auto">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">So'nggi 14 kunlik daromad</h2>
                    <div className="w-[600px] sm:w-full h-64 flex items-end relative">
                        {/* Y-axis line */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between h-full z-10">
                            {revenueTickValues.slice().reverse().map((val, i) => (
                                <span key={i} className="text-xs text-gray-400" style={{ height: '32px' }}>
                                    {val.toLocaleString()} so'm
                                </span>
                            ))}
                        </div>
                        <svg viewBox="0 0 900 220" className="w-full h-full ml-12">
                            {/* Y-axis line */}
                            <line x1="0" y1="0" x2="0" y2="200" stroke="#e5e7eb" strokeWidth="2" />
                            {/* Horizontal grid lines and Y-axis labels (bottom to top, increasing) */}
                            {revenueTickValues.map((val, i) => {
                                const y = 200 - (val / maxRevenue) * 170;
                                return (
                                    <g key={val}>
                                        <line x1="0" y1={y} x2="880" y2={y} stroke="#e5e7eb" strokeDasharray="4 2" />
                                        <text x="-10" y={y + 4} textAnchor="end" fontSize="0.85em" fill="#a3a3a3">{val.toLocaleString()} so'm</text>
                                    </g>
                                );
                            })}
                            {/* Bars and value labels */}
                            {last14Days.map((d, i) => {
                                const day = d.date.getDate();
                                const month = uzMonths[d.date.getMonth()];
                                const barWidth = 44;
                                const barSpacing = 20;
                                const x = 20 + i * (barWidth + barSpacing);
                                const barHeight = (d.revenue / maxRevenue) * 170;
                                return (
                                    <g key={i}>
                                        <rect
                                            x={x}
                                            y={200 - barHeight}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={d.revenue === rawMaxRevenue ? "#22d3ee" : "#3b82f6"}
                                            rx="6"
                                        />
                                        {/* Value label above bar */}
                                        <text
                                            x={x + barWidth / 2}
                                            y={200 - barHeight - 10}
                                            textAnchor="middle"
                                            fontSize="0.9em"
                                            fill="#374151"
                                            fontWeight="bold"
                                        >
                                            {d.revenue.toLocaleString()}
                                        </text>
                                        {/* Date label below bar */}
                                        <text
                                            x={x + barWidth / 2}
                                            y={210}
                                            textAnchor="middle"
                                            fontSize="0.9em"
                                            fill="#6b7280"
                                        >
                                            {day} {month}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="flex justify-end text-xs text-gray-400 mt-2">
                        <span>Eng yuqori kun: {last14Days.find(d => d.revenue === rawMaxRevenue)?.date.toLocaleDateString('uz-UZ')}</span>
                    </div>
                </div>
                {/* Appointments Bar Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-10 overflow-x-auto">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">So'nggi 14 kunlik bronlar</h2>
                    <div className="w-[600px] sm:w-full h-64 flex items-end relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between h-full z-10">
                            {appointmentsTickValues.slice().reverse().map((val, i) => (
                                <span key={i} className="text-xs text-gray-400" style={{ height: '32px' }}>
                                    {val} ta
                                </span>
                            ))}
                        </div>
                        <svg viewBox="0 0 900 220" className="w-full h-full ml-12">
                            {/* Y-axis line */}
                            <line x1="0" y1="0" x2="0" y2="200" stroke="#e5e7eb" strokeWidth="2" />
                            {/* Horizontal grid lines and Y-axis labels (bottom to top, increasing) */}
                            {appointmentsTickValues.map((val, i) => {
                                const y = 200 - (val / maxAppointments) * 170;
                                return (
                                    <g key={val}>
                                        <line x1="0" y1={y} x2="880" y2={y} stroke="#e5e7eb" strokeDasharray="4 2" />
                                        <text x="-10" y={y + 4} textAnchor="end" fontSize="0.85em" fill="#a3a3a3">{val} ta</text>
                                    </g>
                                );
                            })}
                            {/* Bars and value labels */}
                            {last14Days.map((d, i) => {
                                const day = d.date.getDate();
                                const month = uzMonths[d.date.getMonth()];
                                const barWidth = 44;
                                const barSpacing = 20;
                                const x = 20 + i * (barWidth + barSpacing);
                                const barHeight = (d.appointments / maxAppointments) * 170;
                                return (
                                    <g key={i}>
                                        <rect
                                            x={x}
                                            y={200 - barHeight}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={d.appointments === rawMaxAppointments ? "#f472b6" : "#6366f1"}
                                            rx="6"
                                        />
                                        {/* Value label above bar */}
                                        <text
                                            x={x + barWidth / 2}
                                            y={200 - barHeight - 10}
                                            textAnchor="middle"
                                            fontSize="0.9em"
                                            fill="#374151"
                                            fontWeight="bold"
                                        >
                                            {d.appointments}
                                        </text>
                                        {/* Date label below bar */}
                                        <text
                                            x={x + barWidth / 2}
                                            y={210}
                                            textAnchor="middle"
                                            fontSize="0.9em"
                                            fill="#6b7280"
                                        >
                                            {day} {month}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="flex justify-end text-xs text-gray-400 mt-2">
                        <span>Eng band kun: {busiestDay.date.toLocaleDateString('uz-UZ')} ({busiestDay.appointments} ta bron)</span>
                    </div>
                </div>
                {/* Top Services */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-10">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Eng ko'p buyurtma qilingan xizmatlar</h2>
                    <div className="space-y-3">
                        {topServices.map((s, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="w-40 flex items-center">
                                    <span className="text-xl text-blue-400 mr-2">
                                        {s.name === "Soch olish" ? <FiScissors /> : s.name === "Soqol olish" ? <FiUser /> : <FiTrendingUp />}
                                    </span>
                                    <span className="text-gray-700">{s.name}</span>
                                </div>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full w-full max-w-xs">
                                    <div
                                        className="h-3 rounded-full bg-blue-400"
                                        style={{ width: `${(s.count / topServices[0].count) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="ml-4 font-bold text-gray-900">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Insights Section */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center justify-between mb-10">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500">Eng band kun (so'nggi 2 hafta):</span>
                        <span className="font-bold text-blue-500 text-lg mt-1">{busiestDay.date.toLocaleDateString('uz-UZ')}</span>
                        <span className="text-sm text-gray-400">{busiestDay.appointments} ta bron</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500">Eng faol soat:</span>
                        <span className="font-bold text-purple-500 text-lg mt-1">{busiestHour}</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 