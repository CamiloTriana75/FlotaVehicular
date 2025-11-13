-- =====================================================
-- SCRIPT: Crear Usuario Operador
-- Descripción: Usuario con acceso solo al monitoreo en tiempo real
-- Fecha: 2025-11-12
-- =====================================================

-- 1. Crear usuario en auth.users (ejecutar vía Dashboard de Supabase o API)
-- Correo: operador@flotavehicular.com
-- Contraseña: Operador2024!

-- 2. Registrar en tabla users (ejecutar después de crear en auth)
INSERT INTO users (
  id,
  email,
  nombre_completo,
  rol,
  estado,
  created_at,
  updated_at
) VALUES (
  -- El ID se obtiene de auth.users después de crear el usuario
  -- Reemplazar 'UUID_DEL_USUARIO_AUTH' con el UUID real de auth.users
  (SELECT id FROM auth.users WHERE email = 'operador@flotavehicular.com' LIMIT 1),
  'operador@flotavehicular.com',
  'Usuario Operador',
  'operador',
  'activo',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  rol = 'operador',
  estado = 'activo',
  updated_at = NOW();

-- 3. Verificar el usuario
SELECT 
  u.id,
  u.email,
  u.nombre_completo,
  u.rol,
  u.estado,
  u.created_at
FROM users u
WHERE u.email = 'operador@flotavehicular.com';

-- =====================================================
-- CREDENCIALES DEL USUARIO OPERADOR
-- =====================================================
-- Email: operador@flotavehicular.com
-- Password: Operador2024!
-- Rol: operador
-- Permisos: 
--   - Ver monitoreo en tiempo real (mapa)
--   - Ver ubicaciones de vehículos
--   - Ver alertas (solo lectura)
-- Restricciones:
--   - NO puede editar configuración de alertas
--   - NO puede gestionar vehículos
--   - NO puede gestionar conductores
--   - NO puede acceder a RRHH
-- =====================================================

-- 4. [OPCIONAL] Si necesitas crear el usuario directamente en Supabase SQL:
-- Nota: Esto solo funciona si tienes acceso directo a auth.users
-- Normalmente se debe crear desde el Dashboard de Supabase o con la API

/*
-- Crear en auth.users (requiere permisos especiales)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'operador@flotavehicular.com',
  crypt('Operador2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '{"provider":"email","providers":["email"]}',
  '{"nombre_completo":"Usuario Operador"}'
);
*/

-- =====================================================
-- MÉTODO RECOMENDADO: Crear desde Supabase Dashboard
-- =====================================================
-- 1. Ve a tu proyecto Supabase: https://supabase.com/dashboard
-- 2. Authentication → Users → Add user
-- 3. Email: operador@flotavehicular.com
-- 4. Password: Operador2024!
-- 5. Auto Confirm User: YES (marcar)
-- 6. Copiar el UUID del usuario creado
-- 7. Ejecutar el INSERT INTO users con ese UUID
-- =====================================================
