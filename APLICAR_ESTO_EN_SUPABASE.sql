-- =====================================================
-- 🚀 SOLUCIÓN COMPLETA - COPIAR Y PEGAR EN SUPABASE
-- =====================================================
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard
-- 2. Abre tu proyecto FlotaVehicular
-- 3. Ve a SQL Editor (menú lateral)
-- 4. Copia TODO este archivo
-- 5. Pega en el editor
-- 6. Haz clic en RUN (▶️)
-- =====================================================

-- PASO 1: Verificar qué usuarios existen
DO $$
BEGIN
  RAISE NOTICE '📋 Verificando usuarios existentes...';
END $$;

SELECT 
  id_usuario,
  username,
  email,
  rol,
  activo,
  CASE 
    WHEN activo THEN '✅ ACTIVO'
    ELSE '❌ INACTIVO'
  END as estado
FROM public.usuario
ORDER BY rol, email;

-- =====================================================
-- PASO 2: APLICAR POLÍTICAS RLS COMPLETAS
-- =====================================================

-- Habilitar RLS en todas las tablas
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
-- PASO 3: VERIFICAR POLÍTICAS APLICADAS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ========================================';
  RAISE NOTICE '✅ POLÍTICAS RLS APLICADAS EXITOSAMENTE';
  RAISE NOTICE '✅ ========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 PERMISOS CONFIGURADOS:';
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLA: drivers';
  RAISE NOTICE '   👁️  Ver: Todos';
  RAISE NOTICE '   ➕ Crear: admin, superusuario, rrhh';
  RAISE NOTICE '   ✏️  Editar: admin, superusuario, rrhh, supervisor';
  RAISE NOTICE '   🗑️  Eliminar: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 TABLA: maintenance_orders';
  RAISE NOTICE '   👁️  Ver: Todos';
  RAISE NOTICE '   ➕ Crear: admin, superusuario, mecanico, supervisor';
  RAISE NOTICE '   ✏️  Editar: admin, superusuario, mecanico, supervisor';
  RAISE NOTICE '   🗑️  Eliminar: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '🚗 TABLA: vehicles';
  RAISE NOTICE '   👁️  Ver: Todos';
  RAISE NOTICE '   ➕ Crear: admin, superusuario';
  RAISE NOTICE '   ✏️  Editar: admin, superusuario, mecanico, supervisor';
  RAISE NOTICE '   🗑️  Eliminar: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  TABLA: incidents';
  RAISE NOTICE '   👁️  Ver: Todos';
  RAISE NOTICE '   ➕ Crear: Todos (cualquiera puede reportar)';
  RAISE NOTICE '   ✏️  Editar: admin, superusuario, supervisor';
  RAISE NOTICE '   🗑️  Eliminar: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '📝 SIGUIENTE PASO:';
  RAISE NOTICE '   1. Verifica tu email en la tabla usuario (consulta arriba)';
  RAISE NOTICE '   2. Asegúrate de tener rol admin o superusuario';
  RAISE NOTICE '   3. Cierra sesión y vuelve a iniciar sesión';
  RAISE NOTICE '   4. ¡Prueba a crear conductores y mantenimientos!';
  RAISE NOTICE '';
END $$;

-- Mostrar políticas creadas
SELECT 
  tablename,
  policyname,
  cmd as operacion,
  CASE 
    WHEN roles::text = '{authenticated}' THEN '🔒 Autenticados'
    WHEN roles::text = '{anon}' THEN '🌐 Anónimos'
    ELSE roles::text
  END as roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('drivers', 'maintenance_orders', 'vehicles', 'incidents')
ORDER BY tablename, cmd;
