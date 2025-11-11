/**
 * Constantes relacionadas con vehículos
 */

export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'camion', label: 'Camión' },
  { value: 'bus', label: 'Bus' },
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'van', label: 'Van' },
  { value: 'motocicleta', label: 'Motocicleta' },
];

export const FUEL_TYPES = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'gnv', label: 'GNV' },
];

export const VEHICLE_STATUS = [
  { value: 'activo', label: 'Activo' },
  { value: 'estacionado', label: 'Estacionado' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'inactivo', label: 'Inactivo' },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_YEAR = 1980;
export const MAX_YEAR = CURRENT_YEAR + 1;

// Regex para validación de placa (formatos: ABC-123, ABC123)
export const PLATE_REGEX = /^[A-Z]{3}-?\d{3}$/;
