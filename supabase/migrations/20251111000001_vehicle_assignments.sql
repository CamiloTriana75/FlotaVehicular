-- =====================================================
-- Tabla de Asignaciones de Vehículos a Conductores
-- =====================================================
-- Descripción: Sistema de asignación de vehículos a conductores con rangos de fecha/hora
-- Fecha: 2025-11-11
-- Versión: 1.0.0
-- Historia de Usuario: HU3 - Asociar vehículos a conductores con fechas y horarios

-- =====================================================
-- 0. VERIFICAR Y CREAR TABLAS BASE SI NO EXISTEN
-- =====================================================

-- Create vehicles table if it doesn't exist
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  año INTEGER,
  marca VARCHAR(50),
  color VARCHAR(30),
  numero_chasis VARCHAR(50),
  numero_motor VARCHAR(50),
  capacidad_combustible DECIMAL(5,2) DEFAULT 0,
  kilometraje INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'estacionado', 'mantenimiento', 'inactivo')),
  fecha_compra DATE,
  fecha_ultimo_mantenimiento DATE,
  proximo_mantenimiento_km INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table if it doesn't exist
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(15) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(15),
  email VARCHAR(100),
  direccion TEXT,
  numero_licencia VARCHAR(20) UNIQUE,
  categoria_licencia VARCHAR(10),
  fecha_expedicion_licencia DATE,
  fecha_vencimiento_licencia DATE,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'disponible', 'en_servicio')),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for base tables if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicles_updated_at') THEN
        CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_drivers_updated_at') THEN
        CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- 1. CREAR TABLA DE ASIGNACIONES
-- =====================================================

-- Using schema matching white_temple.sql migration (SERIAL IDs, no company_id, no users table)
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    
    -- Assignment time range
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Assignment status
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional notes
    notes TEXT,
    
    -- Table-level validations
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- =====================================================
-- 2. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Index for vehicle lookups
CREATE INDEX idx_vehicle_assignments_vehicle ON vehicle_assignments(vehicle_id);

-- Index for driver lookups
CREATE INDEX idx_vehicle_assignments_driver ON vehicle_assignments(driver_id);

-- Index for time range searches (crucial for overlap detection)
CREATE INDEX idx_vehicle_assignments_time ON vehicle_assignments(start_time, end_time);

-- Index for status searches
CREATE INDEX idx_vehicle_assignments_status ON vehicle_assignments(status);

-- Composite index for active assignments by vehicle
CREATE INDEX idx_vehicle_assignments_vehicle_status ON vehicle_assignments(vehicle_id, status);

-- Composite index for active assignments by driver
CREATE INDEX idx_vehicle_assignments_driver_status ON vehicle_assignments(driver_id, status);

-- GiST index for efficient time overlap searches
CREATE INDEX idx_vehicle_assignments_tstzrange 
ON vehicle_assignments USING GIST (tstzrange(start_time, end_time));

-- =====================================================
-- 3. FUNCIÓN PARA DETECTAR SOLAPAMIENTOS
-- =====================================================

CREATE OR REPLACE FUNCTION check_assignment_overlap()
RETURNS TRIGGER AS $$
DECLARE
    overlap_count INTEGER;
    overlap_vehicle_count INTEGER;
    overlap_driver_count INTEGER;
BEGIN
    -- Only validate for active assignments
    IF NEW.status != 'active' THEN
        RETURN NEW;
    END IF;

    -- Check overlap for the same driver
    SELECT COUNT(*) INTO overlap_driver_count
    FROM vehicle_assignments
    WHERE id != COALESCE(NEW.id, 0)
        AND driver_id = NEW.driver_id
        AND status = 'active'
        AND tstzrange(start_time, end_time) && tstzrange(NEW.start_time, NEW.end_time);

    IF overlap_driver_count > 0 THEN
        RAISE EXCEPTION 'Driver already has an assignment in this time range. Cannot be assigned to multiple vehicles simultaneously.'
            USING HINT = 'Check driver''s existing assignments',
                  ERRCODE = '23P01';
    END IF;

    -- Check overlap for the same vehicle
    SELECT COUNT(*) INTO overlap_vehicle_count
    FROM vehicle_assignments
    WHERE id != COALESCE(NEW.id, 0)
        AND vehicle_id = NEW.vehicle_id
        AND status = 'active'
        AND tstzrange(start_time, end_time) && tstzrange(NEW.start_time, NEW.end_time);

    IF overlap_vehicle_count > 0 THEN
        RAISE EXCEPTION 'Vehicle already has an assignment in this time range. A vehicle cannot be assigned to multiple drivers simultaneously.'
            USING HINT = 'Check vehicle''s existing assignments',
                  ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TRIGGER PARA VALIDAR SOLAPAMIENTOS
-- =====================================================

CREATE TRIGGER validate_assignment_overlap
    BEFORE INSERT OR UPDATE ON vehicle_assignments
    FOR EACH ROW
    EXECUTE FUNCTION check_assignment_overlap();

