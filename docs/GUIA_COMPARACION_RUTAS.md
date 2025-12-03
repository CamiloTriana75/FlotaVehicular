# Guía: Comparación de Rutas Planificadas vs Recorridas

## 📋 Descripción General

El sistema de comparación de rutas permite analizar la diferencia entre la ruta que se planificó y la ruta que realmente siguió el conductor. Esta funcionalidad es clave para:

- ✅ Verificar cumplimiento de rutas
- 📊 Analizar desviaciones y tiempos
- 🚗 Optimizar futuras planificaciones
- 📈 Generar reportes de rendimiento

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### 1. `route_tracking`

Almacena cada punto GPS registrado durante la ejecución de una ruta.

```sql
CREATE TABLE route_tracking (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL,  -- Vincula con la asignación
  vehicle_id BIGINT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(6, 2),           -- km/h
  heading DECIMAL(5, 2),         -- grados (0-360)
  accuracy DECIMAL(8, 2),        -- metros
  altitude DECIMAL(8, 2),        -- metros
  timestamp TIMESTAMP WITH TIME ZONE
);
```

**Características:**

- Un punto GPS cada segundo (configurable)
- Vinculado específicamente a una asignación de ruta
- Incluye velocidad, dirección y precisión
- Indexado para consultas rápidas

#### 2. `route_events`

Registra eventos importantes durante la ruta.

```sql
CREATE TABLE route_events (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMP WITH TIME ZONE
);
```

**Tipos de eventos:**

- `route_started` - Conductor inició la ruta
- `route_completed` - Conductor completó la ruta
- `waypoint_reached` - Llegada a un punto de parada
- `tracking_started` - Inicio del GPS
- `tracking_stopped` - Fin del GPS
- `deviation_detected` - Desviación detectada

## 🔄 Flujo de Funcionamiento

### 1. Planificación de Ruta

```javascript
// El planificador crea una ruta optimizada
const route = await createRoute({
  name: 'Entrega Centro',
  waypoints: [
    { lat: 4.6097, lng: -74.0817, name: 'Bodega' },
    { lat: 4.6533, lng: -74.0836, name: 'Cliente 1' },
    { lat: 4.6711, lng: -74.0721, name: 'Cliente 2' },
  ],
});

// Se asigna a un conductor
const assignment = await assignRouteToDriver({
  routeId: route.id,
  driverId: 5,
  vehicleId: 3,
  scheduledStart: '2025-11-20T09:00:00Z',
});
```

### 2. Ejecución de Ruta (Conductor)

El conductor abre la vista de ruta en su móvil:

```javascript
// ConductorRouteView.jsx

// Al presionar "Iniciar GPS"
const handleStartTracking = async () => {
  setTrackingEnabled(true);

  // Registrar evento de inicio
  await createRouteEvent({
    assignmentId: assignment.id,
    eventType: 'tracking_started',
  });
};

// Cada segundo, se registra la ubicación
setInterval(async () => {
  if (!trackingEnabled) return;

  const coords = await getCurrentPosition();

  // Guardar en route_tracking (específico de la ruta)
  await insertRouteTrackingPoint({
    assignmentId: assignment.id,
    vehicleId: assignment.vehicle.id,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: coords.speed,
    heading: coords.heading,
    accuracy: coords.accuracy,
  });

  // También guardar en vehicle_locations (tracking general)
  await locationService.insertLocation({
    vehicle_id: assignment.vehicle.id,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: coords.speed,
  });
}, 1000);
```

### 3. Comparación de Rutas

Después de completar la ruta, se puede ver la comparación:

