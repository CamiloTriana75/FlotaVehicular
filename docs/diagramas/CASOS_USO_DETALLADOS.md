# 📋 Casos de Uso Detallados - FlotaVehicular v2.0.0

**Actualizado**: Diciembre 2025  
**Estado**: Completo y Validado  
**Nivel de Detalle**: Épicas + User Stories + Escenarios de Prueba

---

## 🎯 Casos de Uso por Épica

### 📊 ÉPICA 1: Dashboard Inteligente y Monitoreo en Tiempo Real

#### CU-1.1: Visualizar Ubicación de Flota en Mapa

**Actor**: Operador, Supervisor, Gerente  
**Precondiciones**: Usuario autenticado, vehículos con GPS activo  
**Flujo Principal**:

```
1. Usuario accede a "Monitoreo" → Mapa de Flota
2. Sistema recupera posiciones de vehicle_locations (últimas 5 min)
3. Se muestran vehículos como markers en mapa Google Maps/Mapbox
4. Para cada vehículo se muestra:
   - Icono de estado (activo/parado/mantenimiento)
   - Velocidad actual
   - Última actualización
   - Información básica (placa, conductor)
5. Usuario puede hacer click en vehículo para ver detalles:
   - Ruta actual
   - Últimos 10 puntos GPS
   - Alertas activas
   - Información del conductor
6. Sistema actualiza posiciones en tiempo real (WebSocket)
```

**Casos Alternativos**:

- A1: Sin GPS disponible → Muestra "Dispositivo desconectado"
- A2: Muchos vehículos (>500) → Agrupación por clusters
- A3: Usuario hace zoom → Cambia nivel de detalle

**Postcondiciones**: Información actualizada cada 10-30 segundos

**Tablas Involucradas**:

```
vehicle_locations
  ↓ (últimas por vehicle_id)
vehicles
  ↓ (estado, información)
drivers
  ↓ (conductor actual)
route_assignments
  ↓ (ruta en progreso)
```

---

#### CU-1.2: Ver Alertas Activas en Tiempo Real

**Actor**: Operador, Supervisor  
**Precondiciones**: Sistema de alertas configurado y habilitado  
**Flujo Principal**:

```
1. Usuario accede a Panel de Alertas
2. Sistema consulta alerts WHERE estado='pendiente'
3. Para cada alerta muestra:
   - Tipo: velocidad_excesiva / parada_prolongada / combustible_bajo / etc.
   - Nivel de prioridad (color código)
   - Vehículo afectado
   - Conductor
   - Hora de detección
   - Última actualización
4. Usuario puede filtrar por:
   - Tipo de alerta
   - Prioridad
   - Vehículo
   - Estado (pendiente/resuelta)
5. Al hacer click en alerta:
   - Ver ubicación en mapa
   - Historial de eventos similares
   - Acciones recomendadas
6. Usuario puede:
   - Marcar como "vista"
   - Resolver manualmente
   - Descartar
   - Asignar a supervisor
```

**Consultas SQL Involucradas**:

```sql
-- Alertas activas ordenadas por prioridad
SELECT a.*, v.placa, d.nombre, alert_rules.nombre as tipo_nombre
FROM alerts a
JOIN vehicles v ON a.vehicle_id = v.id
LEFT JOIN drivers d ON a.driver_id = d.id
JOIN alert_rules ar ON a.tipo_alerta = ar.tipo_alerta
WHERE a.estado = 'pendiente'
ORDER BY
  CASE a.nivel_prioridad
    WHEN 'critica' THEN 1
    WHEN 'alta' THEN 2
    WHEN 'media' THEN 3
    ELSE 4
  END,
  a.fecha_alerta DESC;

-- Historial de alerta similar
SELECT * FROM alert_tracking
WHERE vehicle_id = $1 AND tipo_alerta = $2
ORDER BY ultima_deteccion DESC
LIMIT 10;
```

**Postcondiciones**:

- Alert marcada como 'vista' si usuario la abrió
- Log de auditoría si usuario la resolvió
- Notificación al supervisor asignado (si aplica)

---

#### CU-1.3: Configurar Reglas de Alertas

**Actor**: Administrador, Superusuario  
**Precondiciones**: Acceso a configuración de alertas  
**Flujo Principal**:

```
1. Usuario accede a Settings → Configuración de Alertas
2. Sistema muestra lista de alert_rules (5 tipos predefinidos)
3. Para cada regla, usuario puede:
   a) Habilitar/Deshabilitar
   b) Editar umbrales (JSONB):
      - Velocidad excesiva: km/h máximo
      - Parada prolongada: minutos límite
      - Combustible bajo: % mínimo
      - Desvío ruta: metros tolerancia
   c) Cambiar nivel de prioridad
   d) Cambiar debounce (segundos antes de alertar)
   e) Configurar notificaciones (push/email)
4. Usuario guarda cambios
5. Sistema valida configuración
6. Cambios se aplican inmediatamente a alerts generadas
```

