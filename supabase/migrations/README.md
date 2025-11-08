# Migraciones de Base de Datos - FleetManager

Este directorio contiene las migraciones SQL para la base de datos del sistema de gestión de flota vehicular.

## 📁 Estructura

```
supabase/migrations/
├── 20240115000001_initial_schema.sql      # (Legacy) Esquema inicial con multi-tenancy
├── 20250918051927_white_temple.sql        # (Legacy) Esquema simplificado en español
└── 20251108000000_schema_completo_flota.sql # ✅ Esquema actual optimizado
```

## 🚀 Migración Activa

**Archivo:** `20251108000000_schema_completo_flota.sql`

Este es el esquema completo y optimizado que debes usar. Incluye:

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
