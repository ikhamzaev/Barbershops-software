import React from 'react';

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: 'booked' | 'completed' | 'cancelled';
    client?: {
        id: string;
        name: string;
        phone: string;
    };
    appointment_services?: {
        id: string;
        price_at_time: number;
        barber_service: {
            id: string;
            name: string;
            duration: number;
        };
    }[];
}

const statusColors: Record<string, string> = {
    booked: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const AppointmentsList: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    if (!appointments.length) {
        return (
            <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
                No appointments scheduled for today
            </div>
        );
    }
    return (
        <div className="space-y-4">
            {appointments.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
                    <div>
                        <div className="text-gray-900 font-medium">{a.client?.name || 'Unknown Client'}</div>
                        <div className="text-gray-500 text-sm">
                            {a.appointment_services?.map(service => service.barber_service.name).join(', ') || 'No service selected'}
                        </div>
                        {a.client?.phone && (
                            <div className="text-gray-500 text-xs">{a.client.phone}</div>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 mb-1">
                            {a.appointment_time}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[a.status]}`}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppointmentsList; 