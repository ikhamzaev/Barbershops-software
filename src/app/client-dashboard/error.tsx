"use client";

export default function Error({ error }: { error: Error }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-red-500 text-xl font-bold">
            Xatolik yuz berdi: {error.message}
        </div>
    );
} 