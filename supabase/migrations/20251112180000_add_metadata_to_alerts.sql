-- =====================================================
-- MIGRATION: Agregar columna metadata a alerts
-- Fecha: 2025-11-12
-- Propósito: Almacenar información adicional de alertas (velocidad, ubicación, duración)
-- =====================================================

-- Agregar columna metadata si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'alerts' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE alerts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN alerts.metadata IS 'Metadata adicional de la alerta (velocidad, ubicación, duración, etc.)';
  END IF;
END $$;

-- Crear índice para búsquedas en metadata
CREATE INDEX IF NOT EXISTS idx_alerts_metadata_gin ON alerts USING GIN (metadata);

-- Comentario
COMMENT ON TABLE alerts IS 'Alertas del sistema con información detallada en metadata (velocidad, ubicación, duración)';
