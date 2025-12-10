-- =====================================================
-- Agregar usuario administrador para RLS
-- =====================================================
-- Descripción: Asegura que existe un usuario admin en la tabla usuario
-- Fecha: 2025-12-10
-- Propósito: Permitir que el usuario tenga permisos completos

-- Insertar usuario admin si no existe
-- IMPORTANTE: Cambia el email por el que usas para iniciar sesión en Supabase
INSERT INTO public.usuario (
  username,
  email,
  password_hash,
  rol,
  activo
) VALUES (
  'admin',
  'admin@flotavehicular.com', -- CAMBIA ESTE EMAIL por el tuyo
  '$2a$10$abcdefghijklmnopqrstuv', -- Hash de bcrypt (no se usa para Supabase Auth)
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  rol = 'admin',
  activo = true,
  updated_at = now();

-- Verificar el usuario
DO $$
DECLARE
  v_email text := 'admin@flotavehicular.com'; -- CAMBIA ESTE EMAIL también
  v_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.usuario WHERE email = v_email
  ) INTO v_exists;
  
  IF v_exists THEN
    RAISE NOTICE '✅ Usuario admin configurado correctamente: %', v_email;
  ELSE
    RAISE NOTICE '❌ ERROR: No se pudo crear el usuario admin';
  END IF;
END $$;

-- =====================================================
-- INSTRUCCIONES
-- =====================================================
-- 1. EDITA este archivo y cambia 'admin@flotavehicular.com' 
--    por el email que usas para iniciar sesión
-- 2. Ejecuta este archivo en Supabase SQL Editor
-- 3. Ejecuta el archivo 20251210_complete_rls_policies.sql
-- 4. Prueba crear un conductor desde la aplicación
