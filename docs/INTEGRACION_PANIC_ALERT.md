% Guía: Integración del Sistema de Pánico
% 5 pasos para activar el botón de pánico en tu app

# 🚨 Integración Rápida: Sistema de Alertas de Pánico

## Step 1️⃣: Crear Tabla en Supabase

Ejecuta esta query en Supabase SQL Editor:

```sql
-- 1. Tabla principal de panic_alerts
CREATE TABLE IF NOT EXISTS panic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  location JSONB NOT NULL,
  reason TEXT DEFAULT 'Alerta de pánico enviada desde la app',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'CLOSED')),
  sent_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP,
  resolver_id UUID REFERENCES users(id),
  resolution_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. Índices para performance
CREATE INDEX idx_panic_alerts_driver ON panic_alerts(driver_id);
CREATE INDEX idx_panic_alerts_status ON panic_alerts(status);
CREATE INDEX idx_panic_alerts_sent_at ON panic_alerts(sent_at);
CREATE INDEX idx_panic_alerts_incident ON panic_alerts(incident_id);

-- 3. Trigger para actualizar updated_at
CREATE TRIGGER update_panic_alerts_timestamp
BEFORE UPDATE ON panic_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security)
ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;

-- Drivers: Ver sus propias alertas
CREATE POLICY panic_alerts_driver_read
  ON panic_alerts FOR SELECT
  USING (
    driver_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin')
  );

-- Supervisors: Actualizar alertas
CREATE POLICY panic_alerts_supervisor_update
  ON panic_alerts FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'));

-- Insert: Solo supervisores o la app (service role)
CREATE POLICY panic_alerts_create
  ON panic_alerts FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin')
    OR driver_id = auth.uid()
  );
```

---

## Step 2️⃣: Instalar Servicio (`panicAlertService.js`)

El archivo ya está en: `src/services/panicAlertService.js`

**Verifica que contenga**:

- ✅ `getCurrentLocation()`
- ✅ `sendPanicAlert()`
- ✅ `notifySupervisors()`
- ✅ `getPanicAlertHistory()`
- ✅ `resolvePanicAlert()`
- ✅ `getPanicAlertStatus()`
- ✅ Permission handlers

---

## Step 3️⃣: Agregar Botón a la App

### Opción A: Página de Conductor (Recomendado)

En tu archivo `src/pages/DriverDashboard.jsx` o similar:

```jsx
import { useState } from 'react';
import PanicButton from '@/components/PanicButton';
import { useAuth } from '@/hooks/useAuth'; // Tu hook de auth
import { useVehicle } from '@/hooks/useVehicle'; // Tu hook de vehículo

export function DriverDashboard() {
  const { user } = useAuth();
  const { currentVehicle } = useVehicle();

  if (!user?.id || !currentVehicle?.id) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-4">
      {/* Tu contenido del dashboard */}
      <h1>Dashboard del Conductor</h1>

      {/* Botón de Pánico - Se posiciona automáticamente */}
      <PanicButton
        driverId={user.id}
        vehicleId={currentVehicle.id}
        onAlertSent={(result) => {
          console.log('Alerta enviada:', result);
          // Mostrar toast/notificación si es necesario
        }}
      />
    </div>
  );
}
```

### Opción B: Layout Global (Disponible en toda la app)

En tu archivo de layout principal:

```jsx
import PanicButton from '@/components/PanicButton';
import { useAuth } from '@/hooks/useAuth';
import { useVehicle } from '@/hooks/useVehicle';

export function AppLayout({ children }) {
  const { user } = useAuth();
  const { currentVehicle } = useVehicle();

  return (
    <div>
      {/* Navegación, etc */}

      {children}

      {/* Botón disponible en toda la app */}
      {user?.id && currentVehicle?.id && (
        <PanicButton driverId={user.id} vehicleId={currentVehicle.id} />
      )}
    </div>
  );
}
```

---

## Step 4️⃣: Panel de Supervisores

En tu archivo `src/pages/SupervisorDashboard.jsx`:

```jsx
import { useAuth } from '@/hooks/useAuth';
import PanicAlertsDashboard from '@/components/PanicAlertsDashboard';

export function SupervisorDashboard() {
  const { user } = useAuth();

  // Verificar que es supervisor
  if (!['supervisor', 'gerente', 'admin'].includes(user?.role)) {
    return <div>Acceso denegado. Solo para supervisores.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">🎛️ Centro de Control</h1>

      {/* Dashboard de alertas de pánico */}
      <PanicAlertsDashboard />
    </div>
  );
}
```