**Estructura de Umbrales JSONB**:

```json
{
  "velocidad_excesiva": {
    "km_h_max": 120,
    "duracion_segundos": 30
  },
  "parada_prolongada": {
    "minutos_max": 60,
    "radio_metros": 50
  },
  "combustible_bajo": {
    "porcentaje_minimo": 20
  },
  "desvio_ruta": {
    "metros_tolerancia": 500
  },
  "mantenimiento_vencido": {
    "dias_anticipacion": 7,
    "km_anticipacion": 500
  }
}
```

**Validaciones**:

- Velocidad máxima > 0
- Parada mínima > 0
- Porcentaje entre 0-100
- Metros de tolerancia > 0

---

### 🚗 ÉPICA 2: Gestión de Flota Vehicular

#### CU-2.1: Agregar Nuevo Vehículo

**Actor**: Administrador, Superusuario  
**Precondiciones**: Acceso a módulo Vehículos  
**Flujo Principal**:

```
1. Usuario accede a Vehículos → Agregar Nuevo
2. Completa formulario:
   - Placa (UNIQUE, requerida)
   - Marca, Modelo
   - Año
   - Color
   - Número de chasis
   - Número de motor
   - Capacidad de combustible
   - Tipo (carga/pasajeros/mixto) [Legacy]
   - Fecha de compra
3. Sistema valida:
   - Placa no exista en BD
   - Formato válido de datos
4. Usuario confirma creación
5. Sistema crea registro en vehicles table:
   - id: auto-generated
   - status: 'activo'
   - kilometraje: 0
   - created_at: now()
6. Genera notificación de auditoría
```

**Validaciones**:

```sql
ALTER TABLE vehicles ADD CONSTRAINT
  vehicles_placa_format CHECK (placa ~ '^[A-Z0-9]{6,8}$');
```

**Postcondiciones**:

- Vehículo aparece en lista de flota
- Disponible para asignaciones
- Log de auditoría creado
- Email de confirmación enviado

**Tablas Actualizadas**:

- `vehicles` (INSERT)
- `audit_log` (INSERT)

---

#### CU-2.2: Editar Información de Vehículo

**Actor**: Administrador, Mecánico, Supervisor  
**Precondiciones**: Vehículo existe, usuario autenticado  
**Flujo Principal**:

```
1. Usuario accede a Vehículos → Busca y abre vehículo
2. Puede editar:
   - Color
   - Capacidad de combustible
   - Número de chasis/motor
   - Fecha de compra
   - Status: activo/estacionado/mantenimiento/inactivo
   - Próximo mantenimiento (km)
3. Sistema valida cambios
4. Usuario guarda
5. Sistema actualiza vehicles
6. Se crean registros de auditoría con cambios anteriores
```

**Campos NO editables**:

- Placa (identificador único)
- Fecha de creación

**Postcondiciones**:

- Cambios visibles inmediatamente
- Historial de cambios guardado
- Email de notificación a supervisores

---

#### CU-2.3: Ver Historial de Mantenimiento

**Actor**: Mecánico, Supervisor, Administrador  
**Precondiciones**: Vehículo existe  
**Flujo Principal**:

```
1. Usuario abre vehículo → Tab "Mantenimiento"
2. Sistema muestra:
   a) Resumen:
      - Último mantenimiento: fecha y tipo
      - Próximo mantenimiento: fecha estimada
      - Km restantes hasta mantenimiento
   b) Historial de maintenance_history:
      - Tipo (preventivo/correctivo/emergencia)
      - Fecha realizado
      - Km cuando se realizó
      - Costo
      - Mecánico responsable
      - Descripción de trabajo
      - Repuestos usados
   c) Órdenes pendientes (maintenance_orders):
      - Estado actual
      - Fecha programada
      - Mecánico asignado
      - Costo estimado
3. Usuario puede:
   - Crear nueva orden
   - Ver detalles de orden
   - Cerrar orden
   - Ver adjuntos (PDF, fotos)
4. Gráfico de tendencias de costos
```

**Consultas SQL**:

```sql
-- Última orden completada
SELECT * FROM maintenance_orders
WHERE vehicle_id = $1 AND status = 'completada'
ORDER BY completion_date DESC
LIMIT 1;

-- Próximas órdenes programadas
SELECT * FROM maintenance_orders
WHERE vehicle_id = $1 AND status IN ('programada', 'en_progreso')
ORDER BY scheduled_date ASC;

-- Historial detallado
SELECT mh.*, u.username as mecanico_nombre,
       array_agg(mp.part_name) as repuestos
FROM maintenance_history mh
LEFT JOIN usuario u ON mh.mecanico_id = u.id_usuario
LEFT JOIN maintenance_parts mp ON ...
WHERE mh.vehicle_id = $1
GROUP BY mh.id
ORDER BY mh.fecha_realizado DESC;
```

