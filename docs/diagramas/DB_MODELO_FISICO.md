# 🗄️ Modelo Físico de Base de Datos - FlotaVehicular

**Versión**: 2.0.0  
**Actualizado**: Diciembre 2025  
**Base de Datos**: PostgreSQL 15+  
**Patrón**: Relacional con RLS (Row Level Security)

---

## 📊 Resumen de Tablas

| Categoría                  | Tabla                     | Registros                       | Propósito                 |
| -------------------------- | ------------------------- | ------------------------------- | ------------------------- |
| **Gestión de Usuarios**    | `usuario`                 | Usuarios del sistema            | Autenticación y permisos  |
|                            | `user_profiles`           | Perfiles Supabase               | Integración con Auth      |
| **Gestión de Vehículos**   | `vehiculo`                | Vehículos principales           | Datos legacy              |
|                            | `vehicles`                | Vehículos normalizados          | Nueva estructura          |
|                            | `vehicle_locations`       | Ubicaciones en tiempo real      | GPS tracking              |
|                            | `vehicle_assignments`     | Asignaciones vehículo-conductor | Control de uso            |
| **Gestión de Conductores** | `conductor`               | Conductores legacy              | Datos clásicos            |
|                            | `drivers`                 | Conductores normalizados        | Nueva estructura          |
| **Rutas y Asignaciones**   | `ruta`                    | Rutas legacy                    | Trazos clásicos           |
|                            | `routes`                  | Rutas optimizadas               | New routing engine        |
|                            | `route_assignments`       | Asignaciones de rutas           | Detalles de ejecución     |
|                            | `route_tracking`          | Seguimiento GPS de rutas        | Posiciones en tiempo real |
|                            | `route_waypoint_checkins` | Check-ins en waypoints          | Validación de paso        |
|                            | `route_events`            | Eventos de ruta                 | Incidencias durante ruta  |
|                            | `asignacion`              | Asignaciones legacy             | Control clásico           |
| **Alertas y Monitoreo**    | `alert_rules`             | Reglas de alertas               | Configuración de umbrales |
|                            | `alerts`                  | Alertas generadas               | Eventos de alerta         |
|                            | `alert_tracking`          | Historial de alertas            | Seguimiento de estado     |
| **Incidentes**             | `incidente`               | Incidentes legacy               | Datos clásicos            |
|                            | `incidents`               | Incidentes normalizados         | Nueva estructura          |
|                            | `incident_comments`       | Comentarios de incidentes       | Anotaciones               |
|                            | `incident_notifications`  | Notificaciones de incidentes    | Logs de comunicación      |
| **Geocercas**              | `geofences`               | Definición de geocercas         | Zonas geográficas         |
|                            | `geofence_events`         | Eventos de entrada/salida       | Historial de movimiento   |
|                            | `geofence_state`          | Estado actual de geofencas      | Cache de posición         |
| **Mantenimiento**          | `mantenimiento`           | Mantenimiento legacy            | Datos clásicos            |
|                            | `maintenance_rules`       | Reglas de mantenimiento         | Preventivo/correctivo     |
|                            | `maintenance_history`     | Historial de mantenimiento      | Ejecuciones               |
|                            | `maintenance_orders`      | Órdenes de trabajo              | Control de tareas         |
|                            | `maintenance_parts`       | Partes usadas                   | Inventario                |
|                            | `maintenance_attachments` | Documentos adjuntos             | Archivos de órdenes       |
| **Combustible**            | `combustible`             | Registros de combustible        | Control de consumo        |
| **Reportes**               | `report_templates`        | Plantillas de reportes          | Configuración             |
|                            | `report_schedules`        | Automatización de reportes      | Envíos programados        |
|                            | `report_executions`       | Ejecuciones de reportes         | Historial                 |

**Total de Tablas**: 39 tablas normalizadas

---

