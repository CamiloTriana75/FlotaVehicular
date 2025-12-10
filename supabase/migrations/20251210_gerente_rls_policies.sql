-- =====================================================
-- Políticas RLS para rol GERENTE
-- =====================================================
-- Descripción: Concede acceso a tablas necesarias para KPI dashboard
-- Fecha: 2025-12-10
-- HU: HU22 - Dashboard de KPIs para gerentes

-- =====================================================
-- PREREQUISITO: Habilitar RLS si está deshabilitado
-- =====================================================

-- Habilitar RLS en maintenance_orders si no está habilitado
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en vehicles si no está habilitado
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en incidents si no está habilitado
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en drivers si no está habilitado
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: maintenance_orders (Gerente puede leer)
-- =====================================================

DROP POLICY IF EXISTS "gerente_view_maintenance_orders" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_gerente_read" ON public.maintenance_orders;

CREATE POLICY "gerente_view_maintenance_orders"
  ON public.maintenance_orders
  FOR SELECT
  TO authenticated
  USING (
    -- Gerente, admin, superusuario pueden ver todos los registros
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('gerente', 'admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- POLÍTICAS: vehicles (Gerente puede leer)
-- =====================================================

DROP POLICY IF EXISTS "gerente_view_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_gerente_read" ON public.vehicles;

CREATE POLICY "gerente_view_vehicles"
  ON public.vehicles
  FOR SELECT
  TO authenticated
  USING (
    -- Gerente, admin, superusuario pueden ver todos los vehículos
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('gerente', 'admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- POLÍTICAS: incidents (Gerente puede leer)
-- =====================================================

DROP POLICY IF EXISTS "gerente_view_incidents" ON public.incidents;
DROP POLICY IF EXISTS "incidents_gerente_read" ON public.incidents;

CREATE POLICY "gerente_view_incidents"
  ON public.incidents
  FOR SELECT
  TO authenticated
  USING (
    -- Gerente, admin, superusuario pueden ver todos los incidentes
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('gerente', 'admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- POLÍTICAS: drivers (Gerente puede leer)
-- =====================================================

DROP POLICY IF EXISTS "gerente_view_drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_gerente_read" ON public.drivers;

CREATE POLICY "gerente_view_drivers"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (
    -- Gerente, admin, superusuario, rrhh pueden ver todos los conductores
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('gerente', 'admin', 'superusuario', 'rrhh')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- PERMISOS DE TABLA
-- =====================================================

-- Otorgar SELECT a authenticated en las tablas necesarias
GRANT SELECT ON TABLE public.maintenance_orders TO authenticated;
GRANT SELECT ON TABLE public.vehicles TO authenticated;
GRANT SELECT ON TABLE public.incidents TO authenticated;
GRANT SELECT ON TABLE public.drivers TO authenticated;

-- Otorgar SELECT a anon en las tablas necesarias (para acceso sin autenticación si es necesario)
GRANT SELECT ON TABLE public.maintenance_orders TO anon;
GRANT SELECT ON TABLE public.vehicles TO anon;
GRANT SELECT ON TABLE public.incidents TO anon;
GRANT SELECT ON TABLE public.drivers TO anon;

-- =====================================================
-- CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS para GERENTE configuradas exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Permisos otorgados:';
  RAISE NOTICE '   ✅ maintenance_orders: SELECT para gerente, admin, superusuario';
  RAISE NOTICE '   ✅ vehicles: SELECT para gerente, admin, superusuario';
  RAISE NOTICE '   ✅ incidents: SELECT para gerente, admin, superusuario';
  RAISE NOTICE '   ✅ drivers: SELECT para gerente, admin, superusuario, rrhh';
  RAISE NOTICE '';
  RAISE NOTICE '💡 El gerente ahora puede acceder al Dashboard de KPIs con datos reales';
END $$;
