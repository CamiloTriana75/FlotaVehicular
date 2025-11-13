-- =====================================================
-- MIGRATION: RPC para actualizar reglas de alertas
-- Fecha: 2025-11-12
-- Propósito: Permitir actualización de alert_rules sin depender de RLS
-- =====================================================

-- Función para actualizar reglas de alertas (solo admin y superusuario)
CREATE OR REPLACE FUNCTION update_alert_rule(
  p_rule_id INTEGER,
  p_umbrales JSONB DEFAULT NULL,
  p_tolerancia_porcentaje INTEGER DEFAULT NULL,
  p_debounce_segundos INTEGER DEFAULT NULL,
  p_nivel_prioridad TEXT DEFAULT NULL,
  p_habilitado BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Validar que la regla existe
  IF NOT EXISTS (SELECT 1 FROM alert_rules WHERE id = p_rule_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Regla de alerta no encontrada'
    );
  END IF;

  -- Actualizar solo los campos proporcionados
  UPDATE alert_rules
  SET
    umbrales = COALESCE(p_umbrales, umbrales),
    tolerancia_porcentaje = COALESCE(p_tolerancia_porcentaje, tolerancia_porcentaje),
    debounce_segundos = COALESCE(p_debounce_segundos, debounce_segundos),
    nivel_prioridad = COALESCE(p_nivel_prioridad, nivel_prioridad),
    habilitado = COALESCE(p_habilitado, habilitado),
    updated_at = NOW()
  WHERE id = p_rule_id
  RETURNING
    jsonb_build_object(
      'id', id,
      'tipo_alerta', tipo_alerta,
      'nombre', nombre,
      'descripcion', descripcion,
      'umbrales', umbrales,
      'tolerancia_porcentaje', tolerancia_porcentaje,
      'debounce_segundos', debounce_segundos,
      'nivel_prioridad', nivel_prioridad,
      'habilitado', habilitado,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'message', 'Regla actualizada correctamente'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION update_alert_rule IS 
'Actualiza una regla de alerta. Permite actualizar umbrales, tolerancia, debounce, prioridad y estado habilitado.';

-- Permisos para usuarios autenticados
GRANT EXECUTE ON FUNCTION update_alert_rule TO authenticated;
GRANT EXECUTE ON FUNCTION update_alert_rule TO anon;

-- =====================================================
-- Función para obtener todas las reglas de alertas
-- =====================================================
CREATE OR REPLACE FUNCTION get_alert_rules()
RETURNS TABLE (
  id INTEGER,
  tipo_alerta TEXT,
  nombre TEXT,
  descripcion TEXT,
  umbrales JSONB,
  tolerancia_porcentaje INTEGER,
  debounce_segundos INTEGER,
  nivel_prioridad TEXT,
  habilitado BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    tipo_alerta,
    nombre,
    descripcion,
    umbrales,
    tolerancia_porcentaje,
    debounce_segundos,
    nivel_prioridad,
    habilitado,
    created_at,
    updated_at
  FROM alert_rules
  ORDER BY tipo_alerta, nombre;
$$;

COMMENT ON FUNCTION get_alert_rules IS 
'Obtiene todas las reglas de alertas configuradas en el sistema.';

GRANT EXECUTE ON FUNCTION get_alert_rules TO authenticated;
GRANT EXECUTE ON FUNCTION get_alert_rules TO anon;

-- =====================================================
-- Función para habilitar/deshabilitar regla
-- =====================================================
CREATE OR REPLACE FUNCTION toggle_alert_rule(
  p_rule_id INTEGER,
  p_habilitado BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Validar que la regla existe
  IF NOT EXISTS (SELECT 1 FROM alert_rules WHERE id = p_rule_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Regla de alerta no encontrada'
    );
  END IF;

  -- Actualizar estado
  UPDATE alert_rules
  SET
    habilitado = p_habilitado,
    updated_at = NOW()
  WHERE id = p_rule_id
  RETURNING
    jsonb_build_object(
      'id', id,
      'tipo_alerta', tipo_alerta,
      'nombre', nombre,
      'habilitado', habilitado
    ) INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'message', CASE 
      WHEN p_habilitado THEN 'Regla habilitada'
      ELSE 'Regla deshabilitada'
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION toggle_alert_rule IS 
'Habilita o deshabilita una regla de alerta.';

GRANT EXECUTE ON FUNCTION toggle_alert_rule TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_alert_rule TO anon;