## 🔗 Diagrama de Relaciones (Simplificado)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GESTIÓN DE USUARIOS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [usuario]  ←──1:N──→  [user_profiles]
│     ↓                       ↓
│  (10 roles)          (Integración Supabase)
│     ↓
│  ├──→ [conductor/drivers]
│  ├──→ [maintenance_history/orders]
│  ├──→ [maintenance_rules]
│  ├──→ [report_templates]
│  ├──→ [report_schedules]
│  ├──→ [geofences]
│  └──→ [maintenance_attachments]
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE VEHÍCULOS Y LOCALIZACIÓN                    │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [vehicles] ←──1:N──→ [vehicle_assignments]
│     ↓                       ↓
│     ├──1:N──→ [vehicle_locations] (GPS real-time)
│     ├──1:N──→ [alerts]
│     ├──1:N──→ [incidents]
│     ├──1:N──→ [maintenance_history]
│     ├──1:N──→ [maintenance_orders]
│     ├──1:N──→ [maintenance_rules]
│     └──1:N──→ [geofence_state]
│
│  Legacy: [vehiculo] ←──1:N──→ [combustible]
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE CONDUCTORES Y ASIGNACIONES                  │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [drivers] ←──1:N──→ [vehicle_assignments]
│     ↓                    ↓
│     ├──1:N──→ [incidents]
│     ├──1:N──→ [route_assignments]
│     └──1:N──→ [alerts]
│
│  Legacy: [conductor] ←──1:N──→ [incidente/asignacion]
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      GESTIÓN DE RUTAS Y MONITOREO                         │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [routes]  ←──1:N──→ [route_assignments]
│     ↓                    ↓
│     └──1:N──────────→ [route_tracking]
│                          ├──1:N──→ [route_waypoint_checkins]
│                          └──1:N──→ [route_events]
│
│  Legacy: [ruta] ←──1:N──→ [asignacion]
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE ALERTAS Y GEOCERCAS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [alert_rules] ←──1:N──→ [alerts] ←──1:N──→ [alert_tracking]
│                                               ↓
│                                        [vehicles]
│
│  [geofences]  ←──1:N──→ [geofence_events]
│      ↓                        ↓
│  [geofence_state]      [vehicles]
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                  GESTIÓN DE INCIDENTES Y MANTENIMIENTO                    │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [incidents]  ←──1:N──→ [incident_comments]
│      ↓                        ↓
│      ├──1:N──→ [incident_notifications]
│      └──1:1──→ [drivers/vehicles]
│
│  [maintenance_orders] ←──1:N──→ [maintenance_parts]
│      ↓                              ↓
│      ├──1:N──→ [maintenance_attachments]
│      └──1:1──→ [vehicles/mechanics]
│
│  [maintenance_rules] ←──1:N──→ [maintenance_history]
│      ↓                              ↓
│      └──1:1──→ [vehicles]      [mechanics/vehicles]
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     GESTIÓN DE REPORTES Y ANÁLISIS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│
│  [report_templates] ←──1:N──→ [report_schedules] ←──1:N──→ [report_executions]
│       ↓                            ↓                              ↓
│   (usuarios)                   (usuarios)                   (usuarios)
│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Diccionario Detallado de Tablas

### 🔐 USUARIO (Autenticación y Control de Acceso)

**Propósito**: Autenticación, autorización y auditoría de usuarios  
**Registros Típicos**: 20-50  
**Índices**: `username` (UNIQUE), `rol`

```sql
┌─────────────────────────────────────────────────────┐
│ Tabla: usuario                                       │
├─────────────────────────────────────────────────────┤
│ Columna            │ Tipo       │ Restricción      │
├────────────────────┼────────────┼──────────────────┤
│ id_usuario         │ INTEGER    │ PRIMARY KEY      │
│ username           │ VARCHAR    │ UNIQUE, NOT NULL │
│ password_hash      │ VARCHAR    │ NOT NULL         │
│ rol                │ VARCHAR    │ CHECK (10 roles) │
│ email              │ VARCHAR    │ UNIQUE           │
│ id_conductor       │ INTEGER    │ FK → conductor   │
│ activo             │ BOOLEAN    │ DEFAULT true     │
│ ultimo_acceso      │ TIMESTAMP  │                  │
│ fecha_creacion     │ TIMESTAMP  │ DEFAULT NOW()    │
│ created_at         │ TIMESTAMP  │ DEFAULT NOW()    │
│ updated_at         │ TIMESTAMP  │ DEFAULT NOW()    │
└─────────────────────────────────────────────────────┘
```

**Roles Disponibles (10)**:

- `superusuario` - Acceso total
- `admin` - Administración del sistema
- `gerente` - Decisiones estratégicas
- `supervisor` - Supervisión operacional
- `planificador` - Planificación de rutas
- `operador` - Monitoreo en tiempo real
- `mecanico` - Mantenimiento vehicular
- `rrhh` - Recursos humanos
- `analista` - Análisis y reportes
- `conductor` - Operación de vehículos

**Relaciones**:

