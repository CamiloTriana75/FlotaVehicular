/**
 * SQL RPC: delete_user_by_username - VERSIÓN SIMPLIFICADA
 * 
 * Elimina un usuario por su username (cédula de conductor)
 * 
 * CREAR ESTA FUNCIÓN EN SUPABASE DASHBOARD:
 * https://app.supabase.com/project/[proyecto]/sql/new
 */

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS public.delete_user_by_username(TEXT);

-- Crear función SIMPLE y directa
CREATE FUNCTION public.delete_user_by_username(p_username TEXT)
RETURNS JSON AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  -- Validar entrada
  IF p_username IS NULL OR p_username = '' THEN
    RETURN JSON_BUILD_OBJECT('success', false, 'message', 'Username vacío');
  END IF;

  -- Eliminar directamente
  DELETE FROM public.usuario
  WHERE public.usuario.username = p_username 
    AND public.usuario.rol = 'conductor';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Retornar resultado
  RETURN JSON_BUILD_OBJECT(
    'success', v_deleted_count > 0,
    'message', CASE 
      WHEN v_deleted_count > 0 THEN 'Usuario eliminado'
      ELSE 'Usuario no encontrado'
    END,
    'deleted_count', v_deleted_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
ALTER FUNCTION public.delete_user_by_username(TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_user_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_by_username(TEXT) TO anon;
