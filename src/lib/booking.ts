import { supabase } from './supabaseClient';

export interface BookingSlot {
    start_time: string;
    end_time: string;
    barber_id: string;
    barbershop_id: string;
    service_id?: string | null;
    notes?: string | null;
}

export interface Appointment {
    id: string;
    barber_id: string;
    client_id: string;
    barbershop_id: string;
    service_id?: string | null;
    appointment_date: string;
    appointment_time: string;
    status: 'booked' | 'completed' | 'cancelled';
    notes?: string | null;
    created_at: string;
    barbers?: {
        id: string;
        name: string;
        photo_url: string;
    };
    barbershops?: {
        id: string;
        name: string;
        address: string;
    };
    services?: {
        id: string;
        name: string;
        price: number;
    };
    client?: {
        id: string;
        name: string;
        phone: string;
    };
}

export async function bookAppointment(slot: BookingSlot, clientId: string): Promise<Appointment> {
    const appointmentDate = new Date(slot.start_time).toISOString().split('T')[0];
    const appointmentTime = new Date(slot.start_time).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });

    // Fetch client name and email from users table
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', clientId)
        .single();
    if (userError || !user) {
        throw new Error('Could not fetch client info');
    }

    console.log('Booking appointment:', {
        date: appointmentDate,
        time: appointmentTime,
        barberId: slot.barber_id,
        clientId: clientId,
        clientName: user.name,
        clientEmail: user.email
    });

    const { data, error } = await supabase
        .from('appointments')
        .insert([
            {
                barber_id: slot.barber_id,
                client_id: clientId,
                client_name: user.name,
                client_email: user.email,
                barbershop_id: slot.barbershop_id,
                service_id: slot.service_id || null,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                status: 'booked',
                notes: slot.notes || null
            }
        ])
        .select(`
            *,
            barbers:barber_id (
                id,
                name,
                photo_url
            ),
            barbershops:barbershop_id (
                id,
                name,
                address
            ),
            services:service_id (
                id,
                name,
                price
            )
        `)
        .single();

    if (error) {
        console.error('Supabase error:', error);
        throw error;
    }
    return data;
}

export async function getAppointmentsByBarber(barberId: string, date: string): Promise<Appointment[]> {
    console.log('Fetching appointments for barber:', barberId, 'on date:', date);

    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            barbers:barber_id (
                id,
                name,
                photo_url
            ),
            barbershops:barbershop_id (
                id,
                name,
                address
            ),
            client:client_id (
                id,
                name,
                phone
            )
        `)
        .eq('barber_id', barberId)
        .eq('appointment_date', date)
        .order('appointment_time');

    if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }

    console.log('Fetched appointments:', data);
    return data || [];
}

export async function getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            services,
            barbers:barber_id (
                id,
                name,
                photo_url
            ),
            barbershops:barbershop_id (
                id,
                name,
                address
            )
        `)
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

    if (error) throw error;
    return data;
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
    const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

    if (error) throw error;
}

export function subscribeToAppointments(
    barberId: string,
    onAppointmentChange: (appointment: Appointment) => void
) {
    const channel = supabase
        .channel('appointments')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'appointments',
                filter: `barber_id=eq.${barberId}`
            },
            (payload) => {
                onAppointmentChange(payload.new as Appointment);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
} 