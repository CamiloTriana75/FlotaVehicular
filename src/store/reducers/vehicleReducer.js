/**
 * Vehicle Reducer
 * Maneja el estado de los vehículos de la flota
 */

import { VEHICLE_ACTIONS } from '../types';

export const initialVehicleState = {
  vehicles: [],
  filteredVehicles: [],
  selectedVehicle: null,
  filters: {
    status: 'all',
    searchTerm: '',
  },
  loading: false,
  error: null,
};

/**
 * Reducer de vehículos
 * @param {Object} state - Estado actual
 * @param {Object} action - Acción a ejecutar
 * @returns {Object} Nuevo estado
 */
export const vehicleReducer = (state = initialVehicleState, action) => {
  switch (action.type) {
    case VEHICLE_ACTIONS.SET_VEHICLES:
      return {
        ...state,
        vehicles: action.payload,
        filteredVehicles: action.payload,
        loading: false,
        error: null,
      };

    case VEHICLE_ACTIONS.ADD_VEHICLE:
      const newVehicles = [...state.vehicles, action.payload];
      return {
        ...state,
        vehicles: newVehicles,
        filteredVehicles: newVehicles,
      };

    case VEHICLE_ACTIONS.UPDATE_VEHICLE:
      const updatedVehicles = state.vehicles.map((vehicle) =>
        vehicle.id === action.payload.id ? action.payload : vehicle
      );
      return {
        ...state,
        vehicles: updatedVehicles,
        filteredVehicles: updatedVehicles,
      };

    case VEHICLE_ACTIONS.DELETE_VEHICLE:
      const remainingVehicles = state.vehicles.filter(
        (vehicle) => vehicle.id !== action.payload
      );
      return {
        ...state,
        vehicles: remainingVehicles,
        filteredVehicles: remainingVehicles,
      };

    case VEHICLE_ACTIONS.FILTER_VEHICLES:
      const { status, searchTerm } = action.payload;
      let filtered = [...state.vehicles];

      if (status && status !== 'all') {
        filtered = filtered.filter((v) => v.status === status);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (v) =>
            v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return {
        ...state,
        filteredVehicles: filtered,
        filters: action.payload,
      };

    case VEHICLE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case VEHICLE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};
