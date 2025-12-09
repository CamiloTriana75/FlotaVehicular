/**
 * Action Creators para el módulo de mantenimiento
 */

import { MAINTENANCE_ACTIONS } from '../types';

/**
 * Establece la lista completa de órdenes de mantenimiento
 * @param {Array} orders
 */
export const setMaintenanceOrdersAction = (orders) => ({
  type: MAINTENANCE_ACTIONS.SET_ORDERS,
  payload: orders,
});

/**
 * Agrega una nueva orden de mantenimiento
 * @param {Object} order
 */
export const addMaintenanceOrderAction = (order) => ({
  type: MAINTENANCE_ACTIONS.ADD_ORDER,
  payload: order,
});

/**
 * Actualiza una orden existente
 * @param {Object} order
 */
export const updateMaintenanceOrderAction = (order) => ({
  type: MAINTENANCE_ACTIONS.UPDATE_ORDER,
  payload: order,
});

/**
 * Elimina una orden de mantenimiento
 * @param {string|number} orderId
 */
export const deleteMaintenanceOrderAction = (orderId) => ({
  type: MAINTENANCE_ACTIONS.DELETE_ORDER,
  payload: orderId,
});

/**
 * Aplica filtros de estado y búsqueda
 * @param {{status?: string, search?: string}} filters
 */
export const setMaintenanceFiltersAction = (filters) => ({
  type: MAINTENANCE_ACTIONS.SET_FILTERS,
  payload: filters,
});

/**
 * Estado de carga
 * @param {boolean} loading
 */
export const setMaintenanceLoadingAction = (loading) => ({
  type: MAINTENANCE_ACTIONS.SET_LOADING,
  payload: loading,
});

/**
 * Manejo de errores
 * @param {string|null} error
 */
export const setMaintenanceErrorAction = (error) => ({
  type: MAINTENANCE_ACTIONS.SET_ERROR,
  payload: error,
});
