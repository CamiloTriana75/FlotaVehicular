/**
 * Driver Entity
 * Entidad de dominio que representa un conductor
 */

/**
 * @typedef {Object} Driver
 * @property {string} id - Identificador único del conductor
 * @property {string} name - Nombre completo del conductor
 * @property {string} license - Número de licencia
 * @property {string} phone - Teléfono de contacto
 * @property {string} email - Email del conductor
 * @property {string} status - Estado del conductor (disponible, activo, en_viaje, descansando, inactivo)
 * @property {number} experience - Años de experiencia
 * @property {string|null} assignedVehicle - ID del vehículo asignado
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de última actualización
 */

/**
 * Clase Driver - Entidad de negocio
 */
export class Driver {
  constructor({
    id,
    name,
    license,
    phone,
    email,
    status = 'disponible',
    experience = 0,
    assignedVehicle = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.name = name;
    this.license = license;
    this.phone = phone;
    this.email = email;
    this.status = status;
    this.experience = experience;
    this.assignedVehicle = assignedVehicle;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Verifica si el conductor está disponible
   * @returns {boolean}
   */
  isAvailable() {
    return this.status === 'disponible' && !this.assignedVehicle;
  }

  /**
   * Verifica si el conductor está en viaje
   * @returns {boolean}
   */
  isOnTrip() {
    return this.status === 'en_viaje';
  }

  /**
   * Asigna un vehículo al conductor
   * @param {string} vehicleId - ID del vehículo
   */
  assignVehicle(vehicleId) {
    if (this.assignedVehicle) {
      throw new Error('El conductor ya tiene un vehículo asignado');
    }
    this.assignedVehicle = vehicleId;
    this.status = 'activo';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Desasigna el vehículo del conductor
   */
  unassignVehicle() {
    this.assignedVehicle = null;
    this.status = 'disponible';
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convierte la entidad a un objeto plano
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      license: this.license,
      phone: this.phone,
      email: this.email,
      status: this.status,
      experience: this.experience,
      assignedVehicle: this.assignedVehicle,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
