# Notificaciones inmediatas de incidentes (HU20)

## Qué se agregó

- Tabla `incident_notifications` para trazabilidad por canal (`webpush`, `email`, `sms`, `webhook`).
- Campos `location_lat` y `location_lng` en `incidents` para incluir coordenadas exactas.
- Trigger `trg_incidents_log_notification` que crea un registro `pending` en `incident_notifications` cada vez que se inserta un incidente.
- Suscripción realtime en el frontend (`notificationService`) a inserts en `incidents`, que muestra notificación web push con link a mapa y marca el envío como `sent`.
- Dashboard muestra últimas notificaciones con su estado.

## Canales opcionales (Twilio/SMTP)

- Añadir credenciales como variables de entorno (por ejemplo en Supabase Functions):
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Implementar un edge function (ej. `incident-dispatcher`) que:
  1. reciba `{ incidentId, channel }`
  2. obtenga el incidente y registre en `incident_notifications` con `channel`
  3. envíe por Twilio (SMS) o SMTP (email)
  4. actualice `incident_notifications.status` a `sent/failed`
- Desde el frontend, usar `logChannelResult` si se despacha manualmente un canal externo.

## Pruebas rápidas

1. Crear incidente (página Incidentes o insert directo). Deberías ver notificación web push con lat/lng y link a mapa.
2. Verificar tarjeta en `Dashboard` con estado `sent` y hora.
3. Revisar tabla `incident_notifications` en Supabase para la trazabilidad.
