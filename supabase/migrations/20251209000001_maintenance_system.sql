-- Tabla de órdenes de mantenimiento
CREATE TABLE IF NOT EXISTS public.maintenance_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id INTEGER NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mechanic_id INTEGER REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'preventivo', -- preventivo, correctivo, predictivo
    status VARCHAR(50) DEFAULT 'programada', -- programada, en_proceso, completada, cancelada
    scheduled_date DATE,
    execution_date DATE,
    completion_date TIMESTAMP WITH TIME ZONE,
    mileage INTEGER,
    labor_hours DECIMAL(5,2) DEFAULT 0,
    labor_rate DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de repuestos/partes utilizadas en mantenimiento
CREATE TABLE IF NOT EXISTS public.maintenance_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_order_id UUID NOT NULL REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    supplier VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de adjuntos (facturas, fotos, documentos)
CREATE TABLE IF NOT EXISTS public.maintenance_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_order_id UUID NOT NULL REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_by INTEGER REFERENCES public.usuario(id_usuario) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_vehicle_id ON public.maintenance_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON public.maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_mechanic_id ON public.maintenance_orders(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_parts_order_id ON public.maintenance_parts(maintenance_order_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_attachments_order_id ON public.maintenance_attachments(maintenance_order_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_maintenance_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_orders_updated_at
    BEFORE UPDATE ON public.maintenance_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_order_updated_at();

-- Trigger para actualizar el costo total de la orden cuando se modifican las partes
CREATE OR REPLACE FUNCTION update_maintenance_order_total()
RETURNS TRIGGER AS $$
DECLARE
    v_parts_total DECIMAL(12,2);
    v_labor_cost DECIMAL(12,2);
    v_other_costs DECIMAL(12,2);
    v_order_id UUID;
BEGIN
    -- Obtener el ID de la orden
    IF TG_OP = 'DELETE' THEN
        v_order_id := OLD.maintenance_order_id;
    ELSE
        v_order_id := NEW.maintenance_order_id;
    END IF;

    -- Calcular el total de partes
    SELECT COALESCE(SUM(total_cost), 0) INTO v_parts_total
    FROM public.maintenance_parts
    WHERE maintenance_order_id = v_order_id;

    -- Obtener costos de mano de obra y otros
    SELECT 
        COALESCE(labor_hours * labor_rate, 0),
        COALESCE(other_costs, 0)
    INTO v_labor_cost, v_other_costs
    FROM public.maintenance_orders
    WHERE id = v_order_id;

    -- Actualizar el costo total
    UPDATE public.maintenance_orders
    SET total_cost = v_parts_total + v_labor_cost + v_other_costs
    WHERE id = v_order_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_parts_update_total
    AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_parts
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_order_total();

-- Trigger para actualizar el total cuando se modifican labor_hours, labor_rate o other_costs
CREATE OR REPLACE FUNCTION recalculate_maintenance_total()
RETURNS TRIGGER AS $$
DECLARE
    v_parts_total DECIMAL(12,2);
BEGIN
    -- Calcular el total de partes
    SELECT COALESCE(SUM(total_cost), 0) INTO v_parts_total
    FROM public.maintenance_parts
    WHERE maintenance_order_id = NEW.id;

    -- Actualizar el costo total
    NEW.total_cost = v_parts_total + (NEW.labor_hours * NEW.labor_rate) + COALESCE(NEW.other_costs, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_order_total
    BEFORE UPDATE OF labor_hours, labor_rate, other_costs ON public.maintenance_orders
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_maintenance_total();

-- Función para generar número de orden automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year VARCHAR(4);
    v_count INTEGER;
    v_number VARCHAR(50);
BEGIN
    IF NEW.order_number IS NULL THEN
        v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COUNT(*) + 1 INTO v_count
        FROM public.maintenance_orders
        WHERE order_number LIKE 'OM-' || v_year || '-%';
        
        v_number := 'OM-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
        NEW.order_number := v_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_maintenance_order_number
    BEFORE INSERT ON public.maintenance_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Comentarios para documentación
COMMENT ON TABLE public.maintenance_orders IS 'Órdenes de mantenimiento de vehículos';
COMMENT ON TABLE public.maintenance_parts IS 'Repuestos y partes utilizadas en órdenes de mantenimiento';
COMMENT ON TABLE public.maintenance_attachments IS 'Archivos adjuntos de órdenes de mantenimiento (facturas, fotos, etc.)';
