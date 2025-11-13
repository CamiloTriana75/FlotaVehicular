-- =====================================================
-- MIGRATION: Agregar rol de Planificador
-- Fecha: 2025-11-12
-- HU: HU10 - Crear y asignar rutas optimizadas
-- Descripción: Nuevo rol "planificador" con permisos
--              específicos para gestión de rutas
-- =====================================================

-- =====================================================
-- 1. Agregar el rol "planificador" al ENUM de roles
-- =====================================================

-- Primero, verificar si el tipo ya existe y actualizarlo
DO $$
BEGIN
  -- Agregar el nuevo valor al enum si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'planificador' 
    AND enumtypid = 'rol_usuario'::regtype
  ) THEN
    ALTER TYPE rol_usuario ADD VALUE 'planificador';
  END IF;
END $$;

-- =====================================================
-- 2. Crear usuario planificador de ejemplo
-- =====================================================

-- Insertar usuario planificador (contraseña: planificador123)
INSERT INTO usuario (nombre, email, password_hash, rol, estado)
VALUES (
  'María Planificadora',
  'planificador@flotavehicular.com',
  '$2a$10$YourHashedPasswordHere', -- Debes hashear con bcrypt
  'planificador',
  'activo'
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 3. Políticas RLS específicas para planificador
-- =====================================================

-- ROUTES: Planificador puede ver, crear, editar y eliminar rutas
DROP POLICY IF EXISTS "Planificador can manage routes" ON routes;
CREATE POLICY "Planificador can manage routes"
  ON routes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin')
    )
  );

-- ROUTE_ASSIGNMENTS: Planificador puede asignar rutas
DROP POLICY IF EXISTS "Planificador can manage assignments" ON route_assignments;
CREATE POLICY "Planificador can manage assignments"
  ON route_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin', 'operador')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin', 'operador')
    )
  );

-- DRIVERS: Planificador puede ver conductores (solo lectura)
DROP POLICY IF EXISTS "Planificador can view drivers" ON drivers;
CREATE POLICY "Planificador can view drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin', 'rrhh', 'operador')
    )
  );

-- VEHICLES: Planificador puede ver vehículos (solo lectura)
DROP POLICY IF EXISTS "Planificador can view vehicles" ON vehicles;
CREATE POLICY "Planificador can view vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin', 'operador')
    )
  );

-- ASSIGNMENTS: Planificador puede ver asignaciones conductor-vehículo
DROP POLICY IF EXISTS "Planificador can view assignments" ON assignments;
CREATE POLICY "Planificador can view assignments"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario
      WHERE usuario.id::text = auth.uid()::text
      AND usuario.rol IN ('planificador', 'superusuario', 'admin', 'operador', 'supervisor')
    )
  );

-- =====================================================
-- 4. Comentarios de documentación
-- =====================================================

COMMENT ON TYPE rol_usuario IS 'Roles disponibles: superusuario, admin, planificador, operador, mecanico, conductor, rrhh, supervisor';

-- =====================================================
-- 5. Mensaje de confirmación
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Rol "planificador" agregado exitosamente';
  RAISE NOTICE 'Permisos del planificador:';
  RAISE NOTICE '  - Gestión completa de rutas (crear, editar, eliminar)';
  RAISE NOTICE '  - Asignación de rutas a conductores/vehículos';
  RAISE NOTICE '  - Visualización de conductores y vehículos (solo lectura)';
  RAISE NOTICE '  - Visualización de asignaciones conductor-vehículo';
END $$;