- `1:1` → `user_profiles` (Supabase Auth)
- `1:1` → `conductor` (opcional, si es conductor)
- `1:N` → `maintenance_history` (creado_por)
- `1:N` → `maintenance_rules` (creado_por)
- `1:N` → `maintenance_attachments` (subido_por)
- `1:N` → `maintenance_orders` (mecánico)
- `1:N` → `report_templates` (usuario)
- `1:N` → `report_schedules` (usuario)
- `1:N` → `geofences` (creado_por)

---

### 🚗 VEHICLES (Vehículos Normalizados)

**Propósito**: Registro principal de vehículos con estado actualizado  
**Registros Típicos**: 50-500  
**Índices**: `placa` (UNIQUE), `status`, `vehicle_id`

```sql
┌──────────────────────────────────────────────────────────┐
│ Tabla: vehicles                                          │
├──────────────────────────────────────────────────────────┤
│ Columna                        │ Tipo    │ Restricción  │
├────────────────────────────────┼─────────┼──────────────┤
│ id                             │ INTEGER │ PRIMARY KEY  │
│ placa                          │ VARCHAR │ UNIQUE       │
│ modelo                         │ VARCHAR │ NOT NULL     │
│ año                            │ INTEGER │              │
│ marca                          │ VARCHAR │              │
│ color                          │ VARCHAR │              │
│ numero_chasis                  │ VARCHAR │              │
│ numero_motor                   │ VARCHAR │              │
│ capacidad_combustible          │ NUMERIC │ DEFAULT 0    │
│ kilometraje                    │ INTEGER │ DEFAULT 0    │
│ status                         │ VARCHAR │ CHECK (4)    │
│ fecha_compra                   │ DATE    │              │
│ fecha_ultimo_mantenimiento     │ DATE    │              │
│ proximo_mantenimiento_km       │ INTEGER │              │
│ created_at                     │ TIMESTAMP WITH TZ       │
│ updated_at                     │ TIMESTAMP WITH TZ       │
│ conductor                      │ TEXT    │              │
└──────────────────────────────────────────────────────────┘
```

**Estados Permitidos**: `activo`, `estacionado`, `mantenimiento`, `inactivo`

**Relaciones**:

- `1:N` → `vehicle_locations` (GPS en tiempo real)
- `1:N` → `vehicle_assignments` (asignaciones)
- `1:N` → `alerts` (alertas activas)
- `1:N` → `incidents` (incidentes reportados)
- `1:N` → `maintenance_history` (historial)
- `1:N` → `maintenance_orders` (órdenes de trabajo)
- `1:N` → `maintenance_rules` (reglas asociadas)
- `1:N` → `route_tracking` (seguimiento de rutas)
- `1:N` → `geofence_state` (estado en geocercas)

---

### 👤 DRIVERS (Conductores Normalizados)

**Propósito**: Registro principal de conductores  
**Registros Típicos**: 30-200  
**Índices**: `cedula` (UNIQUE), `numero_licencia` (UNIQUE), `estado`

```sql
┌────────────────────────────────────────────────────┐
│ Tabla: drivers                                     │
├────────────────────────────────────────────────────┤
│ Columna                      │ Tipo      │ Notas  │
├──────────────────────────────┼───────────┼────────┤
│ id                           │ INTEGER   │ PK     │
│ cedula                       │ VARCHAR   │ UNIQUE │
│ nombre                       │ VARCHAR   │ NOT NULL
│ apellidos                    │ VARCHAR   │        │
│ fecha_nacimiento             │ DATE      │        │
│ telefono                     │ VARCHAR   │        │
│ email                        │ VARCHAR   │        │
│ direccion                    │ TEXT      │        │
│ numero_licencia              │ VARCHAR   │ UNIQUE │
│ categoria_licencia           │ VARCHAR   │        │
│ fecha_expedicion_licencia    │ DATE      │        │
│ fecha_vencimiento_licencia   │ DATE      │        │
│ estado                       │ VARCHAR   │ CHECK  │
│ fecha_ingreso                │ DATE      │        │
│ created_at                   │ TIMESTAMP │ WITH TZ│
│ updated_at                   │ TIMESTAMP │ WITH TZ│
└────────────────────────────────────────────────────┘
```

**Estados**: `activo`, `inactivo`, `disponible`, `en_servicio`

**Relaciones**:

