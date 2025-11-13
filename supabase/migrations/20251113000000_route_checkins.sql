-- Migration: Route check-ins and progress tracking
-- Created: 2025-11-13
-- Description: Adds waypoint check-in tracking and route progress logs

-- Tabla para registrar check-ins en waypoints
CREATE TABLE IF NOT EXISTS route_waypoint_checkins (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
  waypoint_number INTEGER NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_assignment_waypoint UNIQUE(assignment_id, waypoint_number)
);

-- Tabla para logs de eventos de ruta
CREATE TABLE IF NOT EXISTS route_events (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'start', 'waypoint_reached', 'deviation', 'completed', 'pause', 'resume'
  event_data JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_checkins_assignment ON route_waypoint_checkins(assignment_id);
CREATE INDEX IF NOT EXISTS idx_checkins_time ON route_waypoint_checkins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_events_assignment ON route_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON route_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_time ON route_events(created_at);

-- RLS policies
ALTER TABLE route_waypoint_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_events ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (custom auth)
CREATE POLICY "Allow all on checkins" ON route_waypoint_checkins FOR ALL USING (true);
CREATE POLICY "Allow all on events" ON route_events FOR ALL USING (true);

-- Función para calcular progreso de una asignación
CREATE OR REPLACE FUNCTION get_route_assignment_progress(p_assignment_id BIGINT)
RETURNS TABLE (
  total_waypoints INTEGER,
  completed_waypoints INTEGER,
  progress_percentage DECIMAL(5,2),
  last_checkin_at TIMESTAMPTZ,
  next_waypoint_number INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH route_info AS (
    SELECT 
      ra.id,
      COALESCE(jsonb_array_length(r.waypoints), 0)::INTEGER as total_wps
    FROM route_assignments ra
    JOIN routes r ON ra.route_id = r.id
    WHERE ra.id = p_assignment_id
  ),
  checkin_info AS (
    SELECT 
      COUNT(*)::INTEGER as completed,
      MAX(checked_in_at) as last_check,
      MAX(waypoint_number) as last_wp
    FROM route_waypoint_checkins
    WHERE assignment_id = p_assignment_id
  )
  SELECT 
    ri.total_wps,
    COALESCE(ci.completed, 0),
    CASE 
      WHEN ri.total_wps > 0 THEN ROUND((COALESCE(ci.completed, 0)::DECIMAL / ri.total_wps) * 100, 2)
      ELSE 0
    END,
    ci.last_check,
    CASE 
      WHEN ci.last_wp IS NULL THEN 1
      WHEN ci.last_wp >= ri.total_wps THEN NULL
      ELSE ci.last_wp + 1
    END
  FROM route_info ri
  CROSS JOIN checkin_info ci;
END;
$$ LANGUAGE plpgsql STABLE;

-- Vista para monitoreo de rutas activas
CREATE OR REPLACE VIEW v_active_route_monitoring AS
SELECT 
  ra.id as assignment_id,
  ra.route_id,
  r.name as route_name,
  r.waypoints,
  r.geometry,
  ra.driver_id,
  d.nombre || ' ' || COALESCE(d.apellidos, '') as driver_name,
  d.email as driver_email,
  ra.vehicle_id,
  v.placa as vehicle_plate,
  ra.status,
  ra.scheduled_start,
  ra.scheduled_end,
  ra.actual_start,
  ra.actual_end,
  (SELECT COUNT(*) FROM route_waypoint_checkins WHERE assignment_id = ra.id) as completed_waypoints,
  COALESCE(jsonb_array_length(r.waypoints), 0) as total_waypoints,
  (SELECT checked_in_at FROM route_waypoint_checkins WHERE assignment_id = ra.id ORDER BY checked_in_at DESC LIMIT 1) as last_checkin_at
FROM route_assignments ra
JOIN routes r ON ra.route_id = r.id
LEFT JOIN drivers d ON ra.driver_id = d.id
LEFT JOIN vehicles v ON ra.vehicle_id = v.id
WHERE ra.status IN ('pending', 'in_progress');

COMMENT ON TABLE route_waypoint_checkins IS 'Check-ins automáticos cuando el conductor llega a cada waypoint';
COMMENT ON TABLE route_events IS 'Log de eventos de ruta para auditoría y alertas';
COMMENT ON FUNCTION get_route_assignment_progress IS 'Calcula el progreso de una asignación de ruta';
COMMENT ON VIEW v_active_route_monitoring IS 'Vista consolidada para monitoreo de rutas activas';
