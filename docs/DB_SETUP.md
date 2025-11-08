# 🗄️ Configuración de Base de Datos - Supabase

> **Issue:** #49 - Configurar y conectar la base de datos al proyecto  
> **Fecha:** 2025-11-08  
> **Estado:** ✅ Completado

---

## 📋 Tabla de Contenidos

1. [Resumen Rápido](#resumen-rápido)
2. [Configuración Inicial](#configuración-inicial)
3. [Ejecutar Migrations](#ejecutar-migrations)
4. [Usuarios Administradores](#usuarios-administradores)
5. [Seed Data](#seed-data)
6. [Verificación de Conexión](#verificación-de-conexión)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Resumen Rápido

Este proyecto utiliza **Supabase (PostgreSQL)** con un esquema personalizado que incluye:

- ✅ Tablas legacy: `usuario`, `conductor`, `vehiculo`, etc.
- ✅ Autenticación personalizada contra tabla `usuario` (no Supabase Auth)
- ✅ RPC functions para login y cambio de contraseña
- ✅ Seed data de conductores de ejemplo

**Credenciales iniciales:**

- 👤 **Usuario 1:** `admin` / `Admin123!`
- 👤 **Usuario 2:** `jtrianaadmin` / `Flota2025$Secure`

---

## ⚙️ Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Haz clic en **"New Project"**
3. Rellena los datos:
   - **Project name:** FlotaVehicular
   - **Database password:** Usa una contraseña fuerte
   - **Region:** Selecciona la más cercana a tu ubicación
4. Espera a que se cree el proyecto (~2 minutos)

### 2. Obtener Credenciales

1. Ve a **Settings → API**
2. Copia estos valores:
   - `VITE_SUPABASE_URL` (Project URL)
   - `VITE_SUPABASE_ANON_KEY` (anon/public key)
   - `VITE_SUPABASE_SERVICE_ROLE_KEY` (service_role key - secreto)

### 3. Configurar `.env`

```bash
# En la raíz del proyecto, copia env.example a .env
cp env.example .env
```

Luego edita `.env` con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_MOCK_MODE=false
```

⚠️ **IMPORTANTE:** `.env` no debe estar en Git (ya está en `.gitignore`)

---

## 🔧 Ejecutar Migrations

Las migrations están en `supabase/migrations/` en este orden:

### Orden de Ejecución (IMPORTANTE)

| #   | Archivo                               | Descripción                                                       |
| --- | ------------------------------------- | ----------------------------------------------------------------- |
| 1️⃣  | `20240115000001_initial_schema.sql`   | Esquema inicial moderno con companies/users/drivers/vehicles      |
| 2️⃣  | `20250918051927_white_temple.sql`     | Esquema legacy con tablas conductor/vehiculo/usuario              |
| 3️⃣  | `20251108000001_add_admin_user.sql`   | Crea 2 usuarios admin con contraseñas hasheadas                   |
| 4️⃣  | `20251108000002_auth_functions.sql`   | RPC functions: `validate_user_login()` y `change_user_password()` |
| 5️⃣  | `20251108000003_seed_conductores.sql` | 4 conductores de ejemplo con estados variados                     |

### Opción A: Interfaz Gráfica (Recomendado)

1. Abre [Supabase Console](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre un archivo de migration:
   ```
   supabase/migrations/20240115000001_initial_schema.sql
   ```
4. Copia TODO el contenido y pégalo en el editor
5. Haz clic en **"Run"**
6. Repite para cada archivo en orden

### Opción B: CLI (si tienes Supabase CLI instalado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Conectar a tu proyecto
supabase link --project-ref nqsfitpsygpwfglchihl

# Ejecutar todas las migrations
supabase db push
```

### Opción C: Script Manual (PowerShell)

```powershell
# Desde la raíz del proyecto
$files = @(
    "supabase/migrations/20240115000001_initial_schema.sql",
    "supabase/migrations/20250918051927_white_temple.sql",
    "supabase/migrations/20251108000001_add_admin_user.sql",
    "supabase/migrations/20251108000002_auth_functions.sql",
    "supabase/migrations/20251108000003_seed_conductores.sql"
)

foreach ($file in $files) {
    Write-Host "Ejecutando: $file"
    # Aquí deberías usar psql o supabase CLI
}
```

---

## 👤 Usuarios Administradores

Después de ejecutar `20251108000001_add_admin_user.sql`, tienes 2 usuarios admin:

### Usuario 1: Admin Principal

```
Username:   admin
Email:      admin@flotavehicular.com
Password:   Admin123!
Rol:        superusuario
```

### Usuario 2: Admin Secundario

```
Username:   jtrianaadmin
Email:      jtriana@flotavehicular.com
Password:   Flota2025$Secure
Rol:        superusuario
```

### ⚠️ IMPORTANTE

1. **Cambiar contraseñas en el primer login** ← ¡Crítico!
2. Usar contraseñas fuertes (12+ caracteres, mayúsculas, números, símbolos)
3. Guardar las nuevas contraseñas en un gestor de contraseñas seguro
4. No compartir estas credenciales

---

## 🌱 Seed Data

### Conductores de Ejemplo

La migration `20251108000003_seed_conductores.sql` crea 4 conductores:

| ID  | Nombre         | CC         | Estado      | Licencia   |
| --- | -------------- | ---------- | ----------- | ---------- |
| 1   | Carlos Mendoza | 1234567890 | disponible  | 2025-06-15 |
| 2   | María García   | 9876543210 | activo      | 2025-12-31 |
| 3   | Luis Rodríguez | 1122334455 | en_servicio | 2025-08-20 |
| 4   | Ana Martínez   | 5566778899 | suspendido  | 2024-11-30 |

Estos se usan para **testing y desarrollo**. En producción, deberán crearse nuevos conductores reales.

---

## ✅ Verificación de Conexión

### Test 1: Verificar en Dashboard

1. Ve a [Supabase Console → SQL Editor](https://app.supabase.com)
2. Ejecuta esta query:

```sql
SELECT COUNT(*) as total_conductores FROM conductor;
SELECT id_usuario, username, rol FROM usuario ORDER BY username;
```

Deberías ver:

- ✅ 4 conductores
- ✅ 2 usuarios admin

### Test 2: Verificar desde la Aplicación

1. Inicia el proyecto localmente:

```bash
npm install
npm run dev
```

2. Ve a http://localhost:5173/health
3. Deberías ver: **"Conexión exitosa con Supabase"**

### Test 3: Probar Login

1. Ve a http://localhost:5173/login
2. Ingresa:
   - Username: `admin`
   - Password: `Admin123!`
3. Deberías ver el dashboard después del login ✅

### Test 4: Probar Conductores (API)

1. Ve a http://localhost:5173/conductores
2. Deberías ver lista de 4 conductores desde BD ✅
3. Botón "Actualizar" debe refrescar los datos ✅

---

## 🔍 Verificar Estado de Migrations

### En Supabase Console

Ve a **Database → Migrations** para ver:

- ✅ Todas las migrations ejecutadas
- ✅ Timestamps de ejecución
- ✅ Errores (si los hay)

### Query para Verificar Tablas

En Supabase SQL Editor:

```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estructura de tabla conductor
\d conductor

-- Ver RPC functions
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public';
```

---

## 🆘 Troubleshooting

### ❌ Error: "Conexión rechazada"

**Causa:** `.env` no tiene credenciales o están incorrectas

**Solución:**

```bash
# 1. Verifica que .env existe y tiene valores
cat .env

# 2. Copia del env.example
cp env.example .env

# 3. Edita con tus credenciales reales de Supabase
```

### ❌ Error: "Tabla conductor no existe"

**Causa:** Migrations no ejecutadas en orden

**Solución:**

1. Ve a Supabase SQL Editor
2. Ejecuta migration `20250918051927_white_temple.sql` primero
3. Luego las demás en orden

### ❌ Error: "Función validate_user_login no existe"

**Causa:** Migration `20251108000002_auth_functions.sql` no ejecutada

**Solución:**

1. Ve a Supabase SQL Editor
2. Copia y ejecuta `supabase/migrations/20251108000002_auth_functions.sql`

### ❌ Login falla con "Credenciales inválidas"

**Causa:**

- Contraseña incorrecta (passwords son case-sensitive)
- Usuario no existe

**Solución:**

```sql
-- En Supabase SQL Editor, verifica usuarios
SELECT id_usuario, username, email, activo
FROM usuario
WHERE activo = true;

-- Si no hay, ejecuta: 20251108000001_add_admin_user.sql
```

### ❌ VITE_MOCK_MODE está en true

**Causa:** Estás usando datos mock en lugar de Supabase

**Solución:**

```env
# En .env, cambia a:
VITE_MOCK_MODE=false
```

### ❌ Migraciones ejecutadas en orden incorrecto

**Solución:**

1. Crea un nuevo proyecto Supabase
2. Ejecuta las migrations en este orden exacto:
   1. `20240115000001_initial_schema.sql`
   2. `20250918051927_white_temple.sql`
   3. `20251108000001_add_admin_user.sql`
   4. `20251108000002_auth_functions.sql`
   5. `20251108000003_seed_conductores.sql`

---

## 📊 Estructura de Base de Datos

### Tablas Principales

```
usuario
├── id_usuario (PK)
├── username (UNIQUE)
├── email
├── password_hash (bcrypt)
├── rol (superusuario, administrador, mecanico, conductor)
├── activo (boolean)
└── fecha_creacion

conductor
├── id_conductor (PK)
├── cedula (UNIQUE)
├── nombre_completo
├── telefono
├── email
├── estado (disponible, activo, en_servicio, suspendido)
├── fecha_ingreso
├── fecha_venc_licencia
└── categoria_licencia

vehiculo
├── id_vehiculo (PK)
├── placa (UNIQUE)
├── marca
├── modelo
├── año
└── estado
```

### Funciones SQL (RPC)

```sql
-- Autenticación
validate_user_login(p_username text, p_password text)
-- Retorna: id_usuario, email, username, rol, success

-- Cambio de contraseña
change_user_password(p_user_id int, p_old_password text, p_new_password text)
-- Retorna: success, message
```

---

## 📝 Notas Importantes

1. **Contraseñas:** Se usan bcrypt con `gen_salt('bf')`
2. **Zona horaria:** Todo en UTC (puede configurarse por usuario)
3. **Row Level Security (RLS):** Implementado pero deshabilitado inicialmente
4. **Backups:** Supabase maneja backups automáticos diarios
5. **Límites:** Plan free permite hasta 500MB de storage

---

## ✨ Próximos Pasos

Después de completar DB_SETUP:

1. **Sprint 10:** CRUD vehículos (crear `vehiculoService.js`)
2. **Sprint 11:** Integración mapas (Google Maps o Mapbox)
3. **Sprint 12:** Módulo mantenimiento
4. **Sprint 13+:** Rutas, combustible, alertas, reportes

---

## 📞 Soporte

- **Documentación Supabase:** https://supabase.com/docs
- **Comunidad Discord:** https://discord.supabase.io
- **Issues del proyecto:** https://github.com/CamiloTriana75/FlotaVehicular/issues

---

**Última actualización:** 2025-11-08  
**Responsable:** Equipo de Desarrollo  
**Status:** ✅ Completo
