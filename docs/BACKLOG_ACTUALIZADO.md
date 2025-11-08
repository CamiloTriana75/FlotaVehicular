# 📊 Backlog de Producto Actualizado - FlotaVehicular

> **Fecha de actualización:** 2025-11-08  
> **Sprint actual:** Sprint 9 - Gestión de Conductores  
> **Casos de uso totales:** 55  
> **Historias de usuario totales:** 60+

---

## 🎯 Visión del Producto

Sistema integral para la gestión, monitoreo y optimización de flota vehicular que permita tracking en tiempo real, planificación de rutas, control de combustible y mantenimiento predictivo.

---

## 📈 Estado General del Proyecto

| Categoría                | Total | Completadas | En Progreso | Pendientes | % Avance |
| ------------------------ | ----- | ----------- | ----------- | ---------- | -------- |
| **Épicas**               | 10    | 2           | 1           | 7          | 20%      |
| **Casos de Uso**         | 55    | 8           | 5           | 42         | 15%      |
| **Historias de Usuario** | 60+   | 12          | 3           | 45+        | 20%      |

---

## ✅ COMPLETADO (Sprint 1-9)

### Épica 10: Configuración y Seguridad ✅ (100%)

| ID       | Historia de Usuario                                 | Casos de Uso  | Estado        | Sprint |
| -------- | --------------------------------------------------- | ------------- | ------------- | ------ |
| **HU28** | Como admin quiero gestionar usuarios y permisos     | UC48, UC52-55 | ✅ Completado | 9      |
| **HU30** | Como admin quiero configurar parámetros del sistema | UC49, UC50    | ✅ Completado | 9      |
| **TH2**  | Como dev backend quiero configurar BD optimizada    | -             | ✅ Completado | 9      |

**Funcionalidades implementadas:**

- ✅ Autenticación personalizada contra tabla `usuario`
- ✅ Funciones SQL: `validate_user_login()`, `change_user_password()`
- ✅ Usuarios admin creados con contraseñas hasheadas (bcrypt)
- ✅ Sistema de roles: superusuario, administrador, mecanico, conductor
- ✅ Página de login funcional con validación
- ✅ Página `/health` para verificar conexión a BD
- ✅ Variables de entorno configuradas (.env)
- ✅ Migrations organizadas en `supabase/migrations/`
- ✅ Seed data: 2 usuarios admin, 4 conductores de ejemplo

---

### Épica 2: Gestión de Conductores 🟡 (40%)

| ID      | Historia de Usuario                                           | Casos de Uso     | Estado         | Sprint |
| ------- | ------------------------------------------------------------- | ---------------- | -------------- | ------ |
| **HU4** | Como admin quiero registrar conductores con datos y licencias | UC10, UC11, UC12 | 🟡 En progreso | 9      |
| **HU6** | Como manager quiero ver historial de conductores              | UC13, UC14       | 🟡 En progreso | 9      |
| **HU5** | Como manager quiero gestionar horarios y turnos               | UC15             | ❌ Pendiente   | -      |

**Funcionalidades implementadas:**

- ✅ Servicio `conductorService.js` con métodos CRUD
- ✅ Página `/conductores` lista conductores desde BD
- ✅ Botón "Actualizar" para recargar datos
- ✅ Estadísticas: disponibles, activos, licencias por vencer
- ✅ Búsqueda por nombre, cédula, email
- ✅ Seed data: 4 conductores de ejemplo con estados variados

**Pendiente:**

- ❌ Formulario crear/editar conductor
- ❌ Página de detalle de conductor individual
- ❌ Historial de asignaciones del conductor
- ❌ Gestión de horarios y turnos
- ❌ Alertas de licencias vencidas/por vencer

---

## 🚧 EN PROGRESO (Sprint Actual)

### Sprint 9: Gestión de Conductores

| Tarea                         | Responsable | Estado | Bloqueadores            |
| ----------------------------- | ----------- | ------ | ----------------------- |
| Endpoint GET /api/conductores | Backend     | ✅     | -                       |
| Página lista conductores      | Frontend    | ✅     | -                       |
| Formulario crear conductor    | Frontend    | 🟡     | Validaciones pendientes |
| Formulario editar conductor   | Frontend    | ❌     | -                       |
| Página detalle conductor      | Frontend    | ❌     | -                       |

