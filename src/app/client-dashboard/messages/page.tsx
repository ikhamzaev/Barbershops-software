"use client";
import { useState } from "react";
import { FiSend, FiUser, FiSearch } from "react-icons/fi";

const mockChats = [
    {
        id: 1,
        name: "Jasur aka (Uncle Barbers)",
        avatar: "/images/barber-jasur.jpg",
        lastMessage: "Yangi vaqtni tanlang, iltimos.",
        lastTime: "14:02",
        messages: [
            { fromMe: false, text: "Salom! Qanday yordam bera olaman?", time: "13:59" },
            { fromMe: true, text: "Assalomu alaykum, bugun soat 15:00 bo'sh joy bormi?", time: "14:00" },
            { fromMe: false, text: "Ha, bo'sh. Yangi vaqtni tanlang, iltimos.", time: "14:02" },
        ],
    },
    {
        id: 2,
        name: "Azizbek (Baraka Sartaroshxona)",
        avatar: "/images/barber-azizbek.jpg",
        lastMessage: "Rahmat! Sizni kutamiz.",
        lastTime: "13:20",
        messages: [
            { fromMe: true, text: "Rahmat!", time: "13:20" },
            { fromMe: false, text: "Buyurtmangiz tasdiqlandi.", time: "13:19" },
        ],
    },
];

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(mockChats[0]);
    const [input, setInput] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        // In real app, send message to backend here
        setSelectedChat((prev) => ({
            ...prev,
            messages: [...prev.messages, { fromMe: true, text: input, time: "14:10" }],
        }));
        setInput("");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar: Chats List */}
            <aside className="hidden md:flex w-1/3 bg-white border-r border-gray-200 flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <FiSearch className="text-gray-400 text-lg inline-block mr-2" />
                    <input
                        type="text"
                        placeholder="Chatlarni qidiring..."
                        className="bg-transparent outline-none text-gray-700 placeholder-gray-400 flex-1"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {mockChats.map((chat) => (
                        <button
                            key={chat.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left ${selectedChat.id === chat.id ? "bg-gray-100" : ""}`}
                            onClick={() => setSelectedChat(chat)}
                        >
                            <img
                                src={chat.avatar}
                                alt={chat.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                                onError={(e) => (e.currentTarget.src = "https://randomuser.me/api/portraits/men/32.jpg")}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-gray-900 font-semibold truncate">{chat.name}</div>
                                <div className="text-gray-500 text-xs truncate">{chat.lastMessage}</div>
                            </div>
                            <div className="text-gray-400 text-xs ml-2">{chat.lastTime}</div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-gray-50 relative">
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white fixed md:static top-0 left-0 right-0 z-20 w-full">
                    <img
                        src={selectedChat.avatar}
                        alt={selectedChat.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                        onError={(e) => (e.currentTarget.src = "https://randomuser.me/api/portraits/men/32.jpg")}
                    />
                    <div className="text-gray-900 font-semibold text-lg">{selectedChat.name}</div>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-2 md:px-6 pt-20 md:pt-6 pb-32 md:pb-6 flex flex-col gap-2 md:gap-4 bg-gray-50" style={{ minHeight: 0 }}>
                    {selectedChat.messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex w-full ${msg.fromMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`break-words max-w-[90vw] md:max-w-xl px-4 py-2 rounded-2xl shadow text-base md:text-sm
                  ${msg.fromMe
                                        ? "bg-purple-600 text-white rounded-br-3xl"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-3xl"}
                  ${msg.fromMe ? "ml-8" : "mr-8"}
                `}
                            >
                                <span className="whitespace-pre-line break-words">{msg.text}</span>
                                <div className="text-xs text-gray-400 mt-1 text-right">{msg.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Message Input */}
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 px-2 md:px-6 py-3 border-t border-gray-200 bg-white fixed bottom-16 md:bottom-0 left-0 right-0 z-30 w-full"
                    style={{ minHeight: 64 }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Xabar yozing..."
                        className="flex-1 px-4 py-3 rounded-full bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-full shadow transition"
                    >
                        Yuborish
                    </button>
                </form>
                {/* Bottom nav for mobile (unchanged) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
                    {/* You may need to import and use your BottomNav here if you have one for clients */}
                </div>
            </main>
        </div>
    );
} 