# Migraciones de Base de Datos - FleetManager

Este directorio contiene las migraciones SQL para la base de datos del sistema de gestión de flota vehicular.

## 📁 Estructura

```
supabase/migrations/
├── 20240115000001_initial_schema.sql           # (Legacy) Esquema inicial
├── 20250918051927_white_temple.sql             # (Legacy) Esquema simplificado
├── 20251108000001_add_admin_user.sql           # Usuario administrador
├── 20251108000002_auth_functions.sql           # Funciones de autenticación
├── 20251108000003_seed_conductores.sql         # Datos de conductores
├── 20251111000001_vehicle_assignments.sql      # Sistema de asignaciones
├── 20251111090000_incidents.sql                # Sistema de incidentes
├── 20251111120000_vehicle_tracking.sql         # Sistema de tracking GPS
├── 20251112145937_alert_rules_and_evaluation.sql # Sistema de alertas
├── 20251112200000_routes_system.sql            # Sistema de rutas optimizadas
├── 20251113000000_route_checkins.sql           # Check-ins de waypoints
└── 20251120000000_route_tracking.sql           # ✨ NUEVO: Tracking y comparación de rutas
```

## 🚀 Migraciones Principales

### 1. Sistema de Rutas (HU10)

**Archivo:** `20251112200000_routes_system.sql`

Tablas:

- `routes` - Rutas con waypoints y optimización
- `route_assignments` - Asignaciones a conductores

### 2. Sistema de Tracking de Rutas (HU12) ⭐ NUEVO

**Archivo:** `20251120000000_route_tracking.sql`

Tablas:

- `route_tracking` - Puntos GPS durante ejecución de rutas
- `route_events` - Eventos importantes (inicio, fin, waypoints)

Funciones:

- `insert_route_tracking_point()` - Registrar punto GPS
- `get_route_trajectory()` - Obtener trayectoria completa
- `get_route_events()` - Listar eventos de ruta
- `get_route_statistics()` - Estadísticas de ruta ejecutada

**Documentación:**

- 📖 Guía completa: `docs/GUIA_COMPARACION_RUTAS.md`
- 🚀 Inicio rápido: `docs/INICIO_RAPIDO_COMPARACION.md`
- ⚙️ Instalación: `docs/INSTALACION_COMPARACION_RUTAS.md`
- 📋 Resumen: `docs/RESUMEN_COMPARACION_RUTAS.md`

**Para instalar:**

```sql
-- Copiar y ejecutar en SQL Editor de Supabase:
-- supabase/migrations/20251120000000_route_tracking.sql
```

**Verificar instalación:**

```sql
-- Debe retornar 2 tablas
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name IN ('route_tracking', 'route_events');

-- Debe retornar 5 funciones
SELECT COUNT(*) FROM information_schema.routines
WHERE routine_name IN (
  'get_route_trajectory',
  'insert_route_tracking_point',
  'get_route_events',
  'insert_route_event',
  'get_route_statistics'
);
```

### Características

- ✅ UUID como claves primarias
- ✅ Índices optimizados en FKs y campos de búsqueda
- ✅ Triggers automáticos para `updated_at`
- ✅ Row Level Security (RLS) habilitado
- ✅ CHECK constraints para integridad de datos
- ✅ Vistas útiles (vehículos asignados, mantenimientos pendientes)
- ✅ Funciones de utilidad
- ✅ Datos de seed para desarrollo

### Tablas Incluidas

| Tabla           | Descripción                          |
| --------------- | ------------------------------------ |
| `conductor`     | Registro de conductores autorizados  |
| `vehiculo`      | Registro de vehículos de la flota    |
| `ruta`          | Rutas planificadas                   |
| `asignacion`    | Asignaciones conductor-vehículo-ruta |
| `mantenimiento` | Registro de mantenimientos           |
| `incidente`     | Registro de incidentes               |
| `combustible`   | Registro de cargas de combustible    |
| `usuario`       | Usuarios del sistema con roles       |

## 📝 Cómo Aplicar la Migración

### Opción 1: Editor SQL de Supabase (Recomendado)

