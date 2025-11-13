/**
 * Servicio de Alertas
 * Gestiona la configuración de reglas, evaluación de condiciones y creación de alertas
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Obtener todas las reglas de alertas
 * @returns {Promise<Array>} Lista de reglas configuradas
 */
export const obtenerReglasAlertas = async () => {
  try {
    const { data, error } = await supabase.rpc('get_alert_rules');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener reglas de alertas:', error);
    return { data: null, error };
  }
};

/**
 * Actualizar configuración de una regla de alerta
 * @param {number} id - ID de la regla
 * @param {object} updates - Campos a actualizar
 * @returns {Promise<object>}
 */
export const actualizarReglaAlerta = async (id, updates) => {
  try {
    const { data, error } = await supabase.rpc('update_alert_rule', {
      p_rule_id: id,
      p_umbrales: updates.umbrales || null,
      p_tolerancia_porcentaje: updates.tolerancia_porcentaje || null,
      p_debounce_segundos: updates.debounce_segundos || null,
      p_nivel_prioridad: updates.nivel_prioridad || null,
      p_habilitado:
        updates.habilitado !== undefined ? updates.habilitado : null,
    });

    if (error) throw error;

    // Verificar si la función RPC devolvió success
    if (data && !data.success) {
      throw new Error(data.message || 'Error al actualizar regla');
    }

    return { data: data?.data, error: null };
  } catch (error) {
    console.error('Error al actualizar regla de alerta:', error);
    return { data: null, error };
  }
};

/**
 * Habilitar/deshabilitar una regla de alerta
 * @param {number} id - ID de la regla
 * @param {boolean} habilitado
 * @returns {Promise<object>}
 */
export const toggleReglaAlerta = async (id, habilitado) => {
  try {
    const { data, error } = await supabase.rpc('toggle_alert_rule', {
      p_rule_id: id,
      p_habilitado: habilitado,
    });

    if (error) throw error;

    // Verificar si la función RPC devolvió success
    if (data && !data.success) {
      throw new Error(data.message || 'Error al cambiar estado de regla');
    }

    return { data: data?.data, error: null };
  } catch (error) {
    console.error('Error al cambiar estado de regla:', error);
    return { data: null, error };
  }
};

/**
 * Evaluar alertas para una ubicación específica
 * Esta función se llama desde el locationService cuando se recibe una nueva ubicación
 * @param {number} vehicleId
 * @param {number} velocidad - Velocidad en km/h
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Array>} Alertas generadas
 */
