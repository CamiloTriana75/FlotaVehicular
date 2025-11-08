-- =====================================================
-- Agregar Usuario Administrador
-- =====================================================
-- Descripción: Crea un usuario admin inicial para acceso al sistema
-- Fecha: 2025-11-08
-- Versión: 1.0.0

-- IMPORTANTE: Este script usa el esquema legacy con tabla 'usuario'
-- Si tu base de datos usa 'users', ajusta el nombre de la tabla.

-- =====================================================
-- 1. Asegurar que existe la tabla usuario
-- =====================================================

-- Si la tabla 'usuario' no existe pero existe 'users', crea un alias temporal
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usuario') THEN
    -- Si existe 'users', trabajaremos con ella
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
      RAISE NOTICE 'Tabla "usuario" no existe. Usando tabla "users" en su lugar.';
    ELSE
      RAISE EXCEPTION 'No se encontró ninguna tabla de usuarios (usuario o users)';
    END IF;
  END IF;
END $$;

-- =====================================================
-- 2. Crear usuarios administradores
-- =====================================================

-- Asegurar que pgcrypto está instalado para hashear passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuario Administrador 1
INSERT INTO public.usuario (
  username,
  password_hash,
  rol,
  email,
  activo,
  fecha_creacion
) 
VALUES (
  'admin',
  -- Password: 'Admin123!' (hasheada con crypt)
  crypt('Admin123!', gen_salt('bf')),
  'superusuario',
  'admin@flotavehicular.com',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE
  SET 
    rol = EXCLUDED.rol,
    activo = true,
    email = EXCLUDED.email,
    password_hash = crypt('Admin123!', gen_salt('bf'))
RETURNING id_usuario, username, email, rol;

-- Usuario Administrador 2
INSERT INTO public.usuario (
  username,
  password_hash,
  rol,
  email,
  activo,
  fecha_creacion
) 
VALUES (
  'jtrianaadmin',
  -- Password: 'Flota2025$Secure' (hasheada con crypt)
  crypt('Flota2025$Secure', gen_salt('bf')),
  'superusuario',
  'jtriana@flotavehicular.com',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE
  SET 
    rol = EXCLUDED.rol,
    activo = true,
    email = EXCLUDED.email,
    password_hash = crypt('Flota2025$Secure', gen_salt('bf'))
RETURNING id_usuario, username, email, rol;

-- Si usas tabla 'users' en lugar de 'usuario', usa este bloque alternativo:
/*
INSERT INTO public.users (
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_active,
  created_at
) 
VALUES (
  'admin@flotavehicular.com',
  crypt('Admin123!', gen_salt('bf')),
  'Administrador',
  'Sistema',
  'admin',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE
  SET 
    role = EXCLUDED.role,
    is_active = true
RETURNING id, email, first_name, last_name, role;
*/

-- =====================================================
-- 3. Mensaje de confirmación
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Usuarios administradores creados exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '� USUARIO 1:';
  RAISE NOTICE '   �📧 Email: admin@flotavehicular.com';
  RAISE NOTICE '   👤 Username: admin';
  RAISE NOTICE '   🔑 Password: Admin123!';
  RAISE NOTICE '';
  RAISE NOTICE '👤 USUARIO 2:';
  RAISE NOTICE '   📧 Email: jtriana@flotavehicular.com';
  RAISE NOTICE '   👤 Username: jtrianaadmin';
  RAISE NOTICE '   🔑 Password: Flota2025$Secure';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Cambiar estas contraseñas en el primer login';
END $$;

-- =====================================================
-- 4. Verificación
-- =====================================================

-- Verificar que los usuarios fueron creados
SELECT 
  id_usuario,
  username,
  email,
  rol,
  activo,
  fecha_creacion
FROM public.usuario
WHERE username IN ('admin', 'jtrianaadmin')
ORDER BY username;

-- Si usas tabla 'users', usa esta consulta:
/*
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM public.users
WHERE email = 'admin@flotavehicular.com'
LIMIT 1;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. La contraseña está hasheada con bcrypt usando gen_salt('bf')
-- 2. Requiere que la extensión pgcrypto esté instalada
-- 3. Credenciales creadas:
--
--    USUARIO 1:
--    - Username: admin
--    - Email: admin@flotavehicular.com
--    - Password: Admin123!
--
--    USUARIO 2:
--    - Username: jtrianaadmin
--    - Email: jtriana@flotavehicular.com
--    - Password: Flota2025$Secure
--
-- 4. CAMBIAR LAS CONTRASEÑAS inmediatamente después del primer login
-- 5. Si los usuarios ya existen, se actualizan con los nuevos datos
