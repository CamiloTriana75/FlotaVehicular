# 📊 Diagrama Entidad-Relación (ER) - FlotaVehicular v2.0.0

**Actualizado**: Diciembre 2025  
**Tablas**: 39 normalizadas  
**Relaciones**: 50+

---

## 🎯 Diagrama ER Completo

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    GESTIÓN DE USUARIOS Y AUTENTICACIÓN                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

                    ┌─────────────────┐
                    │    usuario      │
                    ├─────────────────┤
                    │ id_usuario (PK) │◄────────────────────┐
                    │ username (UNQ)  │                     │
                    │ password_hash   │                     │
                    │ rol             │ (10 tipos)          │
                    │ email (UNQ)     │                     │
                    │ id_conductor(FK)├───────────────┐     │
                    │ activo          │               │     │
                    │ created_at      │               │     │
                    └─────────────────┘               │     │
                            │                         │     │
                            │1:1                      │     │
                            │                         │     │
                    ┌───────▼───────────┐     ┌──────▼────────┐
                    │ user_profiles    │     │  conductor    │
                    ├──────────────────┤     ├───────────────┤
                    │ id (PK)          │     │ id_conductor  │
                    │ id_usuario_legacy│     │ (PK)          │
                    │ rol              │     │ cedula (UNQ)  │
                    │ id_conductor(FK) │     │ nombre_compl  │
                    │ activo           │     │ licencia      │
                    │ created_at       │     │ fecha_venc    │
                    └──────────────────┘     │ telefono      │
                                             │ email         │
                                             │ estado        │
                                             │ created_at    │
                                             └───────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE VEHÍCULOS Y LOCALIZACIÓN                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │    vehicles          │
        ├──────────────────────┤
        │ id (PK)              │
        │ placa (UNQ)          │◄───────────────────────────────┐
        │ modelo               │                                │
        │ año                  │                                │
        │ marca                │                                │
        │ status               │ (4 estados)                    │
        │ capacidad_combustible│                                │
        │ kilometraje          │                                │
        │ created_at           │                                │
        └──────────────────────┘                                │
                  │                                              │
        ┌─────────┼─────────┬──────────────┐                    │
        │         │         │              │                    │
       1:N       1:N       1:N            1:N                   │
        │         │         │              │                    │
  ┌─────▼───┐┌─────▼───┐┌──▼────────┐┌──▼───────────┐         │
  │ vehicle_││ vehicle_││ vehicle_  ││ maintenance_│         │
  │locations││assignments
  ││ orders │         │
  ├────────┤├────────┤├──────────┤├──────────────┤         │
  │ id (PK)││ id(PK) ││ id(PK)  ││ id(PK)     │         │
  │ vehicle││driver_ ││vehicle_ ││ vehicle_id │         │
  │_id(FK) ││id(FK) ││id(FK)  ││ (FK)       │         │
  │latitude││vehicle││vehicle_ ││ mechanic_id│         │
  │longitude││_id(FK)││id(FK)  ││ (FK)       │         │
  │speed   ││start_ ││status   ││ scheduled_ │         │
  │heading ││time  ││created_ ││date        │         │
  │timestamp││end_  ││at      ││ status     │         │
  │created_ ││time  ││        ││ total_cost │         │
  │at      ││status││        ││ created_at │         │
  └────────┘└──────┘└────────┘└────────────┘         │
     ▲        │                                         │
     │       1:N                                        │
     │        │                                         │
  ┌──┴────────▼───────────────────────────────────────┘
  │
  └─── Historial de 100K+ ubicaciones GPS diarias


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE CONDUCTORES                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │    drivers           │
        ├──────────────────────┤
        │ id (PK)              │◄────────────────┐
        │ cedula (UNQ)         │                 │
        │ nombre               │                 │
        │ apellidos            │                 │
        │ numero_licencia(UNQ) │                 │
        │ categoria_licencia   │                 │
        │ fecha_venc_licencia  │◄───────┐       │
        │ estado               │        │       │
        │ created_at           │        │       │
        └──────────────────────┘        │       │
                  │                     │       │
        ┌─────────┼─────────┐           │       │
        │         │         │           │       │
       1:N       1:N       1:N         1:N     1:N
        │         │         │           │       │
  ┌─────▼───┐┌─────▼───┐┌──▼────────┐ │   ┌───▼───────┐
  │ vehicle_││ incidents││ route_   │ │   │ alerts   │
  │assignments││        ││assignments │ │   │ (si vie) │
  ├────────┤├────────┤├──────────┤ │   ├──────────┤
  │ id(PK) ││ id(PK) ││ id(PK)  │ │   │ id(PK)  │
  │driver_ ││driver_ ││driver_  │ │   │ driver_ │
  │id(FK)  ││id(FK)  ││id(FK)  │ │   │ id(FK)  │
  │vehicle_││vehicle_││vehicle_ │ │   │ vehicle_│
  │id(FK)  ││id(FK)  ││id(FK)  │ │   │ id(FK)  │
  │start   ││type    ││route_id│ │   │ tipo_al│
  │_time   ││severity││(FK)    │ │   │erta    │
  │end_    ││status  ││status  │ │   │ estado │
  │time    ││created ││created │ │   │ created│
  │status  ││_at     ││_at     │ │   │_at    │
  │created_││        ││        │ │   │       │
  │at      ││        ││        │ │   │       │
  └────────┘└────────┘└────────┘ │   └───────┘
                                  │
                             Alerta de
                             licencia
                             vencida


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE RUTAS Y ASIGNACIONES                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │    routes            │
        ├──────────────────────┤
        │ id (PK)              │
        │ name                 │
        │ description          │
        │ waypoints (JSONB)    │ ← Array de puntos con lat/lng
        │ optimized_order(JSONB)
        │ total_distance       │
        │ total_duration       │
        │ geometry (GeoJSON)   │
        │ status               │
        │ created_at           │
        └──────────────────────┘
                  │
                 1:N
                  │
        ┌─────────▼──────────────────────────────┐
        │    route_assignments                   │
        ├────────────────────────────────────────┤
        │ id (PK)                                │
        │ route_id (FK) ──┘                      │
        │ driver_id (FK) ────► drivers           │
        │ vehicle_id (FK) ───► vehicles          │
        │ scheduled_start                        │
        │ scheduled_end                          │
        │ actual_start                           │
        │ actual_end                             │
        │ status (4: pending/in_progress/...)    │
        │ created_at                             │
        └────────────────────────────────────────┘
                  │
        ┌─────────┼──────────┐
        │         │          │
       1:N       1:N        1:N
        │         │          │
  ┌─────▼──┐┌────▼────┐┌───▼──────────┐
  │ route_ ││ route_  ││ route_events │
  │tracking││waypoint_│                │
  ├────────┤├────────┤├──────────────┤
  │ id(PK) ││ id(PK) ││ id(PK)      │
  │assign_ ││assign_ ││ assignment_ │
  │ment_  ││ment_  ││ id(FK)      │
  │id(FK) ││id(FK) ││ event_type  │
  │vehicle││waypoint││ event_data  │
  │_id    ││_number ││ latitude    │
  │ (FK)  ││checked ││ longitude   │
  │lat    ││_in_at  ││ recorded_at │
  │lng    ││created ││ created_at  │
  │speed  ││_at     ││             │
  │recorded││        ││             │
  │_at    ││        ││             │
  └───────┘└────────┘└─────────────┘

  ▲      ▲
  │      └─ Validación de paso por puntos
  │
  └─ 5-10 actualizaciones GPS por minuto


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE ALERTAS Y MONITOREO                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │  alert_rules         │
        ├──────────────────────┤
        │ id (PK)              │
        │ tipo_alerta (UNQ)    │ 5 tipos:
        │ nombre               │ • velocidad_excesiva
        │ descripcion          │ • parada_prolongada
        │ habilitado           │ • desvio_ruta
        │ umbrales (JSONB)     │ • combustible_bajo
        │ nivel_prioridad      │ • mantenimiento_vencido
        │ debounce_segundos    │
        │ notificar_push       │
        │ notificar_email      │
        │ created_at           │
        └──────────────────────┘
                  │
                 1:N
                  │
        ┌─────────▼──────────────────┐
        │    alerts                  │
        ├────────────────────────────┤
        │ id (PK)                    │
        │ vehicle_id (FK)            │
        │ driver_id (FK)             │
        │ tipo_alerta (FK)           │
        │ mensaje                    │
        │ nivel_prioridad            │ 4 niveles:
        │ estado                     │ • baja/media/alta/critica
        │ fecha_alerta               │
        │ fecha_resolucion           │
        │ resuelto_por               │
        │ metadata (JSONB)           │
        │ created_at                 │
        └────────────────────────────┘
                  │
                 1:N
                  │
        ┌─────────▼──────────────────┐
        │  alert_tracking            │
        ├────────────────────────────┤
        │ id (PK)                    │
        │ vehicle_id (FK)            │
        │ tipo_alerta                │
        │ estado (activo/resuelto)   │
        │ valor_actual (JSONB)       │
        │ primera_deteccion          │
        │ ultima_deteccion           │
        │ alert_id (FK)              │
        │ created_at                 │
        └────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE INCIDENTES                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │    incidents         │
        ├──────────────────────┤
        │ id (PK)              │
        │ driver_id (FK)       │
        │ vehicle_id (FK)      │
        │ type                 │ 5 tipos
        │ severity             │ 4 niveles
        │ title                │
        │ description          │
        │ location             │
        │ location_lat/lng     │
        │ occurred_at          │
        │ status               │
        │ created_at           │
        └──────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
       1:N       1:N       1:N
        │         │         │
  ┌─────▼───┐┌─────▼────┐┌──▼────────────┐
  │ incident││ incident_│                │
  │_comments││notifications              │
  ├────────┤├─────────┤├────────────────┤
  │ id(PK) ││ id(PK)  ││ id(PK)        │
  │incident││incident ││ incident_id   │
  │_id(FK) ││_id(FK) ││ (FK)          │
  │comment ││channel ││ channel       │
  │created ││status  ││ (push/email) │
  │_at     ││payload ││ status       │
  │        ││created ││ (pending/sent)
  │        ││_at     ││ created_at    │
  └────────┘└────────┘└───────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE MANTENIMIENTO                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │ maintenance_rules    │
        ├──────────────────────┤
        │ id (PK)              │
        │ vehicle_id (FK)      │
        │ tipo_mantenimiento   │
        │ kilometraje_umbral   │
        │ tiempo_meses_umbral  │
        │ anticipacion_km      │
        │ anticipacion_dias    │
        │ habilitado           │
        │ nivel_prioridad      │
        │ proxima_fecha_estimada
        │ created_at           │
        └──────────────────────┘
                  │
                 1:N
                  │
        ┌─────────▼──────────────────────────┐
        │   maintenance_orders               │
        ├────────────────────────────────────┤
        │ id (UUID, PK)                      │
        │ vehicle_id (FK)                    │
        │ mechanic_id (FK)                   │
        │ order_number (UNIQUE, correlativo) │
        │ title                              │
        │ description                        │
        │ type (preventivo/correctivo)       │
        │ status (programada/progreso/...)   │
        │ scheduled_date                     │
        │ execution_date                     │
        │ completion_date                    │
        │ mileage                            │
        │ labor_hours                        │
        │ labor_rate                         │
        │ other_costs                        │
        │ total_cost                         │
        │ created_at                         │
        └────────────────────────────────────┘
                  │
        ┌─────────┼──────────┐
        │         │          │
       1:N       1:N        1:N
        │         │          │
  ┌─────▼──┐┌────▼────┐┌───▼──────────────┐
  │ mainten││ mainten_ ││ maintenance_    │
  │ance_  ││parts    ││ attachments      │
  │history ││         ││                  │
  ├────────┤├────────┤├────────────────┤
  │ id(PK) ││ id(UUID)││ id(UUID)      │
  │ mainten││mainten_ ││ maintenance_ │
  │ ance_  ││order_id ││ order_id(FK) │
  │ rule_  ││(FK)    ││ file_name    │
  │ id(FK) ││part_   ││ file_type    │
  │vehicle ││name    ││ file_size    │
  │_id(FK) ││part_   ││ file_url     │
  │tipo_   ││number  ││ description  │
  │mainten ││quantity││ uploaded_by  │
  │ancia  ││unit_   ││ created_at   │
  │fecha_  ││cost   ││             │
  │realiz ││total_ ││             │
  │ado    ││cost   ││             │
  │costo_ ││supplier││             │
  │real   ││created ││             │
  │created││_at     ││             │
  │_at    ││        ││             │
  └───────┘└────────┘└─────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE GEOCERCAS                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │    geofences         │
        ├──────────────────────┤
        │ id (PK)              │
        │ nombre               │
        │ descripcion          │
        │ tipo                 │ circle/polygon
        │ geometry (JSONB)     │ GeoJSON format
        │ radio_m (para circ)  │
        │ activo               │
        │ metadata (JSONB)     │
        │ created_at           │
        └──────────────────────┘
                  │
        ┌─────────┼──────────┐
        │         │          │
       1:N       1:N
        │         │
  ┌─────▼──┐┌────▼────────┐
  │geofence││ geofence_   │
  │_events ││ state       │
  ├────────┤├────────────┤
  │ id(PK) ││ id(PK)    │
  │geofenc││ geofence_ │
  │e_id   ││ id(FK)    │
  │(FK)   ││ vehicle_  │
  │vehicle││ id(FK)    │
  │_id    ││ is_inside │
  │(FK)   ││ last_     │
  │event_ ││ position  │
  │type   ││ (JSONB)   │
  │(enter ││ updated_  │
  │/exit) ││ at        │
  │position││           │
  │(JSONB)││           │
  │occurre││           │
  │d_at   ││           │
  │created││           │
  │_at    ││           │
  └───────┘└───────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE REPORTES                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │  report_templates    │
        ├──────────────────────┤
        │ id (UUID, PK)        │
        │ user_id (FK)         │
        │ name                 │
        │ description          │
        │ report_type          │
        │ filters (JSONB)      │
        │ metrics (ARRAY)      │
        │ columns (ARRAY)      │
        │ is_default           │
        │ created_at           │
        └──────────────────────┘
                  │
        ┌─────────┼──────────┐
        │         │          │
       1:N       1:N
        │         │
  ┌─────▼──┐┌────▼──────────┐
  │report_ ││ report_       │
  │schedule││ executions    │
  ├────────┤├──────────────┤
  │ id(UUID)││ id(UUID)    │
  │user_id ││ schedule_id │
  │(FK)    ││ (FK)        │
  │template││ template_id │
  │_id(FK) ││ (FK)        │
  │email_  ││ status      │
  │recipnt││ (pending/   │
  │s      ││ sent/fail)  │
  │frequncy││ email_rcpt │
  │(daily/ ││ sent_at    │
  │weekly/ ││ error_msg  │
  │monthly)││ record_cnt │
  │day_of_ ││ created_at │
  │week   ││            │
  │day_of_ ││            │
  │month  ││            │
  │next_  ││            │
  │send   ││            │
  │_date  ││            │
  │is_acti││            │
  │ve     ││            │
  │created││            │
  │_at    ││            │
  └───────┘└─────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                     GESTIÓN DE COMBUSTIBLE (Legacy)                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

        ┌──────────────────────┐
        │    combustible       │
        ├──────────────────────┤
        │ id_combustible (PK)  │
        │ placa_vehiculo (FK)  │
        │ id_conductor (FK)    │
        │ fecha                │
        │ hora                 │
        │ cantidad             │
        │ costo                │
        │ kilometraje          │
        │ tipo_combustible     │ gasolina/diesel/gas/electric
        │ estacion             │
        │ observaciones        │
        │ created_at           │
        └──────────────────────┘
