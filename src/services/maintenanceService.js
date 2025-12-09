/**
 * Servicio para gestión de órdenes de mantenimiento
 * Maneja CRUD de órdenes, partes y adjuntos
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Obtener todas las órdenes de mantenimiento con información de vehículos
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de órdenes
 */
export const getMaintenanceOrders = async (filters = {}) => {
  try {
    const selectBase = `
      *,
      vehicle:vehicles(*),
      mechanic:usuario(id_usuario, username, email)
    `;

    const buildQuery = () => {
      return supabase
        .from('maintenance_orders')
        .select(selectBase)
        .order('created_at', { ascending: false });
    };

    let query = buildQuery();

    // Aplicar filtros (asegurar tipos enteros para vehicle_id)
    if (filters.vehicleId) {
      query = query.eq('vehicle_id', Number(filters.vehicleId));
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.mechanicId) {
      query = query.eq('mechanic_id', filters.mechanicId);
    }

    // Primer intento (vehicles)
    let { data, error } = await query;

    // Si la tabla no existe aún (PGRST205 / 404), devolvemos arreglo vacío para no romper la UI
    if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
      return { data: [], error: null };
    }
    if (error) throw error;

    // Obtener partes para cada orden
    const ordersWithParts = await Promise.all(
      data.map(async (order) => {
        const { data: parts } = await supabase
          .from('maintenance_parts')
          .select('*')
          .eq('maintenance_order_id', order.id);

        const { data: attachments } = await supabase
          .from('maintenance_attachments')
          .select('*')
          .eq('maintenance_order_id', order.id);

        return {
          ...order,
          parts: parts || [],
          attachments: attachments || [],
        };
      })
    );

    return { data: ordersWithParts, error: null };
  } catch (error) {
    console.error('Error al obtener órdenes de mantenimiento:', error);
    return { data: null, error };
  }
};

/**
 * Obtener una orden de mantenimiento por ID
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Orden de mantenimiento
 */
export const getMaintenanceOrderById = async (orderId) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('maintenance_orders')
      .select(
        `
        *,
        vehicle:vehicles(*),
        mechanic:usuario(id_usuario, username, email)
      `
      )
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: parts } = await supabase
      .from('maintenance_parts')
      .select('*')
      .eq('maintenance_order_id', orderId);

    const { data: attachments } = await supabase
      .from('maintenance_attachments')
      .select('*')
      .eq('maintenance_order_id', orderId);

    return {
      data: {
        ...order,
        parts: parts || [],
        attachments: attachments || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Error al obtener orden de mantenimiento:', error);
    return { data: null, error };
  }
};

/**
 * Crear una nueva orden de mantenimiento con partes
 * @param {Object} orderData - Datos de la orden
 * @param {Array} parts - Lista de partes/repuestos
 * @returns {Promise<Object>} Orden creada
 */
