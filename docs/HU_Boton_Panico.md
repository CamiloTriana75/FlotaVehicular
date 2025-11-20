# HU: Botón de Pánico (Alertas Inmediatas)

**Resumen (User Story)**
Como conductor
Quiero poder enviar una alerta inmediata (botón de pánico)
Para recibir ayuda rápida y notificar ubicación exacta

**Descripción Detallada**

- Botón visible en app móvil y web.
- Envía alerta con `vehicle_id`, `driver_id`, `timestamp` y última ubicación (lat, lon, accuracy).
- Genera notificación para supervisores y crea un incidente en la base de datos.
- Añadir confirmación (modal o doble-pulsación) para evitar falsos positivos.

**Criterios de Aceptación**

- Botón envía alerta con ubicación en menos de 10 segundos desde la acción del conductor.
- Supervisores reciben notificación o entrada en dashboard en tiempo real.
- Incidente queda registrado con detalle (ids, timestamp, ubicación, mensaje opcional).

**Definición de Terminado (DoD)**

- Endpoint backend implementado y testeado.
- Componente `PanicButton` integrado en vistas móvil/web.
- Notificaciones funcionando para al menos un rol "supervisor" en el dashboard.
- Pruebas unitarias e2e que cubren el flujo principal.
- Documentación actualizada en `docs/HU_Boton_Panico.md`.

**Épica Relacionada**

- Épica: Gestión de Incidentes y Emergencias
- Sprint: Sprint 6

**Estimación**

- Story Points: 5
- Tiempo estimado: 10 horas (desglose estimado abajo)

**Desglose de tareas y estimación**

- Backend: definir API + esquema DB — 2h
- Backend: implementar endpoint + notificaciones — 3h
- Frontend: componente botón + confirmación — 2h
- Integración realtime en dashboard — 1.5h
- Tests e2e + unitarios — 1h
- Documentación y ajustes — 0.5h

**Casos de Prueba**
Escenario 1:
Dado que conductor pulsa botón de pánico
Cuando pulse el botón
Entonces se crea incidente y supervisores son notificados con ubicación

Escenario 2 (falsos positivos):
Dado que conductor pulsa por error
Cuando cancele en la confirmación en <5s
Entonces no se crea incidente

Escenario 3 (sin geolocalización):
Dado que no es posible obtener ubicación en el cliente
Cuando pulse el botón
Entonces envío con `last_known_location` desde el backend (si está disponible) y marcar como "ubicación estimada"

**Notas Adicionales**

- Priorizar entrega rápida y fiabilidad (reintentos 1 vez si la llamada falla). Evitar bloqueos en UI.
- Registrar un `audit_log` con quien pulsó, timestamp y resultado del envío.

---

**Especificación Técnica (sugerida)**

Endpoint backend

- Método: `POST /api/alerts/panic`
- Autenticación: token JWT del conductor (header `Authorization: Bearer ...`)
- Payload JSON:
  {
  "vehicle_id": "string",
  "driver_id": "string",
  "timestamp": "ISO8601 string (opcional, server overrides si falta)",
  "location": { "lat": number, "lon": number, "accuracy": number | null },
  "message": "string (opcional)",
  "source": "mobile|web"
  }
- Validaciones:
  - `driver_id` y `vehicle_id` deben existir y coincidir con el token o con permisos.
  - Si no hay `location`, intentar recuperar `last_known` por `vehicle_id`.

Acción del endpoint

- Crear registro en `incidents` (o `alerts`) con estado `open`.
- Emitir notificación en tiempo real a todos los `supervisors` que tengan permiso para ese `vehicle_id` (ej.: canal supabase/WS o enviar push).
- Responder 201 con el `incident_id` y `received_at`.

Esquema DB sugerido (simplificado)

- Table `incidents`:
  - `id` (uuid, PK)
  - `vehicle_id` (string)
  - `driver_id` (string)
  - `status` (enum: open, acknowledged, resolved)
  - `created_at` (timestamp)
  - `lat` (float)
  - `lon` (float)
  - `accuracy` (float, nullable)
  - `source` (string)
  - `message` (text, nullable)
  - `metadata` (jsonb, nullable)

