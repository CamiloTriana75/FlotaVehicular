-- =====================================================
-- Políticas RLS para tabla DRIVERS
-- =====================================================
-- Descripción: Concede acceso completo a tabla drivers para roles administrativos
-- Fecha: 2025-12-10
-- HU: Gestión de conductores con permisos por rol

-- =====================================================
-- PREREQUISITO: Habilitar RLS si está deshabilitado
-- =====================================================

-- Habilitar RLS en drivers si no está habilitado
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: drivers - SELECT (Ver conductores)
-- =====================================================

DROP POLICY IF EXISTS "admin_view_drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_admin_read" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_policy" ON public.drivers;

CREATE POLICY "drivers_select_policy"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (
    -- Admin, superusuario, supervisor, rrhh, gerente, planificador pueden ver todos los conductores
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('admin', 'superusuario', 'supervisor', 'rrhh', 'gerente', 'planificador')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- POLÍTICAS: drivers - INSERT (Crear conductores)
-- =====================================================

DROP POLICY IF EXISTS "admin_insert_drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert_policy" ON public.drivers;

CREATE POLICY "drivers_insert_policy"
  ON public.drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Solo admin, superusuario y rrhh pueden crear conductores
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- POLÍTICAS: drivers - UPDATE (Modificar conductores)
-- =====================================================

DROP POLICY IF EXISTS "admin_update_drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_policy" ON public.drivers;

CREATE POLICY "drivers_update_policy"
  ON public.drivers
  FOR UPDATE
  TO authenticated
  USING (
    -- Admin, superusuario, rrhh y supervisor pueden modificar conductores
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh', 'supervisor')
      AND usuario.activo = true
    )
  )
  WITH CHECK (
    -- Misma verificación para el nuevo estado
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('admin', 'superusuario', 'rrhh', 'supervisor')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- POLÍTICAS: drivers - DELETE (Eliminar conductores)
-- =====================================================

DROP POLICY IF EXISTS "admin_delete_drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete_policy" ON public.drivers;

CREATE POLICY "drivers_delete_policy"
  ON public.drivers
  FOR DELETE
  TO authenticated
  USING (
    -- Solo admin y superusuario pueden eliminar conductores
    EXISTS (
      SELECT 1 FROM public.usuario
      WHERE usuario.id_usuario = COALESCE(
        (SELECT id_usuario FROM public.usuario WHERE email = auth.jwt()->>'email'),
        0
      )
      AND usuario.rol IN ('admin', 'superusuario')
      AND usuario.activo = true
    )
  );

-- =====================================================
-- PERMISOS DE TABLA
-- =====================================================

-- Otorgar permisos a authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.drivers TO authenticated;

-- Otorgar SELECT a anon (solo lectura para usuarios no autenticados)
GRANT SELECT ON TABLE public.drivers TO anon;

-- Otorgar uso de la secuencia para INSERT
GRANT USAGE, SELECT ON SEQUENCE public.drivers_id_seq TO authenticated;

-- =====================================================
-- CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS para tabla DRIVERS configuradas exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Permisos otorgados:';
  RAISE NOTICE '   ✅ SELECT: admin, superusuario, supervisor, rrhh, gerente, planificador';
  RAISE NOTICE '   ✅ INSERT: admin, superusuario, rrhh';
  RAISE NOTICE '   ✅ UPDATE: admin, superusuario, rrhh, supervisor';
  RAISE NOTICE '   ✅ DELETE: admin, superusuario';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Los roles administrativos ahora pueden gestionar conductores';
END $$;
