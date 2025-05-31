-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create barber_service_assignments table
CREATE TABLE IF NOT EXISTS barber_service_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    custom_price INTEGER, -- Optional custom price for this barber
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(barber_id, service_id)
);

-- Add RLS policies for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owners can manage their services"
    ON services FOR ALL
    USING (barbershop_id IN (
        SELECT id FROM barbershops WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Anyone can view active services"
    ON services FOR SELECT
    USING (is_active = true);

-- Add RLS policies for barber_service_assignments
ALTER TABLE barber_service_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can view their own service assignments"
    ON barber_service_assignments FOR SELECT
    USING (barber_id IN (
        SELECT id FROM barbers WHERE user_id = auth.uid()
    ));

CREATE POLICY "Barbers can update their own service assignments"
    ON barber_service_assignments FOR UPDATE
    USING (barber_id IN (
        SELECT id FROM barbers WHERE user_id = auth.uid()
    ));

CREATE POLICY "Barbershop owners can manage all service assignments"
    ON barber_service_assignments FOR ALL
    USING (service_id IN (
        SELECT id FROM services WHERE barbershop_id IN (
            SELECT id FROM barbershops WHERE owner_id = auth.uid()
        )
    ));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_services_barbershop_id ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_barber_service_assignments_barber_id ON barber_service_assignments(barber_id);
CREATE INDEX IF NOT EXISTS idx_barber_service_assignments_service_id ON barber_service_assignments(service_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barber_service_assignments_updated_at
    BEFORE UPDATE ON barber_service_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 