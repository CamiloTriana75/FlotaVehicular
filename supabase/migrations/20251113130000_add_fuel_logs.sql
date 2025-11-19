-- Migración: tabla fuel_logs
-- Fecha: 2025-11-13
-- Descripción: Registra repostajes y consumo por vehículo

CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  liters DECIMAL(10,2) NOT NULL,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  odometer INTEGER NOT NULL,
  km_since_last INTEGER,
  km_per_l DECIMAL(10,4), -- km por litro
  l_per_100km DECIMAL(10,4), -- litros por 100 km
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle ON public.fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_date ON public.fuel_logs(date DESC);

COMMENT ON TABLE public.fuel_logs IS 'Registros de repostaje y consumo por vehículo';
COMMENT ON COLUMN public.fuel_logs.km_per_l IS 'Kilómetros por litro calculado para el tramo entre repostajes';
COMMENT ON COLUMN public.fuel_logs.l_per_100km IS 'Litros consumidos por 100 km para el tramo entre repostajes';
