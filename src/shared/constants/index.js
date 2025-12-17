/**
 * Constantes de la aplicación
 * Valores constantes utilizados en toda la aplicación
 */

/**
 * Estados de vehículos
 */
export const VEHICLE_STATUS = {
  ACTIVE: 'activo',
  MAINTENANCE: 'mantenimiento',
  PARKED: 'estacionado',
  INACTIVE: 'inactivo',
};

/**
 * Tipos de vehículos
 */
export const VEHICLE_TYPES = {
  TRUCK: 'camión',
  VAN: 'van',
  CAR: 'automóvil',
  MOTORCYCLE: 'motocicleta',
};

/**
 * Estados de conductores
 */
export const DRIVER_STATUS = {
  ACTIVE: 'activo',
  ON_TRIP: 'en_viaje',
  RESTING: 'descansando',
  INACTIVE: 'inactivo',
};

/**
 * Niveles de alerta
 */
export const ALERT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Tipos de alerta
 */
export const ALERT_TYPES = {
  MAINTENANCE: 'maintenance',
  FUEL: 'fuel',
  SPEED: 'speed',
  LOCATION: 'location',
  DRIVER: 'driver',
};

/**
 * Rutas de navegación
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehiculos',
  VEHICLE_DETAIL: '/vehiculos/:id',
  DRIVERS: '/conductores',
  MAINTENANCE: '/mantenimiento',
  ROUTES: '/rutas',
  ALERTS: '/alertas',
  REPORTS: '/reportes',
  SETTINGS: '/configuracion',
  LOGIN: '/login',
};

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};

/**
 * Configuración de mapa
 */
export const MAP_CONFIG = {
  DEFAULT_CENTER: [4.6097, -74.0817], // Bogotá, Colombia
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3,
};

/**
 * Límites de combustible
 */
export const FUEL_LIMITS = {
  CRITICAL: 10,
  LOW: 20,
  MEDIUM: 50,
  FULL: 100,
};

/**
 * Intervalos de mantenimiento (en km)
 */
export const MAINTENANCE_INTERVALS = {
  OIL_CHANGE: 5000,
  TIRE_ROTATION: 10000,
  BRAKE_INSPECTION: 15000,
  MAJOR_SERVICE: 50000,
};

/**
 * Formatos de fecha
 */
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm:ss',
  TIME: 'HH:mm:ss',
};

/**
 * Configuración de RRHH
 */
export const HR_CONFIG = {
  LICENSE_EXPIRY_THRESHOLD_DAYS: 30,
};

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, intente nuevamente.',
  AUTH_ERROR: 'Error de autenticación. Por favor, inicie sesión nuevamente.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Error de validación. Verifique los datos ingresados.',
  GENERIC_ERROR: 'Ha ocurrido un error. Por favor, intente nuevamente.',
};

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};