---

## ❌ PENDIENTE (Backlog Priorizado)

### 🔴 PRIORIDAD ALTA (Sprint 10-12)

#### Épica 1: Gestión de Flota Vehicular (0%)

| ID      | Historia de Usuario                                             | Casos de Uso  | Estimación | Dependencias |
| ------- | --------------------------------------------------------------- | ------------- | ---------- | ------------ |
| **HU1** | Como admin quiero registrar vehículos con información técnica   | UC1, UC2, UC3 | 8 SP       | HU28 ✅      |
| **HU2** | Como manager quiero gestionar estado de vehículos con historial | UC4, UC5, UC7 | 13 SP      | HU1          |
| **HU3** | Como manager quiero asociar vehículos a conductores             | UC8           | 5 SP       | HU1, HU4 🟡  |

**Casos de uso relacionados:**

- UC1: Registrar Vehículo
- UC2: Actualizar Datos Vehículo
- UC3: Eliminar Vehículo
- UC4: Consultar Vehículos
- UC5: Rastrear Ubicación Tiempo Real (requiere GPS)
- UC6: Monitorear Combustible
- UC7: Ver Historial Vehículo
- UC8: Asociar Vehículo a Conductor
- UC9: Ver Geocercas

**Tareas técnicas:**

1. Crear servicio `vehiculoService.js` (CRUD)
2. Página `/vehiculos/nuevo` con formulario completo
3. Página `/vehiculos/:id/editar`
4. Página `/vehiculos/:id` con tabs (historial, mantenimiento, combustible)
5. Integrar con tabla `vehiculo` en BD
6. Seed data: al menos 5 vehículos de ejemplo

---

#### Épica 6: Mantenimiento Predictivo y Correctivo (0%)

| ID       | Historia de Usuario                                              | Casos de Uso | Estimación | Dependencias |
| -------- | ---------------------------------------------------------------- | ------------ | ---------- | ------------ |
| **HU16** | Como manager quiero recibir alertas automáticas de mantenimiento | UC20, UC21   | 8 SP       | HU1          |
| **HU17** | Como operator quiero registrar intervenciones de mantenimiento   | UC17, UC18   | 5 SP       | HU1          |
| **HU18** | Como viewer quiero visualizar historial de mantenimiento         | UC19         | 3 SP       | HU17         |

**Casos de uso relacionados:**

- UC17: Programar Mantenimiento
- UC18: Registrar Mantenimiento Realizado
- UC19: Consultar Historial Mantenimiento
- UC20: Generar Alerta Mantenimiento
- UC21: Calcular Próximo Mantenimiento

**Tareas técnicas:**

1. Servicio `mantenimientoService.js`
2. Página `/mantenimiento` con lista y filtros
3. Formulario programar mantenimiento
4. Formulario registrar mantenimiento realizado
5. Alertas automáticas (trigger SQL o cron job)
6. Cálculo de próximo mantenimiento (por km o fecha)

---

### 🟡 PRIORIDAD MEDIA (Sprint 13-18)

#### Épica 4: Planificación y Optimización de Rutas (0%)

| ID       | Historia de Usuario                                        | Casos de Uso     | Estimación | Dependencias |
| -------- | ---------------------------------------------------------- | ---------------- | ---------- | ------------ |
| **HU10** | Como manager quiero crear y asignar rutas optimizadas      | UC22, UC23, UC26 | 13 SP      | HU1, HU4 🟡  |
| **HU11** | Como conductor quiero navegación turn-by-turn              | -                | 21 SP      | HU10, GPS    |
| **HU12** | Como manager quiero comparar rutas planificadas vs. reales | UC24, UC25, UC27 | 8 SP       | HU10         |

**Casos de uso relacionados:**

- UC22: Crear Ruta
- UC23: Asignar Ruta a Vehículo/Conductor
- UC24: Monitorear Ruta en Progreso
- UC25: Finalizar Ruta
- UC26: Optimizar Rutas
- UC27: Comparar Ruta Planificada vs Real

