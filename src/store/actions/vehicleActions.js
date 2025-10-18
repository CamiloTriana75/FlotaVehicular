/**
 * Action Creators para el módulo de vehículos
 */

import { VEHICLE_ACTIONS } from '../types';

/**
 * Acción para establecer todos los vehículos
 * @param {Array} vehicles - Array de vehículos
 */
export const setVehiclesAction = (vehicles) => ({
  type: VEHICLE_ACTIONS.SET_VEHICLES,
  payload: vehicles,
});

/**
 * Acción para agregar un nuevo vehículo
 * @param {Object} vehicle - Objeto de vehículo
 */
export const addVehicleAction = (vehicle) => ({
  type: VEHICLE_ACTIONS.ADD_VEHICLE,
  payload: vehicle,
});

/**
 * Acción para actualizar un vehículo existente
 * @param {Object} vehicle - Objeto de vehículo actualizado
 */
export const updateVehicleAction = (vehicle) => ({
  type: VEHICLE_ACTIONS.UPDATE_VEHICLE,
  payload: vehicle,
});

/**
 * Acción para eliminar un vehículo
 * @param {string} vehicleId - ID del vehículo a eliminar
 */
export const deleteVehicleAction = (vehicleId) => ({
  type: VEHICLE_ACTIONS.DELETE_VEHICLE,
  payload: vehicleId,
});

/**
 * Acción para filtrar vehículos
 * @param {Object} filters - Filtros a aplicar
 * @param {string} filters.status - Estado del vehículo
 * @param {string} filters.searchTerm - Término de búsqueda
 */
export const filterVehiclesAction = (filters) => ({
  type: VEHICLE_ACTIONS.FILTER_VEHICLES,
  payload: filters,
});

/**
 * Acción para establecer el estado de carga
 * @param {boolean} loading - Estado de carga
 */
export const setVehiclesLoadingAction = (loading) => ({
  type: VEHICLE_ACTIONS.SET_LOADING,
  payload: loading,
});

/**
 * Acción para establecer un error
 * @param {string} error - Mensaje de error
 */
export const setVehiclesErrorAction = (error) => ({
  type: VEHICLE_ACTIONS.SET_ERROR,
  payload: error,
});
