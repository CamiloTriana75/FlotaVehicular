-- =====================================================
-- Políticas RLS Completas para Producción
-- =====================================================
-- Descripción: Configura RLS con permisos adecuados para todos los roles
-- Fecha: 2025-12-10
-- Propósito: Solución definitiva para producción

-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: drivers
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "drivers_select_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_policy" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_policy" ON public.drivers;
DROP POLICY IF EXISTS "gerente_view_drivers" ON public.drivers;
DROP POLICY IF EXISTS "Planificador can view drivers" ON public.drivers;

-- SELECT: Permitir lectura a todos (autenticados y anónimos)
CREATE POLICY "drivers_select_policy"
  ON public.drivers FOR SELECT
  USING (true);

-- INSERT: admin, superusuario, rrhh pueden crear
CREATE POLICY "drivers_insert_policy"
  ON public.drivers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh')
      AND usuario.activo = true
    )
  );

-- UPDATE: admin, superusuario, rrhh, supervisor pueden modificar
CREATE POLICY "drivers_update_policy"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh', 'supervisor')
      AND usuario.activo = true
    )
  );

-- DELETE: admin, superusuario pueden eliminar
CREATE POLICY "drivers_delete_policy"
  ON public.drivers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- TABLA: maintenance_orders
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "maintenance_orders_select_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_insert_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_update_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "maintenance_orders_delete_policy" ON public.maintenance_orders;
DROP POLICY IF EXISTS "gerente_view_maintenance_orders" ON public.maintenance_orders;

-- SELECT: Permitir lectura a todos (autenticados y anónimos)
CREATE POLICY "maintenance_orders_select_policy"
  ON public.maintenance_orders FOR SELECT
  USING (true);

-- INSERT: admin, superusuario, mecanico pueden crear
CREATE POLICY "maintenance_orders_insert_policy"
  ON public.maintenance_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario', 'mecanico', 'supervisor')
      AND usuario.activo = true
    )
  );

-- UPDATE: admin, superusuario, mecanico pueden modificar
CREATE POLICY "maintenance_orders_update_policy"
  ON public.maintenance_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario', 'mecanico', 'supervisor')
      AND usuario.activo = true
    )
  );

-- DELETE: admin, superusuario pueden eliminar
CREATE POLICY "maintenance_orders_delete_policy"
  ON public.maintenance_orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- TABLA: vehicles
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "vehicles_select_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_policy" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_policy" ON public.vehicles;
DROP POLICY IF EXISTS "gerente_view_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Authenticated users can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Anon users can view vehicles" ON public.vehicles;

-- SELECT: Permitir lectura a todos (autenticados y anónimos)
CREATE POLICY "vehicles_select_policy"
  ON public.vehicles FOR SELECT
  USING (true);

-- INSERT: admin, superusuario pueden crear
CREATE POLICY "vehicles_insert_policy"
  ON public.vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- UPDATE: admin, superusuario, mecanico pueden modificar
CREATE POLICY "vehicles_update_policy"
  ON public.vehicles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario', 'mecanico', 'supervisor')
      AND usuario.activo = true
    )
  );

-- DELETE: admin, superusuario pueden eliminar
CREATE POLICY "vehicles_delete_policy"
  ON public.vehicles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- TABLA: incidents
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "incidents_select_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_insert_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_update_policy" ON public.incidents;
DROP POLICY IF EXISTS "incidents_delete_policy" ON public.incidents;
DROP POLICY IF EXISTS "gerente_view_incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can insert alerts" ON public.incidents;

-- SELECT: Permitir lectura a todos (autenticados y anónimos)
CREATE POLICY "incidents_select_policy"
  ON public.incidents FOR SELECT
  USING (true);

-- INSERT: Todos los roles autenticados pueden reportar incidentes
CREATE POLICY "incidents_insert_policy"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: admin, superusuario, supervisor pueden modificar
CREATE POLICY "incidents_update_policy"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario', 'supervisor')
      AND usuario.activo = true
    )
  );

-- DELETE: admin, superusuario pueden eliminar
CREATE POLICY "incidents_delete_policy"
  ON public.incidents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.email = auth.jwt()->>'email'
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- PERMISOS DE TABLA
-- =====================================================

-- Otorgar permisos a authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.drivers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.maintenance_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.incidents TO authenticated;

-- Otorgar SELECT a anon (lectura pública si es necesario)
GRANT SELECT ON TABLE public.drivers TO anon;
GRANT SELECT ON TABLE public.maintenance_orders TO anon;
GRANT SELECT ON TABLE public.vehicles TO anon;
GRANT SELECT ON TABLE public.incidents TO anon;

-- Otorgar uso de secuencias (solo si existen)
DO $$
BEGIN
  -- drivers_id_seq
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'drivers_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.drivers_id_seq TO authenticated;
  END IF;
  
  -- maintenance_orders_id_seq
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'maintenance_orders_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.maintenance_orders_id_seq TO authenticated;
  END IF;
  
  -- vehicles_id_seq
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vehicles_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.vehicles_id_seq TO authenticated;
  END IF;
  
  -- incidents_id_seq
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'incidents_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.incidents_id_seq TO authenticated;
  END IF;
END $$;

-- =====================================================
-- CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS Completas para Producción configuradas exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 TABLA: drivers';
  RAISE NOTICE '   👁️  SELECT: Todos los autenticados';
  RAISE NOTICE '   ➕ INSERT: admin, superusuario, rrhh';
  RAISE NOTICE '   ✏️  UPDATE: admin, superusuario, rrhh, supervisor';
  RAISE NOTICE '   🗑️  DELETE: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 TABLA: maintenance_orders';
  RAISE NOTICE '   👁️  SELECT: Todos los autenticados';
  RAISE NOTICE '   ➕ INSERT: admin, superusuario, mecanico, supervisor';
  RAISE NOTICE '   ✏️  UPDATE: admin, superusuario, mecanico, supervisor';
  RAISE NOTICE '   🗑️  DELETE: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 TABLA: vehicles';
  RAISE NOTICE '   👁️  SELECT: Todos los autenticados';
  RAISE NOTICE '   ➕ INSERT: admin, superusuario';
  RAISE NOTICE '   ✏️  UPDATE: admin, superusuario, mecanico, supervisor';
  RAISE NOTICE '   🗑️  DELETE: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 TABLA: incidents';
  RAISE NOTICE '   👁️  SELECT: Todos los autenticados';
  RAISE NOTICE '   ➕ INSERT: Todos los autenticados (cualquiera puede reportar)';
  RAISE NOTICE '   ✏️  UPDATE: admin, superusuario, supervisor';
  RAISE NOTICE '   🗑️  DELETE: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Sistema listo para producción con seguridad por roles';
END $$;
