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
    // Consulta directa a la tabla en lugar de usar RPC
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .order('tipo_alerta');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener reglas de alertas:', error);
    return { data: null, error };
  }
};

/**
 * Inicializar reglas de alerta con valores por defecto
 * @returns {Promise<object>}
 */
export const inicializarReglasAlertas = async () => {
  try {
    const reglasDefecto = [
      {
        tipo_alerta: 'velocidad_excesiva',
        nombre: 'Velocidad Excesiva',
        descripcion:
          'Detecta cuando un vehículo excede el límite de velocidad configurado durante un tiempo prolongado',
        habilitado: true,
        umbrales: {
          max_velocidad_kmh: 120,
          duracion_segundos: 10,
        },
        debounce_segundos: 60,
      },
      {
        tipo_alerta: 'parada_prolongada',
        nombre: 'Parada Prolongada',
        descripcion:
          'Detecta cuando un vehículo permanece detenido en un lugar por un tiempo prolongado',
        habilitado: true,
        umbrales: {
          duracion_segundos: 300,
          radio_metros: 50,
          velocidad_max_kmh: 5,
        },
        debounce_segundos: 60,
      },
    ];

    // Intentar con upsert primero
    let result = await supabase
      .from('alert_rules')
      .upsert(reglasDefecto, {
        onConflict: 'tipo_alerta',
        ignoreDuplicates: false,
      })
      .select();

    // Si falla el upsert, intentar insert individual
    if (result.error) {
      console.warn('Upsert falló, intentando insert individual:', result.error);

      const insertResults = [];
      for (const regla of reglasDefecto) {
        const { data, error } = await supabase
          .from('alert_rules')
          .insert([regla])
          .select()
          .single();

        if (error && !error.message.includes('duplicate key')) {
          console.error('Error insertando regla:', regla.tipo_alerta, error);
          return { data: null, error };
        }
        if (data) insertResults.push(data);
      }

      return { data: insertResults, error: null };
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error al inicializar reglas de alertas:', error);
    return { data: null, error };
  }
};

/**
 * Actualizar configuración de una regla de alerta
 * @param {string} tipoAlerta - Tipo de alerta
 * @param {object} umbrales - Umbrales de configuración
 * @param {boolean} habilitado - Estado de la regla (opcional)
 * @returns {Promise<object>}
 */
export const actualizarReglaAlerta = async (
  tipoAlerta,
  umbrales,
  habilitado = null
) => {
  try {
    const updates = {
      umbrales,
      updated_at: new Date().toISOString(),
    };

    if (habilitado !== null) {
      updates.habilitado = habilitado;
    }

    const { data, error } = await supabase
      .from('alert_rules')
      .update(updates)
      .eq('tipo_alerta', tipoAlerta)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar regla:', error);
    return { data: null, error };
  }
};

/**
 * Habilitar/deshabilitar una regla de alerta
 * @param {string} tipoAlerta - Tipo de alerta (ej: 'velocidad_excesiva')
 * @param {boolean} habilitado - Nuevo estado (opcional, null hace toggle)
 * @returns {Promise<object>}
 */
export const toggleReglaAlerta = async (tipoAlerta, habilitado = null) => {
  try {
    // Si no se especifica habilitado, primero obtener el estado actual
    if (habilitado === null) {
      const { data: regla } = await supabase
        .from('alert_rules')
        .select('habilitado')
        .eq('tipo_alerta', tipoAlerta)
        .single();

      habilitado = !regla?.habilitado;
    }

    const { data, error } = await supabase
      .from('alert_rules')
      .update({
        habilitado,
        updated_at: new Date().toISOString(),
      })
      .eq('tipo_alerta', tipoAlerta)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
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
    console.log(
      `[evaluarAlertasUbicacion] 📍 Evaluando: vehicle_id=${vehicleId}, velocidad=${velocidad} km/h, lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`
    );

    const { data, error } = await supabase.rpc('evaluar_alertas_ubicacion', {
      p_vehicle_id: vehicleId,
      p_velocidad_actual: velocidad,
      p_latitud: lat,
      p_longitud: lng,
    });

    if (error) {
      console.error('[evaluarAlertasUbicacion] ❌ Error RPC:', error);
      throw error;
    }

    console.log(
      `[evaluarAlertasUbicacion] 📊 RPC retornó ${data?.length || 0} alertas`
    );

    if (data && data.length > 0) {
      console.log('[evaluarAlertasUbicacion] 🚨 Alertas detectadas:', data);
      console.log('[evaluarAlertasUbicacion] 💾 Creando alertas en BD...');

      const alertasCreadas = await Promise.all(
        data.map((alerta) => crearAlerta(vehicleId, alerta))
      );

      console.log(
        `[evaluarAlertasUbicacion] ✅ ${alertasCreadas.length} alertas creadas exitosamente`
      );
      return { data: alertasCreadas, error: null };
    } else {
      console.log(
        `[evaluarAlertasUbicacion] ℹ️ Sin alertas (velocidad ${velocidad} km/h está dentro de límites normales)`
      );
    }

    return { data: [], error: null };
  } catch (error) {
    console.error(
      '[evaluarAlertasUbicacion] 💥 Error evaluando alertas:',
      error
    );
    return { data: [], error };
  }
};

/**
 * Crear una alerta en la base de datos
 * @param {number|string} vehicleIdOrPlaca - ID o placa del vehículo
 * @param {object} alertaData - Datos de la alerta
 * @returns {Promise<object>}
 */
export const crearAlerta = async (vehicleIdOrPlaca, alertaData) => {
  try {
    console.log(
      `[crearAlerta] 🔍 Entrada: vehicleIdOrPlaca="${vehicleIdOrPlaca}" (tipo: ${typeof vehicleIdOrPlaca}), tipo_alerta="${alertaData.tipo_alerta}"`
    );

    // Resolver vehículo
    let vehiculo = null;
    if (typeof vehicleIdOrPlaca === 'number') {
      console.log(`[crearAlerta] 🔎 Buscando por ID: ${vehicleIdOrPlaca}`);
      const res = await supabase
        .from('vehicles')
        .select('id, placa')
        .eq('id', vehicleIdOrPlaca)
        .single();
      console.log('[crearAlerta] Búsqueda por ID resultado:', {
        vehiculo: res.data,
        error: res.error?.message,
      });
      vehiculo = res.data;
    } else {
      console.log(`[crearAlerta] 🔎 Buscando por placa: ${vehicleIdOrPlaca}`);
      const res = await supabase
        .from('vehicles')
        .select('id, placa')
        .eq('placa', vehicleIdOrPlaca)
        .single();
      console.log('[crearAlerta] Búsqueda por placa resultado:', {
        vehiculo: res.data,
        error: res.error?.message,
      });
      vehiculo = res.data;
    }

    if (!vehiculo) {
      console.warn(
        `[crearAlerta] ⚠️ No se encontró vehículo para: ${vehicleIdOrPlaca}`
      );
      return { data: null, error: new Error('Vehículo no encontrado') };
    }

    console.log(
      `[crearAlerta] ✅ Vehículo encontrado: ID=${vehiculo.id}, placa="${vehiculo.placa}"`
    );

    // Preparar datos para inserción
    const alertaPayload = {
      vehicle_id: vehiculo.id,
      tipo_alerta: alertaData.tipo_alerta || alertaData.tipo,
      mensaje: alertaData.mensaje,
      nivel_prioridad:
        alertaData.prioridad || alertaData.nivel_prioridad || 'media',
      metadata: alertaData.metadata || {},
    };

    console.log(
      '[crearAlerta] 📝 Insertando alerta:',
      JSON.stringify(alertaPayload, null, 2)
    );

    const { data, error } = await supabase
      .from('alerts')
      .insert([alertaPayload])
      .select()
      .single();

    if (error) {
      console.error('[crearAlerta] ❌ Error en INSERT:', error);
      throw error;
    }

    console.log(
      `[crearAlerta] 🚨 Alerta creada exitosamente: ID=${data.id}, tipo="${data.tipo_alerta}", vehículo="${vehiculo.placa}"`
    );

    return { data, error: null };
  } catch (error) {
    console.error('[crearAlerta] 💥 Error creando alerta:', error);
    return { data: null, error };
  }
};

/**
 * Obtener alertas con filtros
 * @param {object} filtros - Filtros de consulta
 * @returns {Promise<Array>} Lista de alertas
 */
export const obtenerAlertas = async (filtros = {}) => {
  try {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('fecha_alerta', { ascending: false });

    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros.tipo_alerta) {
      query = query.eq('tipo_alerta', filtros.tipo_alerta);
    }

    if (filtros.nivel_prioridad) {
      query = query.eq('nivel_prioridad', filtros.nivel_prioridad);
    }

    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data: alertas, error } = await query;

    if (error) throw error;

    // Enriquecer con datos de vehículos y conductores manualmente
    if (alertas && alertas.length > 0) {
      const vehicleIds = [
        ...new Set(alertas.map((a) => a.vehicle_id).filter(Boolean)),
      ];
      const driverIds = [
        ...new Set(alertas.map((a) => a.driver_id).filter(Boolean)),
      ];

      // Obtener vehículos
      let vehiculos = [];
      if (vehicleIds.length > 0) {
        const { data: vehData } = await supabase
          .from('vehicles')
          .select('id, placa, marca, modelo')
          .in('id', vehicleIds);
        vehiculos = vehData || [];
      }

      // Obtener conductores
      let conductores = [];
      if (driverIds.length > 0) {
        const { data: condData } = await supabase
          .from('drivers')
          .select('id, nombre, apellidos')
          .in('id', driverIds);
        conductores = condData || [];
      }

      // Mapear datos
      const alertasEnriquecidas = alertas.map((alerta) => ({
        ...alerta,
        vehiculo: vehiculos.find((v) => v.id === alerta.vehicle_id) || null,
        conductor: conductores.find((c) => c.id === alerta.driver_id) || null,
      }));

      return { data: alertasEnriquecidas, error: null };
    }

    return { data: alertas || [], error: null };
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    return { data: null, error };
  }
};

