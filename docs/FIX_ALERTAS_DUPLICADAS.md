# 🔧 Fix: Alertas Duplicadas de Parada Prolongada

## 🐛 Problema

Cuando un vehículo permanecía detenido, se creaban **3 alertas** de parada prolongada en lugar de solo 1.

### Causa Raíz

Aunque existía el flag `rec.alerted`, las evaluaciones se ejecutaban de forma asíncrona y múltiples llamadas se procesaban antes de que el flag se actualizara en el Map.

## ✅ Solución Implementada

### 1. Debounce Global con Timestamp

Agregado un Map global que rastrea el timestamp de la última alerta de cada tipo por vehículo:

```javascript
const ALERT_DEBOUNCE_MS = 60000; // 60 segundos entre alertas
const lastAlertTimestamp = new Map(); // Map<"vehiclePk_tipoAlerta", timestamp>
```

### 2. Verificación Antes de Crear Alerta

Antes de crear una alerta, se verifica cuándo fue la última vez que se creó una alerta del mismo tipo para el mismo vehículo:

```javascript
const debounceKey = `${vehiclePk}_parada_prolongada`;
const lastAlert = lastAlertTimestamp.get(debounceKey) || 0;
const timeSinceLastAlert = now - lastAlert;

if (timeSinceLastAlert < ALERT_DEBOUNCE_MS) {
  console.log(`⏸️ Alerta en debounce, esperando...`);
  return; // No crear alerta duplicada
}
```

### 3. Actualización del Timestamp

Al crear la alerta exitosamente, se actualiza el timestamp:

```javascript
lastAlertTimestamp.set(debounceKey, now);
```

## 📊 Comportamiento Actual

### Para Parada Prolongada:

1. **Primera detección** (10s detenido):
   - ✅ Se crea la alerta
   - 📝 Se marca `rec.alerted = true`
   - ⏱️ Se guarda timestamp en `lastAlertTimestamp`

2. **Evaluaciones subsiguientes** (mientras sigue detenido):
   - ⏸️ Debounce detecta que ya se creó una alerta hace menos de 60s
   - ❌ No se crea alerta duplicada
   - 📊 Log: "Alerta en debounce (hace Xs), esperando Ys más"

3. **Cuando vuelve a moverse**:
   - 🟢 Se resetea `rec.alerted = false`
   - 📊 Log: "Vehículo en movimiento nuevamente, reseteando tracking"

4. **Si vuelve a detenerse después de 60s**:
   - ✅ Puede crear nueva alerta (ha pasado el tiempo de debounce)

### Para Velocidad Excesiva:

El mismo mecanismo aplica:

- Debounce de 60 segundos entre alertas
- Una sola alerta por cada episodio de velocidad excesiva
- Permite nueva alerta después de bajar velocidad y volver a excederla (si pasaron 60s)

## 🧪 Cómo Probar

### Test 1: Parada Prolongada Única

1. Inicia tracking de un vehículo
2. Detén el vehículo (velocidad 0 km/h)
3. Espera 10+ segundos
4. **Resultado esperado**:
   - ✅ **1 sola alerta** de parada prolongada
   - 📊 Logs subsiguientes muestran "Alerta en debounce"

### Test 2: Múltiples Paradas

1. Detén el vehículo por 10s → ✅ Crea alerta
2. Mueve el vehículo → 🟢 Resetea tracking
3. Detén de nuevo **antes de 60s** → ⏸️ En debounce, no crea alerta
4. Detén de nuevo **después de 60s** → ✅ Crea nueva alerta

### Test 3: Velocidad Excesiva Única

1. Acelera a 20 km/h por 3 segundos
2. **Resultado esperado**:
   - ✅ **1 sola alerta** de velocidad excesiva
   - ⏸️ Evaluaciones subsiguientes en debounce

## 📝 Logs Esperados

### Primera Alerta (OK)

```
🟡 Iniciando tracking de parada para vehículo 1
⏱️ Vehículo 1 detenido por 10s - Necesita 10s
[crearAlerta] 🚨 Alerta creada exitosamente: tipo="parada_prolongada"
✅ Alerta de parada prolongada creada para 1: 10s detenido
```

### Intentos Subsiguientes (Bloqueados)

```
⏱️ Vehículo 1 detenido por 11s - Necesita 10s
⏸️ Alerta de parada en debounce (hace 1s), esperando 59s más
⏱️ Vehículo 1 detenido por 12s - Necesita 10s
⏸️ Alerta de parada en debounce (hace 2s), esperando 58s más
```

### Cuando Vuelve a Moverse

```
🟢 Vehículo 1 en movimiento nuevamente, reseteando tracking de parada
```

## 🔧 Configuración

Para ajustar el tiempo de debounce, modifica la constante:

```javascript
const ALERT_DEBOUNCE_MS = 60000; // Milisegundos (60000 = 60 segundos)
```

**Valores recomendados:**

- `30000` (30s) - Para entornos de prueba
- `60000` (60s) - Para producción normal
- `120000` (2min) - Para evitar spam excesivo

## ✅ Resumen

| Antes                      | Después                |
| -------------------------- | ---------------------- |
| 3 alertas por parada       | **1 alerta única**     |
| Sin debounce               | Debounce de 60s        |
| Spam de notificaciones     | Notificaciones limpias |
| ❌ Confuso para operadores | ✅ Clara y concisa     |

---

**Estado**: ✅ Implementado y listo para probar
**Archivos modificados**: `src/services/locationService.js`