**Tareas técnicas:**

1. Integración con API de mapas (Google Maps / Mapbox)
2. Servicio `rutaService.js`
3. Página `/rutas/nueva` con mapa interactivo
4. Algoritmo de optimización de rutas (TSP)
5. Componente `MapViewer` mejorado
6. Tabla `asignacion` con tracking de rutas

---

#### Épica 5: Gestión de Combustible (0%)

| ID       | Historia de Usuario                                     | Casos de Uso | Estimación | Dependencias |
| -------- | ------------------------------------------------------- | ------------ | ---------- | ------------ |
| **HU13** | Como operator quiero registrar consumos por vehículo    | -            | 5 SP       | HU1          |
| **HU14** | Como manager quiero recibir alertas por consumo anómalo | UC6          | 8 SP       | HU13         |
| **HU15** | Como manager quiero comparar consumo real vs. esperado  | -            | 5 SP       | HU13         |

**Tareas técnicas:**

1. Servicio `combustibleService.js`
2. Formulario registrar carga de combustible
3. Cálculos de consumo (litros/km)
4. Alertas de consumo anómalo
5. Gráficos comparativos

---

#### Épica 3: Monitoreo en Tiempo Real (0%)

| ID      | Historia de Usuario                                                        | Casos de Uso | Estimación | Dependencias      |
| ------- | -------------------------------------------------------------------------- | ------------ | ---------- | ----------------- |
| **HU7** | Como manager quiero visualizar ubicación en mapa en tiempo real            | UC5          | 13 SP      | HU1, GPS/hardware |
| **HU8** | Como admin quiero establecer geocercas y recibir alertas                   | UC9, UC32    | 8 SP       | HU7               |
| **HU9** | Como manager quiero configurar alertas por velocidad, detenciones, desvíos | UC28-33      | 8 SP       | HU7               |

**Casos de uso relacionados:**

- UC5: Rastrear Ubicación Tiempo Real
- UC9: Ver Geocercas
- UC28: Ver Alertas Activas
- UC29: Generar Alerta Automática
- UC30: Descartar Alerta
- UC31: Configurar Notificaciones
- UC32: Configurar Geocercas
- UC33: Alertas por Velocidad/Detención/Desvío

**Tareas técnicas:**

1. Integración con GPS (API o hardware)
2. WebSocket para actualizaciones en tiempo real
3. Tabla `locations` con PostGIS
4. Componente `MapViewer` con marcadores en tiempo real
5. Geocercas (polígonos en PostGIS)
6. Sistema de alertas automáticas

---

#### Épica 7: Gestión de Incidentes y Emergencias (0%)

| ID       | Historia de Usuario                                                       | Casos de Uso | Estimación | Dependencias |
| -------- | ------------------------------------------------------------------------- | ------------ | ---------- | ------------ |
| **HU19** | Como conductor quiero reportar incidentes/emergencias con botón de pánico | UC34         | 8 SP       | HU4 🟡       |
| **HU20** | Como manager quiero recibir notificaciones inmediatas de incidentes       | UC35         | 5 SP       | HU19         |
| **HU21** | Como manager quiero generar reportes de incidentes y análisis             | UC36         | 5 SP       | HU19         |

**Casos de uso relacionados:**

- UC34: Reportar Incidente/Emergencia
- UC35: Recibir Notificación de Incidente
- UC36: Generar Reporte de Incidentes

**Tareas técnicas:**

1. Servicio `incidenteService.js`
2. Formulario reportar incidente
3. Botón de pánico en header (conductores)
4. Sistema de notificaciones push
5. Reportes de incidentes por tipo/gravedad

---

### 🟢 PRIORIDAD BAJA (Sprint 19+)

#### Épica 8: Reportes y Analytics (20%)

| ID       | Historia de Usuario                                    | Casos de Uso | Estimación    | Dependencias |
| -------- | ------------------------------------------------------ | ------------ | ------------- | ------------ |
| **HU22** | Como manager quiero ver dashboard con KPIs principales | UC43         | ✅ Completado | -            |
| **HU23** | Como admin quiero crear reportes personalizados        | UC44         | 13 SP         | HU1-21       |
| **HU24** | Como manager quiero exportar datos en PDF/Excel        | UC41, UC42   | 5 SP          | HU23         |

