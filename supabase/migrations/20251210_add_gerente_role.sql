-- =====================================================
-- Agregar Usuario GERENTE (Manager/Gestor)
-- =====================================================
-- Descripción: Crea usuario específico para rol de Gerente
-- Fecha: 2025-12-10
-- Versión: 1.0.0
-- HU: HU22 - Dashboard de KPIs para gerentes

-- =====================================================
-- 1. Asegurar que pgcrypto está instalado
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. Agregar 'gerente' a los roles permitidos
-- =====================================================

-- Primero, eliminar el constraint existente si existe
ALTER TABLE public.usuario DROP CONSTRAINT IF EXISTS usuario_rol_check;

-- Recrear el constraint incluyendo 'gerente' como rol válido
-- Nota: Mantiene todos los roles existentes y agrega 'gerente'
ALTER TABLE public.usuario ADD CONSTRAINT usuario_rol_check 
  CHECK (rol IN ('superusuario', 'admin', 'operador', 'conductor', 'rrhh', 'supervisor', 'planificador', 'mecanico', 'gerente'));

-- =====================================================
-- 3. Crear usuario GERENTE
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
  'gerente',
  -- Password: 'Gerente123!' (hasheada con crypt bcrypt)
  crypt('Gerente123!', gen_salt('bf')),
  'gerente',
  'gerente@flotavehicular.com',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE
  SET 
    rol = EXCLUDED.rol,
    activo = true,
    email = EXCLUDED.email,
    password_hash = crypt('Gerente123!', gen_salt('bf')),
    fecha_creacion = COALESCE(usuario.fecha_creacion, NOW())
RETURNING id_usuario, username, email, rol;

-- =====================================================
-- 4. Mensaje de confirmación
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Usuario GERENTE creado exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '👤 USUARIO GERENTE:';
  RAISE NOTICE '   📧 Email: gerente@flotavehicular.com';
  RAISE NOTICE '   👤 Username: gerente';
  RAISE NOTICE '   🔑 Password: Gerente123!';
  RAISE NOTICE '   🎭 Rol: gerente (Gestor Operativo)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Permisos del rol GERENTE:';
  RAISE NOTICE '   ✅ Acceso a Dashboard de KPIs';
  RAISE NOTICE '   ✅ Ver reportes de consumo de combustible';
  RAISE NOTICE '   ✅ Ver reportes de costos de mantenimiento';
  RAISE NOTICE '   ✅ Consultar eficiencia de rutas';
  RAISE NOTICE '   ✅ Ver reportes agregados de incidentes';
  RAISE NOTICE '   ✅ Filtrar datos por período y vehículo';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Cambiar contraseña en el primer login';
END $$;

-- =====================================================
