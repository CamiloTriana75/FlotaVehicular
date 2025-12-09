-- Actualizar contraseña del usuario mecánico con hash bcrypt
-- Ejecutar en Supabase SQL Editor

-- Asegurar que pgcrypto está instalado
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Actualizar la contraseña del mecánico con hash
UPDATE public.usuario
SET password_hash = crypt('Mecanico123!', gen_salt('bf'))
WHERE username = 'mecanico';

-- Verificar
SELECT username, email, rol, activo 
FROM public.usuario 
WHERE username = 'mecanico';
