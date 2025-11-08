-- =====================================================
-- Función de Autenticación Personalizada
-- =====================================================
-- Descripción: Valida credenciales contra la tabla 'usuario'
-- Fecha: 2025-11-08
-- Versión: 1.0.0

-- IMPORTANTE: Esta función permite autenticación sin usar Supabase Auth
-- Se usa para validar usuarios almacenados en la tabla 'usuario' legacy

-- =====================================================
-- 1. Asegurar que pgcrypto está instalado
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. Función para validar login
-- =====================================================

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS public.validate_user_login(text, text);

-- Crear función de validación
CREATE OR REPLACE FUNCTION public.validate_user_login(
  p_username text,
  p_password text
)
RETURNS TABLE(
  id_usuario integer,
  username varchar,
  email varchar,
  rol varchar,
  activo boolean,
  success boolean,
  message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Buscar usuario por username o email
  RETURN QUERY
  SELECT 
    u.id_usuario,
    u.username,
    u.email,
    u.rol,
    u.activo,
    CASE 
      WHEN u.id_usuario IS NULL THEN false
      WHEN NOT u.activo THEN false
      WHEN u.password_hash = crypt(p_password, u.password_hash) THEN true
      ELSE false
    END as success,
    CASE 
      WHEN u.id_usuario IS NULL THEN 'Usuario no encontrado'
      WHEN NOT u.activo THEN 'Usuario inactivo'
      WHEN u.password_hash = crypt(p_password, u.password_hash) THEN 'Login exitoso'
      ELSE 'Contraseña incorrecta'
    END as message
  FROM public.usuario u
  WHERE u.username = p_username OR u.email = p_username
  LIMIT 1;
  
  -- Si no se encontró ningún usuario, retornar error
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      NULL::integer,
      NULL::varchar,
      NULL::varchar,
      NULL::varchar,
      NULL::boolean,
      false,
      'Usuario no encontrado'::text;
  END IF;
END;
$$;

-- =====================================================
-- 3. Permisos de la función
-- =====================================================

-- Permitir que usuarios anónimos ejecuten esta función
GRANT EXECUTE ON FUNCTION public.validate_user_login(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_user_login(text, text) TO authenticated;

-- =====================================================
-- 4. Función auxiliar para cambiar contraseña
-- =====================================================

DROP FUNCTION IF EXISTS public.change_user_password(integer, text, text);

CREATE OR REPLACE FUNCTION public.change_user_password(
  p_user_id integer,
  p_old_password text,
  p_new_password text
)
RETURNS TABLE(
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_hash varchar;
BEGIN
  -- Obtener hash actual
  SELECT password_hash INTO v_current_hash
  FROM public.usuario
  WHERE id_usuario = p_user_id;
  
  -- Verificar que el usuario existe
  IF v_current_hash IS NULL THEN
    RETURN QUERY SELECT false, 'Usuario no encontrado'::text;
    RETURN;
  END IF;
  
  -- Verificar contraseña anterior
  IF v_current_hash != crypt(p_old_password, v_current_hash) THEN
    RETURN QUERY SELECT false, 'Contraseña actual incorrecta'::text;
    RETURN;
  END IF;
  
  -- Actualizar contraseña
  UPDATE public.usuario
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id_usuario = p_user_id;
  
  RETURN QUERY SELECT true, 'Contraseña actualizada exitosamente'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_user_password(integer, text, text) TO authenticated;

-- =====================================================
-- 5. Prueba de la función
-- =====================================================

-- Probar con usuario admin
SELECT * FROM public.validate_user_login('admin', 'Admin123!');

-- Probar con usuario jtrianaadmin
SELECT * FROM public.validate_user_login('jtrianaadmin', 'Flota2025$Secure');

-- Probar con email
SELECT * FROM public.validate_user_login('admin@flotavehicular.com', 'Admin123!');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. La función validate_user_login acepta username o email
-- 2. Retorna toda la información del usuario si las credenciales son válidas
-- 3. La contraseña se valida usando crypt() contra el hash almacenado
-- 4. La función está marcada como SECURITY DEFINER para poder acceder a password_hash
-- 5. Los usuarios anónimos pueden ejecutarla (necesario para el login)
-- 6. La función change_user_password permite cambiar contraseñas de forma segura