---

## Step 5️⃣: Agregar Rutas (si es necesario)

En tu archivo de routing (`src/App.jsx` o router config):

```jsx
import DriverDashboard from '@/pages/DriverDashboard';
import SupervisorDashboard from '@/pages/SupervisorDashboard';

// Tus rutas...
const routes = [
  {
    path: '/driver/dashboard',
    element: <DriverDashboard />,
    roles: ['driver'],
  },
  {
    path: '/supervisor/dashboard',
    element: <SupervisorDashboard />,
    roles: ['supervisor', 'gerente', 'admin'],
  },
];
```

---

## ✅ Checklist de Implementación

- [ ] Tabla `panic_alerts` creada en Supabase
- [ ] RLS habilitado y políticas aplicadas
- [ ] Servicio `panicAlertService.js` presente
- [ ] Componente `PanicButton.jsx` presente
- [ ] Componente `PanicAlertsDashboard.jsx` presente
- [ ] Hook `usePanicAlert.js` presente
- [ ] Botón integrado en dashboard de conductor
- [ ] Dashboard integrado en página de supervisor
- [ ] Rutas configuradas
- [ ] Tests ejecutados correctamente
- [ ] Documentación leída (`PANIC_ALERT_SYSTEM.md`)

---

## 🧪 Testing Rápido

### 1. Test manual del botón

```bash
# Accede a: http://localhost:5173/driver/dashboard
# 1. Ves el botón 🚨 en la esquina inferior derecha
# 2. Mantén presionado 2 segundos
# 3. Se abre modal de confirmación
# 4. Verifica ubicación mostrada
# 5. Click en "Sí, Enviar Alerta"
# 6. Botón muestra ✅ verde
# 7. Alerta aparece en dashboard de supervisores
```

### 2. Test de supervisor

```bash
# Accede a: http://localhost:5173/supervisor/dashboard
# 1. Ves lista de alertas en tiempo real
# 2. Puedes filtrar por estado (Activas, Resueltas, Todas)
# 3. Haz click en una alerta
# 4. Se abre modal con detalles
# 5. Puedes marcar como "En camino", "Resuelto" o "Falsa alarma"
# 6. La alerta desaparece de la lista activas
```

### 3. Test de permiso

```bash
# Primera vez:
# 1. Sistema pide permiso de geolocalización
# 2. Sistema pide permiso de notificaciones
# 3. Acepta ambos
# ¡Listo! Ya está configurado
```

---

## 🐛 Debugging

### Ver logs en consola

```javascript
// En panicAlertService.js, los console.log muestran:
console.log('✅ Alerta enviada:', result);
console.log('❌ Error:', error);
console.log('📍 Ubicación:', location);
```

### Queries para debug en Supabase

```sql
-- Ver todas las alertas enviadas
SELECT * FROM panic_alerts ORDER BY sent_at DESC LIMIT 10;

-- Ver alertas activas por conductor
SELECT * FROM panic_alerts
WHERE driver_id = 'TU_UUID' AND status = 'ACTIVE';

-- Ver tiempos de respuesta
SELECT
  id,
  sent_at,
  resolved_at,
  (EXTRACT(EPOCH FROM resolved_at - sent_at)/60)::int as minutes_to_resolve
FROM panic_alerts
WHERE resolved_at IS NOT NULL
ORDER BY sent_at DESC
LIMIT 10;
```

---

## 🎯 Próximos Pasos Recomendados

1. **Notificaciones Email/SMS**
   - Supervisores reciben email cuando hay alerta
   - Conductor recibe confirmación por SMS

2. **Integración con Maps**
   - Mostrar ubicación en Google Maps
   - Ruta automática al lugar del incidente

3. **Integraciones Externas**
   - Llamada automática a emergencias
   - Integración con ambulancias/grúas

4. **Analytics**
   - Dashboard de métricas
   - Tiempo promedio de respuesta
   - Tasa de falsas alarmas

---

## 📞 Soporte

Cualquier problema:

1. Revisar `PANIC_ALERT_SYSTEM.md` para documentación completa
2. Revisar sección "Troubleshooting" en documentación
3. Ejecutar tests: `npm run test tests/panicAlert.test.js`
4. Contactar al equipo de desarrollo

---

**¡Listo para activar el sistema de pánico! 🚨**
