-- =====================================================
-- SOLUCIÓN TEMPORAL: Desactivar RLS en múltiples tablas
-- =====================================================
-- ⚠️ ADVERTENCIA: Esta es una solución temporal
-- Solo usar en desarrollo mientras aplicas la migración completa
-- =====================================================

-- Desactivar RLS temporalmente en drivers
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS temporalmente en maintenance_orders
ALTER TABLE public.maintenance_orders DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS temporalmente en vehicles (por si acaso)
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;

-- Desactivar RLS temporalmente en incidents (por si acaso)
ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '⚠️ RLS DESACTIVADO TEMPORALMENTE en múltiples tablas';
  RAISE NOTICE '';
  RAISE NOTICE '🔓 Tablas sin RLS (solo desarrollo):';
  RAISE NOTICE '   ✅ drivers';
  RAISE NOTICE '   ✅ maintenance_orders';
  RAISE NOTICE '   ✅ vehicles';
  RAISE NOTICE '   ✅ incidents';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ahora puedes crear/editar registros sin restricciones';
  RAISE NOTICE '';
  RAISE NOTICE '❗ IMPORTANTE: Esta es una solución temporal';
  RAISE NOTICE '   Debes aplicar las migraciones completas lo antes posible:';
  RAISE NOTICE '   📄 supabase/migrations/20251210_gerente_rls_policies.sql';
  RAISE NOTICE '   📄 supabase/migrations/20251210_drivers_rls_policies.sql';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Después de aplicar las migraciones completas, tendrás:';
  RAISE NOTICE '   - Permisos por rol (admin, rrhh, supervisor, gerente, mecanico, etc.)';
  RAISE NOTICE '   - Seguridad adecuada en producción';
END $$;
