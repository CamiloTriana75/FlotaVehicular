/*
# Schema de Base de Datos - Sistema de Gestión de Flota

## Descripción
Script SQL para crear las tablas principales del sistema de gestión de flota.

## Tablas incluidas:
1. vehicles - Información de vehículos
2. drivers - Información de conductores  
3. assignments - Asignaciones conductor-vehículo
4. locations - Historial de ubicaciones
5. alerts - Alertas y notificaciones

## Relaciones:
- Un conductor puede tener múltiples asignaciones (historial)
- Un vehículo puede tener múltiples asignaciones (historial) 
- Cada ubicación pertenece a un vehículo específico
- Las alertas están asociadas a vehículos específicos
*/

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  año INTEGER,
  marca VARCHAR(50),
  color VARCHAR(30),
  numero_chasis VARCHAR(50),
  numero_motor VARCHAR(50),
  capacidad_combustible DECIMAL(5,2) DEFAULT 0,
  kilometraje INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'estacionado', 'mantenimiento', 'inactivo')),
  fecha_compra DATE,
  fecha_ultimo_mantenimiento DATE,
  proximo_mantenimiento_km INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conductores
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(15) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(15),
  email VARCHAR(100),
  direccion TEXT,
  numero_licencia VARCHAR(20) UNIQUE,
  categoria_licencia VARCHAR(10),
  fecha_expedicion_licencia DATE,
  fecha_vencimiento_licencia DATE,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'disponible', 'en_servicio')),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignaciones (relación conductor-vehículo)
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'suspendida')),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ubicaciones (tracking GPS)
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  velocidad DECIMAL(5, 2) DEFAULT 0,
  direccion DECIMAL(5, 2) DEFAULT 0, -- heading en grados
  combustible_nivel DECIMAL(5, 2),
  odometro INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alertas y notificaciones
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  tipo_alerta VARCHAR(50) NOT NULL CHECK (tipo_alerta IN (
    'combustible_bajo', 
    'mantenimiento_vencido', 
    'velocidad_excesiva', 
    'licencia_vencida',
    'parada_no_autorizada',
    'falla_sistema'
  )),
  mensaje TEXT NOT NULL,
  nivel_prioridad VARCHAR(10) DEFAULT 'media' CHECK (nivel_prioridad IN ('baja', 'media', 'alta', 'critica')),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'vista', 'resuelta', 'ignorada')),
  fecha_alerta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  resuelto_por VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_vehicles_placa ON vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_cedula ON drivers(cedula);
CREATE INDEX IF NOT EXISTS idx_drivers_estado ON drivers(estado);
CREATE INDEX IF NOT EXISTS idx_assignments_driver_id ON assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_assignments_vehicle_id ON assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_estado ON assignments(estado);
CREATE INDEX IF NOT EXISTS idx_locations_vehicle_id ON locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_estado ON alerts(estado);
CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON alerts(tipo_alerta);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo para pruebas (opcional)
INSERT INTO vehicles (placa, modelo, año, marca, color, status) VALUES
('ABC-123', 'Chevrolet Spark', 2022, 'Chevrolet', 'Blanco', 'activo'),
('DEF-456', 'Renault Logan', 2021, 'Renault', 'Gris', 'estacionado'),
('GHI-789', 'Toyota Corolla', 2023, 'Toyota', 'Negro', 'activo')
ON CONFLICT (placa) DO NOTHING;

INSERT INTO drivers (cedula, nombre, apellidos, telefono, email, estado) VALUES
('12345678', 'Carlos', 'Mendoza', '3001234567', 'carlos@email.com', 'activo'),
('87654321', 'María', 'García', '3109876543', 'maria@email.com', 'disponible'),
('11223344', 'Luis', 'Rodríguez', '3201122334', 'luis@email.com', 'activo')
ON CONFLICT (cedula) DO NOTHING;

-- Comentarios finales
COMMENT ON TABLE vehicles IS 'Tabla principal de vehículos de la flota';
COMMENT ON TABLE drivers IS 'Tabla de conductores registrados en el sistema';
COMMENT ON TABLE assignments IS 'Tabla de asignaciones conductor-vehículo con historial';
COMMENT ON TABLE locations IS 'Tabla de tracking GPS con historial de ubicaciones';
COMMENT ON TABLE alerts IS 'Tabla de alertas y notificaciones del sistema';