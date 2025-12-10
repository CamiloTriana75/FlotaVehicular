# 🚨 SOLUCIÓN DEFINITIVA - Errores RLS

## ❌ Problema

Obtienes errores: `new row violates row-level security policy for table "drivers"`

## ✅ Causa Raíz

Las políticas RLS están activas pero **tu email de inicio de sesión NO existe en la tabla `usuario`** con el rol apropiado.

## 📋 Pasos para Resolver

### PASO 1: Identificar tu email de inicio de sesión

**¿Con qué email inicias sesión en la aplicación?**

- Si usas modo REAL (Supabase): El email que registraste en Supabase Auth
- Si usas modo MOCK: Probablemente `admin@flotavehicular.com`

### PASO 2: Verificar si existe en la tabla usuario

Ejecuta en **Supabase SQL Editor**:

```sql
SELECT id_usuario, username, email, rol, activo
FROM public.usuario
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';
```

**Resultados posibles:**

- ✅ **Si devuelve una fila con rol 'admin' o 'superusuario'**: El problema es que la migración RLS no se aplicó
- ❌ **Si no devuelve nada**: Tu email NO está en la tabla usuario (causa más común)

### PASO 3A: Si tu email NO existe → Agregarlo

Edita el archivo `supabase/migrations/20251210_add_admin_user.sql`:

1. Cambia **ambas** apariciones de `'admin@flotavehicular.com'` por tu email real
2. Ejecuta el archivo en Supabase SQL Editor
3. Verifica con el SELECT del PASO 2 que ahora existe

### PASO 3B: Si tu email existe pero con rol incorrecto → Actualizarlo

```sql
UPDATE public.usuario
SET
  rol = 'admin',
  activo = true
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';
```

### PASO 4: Aplicar las políticas RLS

Ahora sí, ejecuta **TODO** el contenido del archivo:
`supabase/migrations/20251210_complete_rls_policies.sql`

**IMPORTANTE**:

- Copia **TODO** el contenido (las 313 líneas)
- Pégalo en Supabase SQL Editor
- Click en "Run"
- Espera a ver los mensajes de confirmación con ✅

### PASO 5: Verificar que funcionó

Ejecuta esta consulta para verificar las políticas:

```sql
-- Verificar políticas en drivers
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'drivers';

-- Verificar políticas en maintenance_orders
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'maintenance_orders';
```

Deberías ver 4 políticas por tabla:

- `drivers_select_policy`
- `drivers_insert_policy`
- `drivers_update_policy`
- `drivers_delete_policy`

### PASO 6: Probar en la aplicación

1. Cierra sesión en tu aplicación
2. Vuelve a iniciar sesión con el email que agregaste a la tabla `usuario`
3. Intenta crear un conductor
4. Debe funcionar sin errores ✅

## 🔍 Troubleshooting

### Error: "email ya existe" al insertar usuario

```sql
-- Si el usuario ya existe pero con rol incorrecto, actualiza:
UPDATE public.usuario
SET rol = 'admin', activo = true
WHERE email = 'tu_email@ejemplo.com';
```

### Error: "relation maintenance_orders_id_seq does not exist"

El archivo `20251210_complete_rls_policies.sql` ya tiene protección para esto.
Si aún falla, ejecuta:

```sql
-- Crear la secuencia manualmente
CREATE SEQUENCE IF NOT EXISTS public.maintenance_orders_id_seq;
ALTER TABLE public.maintenance_orders
  ALTER COLUMN id SET DEFAULT nextval('public.maintenance_orders_id_seq');
```

### Todavía obtengo errores RLS después de aplicar todo

```sql
-- Verifica que el usuario existe Y está activo
SELECT email, rol, activo FROM public.usuario WHERE email = 'tu_email@ejemplo.com';

-- Verifica tu sesión actual de Supabase
SELECT auth.jwt()->>'email' as current_user_email;

-- Si no coinciden, cierra sesión y vuelve a iniciar
```

## 📝 Resumen de Archivos

1. **20251210_add_admin_user.sql** → Agrega tu email a la tabla usuario (EJECUTAR PRIMERO)
2. **20251210_complete_rls_policies.sql** → Configura todas las políticas RLS (EJECUTAR SEGUNDO)

## ⚠️ IMPORTANTE

**Las políticas RLS solo funcionan si:**

1. Tu email de inicio de sesión está en la tabla `usuario`
2. Tu usuario tiene `activo = true`
3. Tu usuario tiene un `rol` apropiado:
   - Para crear conductores: `admin`, `superusuario`, o `rrhh`
   - Para crear órdenes de mantenimiento: `admin`, `superusuario`, `mecanico`, o `supervisor`

## 🎯 Próximos Pasos

Después de que funcione todo:

- Commit de los cambios
- Crear PR de la rama `25-hu22-dashboard-con-kpis-principales`
- Documentar los roles y permisos en el README

---

**¿Necesitas ayuda?** Responde estas preguntas:

1. ¿Qué email usas para iniciar sesión?
2. ¿Usas modo MOCK o modo REAL (Supabase)?
3. ¿Ya ejecutaste el archivo complete_rls_policies.sql en Supabase SQL Editor?