---

### 👤 ÉPICA 3: Gestión de Conductores y RRHH

#### CU-3.1: Registrar Nuevo Conductor

**Actor**: RRHH, Administrador  
**Precondiciones**: Rol RRHH asignado, acceso a módulo Conductores  
**Flujo Principal**:

```
1. Usuario accede a Conductores → Agregar Nuevo
2. Completa formulario:
   - Nombre completo (requerido)
   - Cédula (UNIQUE, requerido)
   - Fecha de nacimiento
   - Teléfono
   - Email
   - Dirección
   - Número de licencia (UNIQUE)
   - Categoría de licencia (A1/A2/A/B/C/D/E)
   - Fecha expedición licencia
   - Fecha vencimiento licencia (requerido)
   - Fecha de ingreso a empresa
   - Estado inicial: 'disponible' o 'activo'
3. Sistema valida:
   - Cédula no exista
   - Licencia no exista
   - Mayor de 18 años
   - Licencia con vigencia > 1 mes
4. Usuario confirma
5. Sistema crea registro en drivers table
6. Genera usuario de login (username=cedula, password=temporal)
7. Envía credenciales por email
```

**Validaciones**:

```sql
ALTER TABLE drivers ADD CONSTRAINT
  drivers_edad CHECK (EXTRACT(YEAR FROM age(fecha_nacimiento)) >= 18);

ALTER TABLE drivers ADD CONSTRAINT
  drivers_licencia_vigencia CHECK (fecha_vencimiento_licencia > CURRENT_DATE + INTERVAL '30 days');
```

**Postcondiciones**:

- Conductor aparece en lista
- Usuario de login creado
- Email de bienvenida enviado
- Log de auditoría

---

#### CU-3.2: Ver KPIs de Conductor

**Actor**: Supervisor, Gerente, Administrador  
**Precondiciones**: Conductor existe  
**Flujo Principal**:

```
1. Usuario accede a Conductores → Selecciona conductor
2. Sistema muestra dashboard con KPIs:

   a) Rendimiento General (últimos 30 días):
      - Viajes completados
      - Km recorridos
      - Horas en ruta
      - Tiempo promedio de parada

   b) Cumplimiento de Rutas:
      - % rutas completadas a tiempo
      - % rutas con desviación
      - Desviación promedio (metros)
      - Tiempo promedio fuera de ruta

   c) Seguridad:
      - Velocidad promedio
      - Eventos de velocidad excesiva
      - Paradas no autorizadas
      - Incidentes reportados

   d) Eficiencia:
      - Consumo promedio combustible (km/litro)
      - Costo operativo por km
      - Mantenimiento asociado

   e) Comportamiento:
      - Licencia vencida: ⚠️ si aplica
      - Sanciones disciplinarias
      - Comentarios de supervisores

   f) Histórico:
      - Gráficos de tendencias
      - Comparación vs promedio de flota
      - Comparación vs otros conductores

3. Usuario puede:
   - Exportar reporte
   - Enviar retroalimentación
   - Generar plan de mejora
   - Ver incidentes específicos
```

**Cálculo de Métricas**:

```sql
-- KPI: Rutas completadas a tiempo
SELECT
  COUNT(CASE WHEN actual_end <= scheduled_end THEN 1 END)::FLOAT /
  COUNT(*) * 100 as pct_on_time
FROM route_assignments
WHERE driver_id = $1
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND status = 'completed';

-- KPI: Velocidad promedio
SELECT
  AVG(speed) as velocidad_promedio,
  MAX(speed) as velocidad_maxima,
  COUNT(CASE WHEN speed > 120 THEN 1 END) as eventos_velocidad
FROM route_tracking rt
JOIN route_assignments ra ON rt.assignment_id = ra.id
WHERE ra.driver_id = $1
  AND rt.recorded_at >= CURRENT_DATE - INTERVAL '30 days';

-- KPI: Desempeño vs promedio
SELECT
  AVG(speed) as velocidad_promedio_flota
FROM route_tracking
WHERE recorded_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

#### CU-3.3: Validar Licencia de Conductor

**Actor**: Sistema (automático), RRHH (manual)  
**Precondiciones**: Driver existe  
**Flujo Principal**:

```
1. Sistema corre validación cada hora (job programado):
   SELECT * FROM drivers
   WHERE fecha_vencimiento_licencia <= CURRENT_DATE + INTERVAL '7 days'
   AND estado = 'activo';

2. Para cada conductor con licencia próxima a vencer:
   a) Crea alerta en alerts table
   b) Envía notificación a RRHH y Supervisor
   c) Marca conductor como "en_revisión"

3. RRHH recibe notificación:
   - Email con lista de conductores
   - Enlace a módulo de conductores