/**
 * Obtener estadísticas de alertas
 * @returns {Promise<object>} Estadísticas
 */
export const obtenerEstadisticasAlertas = async () => {
  try {
    const { data, error } = await supabase.rpc('obtener_estadisticas_alertas');

    if (error) throw error;

    // Formato esperado
    return {
      data: data?.[0] || {
        total: 0,
        pendientes: 0,
        vistas: 0,
        resueltas: 0,
        criticas: 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    // Fallback: calcular manualmente
    const { data: alertas } = await obtenerAlertas({ limit: 1000 });

    const stats = {
      total: alertas?.length || 0,
      pendientes: alertas?.filter((a) => a.estado === 'pendiente').length || 0,
      vistas: alertas?.filter((a) => a.estado === 'vista').length || 0,
      resueltas: alertas?.filter((a) => a.estado === 'resuelta').length || 0,
      criticas:
        alertas?.filter((a) => a.nivel_prioridad === 'critica').length || 0,
    };

    return { data: stats, error: null };
  }
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
    console.error('Error marcando alerta como vista:', error);
    return { data: null, error };
  }
};

/**
 * Resolver alerta
 * @param {number} alertaId
 * @param {string} resuelto_por - Usuario que resolvió
 * @returns {Promise<object>}
 */
export const resolverAlerta = async (alertaId, resuelto_por) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        estado: 'resuelta',
        fecha_resolucion: new Date().toISOString(),
        resuelto_por: resuelto_por || 'Sistema',
      })
      .eq('id', alertaId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error resolviendo alerta:', error);
    return { data: null, error };
  }
};

/**
 * Ignorar alerta
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
    console.error('Error ignorando alerta:', error);
    return { data: null, error };
  }
};

/**
 * Suscribirse a cambios en tiempo real de alertas
 * @param {Function} callback - Función a ejecutar cuando hay cambios
 * @returns {object} Subscription object
 */
export const suscribirseAAlertas = (callback) => {
  const subscription = supabase
    .channel('alerts_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
      },
      (payload) => {
        console.log('Nueva alerta detectada:', payload);
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

export default {
  obtenerReglasAlertas,
  actualizarReglaAlerta,
  toggleReglaAlerta,
  evaluarAlertasUbicacion,
  crearAlerta,
  obtenerAlertas,
  obtenerEstadisticasAlertas,
  marcarAlertaComoVista,
  resolverAlerta,
  ignorarAlerta,
  suscribirseAAlertas,
};
