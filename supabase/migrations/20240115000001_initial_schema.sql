-- =====================================================
-- FleetManager - Esquema Inicial de Base de Datos
-- =====================================================
-- Descripción: Esquema principal para el sistema de gestión de flota vehicular
-- Fecha: 2024-01-15
-- Versión: 1.0.0

-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de empresas/organizaciones
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    nit VARCHAR(50) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios del sistema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator', -- admin, supervisor, operator, driver
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conductores
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    license_number VARCHAR(50),
    license_expiry DATE,
    license_type VARCHAR(20) DEFAULT 'B1', -- B1, B2, C1, C2, etc.
    status VARCHAR(20) DEFAULT 'available', -- available, assigned, inactive
    hire_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vehículos
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50),
    vin VARCHAR(50) UNIQUE,
    engine_number VARCHAR(50),
    fuel_type VARCHAR(20) DEFAULT 'gasoline', -- gasoline, diesel, electric, hybrid
    capacity INTEGER, -- capacidad en kg o pasajeros
    status VARCHAR(20) DEFAULT 'available', -- available, assigned, maintenance, inactive
    current_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_mileage INTEGER DEFAULT 0,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    insurance_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ubicaciones (tracking GPS)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    speed DECIMAL(5, 2), -- km/h
    heading DECIMAL(5, 2), -- grados
    accuracy DECIMAL(5, 2), -- metros
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de rutas
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    origin_address TEXT NOT NULL,
    origin_lat DECIMAL(10, 8),
    origin_lng DECIMAL(11, 8),
    destination_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8),
    destination_lng DECIMAL(11, 8),
    distance_km DECIMAL(8, 2),
    estimated_duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'planned', -- planned, active, completed, cancelled
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de paradas de ruta
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    estimated_departure TIMESTAMP WITH TIME ZONE,
    actual_departure TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de geocercas
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'circle', -- circle, polygon, rectangle
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    radius_meters INTEGER, -- para círculos
    polygon_coordinates JSONB, -- para polígonos
    is_active BOOLEAN DEFAULT true,
    alert_on_entry BOOLEAN DEFAULT true,
    alert_on_exit BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alertas
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- speed, geofence, fuel, maintenance, panic, etc.
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mantenimiento
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- preventive, corrective, inspection
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    odometer_reading INTEGER,
    cost DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    assigned_mechanic VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de combustible
CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    liters DECIMAL(8, 2) NOT NULL,
    cost_per_liter DECIMAL(8, 2),
    total_cost DECIMAL(10, 2),
    odometer_reading INTEGER,
    fuel_type VARCHAR(20) DEFAULT 'gasoline',
    station_name VARCHAR(255),
    station_location TEXT,
    receipt_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de incidentes
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- accident, breakdown, theft, violation, etc.
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'reported', -- reported, investigating, resolved, closed
    resolution_notes TEXT,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para ubicaciones (muy consultadas)
CREATE INDEX idx_locations_vehicle_timestamp ON locations(vehicle_id, timestamp DESC);
CREATE INDEX idx_locations_timestamp ON locations(timestamp DESC);
CREATE INDEX idx_locations_vehicle_id ON locations(vehicle_id);

-- Índices para vehículos
CREATE INDEX idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);

-- Índices para conductores
CREATE INDEX idx_drivers_company_id ON drivers(company_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_cedula ON drivers(cedula);

-- Índices para alertas
CREATE INDEX idx_alerts_company_id ON alerts(company_id);
CREATE INDEX idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_resolved ON alerts(is_resolved);

-- Índices para rutas
CREATE INDEX idx_routes_company_id ON routes(company_id);
CREATE INDEX idx_routes_vehicle_id ON routes(vehicle_id);
CREATE INDEX idx_routes_status ON routes(status);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (se pueden personalizar según necesidades)
-- Los usuarios solo pueden ver datos de su empresa
CREATE POLICY "Users can view own company data" ON companies FOR SELECT USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company users" ON users FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company drivers" ON drivers FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company vehicles" ON vehicles FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company locations" ON locations FOR SELECT USING (vehicle_id IN (SELECT id FROM vehicles WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Users can view own company routes" ON routes FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company alerts" ON alerts FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company maintenance" ON maintenance FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company fuel_records" ON fuel_records FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can view own company incidents" ON incidents FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- DATOS INICIALES (SEED DATA)
-- =====================================================

-- Insertar empresa demo
INSERT INTO companies (id, name, nit, address, phone, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'FleetManager Demo', '900.123.456-7', 'Calle 123 #45-67, Bogotá', '+57 1 234 5678', 'demo@fleetmanager.com');

-- Insertar usuario admin demo
INSERT INTO users (id, company_id, email, first_name, last_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@fleetmanager.com', 'Admin', 'Usuario', 'admin');

-- Insertar conductores demo
INSERT INTO drivers (id, company_id, cedula, first_name, last_name, phone, email, license_number, license_expiry) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '12345678', 'Carlos', 'Mendoza', '3001234567', 'carlos@email.com', 'LIC123456', '2025-06-15'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '87654321', 'María', 'García', '3109876543', 'maria@email.com', 'LIC876543', '2024-12-20'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '11223344', 'Luis', 'Rodríguez', '3201122334', 'luis@email.com', 'LIC112233', '2025-03-10');

-- Insertar vehículos demo
INSERT INTO vehicles (id, company_id, plate_number, brand, model, year, color, fuel_type, capacity, status, current_driver_id, current_mileage) VALUES 
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'ABC-123', 'Chevrolet', 'Spark', 2022, 'Blanco', 'gasoline', 5, 'assigned', '550e8400-e29b-41d4-a716-446655440002', 45230),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'DEF-456', 'Renault', 'Logan', 2021, 'Gris', 'gasoline', 5, 'assigned', '550e8400-e29b-41d4-a716-446655440003', 67890),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'GHI-789', 'Toyota', 'Corolla', 2023, 'Azul', 'gasoline', 5, 'assigned', '550e8400-e29b-41d4-a716-446655440004', 23456);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE companies IS 'Empresas u organizaciones que usan el sistema';
COMMENT ON TABLE users IS 'Usuarios del sistema con diferentes roles';
COMMENT ON TABLE drivers IS 'Conductores de la flota vehicular';
COMMENT ON TABLE vehicles IS 'Vehículos de la flota';
COMMENT ON TABLE locations IS 'Ubicaciones GPS de los vehículos en tiempo real';
COMMENT ON TABLE routes IS 'Rutas planificadas y ejecutadas';
COMMENT ON TABLE geofences IS 'Geocercas para alertas geográficas';
COMMENT ON TABLE alerts IS 'Sistema de alertas y notificaciones';
COMMENT ON TABLE maintenance IS 'Registro de mantenimiento de vehículos';
COMMENT ON TABLE fuel_records IS 'Registro de consumo de combustible';
COMMENT ON TABLE incidents IS 'Incidentes y emergencias reportadas';
