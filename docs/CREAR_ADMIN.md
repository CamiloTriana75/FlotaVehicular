# Crear Usuario Administrador

Este documento explica cómo crear un usuario administrador en la base de datos de FlotaVehicular.

## 📋 Opciones Disponibles

### Opción 1: Ejecutar Migración SQL (Recomendado)

La forma más segura es ejecutar la migración en Supabase:

1. **Usando Supabase CLI:**

```powershell
# Asegúrate de estar conectado a tu proyecto
supabase db push

# O ejecuta la migración específica
supabase db push --file supabase/migrations/20251108000001_add_admin_user.sql
```

2. **Usando el SQL Editor de Supabase Dashboard:**
   - Ve a https://app.supabase.com/project/nqsfitpsygpwfglchihl/editor
   - Abre el SQL Editor
   - Copia y pega el contenido de `supabase/migrations/20251108000001_add_admin_user.sql`
   - Ejecuta el script

### Opción 2: Script Node.js Interactivo

Si prefieres un script más flexible:

```powershell
node scripts/create-admin.js
```

## 🔑 Credenciales por Defecto

Después de ejecutar cualquiera de las opciones, usa estas credenciales:

- **Username:** `admin`
- **Email:** `admin@flotavehicular.com`
- **Password:** `Admin123!`

⚠️ **IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer login.

## 🔐 Verificar el Usuario

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
-- Para tabla 'usuario' (legacy)
SELECT
  id_usuario,
  username,
  email,
  rol,
  activo,
  fecha_creacion
FROM public.usuario
WHERE username = 'admin';

-- Para tabla 'users'
SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM public.users
WHERE email = 'admin@flotavehicular.com';
```

## 🛠️ Solución de Problemas

### Error: "relation 'usuario' does not exist"

Tu base de datos usa la tabla `users` en lugar de `usuario`. Edita la migración y descomenta el bloque alternativo marcado con `/* ... */`.

### Error: "extension 'pgcrypto' does not exist"

Ejecuta primero:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Error: "duplicate key value violates unique constraint"

El usuario ya existe. La migración lo actualizará automáticamente.

## 📝 Personalizar el Usuario

Para cambiar las credenciales, edita el archivo `supabase/migrations/20251108000001_add_admin_user.sql`:

```sql
VALUES (
  'tu_username',           -- Cambia el username
  crypt('TuPassword123!', gen_salt('bf')),  -- Cambia la contraseña
  'superusuario',
  'tu_email@ejemplo.com',  -- Cambia el email
  true,
  NOW()
)
```

## 🔄 Resetear Contraseña del Admin

Si olvidaste la contraseña:

```sql
UPDATE public.usuario
SET password_hash = crypt('NuevaPassword123!', gen_salt('bf'))
WHERE username = 'admin';
```
