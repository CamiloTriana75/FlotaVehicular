-- =====================================================
-- Script para agregar conductores y asignaciones de prueba
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar conductor para Juan Camilo Triana (conductor autenticado)
INSERT INTO public.drivers (
  cedula,
  nombre,
  apellidos,
  email,
  telefono,
  numero_licencia,
  categoria_licencia,
  estado
) VALUES (
  '1234567890123',
  'Juan',
  'Triana',
  'jtriaha@gmail.com',
  '+57 300 123 4567',
  'LIC-JCT-001',
  'C1',
  'activo'
)
ON CONFLICT (cedula) DO UPDATE SET
  email = EXCLUDED.email,
  telefono = EXCLUDED.telefono,
  estado = 'activo';

-- 2. Agregar conductor para usuario admin (si necesario)
INSERT INTO public.drivers (
  cedula,
  nombre,
  apellidos,
  email,
  telefono,
  numero_licencia,
  categoria_licencia,
  estado
) VALUES (
  '9876543210123',
  'Administrador',
  'Sistema',
  'admin@flotavehicular.com',
  '+57 300 000 0001',
  'LIC-ADMIN-001',
  'C1',
  'activo'
)
ON CONFLICT (cedula) DO UPDATE SET
  email = EXCLUDED.email,
  estado = 'activo';

-- 3. Agregar conductor para supervisor
INSERT INTO public.drivers (
  cedula,
  nombre,
  apellidos,
  email,
  telefono,
  numero_licencia,
  categoria_licencia,
  estado
) VALUES (
  '5555555555555',
  'Supervisor',
  'Flota',
  'supervisor@flotavehicular.com',
  '+57 300 000 0002',
  'LIC-SUP-001',
  'C1',
  'activo'
)
ON CONFLICT (cedula) DO UPDATE SET
  email = EXCLUDED.email,
  estado = 'activo';

-- 4. Crear asignaciones de vehículos para los conductores
-- Asignación para Juan Triana
INSERT INTO public.vehicle_assignments (
  driver_id,
  vehicle_id,
  start_time,
  status
) 
SELECT 
  d.id,
  v.id,
  NOW(),
  'active'
FROM public.drivers d
CROSS JOIN public.vehicles v
WHERE d.email = 'jtriaha@gmail.com'
  AND v.placa = 'ABC-123'
  AND NOT EXISTS (
    SELECT 1 FROM public.vehicle_assignments va
    WHERE va.driver_id = d.id 
      AND va.vehicle_id = v.id
      AND va.status = 'active'
  )
LIMIT 1;

-- Asignación para Supervisor
INSERT INTO public.vehicle_assignments (
  driver_id,
  vehicle_id,
  start_time,
  status
) 
SELECT 
  d.id,
  v.id,
  NOW(),
  'active'
FROM public.drivers d
CROSS JOIN public.vehicles v
WHERE d.email = 'supervisor@flotavehicular.com'
  AND v.placa = 'DEF-456'
  AND NOT EXISTS (
    SELECT 1 FROM public.vehicle_assignments va
    WHERE va.driver_id = d.id 
      AND va.vehicle_id = v.id
      AND va.status = 'active'
  )
LIMIT 1;

-- 5. Verificar que se crearon correctamente
SELECT 
  d.id,
  d.nombre,
  d.apellidos,
  d.email,
  d.estado
FROM public.drivers d
WHERE d.email IN ('jtriaha@gmail.com', 'admin@flotavehicular.com', 'supervisor@flotavehicular.com')
ORDER BY d.email;

-- 6. Verificar asignaciones activas
SELECT 
  va.id,
  d.nombre,
  d.apellidos,
  v.placa,
  va.status,
  va.start_time
FROM public.vehicle_assignments va
JOIN public.drivers d ON va.driver_id = d.id
JOIN public.vehicles v ON va.vehicle_id = v.id
WHERE d.email IN ('jtriaha@gmail.com', 'supervisor@flotavehicular.com')
  AND va.status = 'active'
ORDER BY d.email;