-- =====================================================
-- 5. TRIGGER FOR UPDATED_AT
-- =====================================================

-- Note: This function should exist from previous schema
-- The existing function update_updated_at_column() will be used

CREATE TRIGGER update_vehicle_assignments_updated_at
    BEFORE UPDATE ON vehicle_assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. FUNCTION TO GET ACTIVE ASSIGNMENTS BY VEHICLE
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_assignments_by_vehicle(p_vehicle_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    driver_id INTEGER,
    driver_name TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        va.id,
        va.driver_id,
        CONCAT(d.nombre, ' ', d.apellidos) AS driver_name,
        va.start_time,
        va.end_time,
        va.status,
        va.notes
    FROM vehicle_assignments va
    INNER JOIN drivers d ON va.driver_id = d.id
    WHERE va.vehicle_id = p_vehicle_id
        AND va.status = 'active'
        AND va.end_time >= NOW()
    ORDER BY va.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCTION TO GET ACTIVE ASSIGNMENTS BY DRIVER
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_assignments_by_driver(p_driver_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    vehicle_id INTEGER,
    vehicle_info TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        va.id,
        va.vehicle_id,
        CONCAT(v.marca, ' ', v.modelo, ' (', v.placa, ')') AS vehicle_info,
        va.start_time,
        va.end_time,
        va.status,
        va.notes
    FROM vehicle_assignments va
    INNER JOIN vehicles v ON va.vehicle_id = v.id
    WHERE va.driver_id = p_driver_id
        AND va.status = 'active'
        AND va.end_time >= NOW()
    ORDER BY va.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNCTION TO COMPLETE AN ASSIGNMENT
-- =====================================================

CREATE OR REPLACE FUNCTION complete_assignment(p_assignment_id INTEGER)
RETURNS vehicle_assignments AS $$
DECLARE
    assignment_record vehicle_assignments;
BEGIN
    UPDATE vehicle_assignments
    SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_assignment_id
        AND status = 'active'
    RETURNING * INTO assignment_record;

    IF assignment_record IS NULL THEN
        RAISE EXCEPTION 'Assignment not found or already completed'
            USING ERRCODE = '23503';
    END IF;

    RETURN assignment_record;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. FUNCTION TO CANCEL AN ASSIGNMENT
-- =====================================================

CREATE OR REPLACE FUNCTION cancel_assignment(p_assignment_id INTEGER)
RETURNS vehicle_assignments AS $$
DECLARE
    assignment_record vehicle_assignments;
BEGIN
    UPDATE vehicle_assignments
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW()
    WHERE id = p_assignment_id
        AND status = 'active'
    RETURNING * INTO assignment_record;

    IF assignment_record IS NULL THEN
        RAISE EXCEPTION 'Assignment not found or already cancelled'
            USING ERRCODE = '23503';
    END IF;

    RETURN assignment_record;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. VIEW FOR ACTIVE ASSIGNMENTS WITH COMPLETE INFORMATION
-- =====================================================

CREATE OR REPLACE VIEW v_active_assignments AS
SELECT 
    va.id,
    va.vehicle_id,
    v.placa AS plate_number,
    v.marca AS brand,
    v.modelo AS model,
    va.driver_id,
    CONCAT(d.nombre, ' ', d.apellidos) AS driver_name,
    d.numero_licencia AS license_number,
    va.start_time,
    va.end_time,
    va.status,
    va.notes,
    va.created_at,
    -- Calculate if currently active (within time range)
    CASE 
        WHEN va.status = 'active' 
            AND va.start_time <= NOW() 
            AND va.end_time >= NOW() 
        THEN true 
        ELSE false 
    END AS currently_active,
    -- Duration in hours
    EXTRACT(EPOCH FROM (va.end_time - va.start_time)) / 3600 AS duration_hours
FROM vehicle_assignments va
INNER JOIN vehicles v ON va.vehicle_id = v.id
INNER JOIN drivers d ON va.driver_id = d.id
WHERE va.status = 'active';

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Note: RLS disabled for now since there's no users table or authentication
-- Enable and configure RLS policies when implementing authentication

-- ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Example policies (uncomment when auth is implemented):
/*
CREATE POLICY "Allow read access to all users" 
    ON vehicle_assignments FOR SELECT 
    USING (true);

CREATE POLICY "Allow insert for authenticated users" 
    ON vehicle_assignments FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" 
    ON vehicle_assignments FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users" 
    ON vehicle_assignments FOR DELETE 
    USING (auth.role() = 'authenticated');
*/

-- =====================================================
-- 12. SEED DATA (TEST DATA)
-- =====================================================

-- Insert sample vehicles if they don't exist
INSERT INTO vehicles (placa, modelo, año, marca, color, status) VALUES
('ABC-123', 'Chevrolet Spark', 2022, 'Chevrolet', 'Blanco', 'activo'),
('DEF-456', 'Renault Logan', 2021, 'Renault', 'Gris', 'estacionado'),
('GHI-789', 'Toyota Corolla', 2023, 'Toyota', 'Negro', 'activo')
ON CONFLICT (placa) DO NOTHING;

-- Insert sample drivers if they don't exist
INSERT INTO drivers (cedula, nombre, apellidos, telefono, email, numero_licencia, estado) VALUES
('12345678', 'Carlos', 'Mendoza', '3001234567', 'carlos@email.com', '123456789', 'activo'),
('87654321', 'María', 'García', '3109876543', 'maria@email.com', '987654321', 'disponible'),
('11223344', 'Luis', 'Rodríguez', '3201122334', 'luis@email.com', '555555555', 'activo')
ON CONFLICT (cedula) DO NOTHING;

-- Insert sample assignments using existing demo data from white_temple migration
DO $$
DECLARE
    v_vehicle1_id INTEGER;
    v_vehicle2_id INTEGER;
    v_driver1_id INTEGER;
    v_driver2_id INTEGER;
BEGIN
    -- Get existing vehicle and driver IDs
    SELECT id INTO v_vehicle1_id FROM vehicles WHERE placa = 'ABC-123' LIMIT 1;
    SELECT id INTO v_vehicle2_id FROM vehicles WHERE placa = 'DEF-456' LIMIT 1;
    SELECT id INTO v_driver1_id FROM drivers WHERE cedula = '12345678' LIMIT 1;
    SELECT id INTO v_driver2_id FROM drivers WHERE cedula = '87654321' LIMIT 1;
    
    -- Only insert if data exists
    IF v_vehicle1_id IS NOT NULL AND v_driver1_id IS NOT NULL THEN
        -- Assignment 1: Morning shift
        INSERT INTO vehicle_assignments (
            vehicle_id, driver_id, start_time, end_time, 
            status, notes
        ) VALUES (
            v_vehicle1_id, v_driver1_id,
            NOW() + INTERVAL '1 day' + INTERVAL '6 hours',  -- Tomorrow at 6:00 AM
            NOW() + INTERVAL '1 day' + INTERVAL '14 hours', -- Tomorrow at 2:00 PM
            'active',
            'Morning shift - Downtown route'
        );
        
        RAISE NOTICE 'Assignment 1 created successfully';
    END IF;
    
    IF v_vehicle2_id IS NOT NULL AND v_driver2_id IS NOT NULL THEN
        -- Assignment 2: Afternoon shift
        INSERT INTO vehicle_assignments (
            vehicle_id, driver_id, start_time, end_time, 
            status, notes
        ) VALUES (
            v_vehicle2_id, v_driver2_id,
            NOW() + INTERVAL '1 day' + INTERVAL '14 hours', -- Tomorrow at 2:00 PM
            NOW() + INTERVAL '1 day' + INTERVAL '22 hours', -- Tomorrow at 10:00 PM
            'active',
            'Afternoon shift - South route'
        );
        
        RAISE NOTICE 'Assignment 2 created successfully';
    END IF;

    RAISE NOTICE '✅ Test data inserted successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not insert test data: %', SQLERRM;
END $$;

-- =====================================================
-- 13. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE vehicle_assignments IS 'Vehicle to driver assignments with time ranges';
COMMENT ON COLUMN vehicle_assignments.start_time IS 'Assignment start date and time';
COMMENT ON COLUMN vehicle_assignments.end_time IS 'Assignment end date and time';
COMMENT ON COLUMN vehicle_assignments.status IS 'Status: active, completed, cancelled';
COMMENT ON COLUMN vehicle_assignments.notes IS 'Additional notes about the assignment';

COMMENT ON FUNCTION check_assignment_overlap() IS 'Validates no time overlaps for driver or vehicle';
COMMENT ON FUNCTION get_active_assignments_by_vehicle(INTEGER) IS 'Gets active assignments for a vehicle';
COMMENT ON FUNCTION get_active_assignments_by_driver(INTEGER) IS 'Gets active assignments for a driver';
COMMENT ON FUNCTION complete_assignment(INTEGER) IS 'Marks an assignment as completed';
COMMENT ON FUNCTION cancel_assignment(INTEGER) IS 'Cancels an active assignment';

-- =====================================================
-- 14. VERIFICATION
-- =====================================================

-- Verify table was created
SELECT 
    'vehicle_assignments' AS table_name,
    COUNT(*) AS record_count
FROM vehicle_assignments;

-- Verify indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'vehicle_assignments';

-- Verify functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND (routine_name LIKE '%assignment%' OR routine_name = 'check_assignment_overlap');

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. Table includes overlap validation via trigger
-- 2. Drivers cannot be assigned to multiple vehicles simultaneously
-- 3. Vehicles cannot be assigned to multiple drivers simultaneously
-- 4. Uses SERIAL (INTEGER) IDs matching white_temple.sql schema
-- 5. Includes helper functions for common queries
-- 6. Compatible with existing vehicles and drivers tables
-- 7. No authentication/authorization (RLS disabled for now)
