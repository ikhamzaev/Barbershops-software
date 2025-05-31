export type ServiceType = 'standard' | 'custom';

export interface StandardService {
    id: string;
    name: string;
    description: string | null;
    default_duration: number;
    default_price: number;
    created_at: string;
}

export interface BarberService {
    id: string;
    barber_id: string;
    service_type: ServiceType;
    standard_service_id: string | null;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    standard_service?: StandardService;
}

export interface AppointmentService {
    id: string;
    appointment_id: string;
    barber_service_id: string;
    price_at_time: number;
    created_at: string;
    barber_service?: BarberService;
}

export interface Appointment {
    services?: AppointmentService[];
} 