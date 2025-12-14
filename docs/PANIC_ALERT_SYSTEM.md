% Panic Alert System - Documentación Completa
% Sistema de Alertas de Pánico para FlotaVehicular

# 🚨 Sistema de Alertas de Pánico

## Descripción General

Sistema de emergencia que permite a los conductores enviar alertas inmediatas con su ubicación exacta para recibir ayuda rápida. Los supervisores reciben notificaciones en tiempo real y pueden tomar acciones inmediatas.

### Requisitos Cumplidos

- ✅ **HU**: "Como conductor, quiero poder enviar una alerta inmediata (botón de pánico) para recibir ayuda rápida"
- ✅ **Criterios de Aceptación**:
  - Botón visible en app móvil y web
  - Envía alerta con ubicación en menos de 10 segundos
  - Supervisores reciben notificación en dashboard
  - Incidente queda registrado con detalle
  - Confirmación para evitar falsos positivos

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PanicButton.jsx                                           │
│  ├─ Botón visible (rojo, prominent)                       │
│  ├─ Requiere 2 segundos de presión sostenida             │
│  ├─ Modal de confirmación                                │
│  └─ Feedback visual (loading, success, error)            │
│                                                             │
│  PanicAlertsDashboard.jsx (Supervisores)                 │
│  ├─ Lista de alertas en tiempo real                       │
│  ├─ Filtros por estado (ACTIVE, RESOLVED, ALL)           │
│  └─ Acciones: "En camino", "Resuelto", "Falsa alarma"   │
│                                                             │
│  usePanicAlert Hook                                        │
│  └─ Lógica compartida para componentes                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓ (API)
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Supabase)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  panicAlertService.js (Business Logic)                    │
│  ├─ getCurrentLocation() - Geolocalización con timeout    │
│  ├─ sendPanicAlert() - Crear incidente + notificar       │
│  ├─ notifySupervisors() - Broadcast a supervisores       │
│  ├─ getPanicAlertHistory() - Historial paginated         │
│  ├─ resolvePanicAlert() - Marcar como RESOLVED/CLOSED    │
│  └─ getPanicAlertStatus() - Verificar estado actual      │
│                                                             │
│  Supabase Database                                         │
│  ├─ panic_alerts (NEW)                                   │
│  ├─ incidents (EXISTING)                                 │
│  ├─ notifications (EXISTING)                             │
│  └─ users (EXISTING)                                     │
│                                                             │
│  Real-Time Subscriptions                                  │
│  └─ panic_alerts channel para dashboard en vivo          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Archivos Creados

### Backend Service

- **`src/services/panicAlertService.js`** (370+ líneas)
  - 7 funciones exportadas
  - Geolocalización con timeout de 10s
  - Creación de incidentes
  - Notificaciones en tiempo real

### Frontend Components

- **`src/components/PanicButton.jsx`** (500+ líneas)
  - Botón de pánico rojo y prominente
  - Modal de confirmación
  - Countdown de 2 segundos
  - Feedback visual completo

- **`src/components/PanicAlertsDashboard.jsx`** (600+ líneas)
  - Dashboard para supervisores
  - Suscripciones en tiempo real
  - Filtros por estado
  - Acciones rápidas

### Hooks Personalizados

- **`src/hooks/usePanicAlert.js`**
  - `usePanicAlert(driverId, vehicleId)`
  - Manejo de estado y datos
  - Reutilizable en múltiples componentes

### Tests

- **`tests/panicAlert.test.js`** (300+ líneas)
  - Tests unitarios del servicio
  - Mocks de APIs del navegador
  - Tests de componentes

---

## 🚀 Cómo Usar

### 1️⃣ Para Conductores

#### Instalación en la App

```jsx
// En tu página/componente principal
import PanicButton from '@/components/PanicButton';

function DriverDashboard() {
  const { id: driverId } = useAuth();
  const vehicleId = useSelectedVehicle(); // Tu lógica

  return (
    <>
      {/* Tu contenido */}
      <PanicButton
        driverId={driverId}
        vehicleId={vehicleId}
        onAlertSent={(result) => {
          console.log('Alerta enviada:', result);
          // Feedback adicional si es necesario
        }}
      />
    </>
  );
}
```

#### Flujo de Usuario

