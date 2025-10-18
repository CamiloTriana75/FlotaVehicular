/**
 * App Context
 * Context principal de la aplicación que proporciona el estado global
 * y las funciones dispatch a todos los componentes
 */

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { rootReducer, initialState } from '../reducers';
import { AUTH_ACTIONS, VEHICLE_ACTIONS, DRIVER_ACTIONS } from '../types';
import { mockVehicles, mockDrivers } from '../../data/mockVehicles';

const AppContext = createContext();

/**
 * Provider del contexto de la aplicación
 * Implementa el patrón de arquitectura unidireccional de datos
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Inicializar datos mock al montar el componente
  useEffect(() => {
    // Cargar usuario de localStorage si existe
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN,
        payload: {
          user: JSON.parse(savedUser),
          isMockMode: true,
        },
      });
    }

    // Cargar vehículos mock
    dispatch({
      type: VEHICLE_ACTIONS.SET_VEHICLES,
      payload: mockVehicles,
    });

    // Cargar conductores mock
    dispatch({
      type: DRIVER_ACTIONS.SET_DRIVERS,
      payload: mockDrivers,
    });
  }, []);

  const value = {
    state,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook personalizado para acceder al contexto de la aplicación
 * @returns {Object} Estado y dispatch de la aplicación
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider');
  }
  return context;
};

export default AppContext;