**Funcionalidades implementadas:**

- ✅ Dashboard básico con KPIs (`/dashboard`)
- ✅ Página `/reportes` con estructura base

**Pendiente:**

- ❌ Exportación PDF/Excel
- ❌ Reportes personalizados (query builder)
- ❌ Gráficos avanzados (Chart.js / Recharts)
- ❌ Programación de reportes automáticos

---

#### Épica 9: Integraciones y Comunicaciones (0%)

| ID       | Historia de Usuario                                          | Casos de Uso | Estimación | Dependencias    |
| -------- | ------------------------------------------------------------ | ------------ | ---------- | --------------- |
| **HU25** | Como dev quiero integrar con sistemas de tráfico y mapas     | UC45         | 13 SP      | Proveedores API |
| **HU26** | Como operator quiero comunicación con central (mensajes/voz) | UC47         | 21 SP      | Infraestructura |
| **HU27** | Como admin quiero integración con ERP                        | UC46         | 21 SP      | ERP existente   |

**Tareas técnicas:**

1. API de tráfico en tiempo real (Google Maps Traffic API)
2. WebSockets para comunicación
3. Integración con ERP (REST API o SOAP)
4. Sistema de mensajería interna

---

## 🛠️ HISTORIAS TÉCNICAS PENDIENTES

| ID       | Historia Técnica                         | Estimación | Prioridad | Estado        |
| -------- | ---------------------------------------- | ---------- | --------- | ------------- |
| **TH1**  | API integración con GPS y hardware       | 21 SP      | Alta      | ❌ Pendiente  |
| **TH2**  | BD optimizada para geolocalización       | 8 SP       | Alta      | ✅ Completado |
| **TH3**  | Caching para mapas y datos geoespaciales | 13 SP      | Media     | ❌ Pendiente  |
| **TH4**  | Procesamiento de datos en tiempo real    | 13 SP      | Media     | ❌ Pendiente  |
| **TH5**  | Backup y recuperación de datos críticos  | 8 SP       | Alta      | ❌ Pendiente  |
| **TH6**  | App móvil para conductores               | 34 SP      | Baja      | ❌ Descartado |
| **TH7**  | Tests E2E con Playwright/Cypress         | 13 SP      | Media     | ❌ Pendiente  |
| **TH8**  | CI/CD con GitHub Actions                 | 5 SP       | Media     | ❌ Pendiente  |
| **TH9**  | Monitoreo y logging (Sentry)             | 5 SP       | Media     | ❌ Pendiente  |
| **TH10** | Optimización de queries SQL              | 8 SP       | Media     | ❌ Pendiente  |

---

## 📊 Casos de Uso: Mapeo Completo

### Módulo de Vehículos (9 CU)

| Caso de Uso                         | Estado | Historia | Sprint |
| ----------------------------------- | ------ | -------- | ------ |
| UC1: Registrar Vehículo             | ❌     | HU1      | 10     |
| UC2: Actualizar Datos Vehículo      | ❌     | HU1      | 10     |
| UC3: Eliminar Vehículo              | ❌     | HU1      | 10     |
| UC4: Consultar Vehículos            | ❌     | HU2      | 11     |
| UC5: Rastrear Ubicación Tiempo Real | ❌     | HU7      | 15     |
| UC6: Monitorear Combustible         | ❌     | HU14     | 14     |
| UC7: Ver Historial Vehículo         | ❌     | HU2      | 11     |
| UC8: Asociar Vehículo a Conductor   | ❌     | HU3      | 11     |
| UC9: Ver Geocercas                  | ❌     | HU8      | 16     |

### Módulo de Conductores (7 CU)

| Caso de Uso                       | Estado | Historia | Sprint |
| --------------------------------- | ------ | -------- | ------ |
| UC10: Registrar Conductor         | 🟡     | HU4      | 9      |
| UC11: Actualizar Datos Conductor  | 🟡     | HU4      | 9      |
| UC12: Eliminar Conductor          | 🟡     | HU4      | 9      |
| UC13: Consultar Conductores       | ✅     | HU6      | 9      |
| UC14: Ver Historial Conductor     | ❌     | HU6      | 10     |
| UC15: Gestionar Horarios y Turnos | ❌     | HU5      | 12     |
| UC16: Ver Incidentes              | ❌     | HU6      | 13     |

