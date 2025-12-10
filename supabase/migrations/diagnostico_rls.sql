-- =====================================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA RLS
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor para diagnosticar problemas

\echo '=================================================='
\echo '🔍 DIAGNÓSTICO RLS - Sistema de Permisos'
\echo '=================================================='
\echo ''

-- =====================================================
-- 1. VERIFICAR USUARIO ACTUAL
-- =====================================================
\echo '1️⃣ Usuario actual autenticado:'
SELECT 
  auth.jwt()->>'email' as email_sesion_actual,
  auth.jwt()->>'role' as rol_supabase,
  CASE 
    WHEN auth.jwt()->>'email' IS NULL THEN '❌ NO hay sesión activa'
    ELSE '✅ Sesión activa'
  END as estado_sesion;

\echo ''

-- =====================================================
-- 2. VERIFICAR USUARIO EN TABLA usuario
-- =====================================================
\echo '2️⃣ Búsqueda en tabla usuario:'
SELECT 
  id_usuario,
  username,
  email,
  rol,
  activo,
  CASE 
    WHEN activo = true THEN '✅ Activo'
    ELSE '❌ Inactivo'
  END as estado,
  CASE 
    WHEN rol IN ('admin', 'superusuario') THEN '✅ Permisos completos'
    WHEN rol IN ('rrhh') THEN '✅ Puede crear conductores'
    WHEN rol IN ('mecanico', 'supervisor') THEN '⚠️  Solo mantenimiento'
    ELSE '❌ Permisos limitados'
  END as nivel_acceso
FROM public.usuario
WHERE email = auth.jwt()->>'email';

\echo ''

-- =====================================================
-- 3. VERIFICAR POLÍTICAS RLS EN DRIVERS
-- =====================================================
\echo '3️⃣ Políticas RLS en tabla drivers:'
SELECT 
  policyname as nombre_politica,
  cmd as operacion,
  CASE 
    WHEN policyname LIKE '%select%' THEN '👁️  Lectura'
    WHEN policyname LIKE '%insert%' THEN '➕ Inserción'
    WHEN policyname LIKE '%update%' THEN '✏️  Actualización'
    WHEN policyname LIKE '%delete%' THEN '🗑️  Eliminación'
    ELSE '❓'
  END as tipo
FROM pg_policies
WHERE tablename = 'drivers'
ORDER BY cmd;

\echo ''

-- =====================================================
-- 4. VERIFICAR POLÍTICAS RLS EN MAINTENANCE_ORDERS
-- =====================================================
\echo '4️⃣ Políticas RLS en tabla maintenance_orders:'
SELECT 
  policyname as nombre_politica,
  cmd as operacion,
  CASE 
    WHEN policyname LIKE '%select%' THEN '👁️  Lectura'
    WHEN policyname LIKE '%insert%' THEN '➕ Inserción'
    WHEN policyname LIKE '%update%' THEN '✏️  Actualización'
    WHEN policyname LIKE '%delete%' THEN '🗑️  Eliminación'
    ELSE '❓'
  END as tipo
FROM pg_policies
WHERE tablename = 'maintenance_orders'
ORDER BY cmd;

\echo ''

-- =====================================================
-- 5. VERIFICAR ESTADO RLS EN TABLAS
-- =====================================================
\echo '5️⃣ Estado RLS en tablas principales:'
SELECT 
  schemaname,
  tablename as tabla,
  CASE 
    WHEN rowsecurity = true THEN '🔒 RLS Habilitado'
    ELSE '🔓 RLS Deshabilitado'
  END as estado_rls
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('drivers', 'maintenance_orders', 'vehicles', 'incidents')
ORDER BY tablename;

\echo ''

-- =====================================================
-- 6. VERIFICAR PERMISOS DE TABLA
-- =====================================================
\echo '6️⃣ Permisos de tabla para rol authenticated:'
SELECT 
  table_name as tabla,
  string_agg(privilege_type, ', ') as permisos
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN ('drivers', 'maintenance_orders', 'vehicles', 'incidents')
GROUP BY table_name
ORDER BY table_name;

\echo ''

-- =====================================================
-- 7. PRUEBA DE INSERCIÓN SIMULADA
-- =====================================================
\echo '7️⃣ Prueba de permisos de inserción (simulado):'
DO $$
DECLARE
  v_email text;
  v_rol text;
  v_activo boolean;
  v_puede_crear_drivers boolean;
  v_puede_crear_maintenance boolean;
BEGIN
  -- Obtener datos del usuario actual
  v_email := auth.jwt()->>'email';
  
  IF v_email IS NULL THEN
    RAISE NOTICE '❌ NO HAY USUARIO AUTENTICADO';
    RAISE NOTICE '   Inicia sesión en la aplicación primero';
    RETURN;
  END IF;
  
  -- Buscar en tabla usuario
  SELECT rol, activo INTO v_rol, v_activo
  FROM public.usuario
  WHERE email = v_email;
  
  IF v_rol IS NULL THEN
    RAISE NOTICE '❌ EMAIL NO EXISTE EN TABLA usuario';
    RAISE NOTICE '   Email buscado: %', v_email;
    RAISE NOTICE '   SOLUCIÓN: Ejecuta 20251210_add_admin_user.sql con tu email';
    RETURN;
  END IF;
  
  IF v_activo = false THEN
    RAISE NOTICE '❌ USUARIO INACTIVO';
    RAISE NOTICE '   SOLUCIÓN: UPDATE usuario SET activo = true WHERE email = ''%'';', v_email;
    RETURN;
  END IF;
  
  -- Verificar permisos
  v_puede_crear_drivers := v_rol IN ('admin', 'superusuario', 'rrhh');
  v_puede_crear_maintenance := v_rol IN ('admin', 'superusuario', 'mecanico', 'supervisor');
  
  RAISE NOTICE '✅ USUARIO ENCONTRADO Y ACTIVO';
  RAISE NOTICE '   Email: %', v_email;
  RAISE NOTICE '   Rol: %', v_rol;
  RAISE NOTICE '';
  RAISE NOTICE 'PERMISOS:';
  
  IF v_puede_crear_drivers THEN
    RAISE NOTICE '   ✅ Puede crear conductores (drivers)';
  ELSE
    RAISE NOTICE '   ❌ NO puede crear conductores (necesita rol: admin/superusuario/rrhh)';
  END IF;
  
  IF v_puede_crear_maintenance THEN
    RAISE NOTICE '   ✅ Puede crear órdenes de mantenimiento';
  ELSE
    RAISE NOTICE '   ❌ NO puede crear órdenes de mantenimiento (necesita rol: admin/superusuario/mecanico/supervisor)';
  END IF;
  
END $$;

\echo ''
\echo '=================================================='
\echo '🏁 DIAGNÓSTICO COMPLETADO'
\echo '=================================================='
\echo ''
\echo 'PRÓXIMOS PASOS:'
\echo '1. Si aparece "EMAIL NO EXISTE EN TABLA usuario":'
\echo '   → Edita y ejecuta 20251210_add_admin_user.sql'
\echo ''
\echo '2. Si aparece "NO HAY USUARIO AUTENTICADO":'
\echo '   → Inicia sesión en la aplicación primero'
\echo ''
\echo '3. Si las políticas RLS no aparecen:'
\echo '   → Ejecuta 20251210_complete_rls_policies.sql'
\echo ''
\echo '4. Si el rol no tiene permisos suficientes:'
\echo '   → UPDATE usuario SET rol = ''admin'' WHERE email = ''tu_email'';'
\echo ''
