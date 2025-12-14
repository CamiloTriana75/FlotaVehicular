/**
 * SQL: Crear tabla de panic_alerts
 * Ejecutar esto en Supabase para habilitar el sistema de pánico
 */

-- Crear tabla panic_alerts si no existe
CREATE TABLE IF NOT EXISTS panic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  reason TEXT DEFAULT 'Alerta de pánico',
  sent_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_panic_alerts_driver ON panic_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_panic_alerts_incident ON panic_alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_panic_alerts_sent_at ON panic_alerts(sent_at DESC);

-- Habilitar RLS
ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;

-- Política: Conductores ven sus propias alertas
CREATE POLICY panic_alerts_driver_read ON panic_alerts
FOR SELECT
USING (driver_id = auth.uid() OR auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'));

-- Política: Conductores insertan alertas (ellos mismos)
CREATE POLICY panic_alerts_driver_insert ON panic_alerts
FOR INSERT
WITH CHECK (driver_id = auth.uid() OR auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'));

-- Política: Supervisores actualizan alertas
CREATE POLICY panic_alerts_supervisor_update ON panic_alerts
FOR UPDATE
USING (auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('supervisor', 'gerente', 'admin'));

-- Crear función para trigger de updated_at
CREATE OR REPLACE FUNCTION update_panic_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS panic_alerts_updated_at_trigger ON panic_alerts;
CREATE TRIGGER panic_alerts_updated_at_trigger
BEFORE UPDATE ON panic_alerts
FOR EACH ROW
EXECUTE FUNCTION update_panic_alerts_updated_at();

-- Dar permisos al anon role (para la app)
GRANT SELECT, INSERT, UPDATE ON panic_alerts TO anon;
GRANT USAGE, SELECT ON SEQUENCE panic_alerts_id_seq TO anon;

-- Crear vista para supervisores (es más eficiente)
CREATE OR REPLACE VIEW panic_alerts_active AS
SELECT 
  pa.id,
  pa.incident_id,
  pa.driver_id,
  pa.vehicle_id,
  pa.latitude,
  pa.longitude,
  pa.accuracy,
  pa.reason,
  pa.sent_at,
  u.name as driver_name,
  u.email as driver_email,
  u.phone as driver_phone,
  v.plate as vehicle_plate,
  v.model as vehicle_model,
  i.status as incident_status,
  i.severity
FROM panic_alerts pa
LEFT JOIN users u ON pa.driver_id = u.id
LEFT JOIN vehicles v ON pa.vehicle_id = v.id
LEFT JOIN incidents i ON pa.incident_id = i.id
WHERE pa.resolved_at IS NULL
ORDER BY pa.sent_at DESC;

-- Dar permisos a la vista
GRANT SELECT ON panic_alerts_active TO anon;
