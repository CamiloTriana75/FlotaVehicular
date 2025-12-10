// Servicio para trazabilidad de notificaciones de incidentes
// Maneja lectura y actualización de tabla incident_notifications
import { supabase } from '../lib/supabaseClient';

export const NOTIFICATION_CHANNELS = ['webpush', 'email', 'sms', 'webhook'];
export const NOTIFICATION_STATUS = ['pending', 'sent', 'failed', 'skipped'];

export async function getIncidentNotifications({ limit = 20 } = {}) {
  try {
    const query = supabase
      .from('incident_notifications')
      .select(
        'id, incident_id, channel, status, payload, error_message, created_at, updated_at'
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getIncidentNotifications error:', error);
    return { data: null, error };
  }
}

export async function markNotificationStatus(id, status, errorMessage = null) {
  try {
    const { data, error } = await supabase
      .from('incident_notifications')
      .update({ status, error_message: errorMessage })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('markNotificationStatus error:', error);
    return { data: null, error };
  }
}

export async function markIncidentChannelStatus(
  incidentId,
  channel = 'webpush',
  status = 'sent',
  errorMessage = null
) {
  try {
    const { data, error } = await supabase
      .from('incident_notifications')
      .update({ status, error_message: errorMessage })
      .eq('incident_id', incidentId)
      .eq('channel', channel)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('markIncidentChannelStatus error:', error);
    return { data: null, error };
  }
}

export async function logChannelResult(
  incidentId,
  channel,
  status,
  payload = null,
  errorMessage = null
) {
  try {
    const { data, error } = await supabase
      .from('incident_notifications')
      .insert([
        {
          incident_id: incidentId,
          channel,
          status,
          payload,
          error_message: errorMessage,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('logChannelResult error:', error);
    return { data: null, error };
  }
}

export default {
  getIncidentNotifications,
  markNotificationStatus,
  markIncidentChannelStatus,
  logChannelResult,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS,
};
