# 🔧 SOLUCIÓN COMPLETA - Sistema de Alertas No Funciona

## 🐛 Problema Identificado

**Las alertas NO se generan por 3 problemas:**

1. ❌ **Políticas RLS demasiado restrictivas**: La tabla `alerts` requiere `company_id` pero tu sistema de auth personalizado no lo tiene
2. ❌ **Función RPC no ejecutada**: La migración `get_alert_rules()` no se aplicó en Supabase
3. ❌ **Columna metadata no existe**: La tabla `alerts` no tiene la columna `metadata`

---

## ✅ SOLUCIÓN: Ejecutar 4 SQL en orden

### **Paso 1: Copiar estos SQL**

Ejecuta estos **4 SQL en orden** en el SQL Editor de Supabase:

#### **SQL 1: Agregar columna metadata**

```sql
-- Archivo: supabase/migrations/20251112180000_add_metadata_to_alerts.sql

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

CREATE INDEX IF NOT EXISTS idx_alerts_metadata_gin ON alerts USING GIN (metadata);

COMMENT ON TABLE alerts IS 'Alertas del sistema con información detallada en metadata (velocidad, ubicación, duración)';
```

#### **SQL 2: Crear funciones RPC**

```sql
-- Archivo: supabase/migrations/20251112170000_rpc_update_alert_rules.sql

-- Función para actualizar reglas de alertas
CREATE OR REPLACE FUNCTION update_alert_rule(
  p_rule_id INTEGER,
  p_umbrales JSONB DEFAULT NULL,
  p_tolerancia_porcentaje INTEGER DEFAULT NULL,
  p_debounce_segundos INTEGER DEFAULT NULL,
  p_nivel_prioridad TEXT DEFAULT NULL,
  p_habilitado BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM alert_rules WHERE id = p_rule_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Regla de alerta no encontrada'
    );
  END IF;

  UPDATE alert_rules
  SET
    umbrales = COALESCE(p_umbrales, umbrales),
    tolerancia_porcentaje = COALESCE(p_tolerancia_porcentaje, tolerancia_porcentaje),
    debounce_segundos = COALESCE(p_debounce_segundos, debounce_segundos),
    nivel_prioridad = COALESCE(p_nivel_prioridad, nivel_prioridad),
    habilitado = COALESCE(p_habilitado, habilitado),
    updated_at = NOW()
  WHERE id = p_rule_id
  RETURNING
    jsonb_build_object(
      'id', id,
      'tipo_alerta', tipo_alerta,
      'nombre', nombre,
      'descripcion', descripcion,
      'umbrales', umbrales,
      'tolerancia_porcentaje', tolerancia_porcentaje,
      'debounce_segundos', debounce_segundos,
      'nivel_prioridad', nivel_prioridad,
      'habilitado', habilitado,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'message', 'Regla actualizada correctamente'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Función para obtener todas las reglas
CREATE OR REPLACE FUNCTION get_alert_rules()
RETURNS TABLE (
  id INTEGER,
  tipo_alerta TEXT,
  nombre TEXT,
  descripcion TEXT,
  umbrales JSONB,
  tolerancia_porcentaje INTEGER,
  debounce_segundos INTEGER,
  nivel_prioridad TEXT,
  habilitado BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id,
    tipo_alerta,
    nombre,
    descripcion,
    umbrales,
    tolerancia_porcentaje,
    debounce_segundos,
    nivel_prioridad,
    habilitado,
    created_at,
    updated_at
  FROM alert_rules
  ORDER BY tipo_alerta, nombre;
$$;

-- Función para habilitar/deshabilitar regla
CREATE OR REPLACE FUNCTION toggle_alert_rule(
  p_rule_id INTEGER,
  p_habilitado BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM alert_rules WHERE id = p_rule_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Regla de alerta no encontrada'
    );
  END IF;

  UPDATE alert_rules
  SET
    habilitado = p_habilitado,
    updated_at = NOW()
  WHERE id = p_rule_id
  RETURNING
    jsonb_build_object(
      'id', id,
      'tipo_alerta', tipo_alerta,
      'nombre', nombre,
      'habilitado', habilitado
    ) INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'message', CASE
      WHEN p_habilitado THEN 'Regla habilitada'
      ELSE 'Regla deshabilitada'
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION update_alert_rule TO authenticated;
GRANT EXECUTE ON FUNCTION update_alert_rule TO anon;
GRANT EXECUTE ON FUNCTION get_alert_rules TO authenticated;
GRANT EXECUTE ON FUNCTION get_alert_rules TO anon;
GRANT EXECUTE ON FUNCTION toggle_alert_rule TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_alert_rule TO anon;
```

