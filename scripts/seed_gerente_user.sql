-- Seed gerente test user
-- Run this in Supabase SQL Editor after applying the migration

-- Insert gerente user (if email doesn't exist)
INSERT INTO public.usuarios (
  email,
  nombre,
  apellido,
  rol,
  estado,
  fecha_creacion,
  fecha_actualizacion
) VALUES (
  'gerente@flotavehicular.com',
  'Gerente',
  'Test',
  'gerente'::rol_usuario,
  'activo',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Verify insertion
SELECT email, nombre, apellido, rol, estado FROM public.usuarios 
WHERE email = 'gerente@flotavehicular.com';