- `1:N` → `vehicle_assignments` (asignaciones)
- `1:N` → `incidents` (incidentes involucrados)
- `1:N` → `route_assignments` (rutas asignadas)
- `1:N` → `alerts` (alertas de conductor)

---

### 🛣️ ROUTES (Rutas Optimizadas)

**Propósito**: Definición de rutas con waypoints y optimización  
**Registros Típicos**: 100-1000  
**Índices**: `status`, `created_at`

```sql
┌────────────────────────────────────────────────────┐
│ Tabla: routes                                      │
├────────────────────────────────────────────────────┤
│ Columna         │ Tipo      │ Restricción         │
├─────────────────┼───────────┼─────────────────────┤
│ id              │ BIGINT    │ PRIMARY KEY         │
│ name            │ VARCHAR   │ NOT NULL            │
│ description     │ TEXT      │                     │
│ waypoints       │ JSONB     │ Array >= 2 puntos   │
│ optimized_order │ JSONB     │ Orden optimizada    │
│ total_distance  │ INTEGER   │ NOT NULL (metros)   │
│ total_duration  │ INTEGER   │ NOT NULL (segundos) │
│ geometry        │ JSONB     │ GeoJSON             │
│ status          │ VARCHAR   │ CHECK (3 estados)   │
│ created_by      │ VARCHAR   │                     │
│ created_at      │ TIMESTAMP │ WITH TZ             │
│ updated_at      │ TIMESTAMP │ WITH TZ             │
└────────────────────────────────────────────────────┘
```

**Estructura de Waypoints**:

```json
[
  {
    "sequence": 1,
    "latitude": 10.3936,
    "longitude": -75.483,
    "label": "Origen",
    "type": "start",
    "arrival_window": { "start": "08:00", "end": "08:30" }
  },
  {
    "sequence": 2,
    "latitude": 10.4,
    "longitude": -75.5,
    "label": "Cliente A",
    "type": "waypoint",
    "service_time_minutes": 30
  }
]
```

**Relaciones**:

- `1:N` → `route_assignments` (asignaciones de ruta)
- `1:N` → `route_tracking` (seguimiento GPS)
- `1:N` → `route_waypoint_checkins` (check-ins)
- `1:N` → `route_events` (eventos durante ruta)

---

### 🔔 ALERT_RULES (Configuración de Alertas)

**Propósito**: Definición de reglas y umbrales para alertas  
**Registros Típicos**: 10-30  
**Índices**: `tipo_alerta` (UNIQUE), `habilitado`

```sql
┌──────────────────────────────────────────────────────┐
│ Tabla: alert_rules                                   │
├──────────────────────────────────────────────────────┤
│ Columna              │ Tipo    │ Descripción         │
├──────────────────────┼─────────┼─────────────────────┤
│ id                   │ INTEGER │ PRIMARY KEY         │
│ tipo_alerta          │ VARCHAR │ UNIQUE, 5 tipos    │
│ nombre               │ VARCHAR │ Descriptivo         │
│ descripcion          │ TEXT    │                     │
│ habilitado           │ BOOLEAN │ DEFAULT true        │
│ umbrales             │ JSONB   │ Config variables    │
│ nivel_prioridad      │ VARCHAR │ CHECK (4 niveles)   │
│ debounce_segundos    │ INTEGER │ Retraso antes alerta│
│ tolerancia_porcentaje│ INTEGER │ Margen de error     │
│ notificar_push       │ BOOLEAN │ DEFAULT true        │
│ notificar_email      │ BOOLEAN │ DEFAULT false       │
│ created_at           │ TIMESTAMP                     │
│ updated_at           │ TIMESTAMP                     │
└──────────────────────────────────────────────────────┘
```

**Tipos de Alertas (5)**:

- `velocidad_excesiva` - Umbrales: km/h máximo
- `parada_prolongada` - Umbrales: minutos límite
- `desvio_ruta` - Umbrales: metros de tolerancia
- `combustible_bajo` - Umbrales: % mínimo
- `mantenimiento_vencido` - Umbrales: días/km

**Niveles de Prioridad**: `baja`, `media`, `alta`, `critica`

**Estructura de Umbrales (JSONB)**:

```json
{
  "velocidad_excesiva": { "km_h_max": 120, "duracion_segundos": 30 },
  "parada_prolongada": { "minutos_max": 60, "radio_metros": 50 },
  "combustible_bajo": { "porcentaje_minimo": 20 },
  "desvio_ruta": { "metros_tolerancia": 500 }
}
```

