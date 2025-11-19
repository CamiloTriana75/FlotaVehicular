-- Migración: tablas para turnos y asignaciones de conductores
-- Fecha: 2025-11-13
-- Descripción: Crea plantillas de turnos y asignaciones calendarizadas por conductor

CREATE TABLE IF NOT EXISTS public.shift_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.driver_shift_assignments (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  shift_id INTEGER NOT NULL REFERENCES public.shift_templates(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL, -- fecha en la que inicia el turno
  start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  end_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  hours DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_templates_name ON public.shift_templates(name);
CREATE INDEX IF NOT EXISTS idx_driver_shift_assignments_driver_date ON public.driver_shift_assignments(driver_id, shift_date);

COMMENT ON TABLE public.shift_templates IS 'Plantillas de turnos (ej. turno nocturno 22:00-06:00)';
COMMENT ON TABLE public.driver_shift_assignments IS 'Asignaciones de turnos a conductores con timestamps y duración';
