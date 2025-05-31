"use client";

import { useState, useEffect } from "react";
import BarberSidebarNav from "@/components/barber/BarberSidebarNav";
import BarberBottomNav from "@/components/barber/BarberBottomNav";
import { FaEdit, FaSave, FaTimes, FaCamera } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function BarberSettingsPage() {
    const [profile, setProfile] = useState({
        name: "Your Name",
        bio: "Short bio about yourself...",
        photo: "",
        email: "",
    });
    const [editing, setEditing] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState("");
    const [workingHours, setWorkingHours] = useState(
        DAYS.map((day) => ({
            day,
            enabled: day !== "Sunday",
            start: "09:00",
            end: "20:00",
        }))
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [barberId, setBarberId] = useState<string | null>(null);

    // Fetch barber ID and availability on mount
    useEffect(() => {
        async function fetchBarberAndAvailability() {
            setLoading(true);
            setError(null);
            // 1. Get current user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                setError("Could not get user");
                setLoading(false);
                return;
            }
            // 2. Get barber record for this user (fetch name, bio, photo, email)
            const { data: barberData, error: barberError } = await supabase
                .from("barbers")
                .select("id, name, bio, photo_url, email")
                .eq("user_id", userData.user.id)
                .single();
            // 3. Get user record from users table (for email, name, photo fallback)
            const { data: userRow, error: userRowError } = await supabase
                .from("users")
                .select("id, name, email, photo")
                .eq("id", userData.user.id)
                .single();
            // 4. Merge data: prefer barbers, fallback to users
            setBarberId(barberData?.id || null);
            setProfile({
                name: barberData?.name || userRow?.name || "Your Name",
                bio: barberData?.bio || "Short bio about yourself...",
                photo: barberData?.photo_url || userRow?.photo || "",
                email: barberData?.email || userRow?.email || userData.user.email || "",
            });
            // 5. Get availability for this barber (if barberData exists)
            if (barberData?.id) {
                const { data: availData, error: availError } = await supabase
                    .from("barber_availability")
                    .select("*")
                    .eq("barber_id", barberData.id);
                if (!availError) {
                    setWorkingHours(
                        DAYS.map((day) => {
                            const found = availData.find((a: any) => a.day_of_week === day);
                            return found
                                ? {
                                    day,
                                    enabled: found.enabled,
                                    start: found.start_time || "09:00",
                                    end: found.end_time || "20:00",
                                }
                                : { day, enabled: false, start: "09:00", end: "20:00" };
                        })
                    );
                }
            }
            setLoading(false);
        }
        fetchBarberAndAvailability();
    }, []);

    // Save working hours to Supabase
    const handleSaveWorkingHours = async () => {
        if (!barberId) return;
        setLoading(true);
        setError(null);
        // Upsert each day's availability
        const upserts = workingHours.map((d) => ({
            barber_id: barberId,
            day_of_week: d.day,
            enabled: d.enabled,
            start_time: d.start,
            end_time: d.end,
        }));
        const { error: upsertError } = await supabase
            .from("barber_availability")
            .upsert(upserts, { onConflict: "barber_id,day_of_week" });
        if (upsertError) setError("Could not save availability");
        setLoading(false);
    };

    // Handlers for profile editing (mocked for now)
    const handleEdit = (field: string) => {
        setEditing(field);
        setTempValue(profile[field as keyof typeof profile] as string);
    };
    const handleSave = (field: string) => {
        setProfile({ ...profile, [field]: tempValue });
        setEditing(null);
    };
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!barberId || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${barberId}.${fileExt}`;
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });
        if (uploadError) {
            setError('Failed to upload image');
            return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const publicUrl = publicUrlData.publicUrl;
        // Save public URL to barbers table
        const { error: updateError } = await supabase
            .from('barbers')
            .update({ photo_url: publicUrl })
            .eq('id', barberId);
        if (updateError) {
            setError('Failed to save image URL');
            return;
        }
        setProfile((prev) => ({ ...prev, photo: publicUrl }));
    };

    // Handlers for working hours
    const handleDayToggle = (idx: number) => {
        setWorkingHours((prev) =>
            prev.map((d, i) => (i === idx ? { ...d, enabled: !d.enabled } : d))
        );
    };
    const handleTimeChange = (idx: number, field: "start" | "end", value: string) => {
        setWorkingHours((prev) =>
            prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            <BarberSidebarNav activeTab="settings" />
            <div className="flex-1 flex flex-col h-screen md:ml-[5rem] ml-0 w-full bg-white">
                <div className="w-full max-w-2xl mx-auto py-10 px-2 md:px-4 pb-40 md:pb-24">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Barber Settings</h1>
                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    {/* Profile Section */}
                    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8 border border-gray-200 w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-4">
                            <div className="relative">
                                <img
                                    src={profile.photo || "/avatars/default-barber.png"}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-400"
                                />
                                <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                                    <FaCamera className="text-white text-sm" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <div className="flex-1 w-full">
                                {editing === "name" ? (
                                    <div className="flex gap-2 items-center w-full">
                                        <input
                                            type="text"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            className="rounded-md border-gray-300 bg-white text-gray-900 px-3 py-2 focus:ring-2 focus:ring-purple-600 w-full"
                                        />
                                        <button onClick={() => handleSave("name")} className="text-green-500"><FaSave /></button>
                                        <button onClick={() => setEditing(null)} className="text-gray-400"><FaTimes /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center w-full">
                                        <span className="text-gray-900 font-semibold text-lg">{profile.name}</span>
                                        <button onClick={() => handleEdit("name")} className="text-gray-400"><FaEdit /></button>
                                    </div>
                                )}
                                {editing === "bio" ? (
                                    <div className="flex gap-2 items-center mt-2 w-full">
                                        <input
                                            type="text"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            className="rounded-md border-gray-300 bg-white text-gray-900 px-3 py-2 focus:ring-2 focus:ring-purple-600 w-full"
                                        />
                                        <button onClick={() => handleSave("bio")} className="text-green-500"><FaSave /></button>
                                        <button onClick={() => setEditing(null)} className="text-gray-400"><FaTimes /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center mt-2 w-full">
                                        <span className="text-gray-500 text-sm">{profile.bio}</span>
                                        <button onClick={() => handleEdit("bio")} className="text-gray-400"><FaEdit /></button>
                                    </div>
                                )}
                                {editing === "email" ? (
                                    <div className="flex gap-2 items-center mt-2 w-full">
                                        <input
                                            type="text"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            className="rounded-md border-gray-300 bg-white text-gray-900 px-3 py-2 focus:ring-2 focus:ring-purple-600 w-full"
                                        />
                                        <button onClick={() => handleSave("email")} className="text-green-500"><FaSave /></button>
                                        <button onClick={() => setEditing(null)} className="text-gray-400"><FaTimes /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center mt-2 w-full">
                                        <span className="text-gray-500 text-sm">{profile.email}</span>
                                        <button onClick={() => handleEdit("email")} className="text-gray-400"><FaEdit /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Working Hours Section */}
                    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8 border border-gray-200 w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h2>
                        {loading ? (
                            <div className="text-center text-gray-400">Loading...</div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {workingHours.map((d, idx) => (
                                        <div key={d.day} className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full">
                                            <label className="flex items-center gap-2 cursor-pointer w-full md:w-auto">
                                                <input
                                                    type="checkbox"
                                                    checked={d.enabled}
                                                    onChange={() => handleDayToggle(idx)}
                                                    className="form-checkbox h-5 w-5 text-purple-600"
                                                />
                                                <span className="text-gray-900 w-24">{d.day}</span>
                                            </label>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <input
                                                    type="time"
                                                    value={d.start}
                                                    disabled={!d.enabled}
                                                    onChange={(e) => handleTimeChange(idx, "start", e.target.value)}
                                                    className="rounded-md border-gray-300 bg-white text-gray-900 px-2 py-1 focus:ring-2 focus:ring-purple-600 disabled:opacity-50 w-full md:w-auto"
                                                />
                                                <span className="text-gray-500">to</span>
                                                <input
                                                    type="time"
                                                    value={d.end}
                                                    disabled={!d.enabled}
                                                    onChange={(e) => handleTimeChange(idx, "end", e.target.value)}
                                                    className="rounded-md border-gray-300 bg-white text-gray-900 px-2 py-1 focus:ring-2 focus:ring-purple-600 disabled:opacity-50 w-full md:w-auto"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSaveWorkingHours}
                                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition w-full md:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Working Hours"}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Placeholders for more settings */}
                    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8 border border-gray-200 w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Other Settings (Coming Soon)</h2>
                        <ul className="text-gray-500 list-disc pl-6 space-y-2">
                            <li>Service List (add/edit services you offer)</li>
                            <li>Gallery (upload your work/portfolio images)</li>
                            <li>Notifications (booking alerts, etc.)</li>
                            <li>Vacation Mode (set yourself unavailable for a period)</li>
                            <li>Change Password</li>
                        </ul>
                    </div>
                </div>
                {/* Bottom nav for mobile (unchanged) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
                    <BarberBottomNav activeTab="settings" />
                </div>
            </div>
            {/* Bottom nav for desktop (unchanged) */}
            <div className="hidden md:block">
                <BarberBottomNav activeTab="settings" />
            </div>
        </div>
    );
} 