```javascript
// RouteComparison.jsx

// Cargar ruta planificada
const assignment = await getRouteAssignment(assignmentId);
const plannedRoute = assignment.route.geometry.coordinates;

// Cargar ruta recorrida desde route_tracking
const { data: trackingPoints } = await getRouteTrajectory(assignmentId);
const actualRoute = trackingPoints.map((p) => [p.longitude, p.latitude]);

// Calcular métricas
const metrics = {
  // Desviación promedio entre rutas
  avgDeviation: calculateRouteDeviation(plannedRoute, actualRoute),

  // Distancia planificada vs real
  plannedDistance: assignment.route.total_distance,
  actualDistance: calculateTotalDistance(actualRoute),

  // Tiempo planificado vs real
  plannedDuration: assignment.route.total_duration,
  actualDuration: assignment.actual_end - assignment.actual_start,
};
```

## 📱 Uso desde el Móvil (Conductor)

### Pasos para el Conductor:

1. **Abrir la ruta asignada**
   - Ir a "Mis Rutas"
   - Seleccionar la ruta del día
   - Presionar "Ver Ruta"

2. **Iniciar el tracking GPS**
   - Presionar el botón verde "Iniciar GPS"
   - Verificar que aparece "Tracking activo" con punto verde pulsante
   - Confirmar que el contador de "Puntos enviados" aumenta

3. **Durante el recorrido**
   - El sistema registra automáticamente cada segundo
   - Se muestra la distancia al siguiente punto
   - Alertas al llegar a cada waypoint
   - Check-in automático en geocerca (40m de radio)

4. **Finalizar la ruta**
   - Presionar "Detener GPS" al terminar
   - El sistema marca la ruta como completada
   - Los datos quedan guardados para análisis

### Indicadores en Pantalla:

```
┌─────────────────────────────────────────┐
│  ●  Tracking activo                     │
│  Puntos enviados: 1,234                 │
│  Velocidad: 45 km/h                     │
│  Dirección: 90°                         │
│  Precisión GPS: ±8 m                    │
└─────────────────────────────────────────┘
```

## 📊 Análisis y Reportes

### Vista de Comparación

La página de comparación muestra:

1. **Mapa dual:**
   - Línea azul: Ruta planificada
   - Línea roja: Ruta recorrida

2. **Métricas clave:**
   - **Desviación promedio:** Distancia media de separación entre rutas
   - **Diferencia de distancia:** % extra recorrido
   - **Diferencia de tiempo:** % extra de duración
   - **Puntuación de cumplimiento:** Score 0-100%

3. **Estadísticas detalladas:**
   ```javascript
   {
     total_points: 1234,
     start_time: "2025-11-20T09:05:00Z",
     end_time: "2025-11-20T11:30:00Z",
     duration_seconds: 8700,
     avg_speed: 42.5,
     max_speed: 78.3,
     distance_covered_km: 45.2
   }
   ```

### Exportar Reporte

```javascript
// Generar JSON con toda la información
const report = {
  asignacion_id: 123,
  ruta: 'Entrega Centro',
  vehiculo: 'ABC-123',
  conductor: 'Juan Pérez',
  metricas: {
    distancia_planificada_m: 42000,
    distancia_recorrida_m: 45200,
    diferencia_distancia_porcentaje: 7.6,
    desviacion_promedio_m: 125.5,
    tiempo_estimado_s: 7200,
    tiempo_real_s: 8700,
    puntuacion_cumplimiento: 87.5,
  },
};
```

## 🔧 Funciones Principales

### Backend (SQL)

```sql
-- Obtener trayectoria completa
SELECT * FROM get_route_trajectory(123);

-- Insertar punto de tracking
SELECT insert_route_tracking_point(
  123,  -- assignment_id
  3,    -- vehicle_id
  4.6097, -74.0817,  -- lat, lng
  45.5, 90.0,        -- speed, heading
  8.0, 2635.0        -- accuracy, altitude
);

-- Obtener estadísticas
SELECT * FROM get_route_statistics(123);
```

### Frontend (JavaScript)