4. RRHH actualiza fecha de vencimiento:
   - Accede a conductor
   - Click "Renovar Licencia"
   - Ingresa nueva fecha
   - Sistema valida fecha > hoy
   - Guarda cambio
   - Crea log de auditoría

5. Sistema verifica automáticamente:
   - Si fecha es válida, cambia estado a 'activo'
   - Cierra alertas relacionadas
   - Envía confirmación
```

**Triggers para Validación**:

```sql
CREATE OR REPLACE FUNCTION validate_driver_license()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_vencimiento_licencia <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Licencia expirada';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_license
BEFORE INSERT OR UPDATE ON drivers
FOR EACH ROW
EXECUTE FUNCTION validate_driver_license();
```

---

### 📊 ÉPICA 4: Reportes y Análisis

#### CU-4.1: Generar Reporte de Conductores

**Actor**: Analista, Gerente, Supervisor  
**Precondiciones**: Acceso a módulo Reportes  
**Flujo Principal**:

```
1. Usuario accede a Reportes → Crear Reporte
2. Selecciona tipo: "Conductores"
3. Configura filtros:
   - Período (fecha inicio/fin)
   - Conductores (uno o múltiples)
   - Estados (activo/suspendido/todo)
   - Métricas a incluir:
     □ Viajes completados
     □ Km recorridos
     □ Horas en ruta
     □ Velocidad promedio
     □ Incidentes
     □ Combustible consumido
4. Selecciona formato de salida:
   - PDF con tablas y gráficos
   - Excel con datos crudos
   - CSV para importación
5. Usuario confirma generación
6. Sistema ejecuta query:
```

**Query de Reporte**:

```sql
SELECT
  d.cedula, d.nombre, d.apellidos,
  COUNT(DISTINCT ra.id) as viajes_completados,
  SUM(r.total_distance)/1000 as km_recorridos,
  SUM(EXTRACT(EPOCH FROM (ra.actual_end - ra.actual_start)))/3600 as horas_ruta,
  AVG(rt.speed) as velocidad_promedio,
  COUNT(DISTINCT CASE WHEN rt.speed > 120 THEN 1 END) as eventos_velocidad,
  COUNT(DISTINCT i.id) as incidentes,
  AVG(cb.cantidad * cb.costo / (r.total_distance/1000)) as costo_por_km
FROM drivers d
LEFT JOIN route_assignments ra ON d.id = ra.driver_id
LEFT JOIN routes r ON ra.route_id = r.id
LEFT JOIN route_tracking rt ON ra.id = rt.assignment_id
LEFT JOIN incidents i ON d.id = i.driver_id
LEFT JOIN combustible cb ON d.id = cb.id_conductor
WHERE d.estado = $1
  AND ra.created_at BETWEEN $2 AND $3
GROUP BY d.id, d.cedula, d.nombre, d.apellidos
ORDER BY viajes_completados DESC;
```

7. Sistema genera archivo
8. Usuario descarga reporte
9. Opcionalmente programa envíos automáticos

---

#### CU-4.2: Programar Envíos Automáticos de Reportes

**Actor**: Administrador, Gerente  
**Precondiciones**: Plantilla de reporte existe  
**Flujo Principal**:

```
1. Usuario accede a Reportes → Programar Envíos
2. Selecciona plantilla existente o crea nueva
3. Configura:
   - Frecuencia: Diario, Semanal, Mensual
   - Día/Hora de envío
   - Destinatarios (emails)
   - Formato (PDF/Excel)
4. Guarda configuración en report_schedules
5. Sistema crea job programado:
```

**Job de n8n/Supabase**:

```sql
-- Tabla: report_schedules
INSERT INTO report_schedules (user_id, template_id, email_recipients, frequency, day_of_week, next_send_date)
VALUES ($1, $2, $3, 'weekly', 1, CURRENT_DATE + INTERVAL '1 week');

-- Trigger que ejecuta cada día
CREATE OR REPLACE FUNCTION execute_scheduled_reports()
RETURNS void AS $$
BEGIN
  FOR schedule IN
    SELECT id, template_id, email_recipients, next_send_date
    FROM report_schedules
    WHERE is_active = true
      AND next_send_date <= CURRENT_DATE
  LOOP
    -- Ejecutar generación de reporte
    -- Enviar por email
    -- Actualizar next_send_date
    -- Crear registro en report_executions
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

### 🚨 ÉPICA 5: Alertas, Incidentes y Pánico

#### CU-5.1: Reportar Incidente

**Actor**: Conductor, Supervisor, Operador  
**Precondiciones**: Usuario autenticado, vehículo asignado  
**Flujo Principal**:

