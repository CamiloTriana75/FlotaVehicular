/**
 * Driver Reducer
 * Maneja el estado de los conductores
 */

import { DRIVER_ACTIONS } from '../types';

export const initialDriverState = {
  drivers: [],
  selectedDriver: null,
  loading: false,
  error: null,
};

/**
 * Reducer de conductores
 * @param {Object} state - Estado actual
 * @param {Object} action - Acción a ejecutar
 * @returns {Object} Nuevo estado
 */
export const driverReducer = (state = initialDriverState, action) => {
  switch (action.type) {
    case DRIVER_ACTIONS.SET_DRIVERS:
      return {
        ...state,
        drivers: action.payload,
        loading: false,
        error: null,
      };

    case DRIVER_ACTIONS.ADD_DRIVER:
      return {
        ...state,
        drivers: [...state.drivers, action.payload],
      };

    case DRIVER_ACTIONS.UPDATE_DRIVER:
      return {
        ...state,
        drivers: state.drivers.map((driver) =>
          driver.id === action.payload.id ? action.payload : driver
        ),
      };

    case DRIVER_ACTIONS.DELETE_DRIVER:
      return {
        ...state,
        drivers: state.drivers.filter((driver) => driver.id !== action.payload),
      };

    case DRIVER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case DRIVER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};
