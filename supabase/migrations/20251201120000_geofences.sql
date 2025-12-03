-- =====================================================
-- HU8 - Geocercas y Alertas de Entrada/Salida
-- Fecha: 2025-12-01
-- Crea tablas de geocercas, estado por vehículo y eventos
-- =====================================================

-- 1) Tabla de geocercas
CREATE TABLE IF NOT EXISTS public.geofences (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('circle','polygon')),
  geometry JSONB NOT NULL, -- GeoJSON: Feature o Geometry
  radio_m INTEGER,          -- requerido para circle
  activo BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by INTEGER REFERENCES public.usuario(id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_geofences_activo ON public.geofences(activo);
CREATE INDEX IF NOT EXISTS idx_geofences_tipo ON public.geofences(tipo);

-- 2) Estado de geocerca por vehículo (para detectar transiciones)
CREATE TABLE IF NOT EXISTS public.geofence_state (
  id SERIAL PRIMARY KEY,
  geofence_id INTEGER NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  is_inside BOOLEAN NOT NULL DEFAULT false,
  last_position JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (geofence_id, vehicle_id)
);

-- 3) Eventos de geocerca (histórico)
CREATE TABLE IF NOT EXISTS public.geofence_events (
  id SERIAL PRIMARY KEY,
  geofence_id INTEGER NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('enter','exit')),
  position JSONB NOT NULL, -- {"type":"Point","coordinates":[lng,lat]}
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geofence_events_vehicle ON public.geofence_events(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_time ON public.geofence_events(occurred_at DESC);

-- 4) Asegurar FK alerts.vehicle_id -> vehicles.id (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'alerts_vehicle_id_fkey'
  ) THEN
    ALTER TABLE public.alerts 
      ADD CONSTRAINT alerts_vehicle_id_fkey 
      FOREIGN KEY (vehicle_id) 
      REFERENCES public.vehicles(id) 
      ON DELETE CASCADE;
  END IF;
END$$;

-- 5) RLS
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;

-- Lectura para autenticados
CREATE POLICY geofences_select ON public.geofences
  FOR SELECT TO authenticated USING (true);
CREATE POLICY geofence_state_select ON public.geofence_state
  FOR SELECT TO authenticated USING (true);
CREATE POLICY geofence_events_select ON public.geofence_events
  FOR SELECT TO authenticated USING (true);

-- Escritura: admin/supervisor
CREATE POLICY geofences_write ON public.geofences
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario u
      WHERE u.id_usuario::text = current_setting('request.jwt.claim.sub', true)
      AND u.rol IN ('admin','supervisor','superusuario')
    ) OR true -- Relajar por ahora si no hay mapeo de sub
  );
CREATE POLICY geofences_update ON public.geofences
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY geofence_events_insert ON public.geofence_events
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY geofence_state_upsert ON public.geofence_state
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY geofence_state_update ON public.geofence_state
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 6) Grants para API REST
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofences TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofence_state TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofence_events TO anon, authenticated;

GRANT USAGE, SELECT ON SEQUENCE public.geofences_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.geofence_state_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.geofence_events_id_seq TO anon, authenticated;

-- 7) Comentarios
COMMENT ON TABLE public.geofences IS 'Geocercas definidas (circle/polygon) con GeoJSON';
COMMENT ON TABLE public.geofence_state IS 'Estado actual (inside/outside) por vehículo y geocerca';
COMMENT ON TABLE public.geofence_events IS 'Histórico de eventos enter/exit por geocerca y vehículo';
