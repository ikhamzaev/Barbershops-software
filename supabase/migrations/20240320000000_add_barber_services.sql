-- Create enum for service types
CREATE TYPE service_type AS ENUM ('standard', 'custom');

-- Create table for standard services (predefined)
CREATE TABLE standard_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_duration INTEGER NOT NULL, -- in minutes
    default_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create table for barber services (both standard and custom)
CREATE TABLE barber_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    standard_service_id UUID REFERENCES standard_services(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_service_type CHECK (
        (service_type = 'standard' AND standard_service_id IS NOT NULL) OR
        (service_type = 'custom' AND standard_service_id IS NULL)
    )
);

-- Create table for appointment services (to track which services were booked)
CREATE TABLE appointment_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    barber_service_id UUID REFERENCES barber_services(id) ON DELETE RESTRICT,
    price_at_time DECIMAL(10,2) NOT NULL, -- store the price at time of booking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE standard_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Standard services are readable by everyone
CREATE POLICY "Standard services are viewable by everyone"
    ON standard_services FOR SELECT
    USING (true);

-- Only admins can modify standard services
CREATE POLICY "Only admins can modify standard services"
    ON standard_services FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM barbers WHERE is_admin = true));

-- Barber services policies
CREATE POLICY "Barber services are viewable by everyone"
    ON barber_services FOR SELECT
    USING (true);

CREATE POLICY "Barbers can manage their own services"
    ON barber_services FOR ALL
    USING (
        barber_id IN (
            SELECT id FROM barbers WHERE user_id = auth.uid()
        )
    );

-- Appointment services policies
CREATE POLICY "Appointment services are viewable by related users"
    ON appointment_services FOR SELECT
    USING (
        appointment_id IN (
            SELECT id FROM appointments 
            WHERE client_id = auth.uid() 
            OR barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Only barbers can create appointment services"
    ON appointment_services FOR INSERT
    WITH CHECK (
        appointment_id IN (
            SELECT id FROM appointments 
            WHERE barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid())
        )
    );

-- Insert some standard services
INSERT INTO standard_services (name, description, default_duration, default_price) VALUES
    ('Haircut', 'Basic haircut service', 30, 25.00),
    ('Beard Trim', 'Beard trimming and shaping', 20, 15.00),
    ('Haircut & Beard', 'Combined haircut and beard service', 45, 35.00),
    ('Hair Coloring', 'Professional hair coloring service', 60, 50.00),
    ('Hair Styling', 'Professional hair styling service', 30, 30.00);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for barber_services
CREATE TRIGGER update_barber_services_updated_at
    BEFORE UPDATE ON barber_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 