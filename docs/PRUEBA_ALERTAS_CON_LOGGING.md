# 🔍 Prueba del Sistema de Alertas con Logging Detallado

## 📋 Resumen de Cambios

Se agregó **logging extensivo** para diagnosticar exactamente por qué las alertas no funcionan:

### ✅ Funciones Modificadas

1. **`resolveVehiclePk()`** en `locationService.js`
   - ✅ Acepta tanto ID numérico como placa (TEXT)
   - ✅ Logging detallado de cada paso
   - ✅ Cache para optimizar búsquedas repetidas

2. **`crearAlerta()`** en `alertService.js`
   - ✅ Logging detallado de resolución de vehículo
   - ✅ Maneja tanto ID como placa
   - ✅ Búsqueda en `assignments` para driver_id (con fallback)

3. **`insertLocation()`** en `locationService.js`
   - ✅ Logging de resolución de vehicle_id desde placa

## 🧪 Pasos para Probar

### 1. Ejecutar el Script SQL en Supabase

**PRIMERO debes ejecutar** `scripts/EJECUTAR_EN_SUPABASE.sql` en el SQL Editor de Supabase.

Este script:

- ✅ Agrega columna `metadata` a `alerts`
- ✅ Crea funciones RPC para gestión de umbrales
- ✅ **ARREGLA las políticas RLS** (CRÍTICO)
- ✅ Habilita Realtime en la tabla `alerts`

### 2. Verificar Vehículos en Base de Datos

Asegúrate de tener vehículos en la tabla `vehicles`:

```sql
SELECT id, placa, marca, modelo, status
FROM vehicles
WHERE placa IN ('ABC-123', 'XYZ-789', 'DEF-456');
```

**Resultado esperado:**

```
id  | placa   | marca     | modelo   | status
----|---------|-----------|----------|--------
1   | ABC-123 | Toyota    | Corolla  | activo
2   | XYZ-789 | Chevrolet | Spark    | activo
3   | DEF-456 | Nissan    | Sentra   | activo
```

### 3. Abrir Navegador con DevTools

1. Abre http://localhost:5173
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Limpia la consola (botón 🚫 o Ctrl+L)

### 4. Navegar a VehicleTracker

1. Inicia sesión (si no estás logueado)
2. Ve a `/tracker`
3. Ingresa una placa válida: **ABC-123**
4. Haz clic en **"Iniciar Tracking"**

### 5. Observar Logs en Consola

Deberías ver logs como estos cada vez que se envía una ubicación:

```javascript
[resolveVehiclePk] 🔍 Entrada: "ABC-123" (tipo: string)
[resolveVehiclePk] 🔎 Buscando en BD: placa="ABC-123"
[resolveVehiclePk] ✅ Encontrado en BD: placa="ABC-123", ID=1
[alerts] 🔍 Resolviendo vehicle_id para: "ABC-123" (tipo: string)
[alerts] ✅ Vehículo resuelto: ID=1, velocidad=0 km/h
```

### 6. Simular Exceso de Velocidad

En la página VehicleTracker:

1. **Modifica la velocidad manualmente** en el simulador:
   - Cambia el valor de velocidad a **25 km/h** (superior al umbral de 10 km/h)
   - Mantén esa velocidad por **3+ segundos**

2. **Observa los logs en consola**:

```javascript
🟡 Iniciando tracking de velocidad para vehículo 1: 25 km/h (umbral: 10 km/h, duración: 2s)
⏱️ Vehículo 1 excediendo velocidad por 1s (25 km/h > 10 km/h) - Necesita 2s
⏱️ Vehículo 1 excediendo velocidad por 2s (25 km/h > 10 km/h) - Necesita 2s
[crearAlerta] 🔍 Entrada: vehicleIdOrPlaca="1" (tipo: number), tipo_alerta="velocidad_excesiva"
[crearAlerta] 🔎 Buscando por ID: 1
[crearAlerta] ✅ Vehículo encontrado: ID=1, placa="ABC-123"
[crearAlerta] 📝 Insertando alerta: {vehicle_id: 1, tipo_alerta: "velocidad_excesiva", ...}
[crearAlerta] 🚨 Alerta creada exitosamente: ID=123, tipo="velocidad_excesiva", vehículo="ABC-123"
✅ Alerta de velocidad excesiva creada para 1: 25 km/h por 2s
```

### 7. Verificar Notificación

Deberías ver:

- ✅ **Notificación del navegador** con el mensaje de alerta
- ✅ **Badge de notificación** en el ícono de campana (navbar)
- ✅ **Alerta en AlertCenter** (`/alerts`)

## 🔴 Si NO Aparecen Logs

### Problema 1: No se resuelve el vehicle_id

**Síntoma:**

