/**
 * Servicio para gestión de asignaciones de vehículos a conductores
 * Historia de Usuario: HU3 - Asociar vehículos a conductores con fechas y horarios
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Obtiene todas las asignaciones con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} filters.vehicleId - ID del vehículo
 * @param {number} filters.driverId - ID del conductor
 * @param {string} filters.status - Estado de la asignación (active, completed, cancelled)
 * @param {Date} filters.startDate - Fecha de inicio del rango
 * @param {Date} filters.endDate - Fecha de fin del rango
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function getAssignments(filters = {}) {
  try {
    let query = supabase
      .from('vehicle_assignments')
      .select(
        `
        *,
        vehicle:vehicles(id, placa, marca, modelo, status),
        driver:drivers(id, cedula, nombre, apellidos, numero_licencia)
      `
      )
      .order('start_time', { ascending: false });

    // Aplicar filtros
    if (filters.vehicleId) {
      query = query.eq('vehicle_id', filters.vehicleId);
    }

    if (filters.driverId) {
      query = query.eq('driver_id', filters.driverId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('end_time', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene asignaciones activas usando la vista optimizada
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function getActiveAssignments() {
  try {
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .select(
        `
        *,
        vehicles(id, placa, marca, modelo, status),
        drivers(id, cedula, nombre, apellidos, numero_licencia)
      `
      )
      .eq('status', 'active')
      .order('start_time', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener asignaciones activas:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene una asignación por ID
 * @param {number} id - ID de la asignación
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function getAssignmentById(id) {
  try {
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .select(
        `
        *,
        vehicle:vehicles(id, placa, marca, modelo, año, color, status),
        driver:drivers(id, cedula, nombre, apellidos, telefono, email, numero_licencia)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener asignación:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene asignaciones activas de un vehículo usando la función SQL optimizada
 * @param {number} vehicleId - ID del vehículo
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function getActiveAssignmentsByVehicle(vehicleId) {
  try {
    const { data, error } = await supabase.rpc(
      'get_active_assignments_by_vehicle',
      {
        p_vehicle_id: vehicleId,
      }
    );

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener asignaciones del vehículo:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene asignaciones activas de un conductor usando la función SQL optimizada
 * @param {number} driverId - ID del conductor
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function getActiveAssignmentsByDriver(driverId) {
  try {
    const { data, error } = await supabase.rpc(
      'get_active_assignments_by_driver',
      {
        p_driver_id: driverId,
      }
    );

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener asignaciones del conductor:', error);
    return { data: null, error };
  }
}

/**
 * Crea una nueva asignación
 * @param {Object} assignmentData - Datos de la asignación
 * @param {number} assignmentData.vehicleId - ID del vehículo
 * @param {number} assignmentData.driverId - ID del conductor
 * @param {Date} assignmentData.startTime - Fecha y hora de inicio
 * @param {Date} assignmentData.endTime - Fecha y hora de fin
 * @param {string} assignmentData.notes - Notas adicionales (opcional)
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function createAssignment(assignmentData) {
  try {
    // Validaciones del lado del cliente
    if (!assignmentData.vehicleId || !assignmentData.driverId) {
      throw new Error('Vehículo y conductor son requeridos');
    }

    if (!assignmentData.startTime || !assignmentData.endTime) {
      throw new Error('Fechas de inicio y fin son requeridas');
    }

    const startTime = new Date(assignmentData.startTime);
    const endTime = new Date(assignmentData.endTime);

    if (endTime <= startTime) {
      throw new Error(
        'La fecha de fin debe ser posterior a la fecha de inicio'
      );
    }

    // Preparar datos para inserción
    const newAssignment = {
      vehicle_id: assignmentData.vehicleId,
      driver_id: assignmentData.driverId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'active',
      notes: assignmentData.notes || null,
    };

    // Insertar la asignación (el trigger validará solapamientos)
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .insert([newAssignment])
      .select(
        `
        *,
        vehicle:vehicles(id, placa, marca, modelo),
        driver:drivers(id, nombre, apellidos, numero_licencia)
      `
      )
      .single();

    if (error) {
      // Manejar errores de solapamiento con mensajes amigables
      if (error.code === '23P01') {
        throw new Error(
          error.message || 'Ya existe una asignación en este rango de tiempo'
        );
      }
      throw error;
    }

    // Marcar conductor y vehículo como activos al asignar
    const nowIso = new Date().toISOString();
    const [{ error: driverStatusError }, { error: vehicleStatusError }] =
      await Promise.all([
        supabase
          .from('drivers')
          .update({ estado: 'activo', updated_at: nowIso })
          .eq('id', assignmentData.driverId),
        supabase
          .from('vehicles')
          .update({ status: 'activo' })
          .eq('id', assignmentData.vehicleId),
      ]);

    if (driverStatusError) throw driverStatusError;
    if (vehicleStatusError) throw vehicleStatusError;

    return { data, error: null };
  } catch (error) {
    console.error('Error al crear asignación:', error);
    return { data: null, error };
  }
}

/**
 * Actualiza una asignación existente
 * @param {number} id - ID de la asignación
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function updateAssignment(id, updates) {
  try {
    // Validar que existe la asignación
    const { data: existing, error: existingError } = await supabase
      .from('vehicle_assignments')
      .select('status')
      .eq('id', id)
      .single();

    if (existingError) throw existingError;
    if (!existing) throw new Error('Asignación no encontrada');

    // No permitir actualizar asignaciones completadas o canceladas
    if (existing.status !== 'active') {
      throw new Error(
        'No se pueden modificar asignaciones completadas o canceladas'
      );
    }

    // Preparar datos de actualización
    const updateData = {};

    if (updates.startTime) {
      updateData.start_time = new Date(updates.startTime).toISOString();
    }

    if (updates.endTime) {
      updateData.end_time = new Date(updates.endTime).toISOString();
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    // El trigger validará solapamientos automáticamente
    const { data, error } = await supabase
      .from('vehicle_assignments')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        vehicle:vehicles(id, placa, marca, modelo),
        driver:drivers(id, nombre, apellidos, numero_licencia)
      `
      )
      .single();

    if (error) {
      // Manejar errores de solapamiento
      if (error.code === '23P01') {
        throw new Error(
          error.message || 'La actualización crea un solapamiento de horarios'
        );
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    return { data: null, error };
  }
}

/**
 * Completa una asignación usando la función SQL
 * @param {number} id - ID de la asignación
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function completeAssignment(id) {
  try {
    // Obtener datos de la asignación antes de completarla
    const { data: assignment, error: fetchError } = await supabase
      .from('vehicle_assignments')
      .select('id, driver_id, vehicle_id, status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase.rpc('complete_assignment', {
      p_assignment_id: id,
    });

    if (error) throw error;

    // Marcar asignación completada y liberar recursos
    const nowIso = new Date().toISOString();
    const [assignmentUpdate, driverUpdate, vehicleUpdate] = await Promise.all([
      supabase
        .from('vehicle_assignments')
        .update({ status: 'completed' })
        .eq('id', id),
      supabase
        .from('drivers')
        .update({ estado: 'disponible', updated_at: nowIso })
        .eq('id', assignment.driver_id),
      supabase
        .from('vehicles')
        .update({ status: 'estacionado' })
        .eq('id', assignment.vehicle_id),
    ]);

    if (assignmentUpdate.error) throw assignmentUpdate.error;
    if (driverUpdate.error) throw driverUpdate.error;
    if (vehicleUpdate.error) throw vehicleUpdate.error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al completar asignación:', error);
    return { data: null, error };
  }
}

/**
 * Cancela una asignación usando la función SQL
 * @param {number} id - ID de la asignación
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function cancelAssignment(id) {
  try {
    const { data, error } = await supabase.rpc('cancel_assignment', {
      p_assignment_id: id,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al cancelar asignación:', error);
    return { data: null, error };
  }
}

/**
 * Elimina una asignación (solo permitido antes de que inicie)
 * @param {number} id - ID de la asignación
 * @returns {Promise<Object>} Objeto con data y error
 */
