-- Migración para soportar parada_prolongada en segundos (para pruebas)
-- Fecha: 2025-11-12

-- Modificar función evaluar_parada_prolongada para soportar duracion_segundos
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
  v_duracion_segundos INTEGER;
  v_radio_metros INTEGER;
  v_tiempo_parado INTEGER;
  v_tiempo_parado_segundos INTEGER;
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
  
  -- Soportar tanto duracion_minutos como duracion_segundos
  v_duracion_minutos := (v_regla.umbrales->>'duracion_minutos')::INTEGER;
  v_duracion_segundos := (v_regla.umbrales->>'duracion_segundos')::INTEGER;
  v_radio_metros := (v_regla.umbrales->>'radio_metros')::INTEGER;
  
  -- Si no hay segundos configurados, convertir minutos a segundos
  IF v_duracion_segundos IS NULL AND v_duracion_minutos IS NOT NULL THEN
    v_duracion_segundos := v_duracion_minutos * 60;
  END IF;
  
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
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(v_lat_inicial)) * cos(radians(p_ubicacion_lat)) *
          cos(radians(p_ubicacion_lng) - radians(v_lng_inicial)) +
          sin(radians(v_lat_inicial)) * sin(radians(p_ubicacion_lat))
        ))
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
    
    -- Calcular tiempo parado en segundos
    v_tiempo_parado_segundos := EXTRACT(EPOCH FROM (NOW() - v_tracking.primera_deteccion))::INTEGER;
    
    -- Alertar si excede duración
    IF v_tiempo_parado_segundos >= v_duracion_segundos THEN
      -- Formatear mensaje según si es en segundos o minutos
      IF v_duracion_segundos < 60 THEN
        RETURN QUERY SELECT 
          true,
          format('Vehículo detenido por %s segundos en el mismo lugar', v_tiempo_parado_segundos),
          v_regla.nivel_prioridad;
      ELSE
        v_tiempo_parado := v_tiempo_parado_segundos / 60;
        RETURN QUERY SELECT 
          true,
          format('Vehículo detenido por %s minutos en el mismo lugar', v_tiempo_parado),
          v_regla.nivel_prioridad;
      END IF;
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

-- Actualizar la regla de parada_prolongada para usar 10 segundos en pruebas
UPDATE alert_rules 
SET umbrales = jsonb_build_object(
  'duracion_segundos', 10,
  'radio_metros', 50
)
WHERE tipo_alerta = 'parada_prolongada';

COMMENT ON FUNCTION evaluar_parada_prolongada IS 'Evalúa si un vehículo permanece detenido en el mismo lugar. Soporta umbrales en segundos (duracion_segundos) o minutos (duracion_minutos)';