```
1. Conductor abre app → Botón "Reportar Incidente"
2. Accede a formulario:
   - Tipo de incidente:
     □ Accidente
     □ Falla mecánica
     □ Robo/asalto
     □ Multa de tránsito
     □ Otro
   - Severidad: Leve / Moderada / Grave / Crítica
   - Título descriptivo
   - Descripción detallada
   - Foto/Video (opcional)
3. Sistema captura automáticamente:
   - Ubicación GPS (lat/lng)
   - Hora exacta
   - Vehículo asignado
   - Conductor
   - Kilómetro actual
   - Velocidad al momento
4. Usuario confirma envío
5. Sistema crea registro en incidents:
```

**Datos Capturados**:

```sql
INSERT INTO incidents (
  driver_id, vehicle_id, type, severity, title, description,
  location, location_lat, location_lng, occurred_at,
  km_at_incident, avg_speed, status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(),
  (SELECT kilometraje FROM vehicles WHERE id = $2),
  (SELECT speed FROM route_tracking WHERE vehicle_id = $2
   ORDER BY recorded_at DESC LIMIT 1),
  'reported');
```

6. Sistema notifica:
   - Supervisor del área
   - Gerente responsable
   - Centro de emergencias (si crítico)
7. Abre ticket automático para seguimiento
8. Conductor puede agregar comentarios posteriores

---

#### CU-5.2: Centro de Control de Pánico

**Actor**: Supervisor, Gerente, Operador  
**Precondiciones**: Rol supervisor/gerente, acceso a Centro de Control  
**Flujo Principal**:

```
1. Usuario accede a "Centro de Control" → Panel de Pánico
2. Sistema muestra:
   a) Mapa en tiempo real con:
      - Ubicación de todos los vehículos
      - Indicador de alerta de pánico (🚨)

   b) Lista de alertas de pánico:
      - Conductor afectado
      - Vehículo
      - Ubicación
      - Hora de activación
      - Tiempo transcurrido
      - Estado (activa/resuelta)

   c) Para cada alerta, opciones:
      - Contactar conductor (llamada/mensaje)
      - Ver ruta histórica (últimas 30 min)
      - Enviar unidad de seguridad
      - Contactar policía
      - Marcar como falsa alarma
      - Resolver incidente

3. Usuario toma acción:
   - Click en "Llamar conductor"
   - Click en "Mostrar en mapa" (auto-centra)
   - Click en "Historial de pánico"

4. Sistema registra todas las acciones con timestamp
5. Genera reporte de incidente
```

**Consultas para Centro de Control**:

```sql
-- Alertas de pánico activas
SELECT i.*, d.nombre, d.telefono, v.placa,
       r.name as ruta_asignada,
       st_distancesphere(st_point(i.location_lng, i.location_lat),
                        st_point(-75.5, 10.39)) as distancia_oficina
FROM incidents i
JOIN drivers d ON i.driver_id = d.id
JOIN vehicles v ON i.vehicle_id = v.id
LEFT JOIN route_assignments ra ON v.id = ra.vehicle_id
  AND ra.status = 'in_progress'
LEFT JOIN routes r ON ra.route_id = r.id
WHERE i.severity = 'critica'
  AND i.status = 'reported'
ORDER BY i.occurred_at DESC;

-- Historial de ubicaciones de vehículo en pánico (últimas 30 min)
SELECT rt.latitude, rt.longitude, rt.speed, rt.recorded_at
FROM route_tracking rt
WHERE rt.vehicle_id = $1
  AND rt.recorded_at >= NOW() - INTERVAL '30 minutes'
ORDER BY rt.recorded_at ASC;
```

---

### 🔧 ÉPICA 6: Mantenimiento Preventivo y Correctivo

#### CU-6.1: Crear Orden de Mantenimiento

**Actor**: Administrador, Supervisor, Mecánico  
**Precondiciones**: Vehículo existe, mecánico disponible  
**Flujo Principal**:

```
1. Usuario accede a Vehículos → Mantenimiento → Crear Orden
2. Completa formulario:
   - Vehículo: (dropdown, selecciona del listado)
   - Tipo: Preventivo / Correctivo
   - Título: descripción corta
   - Descripción: detalles de trabajo
   - Fecha programada
   - Mecánico asignado (dropdown)
   - Costo estimado
3. Opcionalmente adjunta:
   - Orden de compra
   - Diagnóstico
   - Fotos
4. Usuario guarda en maintenance_orders
5. Sistema asigna order_number: auto-incremento
6. Envía notificación al mecánico
7. Mecánico recibe en su dashboard:
   - Lista de órdenes asignadas
   - Estado: Programada → En Progreso → Completada
```

**Flujo de Estados**:

```
Programada
    ↓
En Progreso (cuando mecánico inicia)
    ↓
Completada (cuando mecánico reporta fin)
    ↓
Cierre (cuando supervisor verifica)

(Posible Cancelada en cualquier punto)
```

**Datos Guardados**:

