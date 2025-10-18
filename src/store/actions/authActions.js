/**
 * Action Creators para el módulo de autenticación
 * Encapsula la lógica de creación de acciones
 */

import { AUTH_ACTIONS } from '../types';
import { mockAuth } from '../../lib/supabaseClient';

/**
 * Acción para realizar login
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Function} Thunk function
 */
export const loginAction = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    const { data, error } = await mockAuth.signIn(email, password);

    if (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }

    // Guardar usuario en localStorage
    localStorage.setItem('mockUser', JSON.stringify(data.user));

    dispatch({
      type: AUTH_ACTIONS.LOGIN,
      payload: {
        user: data.user,
        isMockMode: true,
      },
    });

    return { success: true };
  } catch (error) {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Acción para realizar logout
 * @returns {Function} Thunk function
 */
export const logoutAction = () => async (dispatch) => {
  try {
    await mockAuth.signOut();
    localStorage.removeItem('mockUser');

    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    return { success: true };
  } catch (error) {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Acción para establecer el usuario
 * @param {Object} user - Objeto de usuario
 */
export const setUserAction = (user) => ({
  type: AUTH_ACTIONS.SET_USER,
  payload: user,
});
