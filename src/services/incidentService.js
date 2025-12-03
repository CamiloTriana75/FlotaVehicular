// Incident service for HU6 - Supabase client CRUD + KPIs
import { supabase } from '../lib/supabaseClient';

export const INCIDENT_TYPES = [
  'accident',
  'breakdown',
  'violation',
  'near_miss',
  'other',
];
export const INCIDENT_SEVERITY = ['low', 'medium', 'high', 'critical'];
export const INCIDENT_STATUS = [
  'reported',
  'investigating',
  'resolved',
  'closed',
];

// Helpers
const toDateISO = (d) => (d ? new Date(d).toISOString() : null);

export async function getIncidents(filters = {}) {
  try {
    let query = supabase
      .from('incidents')
      .select(
        `
        id, driver_id, vehicle_id, type, severity, title, description, location,
        occurred_at, status, km_at_incident, avg_speed, created_at, updated_at,
        driver:drivers(id, nombre, apellidos, numero_licencia),
        vehicle:vehicles(id, placa, marca, modelo)
      `
      )
      .order('occurred_at', { ascending: false });

    if (filters.driverId) query = query.eq('driver_id', filters.driverId);
    if (filters.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.startDate)
      query = query.gte('occurred_at', toDateISO(filters.startDate));
    if (filters.endDate)
      query = query.lte('occurred_at', toDateISO(filters.endDate));

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getIncidents error:', error);
    return { data: null, error };
  }
}

export async function createIncident(payload) {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createIncident error:', error);
    return { data: null, error };
  }
}

export async function updateIncident(id, updates) {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateIncident error:', error);
    return { data: null, error };
  }
}

export async function deleteIncident(id) {
  try {
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('deleteIncident error:', error);
    return { success: false, error };
  }
}

// Comments API
export async function addIncidentComment(incidentId, comment, supervisorName) {
  try {
    const { data, error } = await supabase
      .from('incident_comments')
      .insert([
        { incident_id: incidentId, comment, supervisor_name: supervisorName },
      ])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addIncidentComment error:', error);
    return { data: null, error };
  }
}

export async function getIncidentComments(incidentId) {
  try {
    const { data, error } = await supabase
      .from('incident_comments')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getIncidentComments error:', error);
    return { data: null, error };
  }
}

// KPIs by driver (client-side aggregation)
export async function getDriverKPIs(
  driverId,
  { startDate, endDate, kmInPeriod } = {}
) {
  const { data, error } = await getIncidents({ driverId, startDate, endDate });
  if (error) return { data: null, error };
  const incidents = data || [];
  const kpiData = computeKPIs(incidents, kmInPeriod);
  return {
    data: {
      ...kpiData,
      period: { startDate: startDate || null, endDate: endDate || null },
    },
    error: null,
  };
}

// Pure helper para calcular KPIs a partir de un arreglo de incidentes.
// Exportado para facilitar pruebas unitarias.
export function computeKPIs(incidents, kmInPeriod) {
  const list = Array.isArray(incidents) ? incidents : [];
  const total = list.length;
  const bySeverity = INCIDENT_SEVERITY.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {}
  );
  const byType = INCIDENT_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {});

  for (const inc of list) {
    if (inc && bySeverity[inc.severity] !== undefined)
      bySeverity[inc.severity]++;
    if (inc && byType[inc.type] !== undefined) byType[inc.type]++;
  }

  let incidentsPer1000Km = null;
  if (kmInPeriod && kmInPeriod > 0) {
    incidentsPer1000Km = Number(((total / kmInPeriod) * 1000).toFixed(2));
  }

  const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const avgSeverityScore = total
    ? Number(
        (
          list.reduce((acc, i) => acc + (severityMap[i.severity] || 0), 0) /
          total
        ).toFixed(2)
      )
    : 0;

  return {
    total,
    bySeverity,
    byType,
    incidentsPer1000Km,
    avgSeverityScore,
  };
}

export default {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
  addIncidentComment,
  getIncidentComments,
  getDriverKPIs,
  computeKPIs,
};
