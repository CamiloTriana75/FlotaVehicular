-- =====================================================
-- MIGRATION: Sistema de Tracking de Rutas
-- Fecha: 2025-11-20
-- HU: HU12 - Comparar rutas planificadas vs recorridas
-- Descripción: Tablas para registrar la trayectoria real
--              de los conductores durante las rutas asignadas
-- =====================================================

-- =====================================================
-- LIMPIEZA: Eliminar objetos existentes si los hay
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS mv_route_execution_summary CASCADE;
DROP FUNCTION IF EXISTS refresh_route_execution_summary() CASCADE;
DROP FUNCTION IF EXISTS get_route_statistics(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS insert_route_event(BIGINT, VARCHAR, JSONB, DECIMAL, DECIMAL, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_route_events(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS insert_route_tracking_point(BIGINT, BIGINT, DECIMAL, DECIMAL, DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS get_route_trajectory(BIGINT) CASCADE;
DROP TABLE IF EXISTS route_events CASCADE;
DROP TABLE IF EXISTS route_tracking CASCADE;

-- =====================================================
-- Tabla: route_tracking
-- Descripción: Almacena puntos GPS de la ruta recorrida
--              vinculados a una asignación específica
-- =====================================================
CREATE TABLE route_tracking (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  -- Coordenadas GPS
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Datos adicionales del GPS
  speed DECIMAL(6, 2) DEFAULT 0, -- km/h
  heading DECIMAL(5, 2) DEFAULT 0, -- grados (0-360)
  accuracy DECIMAL(8, 2), -- metros
  altitude DECIMAL(8, 2), -- metros
  
  -- Timestamp del punto
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Índices para consultas eficientes
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT valid_heading CHECK (heading >= 0 AND heading <= 360)
);

-- Índices para route_tracking
CREATE INDEX IF NOT EXISTS idx_route_tracking_assignment ON route_tracking(assignment_id);
CREATE INDEX IF NOT EXISTS idx_route_tracking_vehicle ON route_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_tracking_recorded_at ON route_tracking(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_tracking_assignment_recorded_at ON route_tracking(assignment_id, recorded_at);

-- Índice espacial para consultas geoespaciales (si PostGIS está disponible)
-- CREATE INDEX IF NOT EXISTS idx_route_tracking_location ON route_tracking USING GIST (ST_Point(longitude, latitude));

COMMENT ON TABLE route_tracking IS 'Registro de puntos GPS de rutas recorridas por conductores';
COMMENT ON COLUMN route_tracking.assignment_id IS 'Referencia a la asignación de ruta específica';
COMMENT ON COLUMN route_tracking.recorded_at IS 'Momento exacto en que se capturó el punto GPS';

-- =====================================================
-- Tabla: route_events
-- Descripción: Eventos importantes durante la ejecución de una ruta
-- =====================================================
CREATE TABLE route_events (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type VARCHAR(50) NOT NULL,
  /*
  Tipos de eventos:
  - 'route_started': Conductor inició la ruta
  - 'route_completed': Conductor completó la ruta
  - 'waypoint_reached': Llegada a un waypoint
  - 'deviation_detected': Desviación significativa de la ruta
  - 'tracking_started': Inicio del GPS tracking
  - 'tracking_stopped': Fin del GPS tracking
  - 'incident_reported': Incidente reportado durante la ruta
  */
  
  -- Datos adicionales del evento (JSON flexible)
  event_data JSONB,
  /*
  Ejemplo para 'waypoint_reached':
  {
    "waypoint_number": 2,
    "waypoint_name": "Centro de distribución",
    "arrival_time": "2025-11-20T14:30:00Z",
    "distance_from_waypoint": 15.5
  }
  */
  
  -- Ubicación donde ocurrió el evento
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Timestamp del evento
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Notas adicionales
  notes TEXT
);

-- Índices para route_events
CREATE INDEX IF NOT EXISTS idx_route_events_assignment ON route_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_route_events_type ON route_events(event_type);
CREATE INDEX IF NOT EXISTS idx_route_events_recorded_at ON route_events(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_events_data_gin ON route_events USING GIN (event_data);

COMMENT ON TABLE route_events IS 'Registro de eventos importantes durante la ejecución de rutas';
COMMENT ON COLUMN route_events.event_type IS 'Tipo de evento ocurrido durante la ruta';
COMMENT ON COLUMN route_events.event_data IS 'Datos estructurados específicos del tipo de evento';

-- =====================================================
-- RLS Policies
-- =====================================================

-- Habilitar RLS
ALTER TABLE route_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_events ENABLE ROW LEVEL SECURITY;

-- Políticas para route_tracking
DROP POLICY IF EXISTS "Public can view route tracking" ON route_tracking;
CREATE POLICY "Public can view route tracking"
  ON route_tracking FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert route tracking" ON route_tracking;
CREATE POLICY "Public can insert route tracking"
  ON route_tracking FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update route tracking" ON route_tracking;
CREATE POLICY "Public can update route tracking"
  ON route_tracking FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete route tracking" ON route_tracking;
CREATE POLICY "Public can delete route tracking"
  ON route_tracking FOR DELETE
  USING (true);

-- Políticas para route_events
DROP POLICY IF EXISTS "Public can view route events" ON route_events;
CREATE POLICY "Public can view route events"
  ON route_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert route events" ON route_events;
CREATE POLICY "Public can insert route events"
  ON route_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update route events" ON route_events;
CREATE POLICY "Public can update route events"
  ON route_events FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete route events" ON route_events;
CREATE POLICY "Public can delete route events"
  ON route_events FOR DELETE
  USING (true);

-- =====================================================
-- Funciones auxiliares
-- =====================================================

-- Función para obtener la trayectoria completa de una ruta
CREATE OR REPLACE FUNCTION get_route_trajectory(p_assignment_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(6, 2),
  heading DECIMAL(5, 2),
  recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.latitude,
    rt.longitude,
    rt.speed,
    rt.heading,
    rt.recorded_at
  FROM route_tracking rt
  WHERE rt.assignment_id = p_assignment_id
  ORDER BY rt.recorded_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_route_trajectory IS 'Obtiene todos los puntos GPS de una ruta en orden cronológico';

-- Función para registrar un punto de tracking
CREATE OR REPLACE FUNCTION insert_route_tracking_point(
  p_assignment_id BIGINT,
  p_vehicle_id BIGINT,
  p_latitude DECIMAL(10, 8),
  p_longitude DECIMAL(11, 8),
  p_speed DECIMAL(6, 2) DEFAULT 0,
  p_heading DECIMAL(5, 2) DEFAULT 0,
  p_accuracy DECIMAL(8, 2) DEFAULT NULL,
  p_altitude DECIMAL(8, 2) DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO route_tracking (
    assignment_id,
    vehicle_id,
    latitude,
    longitude,
    speed,
    heading,
    accuracy,
    altitude
  ) VALUES (
    p_assignment_id,
    p_vehicle_id,
    p_latitude,
    p_longitude,
    p_speed,
    p_heading,
    p_accuracy,
    p_altitude
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION insert_route_tracking_point IS 'Registra un punto GPS en el tracking de una ruta';

-- Función para obtener eventos de una ruta
CREATE OR REPLACE FUNCTION get_route_events(p_assignment_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  event_type VARCHAR(50),
  event_data JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  recorded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    re.id,
    re.event_type,
    re.event_data,
    re.latitude,
    re.longitude,
    re.recorded_at,
    re.notes
  FROM route_events re
  WHERE re.assignment_id = p_assignment_id
  ORDER BY re.recorded_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_route_events IS 'Obtiene todos los eventos de una ruta específica';

-- Función para registrar un evento de ruta
CREATE OR REPLACE FUNCTION insert_route_event(
  p_assignment_id BIGINT,
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT NULL,
  p_latitude DECIMAL(10, 8) DEFAULT NULL,
  p_longitude DECIMAL(11, 8) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO route_events (
    assignment_id,
    event_type,
    event_data,
    latitude,
    longitude,
    notes
  ) VALUES (
    p_assignment_id,
    p_event_type,
    p_event_data,
    p_latitude,
    p_longitude,
    p_notes
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION insert_route_event IS 'Registra un evento importante durante la ejecución de una ruta';

-- Función para calcular estadísticas de una ruta ejecutada
CREATE OR REPLACE FUNCTION get_route_statistics(p_assignment_id BIGINT)
RETURNS TABLE (
  total_points INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  avg_speed DECIMAL(6, 2),
  max_speed DECIMAL(6, 2),
  distance_covered_km DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_points,
    MIN(rt.recorded_at) as start_time,
    MAX(rt.recorded_at) as end_time,
    EXTRACT(EPOCH FROM (MAX(rt.recorded_at) - MIN(rt.recorded_at)))::INTEGER as duration_seconds,
    AVG(rt.speed)::DECIMAL(6, 2) as avg_speed,
    MAX(rt.speed)::DECIMAL(6, 2) as max_speed,
    -- Estimación simple de distancia (sumar distancias entre puntos consecutivos requeriría PostGIS)
    (COUNT(*) * AVG(rt.speed) / 3600)::DECIMAL(10, 2) as distance_covered_km
  FROM route_tracking rt
  WHERE rt.assignment_id = p_assignment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_route_statistics IS 'Calcula estadísticas de una ruta ejecutada';

-- Permisos
GRANT EXECUTE ON FUNCTION get_route_trajectory TO authenticated, anon;
GRANT EXECUTE ON FUNCTION insert_route_tracking_point TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_route_events TO authenticated, anon;
GRANT EXECUTE ON FUNCTION insert_route_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_route_statistics TO authenticated, anon;

-- =====================================================
-- Vista materializada para análisis de rutas
-- =====================================================
CREATE MATERIALIZED VIEW mv_route_execution_summary AS
SELECT 
  ra.id as assignment_id,
  ra.route_id,
  r.name as route_name,
  ra.driver_id,
  ra.vehicle_id,
  ra.status,
  ra.scheduled_start,
  ra.scheduled_end,
  ra.actual_start,
  ra.actual_end,
  COUNT(rt.id) as tracking_points,
  MIN(rt.recorded_at) as first_tracking_point,
  MAX(rt.recorded_at) as last_tracking_point,
  AVG(rt.speed) as avg_speed,
  MAX(rt.speed) as max_speed,
  COUNT(re.id) FILTER (WHERE re.event_type = 'waypoint_reached') as waypoints_reached,
  jsonb_array_length(r.waypoints) as total_waypoints
FROM route_assignments ra
JOIN routes r ON r.id = ra.route_id
LEFT JOIN route_tracking rt ON rt.assignment_id = ra.id
LEFT JOIN route_events re ON re.assignment_id = ra.id
GROUP BY ra.id, r.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_route_execution_summary_assignment 
  ON mv_route_execution_summary(assignment_id);

COMMENT ON MATERIALIZED VIEW mv_route_execution_summary IS 'Resumen de ejecución de rutas con métricas agregadas';

-- Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_route_execution_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_route_execution_summary;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION refresh_route_execution_summary TO authenticated, anon;

-- =====================================================
-- Datos de ejemplo (comentados - descomentar si se necesitan)
-- =====================================================

/*
-- Ejemplo de inserción de tracking
INSERT INTO route_tracking (assignment_id, vehicle_id, latitude, longitude, speed, heading)
VALUES (1, 1, 4.6097, -74.0817, 45.5, 90);

-- Ejemplo de evento
INSERT INTO route_events (assignment_id, event_type, event_data, latitude, longitude)
VALUES (1, 'waypoint_reached', '{"waypoint_number": 1, "arrival_time": "2025-11-20T14:30:00Z"}', 4.6097, -74.0817);
*/

