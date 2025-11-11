-- =====================================================
-- SCRIPT DE CORRECCIÓN: Limpiar datos duplicados de asignaciones
-- =====================================================

-- 1. Ver asignaciones actuales (para debug)
SELECT 
    va.id,
    v.placa AS vehiculo,
    CONCAT(d.nombre, ' ', d.apellidos) AS conductor,
    d.numero_licencia AS licencia,
    va.start_time AS inicio,
    va.end_time AS fin,
    va.status,
    va.notes
FROM vehicle_assignments va
INNER JOIN vehicles v ON va.vehicle_id = v.id
INNER JOIN drivers d ON va.driver_id = d.id
ORDER BY va.created_at DESC;

-- 2. Eliminar TODAS las asignaciones de prueba (para empezar limpio)
DELETE FROM vehicle_assignments;

-- 3. Verificar que las tablas base tengan los datos correctos
-- Si no tienen numero_licencia, actualizarlos
UPDATE drivers SET numero_licencia = '123456789' WHERE cedula = '12345678' AND numero_licencia IS NULL;
UPDATE drivers SET numero_licencia = '987654321' WHERE cedula = '87654321' AND numero_licencia IS NULL;
UPDATE drivers SET numero_licencia = '555555555' WHERE cedula = '11223344' AND numero_licencia IS NULL;

SELECT * FROM vehicles WHERE placa IN ('ABC-123', 'DEF-456', 'GHI-789');
SELECT id, cedula, nombre, apellidos, numero_licencia, estado FROM drivers WHERE cedula IN ('12345678', '87654321', '11223344');

-- 4. Insertar asignaciones de prueba CORREGIDAS
DO $$
DECLARE
    v_vehicle1_id INTEGER;  -- ABC-123 (Chevrolet Spark)
    v_vehicle2_id INTEGER;  -- DEF-456 (Renault Logan)
    v_vehicle3_id INTEGER;  -- GHI-789 (Toyota Corolla)
    v_driver1_id INTEGER;   -- Carlos Mendoza
    v_driver2_id INTEGER;   -- María García
    v_driver3_id INTEGER;   -- Luis Rodríguez
BEGIN
    -- Obtener IDs de vehículos
    SELECT id INTO v_vehicle1_id FROM vehicles WHERE placa = 'ABC-123' LIMIT 1;
    SELECT id INTO v_vehicle2_id FROM vehicles WHERE placa = 'DEF-456' LIMIT 1;
    SELECT id INTO v_vehicle3_id FROM vehicles WHERE placa = 'GHI-789' LIMIT 1;
    
    -- Obtener IDs de conductores
    SELECT id INTO v_driver1_id FROM drivers WHERE cedula = '12345678' LIMIT 1;
    SELECT id INTO v_driver2_id FROM drivers WHERE cedula = '87654321' LIMIT 1;
    SELECT id INTO v_driver3_id FROM drivers WHERE cedula = '11223344' LIMIT 1;
    
    -- Verificar que existen los datos
    IF v_vehicle1_id IS NULL OR v_driver1_id IS NULL THEN
        RAISE EXCEPTION 'No se encontraron los vehículos o conductores base. Ejecuta la migración primero.';
    END IF;
    
    -- ✅ ASIGNACIÓN 1: ABC-123 → Carlos Mendoza (PENDIENTE - inicia mañana)
    INSERT INTO vehicle_assignments (
        vehicle_id, 
        driver_id, 
        start_time, 
        end_time, 
        status, 
        notes
    ) VALUES (
        v_vehicle1_id,
        v_driver1_id,
        -- Mañana 12/11/2025 a las 05:13 AM
        '2025-11-12 05:13:00-05',
        -- Mañana 13/11/2025 a las 01:13 AM (del día siguiente)
        '2025-11-13 01:13:00-05',
        'active',
        'Morning shift - Downtown route'
    );
    
    -- ✅ ASIGNACIÓN 2: ABC-123 → María García (EN CURSO - ya empezó)
    INSERT INTO vehicle_assignments (
        vehicle_id, 
        driver_id, 
        start_time, 
        end_time, 
        status, 
        notes
    ) VALUES (
        v_vehicle1_id,
        v_driver2_id,
        -- HOY 11/11/2025 a las 08:33 AM (ya empezó)
        '2025-11-11 08:33:00-05',
        -- HOY 11/11/2025 a las 07:33 PM
        '2025-11-11 19:33:00-05',
        'active',
        'Delivery route - Northern zone'
    );
    
    RAISE NOTICE '✅ Asignaciones creadas correctamente';
    RAISE NOTICE '   - Asignación 1: ABC-123 → Carlos (PENDIENTE para mañana)';
    RAISE NOTICE '   - Asignación 2: ABC-123 → María (EN CURSO hoy)';
    
END $$;

-- 5. Verificar las asignaciones creadas
SELECT 
    va.id,
    v.placa || ' - ' || v.marca || ' ' || v.modelo AS vehiculo,
    CONCAT(d.nombre, ' ', d.apellidos) AS conductor,
    d.numero_licencia AS licencia,
    TO_CHAR(va.start_time, 'DD/MM/YYYY HH24:MI') AS inicio,
    TO_CHAR(va.end_time, 'DD/MM/YYYY HH24:MI') AS fin,
    ROUND(EXTRACT(EPOCH FROM (va.end_time - va.start_time)) / 3600, 1) AS duracion_hrs,
    va.status,
    CASE 
        WHEN va.start_time > NOW() THEN 'PENDIENTE'
        WHEN va.end_time < NOW() THEN 'FINALIZADA'
        ELSE 'EN CURSO'
    END AS estado_actual,
    va.notes
FROM vehicle_assignments va
INNER JOIN vehicles v ON va.vehicle_id = v.id
INNER JOIN drivers d ON va.driver_id = d.id
ORDER BY va.start_time;

-- 6. Verificar estadísticas
SELECT 
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE status = 'active') AS activas,
    COUNT(*) FILTER (WHERE status = 'completed') AS completadas,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS canceladas,
    COUNT(*) FILTER (WHERE start_time > NOW()) AS pendientes,
    COUNT(*) FILTER (WHERE start_time <= NOW() AND end_time >= NOW()) AS en_curso
FROM vehicle_assignments;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script ELIMINA todas las asignaciones existentes
-- 2. Crea 2 asignaciones de ejemplo:
--    - ABC-123 → Carlos: PENDIENTE (empieza mañana 12/11)
--    - ABC-123 → María: EN CURSO (empezó hoy 11/11 a las 8:33 AM)
-- 3. Ambas usan el MISMO vehículo pero en horarios diferentes
-- 4. La segunda debería mostrar badge "EN CURSO" (verde)
-- 5. La primera debería mostrar badge "PENDIENTE" (amarillo)
-- =====================================================