**Relaciones**:

- `1:N` → `alerts` (alertas generadas)

---

### 🚨 ALERTS (Alertas Generadas)

**Propósito**: Registro de alertas activas del sistema  
**Registros Típicos**: 100-10000 (historial)  
**Índices**: `vehicle_id`, `driver_id`, `estado`, `tipo_alerta`, `fecha_alerta`

```sql
┌─────────────────────────────────────────────────────┐
│ Tabla: alerts                                       │
├─────────────────────────────────────────────────────┤
│ Columna            │ Tipo      │ Restricción        │
├────────────────────┼───────────┼────────────────────┤
│ id                 │ INTEGER   │ PRIMARY KEY        │
│ vehicle_id         │ INTEGER   │ FK → vehicles      │
│ driver_id          │ INTEGER   │ FK → drivers       │
│ tipo_alerta        │ VARCHAR   │ CHECK (7 tipos)    │
│ mensaje            │ TEXT      │ NOT NULL           │
│ nivel_prioridad    │ VARCHAR   │ CHECK (4 niveles)  │
│ estado             │ VARCHAR   │ CHECK (4 estados)  │
│ fecha_alerta       │ TIMESTAMP │ DEFAULT NOW()      │
│ fecha_resolucion   │ TIMESTAMP │                    │
│ resuelto_por       │ VARCHAR   │ Usuario que resolvió
│ created_at         │ TIMESTAMP │                    │
│ metadata           │ JSONB     │ Context adicional  │
└─────────────────────────────────────────────────────┘
```

**Tipos de Alertas (7)**:

- `combustible_bajo`
- `mantenimiento_vencido`
- `velocidad_excesiva`
- `licencia_vencida`
- `parada_no_autorizada`
- `parada_prolongada`
- `falla_sistema`

**Estados**: `pendiente`, `vista`, `resuelta`, `ignorada`

**Relaciones**:

- `N:1` → `vehicles` (vehículo involucrado)
- `N:1` → `drivers` (conductor involucrado)
- `N:1` → `alert_rules` (a través de tipo_alerta)
- `1:N` → `alert_tracking` (historial)
- `1:N` → `incident_notifications` (notificaciones enviadas)

---

### 🛣️ ROUTE_ASSIGNMENTS (Asignaciones de Rutas)

**Propósito**: Ejecución de rutas asignadas a conductor y vehículo  
**Registros Típicos**: 500-5000 (activos + histórico)  
**Índices**: `route_id`, `driver_id`, `vehicle_id`, `status`, `scheduled_start`

```sql
┌────────────────────────────────────────────────────┐
│ Tabla: route_assignments                           │
├────────────────────────────────────────────────────┤
│ Columna            │ Tipo      │ Notas              │
├────────────────────┼───────────┼────────────────────┤
│ id                 │ BIGINT    │ PRIMARY KEY        │
│ route_id           │ BIGINT    │ FK → routes        │
│ driver_id          │ BIGINT    │ FK → drivers       │
│ vehicle_id         │ BIGINT    │ FK → vehicles      │
│ scheduled_start    │ TIMESTAMP │ Inicio planeado    │
│ scheduled_end      │ TIMESTAMP │ Fin planeado       │
│ actual_start       │ TIMESTAMP │ Inicio real        │
│ actual_end         │ TIMESTAMP │ Fin real           │
│ status             │ VARCHAR   │ CHECK (4 estados)  │
│ notes              │ TEXT      │                    │
│ created_at         │ TIMESTAMP │ WITH TZ            │
│ updated_at         │ TIMESTAMP │ WITH TZ            │
└────────────────────────────────────────────────────┘
```

**Estados**: `pending`, `in_progress`, `completed`, `cancelled`

**Relaciones**:

- `N:1` → `routes` (ruta asignada)
- `N:1` → `drivers` (conductor)
- `N:1` → `vehicles` (vehículo)
- `1:N` → `route_tracking` (posiciones GPS)
- `1:N` → `route_waypoint_checkins` (puntos visitados)
- `1:N` → `route_events` (eventos durante ruta)

---

### 📍 ROUTE_TRACKING (Seguimiento GPS de Rutas)

**Propósito**: Historial de posiciones GPS durante ejecución de ruta  
**Registros Típicos**: 100000+ (5-10 posiciones por minuto, por ruta)  
**Índices**: `assignment_id`, `vehicle_id`, `recorded_at` (clustering)