```sql
INSERT INTO maintenance_orders (
  vehicle_id, mechanic_id, order_number, title, description,
  type, status, scheduled_date, mileage, labor_hours,
  labor_rate, other_costs, total_cost, notes, created_at
) VALUES (
  $1, $2, generate_order_number(), $3, $4,
  $5, 'programada', $6,
  (SELECT kilometraje FROM vehicles WHERE id = $1),
  $7, $8, $9, $7*$8 + $9, $10, NOW()
);
```

---

#### CU-6.2: Registrar Ejecución de Mantenimiento

**Actor**: Mecánico  
**Precondiciones**: Orden existe, estado "Programada"  
**Flujo Principal**:

```
1. Mecánico accede a dashboard → Mis Órdenes de Trabajo
2. Selecciona orden
3. Click "Iniciar Trabajo":
   - Cambia status a 'en_progreso'
   - Captura timestamp de inicio
4. Durante el trabajo, mecánico puede:
   - Agregar notas
   - Adjuntar fotos
   - Registrar partes usadas (maintenance_parts)
5. Al terminar, click "Marcar Completada":
   - Ingresa fecha de ejecución real
   - Ingresa km actual del vehículo
   - Ingresa horas trabajadas
   - Revisa costo total
   - Adjunta checklist de verificación
6. Confirma completación:
```

**Datos Guardados**:

```sql
UPDATE maintenance_orders SET
  status = 'completada',
  execution_date = $1,
  completion_date = NOW(),
  mileage = $2,
  labor_hours = $3,
  total_cost = ($3 * labor_rate) + other_costs,
  updated_at = NOW()
WHERE id = $4;

-- Registrar historial
INSERT INTO maintenance_history (
  maintenance_rule_id, vehicle_id, maintenance_order_id,
  tipo_mantenimiento, descripcion, fecha_realizado,
  kilometraje_realizado, costo_real, mecanico_id,
  observaciones, status, created_by
) VALUES ($1, $2, $3, ...);
```

7. Supervisor recibe notificación de revisión pendiente

---

#### CU-6.3: Programar Mantenimiento Preventivo

**Actor**: Administrador, Supervisor  
**Precondiciones**: Vehículo existe  
**Flujo Principal**:

```
1. Usuario accede a Vehículos → Mantenimiento Preventivo
2. Para cada vehículo, sistema muestra:
   - Último mantenimiento realizado
   - Próximo vencimiento (basado en km o fecha)
   - Días/km restantes
3. Usuario crea regla de mantenimiento:
   - Tipo: Cambio de aceite, Inspección, Cambio neumáticos, etc.
   - Umbral km: cada 5000 km
   - Umbral tiempo: cada 3 meses
   - Anticipación: alertar 500 km antes / 7 días antes
4. Sistema guarda en maintenance_rules
5. Job automático detecta vencimientos:
```

**Detección Automática de Mantenimiento Vencido**:

```sql
-- Job que corre cada hora
CREATE OR REPLACE FUNCTION detect_maintenance_due()
RETURNS void AS $$
BEGIN
  -- Detectar por km
  INSERT INTO alerts (vehicle_id, tipo_alerta, mensaje, nivel_prioridad, estado)
  SELECT v.id, 'mantenimiento_vencido',
         'Mantenimiento preventivo vencido: ' || mr.tipo_mantenimiento,
         'alta', 'pendiente'
  FROM maintenance_rules mr
  JOIN vehicles v ON mr.vehicle_id = v.id
  WHERE mr.habilitado = true
    AND v.kilometraje >= (
      (SELECT MAX(fecha_realizado) FROM maintenance_history
       WHERE vehicle_id = v.id AND tipo_mantenimiento = mr.tipo_mantenimiento)
      + mr.kilometraje_umbral - mr.anticipacion_km
    )
    AND NOT EXISTS (
      SELECT 1 FROM alerts a
      WHERE a.vehicle_id = v.id
        AND a.tipo_alerta = 'mantenimiento_vencido'
        AND a.estado = 'pendiente'
    );

  -- Detectar por fecha
  INSERT INTO alerts (vehicle_id, tipo_alerta, mensaje, nivel_prioridad, estado)
  SELECT v.id, 'mantenimiento_vencido',
         'Mantenimiento preventivo próximo a vencer',
         'media', 'pendiente'
  FROM maintenance_rules mr
  JOIN vehicles v ON mr.vehicle_id = v.id
  WHERE mr.habilitado = true
    AND (SELECT MAX(fecha_realizado) FROM maintenance_history
         WHERE vehicle_id = v.id AND tipo_mantenimiento = mr.tipo_mantenimiento)
    <= CURRENT_DATE - (mr.tiempo_meses_umbral * INTERVAL '1 month' - mr.anticipacion_dias * INTERVAL '1 day');
END;
$$ LANGUAGE plpgsql;
```

