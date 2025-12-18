/**
 * Script para eliminar todos los conductores y sus usuarios asociados
 * EJECUTAR EN SUPABASE DASHBOARD: https://app.supabase.com/project/[proyecto]/sql/new
 * 
 * PRECAUCIÓN: Esto eliminará TODOS los conductores y sus usuarios de autenticación
 */

BEGIN;

-- 1. Obtener lista de cédulas de conductores para eliminar usuarios después
CREATE TEMP TABLE temp_cedulas AS
SELECT cedula FROM drivers WHERE cedula IS NOT NULL;

-- 2. Eliminar todos los registros de la tabla drivers
DELETE FROM public.drivers;

-- 3. Eliminar usuarios cuyo username sea una cédula (conductores)
DELETE FROM public.usuario 
WHERE username IN (SELECT cedula FROM temp_cedulas);

-- 4. Información de lo eliminado
SELECT 
  (SELECT COUNT(*) FROM temp_cedulas) as conductores_eliminados,
  'Todos los conductores y sus usuarios han sido eliminados' as resultado;

COMMIT;

-- Verificación final
SELECT COUNT(*) as conductores_restantes FROM public.drivers;
SELECT COUNT(*) as usuarios_restantes FROM public.usuario WHERE rol = 'conductor';
