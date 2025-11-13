-- ================================================
-- FUNCIONES RPC PARA SISTEMA DE ALERTAS
-- Ejecutar en SQL Editor de Supabase
-- Fecha: 2025-11-13
-- ================================================

-- Eliminar funciones existentes para evitar conflictos de firma
DROP FUNCTION IF EXISTS get_alert_rules();
DROP FUNCTION IF EXISTS update_alert_rule(VARCHAR, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS toggle_alert_rule(VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS evaluar_alertas_ubicacion(INTEGER, DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS evaluar_velocidad_excesiva(INTEGER, DECIMAL);
DROP FUNCTION IF EXISTS evaluar_parada_prolongada(INTEGER, DECIMAL, INTEGER);
DROP FUNCTION IF EXISTS obtener_estadisticas_alertas();

-- 1. Obtener todas las reglas de alerta
CREATE OR REPLACE FUNCTION get_alert_rules()
RETURNS TABLE (
    id INTEGER,
    tipo_alerta VARCHAR(50),
    nombre VARCHAR(100),
    descripcion VARCHAR(100),
    habilitado BOOLEAN,
    umbrales JSONB,
    nivel_prioridad VARCHAR(20),
    debounce_segundos INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ar.id,
        ar.tipo_alerta,
        ar.nombre,
        ar.descripcion,
        ar.habilitado,
        ar.umbrales,
        ar.nivel_prioridad,
        ar.debounce_segundos,
        ar.created_at,
        ar.updated_at
    FROM alert_rules ar
    ORDER BY ar.tipo_alerta;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Actualizar una regla de alerta
CREATE OR REPLACE FUNCTION update_alert_rule(
    p_tipo_alerta VARCHAR(50),
    p_umbrales JSONB,
    p_habilitado BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE alert_rules
    SET 
        umbrales = p_umbrales,
        habilitado = COALESCE(p_habilitado, habilitado),
        updated_at = NOW()
    WHERE tipo_alerta = p_tipo_alerta;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Toggle (activar/desactivar) una regla
CREATE OR REPLACE FUNCTION toggle_alert_rule(
    p_tipo_alerta VARCHAR(50),
    p_habilitado BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_nuevo_estado BOOLEAN;
BEGIN
    IF p_habilitado IS NULL THEN
        -- Toggle: invertir el estado actual
        UPDATE alert_rules
        SET habilitado = NOT habilitado,
            updated_at = NOW()
        WHERE tipo_alerta = p_tipo_alerta
        RETURNING habilitado INTO v_nuevo_estado;
    ELSE
        -- Establecer estado específico
        UPDATE alert_rules
        SET habilitado = p_habilitado,
            updated_at = NOW()
        WHERE tipo_alerta = p_tipo_alerta
        RETURNING habilitado INTO v_nuevo_estado;
    END IF;
    
    RETURN v_nuevo_estado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Evaluar alertas basadas en ubicación GPS
CREATE OR REPLACE FUNCTION evaluar_alertas_ubicacion(
    p_vehicle_id INTEGER,
    p_velocidad_actual DECIMAL,
    p_latitud DECIMAL,
    p_longitud DECIMAL
)
RETURNS TABLE (
    tipo_alerta VARCHAR(50),
    mensaje TEXT,
    nivel_prioridad VARCHAR(20)
) AS $$
DECLARE
    v_regla RECORD;
    v_ultima_alerta TIMESTAMPTZ;
    v_debounce_segundos INTEGER;
BEGIN
    -- Evaluar velocidad excesiva
    SELECT * INTO v_regla 
    FROM alert_rules 
    WHERE tipo_alerta = 'velocidad_excesiva' AND habilitado = true;
    
    IF FOUND AND p_velocidad_actual > (v_regla.umbrales->>'max_velocidad_kmh')::DECIMAL THEN
        v_debounce_segundos := COALESCE(v_regla.debounce_segundos, 60);
        
        -- Verificar debounce
        SELECT fecha_alerta INTO v_ultima_alerta
        FROM alerts
        WHERE vehicle_id = p_vehicle_id 
          AND tipo_alerta = 'velocidad_excesiva'
          AND estado = 'pendiente'
        ORDER BY fecha_alerta DESC
        LIMIT 1;
        
        IF v_ultima_alerta IS NULL OR 
           EXTRACT(EPOCH FROM (NOW() - v_ultima_alerta)) > v_debounce_segundos THEN
            
            tipo_alerta := 'velocidad_excesiva';
            mensaje := format('Velocidad superior a %s km/h sostenida (actual: %.1f km/h)', 
                            v_regla.umbrales->>'max_velocidad_kmh',
                            p_velocidad_actual);
            nivel_prioridad := v_regla.nivel_prioridad;
            
            RETURN NEXT;
        END IF;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Evaluar velocidad excesiva (función auxiliar)
CREATE OR REPLACE FUNCTION evaluar_velocidad_excesiva(
    p_vehicle_id INTEGER,
    p_velocidad_kmh DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_umbral DECIMAL;
    v_habilitado BOOLEAN;
BEGIN
    SELECT 
        (umbrales->>'max_velocidad_kmh')::DECIMAL,
        habilitado
    INTO v_umbral, v_habilitado
    FROM alert_rules
    WHERE tipo_alerta = 'velocidad_excesiva';
    
    IF NOT FOUND OR NOT v_habilitado THEN
        RETURN FALSE;
    END IF;
    
    RETURN p_velocidad_kmh > v_umbral;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Evaluar parada prolongada (función auxiliar)
CREATE OR REPLACE FUNCTION evaluar_parada_prolongada(
    p_vehicle_id INTEGER,
    p_velocidad_kmh DECIMAL,
    p_duracion_segundos INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_duracion_min INTEGER;
    v_habilitado BOOLEAN;
BEGIN
    SELECT 
        (umbrales->>'duracion_segundos')::INTEGER,
        habilitado
    INTO v_duracion_min, v_habilitado
    FROM alert_rules
    WHERE tipo_alerta = 'parada_prolongada';
    
    IF NOT FOUND OR NOT v_habilitado THEN
        RETURN FALSE;
    END IF;
    
    RETURN p_velocidad_kmh < 5 AND p_duracion_segundos >= v_duracion_min;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Obtener estadísticas de alertas
CREATE OR REPLACE FUNCTION obtener_estadisticas_alertas()
RETURNS TABLE (
    pendientes BIGINT,
    vistas BIGINT,
    resueltas BIGINT,
    criticas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'vista') as vistas,
        COUNT(*) FILTER (WHERE estado IN ('resuelta', 'ignorada')) as resueltas,
        COUNT(*) FILTER (WHERE nivel_prioridad = 'critica' AND estado = 'pendiente') as criticas
    FROM alerts
    WHERE fecha_alerta >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON alerts(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alerts_estado ON alerts(estado);
CREATE INDEX IF NOT EXISTS idx_alerts_fecha ON alerts(fecha_alerta);
CREATE INDEX IF NOT EXISTS idx_alerts_prioridad ON alerts(nivel_prioridad);

-- Comentarios de documentación
COMMENT ON FUNCTION get_alert_rules() IS 'Obtiene todas las reglas de alerta configuradas';
COMMENT ON FUNCTION update_alert_rule(VARCHAR, JSONB, BOOLEAN) IS 'Actualiza umbrales y estado de una regla';
COMMENT ON FUNCTION toggle_alert_rule(VARCHAR, BOOLEAN) IS 'Activa/desactiva una regla de alerta';
COMMENT ON FUNCTION evaluar_alertas_ubicacion(INTEGER, DECIMAL, DECIMAL, DECIMAL) IS 'Evalúa alertas basadas en ubicación GPS';
COMMENT ON FUNCTION obtener_estadisticas_alertas() IS 'Retorna estadísticas agregadas de alertas';