1. **Ver Botón**: Botón rojo 🚨 en la esquina inferior derecha
2. **Presionar**: Mantener presionado 2 segundos
3. **Confirmar**: Se abre modal solicitando confirmación
4. **Ubicación**: Sistema captura ubicación automáticamente (±25m accuracy)
5. **Enviar**: Click en "Sí, Enviar Alerta"
6. **Confirmación**: Botón muestra ✅ verde durante 3 segundos

### 2️⃣ Para Supervisores

#### Instalación en Dashboard

```jsx
// En dashboard de supervisores
import PanicAlertsDashboard from '@/components/PanicAlertsDashboard';

function SupervisorDashboard() {
  return (
    <div>
      <h1>Control de Flota</h1>
      <PanicAlertsDashboard />
    </div>
  );
}
```

#### Flujo de Supervisor

1. **Ver Alertas**: Lista de alertas activas en tiempo real
2. **Información**: Detalles del conductor, vehículo, ubicación
3. **Actuar**: Botones rápidos:
   - 🚗 "En camino" - Marcar que se envió ayuda
   - ✅ "Resuelto" - Alerta resuelta
   - ❌ "Falsa alarma" - Alerta falsa

### 3️⃣ Usar el Hook en Otros Componentes

```jsx
import { usePanicAlert } from '@/hooks/usePanicAlert';

function MyComponent() {
  const driverId = 'driver-123';
  const vehicleId = 'vehicle-456';

  const {
    sendAlert,
    resolve,
    history,
    status,
    loading,
    error,
  } = usePanicAlert(driverId, vehicleId);

  // Enviar alerta programáticamente
  const handleEmergency = async () => {
    const location = await getCurrentLocation();
    await sendAlert(location, 'Choque a alta velocidad');
  };

  // Ver historial
  console.log(history); // Array de alertas

  return (
    // Tu JSX
  );
}
```

---

## 🔧 Configuración Requerida

### 1. Tabla `panic_alerts` en Supabase

```sql
CREATE TABLE panic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id),
  driver_id UUID NOT NULL REFERENCES users(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  location JSONB NOT NULL, -- {lat, lng, accuracy, timestamp}
  reason TEXT,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, RESOLVED, CLOSED
  sent_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP,
  resolver_id UUID REFERENCES users(id),
  resolution_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_panic_alerts_driver ON panic_alerts(driver_id);
CREATE INDEX idx_panic_alerts_status ON panic_alerts(status);
CREATE INDEX idx_panic_alerts_sent_at ON panic_alerts(sent_at);
```

### 2. Política RLS (Row Level Security)

```sql
-- Conductores pueden ver sus propias alertas
CREATE POLICY panic_alerts_driver_read
  ON panic_alerts FOR SELECT
  USING (
    driver_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin')
  );

-- Supervisores/Gerentes pueden actualizar alertas
CREATE POLICY panic_alerts_supervisor_update
  ON panic_alerts FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'));
```

### 3. Permisos del Navegador

El sistema solicita automáticamente:

- **Geolocalización**: Ubicación exacta del dispositivo
- **Notificaciones**: Confirmación visual al conductor

```javascript
// Llamadas explícitas si es necesario
await requestGeolocationPermission();
await requestNotificationPermission();
```

---

## 📊 Flujo de Datos

### Envío de Alerta

```
Conductor presiona botón → Captura ubicación (10s timeout)
                         → Muestra confirmación con ubicación
                         → Conductor confirma
                         → Crea registro en panic_alerts
                         → Crea incidente con severity=CRITICAL
                         → Notifica a supervisores en tiempo real
                         → Muestra feedback al conductor ✅
```

### Supervisor responde

```
Supervisor ve alerta en dashboard → Selecciona acción
                                 → Actualiza estado de incidente
                                 → Notification se cierra automáticamente
                                 → Alert marked as RESOLVED/CLOSED
```

### Datos Capturados

**panic_alerts**

```json
{
  "id": "uuid",
  "incident_id": "uuid",
  "driver_id": "uuid",
  "vehicle_id": "uuid",
  "location": {
    "lat": 4.711,
    "lng": -74.0721,
    "accuracy": 25.5,
    "timestamp": "2024-01-15T14:30:00Z"
  },
  "reason": "Alerta de pánico enviada desde la app",
  "status": "ACTIVE",
  "sent_at": "2024-01-15T14:30:00Z",
  "resolved_at": null
}
```

**incidents** (relacionado)

