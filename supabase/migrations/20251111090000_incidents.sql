-- Incidents module for HU6
-- Creates incidents and incident_comments tables aligned with current int ID schema

BEGIN;

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- accident, breakdown, violation, near_miss, other
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'reported', -- reported, investigating, resolved, closed
  km_at_incident INTEGER, -- optional odometer
  avg_speed NUMERIC(6,2), -- optional if available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments by supervisors (internal)
CREATE TABLE IF NOT EXISTS incident_comments (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  supervisor_name VARCHAR(100),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_driver_id ON incidents(driver_id);
CREATE INDEX IF NOT EXISTS idx_incidents_vehicle_id ON incidents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON incidents(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incident_comments_incident ON incident_comments(incident_id);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
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
EXECUTE FUNCTION set_updated_at();

COMMIT;
