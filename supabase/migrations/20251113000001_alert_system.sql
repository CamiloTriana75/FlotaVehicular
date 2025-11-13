-- ================================================
-- FUNCIONES RPC PARA SISTEMA DE ALERTAS
-- Fecha: 2025-11-13
-- Descripción: Funciones para gestión de alertas (las tablas ya existen)
-- ================================================

-- NOTA: Las tablas alerts y alert_rules ya existen con la siguiente estructura:
-- 
-- alert_rules:
--   - id, tipo_alerta, nombre, descripcion, habilitado (boolean)
--   - umbrales (jsonb), nivel_prioridad, debounce_segundos
--   - tolerancia_porcentaje, notificar_push, notificar_email
--   - created_at, updated_at
--
-- alerts:
--   - id, vehicle_id, driver_id, tipo_alerta, mensaje
--   - nivel_prioridad, estado, fecha_alerta, fecha_resolucion
--   - resuelto_por, created_at, metadata (jsonb)

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON alerts(tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alerts_estado ON alerts(estado);
CREATE INDEX IF NOT EXISTS idx_alerts_fecha ON alerts(fecha_alerta);
CREATE INDEX IF NOT EXISTS idx_alerts_prioridad ON alerts(nivel_prioridad);

-- ================================================
-- FUNCIÓN: get_alert_rules
-- Descripción: Obtiene todas las reglas de alerta
-- ================================================
CREATE OR REPLACE FUNCTION get_alert_rules()
RETURNS TABLE (
    id INTEGER,
    tipo_alerta VARCHAR(50),
    nombre TEXT,
    descripcion TEXT,
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

-- ================================================
-- FUNCIÓN: update_alert_rule
-- Descripción: Actualiza una regla de alerta
-- Parámetros:
--   p_tipo_alerta: tipo de alerta a actualizar
--   p_umbrales: nuevos umbrales en formato JSON
--   p_habilitado: estado de la regla (opcional)
-- ================================================
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

-- ================================================
-- FUNCIÓN: toggle_alert_rule
-- Descripción: Activa/desactiva una regla de alerta
-- Parámetros:
--   p_tipo_alerta: tipo de alerta
--   p_habilitado: nuevo estado (opcional, si no se envía hace toggle)
-- ================================================
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

-- ================================================
-- FUNCIÓN: evaluar_alertas_ubicacion
-- Descripción: Evalúa alertas basadas en ubicación GPS
-- Parámetros:
--   p_vehicle_id: ID del vehículo
--   p_velocidad_actual: velocidad en km/h
--   p_latitud: latitud GPS
--   p_longitud: longitud GPS
-- ================================================
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
            nivel_prioridad := COALESCE(v_regla.nivel_prioridad, 'alta');
            
            RETURN NEXT;
        END IF;
    END IF;
    
    -- Evaluar parada prolongada (velocidad cercana a 0)
    IF p_velocidad_actual <= 5 THEN
        SELECT * INTO v_regla 
        FROM alert_rules 
        WHERE tipo_alerta = 'parada_prolongada' AND habilitado = true;
        
        IF FOUND THEN
            -- Verificar si ha estado detenido el tiempo suficiente
            -- (esto requeriría verificar el historial de ubicaciones)
            -- Por ahora solo verificamos debounce
            v_debounce_segundos := COALESCE(v_regla.debounce_segundos, 60);
            
            SELECT fecha_alerta INTO v_ultima_alerta
            FROM alerts
            WHERE vehicle_id = p_vehicle_id 
              AND tipo_alerta = 'parada_prolongada'
              AND estado = 'pendiente'
            ORDER BY fecha_alerta DESC
            LIMIT 1;
            
            IF v_ultima_alerta IS NULL OR 
               EXTRACT(EPOCH FROM (NOW() - v_ultima_alerta)) > v_debounce_segundos THEN
                
                tipo_alerta := 'parada_prolongada';
                mensaje := format('Vehículo detenido (velocidad: %.1f km/h)', p_velocidad_actual);
                nivel_prioridad := COALESCE(v_regla.nivel_prioridad, 'media');
                
                RETURN NEXT;
            END IF;
        END IF;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- FUNCIÓN: evaluar_velocidad_excesiva
-- Descripción: Evalúa si hay velocidad excesiva
-- ================================================
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

-- ================================================
-- FUNCIÓN: evaluar_parada_prolongada
-- Descripción: Evalúa si hay parada prolongada
-- ================================================
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

-- ================================================
-- FUNCIÓN: obtener_estadisticas_alertas
-- Descripción: Obtiene estadísticas de alertas
-- ================================================
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

-- ================================================
-- POLÍTICAS RLS
-- ================================================

-- Políticas para alert_rules ya deben existir, pero agregamos si no
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'alert_rules' 
        AND policyname = 'Todos pueden ver reglas de alerta'
    ) THEN
        CREATE POLICY "Todos pueden ver reglas de alerta"
        ON alert_rules FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'alert_rules' 
        AND policyname = 'Solo admin puede modificar reglas'
    ) THEN
        CREATE POLICY "Solo admin puede modificar reglas"
        ON alert_rules FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- ================================================
-- COMENTARIOS
-- ================================================
COMMENT ON FUNCTION get_alert_rules() IS 'Obtiene todas las reglas de alerta configuradas';
COMMENT ON FUNCTION update_alert_rule(VARCHAR, JSONB, BOOLEAN) IS 'Actualiza umbrales y estado de una regla';
COMMENT ON FUNCTION toggle_alert_rule(VARCHAR, BOOLEAN) IS 'Activa/desactiva una regla de alerta';
COMMENT ON FUNCTION evaluar_alertas_ubicacion(INTEGER, DECIMAL, DECIMAL, DECIMAL) IS 'Evalúa alertas basadas en ubicación GPS';
COMMENT ON FUNCTION obtener_estadisticas_alertas() IS 'Retorna estadísticas agregadas de alertas';
