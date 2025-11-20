import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization token' }),
        { status: 401 }
      );
    }

    // Verify token and get user
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const body = await req.json();
    const { driver_id, vehicle_id, location, message, source } = body;

    // Basic validations
    if (!driver_id) {
      return new Response(JSON.stringify({ error: 'driver_id is required' }), {
        status: 400,
      });
    }

    // Build incident record following existing `incidents` schema
    const title = message || 'Alerta de pánico';
    const description = message || 'Alerta inmediata enviada desde conductor';

    let locationText = null;
    if (
      location &&
      typeof location.lat === 'number' &&
      typeof location.lon === 'number'
    ) {
      locationText = `${location.lat},${location.lon}${location.accuracy ? `,acc:${location.accuracy}` : ''}`;
    }

    const incident = {
      driver_id: Number(driver_id),
      vehicle_id: vehicle_id ? Number(vehicle_id) : null,
      type: 'panic',
      severity: 'critical',
      title,
      description,
      location: locationText,
      source: source || 'edge-function',
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
      .single();
    if (error) {
      console.error('Error inserting incident:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'insert error' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ incident: data }), { status: 201 });
  } catch (err) {
    console.error('panic-alert function error:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
    });
  }
});