### Módulo de Mantenimiento (5 CU)

| Caso de Uso                             | Estado | Historia | Sprint |
| --------------------------------------- | ------ | -------- | ------ |
| UC17: Programar Mantenimiento           | ❌     | HU17     | 12     |
| UC18: Registrar Mantenimiento Realizado | ❌     | HU17     | 12     |
| UC19: Consultar Historial Mantenimiento | ❌     | HU18     | 12     |
| UC20: Generar Alerta Mantenimiento      | ❌     | HU16     | 13     |
| UC21: Calcular Próximo Mantenimiento    | ❌     | HU16     | 13     |

### Módulo de Rutas (6 CU)

| Caso de Uso                             | Estado | Historia | Sprint |
| --------------------------------------- | ------ | -------- | ------ |
| UC22: Crear Ruta                        | ❌     | HU10     | 14     |
| UC23: Asignar Ruta a Vehículo/Conductor | ❌     | HU10     | 14     |
| UC24: Monitorear Ruta en Progreso       | ❌     | HU12     | 15     |
| UC25: Finalizar Ruta                    | ❌     | HU12     | 15     |
| UC26: Optimizar Rutas                   | ❌     | HU10     | 16     |
| UC27: Comparar Ruta Planificada vs Real | ❌     | HU12     | 15     |

### Módulo de Alertas (6 CU)

| Caso de Uso                                  | Estado | Historia | Sprint |
| -------------------------------------------- | ------ | -------- | ------ |
| UC28: Ver Alertas Activas                    | ❌     | HU9      | 16     |
| UC29: Generar Alerta Automática              | ❌     | HU9      | 16     |
| UC30: Descartar Alerta                       | ❌     | HU9      | 16     |
| UC31: Configurar Notificaciones              | ❌     | HU9      | 17     |
| UC32: Configurar Geocercas                   | ❌     | HU8      | 16     |
| UC33: Alertas por Velocidad/Detención/Desvío | ❌     | HU9      | 16     |

### Módulo de Incidentes (3 CU)

| Caso de Uso                             | Estado | Historia | Sprint |
| --------------------------------------- | ------ | -------- | ------ |
| UC34: Reportar Incidente/Emergencia     | ❌     | HU19     | 17     |
| UC35: Recibir Notificación de Incidente | ❌     | HU20     | 17     |
| UC36: Generar Reporte de Incidentes     | ❌     | HU21     | 18     |

### Módulo de Reportes (8 CU)

| Caso de Uso                         | Estado | Historia | Sprint |
| ----------------------------------- | ------ | -------- | ------ |
| UC37: Generar Reporte Vehículos     | ❌     | HU23     | 19     |
| UC38: Generar Reporte Conductores   | ❌     | HU23     | 19     |
| UC39: Generar Reporte Mantenimiento | ❌     | HU23     | 19     |
| UC40: Generar Reporte Combustible   | ❌     | HU23     | 19     |
| UC41: Exportar Reporte PDF          | ❌     | HU24     | 20     |
| UC42: Exportar Reporte Excel        | ❌     | HU24     | 20     |
| UC43: Ver Dashboard KPIs            | ✅     | HU22     | 9      |
| UC44: Reportes Personalizados       | ❌     | HU23     | 20     |

### Módulo de Integraciones (3 CU)

| Caso de Uso                                  | Estado | Historia | Sprint |
| -------------------------------------------- | ------ | -------- | ------ |
| UC45: Integrar con Sistemas de Tráfico/Mapas | ❌     | HU25     | 21     |
| UC46: Integrar con ERP                       | ❌     | HU27     | 22     |
| UC47: Comunicación Central-Conductor         | ❌     | HU26     | 21     |

### Módulo de Configuración y Seguridad (4 CU)

