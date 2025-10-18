/**
 * Root Reducer
 * Combina todos los reducers de la aplicación
 */

import { authReducer, initialAuthState } from './authReducer';
import { vehicleReducer, initialVehicleState } from './vehicleReducer';
import { driverReducer, initialDriverState } from './driverReducer';

/**
 * Estado inicial de la aplicación
 */
export const initialState = {
  auth: initialAuthState,
  vehicles: initialVehicleState,
  drivers: initialDriverState,
};

/**
 * Root Reducer que combina todos los reducers
 * @param {Object} state - Estado actual de la aplicación
 * @param {Object} action - Acción a ejecutar
 * @returns {Object} Nuevo estado de la aplicación
 */
export const rootReducer = (state = initialState, action) => {
  return {
    auth: authReducer(state.auth, action),
    vehicles: vehicleReducer(state.vehicles, action),
    drivers: driverReducer(state.drivers, action),
  };
};
