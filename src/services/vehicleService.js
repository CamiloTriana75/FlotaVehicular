/**
 * Servicio para operaciones CRUD de vehículos en la tabla 'vehicles'
 *
 * Este servicio maneja la persistencia de vehículos en Supabase,
 * usando la tabla estandarizada 'vehicles' con columnas en español.
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Crea un nuevo vehículo desde los datos del formulario
 * @param {Object} formData - Datos del formulario (puede incluir nombres en camelCase)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createFromForm = async (formData) => {
  try {
    // Mapear campos del formulario a las columnas de la BD
    // NOTA: El esquema actual solo tiene estos campos (ver white_temple.sql):
    // placa, modelo, año, marca, color, numero_chasis, numero_motor,
    // capacidad_combustible, kilometraje, status, fecha_compra,
    // fecha_ultimo_mantenimiento, proximo_mantenimiento_km
    const vehicleData = {
      placa: formData.placa?.trim(),
      marca: formData.marca?.trim(),
      modelo: formData.modelo?.trim(),
      año: formData.anio || formData.año, // Soportar ambas variantes
      color: formData.color?.trim(),
      numero_chasis: formData.vin?.trim() || null, // VIN → numero_chasis
      numero_motor: formData.numeroMotor?.trim() || null,
      capacidad_combustible: formData.capacidad || null, // capacidad → capacidad_combustible
      kilometraje: formData.kilometraje || 0,
      status: formData.estado || 'activo', // estado → status
      fecha_compra: formData.fechaCompra || null,
      fecha_ultimo_mantenimiento: formData.fechaUltimoMantenimiento || null,
      proximo_mantenimiento_km: formData.proximoMantenimientoKm || null,
      // Campos que no existen en el esquema actual (ignorados):
      // - tipo, tipo_combustible, fecha_proximo_mantenimiento, precio_compra
    };

    // Validar campos requeridos
    if (!vehicleData.placa || !vehicleData.marca || !vehicleData.modelo) {
      throw new Error('Campos requeridos faltantes: placa, marca, modelo');
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select()
      .single();

    if (error) {
      console.error('Error al crear vehículo en BD:', error);
      return { data: null, error };
    }

    console.log('Vehículo creado exitosamente:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error en createFromForm:', error);
    return { data: null, error };
  }
};

/**
 * Obtiene todos los vehículos
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export const getAll = async () => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('placa', { ascending: true });

    if (error) {
      console.error('Error al obtener vehículos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error en getAll:', error);
    return { data: null, error };
  }
};

/**
 * Obtiene un vehículo por ID
 * @param {number} id - ID del vehículo
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener vehículo:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error en getById:', error);
    return { data: null, error };
  }
};

/**
 * Obtiene un vehículo por placa
 * @param {string} placa - Placa del vehículo
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getByPlaca = async (placa) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('placa', placa)
      .maybeSingle(); // No falla si no encuentra nada

    if (error) {
      console.error('Error al buscar vehículo por placa:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error en getByPlaca:', error);
    return { data: null, error };
  }
};

/**
 * Actualiza un vehículo existente
 * @param {number} id - ID del vehículo
 * @param {Object} formData - Datos actualizados del formulario
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const update = async (id, formData) => {
  try {
    // Mapear campos del formulario
    const updateData = {
      placa: formData.placa?.trim(),
      marca: formData.marca?.trim(),
      modelo: formData.modelo?.trim(),
      año: formData.anio || formData.año,
      color: formData.color?.trim(),
      numero_chasis: formData.vin?.trim() || null,
      numero_motor: formData.numeroMotor?.trim() || null,
      capacidad_combustible: formData.capacidad || null,
      kilometraje: formData.kilometraje || 0,
      status: formData.estado || 'activo',
      fecha_compra: formData.fechaCompra || null,
      fecha_ultimo_mantenimiento: formData.fechaUltimoMantenimiento || null,
      proximo_mantenimiento_km: formData.proximoMantenimientoKm || null,
    };

    const { data, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar vehículo:', error);
      return { data: null, error };
    }

    console.log('Vehículo actualizado exitosamente:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error en update:', error);
    return { data: null, error };
  }
};

/**
 * Elimina un vehículo
 * @param {number} id - ID del vehículo
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteVehicle = async (id) => {
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);

    if (error) {
      console.error('Error al eliminar vehículo:', error);
      return { success: false, error };
    }

    console.log('Vehículo eliminado exitosamente');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error en deleteVehicle:', error);
    return { success: false, error };
  }
};

/**
 * Obtiene vehículos por estado
 * @param {string} status - Estado del vehículo (activo, estacionado, mantenimiento, inactivo)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export const getByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', status) // Columna correcta: 'status' no 'estado'
      .order('placa', { ascending: true });

    if (error) {
      console.error('Error al obtener vehículos por estado:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error en getByStatus:', error);
    return { data: null, error };
  }
};

export const vehicleService = {
  createFromForm,
  getAll,
  getById,
  getByPlaca,
  update,
  deleteVehicle,
  getByStatus,
};

export default vehicleService;