1. Accede a tu proyecto en [https://app.supabase.com](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **"New Query"**
4. Copia el contenido completo de `20251108000000_schema_completo_flota.sql`
5. Pégalo en el editor
6. Haz clic en **"Run"** (o `Ctrl + Enter`)
7. Espera a que complete (10-15 segundos)

### Opción 2: Supabase CLI

```bash
# Instalar CLI (si no la tienes)
npm install -g supabase

# Vincular proyecto
supabase link --project-ref tu-project-ref

# Aplicar migraciones
supabase db push
```

## 🔍 Verificar Instalación

Después de aplicar la migración, verifica en **Table Editor**:

- [x] 8 tablas creadas
- [x] Índices en claves foráneas
- [x] Triggers de `updated_at`
- [x] Políticas RLS activas
- [x] Datos de seed (3 conductores, 5 vehículos, 3 rutas)

## 📊 Datos de Seed

La migración incluye datos de ejemplo:

- **Conductores:** 3 registros
- **Vehículos:** 5 registros
- **Rutas:** 3 registros
- **Usuarios:** 3 registros (admin, operador, mecánico)

### Credenciales de Usuario

```
Usuario: admin
Email: admin@flota.com
Contraseña: admin123
Rol: superusuario
```

**⚠️ IMPORTANTE:** Cambia estas contraseñas antes de producción.

## 🔒 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas básicas:

- **SELECT:** Usuarios autenticados pueden ver datos
- **INSERT/UPDATE/DELETE:** Solo roles autorizados
- **Conductores:** Solo admin/superusuario
- **Vehículos:** Solo admin/superusuario
- **Mantenimientos:** Admin/superusuario/mecánico

### Desactivar RLS (Solo Desarrollo)

Si tienes problemas con permisos durante desarrollo:

```sql
ALTER TABLE conductor DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo DISABLE ROW LEVEL SECURITY;
-- ... etc
```

**⚠️ REACTIVAR antes de producción**

## 📚 Documentación Relacionada

- [Guía de Configuración BD](../docs/GUIA_CONFIGURACION_BD.md) - Guía completa de setup
- [Diagrama ER](../docs/diagramas/Diagrama_ER.md) - Modelo entidad-relación
- [Modelo Relacional](../docs/diagramas/Diagrama_Modelo_Relacional.md) - Especificación técnica

## 🐛 Solución de Problemas

### Error: "relation already exists"

Las tablas ya fueron creadas. Opciones:

1. **Eliminar tablas existentes** (⚠️ perderás datos):

   ```sql
   DROP TABLE IF EXISTS asignacion CASCADE;
   DROP TABLE IF EXISTS combustible CASCADE;
   DROP TABLE IF EXISTS incidente CASCADE;
   DROP TABLE IF EXISTS mantenimiento CASCADE;
   DROP TABLE IF EXISTS ruta CASCADE;
   DROP TABLE IF EXISTS usuario CASCADE;
   DROP TABLE IF EXISTS vehiculo CASCADE;
   DROP TABLE IF EXISTS conductor CASCADE;
   ```

2. **Usar migración incremental:** Ejecuta solo las partes nuevas

### Error: "permission denied"

RLS está bloqueando la operación:

- Asegúrate de estar autenticado
- Verifica que tu usuario tenga el rol correcto
- O desactiva RLS temporalmente (ver arriba)

## 🔄 Rollback

Si necesitas revertir la migración:

```sql
-- Eliminar todas las tablas
DROP TABLE IF EXISTS asignacion CASCADE;
DROP TABLE IF EXISTS combustible CASCADE;
DROP TABLE IF EXISTS incidente CASCADE;
DROP TABLE IF EXISTS mantenimiento CASCADE;
DROP TABLE IF EXISTS ruta CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS vehiculo CASCADE;
DROP TABLE IF EXISTS conductor CASCADE;

-- Eliminar función
DROP FUNCTION IF EXISTS set_updated_at CASCADE;
DROP FUNCTION IF EXISTS get_vehiculos_combustible_bajo CASCADE;

-- Eliminar vistas
DROP VIEW IF EXISTS v_vehiculos_asignados CASCADE;
DROP VIEW IF EXISTS v_mantenimientos_pendientes CASCADE;
DROP VIEW IF EXISTS v_conductores_disponibles CASCADE;
```

## 📈 Próximas Migraciones

Para crear nuevas migraciones:

1. Crea archivo con timestamp: `YYYYMMDDHHMMSS_descripcion.sql`
2. Incluye comentarios explicativos
3. Usa `IF NOT EXISTS` para evitar conflictos
4. Prueba primero en entorno de desarrollo
5. Documenta aquí los cambios

### Plantilla

```sql
-- =====================================================
-- Descripción: [Breve descripción del cambio]
-- Fecha: YYYY-MM-DD
-- Autor: [Tu nombre]
-- =====================================================

-- Tu SQL aquí
```

## ✅ Checklist de Migración

- [ ] Backup de datos existentes
- [ ] Migración ejecutada sin errores
- [ ] Tablas visibles en Table Editor
- [ ] Datos de seed presentes
- [ ] RLS activo y políticas configuradas
- [ ] Índices creados correctamente
- [ ] Triggers funcionando
- [ ] Documentación actualizada

---

**Última actualización:** 2024-11-08
