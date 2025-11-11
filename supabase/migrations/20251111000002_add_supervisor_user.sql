-- =====================================================
-- Agregar Usuario Supervisor
-- =====================================================
-- Descripción: Crea un usuario supervisor para gestión de asignaciones
-- Fecha: 2025-11-11
-- Versión: 1.0.0

-- =====================================================
-- 1. Verificar extensión pgcrypto
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1.5. Agregar 'supervisor' al constraint de roles
-- =====================================================

-- Eliminar el constraint existente
ALTER TABLE public.usuario DROP CONSTRAINT IF EXISTS usuario_rol_check;

-- Recrear el constraint incluyendo 'supervisor' como rol válido
ALTER TABLE public.usuario ADD CONSTRAINT usuario_rol_check
    CHECK (rol IN ('superusuario', 'admin', 'operador', 'conductor', 'rrhh', 'supervisor'));

-- =====================================================
-- 2. Crear usuario supervisor
-- =====================================================

-- Usuario Supervisor 1
INSERT INTO public.usuario (
  username,
  password_hash,
  rol,
  email,
  activo,
  fecha_creacion
) 
VALUES (
  'supervisor',
  -- Password: 'Supervisor123!' (hasheada con crypt)
  crypt('Supervisor123!', gen_salt('bf')),
  'supervisor',
  'supervisor@flotavehicular.com',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE
  SET 
    rol = EXCLUDED.rol,
    activo = true,
    email = EXCLUDED.email,
    password_hash = crypt('Supervisor123!', gen_salt('bf'))
RETURNING id_usuario, username, email, rol;

-- Usuario Supervisor 2 (backup/alternativo)
INSERT INTO public.usuario (
  username,
  password_hash,
  rol,
  email,
  activo,
  fecha_creacion
) 
VALUES (
  'supervisor_turnos',
  -- Password: 'Turnos2025$' (hasheada con crypt)
  crypt('Turnos2025$', gen_salt('bf')),
  'supervisor',
  'turnos@flotavehicular.com',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE
  SET 
    rol = EXCLUDED.rol,
    activo = true,
    email = EXCLUDED.email,
    password_hash = crypt('Turnos2025$', gen_salt('bf'))
RETURNING id_usuario, username, email, rol;

-- =====================================================
-- 3. Si usas tabla 'users' en lugar de 'usuario'
-- =====================================================

-- Comentado por defecto. Descomenta si usas la tabla 'users':

/*
-- Obtener o crear una compañía para asignar al supervisor
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Intentar obtener la primera compañía
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  -- Si no existe, crear una
  IF v_company_id IS NULL THEN
    INSERT INTO companies (name, nit, email)
    VALUES ('FleetManager Demo', '900.123.456-7', 'demo@fleetmanager.com')
    RETURNING id INTO v_company_id;
  END IF;

  -- Crear usuario supervisor en tabla users
  INSERT INTO public.users (
    email,
    first_name,
    last_name,
    role,
    company_id,
    is_active,
    created_at
  ) 
  VALUES (
    'supervisor@flotavehicular.com',
    'Supervisor',
    'General',
    'supervisor',
    v_company_id,
    true,
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
    SET 
      role = EXCLUDED.role,
      is_active = true
  RETURNING id, email, first_name, last_name, role;
END $$;
*/

-- =====================================================
-- 4. Mensaje de confirmación
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Usuarios supervisores creados exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '👤 SUPERVISOR 1:';
  RAISE NOTICE '   📧 Email: supervisor@flotavehicular.com';
  RAISE NOTICE '   👤 Username: supervisor';
  RAISE NOTICE '   🔑 Password: Supervisor123!';
  RAISE NOTICE '';
  RAISE NOTICE '👤 SUPERVISOR 2:';
  RAISE NOTICE '   📧 Email: turnos@flotavehicular.com';
  RAISE NOTICE '   👤 Username: supervisor_turnos';
  RAISE NOTICE '   🔑 Password: Turnos2025$';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Cambiar estas contraseñas en el primer login';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PERMISOS DEL SUPERVISOR:';
  RAISE NOTICE '   ✅ Crear y gestionar asignaciones de vehículos a conductores';
  RAISE NOTICE '   ✅ Ver y editar información de conductores y vehículos';
  RAISE NOTICE '   ✅ Gestionar turnos y horarios';
  RAISE NOTICE '   ✅ Ver reportes y estadísticas';
END $$;

-- =====================================================
-- 5. Verificación
-- =====================================================

-- Verificar que los usuarios fueron creados
SELECT 
  id_usuario,
  username,
  email,
  rol,
  activo,
  fecha_creacion
FROM public.usuario
WHERE username IN ('supervisor', 'supervisor_turnos')
ORDER BY username;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. La contraseña está hasheada con bcrypt usando gen_salt('bf')
-- 2. Requiere que la extensión pgcrypto esté instalada
-- 3. Credenciales creadas:
--
--    SUPERVISOR 1:
--    - Username: supervisor
--    - Email: supervisor@flotavehicular.com
--    - Password: Supervisor123!
--    - Rol: supervisor
--
--    SUPERVISOR 2:
--    - Username: supervisor_turnos
--    - Email: turnos@flotavehicular.com
--    - Password: Turnos2025$
--    - Rol: supervisor
--
-- 4. CAMBIAR LAS CONTRASEÑAS inmediatamente después del primer login
-- 5. Si los usuarios ya existen, se actualizan con los nuevos datos
-- 6. El rol 'supervisor' tiene permisos para:
--    - Crear/editar/eliminar asignaciones de vehículos
--    - Gestionar turnos y horarios
--    - Ver información de conductores y vehículos
--    - Acceder a reportes y estadísticas
