-- Script para verificar el estado de las licencias en la tabla drivers
-- Ejecutar en el SQL Editor de Supabase

-- 1. Ver todos los drivers con sus fechas de vencimiento
SELECT 
  id,
  cedula,
  nombre,
  apellidos,
  numero_licencia,
  fecha_vencimiento_licencia,
  CASE 
    WHEN fecha_vencimiento_licencia IS NULL THEN 'Sin fecha'
    WHEN fecha_vencimiento_licencia < CURRENT_DATE THEN 'VENCIDA'
    WHEN fecha_vencimiento_licencia <= CURRENT_DATE + INTERVAL '30 days' THEN 'Por vencer'
    ELSE 'Vigente'
  END as estado_licencia,
  CASE 
    WHEN fecha_vencimiento_licencia IS NOT NULL 
    THEN fecha_vencimiento_licencia - CURRENT_DATE 
    ELSE NULL 
  END as dias_restantes
FROM drivers
ORDER BY fecha_vencimiento_licencia ASC NULLS LAST;

-- 2. Resumen de licencias
SELECT 
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia IS NULL) as sin_fecha,
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia < CURRENT_DATE) as vencidas,
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia >= CURRENT_DATE 
                   AND fecha_vencimiento_licencia <= CURRENT_DATE + INTERVAL '30 days') as por_vencer,
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia > CURRENT_DATE + INTERVAL '30 days') as vigentes,
  COUNT(*) as total
FROM drivers;

-- 3. Si la tabla está vacía, verificar la tabla conductor (legacy)
SELECT COUNT(*) as total_drivers FROM drivers;
SELECT COUNT(*) as total_conductor FROM conductor;