6. Cuando se vence, sistema automáticamente:
   - Crea alerta en tabla alerts
   - Notifica a supervisor
   - Propone crear orden de mantenimiento

---

### 🛣️ ÉPICA 7: Planificación y Monitoreo de Rutas

#### CU-7.1: Crear Ruta Optimizada

**Actor**: Planificador, Operador  
**Precondiciones**: Acceso a módulo de rutas  
**Flujo Principal**:

```
1. Usuario accede a Rutas → Crear Nueva Ruta
2. Ingresa información básica:
   - Nombre: "Ruta Cartagena - Santa Marta"
   - Descripción: "Entrega de mercancía general"
3. Agrega waypoints:
   a) Busca ubicación en Google Maps
   b) Selecciona tipo: Origen / Waypoint / Destino
   c) Configuración:
      - Dirección
      - Lat/Lng
      - Ventana de tiempo (hora inicio - hora fin)
      - Tiempo de servicio (minutos)
   d) Repite para cada punto
4. Sistema calcula automáticamente:
   - Distancia total (Google Maps API)
   - Duración estimada
   - Ruta óptima (usando algoritmo Dijkstra o Google Maps API)
5. Usuario revisa en mapa:
   - Visualiza ruta con todos los puntos
   - Puede reordenar waypoints
   - Puede cambiar orden de optimización
6. Confirma creación:
```

**Estructura de Waypoints en JSONB**:

```json
[
  {
    "sequence": 1,
    "latitude": 10.3936,
    "longitude": -75.483,
    "label": "Almacén Central",
    "type": "start",
    "address": "Cra 5 # 25-50, Cartagena",
    "arrival_window": { "start": "08:00", "end": "08:30" },
    "service_time_minutes": 0
  },
  {
    "sequence": 2,
    "latitude": 10.4,
    "longitude": -75.5,
    "label": "Cliente A",
    "type": "waypoint",
    "address": "Cra 10 # 50-100, Cartagena",
    "arrival_window": { "start": "09:00", "end": "10:00" },
    "service_time_minutes": 30
  },
  {
    "sequence": 3,
    "latitude": 11.25,
    "longitude": -74.2,
    "label": "Santa Marta",
    "type": "end",
    "address": "Cra 1 # 10-20, Santa Marta",
    "arrival_window": { "start": "13:00", "end": "14:00" },
    "service_time_minutes": 0
  }
]
```

**Datos Guardados**:

```sql
INSERT INTO routes (name, description, waypoints, optimized_order,
  total_distance, total_duration, geometry, status, created_by, created_at)
VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7::jsonb, 'active',
  (SELECT username FROM usuario WHERE id = $8), NOW());
```

7. Ruta aparece en lista disponible para asignación

---

#### CU-7.2: Asignar Ruta a Conductor y Vehículo

**Actor**: Operador, Planificador, Supervisor  
**Precondiciones**: Ruta existe, conductor y vehículo disponibles  
**Flujo Principal**:

```
1. Usuario accede a Rutas → Asignaciones
2. Selecciona ruta de la lista
3. Click "Asignar" o "Crear Asignación"
4. Formulario de asignación:
   - Conductor: (dropdown, filtra solo disponibles)
   - Vehículo: (dropdown, filtra compatibles)
   - Fecha programada: Inicio y Fin
   - Notas especiales
5. Sistema valida:
   - Conductor disponible en fecha
   - Vehículo operativo y disponible
   - Licencia conductor vigente
   - Mantenimiento vehículo vigente
6. Confirma creación en route_assignments:
```

**Creación de Asignación**:

```sql
INSERT INTO route_assignments (
  route_id, driver_id, vehicle_id,
  scheduled_start, scheduled_end, status, notes, created_at
) VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW());

-- Notificación al conductor
INSERT INTO notifications (
  user_id, type, message, related_entity_id, created_at
) VALUES ($2, 'route_assigned',
  'Nueva ruta asignada: ' || $route_name,
  $assignment_id, NOW());
```

7. Sistema envía:
   - Notificación push al conductor
   - Email con detalles de ruta
   - Adjunta archivo con waypoints y mapa

---

#### CU-7.3: Monitorear Ejecución de Ruta

**Actor**: Operador, Supervisor, Planificador  
**Precondiciones**: Ruta asignada, en progreso  
**Flujo Principal**:

```
1. Usuario accede a Rutas → Monitoreo o Mapa de Rutas
2. Ve mapa con rutas en progreso:
   - Línea de ruta planeada (gris)
   - Trazado real del conductor (azul)
   - Marcadores de waypoints
   - Posición actual del vehículo
   - Información del conductor y vehículo
3. Para cada ruta muestra:
   - Progreso: "Waypoint 2 de 5"
   - Tiempo: Tiempo transcurrido vs estimado
   - Distancia: Recorrida vs estimada
   - Desviaciones: Metros de diferencia vs ruta planeada
   - Velocidad actual
   - Próximo waypoint
4. Usuario puede:
   - Ver historial de posiciones
   - Contactar conductor (llamada/mensaje)
   - Ver detalles completos de ruta
   - Generar alerta si hay desviación significativa
5. Actualizaciones en tiempo real cada 30 segundos
```

