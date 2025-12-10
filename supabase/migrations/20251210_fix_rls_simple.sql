-- =====================================================
-- FIX RLS - Permitir SELECT a todos, restringir INSERT/UPDATE/DELETE
-- =====================================================
-- Solución: Lectura libre, escritura solo con rol adecuado

-- =====================================================
-- 1. HABILITAR RLS
-- =====================================================
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. LIMPIAR POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "drivers_select_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_policy" ON public.drivers;
DROP POLICY IF EXISTS "gerente_view_drivers" ON public.drivers;
DROP POLICY IF EXISTS "Planificador can view drivers" ON public.drivers;

DROP POLICY IF EXISTS "maintenance_orders_select_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_insert_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_update_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_delete_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "gerente_view_maintenance_orders" ON public.maintenance_orders;

DROP POLICY IF EXISTS "vehicles_select_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_policy" ON public.vehicles;
DROP POLICY IF EXISTS "gerente_view_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Authenticated users can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Anon users can view vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "incidents_select_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_insert_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_update_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_delete_policy" ON public.incidents;
DROP POLICY IF EXISTS "gerente_view_incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can insert alerts" ON public.incidents;

-- =====================================================
-- 3. POLÍTICAS SELECT - TODOS PUEDEN LEER
-- =====================================================

-- DRIVERS: Lectura para todos
CREATE POLICY "drivers_select_public"
  ON public.drivers FOR SELECT
  USING (true);

-- MAINTENANCE_ORDERS: Lectura para todos
CREATE POLICY "maintenance_orders_select_public"
  ON public.maintenance_orders FOR SELECT
  USING (true);

-- VEHICLES: Lectura para todos
CREATE POLICY "vehicles_select_public"
  ON public.vehicles FOR SELECT
  USING (true);

-- INCIDENTS: Lectura para todos
CREATE POLICY "incidents_select_public"
  ON public.incidents FOR SELECT
  USING (true);

-- =====================================================
-- 4. POLÍTICAS INSERT - SOLO CON ROL
-- =====================================================

-- DRIVERS: Solo admin, superusuario, rrhh
CREATE POLICY "drivers_insert_restricted"
  ON public.drivers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh')
      AND usuario.activo = true
    )
  );

-- MAINTENANCE_ORDERS: admin, superusuario, mecanico, supervisor
CREATE POLICY "maintenance_orders_insert_restricted"
  ON public.maintenance_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario', 'mecanico', 'supervisor')
      AND usuario.activo = true
    )
  );

-- VEHICLES: Solo admin, superusuario
CREATE POLICY "vehicles_insert_restricted"
  ON public.vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- INCIDENTS: Todos los autenticados pueden reportar
CREATE POLICY "incidents_insert_public"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 5. POLÍTICAS UPDATE
-- =====================================================

CREATE POLICY "drivers_update_restricted"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh', 'supervisor')
      AND usuario.activo = true
    )
  );

CREATE POLICY "maintenance_orders_update_restricted"
  ON public.maintenance_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario', 'mecanico', 'supervisor')
      AND usuario.activo = true
    )
  );

CREATE POLICY "vehicles_update_restricted"
  ON public.vehicles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario', 'mecanico', 'supervisor')
      AND usuario.activo = true
    )
  );

CREATE POLICY "incidents_update_restricted"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario', 'supervisor')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- 6. POLÍTICAS DELETE
-- =====================================================

CREATE POLICY "drivers_delete_restricted"
  ON public.drivers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

CREATE POLICY "maintenance_orders_delete_restricted"
  ON public.maintenance_orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

CREATE POLICY "vehicles_delete_restricted"
  ON public.vehicles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

CREATE POLICY "incidents_delete_restricted"
  ON public.incidents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = (SELECT auth.jwt()->>'email')
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- 7. PERMISOS DE TABLA
-- =====================================================

GRANT SELECT ON TABLE public.drivers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.drivers TO authenticated;

GRANT SELECT ON TABLE public.maintenance_orders TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.maintenance_orders TO authenticated;

GRANT SELECT ON TABLE public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.vehicles TO authenticated;

GRANT SELECT ON TABLE public.incidents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.incidents TO authenticated;

-- Secuencias
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'drivers_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.drivers_id_seq TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'maintenance_orders_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.maintenance_orders_id_seq TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vehicles_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.vehicles_id_seq TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'incidents_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.incidents_id_seq TO authenticated;
  END IF;
END $$;

-- =====================================================
-- CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS CONFIGURADO CORRECTAMENTE';
  RAISE NOTICE '';
  RAISE NOTICE '📖 LECTURA (SELECT): Todos pueden ver datos';
  RAISE NOTICE '✏️  ESCRITURA (INSERT/UPDATE/DELETE): Requiere rol en tabla usuario';
  RAISE NOTICE '';
  RAISE NOTICE 'Para crear/editar datos, tu email debe estar en tabla usuario con rol apropiado';
END $$;