export async function deleteAssignment(id) {
  try {
    // Verificar que la asignación no ha iniciado
    const { data: assignment, error: checkError } = await supabase
      .from('vehicle_assignments')
      .select('start_time, status')
      .eq('id', id)
      .single();

    if (checkError) throw checkError;

    if (new Date(assignment.start_time) < new Date()) {
      throw new Error('No se puede eliminar una asignación que ya inició');
    }

    const { data, error } = await supabase
      .from('vehicle_assignments')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    return { data: null, error };
  }
}

/**
 * Verifica si hay conflictos de horario para una asignación
 * Útil para validación en el cliente antes de enviar
 * @param {Object} assignmentData - Datos de la asignación a verificar
 * @returns {Promise<Object>} Objeto con hasConflict y conflicts
 */
export async function checkAssignmentConflicts(assignmentData) {
  try {
    const { vehicleId, driverId, startTime, endTime, excludeId } =
      assignmentData;

    // Verificar conflictos de conductor
    let driverQuery = supabase
      .from('vehicle_assignments')
      .select(
        'id, start_time, end_time, vehicle:vehicles(placa, marca, modelo)'
      )
      .eq('driver_id', driverId)
      .eq('status', 'active')
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (excludeId) {
      driverQuery = driverQuery.neq('id', excludeId);
    }

    const { data: driverConflicts, error: driverError } = await driverQuery;

    if (driverError) throw driverError;

    // Verificar conflictos de vehículo
    let vehicleQuery = supabase
      .from('vehicle_assignments')
      .select('id, start_time, end_time, driver:drivers(nombre, apellidos)')
      .eq('vehicle_id', vehicleId)
      .eq('status', 'active')
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (excludeId) {
      vehicleQuery = vehicleQuery.neq('id', excludeId);
    }

    const { data: vehicleConflicts, error: vehicleError } = await vehicleQuery;

    if (vehicleError) throw vehicleError;

    const hasConflict =
      (driverConflicts && driverConflicts.length > 0) ||
      (vehicleConflicts && vehicleConflicts.length > 0);

    return {
      hasConflict,
      driverConflicts: driverConflicts || [],
      vehicleConflicts: vehicleConflicts || [],
    };
  } catch (error) {
    console.error('Error al verificar conflictos:', error);
    return {
      hasConflict: false,
      driverConflicts: [],
      vehicleConflicts: [],
      error,
    };
  }
}

/**
 * Obtiene estadísticas de asignaciones
 * @returns {Promise<Object>} Estadísticas de asignaciones
 */
export async function getAssignmentStats() {
  try {
    // Total de asignaciones
    const { count: total, error: totalError } = await supabase
      .from('vehicle_assignments')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Asignaciones activas
    const { count: active, error: activeError } = await supabase
      .from('vehicle_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) throw activeError;

    // Asignaciones completadas
    const { count: completed, error: completedError } = await supabase
      .from('vehicle_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (completedError) throw completedError;

    // Asignaciones canceladas
    const { count: cancelled, error: cancelledError } = await supabase
      .from('vehicle_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    if (cancelledError) throw cancelledError;

    return {
      total: total || 0,
      active: active || 0,
      completed: completed || 0,
      cancelled: cancelled || 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { total: 0, active: 0, completed: 0, cancelled: 0, error };
  }
}

export default {
  getAssignments,
  getActiveAssignments,
  getAssignmentById,
  getActiveAssignmentsByVehicle,
  getActiveAssignmentsByDriver,
  createAssignment,
  updateAssignment,
  completeAssignment,
  cancelAssignment,
  deleteAssignment,
  checkAssignmentConflicts,
  getAssignmentStats,
};
