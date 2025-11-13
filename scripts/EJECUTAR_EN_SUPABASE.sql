-- =====================================================
-- SCRIPT TODO-EN-UNO: Arreglar Sistema de Alertas
-- Copiar y pegar TODO en SQL Editor de Supabase
-- Fecha: 2025-11-12
-- =====================================================

-- =====================================================
-- 1. AGREGAR COLUMNA METADATA
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'alerts' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE alerts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN alerts.metadata IS 'Metadata adicional de la alerta (velocidad, ubicación, duración, etc.)';
    RAISE NOTICE '✅ Columna metadata agregada';
  ELSE
    RAISE NOTICE '⚠️ Columna metadata ya existe';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_alerts_metadata_gin ON alerts USING GIN (metadata);

-- =====================================================
-- 2. CREAR FUNCIONES RPC
-- =====================================================

-- Función para actualizar reglas de alertas
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
  IF NOT EXISTS (SELECT 1 FROM alert_rules WHERE id = p_rule_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Regla no encontrada');
  END IF;

  UPDATE alert_rules
  SET
    umbrales = COALESCE(p_umbrales, umbrales),
    tolerancia_porcentaje = COALESCE(p_tolerancia_porcentaje, tolerancia_porcentaje),
    debounce_segundos = COALESCE(p_debounce_segundos, debounce_segundos),
    nivel_prioridad = COALESCE(p_nivel_prioridad, nivel_prioridad),
    habilitado = COALESCE(p_habilitado, habilitado),
    updated_at = NOW()
  WHERE id = p_rule_id
  RETURNING jsonb_build_object(
    'id', id, 'tipo_alerta', tipo_alerta, 'nombre', nombre,
    'umbrales', umbrales, 'habilitado', habilitado
  ) INTO v_result;

  RETURN jsonb_build_object('success', true, 'data', v_result);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Función para obtener todas las reglas
CREATE OR REPLACE FUNCTION get_alert_rules()
RETURNS TABLE (
  id INTEGER, tipo_alerta TEXT, nombre TEXT, descripcion TEXT,
  umbrales JSONB, tolerancia_porcentaje INTEGER, debounce_segundos INTEGER,
  nivel_prioridad TEXT, habilitado BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT id, tipo_alerta, nombre, descripcion, umbrales,
    tolerancia_porcentaje, debounce_segundos, nivel_prioridad,
    habilitado, created_at, updated_at
  FROM alert_rules
  ORDER BY tipo_alerta, nombre;
$$;

-- Función para toggle
CREATE OR REPLACE FUNCTION toggle_alert_rule(p_rule_id INTEGER, p_habilitado BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM alert_rules WHERE id = p_rule_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Regla no encontrada');
  END IF;

  UPDATE alert_rules SET habilitado = p_habilitado, updated_at = NOW()
  WHERE id = p_rule_id
  RETURNING jsonb_build_object('id', id, 'habilitado', habilitado) INTO v_result;

  RETURN jsonb_build_object('success', true, 'data', v_result);
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION update_alert_rule TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_alert_rules TO authenticated, anon;
GRANT EXECUTE ON FUNCTION toggle_alert_rule TO authenticated, anon;

SELECT '✅ Funciones RPC creadas' AS info;

-- =====================================================
-- 3. ARREGLAR POLÍTICAS RLS (CRÍTICO)
-- =====================================================

-- ALERTS
DROP POLICY IF EXISTS "Users can view own company alerts" ON alerts;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON alerts;
DROP POLICY IF EXISTS "Authenticated users can insert alerts" ON alerts;
DROP POLICY IF EXISTS "Authenticated users can update alerts" ON alerts;
DROP POLICY IF EXISTS "Anon users can view alerts" ON alerts;
DROP POLICY IF EXISTS "Anon users can insert alerts" ON alerts;

CREATE POLICY "Authenticated users can view alerts"
  ON alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon users can view alerts"
  ON alerts FOR SELECT TO anon USING (true);

CREATE POLICY "Anon users can insert alerts"
  ON alerts FOR INSERT TO anon WITH CHECK (true);

SELECT '✅ Políticas RLS de alerts actualizadas' AS info;

-- VEHICLES
DROP POLICY IF EXISTS "Users can view own company vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authenticated users can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anon users can view vehicles" ON vehicles;

CREATE POLICY "Authenticated users can view vehicles"
  ON vehicles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon users can view vehicles"
  ON vehicles FOR SELECT TO anon USING (true);

SELECT '✅ Políticas RLS de vehicles actualizadas' AS info;

-- =====================================================
-- 4. HABILITAR REALTIME
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
    RAISE NOTICE '✅ Realtime habilitado para alerts';
  ELSE
    RAISE NOTICE '⚠️ Realtime ya estaba habilitado';
  END IF;
END $$;

-- =====================================================
-- 5. VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  v_metadata_exists BOOLEAN;
  v_rpc_exists BOOLEAN;
  v_policy_count INTEGER;
  v_rules_count INTEGER;
BEGIN
  -- Verificar metadata
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='alerts' AND column_name='metadata'
  ) INTO v_metadata_exists;

  -- Verificar función RPC
  SELECT EXISTS(
    SELECT 1 FROM pg_proc WHERE proname='get_alert_rules'
  ) INTO v_rpc_exists;

  -- Contar políticas
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE tablename IN ('alerts', 'vehicles');

  -- Contar reglas habilitadas
  SELECT COUNT(*) INTO v_rules_count
  FROM alert_rules 
  WHERE habilitado = true;

  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '           VERIFICACIÓN FINAL';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Columna metadata: %', CASE WHEN v_metadata_exists THEN '✅ OK' ELSE '❌ FALTA' END;
  RAISE NOTICE 'Función RPC: %', CASE WHEN v_rpc_exists THEN '✅ OK' ELSE '❌ FALTA' END;
  RAISE NOTICE 'Políticas RLS: % políticas creadas', v_policy_count;
  RAISE NOTICE 'Reglas activas: % reglas habilitadas', v_rules_count;
  RAISE NOTICE '================================================';
  
  IF v_metadata_exists AND v_rpc_exists AND v_policy_count >= 6 AND v_rules_count >= 2 THEN
    RAISE NOTICE '🎉 TODO CONFIGURADO CORRECTAMENTE';
    RAISE NOTICE '✅ Puedes cerrar Supabase y reiniciar npm run dev';
  ELSE
    RAISE NOTICE '⚠️ ALGO FALTA - Revisa los mensajes arriba';
  END IF;
  RAISE NOTICE '================================================';
END $$;

-- Mostrar reglas configuradas
SELECT 
  tipo_alerta, 
  nombre, 
  habilitado,
  umbrales,
  nivel_prioridad
FROM alert_rules
ORDER BY tipo_alerta;
