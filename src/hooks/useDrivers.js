/**
 * Hook personalizado para manejo de conductores
 * Proporciona acceso al estado de conductores y funciones CRUD
 */

import { useCallback } from 'react';
import { useAppContext } from '../store';
import {
  addDriverAction,
  updateDriverAction,
  deleteDriverAction,
} from '../store/actions/driverActions';

/**
 * Hook de conductores
 * @returns {Object} Estado y funciones para manejo de conductores
 */
export const useDrivers = () => {
  const { state, dispatch } = useAppContext();
  const { drivers } = state;

  /**
   * Agregar un nuevo conductor
   * @param {Object} driver - Datos del conductor
   */
  const addDriver = useCallback(
    (driver) => {
      const newDriver = {
        ...driver,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch(addDriverAction(newDriver));
      return newDriver;
    },
    [dispatch]
  );

  /**
   * Actualizar un conductor existente
   * @param {string} id - ID del conductor
   * @param {Object} updates - Datos a actualizar
   */
  const updateDriver = useCallback(
    (id, updates) => {
      const driver = drivers.drivers.find((d) => d.id === id);
      if (driver) {
        const updatedDriver = {
          ...driver,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        dispatch(updateDriverAction(updatedDriver));
        return updatedDriver;
      }
      return null;
    },
    [dispatch, drivers.drivers]
  );

  /**
   * Eliminar un conductor
   * @param {string} id - ID del conductor a eliminar
   */
  const deleteDriver = useCallback(
    (id) => {
      dispatch(deleteDriverAction(id));
    },
    [dispatch]
  );

  /**
   * Obtener un conductor por ID
   * @param {string} id - ID del conductor
   */
  const getDriverById = useCallback(
    (id) => {
      return drivers.drivers.find((d) => d.id === id);
    },
    [drivers.drivers]
  );

  /**
   * Obtener conductores activos
   */
  const getActiveDrivers = useCallback(() => {
    return drivers.drivers.filter((d) => d.estado === 'activo');
  }, [drivers.drivers]);

  /**
   * Obtener estadísticas de conductores
   */
  const getDriverStats = useCallback(() => {
    const total = drivers.drivers.length;
    const active = drivers.drivers.filter((d) => d.estado === 'activo').length;
    const onTrip = drivers.drivers.filter(
      (d) => d.estado === 'en_viaje'
    ).length;
    const resting = drivers.drivers.filter(
      (d) => d.estado === 'descansando'
    ).length;

    return {
      total,
      active,
      onTrip,
      resting,
      activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
    };
  }, [drivers.drivers]);

  return {
    drivers: drivers.drivers,
    loading: drivers.loading,
    error: drivers.error,
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    getActiveDrivers,
    getDriverStats,
  };
};
