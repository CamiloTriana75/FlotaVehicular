/**
 * Script MÁXIMO para eliminar TODOS los conductores
 * 
 * Este es el script más directo y confiable.
 * Ejecutar en: https://app.supabase.com/project/[tu-proyecto]/sql/new
 */

-- ===== PASO 1: Obtener cédulas antes de eliminar =====
CREATE TEMP TABLE temp_cedulas AS
SELECT DISTINCT cedula 
FROM public.drivers 
WHERE cedula IS NOT NULL;

-- ===== PASO 2: Eliminar todos los conductores de tabla drivers =====
DELETE FROM public.drivers;

-- ===== PASO 3: Eliminar todos los usuarios con rol conductor =====
DELETE FROM public.usuario 
WHERE rol = 'conductor';

-- ===== VERIFICACIÓN: Contar registros restantes =====
SELECT 
  'Total drivers después de eliminar:' as chequeo,
  COUNT(*) as cantidad 
FROM public.drivers;

SELECT 
  'Total usuarios conductor después de eliminar:' as chequeo,
  COUNT(*) as cantidad 
FROM public.usuario 
WHERE rol = 'conductor';

-- RESULTADO ESPERADO:
-- Total drivers después de eliminar: 0
-- Total usuarios conductor después de eliminar: 0

