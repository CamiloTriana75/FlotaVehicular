-- =====================================================
-- MIGRATION: Sistema de Rutas Optimizadas
-- Fecha: 2025-11-12
-- HU: HU10 - Crear y asignar rutas optimizadas
-- Descripción: Tablas para rutas con waypoints, optimización
--              y asignación a conductores/vehículos
-- =====================================================

-- =====================================================
-- Tabla: routes
-- Descripción: Almacena rutas creadas con waypoints y datos de optimización
-- =====================================================
CREATE TABLE IF NOT EXISTS routes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Waypoints (puntos de la ruta en orden)
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  /*
  Estructura de waypoints:
  [
    {
      "name": "Punto de recogida 1",
      "address": "Calle 123 #45-67",
      "lat": 4.6097,
      "lng": -74.0817,
      "order": 0,
      "notes": "Contacto: Juan"
    },
    ...
  ]
  */
  
  -- Orden optimizado de waypoints (índices)
  optimized_order JSONB DEFAULT NULL,
  /* Ejemplo: [0, 2, 1, 3] indica que el orden óptimo es waypoint 0, luego 2, luego 1, luego 3 */
  
  -- Datos calculados de la ruta
  total_distance INTEGER NOT NULL, -- metros
  total_duration INTEGER NOT NULL, -- segundos
  
  -- Geometría de la ruta (GeoJSON LineString para dibujar en mapa)
  geometry JSONB,
  /*
  Estructura GeoJSON:
  {
    "type": "LineString",
    "coordinates": [[-74.0817, 4.6097], [-74.0825, 4.6105], ...]
  }
  */
  
  -- Estado de la ruta
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Auditoría
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_waypoints CHECK (jsonb_array_length(waypoints) >= 2)
);

-- Índices para routes
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routes_waypoints_gin ON routes USING GIN (waypoints);
CREATE INDEX IF NOT EXISTS idx_routes_geometry_gin ON routes USING GIN (geometry);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_routes_updated_at();

-- =====================================================
-- Tabla: route_assignments
-- Descripción: Asignaciones de rutas a conductores/vehículos
-- =====================================================
CREATE TABLE IF NOT EXISTS route_assignments (
  id BIGSERIAL PRIMARY KEY,
  route_id BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  -- Horarios programados
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  
  -- Horarios reales (se llenan cuando el conductor inicia/completa)
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  -- Estado de la asignación
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Notas adicionales
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_scheduled_times CHECK (scheduled_end IS NULL OR scheduled_end > scheduled_start),
  CONSTRAINT valid_actual_times CHECK (actual_end IS NULL OR actual_end > actual_start)
);

-- Índices para route_assignments
CREATE INDEX IF NOT EXISTS idx_route_assignments_route ON route_assignments(route_id);
CREATE INDEX IF NOT EXISTS idx_route_assignments_driver ON route_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_route_assignments_vehicle ON route_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_assignments_status ON route_assignments(status);
CREATE INDEX IF NOT EXISTS idx_route_assignments_scheduled_start ON route_assignments(scheduled_start);

-- Trigger para updated_at
CREATE TRIGGER trigger_route_assignments_updated_at
  BEFORE UPDATE ON route_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_routes_updated_at();

-- =====================================================
-- RLS Policies
-- =====================================================

-- Habilitar RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para routes
DROP POLICY IF EXISTS "Public can view routes" ON routes;
CREATE POLICY "Public can view routes"
  ON routes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can create routes" ON routes;
CREATE POLICY "Public can create routes"
  ON routes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update routes" ON routes;
CREATE POLICY "Public can update routes"
  ON routes FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete routes" ON routes;
CREATE POLICY "Public can delete routes"
  ON routes FOR DELETE
  USING (true);

-- Políticas para route_assignments
DROP POLICY IF EXISTS "Public can view route assignments" ON route_assignments;
CREATE POLICY "Public can view route assignments"
  ON route_assignments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can create route assignments" ON route_assignments;
CREATE POLICY "Public can create route assignments"
  ON route_assignments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update route assignments" ON route_assignments;
CREATE POLICY "Public can update route assignments"
  ON route_assignments FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete route assignments" ON route_assignments;
CREATE POLICY "Public can delete route assignments"
  ON route_assignments FOR DELETE
  USING (true);

-- =====================================================
-- Funciones auxiliares
-- =====================================================

-- Función para obtener asignaciones activas de un conductor
CREATE OR REPLACE FUNCTION get_driver_active_routes(p_driver_id BIGINT)
RETURNS TABLE (
  assignment_id BIGINT,
  route_id BIGINT,
  route_name VARCHAR(200),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  total_waypoints INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ra.id,
    r.id,
    r.name,
    ra.scheduled_start,
    ra.scheduled_end,
    ra.status,
    jsonb_array_length(r.waypoints)::INTEGER
  FROM route_assignments ra
  JOIN routes r ON r.id = ra.route_id
  WHERE ra.driver_id = p_driver_id
    AND ra.status IN ('pending', 'in_progress')
  ORDER BY ra.scheduled_start;
END;
$$ LANGUAGE plpgsql;

-- Permisos
GRANT EXECUTE ON FUNCTION get_driver_active_routes TO authenticated;
GRANT EXECUTE ON FUNCTION get_driver_active_routes TO anon;

-- =====================================================
-- Comentarios de documentación
-- =====================================================
COMMENT ON TABLE routes IS 'Rutas con waypoints y optimización mediante Mapbox Directions API';
COMMENT ON TABLE route_assignments IS 'Asignaciones de rutas a conductores y vehículos con horarios';
COMMENT ON COLUMN routes.waypoints IS 'Array JSON de puntos de la ruta con nombre, dirección y coordenadas';
COMMENT ON COLUMN routes.optimized_order IS 'Orden optimizado de waypoints (índices) calculado por Mapbox';
COMMENT ON COLUMN routes.geometry IS 'GeoJSON LineString con la geometría completa de la ruta para renderizado';
COMMENT ON FUNCTION get_driver_active_routes IS 'Obtiene las rutas activas asignadas a un conductor específico';
