-- Incident notifications traceability and geolocation fields
-- Compatible con esquemas que aún no tienen tabla incidents

BEGIN;

-- 1) Crear tabla incidents si no existe (referencias a drivers/vehicles)
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'reported',
  km_at_incident INTEGER,
  avg_speed NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Añadir columnas de geolocalización si faltan
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

-- 3) Tabla de comentarios (por si no existía en otros entornos)
CREATE TABLE IF NOT EXISTS incident_comments (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  supervisor_name VARCHAR(100),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON incident_comments(incident_id);

-- 4) Tabla de trazabilidad de notificaciones
CREATE TABLE IF NOT EXISTS incident_notifications (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  channel VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_notifications_incident ON incident_notifications(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_notifications_status ON incident_notifications(status);
CREATE INDEX IF NOT EXISTS idx_incident_notifications_channel ON incident_notifications(channel);

-- 5) Funciones de updated_at (separadas para evitar colisión de nombres)
CREATE OR REPLACE FUNCTION set_updated_at_incidents()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_updated_at ON incidents;
CREATE TRIGGER trg_incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_incidents();

CREATE OR REPLACE FUNCTION set_updated_at_incident_notifications()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incident_notifications_updated_at ON incident_notifications;
CREATE TRIGGER trg_incident_notifications_updated_at
BEFORE UPDATE ON incident_notifications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_incident_notifications();

-- 6) Trigger para registrar notificación webpush pendiente al crear incidente
CREATE OR REPLACE FUNCTION log_incident_notification_webpush()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO incident_notifications (incident_id, channel, status, payload)
  VALUES (NEW.id, 'webpush', 'pending', jsonb_build_object(
    'type', NEW.type,
    'severity', NEW.severity,
    'title', NEW.title,
    'description', NEW.description,
    'location', NEW.location,
    'location_lat', NEW.location_lat,
    'location_lng', NEW.location_lng,
    'occurred_at', NEW.occurred_at
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_log_notification ON incidents;
CREATE TRIGGER trg_incidents_log_notification
AFTER INSERT ON incidents
FOR EACH ROW
EXECUTE FUNCTION log_incident_notification_webpush();

COMMIT;
