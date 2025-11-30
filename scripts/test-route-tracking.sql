-- =====================================================
-- SCRIPT DE PRUEBA: Sistema de Comparación de Rutas
-- Ejecutar en Supabase SQL Editor para verificar instalación
-- =====================================================

-- 1. VERIFICAR TABLAS
SELECT 
  'Tablas creadas' as check_name,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) = 2 THEN '✅ OK' ELSE '❌ FALTA' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('route_tracking', 'route_events');

-- 2. VERIFICAR FUNCIONES
SELECT 
  'Funciones creadas' as check_name,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 5 THEN '✅ OK' ELSE '❌ FALTA' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_route_trajectory',
  'insert_route_tracking_point',
  'get_route_events',
  'insert_route_event',
  'get_route_statistics'
);

-- 3. VERIFICAR ÍNDICES
SELECT 
  'Índices creados' as check_name,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '❌ REVISAR' END as status
FROM pg_indexes 
WHERE tablename IN ('route_tracking', 'route_events');

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
  'Políticas RLS' as check_name,
  COUNT(*) as resultado,
  CASE WHEN COUNT(*) >= 8 THEN '✅ OK' ELSE '❌ FALTA' END as status
FROM pg_policies 
WHERE tablename IN ('route_tracking', 'route_events');

-- 5. ESTRUCTURA DE route_tracking
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'route_tracking'
ORDER BY ordinal_position;

-- 6. ESTRUCTURA DE route_events
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'route_events'
ORDER BY ordinal_position;

-- =====================================================
-- PRUEBA FUNCIONAL (Opcional)
-- Descomenta y ajusta los IDs según tu base de datos
-- =====================================================

/*
-- Paso 1: Buscar una asignación existente
SELECT 
  ra.id,
  ra.route_id,
  r.name as route_name,
  ra.driver_id,
  ra.vehicle_id,
  ra.status
FROM route_assignments ra
JOIN routes r ON r.id = ra.route_id
LIMIT 5;

-- Paso 2: Insertar puntos de prueba
-- REEMPLAZA 'YOUR_ASSIGNMENT_ID' y 'YOUR_VEHICLE_ID' con valores reales

SELECT insert_route_tracking_point(
  YOUR_ASSIGNMENT_ID,  -- assignment_id
  YOUR_VEHICLE_ID,     -- vehicle_id
  4.6097,              -- latitude
  -74.0817,            -- longitude
  45.5,                -- speed (km/h)
  90.0,                -- heading (grados)
  8.0,                 -- accuracy (metros)
  2635.0               -- altitude (metros)
);

SELECT insert_route_tracking_point(
  YOUR_ASSIGNMENT_ID,
  YOUR_VEHICLE_ID,
  4.6100,
  -74.0820,
  47.2,
  92.5,
  7.5,
  2640.0
);

SELECT insert_route_tracking_point(
  YOUR_ASSIGNMENT_ID,
  YOUR_VEHICLE_ID,
  4.6105,
  -74.0825,
  50.0,
  95.0,
  6.8,
  2645.0
);

-- Paso 3: Verificar que se guardaron
SELECT 
  id,
  assignment_id,
  latitude,
  longitude,
  speed,
  heading,
  timestamp
FROM route_tracking
WHERE assignment_id = YOUR_ASSIGNMENT_ID
ORDER BY timestamp DESC;

-- Paso 4: Obtener trayectoria
SELECT * FROM get_route_trajectory(YOUR_ASSIGNMENT_ID);

-- Paso 5: Registrar un evento
SELECT insert_route_event(
  YOUR_ASSIGNMENT_ID,
  'tracking_started',
  '{"test": true}'::jsonb,
  4.6097,
  -74.0817,
  'Prueba de tracking'
);

-- Paso 6: Ver eventos
SELECT * FROM get_route_events(YOUR_ASSIGNMENT_ID);

-- Paso 7: Obtener estadísticas
SELECT * FROM get_route_statistics(YOUR_ASSIGNMENT_ID);

-- Paso 8: Limpiar datos de prueba (ejecutar al final)
DELETE FROM route_tracking WHERE assignment_id = YOUR_ASSIGNMENT_ID;
DELETE FROM route_events WHERE assignment_id = YOUR_ASSIGNMENT_ID;
*/

-- =====================================================
-- RESUMEN DE VERIFICACIÓN
-- =====================================================
SELECT 
  'RESUMEN FINAL' as titulo,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'route_tracking')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'route_events')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_route_trajectory')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'insert_route_tracking_point')
    THEN '✅ Sistema instalado correctamente'
    ELSE '❌ Faltan componentes - Revisar arriba'
  END as status;

-- =====================================================
-- INFORMACIÓN ÚTIL
-- =====================================================

-- Ver todas las rutas con asignaciones
SELECT 
  r.id as route_id,
  r.name,
  COUNT(ra.id) as total_assignments,
  COUNT(CASE WHEN ra.status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN ra.status = 'completed' THEN 1 END) as completed
FROM routes r
LEFT JOIN route_assignments ra ON ra.route_id = r.id
GROUP BY r.id, r.name
ORDER BY r.created_at DESC;

-- Ver asignaciones recientes con tracking
SELECT 
  ra.id,
  r.name as route_name,
  d.nombre as driver_name,
  v.placa,
  ra.status,
  ra.actual_start,
  COUNT(rt.id) as tracking_points
FROM route_assignments ra
JOIN routes r ON r.id = ra.route_id
JOIN drivers d ON d.id = ra.driver_id
JOIN vehicles v ON v.id = ra.vehicle_id
LEFT JOIN route_tracking rt ON rt.assignment_id = ra.id
GROUP BY ra.id, r.name, d.nombre, v.placa, ra.status, ra.actual_start
ORDER BY ra.created_at DESC
LIMIT 10;

-- =====================================================
-- NOTAS FINALES
-- =====================================================

/*
✅ Si todos los checks muestran "OK", el sistema está listo para usar.

📱 Próximos pasos:
1. Asignar una ruta a un conductor
2. Que el conductor abra la vista de ruta en móvil
3. Activar "Iniciar GPS"
4. Conducir o usar modo simulación
5. Ver la comparación después de completar la ruta

📊 Para ver comparación:
- Ir a RouteComparison
- Seleccionar una asignación completada
- Verificar que aparecen las líneas en el mapa

🔍 Si algo falla, revisar:
- Permisos RLS en Supabase
- Consola del navegador para errores JavaScript
- Variables de entorno (VITE_MAPBOX_TOKEN)
- Conexión a internet del conductor
*/
