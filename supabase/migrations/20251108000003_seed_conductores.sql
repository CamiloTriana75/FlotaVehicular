-- =====================================================
-- Seed Data - Conductores
-- =====================================================
-- Descripción: Datos de ejemplo para la tabla conductor
-- Fecha: 2025-11-08
-- Versión: 1.0.0

-- =====================================================
-- Insertar conductores de ejemplo
-- =====================================================

INSERT INTO public.conductor (
  nombre_completo,
  cedula,
  licencia,
  categoria_licencia,
  fecha_venc_licencia,
  telefono,
  email,
  direccion,
  fecha_nacimiento,
  estado,
  fecha_ingreso
) 
VALUES 
  -- Conductor 1
  (
    'Juan Carlos Pérez García',
    '1234567890',
    'LIC-001-2020',
    'C1',
    '2026-06-15',
    '+57 300 123 4567',
    'juan.perez@flotavehicular.com',
    'Calle 45 #23-67, Bogotá',
    '1985-03-12',
    'disponible',
    '2020-01-15'
  ),
  
  -- Conductor 2
  (
    'María Fernanda López Martínez',
    '0987654321',
    'LIC-002-2019',
    'B2',
    '2025-12-20',
    '+57 310 987 6543',
    'maria.lopez@flotavehicular.com',
    'Carrera 7 #89-12, Medellín',
    '1990-07-25',
    'disponible',
    '2019-06-01'
  ),
  
  -- Conductor 3
  (
    'Carlos Eduardo Ramírez Silva',
    '1122334455',
    'LIC-003-2021',
    'C2',
    '2027-03-10',
    '+57 320 456 7890',
    'carlos.ramirez@flotavehicular.com',
    'Avenida 68 #45-23, Cali',
    '1982-11-08',
    'activo',
    '2021-02-10'
  ),
  
  -- Conductor 4 (adicional - suspendido como ejemplo)
  (
    'Andrea Patricia Gómez Torres',
    '5566778899',
    'LIC-004-2018',
    'B1',
    '2024-08-30',
    '+57 315 234 5678',
    'andrea.gomez@flotavehicular.com',
    'Calle 100 #15-45, Barranquilla',
    '1988-05-17',
    'suspendido',
    '2018-09-20'
  )
ON CONFLICT (cedula) DO UPDATE
  SET 
    nombre_completo = EXCLUDED.nombre_completo,
    licencia = EXCLUDED.licencia,
    categoria_licencia = EXCLUDED.categoria_licencia,
    fecha_venc_licencia = EXCLUDED.fecha_venc_licencia,
    telefono = EXCLUDED.telefono,
    email = EXCLUDED.email,
    direccion = EXCLUDED.direccion,
    estado = EXCLUDED.estado;

-- =====================================================
-- Verificación
-- =====================================================

SELECT 
  id_conductor,
  nombre_completo,
  cedula,
  licencia,
  categoria_licencia,
  fecha_venc_licencia,
  telefono,
  email,
  estado,
  fecha_ingreso
FROM public.conductor
ORDER BY fecha_ingreso;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Se crearon 4 conductores de ejemplo (3 requeridos + 1 adicional)
-- 2. Estados: 'disponible' (2), 'activo' (1), 'suspendido' (1)
-- 3. Diferentes categorías de licencia: B1, B2, C1, C2
-- 4. ON CONFLICT actualiza si la cédula ya existe
-- 5. Fechas de vencimiento variadas para probar alertas