```javascript
// Servicios disponibles en routeService.js

// Insertar punto de tracking
await insertRouteTrackingPoint({
  assignmentId: 123,
  vehicleId: 3,
  latitude: 4.6097,
  longitude: -74.0817,
  speed: 45.5,
  heading: 90.0,
});

// Obtener trayectoria
const { data } = await getRouteTrajectory(123);

// Obtener estadísticas
const { data: stats } = await getRouteStatistics(123);

// Registrar evento
await createRouteEvent({
  assignmentId: 123,
  eventType: 'waypoint_reached',
  eventData: { waypoint_number: 2 },
  latitude: 4.6533,
  longitude: -74.0836,
});
```

## ⚡ Optimizaciones

### 1. Índices en Base de Datos

```sql
-- Ya creados en la migración
CREATE INDEX idx_route_tracking_assignment_timestamp
  ON route_tracking(assignment_id, timestamp);

CREATE INDEX idx_route_tracking_timestamp
  ON route_tracking(timestamp DESC);
```

### 2. Límite de Puntos

Por defecto se guardan todos los puntos (1 por segundo). Para rutas muy largas:

```javascript
// Opción: Reducir frecuencia a cada 5 segundos
let counter = 0;
setInterval(async () => {
  counter++;
  if (counter % 5 !== 0) return; // Solo cada 5 segundos

  await insertRouteTrackingPoint(...);
}, 1000);
```

### 3. Limpieza de Datos Antiguos

```sql
-- Eliminar tracking de rutas completadas hace más de 6 meses
DELETE FROM route_tracking
WHERE assignment_id IN (
  SELECT id FROM route_assignments
  WHERE status = 'completed'
  AND updated_at < NOW() - INTERVAL '6 months'
);
```

## 🐛 Solución de Problemas

### Problema: No aparecen datos en la comparación

**Verificar:**

1. ¿El conductor activó el GPS?

   ```sql
   SELECT * FROM route_events
   WHERE assignment_id = 123 AND event_type = 'tracking_started';
   ```

2. ¿Hay puntos guardados?

   ```sql
   SELECT COUNT(*) FROM route_tracking WHERE assignment_id = 123;
   ```

3. ¿La asignación tiene fechas correctas?
   ```sql
   SELECT actual_start, actual_end FROM route_assignments WHERE id = 123;
   ```

### Problema: Puntos GPS imprecisos

**Soluciones:**

- Verificar permisos de ubicación en el navegador
- Usar `enableHighAccuracy: true` en opciones GPS
- Filtrar puntos con accuracy > 50m
  ```javascript
  const filteredPoints = trackingPoints.filter((p) => p.accuracy <= 50);
  ```

### Problema: Muchos puntos ralentizan la comparación

**Soluciones:**

- Simplificar geometría con algoritmo Douglas-Peucker
- Cargar solo cada N puntos para visualización
- Usar WebWorker para cálculos pesados

```javascript
// Simplificar ruta (tomar 1 de cada 10 puntos)
const simplified = actualRoute.filter((_, i) => i % 10 === 0);
```

## 📚 Recursos Adicionales

- [Documentación de Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [API de Geolocalización](https://developer.mozilla.org/es/docs/Web/API/Geolocation_API)
- [Algoritmo de Haversine](https://en.wikipedia.org/wiki/Haversine_formula)

## 🔐 Seguridad y Privacidad

- Los datos GPS solo son accesibles por usuarios autenticados
- Se implementan políticas RLS en Supabase
- Los datos se pueden anonimizar para reportes agregados
- Cumplimiento con regulaciones de privacidad de datos de ubicación

## 📝 Próximas Mejoras

- [ ] Detección automática de desviaciones en tiempo real
- [ ] Alertas al planificador si el conductor se desvía
- [ ] Machine Learning para predecir tiempos reales
- [ ] Integración con tráfico en tiempo real
- [ ] Reportes automáticos semanales/mensuales
- [ ] Exportación a PDF/Excel
- [ ] Comparación de múltiples rutas simultáneas