export const createMaintenanceOrder = async (orderData, parts = []) => {
  try {
    // Obtener el usuario actual
    const currentUser = localStorage.getItem('currentUser');
    const user = currentUser ? JSON.parse(currentUser) : null;

    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('maintenance_orders')
      .insert([
        {
          vehicle_id: orderData.vehicleId,
          mechanic_id: user?.id_usuario,
          title: orderData.title,
          description: orderData.description,
          type: orderData.type || 'preventivo',
          status: orderData.status || 'programada',
          scheduled_date: orderData.scheduledDate,
          execution_date: orderData.executionDate,
          mileage: orderData.mileage,
          labor_hours: orderData.laborHours || 0,
          labor_rate: orderData.laborRate || 0,
          other_costs: orderData.otherCosts || 0,
          notes: orderData.notes,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insertar las partes si existen
    if (parts && parts.length > 0) {
      const partsToInsert = parts.map((part) => ({
        maintenance_order_id: order.id,
        part_name: part.name,
        part_number: part.partNumber,
        quantity: part.quantity || 1,
        unit_cost: part.unitCost || 0,
        supplier: part.supplier,
        notes: part.notes,
      }));

      const { error: partsError } = await supabase
        .from('maintenance_parts')
        .insert(partsToInsert);

      if (partsError) throw partsError;
    }

    // Obtener la orden completa con partes
    return await getMaintenanceOrderById(order.id);
  } catch (error) {
    console.error('Error al crear orden de mantenimiento:', error);
    return { data: null, error };
  }
};

/**
 * Actualizar una orden de mantenimiento
 * @param {string} orderId - ID de la orden
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Orden actualizada
 */
export const updateMaintenanceOrder = async (orderId, updates) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .update({
        title: updates.title,
        description: updates.description,
        type: updates.type,
        status: updates.status,
        scheduled_date: updates.scheduledDate,
        execution_date: updates.executionDate,
        completion_date: updates.completionDate,
        mileage: updates.mileage,
        labor_hours: updates.laborHours,
        labor_rate: updates.laborRate,
        other_costs: updates.otherCosts,
        notes: updates.notes,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar orden de mantenimiento:', error);
    return { data: null, error };
  }
};

/**
 * Eliminar una orden de mantenimiento
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Resultado de la operación
 */
export const deleteMaintenanceOrder = async (orderId) => {
  try {
    const { error } = await supabase
      .from('maintenance_orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar orden de mantenimiento:', error);
    return { success: false, error };
  }
};

/**
 * Agregar una parte a una orden existente
 * @param {string} orderId - ID de la orden
 * @param {Object} part - Datos de la parte
 * @returns {Promise<Object>} Parte creada
 */
export const addPartToOrder = async (orderId, part) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_parts')
      .insert([
        {
          maintenance_order_id: orderId,
          part_name: part.name,
          part_number: part.partNumber,
          quantity: part.quantity || 1,
          unit_cost: part.unitCost || 0,
          supplier: part.supplier,
          notes: part.notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al agregar parte:', error);
    return { data: null, error };
  }
};

/**
 * Eliminar una parte de una orden
 * @param {string} partId - ID de la parte
 * @returns {Promise<Object>} Resultado de la operación
 */
export const deletePart = async (partId) => {
  try {
    const { error } = await supabase
      .from('maintenance_parts')
      .delete()
      .eq('id', partId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar parte:', error);
    return { success: false, error };
  }
};

/**
 * Subir un archivo adjunto
 * @param {string} orderId - ID de la orden
 * @param {File} file - Archivo a subir
 * @param {string} description - Descripción del archivo
 * @returns {Promise<Object>} Adjunto creado
 */
export const uploadAttachment = async (orderId, file, description = '') => {
  try {
    const currentUser = localStorage.getItem('currentUser');
    const user = currentUser ? JSON.parse(currentUser) : null;

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}/${Date.now()}.${fileExt}`;

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('maintenance-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('maintenance-attachments')
      .getPublicUrl(fileName);

    // Guardar referencia en la base de datos
    const { data, error } = await supabase
      .from('maintenance_attachments')
      .insert([
        {
          maintenance_order_id: orderId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: urlData.publicUrl,
          description: description,
          uploaded_by: user?.id_usuario,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al subir adjunto:', error);
    return { data: null, error };
  }
};

/**
 * Obtener historial de mantenimiento de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<Array>} Historial de órdenes
 */
export const getVehicleMaintenanceHistory = async (vehicleId) => {
  return await getMaintenanceOrders({ vehicleId });
};

/**
 * Obtener estadísticas de mantenimiento por vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<Object>} Estadísticas
 */
export const getVehicleMaintenanceStats = async (vehicleId) => {
  try {
    const { data: orders, error } = await getMaintenanceOrders({ vehicleId });

    if (error) throw error;

    const stats = {
      totalOrders: orders.length,
      totalCost: orders.reduce(
        (sum, order) => sum + parseFloat(order.total_cost || 0),
        0
      ),
      byStatus: {
        programada: orders.filter((o) => o.status === 'programada').length,
        en_proceso: orders.filter((o) => o.status === 'en_proceso').length,
        completada: orders.filter((o) => o.status === 'completada').length,
        cancelada: orders.filter((o) => o.status === 'cancelada').length,
      },
      byType: {
        preventivo: orders.filter((o) => o.type === 'preventivo').length,
        correctivo: orders.filter((o) => o.type === 'correctivo').length,
        predictivo: orders.filter((o) => o.type === 'predictivo').length,
      },
      lastMaintenance: orders[0], // La más reciente
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { data: null, error };
  }
};