```sql
┌──────────────────────────────────────────────────┐
│ Tabla: route_tracking                            │
├──────────────────────────────────────────────────┤
│ Columna      │ Tipo    │ Restricción            │
├──────────────┼─────────┼────────────────────────┤
│ id           │ BIGINT  │ PRIMARY KEY            │
│ assignment_id│ BIGINT  │ FK → route_assignments │
│ vehicle_id   │ BIGINT  │ FK → vehicles          │
│ latitude     │ NUMERIC │ CHECK (-90 a 90)       │
│ longitude    │ NUMERIC │ CHECK (-180 a 180)     │
│ speed        │ NUMERIC │ DEFAULT 0              │
│ heading      │ NUMERIC │ CHECK (0 a 360)        │
│ accuracy     │ NUMERIC │ Margen error GPS       │
│ altitude     │ NUMERIC │                        │
│ recorded_at  │ TIMESTAMP                         │
└──────────────────────────────────────────────────┘
```

**Relaciones**:

- `N:1` → `route_assignments` (asignación)
- `N:1` → `vehicles` (vehículo)

**Características**:

- High-frequency data (puede crecer rápidamente)
- Requiere particionamiento por fecha para rendimiento
- Useful para análisis post-viaje y auditoría

---

### ✅ ROUTE_WAYPOINT_CHECKINS (Check-ins en Waypoints)

**Propósito**: Validación de que el conductor pasó por cada waypoint  
**Registros Típicos**: 1000-50000  
**Índices**: `assignment_id`, `waypoint_number`

```sql
┌──────────────────────────────────────────────┐
│ Tabla: route_waypoint_checkins               │
├──────────────────────────────────────────────┤
│ Columna           │ Tipo      │ Notas       │
├───────────────────┼───────────┼─────────────┤
│ id                │ BIGINT    │ PRIMARY KEY │
│ assignment_id     │ BIGINT    │ FK ruta     │
│ waypoint_number   │ INTEGER   │ Secuencia   │
│ checked_in_at     │ TIMESTAMP │ Hora real   │
│ latitude          │ NUMERIC   │ Posición    │
│ longitude         │ NUMERIC   │ Posición    │
│ notes             │ TEXT      │ Observaciones
│ created_at        │ TIMESTAMP │             │
└──────────────────────────────────────────────┘
```

**Relaciones**:

- `N:1` → `route_assignments` (asignación)

---

### 🛠️ MAINTENANCE_ORDERS (Órdenes de Mantenimiento)

**Propósito**: Sistema de trabajo para mantenimiento vehicular  
**Registros Típicos**: 500-5000 (activos + histórico)  
**Índices**: `vehicle_id`, `mechanic_id`, `status`, `scheduled_date`

```sql
┌──────────────────────────────────────────────────────┐
│ Tabla: maintenance_orders                            │
├──────────────────────────────────────────────────────┤
│ Columna         │ Tipo      │ Descripción           │
├─────────────────┼───────────┼───────────────────────┤
│ id              │ UUID      │ PRIMARY KEY           │
│ vehicle_id      │ INTEGER   │ FK → vehicles         │
│ mechanic_id     │ INTEGER   │ FK → usuario (mechanic
│ order_number    │ VARCHAR   │ UNIQUE, correlativo   │
│ title           │ VARCHAR   │ Título de orden       │
│ description     │ TEXT      │                       │
│ type            │ VARCHAR   │ preventivo/correctivo │
│ status          │ VARCHAR   │ Estado del trabajo    │
│ scheduled_date  │ DATE      │ Fecha programada      │
│ execution_date  │ DATE      │ Fecha ejecución       │
│ completion_date │ TIMESTAMP │ Completada           │
│ mileage         │ INTEGER   │ Km cuando se hizo     │
│ labor_hours     │ NUMERIC   │ Horas trabajadas      │
│ labor_rate      │ NUMERIC   │ Tarifa por hora       │
│ other_costs     │ NUMERIC   │ Costos adicionales    │
│ total_cost      │ NUMERIC   │ Costo total           │
│ notes           │ TEXT      │ Observaciones         │
│ created_at      │ TIMESTAMP │ WITH TZ               │
│ updated_at      │ TIMESTAMP │ WITH TZ               │
└──────────────────────────────────────────────────────┘
```

**Estados**: `programada`, `en_progreso`, `completada`, `cancelada`

**Relaciones**:

