-- =====================================================
-- SCRIPT RÁPIDO: Ejecutar en SQL Editor de Supabase
-- =====================================================

-- 1. Actualizar conductores para agregar numero_licencia
UPDATE drivers SET numero_licencia = '123456789' WHERE cedula = '12345678';
UPDATE drivers SET numero_licencia = '987654321' WHERE cedula = '87654321';
UPDATE drivers SET numero_licencia = '555555555' WHERE cedula = '11223344';

-- 2. Verificar conductores
SELECT id, cedula, nombre, apellidos, numero_licencia, estado FROM drivers;

-- 3. Eliminar asignaciones duplicadas
DELETE FROM vehicle_assignments;

-- 4. Crear asignaciones corregidas
DO $$
DECLARE
    v_abc INTEGER;
    v_def INTEGER;
    v_carlos INTEGER;
    v_maria INTEGER;
BEGIN
    SELECT id INTO v_abc FROM vehicles WHERE placa = 'ABC-123';
    SELECT id INTO v_def FROM vehicles WHERE placa = 'DEF-456';
    SELECT id INTO v_carlos FROM drivers WHERE cedula = '12345678';
    SELECT id INTO v_maria FROM drivers WHERE cedula = '87654321';
    
    -- Asignación 1: ABC-123 → Carlos (PENDIENTE para mañana)
    INSERT INTO vehicle_assignments (vehicle_id, driver_id, start_time, end_time, status, notes)
    VALUES (v_abc, v_carlos, '2025-11-12 05:13:00-05', '2025-11-13 01:13:00-05', 'active', 'Morning shift - Downtown route');
    
    -- Asignación 2: ABC-123 → María (EN CURSO ahora)
    INSERT INTO vehicle_assignments (vehicle_id, driver_id, start_time, end_time, status, notes)
    VALUES (v_abc, v_maria, '2025-11-11 08:33:00-05', '2025-11-11 19:33:00-05', 'active', 'Delivery route - Northern zone');
    
    RAISE NOTICE 'Asignaciones creadas exitosamente';
END $$;

-- 5. Verificar resultado
SELECT 
    va.id,
    v.placa || ' - ' || v.marca || ' ' || v.modelo AS vehiculo,
    d.nombre || ' ' || d.apellidos AS conductor,
    d.numero_licencia AS "Lic",
    TO_CHAR(va.start_time, 'DD/MM/YYYY HH24:MI') AS inicio,
    TO_CHAR(va.end_time, 'DD/MM/YYYY HH24:MI') AS fin,
    ROUND(EXTRACT(EPOCH FROM (va.end_time - va.start_time)) / 3600, 1) AS "hrs",
    va.status,
    va.notes
FROM vehicle_assignments va
JOIN vehicles v ON va.vehicle_id = v.id
JOIN drivers d ON va.driver_id = d.id
ORDER BY va.start_time;
