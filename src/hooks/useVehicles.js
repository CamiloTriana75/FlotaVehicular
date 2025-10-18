/**
 * Hook personalizado para manejo de vehículos
 * Proporciona acceso al estado de vehículos y funciones CRUD
 */

import { useCallback } from 'react';
import { useAppContext } from '../store';
import {
  addVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
  filterVehiclesAction,
} from '../store/actions/vehicleActions';

/**
 * Hook de vehículos
 * @returns {Object} Estado y funciones para manejo de vehículos
 */
export const useVehicles = () => {
  const { state, dispatch } = useAppContext();
  const { vehicles } = state;

  /**
   * Agregar un nuevo vehículo
   * @param {Object} vehicle - Datos del vehículo
   */
  const addVehicle = useCallback(
    (vehicle) => {
      const newVehicle = {
        ...vehicle,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch(addVehicleAction(newVehicle));
      return newVehicle;
    },
    [dispatch]
  );

  /**
   * Actualizar un vehículo existente
   * @param {string} id - ID del vehículo
   * @param {Object} updates - Datos a actualizar
   */
  const updateVehicle = useCallback(
    (id, updates) => {
      const vehicle = vehicles.vehicles.find((v) => v.id === id);
      if (vehicle) {
        const updatedVehicle = {
          ...vehicle,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        dispatch(updateVehicleAction(updatedVehicle));
        return updatedVehicle;
      }
      return null;
    },
    [dispatch, vehicles.vehicles]
  );

  /**
   * Eliminar un vehículo
   * @param {string} id - ID del vehículo a eliminar
   */
  const deleteVehicle = useCallback(
    (id) => {
      dispatch(deleteVehicleAction(id));
    },
    [dispatch]
  );

  /**
   * Filtrar vehículos
   * @param {Object} filters - Filtros a aplicar
   */
  const filterVehicles = useCallback(
    (filters) => {
      dispatch(filterVehiclesAction(filters));
    },
    [dispatch]
  );

  /**
   * Obtener un vehículo por ID
   * @param {string} id - ID del vehículo
   */
  const getVehicleById = useCallback(
    (id) => {
      return vehicles.vehicles.find((v) => v.id === id);
    },
    [vehicles.vehicles]
  );

  /**
   * Obtener vehículos por estado
   * @param {string} status - Estado del vehículo
   */
  const getVehiclesByStatus = useCallback(
    (status) => {
      return vehicles.vehicles.filter((v) => v.status === status);
    },
    [vehicles.vehicles]
  );

  /**
   * Obtener estadísticas de vehículos
   */
  const getVehicleStats = useCallback(() => {
    const total = vehicles.vehicles.length;
    const active = vehicles.vehicles.filter((v) => v.status === 'activo').length;
    const maintenance = vehicles.vehicles.filter(
      (v) => v.status === 'mantenimiento'
    ).length;
    const parked = vehicles.vehicles.filter(
      (v) => v.status === 'estacionado'
    ).length;

    return {
      total,
      active,
      maintenance,
      parked,
      activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
    };
  }, [vehicles.vehicles]);

  return {
    vehicles: vehicles.vehicles,
    filteredVehicles: vehicles.filteredVehicles,
    filters: vehicles.filters,
    loading: vehicles.loading,
    error: vehicles.error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    filterVehicles,
    getVehicleById,
    getVehiclesByStatus,
    getVehicleStats,
  };
};
