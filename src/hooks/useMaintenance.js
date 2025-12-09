/**
 * Hook personalizado para gestionar órdenes de mantenimiento
 */

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../store';
import {
  addMaintenanceOrderAction,
  deleteMaintenanceOrderAction,
  setMaintenanceFiltersAction,
  updateMaintenanceOrderAction,
  setMaintenanceOrdersAction,
  setMaintenanceLoadingAction,
  setMaintenanceErrorAction,
} from '../store/actions/maintenanceActions';
import { withMaintenanceTotals } from '../store/utils/maintenanceTotals';
import {
  createMaintenanceOrder,
  updateMaintenanceOrder,
  deleteMaintenanceOrder,
  getMaintenanceOrders,
} from '../services/maintenanceService';

export const useMaintenance = () => {
  const { state, dispatch } = useAppContext();
  const { maintenance } = state;

  const addOrder = useCallback(
    async (orderInput) => {
      try {
        dispatch(setMaintenanceLoadingAction(true));

        // Preparar datos para enviar a Supabase
        const orderData = {
          vehicleId: orderInput.vehicleId,
          title: orderInput.title,
          description: orderInput.description,
          type: orderInput.type || 'preventivo',
          status: orderInput.status || 'programada',
          scheduledDate: orderInput.scheduledDate,
          executionDate: orderInput.executionDate,
          mileage: orderInput.mileage,
          laborHours: orderInput.laborHours || 0,
          laborRate: orderInput.laborRate || 0,
          otherCosts: orderInput.otherCosts || 0,
          notes: orderInput.notes,
        };

        const parts = orderInput.parts || [];

        // Crear orden en Supabase
        const { data: newOrder, error } = await createMaintenanceOrder(
          orderData,
          parts
        );

        if (error) throw error;

        // Mapear datos al formato esperado
        const mappedOrder = {
          id: newOrder.id,
          orderNumber: newOrder.order_number,
          vehicleId: newOrder.vehicle_id,
          vehicle: newOrder.vehicle,
          title: newOrder.title,
          description: newOrder.description,
          type: newOrder.type,
          status: newOrder.status,
          scheduledDate: newOrder.scheduled_date,
          executionDate: newOrder.execution_date,
          mileage: newOrder.mileage,
          laborHours: parseFloat(newOrder.labor_hours) || 0,
          laborRate: parseFloat(newOrder.labor_rate) || 0,
          otherCosts: parseFloat(newOrder.other_costs) || 0,
          totalCost: parseFloat(newOrder.total_cost) || 0,
          notes: newOrder.notes,
          parts:
            newOrder.parts?.map((p) => ({
              id: p.id,
              name: p.part_name,
              partNumber: p.part_number,
              quantity: p.quantity,
              unitCost: parseFloat(p.unit_cost),
              supplier: p.supplier,
              notes: p.notes,
            })) || [],
          attachments: newOrder.attachments || [],
          createdAt: newOrder.created_at,
        };

        dispatch(addMaintenanceOrderAction(mappedOrder));
        dispatch(setMaintenanceLoadingAction(false));

        return { success: true, data: mappedOrder };
      } catch (error) {
        console.error('Error al crear orden:', error);
        dispatch(setMaintenanceErrorAction(error.message));
        dispatch(setMaintenanceLoadingAction(false));
        return { success: false, error: error.message };
      }
    },
    [dispatch]
  );

  const updateOrder = useCallback(
    async (id, updates) => {
      try {
        dispatch(setMaintenanceLoadingAction(true));

        const { data: updatedOrder, error } = await updateMaintenanceOrder(
          id,
          updates
        );

        if (error) throw error;

        const existing = maintenance.orders.find((o) => o.id === id);
        const merged = withMaintenanceTotals({ ...existing, ...updates });

        dispatch(updateMaintenanceOrderAction(merged));
        dispatch(setMaintenanceLoadingAction(false));

        return { success: true, data: merged };
      } catch (error) {
        console.error('Error al actualizar orden:', error);
        dispatch(setMaintenanceErrorAction(error.message));
        dispatch(setMaintenanceLoadingAction(false));
        return { success: false, error: error.message };
      }
    },
    [dispatch, maintenance.orders]
  );

  const deleteOrder = useCallback(
    async (id) => {
      try {
        dispatch(setMaintenanceLoadingAction(true));

        const { error } = await deleteMaintenanceOrder(id);

        if (error) throw error;

        dispatch(deleteMaintenanceOrderAction(id));
        dispatch(setMaintenanceLoadingAction(false));

        return { success: true };
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        dispatch(setMaintenanceErrorAction(error.message));
        dispatch(setMaintenanceLoadingAction(false));
        return { success: false, error: error.message };
      }
    },
    [dispatch]
  );

  const refreshOrders = useCallback(async () => {
    try {
      dispatch(setMaintenanceLoadingAction(true));

      const { data: ordersData, error } = await getMaintenanceOrders();

      if (error) throw error;

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

      dispatch(setMaintenanceOrdersAction(mappedOrders));
      dispatch(setMaintenanceLoadingAction(false));
    } catch (error) {
      console.error('Error al refrescar órdenes:', error);
      dispatch(setMaintenanceErrorAction(error.message));
      dispatch(setMaintenanceLoadingAction(false));
    }
  }, [dispatch]);

  const setFilters = useCallback(
    (filters) => dispatch(setMaintenanceFiltersAction(filters)),
    [dispatch]
  );

  const totalsByVehicle = useMemo(() => {
    return maintenance.orders.reduce((acc, order) => {
      const total = order.totalCost ?? 0;
      acc[order.vehicleId] = (acc[order.vehicleId] || 0) + total;
      return acc;
    }, {});
  }, [maintenance.orders]);

  const getHistoryByVehicle = useCallback(
    (vehicleId) => maintenance.orders.filter((o) => o.vehicleId === vehicleId),
    [maintenance.orders]
  );

  return {
    orders: maintenance.orders,
    filteredOrders: maintenance.filteredOrders,
    filters: maintenance.filters,
    loading: maintenance.loading,
    error: maintenance.error,
    addOrder,
    updateOrder,
    deleteOrder,
    setFilters,
    refreshOrders,
    totalsByVehicle,
    getHistoryByVehicle,
  };
};
