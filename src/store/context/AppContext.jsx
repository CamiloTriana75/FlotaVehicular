/**
 * App Context
 * Context principal de la aplicación que proporciona el estado global
 * y las funciones dispatch a todos los componentes
 */

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { rootReducer, initialState } from '../reducers';
import {
  AUTH_ACTIONS,
  VEHICLE_ACTIONS,
  DRIVER_ACTIONS,
  MAINTENANCE_ACTIONS,
} from '../types';
import { mockVehicles, mockDrivers } from '../../data/mockVehicles';
import { mockMaintenanceOrders } from '../../data/mockMaintenance';
import { calculateMaintenanceTotals } from '../utils/maintenanceTotals';
import { supabase } from '../../lib/supabaseClient';
import { getMaintenanceOrders } from '../../services/maintenanceService';

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

  // Inicializar datos al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
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

      // Cargar vehículos desde Supabase (intenta tabla nueva `vehicles`, luego legacy `vehiculo`)
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');

        if (!vehiclesError && vehiclesData && vehiclesData.length > 0) {
          const mappedVehicles = vehiclesData.map((v) => ({
            id: v.id,
            plate: v.plate_number || v.placa,
            brand: v.brand || v.marca,
            model: v.model || v.modelo,
            year: v.year || v.anio,
            color: v.color,
            vin: v.vin,
            fuelType: v.fuel_type || v.tipo_combustible,
            status: v.status,
            mileage: v.current_mileage || v.kilometraje_actual,
            lastMaintenance:
              v.last_maintenance_date || v.ultima_fecha_mantenimiento,
            nextMaintenance:
              v.next_maintenance_date || v.proxima_fecha_mantenimiento,
            driverId: v.current_driver_id || v.id_conductor,
          }));

          dispatch({
            type: VEHICLE_ACTIONS.SET_VEHICLES,
            payload: mappedVehicles,
          });
        } else {
          dispatch({
            type: VEHICLE_ACTIONS.SET_VEHICLES,
            payload: mockVehicles,
          });
        }
      } catch (error) {
        console.error('Error al cargar vehículos:', error);
        dispatch({
          type: VEHICLE_ACTIONS.SET_VEHICLES,
          payload: mockVehicles,
        });
      }

      // Cargar conductores mock
      dispatch({
        type: DRIVER_ACTIONS.SET_DRIVERS,
        payload: mockDrivers,
      });

      // Cargar órdenes de mantenimiento desde Supabase
      try {
        const { data: ordersData, error: ordersError } =
          await getMaintenanceOrders();

        if (!ordersError && ordersData && ordersData.length > 0) {
          const mappedOrders = ordersData.map((order) => ({
            id: order.id,
            orderNumber: order.order_number,
            vehicleId: order.vehicle_id,
            vehicle: order.vehicle,
            title: order.title,
            description: order.description,
            type: order.type,
            status: order.status,
            scheduledDate: order.scheduled_date,
            executionDate: order.execution_date,
            completionDate: order.completion_date,
            mileage: order.mileage,
            laborHours: parseFloat(order.labor_hours) || 0,
            laborRate: parseFloat(order.labor_rate) || 0,
            otherCosts: parseFloat(order.other_costs) || 0,
            totalCost: parseFloat(order.total_cost) || 0,
            notes: order.notes,
            parts:
              order.parts?.map((p) => ({
                id: p.id,
                name: p.part_name,
                partNumber: p.part_number,
                quantity: p.quantity,
                unitCost: parseFloat(p.unit_cost),
                supplier: p.supplier,
                notes: p.notes,
              })) || [],
            attachments: order.attachments || [],
            createdAt: order.created_at,
          }));

          dispatch({
            type: MAINTENANCE_ACTIONS.SET_ORDERS,
            payload: mappedOrders,
          });
        } else {
          const storedMaintenance = localStorage.getItem('mockMaintenance');
          const maintenanceRaw = storedMaintenance
            ? JSON.parse(storedMaintenance)
            : mockMaintenanceOrders;
          const maintenanceData = calculateMaintenanceTotals(maintenanceRaw);
          dispatch({
            type: MAINTENANCE_ACTIONS.SET_ORDERS,
            payload: maintenanceData,
          });
        }
      } catch (error) {
        console.error('Error al cargar órdenes de mantenimiento:', error);
        const storedMaintenance = localStorage.getItem('mockMaintenance');
        const maintenanceRaw = storedMaintenance
          ? JSON.parse(storedMaintenance)
          : mockMaintenanceOrders;
        const maintenanceData = calculateMaintenanceTotals(maintenanceRaw);
        dispatch({
          type: MAINTENANCE_ACTIONS.SET_ORDERS,
          payload: maintenanceData,
        });
      }
    };

    loadInitialData();
  }, []);

  // Persistir órdenes de mantenimiento en localStorage para mantener historial
  useEffect(() => {
    if (state?.maintenance?.orders) {
      localStorage.setItem(
        'mockMaintenance',
        JSON.stringify(state.maintenance.orders)
      );
    }
  }, [state?.maintenance?.orders]);

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
