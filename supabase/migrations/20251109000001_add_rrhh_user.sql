-- =====================================================
-- Agregar Usuario RRHH (Recursos Humanos)
-- =====================================================
-- Descripción: Crea usuario específico para rol de RRHH
-- Fecha: 2025-11-09
-- Versión: 1.0.0
-- Issue: #50 - CRUD de Conductores para RRHH

-- =====================================================
-- 1. Asegurar que pgcrypto está instalado
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. Agregar 'rrhh' a los roles permitidos
-- =====================================================

-- Primero, eliminar el constraint existente si existe
ALTER TABLE public.usuario DROP CONSTRAINT IF EXISTS usuario_rol_check;

-- Recrear el constraint incluyendo 'rrhh' como rol válido
-- Nota: Ajusta esta lista según los roles que ya existían en tu sistema
ALTER TABLE public.usuario ADD CONSTRAINT usuario_rol_check 
  CHECK (rol IN ('superusuario', 'admin', 'operador', 'conductor', 'rrhh'));

-- =====================================================
-- 3. Crear usuario RRHH
-- =====================================================

INSERT INTO public.usuario (
  username,
  password_hash,
  rol,
  email,
  activo,
  fecha_creacion
) 
VALUES (
  'rrhh',
  -- Password: 'RRHH2025!' (hasheada con crypt bcrypt)
  crypt('RRHH2025!', gen_salt('bf')),
  'rrhh',
  'rrhh@flotavehicular.com',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE
  SET 
    rol = EXCLUDED.rol,
    activo = true,
    email = EXCLUDED.email,
    password_hash = crypt('RRHH2025!', gen_salt('bf')),
    fecha_creacion = COALESCE(usuario.fecha_creacion, NOW())
RETURNING id_usuario, username, email, rol;

-- =====================================================
-- 4. Mensaje de confirmación
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Usuario RRHH creado exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '👤 USUARIO RRHH:';
  RAISE NOTICE '   📧 Email: rrhh@flotavehicular.com';
  RAISE NOTICE '   👤 Username: rrhh';
  RAISE NOTICE '   🔑 Password: RRHH2025!';
  RAISE NOTICE '   🎭 Rol: rrhh (Recursos Humanos)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Permisos del rol RRHH:';
  RAISE NOTICE '   ✅ Gestión completa de conductores (CRUD)';
  RAISE NOTICE '   ✅ Consultar vehículos (solo lectura)';
  RAISE NOTICE '   ✅ Ver alertas de licencias por vencer';
  RAISE NOTICE '   ✅ Generar reportes de conductores';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Cambiar contraseña en el primer login';
END $$;

-- =====================================================
-- 5. Verificación
-- =====================================================

SELECT 
  id_usuario,
  username,
  email,
  rol,
  activo,
  fecha_creacion
FROM public.usuario
WHERE username = 'rrhh';
