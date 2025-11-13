-- =====================================================
-- Migration: Sistema de Reglas de Alertas y Evaluación
-- Descripción: Configura reglas de alertas con umbrales
--              y funciones para evaluarlas en tiempo real
-- Fecha: 2025-11-12
-- HU: HU9 - Configurar alertas operacionales
-- =====================================================

-- =====================================================
-- PREREQUISITOS: Crear tabla alerts si no existe
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER,
  driver_id INTEGER,
  tipo_alerta VARCHAR(50) NOT NULL CHECK (tipo_alerta IN (
    'combustible_bajo', 
    'mantenimiento_vencido', 
    'velocidad_excesiva', 
    'licencia_vencida',
    'parada_no_autorizada',
    'parada_prolongada',
    'falla_sistema'
  )),
  mensaje TEXT NOT NULL,
  nivel_prioridad VARCHAR(10) DEFAULT 'media' CHECK (nivel_prioridad IN ('baja', 'media', 'alta', 'critica')),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'vista', 'resuelta', 'ignorada')),
  fecha_alerta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  resuelto_por VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para alerts si no existen
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_estado ON alerts(estado);
CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON alerts(tipo_alerta);

-- Tabla de configuración de reglas de alertas
CREATE TABLE IF NOT EXISTS alert_rules (
  id SERIAL PRIMARY KEY,
  tipo_alerta VARCHAR(50) NOT NULL UNIQUE CHECK (tipo_alerta IN (
    'velocidad_excesiva',
    'parada_prolongada',
    'desvio_ruta',
    'combustible_bajo',
    'mantenimiento_vencido'
  )),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  habilitado BOOLEAN DEFAULT true,
  
  -- Configuración de umbrales (JSON para flexibilidad)
  umbrales JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
  Ejemplos de umbrales:
  - velocidad_excesiva: {"max_velocidad_kmh": 90, "duracion_segundos": 10}
  - parada_prolongada: {"duracion_minutos": 30, "radio_metros": 50}
  - desvio_ruta: {"distancia_maxima_metros": 500}
  - combustible_bajo: {"porcentaje_minimo": 15}
  */
  
  -- Configuración de severidad y prioridad
  nivel_prioridad VARCHAR(10) DEFAULT 'media' CHECK (nivel_prioridad IN ('baja', 'media', 'alta', 'critica')),
  
  -- Debounce y tolerancia para evitar falsos positivos
  debounce_segundos INTEGER DEFAULT 10,
  tolerancia_porcentaje INTEGER DEFAULT 5,
  
  -- Notificaciones
  notificar_push BOOLEAN DEFAULT true,
  notificar_email BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para alert_rules
CREATE INDEX IF NOT EXISTS idx_alert_rules_tipo ON alert_rules(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alert_rules_habilitado ON alert_rules(habilitado);

-- Tabla para tracking de estados de alerta (evitar duplicados)
CREATE TABLE IF NOT EXISTS alert_tracking (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tipo_alerta VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'resuelto')),
  valor_actual JSONB, -- Guarda el valor que disparó la alerta
  primera_deteccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_deteccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  alert_id INTEGER REFERENCES alerts(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(vehicle_id, tipo_alerta, estado)
);

-- Índices para alert_tracking
CREATE INDEX IF NOT EXISTS idx_alert_tracking_vehicle ON alert_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alert_tracking_tipo ON alert_tracking(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alert_tracking_estado ON alert_tracking(estado);

-- Trigger para actualizar updated_at en alert_rules
CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rules_updated_at();

-- =====================================================
-- Función para evaluar velocidad excesiva
-- =====================================================
CREATE OR REPLACE FUNCTION evaluar_velocidad_excesiva(
  p_vehicle_id INTEGER,
  p_velocidad_actual NUMERIC,
  p_ubicacion_lat NUMERIC,
  p_ubicacion_lng NUMERIC
)
RETURNS TABLE (
  debe_alertar BOOLEAN,
  mensaje TEXT,
  prioridad VARCHAR(10)
) AS $$
DECLARE
  v_regla RECORD;
  v_tracking RECORD;
  v_max_velocidad NUMERIC;
  v_duracion_requerida INTEGER;
  v_tiempo_excedido INTEGER;
BEGIN
  -- Obtener regla de velocidad excesiva
  SELECT * INTO v_regla
  FROM alert_rules
  WHERE tipo_alerta = 'velocidad_excesiva' AND habilitado = true
  LIMIT 1;
  
  -- Si no hay regla o no está habilitada, no alertar
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
    RETURN;
  END IF;
  
  -- Extraer umbrales
  v_max_velocidad := (v_regla.umbrales->>'max_velocidad_kmh')::NUMERIC;
  v_duracion_requerida := (v_regla.umbrales->>'duracion_segundos')::INTEGER;
  
  -- Verificar si excede velocidad
  IF p_velocidad_actual <= v_max_velocidad THEN
    -- Velocidad normal, resolver tracking si existe
    UPDATE alert_tracking
    SET estado = 'resuelto'
    WHERE vehicle_id = p_vehicle_id
      AND tipo_alerta = 'velocidad_excesiva'
      AND estado = 'activo';
      
    RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
    RETURN;
  END IF;
  
  -- Verificar tracking existente
  SELECT * INTO v_tracking
  FROM alert_tracking
  WHERE vehicle_id = p_vehicle_id
    AND tipo_alerta = 'velocidad_excesiva'
    AND estado = 'activo';
  
  IF FOUND THEN
    -- Actualizar última detección
    UPDATE alert_tracking
    SET 
      ultima_deteccion = NOW(),
      valor_actual = jsonb_build_object(
        'velocidad_kmh', p_velocidad_actual,
        'lat', p_ubicacion_lat,
        'lng', p_ubicacion_lng
      )
    WHERE id = v_tracking.id;
    
    -- Calcular tiempo excedido
    v_tiempo_excedido := EXTRACT(EPOCH FROM (NOW() - v_tracking.primera_deteccion))::INTEGER;
    
    -- Solo alertar si ha pasado suficiente tiempo (debounce)
    IF v_tiempo_excedido >= v_duracion_requerida THEN
      RETURN QUERY SELECT 
        true,
        format('Vehículo excede velocidad máxima de %s km/h a %s km/h por %s segundos',
          v_max_velocidad, p_velocidad_actual, v_tiempo_excedido),
        v_regla.nivel_prioridad;
      RETURN;
    END IF;
  ELSE
    -- Crear nuevo tracking
    INSERT INTO alert_tracking (vehicle_id, tipo_alerta, valor_actual)
    VALUES (
      p_vehicle_id,
      'velocidad_excesiva',
      jsonb_build_object(
        'velocidad_kmh', p_velocidad_actual,
        'lat', p_ubicacion_lat,
        'lng', p_ubicacion_lng
      )
    );
  END IF;
  
  -- No alertar todavía (en debounce)
  RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Función para evaluar parada prolongada
-- =====================================================
CREATE OR REPLACE FUNCTION evaluar_parada_prolongada(
  p_vehicle_id INTEGER,
  p_velocidad_actual NUMERIC,
  p_ubicacion_lat NUMERIC,
  p_ubicacion_lng NUMERIC
)
RETURNS TABLE (
  debe_alertar BOOLEAN,
  mensaje TEXT,
  prioridad VARCHAR(10)
) AS $$
DECLARE
  v_regla RECORD;
  v_tracking RECORD;
  v_duracion_minutos INTEGER;
  v_radio_metros INTEGER;
  v_tiempo_parado INTEGER;
  v_distancia_metros NUMERIC;
  v_lat_inicial NUMERIC;
  v_lng_inicial NUMERIC;
BEGIN
  -- Obtener regla
  SELECT * INTO v_regla
  FROM alert_rules
  WHERE tipo_alerta = 'parada_prolongada' AND habilitado = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
    RETURN;
  END IF;
  
  v_duracion_minutos := (v_regla.umbrales->>'duracion_minutos')::INTEGER;
  v_radio_metros := (v_regla.umbrales->>'radio_metros')::INTEGER;
  
  -- Si el vehículo está en movimiento (>5 km/h), resolver tracking
  IF p_velocidad_actual > 5 THEN
    UPDATE alert_tracking
    SET estado = 'resuelto'
    WHERE vehicle_id = p_vehicle_id
      AND tipo_alerta = 'parada_prolongada'
      AND estado = 'activo';
      
    RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
    RETURN;
  END IF;
  
  -- Verificar tracking existente
  SELECT * INTO v_tracking
  FROM alert_tracking
  WHERE vehicle_id = p_vehicle_id
    AND tipo_alerta = 'parada_prolongada'
    AND estado = 'activo';
  
  IF FOUND THEN
    -- Extraer ubicación inicial
    v_lat_inicial := (v_tracking.valor_actual->>'lat')::NUMERIC;
    v_lng_inicial := (v_tracking.valor_actual->>'lng')::NUMERIC;
    
    -- Calcular distancia (fórmula aproximada en metros)
    v_distancia_metros := (
      6371000 * acos(
        cos(radians(v_lat_inicial)) * cos(radians(p_ubicacion_lat)) *
        cos(radians(p_ubicacion_lng) - radians(v_lng_inicial)) +
        sin(radians(v_lat_inicial)) * sin(radians(p_ubicacion_lat))
      )
    );
    
    -- Si se movió mucho, reiniciar tracking
    IF v_distancia_metros > v_radio_metros THEN
      DELETE FROM alert_tracking WHERE id = v_tracking.id;
      
      INSERT INTO alert_tracking (vehicle_id, tipo_alerta, valor_actual)
      VALUES (
        p_vehicle_id,
        'parada_prolongada',
        jsonb_build_object('lat', p_ubicacion_lat, 'lng', p_ubicacion_lng)
      );
      
      RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
      RETURN;
    END IF;
    
    -- Actualizar última detección
    UPDATE alert_tracking
    SET ultima_deteccion = NOW()
    WHERE id = v_tracking.id;
    
    -- Calcular tiempo parado
    v_tiempo_parado := EXTRACT(EPOCH FROM (NOW() - v_tracking.primera_deteccion))::INTEGER / 60;
    
    -- Alertar si excede duración
    IF v_tiempo_parado >= v_duracion_minutos THEN
      RETURN QUERY SELECT 
        true,
        format('Vehículo detenido por %s minutos en el mismo lugar', v_tiempo_parado),
        v_regla.nivel_prioridad;
      RETURN;
    END IF;
  ELSE
    -- Crear nuevo tracking
    INSERT INTO alert_tracking (vehicle_id, tipo_alerta, valor_actual)
    VALUES (
      p_vehicle_id,
      'parada_prolongada',
      jsonb_build_object('lat', p_ubicacion_lat, 'lng', p_ubicacion_lng)
    );
  END IF;
  
  RETURN QUERY SELECT false, NULL::TEXT, NULL::VARCHAR(10);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Función principal para evaluar todas las reglas
-- =====================================================
CREATE OR REPLACE FUNCTION evaluar_alertas_ubicacion(
  p_vehicle_id INTEGER,
  p_velocidad NUMERIC,
  p_lat NUMERIC,
  p_lng NUMERIC
)
RETURNS TABLE (
  tipo_alerta VARCHAR(50),
  debe_alertar BOOLEAN,
  mensaje TEXT,
  prioridad VARCHAR(10)
) AS $$
BEGIN
  -- Evaluar velocidad excesiva
  RETURN QUERY
  SELECT 
    'velocidad_excesiva'::VARCHAR(50),
    r.debe_alertar,
    r.mensaje,
    r.prioridad
  FROM evaluar_velocidad_excesiva(p_vehicle_id, p_velocidad, p_lat, p_lng) r
  WHERE r.debe_alertar = true;
  
  -- Evaluar parada prolongada
  RETURN QUERY
  SELECT 
    'parada_prolongada'::VARCHAR(50),
    r.debe_alertar,
    r.mensaje,
    r.prioridad
  FROM evaluar_parada_prolongada(p_vehicle_id, p_velocidad, p_lat, p_lng) r
  WHERE r.debe_alertar = true;
  
  -- Aquí se pueden agregar más evaluaciones (desvío de ruta, etc.)
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Insertar reglas por defecto
-- =====================================================
INSERT INTO alert_rules (tipo_alerta, nombre, descripcion, umbrales, nivel_prioridad, debounce_segundos)
VALUES
  (
    'velocidad_excesiva',
    'Exceso de Velocidad',
    'Alerta cuando un vehículo excede la velocidad máxima permitida de forma sostenida',
    '{"max_velocidad_kmh": 15, "duracion_segundos": 10}',
    'alta',
    10
  ),
  (
    'parada_prolongada',
    'Parada Prolongada',
    'Alerta cuando un vehículo permanece detenido por más tiempo del permitido',
    '{"duracion_minutos": 30, "radio_metros": 50}',
    'media',
    60
  ),
  (
    'combustible_bajo',
    'Combustible Bajo',
    'Alerta cuando el nivel de combustible cae por debajo del umbral mínimo',
    '{"porcentaje_minimo": 15}',
    'media',
    300
  )
ON CONFLICT (tipo_alerta) DO NOTHING;

-- =====================================================
-- RLS Policies para alert_rules
-- =====================================================
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (no dependen de tabla users)
-- Todos los usuarios autenticados pueden ver reglas
DROP POLICY IF EXISTS "Admin y RRHH pueden ver reglas" ON alert_rules;
CREATE POLICY "Usuarios autenticados pueden ver reglas"
  ON alert_rules FOR SELECT
  TO authenticated
  USING (true);

-- Solo usuarios autenticados pueden modificar (el frontend validará roles)
DROP POLICY IF EXISTS "Solo Admin puede modificar reglas" ON alert_rules;
CREATE POLICY "Usuarios autenticados pueden modificar reglas"
  ON alert_rules FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- RLS Policies para alert_tracking
-- =====================================================
ALTER TABLE alert_tracking ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver y modificar tracking
DROP POLICY IF EXISTS "Admin y RRHH pueden ver tracking" ON alert_tracking;
CREATE POLICY "Usuarios autenticados pueden ver tracking"
  ON alert_tracking FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Sistema puede modificar tracking" ON alert_tracking;
CREATE POLICY "Usuarios autenticados pueden modificar tracking"
  ON alert_tracking FOR ALL
  TO authenticated
  USING (true);

-- Comentarios de documentación
COMMENT ON TABLE alert_rules IS 'Configuración de reglas de alertas con umbrales personalizables';
COMMENT ON TABLE alert_tracking IS 'Seguimiento de estados de alerta para evitar duplicados y gestionar debounce';
COMMENT ON FUNCTION evaluar_velocidad_excesiva IS 'Evalúa si un vehículo excede la velocidad máxima por tiempo sostenido';
COMMENT ON FUNCTION evaluar_parada_prolongada IS 'Evalúa si un vehículo permanece detenido en el mismo lugar por mucho tiempo';
COMMENT ON FUNCTION evaluar_alertas_ubicacion IS 'Función principal que evalúa todas las reglas de alertas para una ubicación';