#### **SQL 3: Arreglar políticas RLS** ⚠️ **CRÍTICO**

```sql
-- Archivo: supabase/migrations/20251112190000_fix_alerts_rls_policies.sql

-- =====================================================
-- ALERTS: Políticas permisivas
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company alerts" ON alerts;

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

DROP POLICY IF EXISTS "Users can view own company vehicles" ON vehicles;

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
  END IF;
END $$;

COMMENT ON TABLE alerts IS 'Sistema de alertas con políticas RLS permisivas';
COMMENT ON TABLE vehicles IS 'Vehículos con acceso de lectura para todos';
```

#### **SQL 4: Verificar que todo funciona**

```sql
-- Verificar columna metadata
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alerts' AND column_name = 'metadata';

-- Verificar funciones RPC
SELECT * FROM get_alert_rules();

-- Verificar políticas RLS
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('alerts', 'vehicles')
ORDER BY tablename, policyname;

-- Debe mostrar:
-- ✅ metadata | jsonb
-- ✅ Reglas de alertas (velocidad_excesiva, parada_prolongada)
-- ✅ Políticas para authenticated y anon en alerts
-- ✅ Políticas para authenticated y anon en vehicles
```

---

## 📋 Checklist de Ejecución

1. [ ] **Ejecutar SQL 1** (add metadata)
2. [ ] **Ejecutar SQL 2** (crear funciones RPC)
3. [ ] **Ejecutar SQL 3** (arreglar políticas RLS) ⚠️ **MUY IMPORTANTE**
4. [ ] **Ejecutar SQL 4** (verificar)
5. [ ] **Reiniciar dev server**: `npm run dev`
6. [ ] **Limpiar cache del navegador** (Ctrl+Shift+R)
7. [ ] **Iniciar sesión de nuevo**
8. [ ] **Ir al Tracker** (`/tracker`)
9. [ ] **Simular velocidad >10 km/h por 2+ segundos**
10. [ ] **Ver notificación push** ✅

---

## 🧪 Cómo Probar

1. **Abrir consola del navegador** (F12)
2. **Ir al Tracker**
3. **Simular velocidad: 12 km/h**
4. **Mantener por 3 segundos**
5. **Deberías ver**:

```
✅ Umbrales actualizados desde BD: {...}
🟡 Iniciando tracking de velocidad para vehículo ABC-123: 12 km/h (umbral: 10 km/h, duración: 2s)
⏱️ Vehículo ABC-123 excediendo velocidad por 1s (12 km/h > 10 km/h) - Necesita 2s
⏱️ Vehículo ABC-123 excediendo velocidad por 2s (12 km/h > 10 km/h) - Necesita 2s
✅ Alerta de velocidad excesiva creada para ABC-123: 12 km/h por 2s
🚨 Alerta creada: velocidad_excesiva para vehículo ABC-123 (ID: 1)
🚨 Nueva alerta recibida: {...}
🔔 Mostrando notificación: {...}
```

6. **Ver notificación push del navegador** con toda la info

---

## ❌ Si Aún No Funciona

Ejecuta este SQL y envíame los resultados:

```sql
-- Debug completo
SELECT 'Metadata existe' as test,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='metadata') as resultado
UNION ALL
SELECT 'Función RPC existe',
  EXISTS(SELECT 1 FROM pg_proc WHERE proname='get_alert_rules')
UNION ALL
SELECT 'Política INSERT alerts',
  EXISTS(SELECT 1 FROM pg_policies WHERE tablename='alerts' AND cmd='INSERT')
UNION ALL
SELECT 'Política SELECT vehicles',
  EXISTS(SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND cmd='SELECT')
UNION ALL
SELECT 'Reglas habilitadas',
  (SELECT COUNT(*)::text FROM alert_rules WHERE habilitado=true);
```

Todos deben ser `true` o número > 0.

---

**Estado**: ⚠️ Requiere ejecutar los 4 SQL en Supabase  
**Prioridad**: 🚨 CRÍTICA - Sin esto, las alertas NO funcionarán
