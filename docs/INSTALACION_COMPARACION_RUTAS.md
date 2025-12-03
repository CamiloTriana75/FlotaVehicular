# 🚀 Instrucciones de Instalación - Sistema de Comparación de Rutas

## ⚠️ IMPORTANTE - Leer antes de ejecutar

Este sistema permite registrar automáticamente la trayectoria GPS de los conductores durante sus rutas para poder compararla después con la ruta planificada.

## 📋 Pre-requisitos

1. Acceso al panel de Supabase del proyecto
2. Tener la migración de rutas ya aplicada (`20251112200000_routes_system.sql`)
3. Navegador con permisos de geolocalización

## 🗄️ Paso 1: Aplicar Migración de Base de Datos

### Opción A: Desde el Panel de Supabase (Recomendado)

1. Abre tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido completo de:
   ```
   supabase/migrations/20251120000000_route_tracking.sql
   ```
5. Presiona **RUN** o **F5**
6. Verifica que se ejecutó sin errores

### Opción B: Usando Supabase CLI

```bash
# Desde la raíz del proyecto
npx supabase db push

# O si tienes Supabase CLI instalado globalmente
supabase db push
```

## ✅ Paso 2: Verificar la Instalación

Ejecuta estas queries en el SQL Editor para verificar:

```sql
-- 1. Verificar que las tablas se crearon
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('route_tracking', 'route_events');

-- 2. Verificar las funciones
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_route_trajectory',
  'insert_route_tracking_point',
  'get_route_events',
  'insert_route_event',
  'get_route_statistics'
);

-- 3. Verificar índices
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('route_tracking', 'route_events');
```

**Resultado esperado:**

- 2 tablas creadas
- 5 funciones disponibles
- Múltiples índices creados

## 🔧 Paso 3: Configuración del Frontend

No se requiere configuración adicional. El código ya está integrado en:

- `ConductorRouteView.jsx` - Registra automáticamente puntos GPS
- `RouteComparison.jsx` - Lee y compara rutas
- `routeService.js` - Funciones de servicio

## 🧪 Paso 4: Probar el Sistema

### 1. Crear una Ruta de Prueba

```javascript
// En la consola del navegador o desde la app
const testRoute = await createRoute({
  name: 'Ruta de Prueba',
  waypoints: [
    { lat: 4.6097, lng: -74.0817, name: 'Punto A', order: 0 },
    { lat: 4.615, lng: -74.085, name: 'Punto B', order: 1 },
    { lat: 4.62, lng: -74.09, name: 'Punto C', order: 2 },
  ],
});
```

### 2. Asignar a un Conductor

```javascript
const assignment = await assignRouteToDriver({
  routeId: testRoute.id,
  driverId: YOUR_DRIVER_ID,
  vehicleId: YOUR_VEHICLE_ID,
  scheduledStart: new Date().toISOString(),
});
```

### 3. Simular Tracking

Como conductor:

1. Abre la ruta asignada
2. Activa "Modo simulación" (para pruebas sin moverte)
3. Presiona "Iniciar GPS"
4. Ajusta la velocidad simulada
5. Espera 1-2 minutos para recolectar puntos

### 4. Ver Comparación

1. Detén el GPS
2. Ve a "Comparación de Rutas"
3. Selecciona la asignación
4. Verifica que aparecen:
   - Línea azul (ruta planificada)
   - Línea roja (ruta recorrida)
   - Métricas de comparación

## 📊 Paso 5: Verificar Datos en la Base

```sql
-- Ver puntos de tracking guardados
SELECT
  rt.id,
  rt.assignment_id,
  rt.latitude,
  rt.longitude,
  rt.speed,
  rt.timestamp,
  ra.status
FROM route_tracking rt
JOIN route_assignments ra ON ra.id = rt.assignment_id
ORDER BY rt.timestamp DESC
LIMIT 20;

-- Ver eventos registrados
SELECT
  re.id,
  re.assignment_id,
  re.event_type,
  re.event_data,
  re.timestamp
FROM route_events re
ORDER BY re.timestamp DESC
LIMIT 20;

-- Estadísticas de una ruta
SELECT * FROM get_route_statistics(YOUR_ASSIGNMENT_ID);
```

## 🎯 Uso en Producción

### Para Conductores:

1. **Antes de salir:**
   - Verificar que el celular tiene GPS activado
   - Verificar conexión a internet
   - Abrir la app y la ruta asignada

