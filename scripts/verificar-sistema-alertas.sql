-- =====================================================
-- SCRIPT DE VERIFICACIÓN: Sistema de Alertas
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Verificar que la tabla alerts tiene la columna metadata
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alerts'
ORDER BY ordinal_position;

-- 2. Verificar que existen reglas de alertas
SELECT id, tipo_alerta, nombre, habilitado, umbrales, debounce_segundos, tolerancia_porcentaje
FROM alert_rules
ORDER BY tipo_alerta;

-- 3. Verificar que la función get_alert_rules existe y funciona
SELECT * FROM get_alert_rules();

-- 4. Verificar vehículos en la tabla vehicles
SELECT id, placa, marca, modelo, driver_id
FROM vehicles
LIMIT 5;

-- 5. Ver alertas recientes (últimas 10)
SELECT 
  id,
  vehicle_id,
  tipo_alerta,
  mensaje,
  nivel_prioridad,
  estado,
  metadata,
  fecha_alerta
FROM alerts
ORDER BY fecha_alerta DESC
LIMIT 10;

-- 6. Ver el canal de realtime para alertas
-- (Verificar que la tabla tenga REPLICA IDENTITY)
SELECT tablename, schemaname 
FROM pg_tables 
WHERE tablename = 'alerts';

-- 7. Verificar políticas RLS de alerts
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'alerts';

-- =====================================================
-- RESULTADOS ESPERADOS:
-- =====================================================
-- 1. Columna 'metadata' debe existir con tipo 'jsonb'
-- 2. Debe haber 2+ reglas (velocidad_excesiva, parada_prolongada)
-- 3. get_alert_rules() debe devolver las reglas configuradas
-- 4. Debe haber vehículos con placas válidas
-- 5. Alertas con metadata completa
-- 6. Tabla alerts debe existir
-- 7. Políticas RLS deben permitir INSERT/SELECT
-- =====================================================