export const evaluarAlertasUbicacion = async (
  vehicleId,
  velocidad,
  lat,
  lng
) => {
  try {
    const { data, error } = await supabase.rpc('evaluar_alertas_ubicacion', {
      p_vehicle_id: vehicleId,
      p_velocidad: velocidad,
      p_lat: lat,
      p_lng: lng,
    });

    if (error) throw error;

    // Si hay alertas, crearlas en la tabla alerts
    if (data && data.length > 0) {
      const alertasCreadas = await Promise.all(
        data.map((alerta) => crearAlerta(vehicleId, alerta))
      );
      return { data: alertasCreadas, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error('Error al evaluar alertas:', error);
    return { data: null, error };
  }
};

/**
 * Crear una nueva alerta en la base de datos
 * @param {number|string} vehicleIdOrPlaca - ID del vehículo o placa
 * @param {object} alertaInfo - Info de la alerta (tipo, mensaje, prioridad)
 * @returns {Promise<object>}
 */
export const crearAlerta = async (vehicleIdOrPlaca, alertaInfo) => {
  try {
    console.log(
      `[crearAlerta] 🔍 Entrada: vehicleIdOrPlaca="${vehicleIdOrPlaca}" (tipo: ${typeof vehicleIdOrPlaca}), tipo_alerta="${alertaInfo.tipo_alerta}"`
    );

    // Obtener info del vehículo y conductor
    // Intentar por ID primero, luego por placa
    let vehiculo = null;
    let vehiculoError = null;

    // Si es número, asumir que es ID
    if (typeof vehicleIdOrPlaca === 'number' || !isNaN(vehicleIdOrPlaca)) {
      console.log(`[crearAlerta] 🔎 Buscando por ID: ${vehicleIdOrPlaca}`);
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, placa')
        .eq('id', vehicleIdOrPlaca)
        .single();
      vehiculo = data;
      vehiculoError = error;
      console.log(`[crearAlerta] Búsqueda por ID resultado:`, {
        vehiculo,
        error: vehiculoError?.message,
      });
    }

    // Si no se encontró por ID o es string, buscar por placa
    if (!vehiculo) {
      console.log(`[crearAlerta] 🔎 Buscando por placa: "${vehicleIdOrPlaca}"`);
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, placa')
        .eq('placa', vehicleIdOrPlaca)
        .single();
      vehiculo = data;
      vehiculoError = error;
      console.log(`[crearAlerta] Búsqueda por placa resultado:`, {
        vehiculo,
        error: vehiculoError?.message,
      });
    }

    if (!vehiculo) {
      console.error(
        `[crearAlerta] ❌ No se encontró vehículo con ID/placa: ${vehicleIdOrPlaca}`,
        vehiculoError
      );
      return { data: null, error: new Error('Vehículo no encontrado') };
    }

    console.log(
      `[crearAlerta] ✅ Vehículo encontrado: ID=${vehiculo.id}, placa="${vehiculo.placa}"`
    );

    // Intentar resolver driver_id actual desde assignments (si existe ese esquema)
    let currentDriverId = null;
    try {
      const { data: assignment, error: assignErr } = await supabase
        .from('assignments')
        .select('driver_id')
        .eq('vehicle_id', vehiculo.id)
        .eq('estado', 'activa')
        .order('fecha_inicio', { ascending: false })
        .limit(1)
        .single();
      if (!assignErr && assignment) {
        currentDriverId = assignment.driver_id || null;
        console.log(`[crearAlerta] ℹ️ Driver asignado: ${currentDriverId}`);
      }
    } catch (e) {
      // Silencioso: si no existe tabla/columna, dejamos driver_id en null
      console.log(
        `[crearAlerta] ℹ️ Sin asignación de conductor (tabla assignments puede no existir)`
      );
    }

    const nuevaAlerta = {
      vehicle_id: vehiculo.id,
      driver_id: currentDriverId,
      tipo_alerta: alertaInfo.tipo_alerta,
      mensaje: alertaInfo.mensaje,
      nivel_prioridad: alertaInfo.prioridad || 'media',
      estado: 'pendiente',
      metadata: alertaInfo.metadata || {},
    };

    console.log(`[crearAlerta] 📝 Insertando alerta:`, nuevaAlerta);

    const { data, error } = await supabase
      .from('alerts')
      .insert(nuevaAlerta)
      .select()
      .single();

    if (error) {
      console.error(`[crearAlerta] 💥 Error insertando:`, error);
      throw error;
    }

    // Actualizar tracking con el alert_id (si existe esa tabla/esquema)
    try {
      await supabase
        .from('alert_tracking')
        .update({ alert_id: data.id })
        .eq('vehicle_id', vehiculo.id)
        .eq('tipo_alerta', alertaInfo.tipo_alerta)
        .eq('estado', 'activo');
    } catch {}

    console.log(
      `[crearAlerta] 🚨 Alerta creada exitosamente: ID=${data.id}, tipo="${alertaInfo.tipo_alerta}", vehículo="${vehiculo.placa}" (ID: ${vehiculo.id})`
    );

    return { data, error: null };
  } catch (error) {
    console.error('[crearAlerta] 💥 Error general:', error);
    return { data: null, error };
  }
};

/**
 * Obtener alertas con filtros
 * @param {object} filtros - { estado, tipo_alerta, prioridad, vehicleId }
 * @returns {Promise<Array>}
 */
export const obtenerAlertas = async (filtros = {}) => {
  try {
    // Nota: evitamos joins implícitos porque requieren FKs explícitas.
    // Mostramos alertas planas; el UI maneja la ausencia de vehicles/drivers opcionales.
    let query = supabase
      .from('alerts')
      .select('*')
      .order('fecha_alerta', { ascending: false });

    // Aplicar filtros
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }
    if (filtros.tipo_alerta) {
      query = query.eq('tipo_alerta', filtros.tipo_alerta);
    }
    if (filtros.prioridad) {
      query = query.eq('nivel_prioridad', filtros.prioridad);
    }
    if (filtros.vehicleId) {
      query = query.eq('vehicle_id', filtros.vehicleId);
    }
    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Enriquecer alertas con datos de vehículo sin requerir FK
    if (data && data.length > 0) {
      const vehicleIds = [
        ...new Set(data.map((a) => a.vehicle_id).filter(Boolean)),
      ];

      if (vehicleIds.length > 0) {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('id, placa, modelo, marca')
          .in('id', vehicleIds);

        const vehicleMap = (vehicles || []).reduce((acc, v) => {
          acc[v.id] = v;
          return acc;
        }, {});

        // Enriquecer cada alerta
        data.forEach((alerta) => {
          if (alerta.vehicle_id && vehicleMap[alerta.vehicle_id]) {
            alerta.vehicles = vehicleMap[alerta.vehicle_id];
          }
        });
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    return { data: null, error };
  }
};

/**
 * Obtener alertas pendientes (para notificaciones)
 * @returns {Promise<Array>}
 */
export const obtenerAlertasPendientes = async () => {
  return obtenerAlertas({ estado: 'pendiente', limit: 50 });
};

/**
 * Marcar alerta como vista
 * @param {number} alertaId
 * @returns {Promise<object>}
 */
export const marcarAlertaComoVista = async (alertaId) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({ estado: 'vista' })
      .eq('id', alertaId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al marcar alerta como vista:', error);
    return { data: null, error };
  }
};

/**
 * Resolver una alerta
 * @param {number} alertaId
 * @param {string} resolvidoPor - Nombre del usuario que resuelve
 * @returns {Promise<object>}
 */
export const resolverAlerta = async (alertaId, resolvidoPor) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        estado: 'resuelta',
        fecha_resolucion: new Date().toISOString(),
        resuelto_por: resolvidoPor,
      })
      .eq('id', alertaId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al resolver alerta:', error);
    return { data: null, error };
  }
};