2. **Al iniciar la ruta:**
   - Presionar "Iniciar GPS" (botón verde)
   - Confirmar que dice "Tracking activo"
   - Comenzar el recorrido

3. **Durante el recorrido:**
   - Mantener la app abierta
   - El sistema registra automáticamente
   - No cerrar la pestaña del navegador

4. **Al finalizar:**
   - Presionar "Detener GPS" (botón rojo)
   - Confirmar que todos los waypoints están marcados

### Para Supervisores:

1. **Monitoreo en tiempo real:**
   - Ver ubicaciones actuales en el mapa
   - Verificar progreso de rutas

2. **Análisis posterior:**
   - Abrir "Comparación de Rutas"
   - Seleccionar la asignación completada
   - Revisar métricas y desviaciones
   - Exportar reporte si es necesario

## 🔍 Solución de Problemas

### No se guardan puntos GPS

**Verificar:**

```sql
-- Permisos de las tablas
SELECT * FROM information_schema.table_privileges
WHERE table_name IN ('route_tracking', 'route_events');

-- Políticas RLS
SELECT * FROM pg_policies
WHERE tablename IN ('route_tracking', 'route_events');
```

**Solución:**

```sql
-- Asegurar que las políticas están activas
ALTER TABLE route_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_events ENABLE ROW LEVEL SECURITY;

-- Recrear política si es necesario
DROP POLICY IF EXISTS "Public can insert route tracking" ON route_tracking;
CREATE POLICY "Public can insert route tracking"
  ON route_tracking FOR INSERT
  WITH CHECK (true);
```

### Error de función no encontrada

```sql
-- Verificar que las funciones existen
\df insert_route_tracking_point
\df get_route_trajectory

-- Si no existen, volver a ejecutar la migración
```

### La comparación no muestra datos

**Verificar en orden:**

1. ¿El conductor activó GPS?
2. ¿Hay puntos en route_tracking?
3. ¿La asignación tiene actual_start?
4. ¿El componente está cargando correctamente?

```sql
-- Debugging query completa
SELECT
  ra.id as assignment_id,
  ra.status,
  ra.actual_start,
  ra.actual_end,
  COUNT(rt.id) as tracking_points,
  MIN(rt.timestamp) as first_point,
  MAX(rt.timestamp) as last_point
FROM route_assignments ra
LEFT JOIN route_tracking rt ON rt.assignment_id = ra.id
WHERE ra.id = YOUR_ASSIGNMENT_ID
GROUP BY ra.id, ra.status, ra.actual_start, ra.actual_end;
```

## 📈 Métricas de Rendimiento

### Puntos GPS esperados:

- **Frecuencia:** 1 punto por segundo
- **Ruta de 1 hora:** ~3,600 puntos
- **Ruta de 4 horas:** ~14,400 puntos

### Tamaño estimado en BD:

- **Por punto:** ~100 bytes
- **1 hora de tracking:** ~360 KB
- **100 rutas de 2 horas:** ~72 MB

### Limpieza recomendada:

```sql
-- Archivar rutas antiguas (ejecutar mensualmente)
DELETE FROM route_tracking
WHERE assignment_id IN (
  SELECT id FROM route_assignments
  WHERE status = 'completed'
  AND updated_at < NOW() - INTERVAL '6 months'
);
```

## 📚 Documentación Adicional

Ver `docs/GUIA_COMPARACION_RUTAS.md` para:

- Explicación detallada del sistema
- Ejemplos de código
- Casos de uso
- Optimizaciones avanzadas

## ✅ Checklist de Instalación

- [ ] Migración SQL ejecutada sin errores
- [ ] Tablas `route_tracking` y `route_events` creadas
- [ ] 5 funciones SQL disponibles
- [ ] Políticas RLS activas
- [ ] Ruta de prueba creada y asignada
- [ ] Tracking GPS probado con simulación
- [ ] Comparación de rutas visualizada correctamente
- [ ] Datos visibles en la base de datos

## 🎉 ¡Listo!

El sistema está completamente funcional. Ahora los conductores pueden:

- Registrar automáticamente su recorrido
- Los datos se guardan en la base de datos
- Los supervisores pueden comparar rutas planificadas vs ejecutadas
- Se generan métricas y reportes de cumplimiento

---

**Fecha de creación:** 20 de Noviembre, 2025  
**Versión:** 1.0  
**Autor:** Sistema FlotaVehicular
