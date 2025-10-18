/**
 * Hook personalizado para manejo de autenticación
 * Proporciona funcionalidades de login, logout y acceso al estado de autenticación
 */

import { useCallback } from 'react';
import { useAppContext } from '../store';
import { loginAction, logoutAction } from '../store/actions/authActions';

/**
 * Hook de autenticación
 * @returns {Object} Estado y funciones de autenticación
 */
export const useAuth = () => {
  const { state, dispatch } = useAppContext();
  const { auth } = state;

  /**
   * Función para realizar login
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   */
  const login = useCallback(
    async (email, password) => {
      return await loginAction(email, password)(dispatch);
    },
    [dispatch]
  );

  /**
   * Función para realizar logout
   */
  const logout = useCallback(async () => {
    return await logoutAction()(dispatch);
  }, [dispatch]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isMockMode: auth.isMockMode,
    loading: auth.loading,
    error: auth.error,
    login,
    logout,
  };
};