```

---

## 📊 Estadísticas del Modelo

### Conteo de Tablas por Categoría

| Categoría     | Cantidad | Tablas                                                                                                                            |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Usuarios      | 2        | `usuario`, `user_profiles`                                                                                                        |
| Vehículos     | 4        | `vehicles`, `vehicle_locations`, `vehicle_assignments`, `vehiculo`                                                                |
| Conductores   | 1        | `drivers`                                                                                                                         |
| Rutas         | 5        | `routes`, `route_assignments`, `route_tracking`, `route_waypoint_checkins`, `route_events`                                        |
| Alertas       | 3        | `alert_rules`, `alerts`, `alert_tracking`                                                                                         |
| Incidentes    | 3        | `incidents`, `incident_comments`, `incident_notifications`                                                                        |
| Mantenimiento | 6        | `maintenance_orders`, `maintenance_rules`, `maintenance_history`, `maintenance_parts`, `maintenance_attachments`, `mantenimiento` |
| Geocercas     | 3        | `geofences`, `geofence_events`, `geofence_state`                                                                                  |
| Reportes      | 3        | `report_templates`, `report_schedules`, `report_executions`                                                                       |
| Otros         | 8        | `ruta`, `conductor`, `incidente`, `asignacion`, `combustible`, Legacy tables                                                      |
| **TOTAL**     | **39**   |                                                                                                                                   |

### Relaciones por Tabla

| Tabla                | Relaciones | Tipo                                          |
| -------------------- | ---------- | --------------------------------------------- |
| `usuario`            | 10+        | 1:N (creador, mecánico, supervisor)           |
| `vehicles`           | 8          | 1:N (múltiples tracking, assignments, etc.)   |
| `drivers`            | 5          | 1:N (assignments, incidents, alerts)          |
| `routes`             | 4          | 1:N (assignments, tracking, events, checkins) |
| `route_assignments`  | 4          | 1:N (tracking, events, checkins)              |
| `maintenance_orders` | 3          | 1:N (parts, attachments)                      |
| `maintenance_rules`  | 2          | 1:N (history)                                 |
| `incidents`          | 2          | 1:N (comments, notifications)                 |
| `alert_rules`        | 1          | 1:N (alerts)                                  |
| `alerts`             | 2          | 1:N (tracking, notifications)                 |
| `geofences`          | 2          | 1:N (events, state)                           |
| `report_templates`   | 2          | 1:N (schedules, executions)                   |
| **TOTAL**            | **50+**    |                                               |

---

## 🔑 Tipos de Relaciones

### 1:1 (Uno a Uno)

- `usuario` ↔ `conductor` (opcional)
- `usuario` ↔ `user_profiles`

### 1:N (Uno a Muchos)

- `vehicles` → `vehicle_locations` (100K+ diarias)
- `vehicles` → `vehicle_assignments` (múltiples asignaciones)
- `routes` → `route_assignments` (múltiples asignaciones)
- `drivers` → `incidents` (múltiples incidentes)
- `alert_rules` → `alerts` (miles de alertas)
- `maintenance_rules` → `maintenance_history` (historial completo)

### N:M (Muchos a Muchos) - Implícitas

No hay relaciones N:M explícitas. Las relaciones complejas se manejan a través de tablas asociativas (ej: `route_assignments` relaciona `routes` con `drivers` y `vehicles`).

---

## 📈 Volumen de Datos Esperado

| Tabla                | Registros Típicos  | Crecimiento   |
| -------------------- | ------------------ | ------------- |
| `usuario`            | 20-50              | Lento         |
| `vehicles`           | 50-500             | Lento         |
| `drivers`            | 30-200             | Lento         |
| `routes`             | 100-1000           | Medio         |
| `route_assignments`  | 500-5000           | Medio         |
| `vehicle_locations`  | 100K-500K diarias  | Muy rápido ⚡ |
| `alerts`             | 100-10000          | Rápido        |
| `incidents`          | 10-500/mes         | Lento-Medio   |
| `maintenance_orders` | 100-500            | Lento-Medio   |
| `report_templates`   | 20-100             | Lento         |
| **Total Anual**      | **~50M registros** |               |

**Nota**: Las tablas más críticas para rendimiento son:

- `vehicle_locations` (requiere índices en vehicle_id, recorded_at)
- `route_tracking` (requiere clustering por fecha)
- `alerts` (requiere índices en estado, tipo_alerta)

---

## 🔒 Constraints y Validaciones

### UNIQUE Constraints

```sql
usuario.username UNIQUE
usuario.email UNIQUE
vehicles.placa UNIQUE
drivers.cedula UNIQUE
drivers.numero_licencia UNIQUE
alert_rules.tipo_alerta UNIQUE
maintenance_orders.order_number UNIQUE
report_templates.user_id + name UNIQUE
```

### CHECK Constraints

```sql
vehicles.status IN ('activo', 'estacionado', 'mantenimiento', 'inactivo')
drivers.estado IN ('disponible', 'activo', 'en_servicio', 'suspendido', 'inactivo')
alerts.estado IN ('pendiente', 'vista', 'resuelta', 'ignorada')
alerts.nivel_prioridad IN ('baja', 'media', 'alta', 'critica')
alert_rules.tipo_alerta IN (5 tipos)
routes.status IN ('active', 'archived', 'deleted')
route_assignments.status IN ('pending', 'in_progress', 'completed', 'cancelled')
geofences.tipo IN ('circle', 'polygon')
maintenance_orders.status IN ('programada', 'en_progreso', 'completada', 'cancelada')
```

### Foreign Key Constraints

```sql
vehicle_locations.vehicle_id → vehicles.id
route_assignments.driver_id → drivers.id
route_assignments.vehicle_id → vehicles.id
incidents.driver_id → drivers.id
incidents.vehicle_id → vehicles.id
maintenance_orders.vehicle_id → vehicles.id
geofences.created_by → usuario.id_usuario
```

---

## 📋 Índices Recomendados

```sql
-- Búsquedas por estado
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_alerts_estado ON alerts(estado);
CREATE INDEX idx_drivers_estado ON drivers(estado);

-- Búsquedas históricas por fecha
CREATE INDEX idx_vehicle_locations_recorded_at ON vehicle_locations(recorded_at DESC);
CREATE INDEX idx_alerts_fecha_alerta ON alerts(fecha_alerta DESC);
CREATE INDEX idx_route_tracking_recorded_at ON route_tracking(recorded_at DESC);

-- Búsquedas por vehículo/conductor (FK muy usadas)
CREATE INDEX idx_vehicle_locations_vehicle_id ON vehicle_locations(vehicle_id);
CREATE INDEX idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX idx_alerts_driver_id ON alerts(driver_id);
CREATE INDEX idx_incidents_driver_id ON incidents(driver_id);

-- Composite indexes
CREATE INDEX idx_route_tracking_composite ON route_tracking(assignment_id, recorded_at DESC);
CREATE INDEX idx_alerts_filter ON alerts(vehicle_id, estado, tipo_alerta);

-- Particionamiento por fecha (tablas muy grandes)
CREATE TABLE vehicle_locations_2025_01 PARTITION OF vehicle_locations
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

**Fin del Diagrama ER**
