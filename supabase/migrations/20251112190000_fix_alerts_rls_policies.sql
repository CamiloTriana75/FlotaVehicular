-- =====================================================
-- MIGRATION: Políticas RLS simplificadas para alerts y vehicles
-- Fecha: 2025-11-12
-- Propósito: Permitir INSERT/SELECT en alerts y vehicles sin company_id
-- =====================================================

-- =====================================================
-- ALERTS: Políticas permisivas
-- =====================================================

-- Eliminar políticas antiguas que dependen de company_id
DROP POLICY IF EXISTS "Users can view own company alerts" ON alerts;

-- Crear políticas permisivas para authenticated users
CREATE POLICY "Authenticated users can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- También permitir a anon (para el sistema de tracking)
CREATE POLICY "Anon users can view alerts"
  ON alerts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert alerts"
  ON alerts FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================================================
-- VEHICLES: Políticas permisivas para lectura
-- =====================================================

-- Eliminar política antigua
DROP POLICY IF EXISTS "Users can view own company vehicles" ON vehicles;

-- Permitir lectura a todos los autenticados
CREATE POLICY "Authenticated users can view vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon users can view vehicles"
  ON vehicles FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- REALTIME
-- =====================================================

-- Habilitar REALTIME para la tabla alerts
DO $$ 
BEGIN
  -- Verificar si la tabla ya está en la publicación
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
  END IF;
END $$;

-- Comentarios
COMMENT ON TABLE alerts IS 'Sistema de alertas con políticas RLS permisivas para authenticated y anon';
COMMENT ON TABLE vehicles IS 'Vehículos con acceso de lectura para todos los usuarios autenticados';