- `N:1` → `vehicles` (vehículo)
- `N:1` → `usuario` (mecánico asignado)
- `1:N` → `maintenance_parts` (partes usadas)
- `1:N` → `maintenance_attachments` (documentos)

---

### 🔧 MAINTENANCE_RULES (Reglas de Mantenimiento Preventivo)

**Propósito**: Definir cuándo y cómo se debe hacer mantenimiento  
**Registros Típicos**: 50-200  
**Índices**: `vehicle_id`, `habilitado`, `proxima_fecha_estimada`

```sql
┌────────────────────────────────────────────────────┐
│ Tabla: maintenance_rules                           │
├────────────────────────────────────────────────────┤
│ Columna                    │ Tipo      │ Notas    │
├────────────────────────────┼───────────┼──────────┤
│ id                         │ INTEGER   │ PK       │
│ vehicle_id                 │ INTEGER   │ FK veh   │
│ tipo_mantenimiento         │ VARCHAR   │          │
│ descripcion                │ TEXT      │          │
│ kilometraje_umbral         │ INTEGER   │ Km límite│
│ tiempo_meses_umbral        │ INTEGER   │ Meses    │
│ anticipacion_km            │ INTEGER   │ Alerta km│
│ anticipacion_dias          │ INTEGER   │ Alerta d │
│ habilitado                 │ BOOLEAN   │ Activa   │
│ nivel_prioridad            │ VARCHAR   │          │
│ costo_estimado             │ NUMERIC   │          │
│ ultima_ejecucion_fecha     │ DATE      │          │
│ ultimo_kilometraje         │ INTEGER   │          │
│ proxima_fecha_estimada     │ DATE      │          │
│ proximo_kilometraje_estimado INT                  │
│ created_at                 │ TIMESTAMP │ WITH TZ  │
│ updated_at                 │ TIMESTAMP │ WITH TZ  │
│ created_by                 │ INTEGER   │ FK user  │
└────────────────────────────────────────────────────┘
```

**Relaciones**:

- `N:1` → `vehicles` (vehículo)
- `N:1` → `usuario` (usuario que creó)
- `1:N` → `maintenance_history` (historial)

---

### 🌍 GEOFENCES (Geocercas)

**Propósito**: Definir zonas geográficas para alertas  
**Registros Típicos**: 10-100  
**Índices**: `activo`, `created_by`

```sql
┌─────────────────────────────────────────────┐
│ Tabla: geofences                            │
├─────────────────────────────────────────────┤
│ Columna      │ Tipo      │ Descripción     │
├──────────────┼───────────┼─────────────────┤
│ id           │ INTEGER   │ PRIMARY KEY     │
│ nombre       │ VARCHAR   │ NOT NULL        │
│ descripcion  │ TEXT      │                 │
│ tipo         │ VARCHAR   │ circle/polygon  │
│ geometry     │ JSONB     │ GeoJSON format  │
│ radio_m      │ INTEGER   │ Para círculos   │
│ activo       │ BOOLEAN   │ DEFAULT true    │
│ metadata     │ JSONB     │ Custom data     │
│ created_at   │ TIMESTAMP │ WITH TZ         │
│ updated_at   │ TIMESTAMP │ WITH TZ         │
│ created_by   │ INTEGER   │ FK → usuario    │
└─────────────────────────────────────────────┘
```

**Geometría (GeoJSON)**:

```json
{
  "type": "circle",
  "coordinates": [10.3936, -75.483],
  "radius_meters": 500
}
```

O para polígono:

```json
{
  "type": "polygon",
  "coordinates": [
    [
      [10.3936, -75.483],
      [10.395, -75.483],
      [10.395, -75.484],
      [10.3936, -75.484]
    ]
  ]
}
```

**Relaciones**:

- `1:N` → `geofence_events` (entradas/salidas)
- `1:N` → `geofence_state` (estado actual)
- `N:1` → `usuario` (creador)

---

### 📊 REPORT_TEMPLATES (Plantillas de Reportes)

**Propósito**: Configuración de reportes personalizados  
**Registros Típicos**: 20-100  
**Índices**: `user_id`, `report_type`, `is_default`

