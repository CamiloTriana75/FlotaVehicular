Panic Alert - Supabase Edge Function

## Descripción

Función Edge que recibe POST con payload de alerta de pánico, valida el JWT del conductor
usando la API de Auth de Supabase y crea un incidente en la tabla `incidents`.

Variables de entorno requeridas

- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (se debe proteger)

## Uso

Enviar una petición POST con cabecera `Authorization: Bearer <token>` y body JSON:

{
"driver_id": 123,
"vehicle_id": 456,
"location": { "lat": 4.7, "lon": -74.0, "accuracy": 12 },
"message": "Necesito ayuda",
"source": "mobile"
}

## Respuesta

- 201: { incident: { ... } } si se crea con éxito
- 4xx/5xx: { error: "mensaje" }

## Despliegue local

Instala la CLI de Supabase y luego despliega:

```powershell
supabase functions deploy panic-alert --project-ref <TU_PROJECT_REF>
supabase functions serve --env-file .env --name panic-alert
```

## Notas de seguridad

- Esta función requiere `SUPABASE_SERVICE_ROLE_KEY` en variables de entorno para crear filas y validar tokens.
  Protege esta clave y no la expongas en el cliente.
- Recomendado: aplicar rate limiting y logging adicional.
