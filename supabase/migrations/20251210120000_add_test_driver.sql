-- Add test driver for authentication testing
-- This driver is linked to the authenticated user 'Juan Camilo Triana'

BEGIN;

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

-- Verify insertion
SELECT id, nombre, apellidos, email FROM public.drivers WHERE email = 'jtriaha@gmail.com';

COMMIT;
