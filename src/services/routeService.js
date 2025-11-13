/**
 * Servicio de Rutas Optimizadas
 * Historia de Usuario: HU10 - Crear y asignar rutas optimizadas
 *
 * Integración con Mapbox Directions API para:
 * - Optimización de rutas con múltiples waypoints
 * - Cálculo de distancias y tiempos estimados
 * - Geometría de rutas para visualización en mapa
 */

import { supabase } from '../lib/supabaseClient';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_DIRECTIONS_API =
  'https://api.mapbox.com/directions/v5/mapbox/driving';
const MAPBOX_OPTIMIZATION_API =
  'https://api.mapbox.com/optimized-trips/v1/mapbox/driving';

/**
 * Optimiza una ruta con múltiples waypoints usando Mapbox Optimization API
 * @param {Array<{lng: number, lat: number}>} waypoints - Lista de puntos (mínimo 2, máximo 12)
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Ruta optimizada con orden de waypoints, distancia, duración y geometría
 */
export async function optimizeRoute(waypoints, options = {}) {
  try {
    if (!MAPBOX_TOKEN) {
      throw new Error(
        'Mapbox token no configurado. Verifica VITE_MAPBOX_TOKEN en .env'
      );
    }

    if (waypoints.length < 2) {
      throw new Error('Se requieren al menos 2 waypoints para crear una ruta');
    }

    if (waypoints.length > 12) {
      throw new Error('Mapbox Optimization API soporta máximo 12 waypoints');
    }

    // Formatear coordenadas para Mapbox: "lng,lat;lng,lat;..."
    const coordinates = waypoints.map((wp) => `${wp.lng},${wp.lat}`).join(';');

    // Construir URL con parámetros
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      geometries: 'geojson', // Retornar geometría en formato GeoJSON
      overview: 'full', // Geometría completa de la ruta
      steps: true, // Incluir instrucciones paso a paso
      roundtrip: options.roundtrip !== false, // Por defecto, ruta circular
      source: options.source || 'first', // Empezar en el primer waypoint
      destination: options.destination || 'last', // Terminar en el último waypoint
    });

    const url = `${MAPBOX_OPTIMIZATION_API}/${coordinates}?${params}`;

    console.log('🗺️ Optimizando ruta con Mapbox...', {
      waypoints: waypoints.length,
    });

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error de Mapbox: ${response.status}`);
    }

    const data = await response.json();

    if (!data.trips || data.trips.length === 0) {
      throw new Error('No se pudo generar una ruta optimizada');
    }

    const trip = data.trips[0]; // Primera (y mejor) ruta optimizada

    // Mapear el orden optimizado de waypoints
    const optimizedOrder = data.waypoints.map((wp) => wp.waypoint_index);

    // Calcular ETAs por tramo
    const legs = trip.legs.map((leg, index) => ({
      from: optimizedOrder[index],
      to: optimizedOrder[index + 1],
      distance: leg.distance, // metros
      duration: leg.duration, // segundos
      steps: leg.steps.length,
      summary: leg.summary || '',
    }));

    const result = {
      success: true,
      optimizedOrder, // Índices de waypoints en orden optimizado
      waypoints: data.waypoints.map((wp) => ({
        originalIndex: wp.waypoint_index,
        name: wp.name || `Punto ${wp.waypoint_index + 1}`,
        location: wp.location, // [lng, lat]
      })),
      totalDistance: trip.distance, // metros
      totalDuration: trip.duration, // segundos
      geometry: trip.geometry, // GeoJSON LineString
      legs, // Tramos individuales con ETAs
    };

    console.log('✅ Ruta optimizada:', {
      waypoints: result.waypoints.length,
      distance: `${(result.totalDistance / 1000).toFixed(2)} km`,
      duration: `${Math.round(result.totalDuration / 60)} min`,
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('❌ Error optimizando ruta:', error);
    return { data: null, error };
  }
}

/**
 * Calcula una ruta simple entre dos puntos (sin optimización)
 * @param {Object} origin - {lng, lat}
 * @param {Object} destination - {lng, lat}
 * @returns {Promise<Object>} Ruta con distancia, duración y geometría
 */
export async function calculateSimpleRoute(origin, destination) {
  try {
    if (!MAPBOX_TOKEN) {
      throw new Error('Mapbox token no configurado');
    }

    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;

    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      geometries: 'geojson',
      overview: 'full',
      steps: true,
    });

    const url = `${MAPBOX_DIRECTIONS_API}/${coordinates}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error de Mapbox: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No se encontró una ruta');
    }

    const route = data.routes[0];

    const result = {
      distance: route.distance, // metros
      duration: route.duration, // segundos
      geometry: route.geometry, // GeoJSON
      legs: route.legs,
    };

    return { data: result, error: null };
  } catch (error) {
    console.error('Error calculando ruta simple:', error);
    return { data: null, error };
  }
}

