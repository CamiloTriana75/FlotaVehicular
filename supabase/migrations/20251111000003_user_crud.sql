-- =====================================================
-- CRUD Básico de Usuarios (Funciones RPC)
-- Fecha: 2025-11-11
-- Nota: Para este sprint se expone a 'anon' por simplicidad. Endurecer en prod.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Asegurar columnas de auditoría si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuario' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.usuario ADD COLUMN created_at timestamptz DEFAULT now()';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuario' AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.usuario ADD COLUMN updated_at timestamptz DEFAULT now()';
  END IF;
END$$;

-- Permitir email opcional si actualmente es NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuario'
      AND column_name = 'email' AND is_nullable = 'NO'
  ) THEN
    EXECUTE 'ALTER TABLE public.usuario ALTER COLUMN email DROP NOT NULL';
  END IF;
END$$;

-- Crear usuario con contraseña (hash en DB)
DROP FUNCTION IF EXISTS public.create_user_with_password(text, text, text, text);
CREATE OR REPLACE FUNCTION public.create_user_with_password(
  p_username text,
  p_email text,
  p_rol text,
  p_password text
)
RETURNS TABLE(
  id_usuario integer,
  username varchar,
  email varchar,
  rol varchar,
  activo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id integer;
BEGIN
  INSERT INTO public.usuario (username, email, rol, password_hash, activo, created_at, updated_at)
  VALUES (p_username, p_email, p_rol, crypt(p_password, gen_salt('bf')), true, NOW(), NOW())
  RETURNING public.usuario.id_usuario INTO v_id;

  RETURN QUERY
  SELECT u.id_usuario, u.username, u.email, u.rol, u.activo
  FROM public.usuario u
  WHERE u.id_usuario = v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_with_password(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_with_password(text, text, text, text) TO authenticated;

-- Actualizar rol de usuario
DROP FUNCTION IF EXISTS public.update_user_role(integer, text);
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id integer,
  p_rol text
)
RETURNS TABLE(
  id_usuario integer,
  username varchar,
  email varchar,
  rol varchar,
  activo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usuario
  SET rol = p_rol,
      updated_at = NOW()
  WHERE public.usuario.id_usuario = p_user_id;

  RETURN QUERY
  SELECT u.id_usuario, u.username, u.email, u.rol, u.activo
  FROM public.usuario u
  WHERE u.id_usuario = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_role(integer, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_role(integer, text) TO authenticated;

-- Actualizar perfil (nombre/email/rol)
DROP FUNCTION IF EXISTS public.update_user_profile(integer, text, text, text);
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id integer,
  p_username text,
  p_email text,
  p_rol text
)
RETURNS TABLE(
  id_usuario integer,
  username varchar,
  email varchar,
  rol varchar,
  activo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usuario
  SET username = COALESCE(p_username, username),
      email = COALESCE(p_email, email),
      rol = COALESCE(p_rol, rol),
      updated_at = NOW()
  WHERE public.usuario.id_usuario = p_user_id;

  RETURN QUERY
  SELECT u.id_usuario, u.username, u.email, u.rol, u.activo
  FROM public.usuario u
  WHERE u.id_usuario = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_profile(integer, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile(integer, text, text, text) TO authenticated;

-- Desactivar usuario (eliminación lógica)
DROP FUNCTION IF EXISTS public.deactivate_user(integer);
CREATE OR REPLACE FUNCTION public.deactivate_user(
  p_user_id integer
)
RETURNS TABLE(
  id_usuario integer,
  activo boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usuario
  SET activo = false,
      updated_at = NOW()
  WHERE public.usuario.id_usuario = p_user_id;

  RETURN QUERY
  SELECT u.id_usuario, u.activo
  FROM public.usuario u
  WHERE u.id_usuario = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deactivate_user(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.deactivate_user(integer) TO authenticated;

-- Fin
