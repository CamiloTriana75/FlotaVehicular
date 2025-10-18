/**
 * Action Creators para el módulo de conductores
 */

import { DRIVER_ACTIONS } from '../types';

/**
 * Acción para establecer todos los conductores
 * @param {Array} drivers - Array de conductores
 */
export const setDriversAction = (drivers) => ({
  type: DRIVER_ACTIONS.SET_DRIVERS,
  payload: drivers,
});

/**
 * Acción para agregar un nuevo conductor
 * @param {Object} driver - Objeto de conductor
 */
export const addDriverAction = (driver) => ({
  type: DRIVER_ACTIONS.ADD_DRIVER,
  payload: driver,
});

/**
 * Acción para actualizar un conductor existente
 * @param {Object} driver - Objeto de conductor actualizado
 */
export const updateDriverAction = (driver) => ({
  type: DRIVER_ACTIONS.UPDATE_DRIVER,
  payload: driver,
});

/**
 * Acción para eliminar un conductor
 * @param {string} driverId - ID del conductor a eliminar
 */
export const deleteDriverAction = (driverId) => ({
  type: DRIVER_ACTIONS.DELETE_DRIVER,
  payload: driverId,
});

/**
 * Acción para establecer el estado de carga
 * @param {boolean} loading - Estado de carga
 */
export const setDriversLoadingAction = (loading) => ({
  type: DRIVER_ACTIONS.SET_LOADING,
  payload: loading,
});

/**
 * Acción para establecer un error
 * @param {string} error - Mensaje de error
 */
export const setDriversErrorAction = (error) => ({
  type: DRIVER_ACTIONS.SET_ERROR,
  payload: error,
});
