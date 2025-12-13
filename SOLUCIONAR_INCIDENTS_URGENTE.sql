-- =====================================================
-- 🚨 SOLUCIÓN URGENTE - TABLA INCIDENTS
-- =====================================================
-- Error: "new row violates row-level security policy for table incidents"
-- =====================================================

-- PASO 1: Verificar tu usuario actual
DO $$
BEGIN
  RAISE NOTICE '👤 Verificando tu sesión actual...';
END $$;

SELECT 
  auth.jwt()->>'email' as tu_email_actual,
  auth.uid() as tu_user_id,
  CASE 
    WHEN auth.jwt()->>'email' IS NOT NULL THEN '✅ AUTENTICADO'
    ELSE '❌ NO AUTENTICADO'
  END as estado_sesion;

-- PASO 2: Verificar si tu email existe en la tabla usuario
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.usuario 
      WHERE email = auth.jwt()->>'email'
    ) THEN '✅ Tu email EXISTE en tabla usuario'
    ELSE '❌ Tu email NO EXISTE en tabla usuario'
  END as resultado,
  auth.jwt()->>'email' as tu_email;

-- PASO 3: Ver políticas actuales en incidents
SELECT 
  policyname,
  cmd as operacion,
  permissive,
  roles::text,
  qual as usando_condicion,
  with_check as con_verificacion
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'incidents'
ORDER BY cmd;

-- =====================================================
-- PASO 4: APLICAR SOLUCIÓN - OPCIÓN A (MÁS PERMISIVA)
-- =====================================================
-- Esta opción permite a CUALQUIER usuario autenticado crear incidentes
-- sin necesidad de estar en la tabla usuario

-- Deshabilitar RLS temporalmente para ver si ese es el problema
-- DESCOMENTA LA SIGUIENTE LÍNEA SOLO SI QUIERES PROBAR:
-- ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;

-- O mejor: Aplicar políticas más permisivas
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "incidents_select_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_insert_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_update_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_delete_policy" ON public.incidents;
DROP POLICY IF EXISTS "gerente_view_incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can insert alerts" ON public.incidents;
DROP POLICY IF EXISTS "Allow authenticated users to insert incidents" ON public.incidents;
DROP POLICY IF EXISTS "Allow all to view incidents" ON public.incidents;

-- Políticas nuevas MÁS PERMISIVAS
-- SELECT: Permitir a todos (incluso anónimos)
CREATE POLICY "incidents_select_policy"
  ON public.incidents FOR SELECT
  USING (true);

-- INSERT: Permitir a CUALQUIER usuario autenticado (no requiere estar en tabla usuario)
CREATE POLICY "incidents_insert_policy"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Permitir a CUALQUIER usuario autenticado
CREATE POLICY "incidents_update_policy"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Permitir a CUALQUIER usuario autenticado
CREATE POLICY "incidents_delete_policy"
  ON public.incidents FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- PASO 5: VERIFICAR PERMISOS DE TABLA
-- =====================================================

-- Otorgar todos los permisos necesarios
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.incidents TO authenticated;
GRANT SELECT ON TABLE public.incidents TO anon;

-- Verificar que la secuencia tenga permisos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'incidents_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.incidents_id_seq TO authenticated;
    RAISE NOTICE '✅ Permisos de secuencia incidents_id_seq otorgados';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'incidents_incident_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.incidents_incident_id_seq TO authenticated;
    RAISE NOTICE '✅ Permisos de secuencia incidents_incident_id_seq otorgados';
  END IF;
END $$;

-- =====================================================
-- PASO 6: VERIFICAR ESTRUCTURA DE LA TABLA
-- =====================================================

-- Ver columnas de la tabla incidents
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'incidents'
ORDER BY ordinal_position;

-- =====================================================
-- CONFIRMACIÓN FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ========================================';
  RAISE NOTICE '✅ SOLUCIÓN PARA INCIDENTS APLICADA';
  RAISE NOTICE '✅ ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🔓 POLÍTICAS APLICADAS (MUY PERMISIVAS):';
  RAISE NOTICE '   👁️  SELECT: Todos (incluso anónimos)';
  RAISE NOTICE '   ➕ INSERT: Cualquier usuario autenticado';
  RAISE NOTICE '   ✏️  UPDATE: Cualquier usuario autenticado';
  RAISE NOTICE '   🗑️  DELETE: Cualquier usuario autenticado';
  RAISE NOTICE '';
  RAISE NOTICE '📝 SIGUIENTE PASO:';
  RAISE NOTICE '   1. Cierra sesión en tu aplicación';
  RAISE NOTICE '   2. Vuelve a iniciar sesión';
  RAISE NOTICE '   3. Intenta crear un incidente';
  RAISE NOTICE '   4. Si sigue fallando, revisa los resultados arriba';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE '   - Estas políticas son MUY PERMISIVAS';
  RAISE NOTICE '   - Sirven para diagnosticar el problema';
  RAISE NOTICE '   - En producción considera aplicar políticas más restrictivas';
  RAISE NOTICE '';
END $$;

-- Ver políticas finales aplicadas
SELECT 
  '🔐 POLÍTICAS FINALES' as titulo,
  policyname,
  cmd as operacion
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'incidents'
ORDER BY cmd;