```sql
┌──────────────────────────────────────────────────┐
│ Tabla: report_templates                          │
├──────────────────────────────────────────────────┤
│ Columna        │ Tipo      │ Descripción        │
├────────────────┼───────────┼────────────────────┤
│ id             │ UUID      │ PRIMARY KEY        │
│ user_id        │ INTEGER   │ FK → usuario       │
│ name           │ VARCHAR   │ NOT NULL           │
│ description    │ TEXT      │                    │
│ report_type    │ VARCHAR   │ drivers/vehicles   │
│ filters        │ JSONB     │ Query config       │
│ metrics        │ ARRAY     │ Métricas a mostrar │
│ columns        │ ARRAY     │ Columnas a mostrar │
│ is_default     │ BOOLEAN   │ Template por defect│
│ created_at     │ TIMESTAMP │ WITH TZ            │
│ updated_at     │ TIMESTAMP │ WITH TZ            │
└──────────────────────────────────────────────────┘
```

**Relaciones**:

- `N:1` → `usuario` (propietario)
- `1:N` → `report_schedules` (automatizaciones)
- `1:N` → `report_executions` (ejecuciones)

---

## 🔑 Índices Recomendados para Rendimiento

```sql
-- Búsquedas rápidas por estado
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_alerts_estado ON alerts(estado);
CREATE INDEX idx_drivers_estado ON drivers(estado);

-- Búsquedas por fecha (para reportes)
CREATE INDEX idx_alerts_fecha ON alerts(fecha_alerta DESC);
CREATE INDEX idx_route_tracking_recorded ON route_tracking(recorded_at DESC);
CREATE INDEX idx_maintenance_orders_date ON maintenance_orders(scheduled_date);

-- Búsquedas por vehículo/conductor (FK muy usadas)
CREATE INDEX idx_alerts_vehicle ON alerts(vehicle_id);
CREATE INDEX idx_alerts_driver ON alerts(driver_id);
CREATE INDEX idx_route_assignments_route ON route_assignments(route_id);
CREATE INDEX idx_route_assignments_driver ON route_assignments(driver_id);
CREATE INDEX idx_vehicle_locations_vehicle ON vehicle_locations(vehicle_id);

-- Composite indexes para queries comunes
CREATE INDEX idx_route_tracking_composite ON route_tracking(assignment_id, recorded_at DESC);
CREATE INDEX idx_alerts_composite ON alerts(vehicle_id, estado, tipo_alerta);
```

---

## 📈 Particionamiento de Tablas (Para Escalabilidad)

**Tablas con alto volumen de datos** que requieren particionamiento:

```sql
-- route_tracking: Por mes (muy alta frecuencia)
CREATE TABLE route_tracking_2025_01 PARTITION OF route_tracking
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- vehicle_locations: Por mes
-- alerts: Por trimestre
-- incidents: Por año
```

---

## 🔒 Row Level Security (RLS)

**Políticas sugeridas**:

```sql
-- Usuarios solo ven alertas de sus vehículos/conductores asignados
CREATE POLICY "users_view_own_alerts" ON alerts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id_usuario FROM usuario
      WHERE (vehiculo.id = vehicle_id OR conductor.id = driver_id)
    )
  );

-- Supervisores ven alertas de su área
CREATE POLICY "supervisors_view_area_alerts" ON alerts
  FOR SELECT USING (
    (SELECT rol FROM usuario WHERE id = auth.uid()) = 'supervisor'
  );
```

---

## 📋 Tipos de Datos Personalizados Recomendados

```sql
-- ENUM para estados de vehículos
CREATE TYPE vehicle_status AS ENUM ('activo', 'estacionado', 'mantenimiento', 'inactivo');

-- ENUM para estados de alertas
CREATE TYPE alert_status AS ENUM ('pendiente', 'vista', 'resuelta', 'ignorada');

-- ENUM para roles
CREATE TYPE user_role AS ENUM (
  'superusuario', 'admin', 'gerente', 'supervisor',
  'planificador', 'operador', 'mecanico', 'rrhh',
  'analista', 'conductor'
);
```

---

## 🔄 Migración de Datos (Legacy a Nuevo)

**Tablas Legacy** (mantener por compatibilidad):

- `vehiculo` → Migrar a `vehicles` con trigger de sincronización
- `conductor` → Migrar a `drivers` con trigger de sincronización
- `ruta` → Migrar a `routes` con transformación de datos
- `asignacion` → Reemplazar con `route_assignments`

**Estrategia de migración**:

1. Mantener tablas legacy por período de transición
2. Crear triggers para sincronizar cambios
3. Ejecutar reportes en ambas tablas hasta validar
4. Migración gradual de datos históricos
5. Deprecación y limpieza

---

**Fin del Modelo Físico de Base de Datos**