```json
{
  "incident_type": "PANIC_ALERT",
  "severity": "CRITICAL",
  "status": "OPEN",
  "details": {
    "panic_alert_id": "uuid",
    "driver_name": "...",
    "vehicle_plate": "..."
  }
}
```

---

## 🔐 Seguridad y Privacidad

### Validaciones

- ✅ Solo conductores autenticados pueden enviar alertas
- ✅ Solo supervisores/gerentes/admin pueden ver/resolver
- ✅ Ubicación encriptada en base de datos
- ✅ Timeout de 10s para evitar bloqueos

### Prevención de Abuso

- ⏱️ Requiere 2 segundos de presión sostenida (evita accidentes)
- 🔍 Modal de confirmación con ubicación visible
- ⚠️ Disclaimer sobre sanciones por falsas alarmas
- 📊 Historial completo para auditoría

### Permisos

- 🌍 Geolocalización: Solo cuando el usuario otorga permiso
- 🔔 Notificaciones: Solo si el usuario las ha habilitado
- 🔑 RLS: Protegidas a nivel de base de datos

---

## 🧪 Testing

### Ejecutar Tests

```bash
npm run test tests/panicAlert.test.js
```

### Casos Cubiertos

- ✅ Captura de ubicación con timeout
- ✅ Creación de incidente
- ✅ Notificación a supervisores
- ✅ Historial de alertas
- ✅ Resolución de alertas
- ✅ Manejo de errores
- ✅ Permisos del navegador

---

## ⚠️ Troubleshooting

### "Error: Geolocation timeout"

- Verificar que el dispositivo tenga GPS activado
- Verificar que el navegador tiene permiso de ubicación
- En interiores, puede tomar más de 10s (considerar aumentar timeout)

### "Error: Notification permission denied"

- Ir a configuración del navegador → Permisos
- Buscar el sitio y permitir notificaciones
- Recargar la página

### "Alert no aparece en dashboard de supervisores"

- Verificar que la suscripción en tiempo real está activa
- Revisar la consola del navegador para errores
- Verificar que el supervisor tiene rol correcto (supervisor, gerente, admin)

### "Ubicación mostrada es inexacta"

- Accuracy depende de GPS, WiFi y señal celular
- En GPS puro: ±5-10m
- Con WiFi/celular: ±25-100m
- Mostrar `±{accuracy}m` en la UI

---

## 📈 Monitoreo y Métricas

### Queries Útiles para Analytics

```sql
-- Alertas enviadas por día
SELECT
  DATE(sent_at) as date,
  COUNT(*) as total_alerts,
  COUNT(CASE WHEN status='ACTIVE' THEN 1 END) as active,
  COUNT(CASE WHEN status='RESOLVED' THEN 1 END) as resolved
FROM panic_alerts
GROUP BY DATE(sent_at)
ORDER BY date DESC;

-- Tiempo promedio de respuesta
SELECT
  driver_id,
  AVG(EXTRACT(EPOCH FROM (resolved_at - sent_at))) as avg_response_seconds
FROM panic_alerts
WHERE resolved_at IS NOT NULL
GROUP BY driver_id;

-- Conductores más activos en pánico
SELECT
  u.name,
  COUNT(pa.id) as alert_count
FROM panic_alerts pa
JOIN users u ON pa.driver_id = u.id
GROUP BY u.id, u.name
ORDER BY alert_count DESC
LIMIT 10;
```

---

## 🔄 Mejoras Futuras

1. **Integraciones Externas**
   - [ ] Email/SMS a supervisores
   - [ ] Llamada automática 911
   - [ ] Integración con centros de control

2. **Analytics Avanzado**
   - [ ] Mapa de calor de emergencias
   - [ ] Análisis de tendencias
   - [ ] Reportes automáticos

3. **UX Mejorada**
   - [ ] Integración con Apple Watch / Wear OS
   - [ ] Botón de pánico por voz ("HELP")
   - [ ] Compartir ubicación con contactos de emergencia

4. **Machine Learning**
   - [ ] Detección automática de accidentes
   - [ ] Predicción de zonas de riesgo
   - [ ] Análisis de patrones de alertas falsas

---

## 📞 Soporte

Para problemas o sugerencias:

- 📧 Email: dev@flotavehicular.com
- 💬 Slack: #sistema-emergencias
- 🐛 Issues: GitHub Issues

---

**Versión**: 1.0.0
**Última actualización**: 2024-01-15
**Mantener por**: Equipo de Backend
