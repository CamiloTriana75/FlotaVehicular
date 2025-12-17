-- Script para agregar conductores de prueba con diferentes estados de licencia
-- Ejecutar en el SQL Editor de Supabase

-- Borrar datos de prueba previos (opcional, comentar si no quieres borrar)
-- DELETE FROM drivers WHERE cedula LIKE '9999%';

-- 1. Conductor con licencia VENCIDA (hace 5 días)
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99991111',
  'Carlos',
  'Rodríguez Vencido',
  'LIC-VENC-001',
  'B1',
  '2020-12-01',
  CURRENT_DATE - INTERVAL '5 days',
  '3001234567',
  'carlos.vencido@test.com',
  'activo'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE - INTERVAL '5 days';

-- 2. Conductor con licencia que vence HOY
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99992222',
  'María',
  'González Hoy',
  'LIC-HOY-002',
  'B2',
  '2020-12-17',
  CURRENT_DATE,
  '3002345678',
  'maria.hoy@test.com',
  'activo'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE;

-- 3. Conductor con licencia que vence en 1 día
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99993333',
  'Juan',
  'Pérez Mañana',
  'LIC-1DIA-003',
  'C1',
  '2020-12-18',
  CURRENT_DATE + INTERVAL '1 day',
  '3003456789',
  'juan.1dia@test.com',
  'activo'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE + INTERVAL '1 day';

-- 4. Conductor con licencia que vence en 7 días
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99994444',
  'Ana',
  'Martínez Semana',
  'LIC-7DIAS-004',
  'B1',
  '2020-12-24',
  CURRENT_DATE + INTERVAL '7 days',
  '3004567890',
  'ana.7dias@test.com',
  'disponible'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE + INTERVAL '7 days';

-- 5. Conductor con licencia que vence en 15 días
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99995555',
  'Luis',
  'Ramírez Quincena',
  'LIC-15DIAS-005',
  'B2',
  '2021-01-01',
  CURRENT_DATE + INTERVAL '15 days',
  '3005678901',
  'luis.15dias@test.com',
  'activo'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE + INTERVAL '15 days';

-- 6. Conductor con licencia que vence en 29 días (justo dentro del umbral de 30)
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99996666',
  'Patricia',
  'López Umbral',
  'LIC-29DIAS-006',
  'C1',
  '2021-01-15',
  CURRENT_DATE + INTERVAL '29 days',
  '3006789012',
  'patricia.29dias@test.com',
  'activo'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE + INTERVAL '29 days';

-- 7. Conductor con licencia que vence en 31 días (fuera del umbral de 30)
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99997777',
  'Roberto',
  'Sánchez Vigente',
  'LIC-31DIAS-007',
  'B1',
  '2021-01-17',
  CURRENT_DATE + INTERVAL '31 days',
  '3007890123',
  'roberto.31dias@test.com',
  'disponible'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE + INTERVAL '31 days';

-- 8. Conductor con licencia vencida hace 30 días
INSERT INTO drivers (cedula, nombre, apellidos, numero_licencia, categoria_licencia, fecha_expedicion_licencia, fecha_vencimiento_licencia, telefono, email, estado)
VALUES (
  '99998888',
  'Diana',
  'Torres Antigua',
  'LIC-30VENC-008',
  'B2',
  '2020-11-17',
  CURRENT_DATE - INTERVAL '30 days',
  '3008901234',
  'diana.30venc@test.com',
  'inactivo'
) ON CONFLICT (cedula) DO UPDATE SET
  fecha_vencimiento_licencia = CURRENT_DATE - INTERVAL '30 days';

-- Verificar inserción
SELECT 
  id,
  cedula,
  nombre,
  apellidos,
  numero_licencia,
  fecha_vencimiento_licencia,
  CASE 
    WHEN fecha_vencimiento_licencia < CURRENT_DATE THEN 'VENCIDA'
    WHEN fecha_vencimiento_licencia <= CURRENT_DATE + INTERVAL '30 days' THEN 'Por vencer (≤30 días)'
    ELSE 'Vigente (>30 días)'
  END as estado_licencia,
  fecha_vencimiento_licencia - CURRENT_DATE as dias_restantes
FROM drivers
WHERE cedula LIKE '9999%'
ORDER BY fecha_vencimiento_licencia ASC;

-- Mostrar resumen esperado
SELECT 
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia < CURRENT_DATE) as "Vencidas (debería ser 2)",
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia >= CURRENT_DATE 
                   AND fecha_vencimiento_licencia <= CURRENT_DATE + INTERVAL '30 days') as "Por vencer (debería ser 5)",
  COUNT(*) FILTER (WHERE fecha_vencimiento_licencia > CURRENT_DATE + INTERVAL '30 days') as "Vigentes (debería ser 1)"
FROM drivers
WHERE cedula LIKE '9999%';