Notificaciones

- Opciones:
  - Usar Supabase Realtime (canales) para emitir evento `incident.created` a suscriptores (dashboard supervisors).
  - O usar WebSockets/Socket.io si ya existe infra.
  - Para alertas push móviles -> FCM/APNs (fuera de alcance inicial; planear integración si es necesario).

Frontend: `PanicButton` (React, ejemplo)

- UI: botón prominente, color rojo, accesible.
- Flujo:
  1. Pulsar -> abrir modal de confirmación con texto "Confirmar alerta de emergencia" y botón "Enviar" y "Cancelar".
  2. Al confirmar -> obtener `navigator.geolocation.getCurrentPosition` con timeout 5s.
  3. Enviar `POST /api/alerts/panic` con body y mostrar spinner.
  4. Mostrar resultado: "Alerta enviada" o "Error, reintentar" (permitir 1 reintento automático si falla).
- Consideraciones: si la app móvil ya tiene permisos de geolocalización en background, usar la mejor precisión.

Ejemplo de envío (cliente):

```js
async function sendPanic({ vehicle_id, driver_id, message }) {
  // intentar obtener ubicación (timeout 5s)
  const location = await getLocation({ timeout: 5000 }).catch(() => null);
  const body = { vehicle_id, driver_id, location, message, source: 'mobile' };
  const res = await fetch('/api/alerts/panic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Fallo al enviar alerta');
  return res.json();
}
```

Ejemplo de handler (Node/Express pseudo):

```js
app.post('/api/alerts/panic', authenticate, async (req, res) => {
  const { vehicle_id, driver_id, location, message, source } = req.body;
  // validar permisos
  // si no hay location -> buscar last_known by vehicle_id
  // crear incidente en DB
  // emitir evento realtime a supervisores
  // responder 201 { incident_id }
});
```

Integración aplicada en este repo

- Se agregó `src/api/alerts.js` con `sendPanicAlert()` que inserta un registro en la tabla `incidents` usando el cliente Supabase.
- Se agregó `src/components/PanicButton.jsx` y se integró en `src/pages/VehicleTracker.jsx` para permitir que el conductor envíe la alerta desde el tracker.
- La tabla `incidents` ya existe en `supabase/migrations/20251111090000_incidents.sql`, por lo que la inserción crea un nuevo incidente y los listeners realtime del dashboard lo recibirán automáticamente.

Notas de despliegue

- Si el proyecto se despliega con Supabase, no es necesario un endpoint adicional: el cliente puede insertar en `incidents` directamente (como hace `sendPanicAlert`).
- Si prefieres exponer un endpoint HTTP (Edge Function), puedo crear una función en `supabase/functions/` que haga las validaciones del servidor y la inserción (recomendado para seguridad adicional).

Pruebas recomendadas

- Unit: validaciones del endpoint, creación de incidente.
- Integration: endpoint crea filas en DB y emite evento.
- E2E: test que simula el flujo (cliente) y verifica dashboard recibe notificación.

Seguridad y privacidad

- Solo conductores autenticados pueden enviar alertas para su `driver_id` o vehículos asignados.
- Log de auditoría para cada envío.
- Limitar tasa: protección anti-abuso (por ejemplo, 1 alerta/30s por conductor) y posibilidad de anular falsas alertas en el dashboard.

Métricas y monitorización

- Latencia de entrega (client -> server -> notificación).
- Conteo de incidentes por día.
- Tasa de falsos positivos (reportados por supervisores).

---

**Siguientes pasos (opcionales, puedo realizar)**

- Implementar el endpoint backend en el repo (indica stack preferido: Supabase Edge Function / Node/Express / Fastify).
- Implementar componente `PanicButton` en `src/components` y su integración en pantallas conductor.
- Añadir tests básicos e2e.

Indícame qué paso prefieres que ejecute a continuación y lo implemento (por ejemplo: "Implementar endpoint en Supabase" o "Crear componente React y PR local").
