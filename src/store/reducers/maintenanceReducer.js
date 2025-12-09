/**
 * Maintenance Reducer
 * Maneja el estado de órdenes de mantenimiento
 */

import { MAINTENANCE_ACTIONS } from '../types';

export const initialMaintenanceState = {
  orders: [],
  filteredOrders: [],
  filters: {
    status: 'all',
    search: '',
  },
  loading: false,
  error: null,
};

export const maintenanceReducer = (state = initialMaintenanceState, action) => {
  switch (action.type) {
    case MAINTENANCE_ACTIONS.SET_ORDERS:
      return {
        ...state,
        orders: action.payload,
        filteredOrders: applyFilters(action.payload, state.filters),
        loading: false,
        error: null,
      };

    case MAINTENANCE_ACTIONS.ADD_ORDER: {
      const orders = [action.payload, ...state.orders];
      return {
        ...state,
        orders,
        filteredOrders: applyFilters(orders, state.filters),
      };
    }

    case MAINTENANCE_ACTIONS.UPDATE_ORDER: {
      const orders = state.orders.map((order) =>
        order.id === action.payload.id ? { ...order, ...action.payload } : order
      );
      return {
        ...state,
        orders,
        filteredOrders: applyFilters(orders, state.filters),
      };
    }

    case MAINTENANCE_ACTIONS.DELETE_ORDER: {
      const orders = state.orders.filter(
        (order) => order.id !== action.payload
      );
      return {
        ...state,
        orders,
        filteredOrders: applyFilters(orders, state.filters),
      };
    }

    case MAINTENANCE_ACTIONS.SET_FILTERS: {
      const filters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters,
        filteredOrders: applyFilters(state.orders, filters),
      };
    }

    case MAINTENANCE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case MAINTENANCE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

function applyFilters(orders, filters) {
  return orders.filter((order) => {
    const matchStatus =
      filters.status === 'all' || order.status === filters.status;
    const searchTerm = (filters.search || '').toLowerCase();
    const title = (order.title || '').toLowerCase();
    const plate = (order.vehiclePlate || '').toLowerCase();
    const description = (order.description || '').toLowerCase();
    const matchSearch =
      !searchTerm ||
      title.includes(searchTerm) ||
      plate.includes(searchTerm) ||
      description.includes(searchTerm);
    return matchStatus && matchSearch;
  });
}
