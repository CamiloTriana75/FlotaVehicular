-- Migración para tracking de vehículos en tiempo real (HU7)
-- Autor: Sistema
-- Fecha: 2024-11-11

-- =====================================================
-- TABLA: vehicle_locations
-- Almacena ubicaciones GPS en tiempo real de vehículos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vehicle_locations (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL, -- Placa o identificador del vehículo
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0, -- Velocidad en km/h
  heading DOUBLE PRECISION DEFAULT 0, -- Dirección en grados (0-360)
  accuracy DOUBLE PRECISION DEFAULT NULL, -- Precisión GPS en metros
  altitude DOUBLE PRECISION DEFAULT NULL, -- Altitud en metros
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices para consultas frecuentes
  CONSTRAINT vehicle_locations_latitude_check CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT vehicle_locations_longitude_check CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT vehicle_locations_speed_check CHECK (speed >= 0),
  CONSTRAINT vehicle_locations_heading_check CHECK (heading >= 0 AND heading < 360)
);

-- Índices para optimizar consultas de tiempo real
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle_timestamp 
  ON public.vehicle_locations(vehicle_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_locations_timestamp 
  ON public.vehicle_locations(timestamp DESC);

-- Trigger para auto-eliminar registros antiguos (opcional, mantener últimas 24h)
-- CREATE OR REPLACE FUNCTION cleanup_old_locations() 
-- RETURNS TRIGGER AS $$
-- BEGIN
--   DELETE FROM public.vehicle_locations 
--   WHERE timestamp < NOW() - INTERVAL '24 hours';
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_cleanup_locations
--   AFTER INSERT ON public.vehicle_locations
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION cleanup_old_locations();

-- =====================================================
-- TABLA: vehicles (simple para demo)
-- Si no existe, crear tabla básica de vehículos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vehicles (
  id BIGSERIAL PRIMARY KEY,
  placa TEXT UNIQUE NOT NULL,
  marca TEXT,
  modelo TEXT,
  year INTEGER,
  conductor TEXT, -- Nombre del conductor asignado
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'mantenimiento')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar compatibilidad si la tabla ya existía sin algunas columnas
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS conductor TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT;

-- Establecer default de status aunque la columna existiera previamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'status'
  ) THEN
    EXECUTE 'ALTER TABLE public.vehicles ALTER COLUMN status SET DEFAULT ''activo''';
  END IF;
END $$;

-- Agregar la restricción CHECK si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'vehicles_status_check'
  ) THEN
    EXECUTE 'ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_status_check CHECK (status IN (''activo'',''inactivo'',''mantenimiento''))';
  END IF;
END $$;

-- Insertar vehículos de ejemplo si no existen
INSERT INTO public.vehicles (placa, marca, modelo, year, conductor, status) 
VALUES 
  ('ABC-123', 'Toyota', 'Corolla', 2020, 'Juan Pérez', 'activo'),
  ('XYZ-789', 'Chevrolet', 'Spark', 2019, 'María García', 'activo'),
  ('DEF-456', 'Nissan', 'Sentra', 2021, 'Carlos López', 'inactivo')
ON CONFLICT (placa) DO NOTHING;

-- =====================================================
-- RLS (Row Level Security) - TEMPORAL para desarrollo
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE public.vehicle_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Política temporal: permitir todas las operaciones para usuarios autenticados
-- NOTA: Refinar estas políticas en producción según roles específicos
DROP POLICY IF EXISTS "Permitir acceso temporal vehicle_locations" ON public.vehicle_locations;
CREATE POLICY "Permitir acceso temporal vehicle_locations" 
  ON public.vehicle_locations FOR ALL 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acceso temporal vehicles" ON public.vehicles;
CREATE POLICY "Permitir acceso temporal vehicles" 
  ON public.vehicles FOR ALL 
  USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCIONES RPC para operaciones comunes
-- =====================================================

-- Función para obtener última ubicación de cada vehículo
CREATE OR REPLACE FUNCTION get_latest_vehicle_locations()
RETURNS TABLE (
  vehicle_id TEXT,
  placa TEXT,
  marca TEXT,
  modelo TEXT,
  conductor TEXT,
  status TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  last_update TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vl.vehicle_id::text       AS vehicle_id,
    v.placa::text             AS placa,
    COALESCE(v.marca,'')::text    AS marca,
    COALESCE(v.modelo,'')::text   AS modelo,
    COALESCE(v.conductor,'')::text AS conductor,
    v.status::text            AS status,
    vl.latitude::double precision  AS latitude,
    vl.longitude::double precision AS longitude,
    vl.speed::double precision     AS speed,
    vl.heading::double precision   AS heading,
    vl.timestamp::timestamptz  AS last_update
  FROM public.vehicle_locations vl
  INNER JOIN public.vehicles v ON v.placa = vl.vehicle_id
  WHERE vl.id IN (
    SELECT DISTINCT ON (vl2.vehicle_id) vl2.id 
    FROM public.vehicle_locations vl2
    ORDER BY vl2.vehicle_id, vl2.timestamp DESC
  )
  ORDER BY vl.timestamp DESC;
END;
$$;

-- Función para insertar nueva ubicación
CREATE OR REPLACE FUNCTION insert_vehicle_location(
  p_vehicle_id TEXT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_speed DOUBLE PRECISION DEFAULT 0,
  p_heading DOUBLE PRECISION DEFAULT 0,
  p_accuracy DOUBLE PRECISION DEFAULT NULL,
  p_altitude DOUBLE PRECISION DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  location_id BIGINT;
BEGIN
  INSERT INTO public.vehicle_locations 
    (vehicle_id, latitude, longitude, speed, heading, accuracy, altitude, timestamp)
  VALUES 
    (p_vehicle_id, p_latitude, p_longitude, p_speed, p_heading, p_accuracy, p_altitude, NOW())
  RETURNING id INTO location_id;
  
  RETURN location_id;
END;
$$;

-- =====================================================
-- GRANTS para usuario anon (temporal para desarrollo)
-- =====================================================

-- Permitir acceso a las tablas
GRANT SELECT ON public.vehicle_locations TO anon, authenticated;
GRANT INSERT ON public.vehicle_locations TO anon, authenticated;
GRANT SELECT ON public.vehicles TO anon, authenticated;

-- Permitir uso de secuencias
GRANT USAGE ON SEQUENCE public.vehicle_locations_id_seq TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.vehicles_id_seq TO anon, authenticated;

-- Permitir ejecutar funciones RPC
GRANT EXECUTE ON FUNCTION get_latest_vehicle_locations() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION insert_vehicle_location(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon, authenticated;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.vehicle_locations IS 'Ubicaciones GPS en tiempo real de vehículos para tracking';
COMMENT ON TABLE public.vehicles IS 'Catálogo básico de vehículos de la flota';
COMMENT ON FUNCTION get_latest_vehicle_locations() IS 'Obtiene la ubicación más reciente de cada vehículo activo';
COMMENT ON FUNCTION insert_vehicle_location(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) IS 'Inserta nueva ubicación GPS de vehículo';