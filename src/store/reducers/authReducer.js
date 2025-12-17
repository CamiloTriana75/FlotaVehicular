/**
 * Auth Reducer
 * Maneja el estado de autenticación de la aplicación
 */

import { AUTH_ACTIONS } from '../types';

export const initialAuthState = {
  user: null,
  isAuthenticated: false,
  isMockMode: false,
  loading: false,
  error: null,
};

/**
 * Reducer de autenticación
 * @param {Object} state - Estado actual
 * @param {Object} action - Acción a ejecutar
 * @returns {Object} Nuevo estado
 */
export const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isMockMode: action.payload.isMockMode || false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};
