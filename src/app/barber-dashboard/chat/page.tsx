"use client";
import { useState } from 'react';
import BarberSidebarNav from '@/components/barber/BarberSidebarNav';
import BarberBottomNav from '@/components/barber/BarberBottomNav';

const mockChats = [
    {
        id: 1,
        client: {
            name: 'Jasur aka (Uncle Barbers)',
            avatar: '/avatars/jasur.jpg',
            appointed: true,
        },
        lastMessage: 'Yangi vaqtni tanlang, iltimos.',
        lastTime: '14:02',
        messages: [
            { from: 'client', text: 'Salom! Qanday yordam bera olaman?', time: '13:59' },
            { from: 'barber', text: "Assalomu alaykum, bugun soat 15:00 bo'sh joy bormi?", time: '14:00' },
            { from: 'client', text: "Ha, bo'sh. Yangi vaqtni tanlang, iltimos.", time: '14:02' },
        ],
        nextAppointment: 'Today, 15:00',
    },
    {
        id: 2,
        client: {
            name: 'Azizbek (Baraka)',
            avatar: '/avatars/azizbek.jpg',
            appointed: false,
        },
        lastMessage: 'Rahmat! Sizni kutamiz.',
        lastTime: '13:20',
        messages: [
            { from: 'barber', text: 'Salom! Qanday yordam bera olaman?', time: '13:10' },
            { from: 'client', text: 'Rahmat! Sizni kutamiz.', time: '13:20' },
        ],
        nextAppointment: null,
    },
];

export default function ChatPage() {
    const [search, setSearch] = useState('');
    const [selectedChatId, setSelectedChatId] = useState<number>(mockChats[0].id);
    const [input, setInput] = useState('');
    const selectedChat = mockChats.find(c => c.id === selectedChatId)!;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <BarberSidebarNav activeTab="chat" />
            {/* Chat List */}
            <div className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 h-screen z-10 shadow-lg" style={{ marginLeft: '5rem' }}>
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Chatlarni qidiring..."
                        className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {mockChats.filter(c => c.client.name.toLowerCase().includes(search.toLowerCase())).map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 transition ${selectedChatId === chat.id ? 'bg-gray-50 border-l-4 border-purple-500' : 'hover:bg-gray-100'}`}
                        >
                            <img src={chat.client.avatar} alt={chat.client.name} className="h-10 w-10 rounded-full object-cover border-2 border-purple-400" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{chat.client.name} {chat.client.appointed && <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full align-middle">Appointed</span>}</div>
                                <div className="text-gray-500 text-xs truncate">{chat.lastMessage}</div>
                            </div>
                            <div className="text-xs text-gray-400 font-semibold ml-2 whitespace-nowrap">{chat.lastTime}</div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Chat Window */}
            <div className="flex-1 flex flex-col h-screen bg-gray-50 relative md:ml-[5rem] ml-0 w-full">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white fixed md:static top-0 left-0 right-0 z-30 w-full">
                    <img src={selectedChat.client.avatar} alt={selectedChat.client.name} className="h-12 w-12 rounded-full object-cover border-2 border-purple-400" />
                    <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{selectedChat.client.name}</div>
                        {selectedChat.client.appointed ? (
                            <div className="text-xs text-purple-500 font-semibold">Appointed Client • Next: {selectedChat.nextAppointment}</div>
                        ) : (
                            <div className="text-xs text-gray-400">General Inquiry</div>
                        )}
                    </div>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-2 md:px-6 pt-24 md:pt-6 pb-40 md:pb-6 flex flex-col gap-2 md:gap-4 bg-gray-50" style={{ minHeight: 0 }}>
                    {selectedChat.messages.map((msg, i) => (
                        <div key={i} className={`flex w-full ${msg.from === 'barber' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`break-words max-w-[90vw] md:max-w-xl px-4 py-2 rounded-2xl shadow text-base md:text-sm ${msg.from === 'barber' ? 'bg-purple-500 text-white self-end' : 'bg-white text-gray-900 self-start'} flex flex-col`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <span className="whitespace-pre-line break-words">{msg.text}</span>
                                <span className="text-xs text-gray-400 mt-1 self-end">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Input */}
                <form className="flex items-center gap-2 px-2 md:px-6 py-3 border-t border-gray-200 bg-white fixed md:absolute bottom-16 md:bottom-0 left-0 right-0 z-40 w-full" style={{ minHeight: 64 }} onSubmit={e => { e.preventDefault(); setInput(''); }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Xabar yozing..."
                        className="flex-1 px-4 py-3 rounded-full bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-full shadow transition">Yuborish</button>
                </form>
                {/* Bottom nav for mobile (unchanged) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
                    <BarberBottomNav activeTab="chat" />
                </div>
            </div>
            {/* Bottom nav for desktop (unchanged) */}
            <div className="hidden md:block">
                <BarberBottomNav activeTab="chat" />
            </div>
        </div>
    );
} 