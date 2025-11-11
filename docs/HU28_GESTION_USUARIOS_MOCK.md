# HU28 - Gestión Inicial de Usuarios y Permisos (Mock)

Como administrador quiero gestionar usuarios y permisos básicos (roles: admin, supervisor, RRHH) para controlar el acceso al sistema.

Este módulo es solo UI simulada para el sprint actual. No crea usuarios reales ni integra autenticación.

## Funcionalidades

- Formulario de creación de usuario mock
  - Campos: Nombre (obligatorio), Email (opcional), Rol (admin, supervisor, RRHH)
- Tabla de usuarios mock
  - Ver, editar (en línea), eliminar
  - Resumen por rol
- Persistencia en localStorage del navegador
- Navegación desde Dashboard y desde el menú lateral
- UI responsive

## Cómo usar

1. Ir a "Gestión de Usuarios (Mock)"
   - Desde Dashboard: botón "Ir a Usuarios"
   - Desde el menú lateral: opción "Usuarios"
2. Completar el formulario y presionar "Agregar"
3. Ver el usuario en la tabla; puede editar o eliminar

## Modo real (BD)

Para conectar esta UI a la base de datos de Supabase en lugar de usar localStorage:

1. Variables de entorno

- Crea un archivo `.env` en la raíz (o configura en tu entorno) con:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_MOCK_MODE=false`

2. Migraciones necesarias

- Aplica las migraciones incluidas que crean funciones RPC y helpers de auth:
  - `supabase/migrations/20251108000002_auth_functions.sql`
  - `supabase/migrations/20251111000003_user_crud.sql`

Puedes ejecutarlas con el CLI:

```
npm run db:push
```

o pegando el SQL en el editor de consultas de Supabase.

3. Permisos temporales (solo para el sprint)

Si ves errores de permisos al listar usuarios, añade una política RLS de solo lectura pública mientras se define seguridad final:

```
alter table public.usuario enable row level security;
create policy "usuarios_read_public" on public.usuario for select using (true);
```

Nota: las funciones RPC se crearon como `SECURITY DEFINER` para permitir creación/edición/desactivación sin exponer `password_hash`. Endurecer en producción.

4. Ejecutar y probar

```
npm run dev
```

Ve a `/usuarios`, crea un usuario y verifica que aparece en la tabla (BD real).

## Notas técnicas

- Página: `src/pages/UsersAdmin.jsx`
- Ruta: `/usuarios` registrada en `src/App.jsx`
- Menú: agregado en `src/components/Sidebar.jsx`
- Almacenamiento: `localStorage` clave `usersMockList`

## Criterios de Aceptación

- [x] Formulario mock de creación con selección de rol
- [x] Tabla mock con usuarios registrados
- [x] Navegación desde dashboard
- [x] UI responsive
- [x] Documentación actualizada (este archivo)
- [x] Modo real (BD) documentado

## Próximos pasos (cuando se implemente autenticación real)

- Integrar con Supabase Auth o proveedor equivalente
- Definir RLS/Policies y mapeo de roles app ↔️ auth
- Migración y tabla `app_users` si se requieren metadatos adicionales
- Protección de rutas por rol
