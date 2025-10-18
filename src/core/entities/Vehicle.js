/**
 * Vehicle Entity
 * Entidad de dominio que representa un vehículo de la flota
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} id - Identificador único del vehículo
 * @property {string} plate - Placa del vehículo
 * @property {string} brand - Marca del vehículo
 * @property {string} model - Modelo del vehículo
 * @property {number} year - Año de fabricación
 * @property {string} type - Tipo de vehículo (camión, van, etc.)
 * @property {string} status - Estado del vehículo (activo, mantenimiento, estacionado)
 * @property {number} mileage - Kilometraje actual
 * @property {number} fuel - Nivel de combustible (0-100)
 * @property {Object} location - Ubicación GPS del vehículo
 * @property {number} location.lat - Latitud
 * @property {number} location.lng - Longitud
 * @property {string|null} driverId - ID del conductor asignado
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de última actualización
 */

/**
 * Clase Vehicle - Entidad de negocio
 */
export class Vehicle {
  constructor({
    id,
    plate,
    brand,
    model,
    year,
    type,
    status = 'estacionado',
    mileage = 0,
    fuel = 100,
    location = { lat: 0, lng: 0 },
    driverId = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.plate = plate;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.type = type;
    this.status = status;
    this.mileage = mileage;
    this.fuel = fuel;
    this.location = location;
    this.driverId = driverId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Verifica si el vehículo está activo
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'activo';
  }

  /**
   * Verifica si el vehículo necesita mantenimiento
   * @returns {boolean}
   */
  needsMaintenance() {
    return this.status === 'mantenimiento' || this.mileage > 100000;
  }

  /**
   * Verifica si el combustible es bajo
   * @returns {boolean}
   */
  hasLowFuel() {
    return this.fuel < 20;
  }

  /**
   * Actualiza el kilometraje
   * @param {number} newMileage - Nuevo kilometraje
   */
  updateMileage(newMileage) {
    if (newMileage < this.mileage) {
      throw new Error('El nuevo kilometraje no puede ser menor al actual');
    }
    this.mileage = newMileage;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Actualiza el nivel de combustible
   * @param {number} newFuel - Nuevo nivel de combustible (0-100)
   */
  updateFuel(newFuel) {
    if (newFuel < 0 || newFuel > 100) {
      throw new Error('El nivel de combustible debe estar entre 0 y 100');
    }
    this.fuel = newFuel;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convierte la entidad a un objeto plano
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      plate: this.plate,
      brand: this.brand,
      model: this.model,
      year: this.year,
      type: this.type,
      status: this.status,
      mileage: this.mileage,
      fuel: this.fuel,
      location: this.location,
      driverId: this.driverId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