**Consulta de Monitoreo**:

```sql
SELECT
  ra.id, ra.route_id, ra.driver_id, ra.vehicle_id,
  d.nombre as driver_name,
  v.placa,
  r.name as route_name,
  r.total_distance,
  r.total_duration,
  (
    SELECT SUM(st_length(st_makeline(st_point(longitude, latitude))))
    FROM route_tracking
    WHERE assignment_id = ra.id
  ) as distance_traveled,
  (SELECT st_point(longitude, latitude) FROM route_tracking
   WHERE assignment_id = ra.id ORDER BY recorded_at DESC LIMIT 1) as current_location,
  (SELECT speed FROM route_tracking
   WHERE assignment_id = ra.id ORDER BY recorded_at DESC LIMIT 1) as current_speed,
  ra.actual_start, ra.actual_end,
  NOW() - ra.actual_start as elapsed_time
FROM route_assignments ra
JOIN routes r ON ra.route_id = r.id
JOIN drivers d ON ra.driver_id = d.id
JOIN vehicles v ON ra.vehicle_id = v.id
WHERE ra.status = 'in_progress'
ORDER BY ra.actual_start DESC;
```

6. Cuando conductor llega a waypoint:
   - Debe hacer check-in
   - Sistema valida ubicación (±100 metros)
   - Registra hora real en route_waypoint_checkins

---

## 📋 Matriz de Casos de Uso vs Roles

| Caso de Uso                | Superusuario | Admin | Gerente | Supervisor | Planificador | Operador | Mecánico | RRHH | Analista | Conductor |
| -------------------------- | ------------ | ----- | ------- | ---------- | ------------ | -------- | -------- | ---- | -------- | --------- |
| CU-1.1 Mapa                | ✓            | ✓     | ✓       | ✓          | ✓            | ✓        | -        | -    | ✓        | -         |
| CU-1.2 Alertas             | ✓            | ✓     | ✓       | ✓          | -            | ✓        | -        | -    | ✓        | -         |
| CU-1.3 Config Alertas      | ✓            | ✓     | -       | -          | -            | -        | -        | -    | -        | -         |
| CU-2.1 Agregar Vehículo    | ✓            | ✓     | -       | -          | -            | -        | -        | -    | -        | -         |
| CU-2.2 Editar Vehículo     | ✓            | ✓     | -       | ✓          | -            | -        | ✓        | -    | -        | -         |
| CU-2.3 Historial Mant.     | ✓            | ✓     | ✓       | ✓          | -            | -        | ✓        | -    | ✓        | -         |
| CU-3.1 Registrar Conductor | ✓            | ✓     | -       | -          | -            | -        | -        | ✓    | -        | -         |
| CU-3.2 KPIs Conductor      | ✓            | ✓     | ✓       | ✓          | ✓            | -        | -        | ✓    | ✓        | ✓         |
| CU-3.3 Validar Licencia    | ✓            | ✓     | -       | -          | -            | -        | -        | ✓    | -        | -         |
| CU-4.1 Generar Reporte     | ✓            | ✓     | ✓       | ✓          | -            | -        | -        | ✓    | ✓        | -         |
| CU-4.2 Programar Envíos    | ✓            | ✓     | ✓       | -          | -            | -        | -        | -    | ✓        | -         |
| CU-5.1 Reportar Incidente  | ✓            | ✓     | -       | ✓          | -            | ✓        | -        | -    | -        | ✓         |
| CU-5.2 Centro de Pánico    | ✓            | ✓     | ✓       | ✓          | -            | ✓        | -        | -    | -        | -         |
| CU-6.1 Crear Orden Mant.   | ✓            | ✓     | -       | ✓          | -            | -        | -        | -    | -        | -         |
| CU-6.2 Ejecutar Mant.      | ✓            | ✓     | -       | ✓          | -            | -        | ✓        | -    | -        | -         |
| CU-6.3 Prog. Mant. Prev.   | ✓            | ✓     | -       | ✓          | -            | -        | -        | -    | -        | -         |
| CU-7.1 Crear Ruta          | ✓            | ✓     | -       | -          | ✓            | ✓        | -        | -    | -        | -         |
| CU-7.2 Asignar Ruta        | ✓            | ✓     | -       | ✓          | ✓            | ✓        | -        | -    | -        | -         |
| CU-7.3 Monitorear Ruta     | ✓            | ✓     | ✓       | ✓          | ✓            | ✓        | -        | -    | ✓        | ✓         |

---

**Fin de Casos de Uso Detallados**