```javascript
[resolveVehiclePk] ❌ Valor vacío recibido
// o
[resolveVehiclePk] 💥 Error buscando placa "ABC-123": ...
```

**Solución:**

1. Verifica que ejecutaste el SQL de arreglo de RLS
2. Verifica que la placa existe en la BD:
   ```sql
   SELECT * FROM vehicles WHERE placa = 'ABC-123';
   ```

### Problema 2: Error al crear alerta

**Síntoma:**

```javascript
[crearAlerta] 💥 Error insertando: new row violates row-level security policy
```

**Solución:**

- ⚠️ **NO ejecutaste el SQL de RLS** - ejecuta `scripts/EJECUTAR_EN_SUPABASE.sql`

### Problema 3: No se detectan umbrales

**Síntoma:**

```javascript
⚠️ Error al obtener umbrales, usando valores por defecto
```

**Solución:**

1. Verifica que ejecutaste el SQL (crea la función `get_alert_rules()`)
2. Verifica que existen reglas habilitadas:
   ```sql
   SELECT * FROM alert_rules WHERE habilitado = true;
   ```

## 📊 Logging Completo Esperado

Flujo completo cuando todo funciona:

```javascript
// 1. Resolución de vehículo
[resolveVehiclePk] 🔍 Entrada: "ABC-123" (tipo: string)
[resolveVehiclePk] 🔎 Buscando en BD: placa="ABC-123"
[resolveVehiclePk] ✅ Encontrado en BD: placa="ABC-123", ID=1

// 2. Evaluación de alertas
[alerts] 🔍 Resolviendo vehicle_id para: "ABC-123" (tipo: string)
[alerts] ✅ Vehículo resuelto: ID=1, velocidad=25 km/h

// 3. Carga de umbrales
✅ Umbrales actualizados desde BD: {velocidad_excesiva: {max_velocidad_kmh: 10, duracion_segundos: 2}, ...}

// 4. Tracking de velocidad
🟡 Iniciando tracking de velocidad para vehículo 1: 25 km/h (umbral: 10 km/h, duración: 2s)
⏱️ Vehículo 1 excediendo velocidad por 1s (25 km/h > 10 km/h) - Necesita 2s
⏱️ Vehículo 1 excediendo velocidad por 2s (25 km/h > 10 km/h) - Necesita 2s

// 5. Creación de alerta
[crearAlerta] 🔍 Entrada: vehicleIdOrPlaca="1" (tipo: number), tipo_alerta="velocidad_excesiva"
[crearAlerta] 🔎 Buscando por ID: 1
[crearAlerta] Búsqueda por ID resultado: {vehiculo: {id: 1, placa: "ABC-123"}, error: undefined}
[crearAlerta] ✅ Vehículo encontrado: ID=1, placa="ABC-123"
[crearAlerta] ℹ️ Sin asignación de conductor (tabla assignments puede no existir)
[crearAlerta] 📝 Insertando alerta: {vehicle_id: 1, driver_id: null, tipo_alerta: "velocidad_excesiva", mensaje: "...", nivel_prioridad: "alta", estado: "pendiente", metadata: {...}}
[crearAlerta] 🚨 Alerta creada exitosamente: ID=5, tipo="velocidad_excesiva", vehículo="ABC-123" (ID: 1)
✅ Alerta de velocidad excesiva creada para 1: 25 km/h por 2s

// 6. Notificación
🔔 Nueva alerta recibida: {id: 5, tipo_alerta: "velocidad_excesiva", ...}
📬 Mostrando notificación de alerta: Velocidad Excesiva
```

## 🎯 Próximos Pasos

Una vez que veas los logs completos:

1. **Si todo funciona**: Las alertas deberían aparecer automáticamente
2. **Si hay errores**: Copia los logs de la consola y compártelos para diagnosticar
3. **Verifica la BD**: Consulta la tabla `alerts` para confirmar que se insertaron:
   ```sql
   SELECT id, vehicle_id, tipo_alerta, mensaje, nivel_prioridad, estado, metadata, fecha_alerta
   FROM alerts
   ORDER BY fecha_alerta DESC
   LIMIT 10;
   ```

## 🔧 Comandos Útiles

### Limpiar Cache de Umbrales

```javascript
// En la consola del navegador
localStorage.clear();
location.reload();
```

### Forzar Recreación de Notificación

```javascript
// En la consola del navegador
Notification.requestPermission().then(console.log);
```

### Ver Estado del Sistema

```javascript
// En la consola del navegador (tras iniciar tracking)
console.log('Velocidad actual:' /* ver en UI */);
console.log('Umbral configurado:', 10); // desde AlertRulesConfig
```

---

**Resumen**: Con este logging detallado, sabremos exactamente en qué paso falla el sistema de alertas. 🎯