| Caso de Uso                              | Estado | Historia | Sprint |
| ---------------------------------------- | ------ | -------- | ------ |
| UC48: Gestionar Usuarios y Roles         | ✅     | HU28     | 9      |
| UC49: Configurar Parámetros del Sistema  | ✅     | HU30     | 9      |
| UC50: Configurar Políticas de Privacidad | ✅     | HU30     | 9      |
| UC51: Almacenar Datos Históricos         | ✅     | HU29     | 9      |

### Módulo de Autenticación (4 CU)

| Caso de Uso                | Estado | Historia | Sprint |
| -------------------------- | ------ | -------- | ------ |
| UC52: Iniciar Sesión       | ✅     | HU28     | 9      |
| UC53: Cerrar Sesión        | ✅     | HU28     | 9      |
| UC54: Recuperar Contraseña | ❌     | HU28     | 10     |
| UC55: Cambiar Contraseña   | ✅     | HU28     | 9      |

---

## 📅 Roadmap Propuesto (20 Sprints)

### Sprint 9 (Actual) ✅🟡

- Finalizar CRUD conductores
- Página detalle conductor
- Tests unitarios conductores

### Sprint 10 🔴

- CRUD completo vehículos
- Formularios crear/editar vehículo
- Asociación vehículo-conductor

### Sprint 11 🔴

- Lista vehículos desde BD
- Detalle vehículo con tabs
- Historial vehículo

### Sprint 12 🔴

- Módulo mantenimiento completo
- Programar y registrar mantenimientos
- Alertas automáticas mantenimiento

### Sprint 13 🟡

- Gestión de horarios y turnos
- Calendario de disponibilidad
- Turnos rotativos

### Sprint 14 🟡

- Módulo de combustible
- Registrar cargas
- Cálculos de consumo

### Sprint 15 🟡

- Módulo de rutas (básico)
- Crear y asignar rutas
- Monitoreo básico

### Sprint 16 🟡

- Geocercas
- Alertas automáticas
- Optimización de rutas

### Sprint 17 🟡

- Módulo de incidentes
- Botón de pánico
- Notificaciones push

### Sprint 18 🟢

- Reportes avanzados
- Exportación PDF/Excel
- Reportes personalizados

### Sprint 19-20 🟢

- Integraciones externas
- GPS en tiempo real
- Comunicaciones

### Sprint 21-22 🟢

- Tests E2E completos
- Optimización de rendimiento
- Documentación final

---

## 📝 Notas para el Equipo

### Dependencias Críticas

1. **Hardware GPS**: Necesario para UC5, UC7, HU7
2. **API de Mapas**: Google Maps o Mapbox para rutas y geocercas
3. **Infraestructura WebSocket**: Para tiempo real y notificaciones
4. **Sistema de Notificaciones**: Push notifications (Firebase / OneSignal)

### Riesgos Identificados

1. 🔴 **Alto**: Integración con hardware GPS puede retrasar sprints 15-16
2. 🟡 **Medio**: Optimización de rutas (algoritmo TSP) es complejo
3. 🟡 **Medio**: WebSockets para tiempo real requiere infraestructura adicional
4. 🟢 **Bajo**: Exportación PDF/Excel puede usar bibliotecas existentes

### Deuda Técnica Acumulada

- Agregar tests unitarios para servicios existentes
- Implementar manejo de errores global
- Optimizar queries SQL (índices faltantes)
- Mejorar responsive design en páginas existentes
- Documentar componentes reutilizables

---

## 🎯 Métricas de Éxito

### Objetivos Técnicos

- ✅ Cobertura de tests: >80%
- ✅ Performance: Tiempo de carga <3s
- ✅ Disponibilidad: 99.9% uptime
- ✅ Seguridad: Sin vulnerabilidades críticas

### Objetivos de Negocio

- Reducción del 15% en consumo de combustible
- Disminución del 20% en tiempos de entrega
- Reducción del 30% en costos de mantenimiento
- Aumento del 25% en productividad de la flota
- Satisfacción del usuario superior a 4/5

---

**Próxima Revisión de Backlog:** Sprint 10 Planning  
**Responsable de Product Backlog:** Product Owner  
**Última Actualización:** 2025-11-08