/**
 * Guarda una ruta en la base de datos
 * @param {Object} routeData - Datos de la ruta
 * @returns {Promise<Object>} Ruta creada
 */
export async function createRoute(routeData) {
  try {
    const newRoute = {
      name: routeData.name,
      description: routeData.description || null,
      waypoints: routeData.waypoints, // Array de {name, address, lat, lng, order}
      optimized_order: routeData.optimizedOrder || null,
      total_distance: Math.round(routeData.totalDistance), // metros (entero)
      total_duration: Math.round(routeData.totalDuration), // segundos (entero)
      geometry: routeData.geometry, // GeoJSON
      status: 'active',
      created_by: routeData.createdBy || null,
    };

    const { data, error } = await supabase
      .from('routes')
      .insert([newRoute])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Ruta guardada en BD:', data.id);

    return { data, error: null };
  } catch (error) {
    console.error('Error guardando ruta:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene todas las rutas
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de rutas
 */
export async function getRoutes(filters = {}) {
  try {
    let query = supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo rutas:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene una ruta por ID
 * @param {number} routeId - ID de la ruta
 * @returns {Promise<Object>} Datos de la ruta
 */
export async function getRouteById(routeId) {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo ruta:', error);
    return { data: null, error };
  }
}

/**
 * Asigna una ruta a un conductor/vehículo
 * @param {Object} assignmentData - Datos de la asignación
 * @returns {Promise<Object>} Asignación creada
 */
export async function assignRouteToDriver(assignmentData) {
  try {
    const newAssignment = {
      route_id: assignmentData.routeId,
      driver_id: assignmentData.driverId,
      vehicle_id: assignmentData.vehicleId,
      // Convertir a ISO UTC para evitar desfases de zona horaria
      scheduled_start: assignmentData.scheduledStart
        ? new Date(assignmentData.scheduledStart).toISOString()
        : null,
      scheduled_end: assignmentData.scheduledEnd
        ? new Date(assignmentData.scheduledEnd).toISOString()
        : null,
      status: 'pending',
      notes: assignmentData.notes || null,
    };

    const { data, error } = await supabase
      .from('route_assignments')
      .insert([newAssignment])
      .select(
        `
        *,
        route:routes(id, name, total_distance, total_duration),
        driver:drivers(id, nombre, apellidos, telefono, email),
        vehicle:vehicles(id, placa, marca, modelo)
      `
      )
      .single();

    if (error) throw error;

    console.log('✅ Ruta asignada:', {
      route: data.route.name,
      driver: `${data.driver.nombre} ${data.driver.apellidos}`,
      vehicle: data.vehicle.placa,
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error asignando ruta:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene asignaciones de rutas
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de asignaciones
 */
export async function getRouteAssignments(filters = {}) {
  try {
    let query = supabase
      .from('route_assignments')
      .select(
        `
        *,
        route:routes(id, name, waypoints, total_distance, total_duration, geometry),
        driver:drivers(id, nombre, apellidos, telefono, email, cedula),
        vehicle:vehicles(id, placa, marca, modelo)
      `
      )
      .order('scheduled_start', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.driverId) {
      query = query.eq('driver_id', filters.driverId);
    }

    if (filters.routeId) {
      query = query.eq('route_id', filters.routeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo asignaciones de rutas:', error);
    return { data: null, error };
  }
}

/**
 * Actualiza el estado de una asignación de ruta
 * @param {number} assignmentId - ID de la asignación
 * @param {string} status - Nuevo estado (pending, in_progress, completed, cancelled)
 * @returns {Promise<Object>} Asignación actualizada
 */
export async function updateRouteAssignmentStatus(assignmentId, status) {
  try {
    const updates = { status };

    if (status === 'in_progress') {
      updates.actual_start = new Date().toISOString();
    } else if (status === 'completed') {
      updates.actual_end = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('route_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando estado de asignación:', error);
    return { data: null, error };
  }
}

/**
 * Elimina una ruta
 * @param {number} routeId - ID de la ruta
 * @returns {Promise<Object>}
 */
export async function deleteRoute(routeId) {
  try {
    const { data, error } = await supabase
      .from('routes')
      .delete()
      .eq('id', routeId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error eliminando ruta:', error);
    return { data: null, error };
  }
}

/**
 * Registra un check-in en un waypoint
 * @param {Object} checkinData - Datos del check-in
 * @returns {Promise<Object>} Check-in creado
 */
export async function createWaypointCheckin(checkinData) {
  try {
    const { data, error } = await supabase
      .from('route_waypoint_checkins')
      .insert([
        {
          assignment_id: checkinData.assignmentId,
          waypoint_number: checkinData.waypointNumber,
          latitude: checkinData.latitude,
          longitude: checkinData.longitude,
          notes: checkinData.notes || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Check-in registrado:', data);

    return { data, error: null };
  } catch (error) {
    console.error('Error registrando check-in:', error);
    return { data: null, error };
  }
}

/**
 * Registra un evento de ruta (start, waypoint_reached, deviation, etc.)
 * @param {Object} eventData - Datos del evento
 * @returns {Promise<Object>} Evento creado
 */
export async function createRouteEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from('route_events')
      .insert([
        {
          assignment_id: eventData.assignmentId,
          event_type: eventData.eventType,
          event_data: eventData.eventData || null,
          latitude: eventData.latitude || null,
          longitude: eventData.longitude || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error registrando evento de ruta:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene el progreso de una asignación
 * @param {number} assignmentId - ID de la asignación
 * @returns {Promise<Object>} Progreso de la ruta
 */
export async function getRouteProgress(assignmentId) {
  try {
    const { data, error } = await supabase.rpc(
      'get_route_assignment_progress',
      { p_assignment_id: assignmentId }
    );

    if (error) throw error;

    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error obteniendo progreso de ruta:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene check-ins de una asignación
 * @param {number} assignmentId - ID de la asignación
 * @returns {Promise<Array>} Lista de check-ins
 */
export async function getWaypointCheckins(assignmentId) {
  try {
    const { data, error } = await supabase
      .from('route_waypoint_checkins')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('waypoint_number', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo check-ins:', error);
    return { data: null, error };
  }
}

/**
 * Obtiene rutas activas para monitoreo (vista consolidada)
 * @returns {Promise<Array>} Lista de rutas en progreso
 */
export async function getActiveRoutesMonitoring() {
  try {
    const { data, error } = await supabase
      .from('v_active_route_monitoring')
      .select('*')
      .order('actual_start', { ascending: false, nullsFirst: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo monitoreo de rutas activas:', error);
    return { data: null, error };
  }
}

export default {
  optimizeRoute,
  calculateSimpleRoute,
  createRoute,
  getRoutes,
  getRouteById,
  assignRouteToDriver,
  getRouteAssignments,
  updateRouteAssignmentStatus,
  deleteRoute,
  createWaypointCheckin,
  createRouteEvent,
  getRouteProgress,
  getWaypointCheckins,
  getActiveRoutesMonitoring,
};