/**
 * Ignorar una alerta
 * @param {number} alertaId
 * @returns {Promise<object>}
 */
export const ignorarAlerta = async (alertaId) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({ estado: 'ignorada' })
      .eq('id', alertaId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al ignorar alerta:', error);
    return { data: null, error };
  }
};

/**
 * Suscribirse a nuevas alertas en tiempo real
 * @param {function} callback - Función que recibe las nuevas alertas
 * @returns {object} Suscripción de Supabase
 */
export const suscribirseAAlertas = (callback) => {
  const subscription = supabase
    .channel('alertas-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
      },
      (payload) => {
        console.log('🔔 Nueva alerta recibida:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Obtener estadísticas de alertas
 * @returns {Promise<object>}
 */
export const obtenerEstadisticasAlertas = async () => {
  try {
    // Contar alertas por estado
    const { data: porEstado, error: errorEstado } = await supabase
      .from('alerts')
      .select('estado')
      .then((result) => {
        if (result.error) throw result.error;
        const counts = result.data.reduce((acc, alert) => {
          acc[alert.estado] = (acc[alert.estado] || 0) + 1;
          return acc;
        }, {});
        return { data: counts, error: null };
      });

    // Contar alertas por tipo
    const { data: porTipo, error: errorTipo } = await supabase
      .from('alerts')
      .select('tipo_alerta')
      .gte(
        'fecha_alerta',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .then((result) => {
        if (result.error) throw result.error;
        const counts = result.data.reduce((acc, alert) => {
          acc[alert.tipo_alerta] = (acc[alert.tipo_alerta] || 0) + 1;
          return acc;
        }, {});
        return { data: counts, error: null };
      });

    // Contar alertas por prioridad
    const { data: porPrioridad, error: errorPrioridad } = await supabase
      .from('alerts')
      .select('nivel_prioridad')
      .eq('estado', 'pendiente')
      .then((result) => {
        if (result.error) throw result.error;
        const counts = result.data.reduce((acc, alert) => {
          acc[alert.nivel_prioridad] = (acc[alert.nivel_prioridad] || 0) + 1;
          return acc;
        }, {});
        return { data: counts, error: null };
      });

    return {
      data: {
        porEstado,
        porTipo,
        porPrioridad,
      },
      error: errorEstado || errorTipo || errorPrioridad,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de alertas:', error);
    return { data: null, error };
  }
};

export default {
  obtenerReglasAlertas,
  actualizarReglaAlerta,
  toggleReglaAlerta,
  evaluarAlertasUbicacion,
  crearAlerta,
  obtenerAlertas,
  obtenerAlertasPendientes,
  marcarAlertaComoVista,
  resolverAlerta,
  ignorarAlerta,
  suscribirseAAlertas,
  obtenerEstadisticasAlertas,
};
