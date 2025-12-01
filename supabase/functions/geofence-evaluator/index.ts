// Supabase Edge Function: geofence-evaluator
// Evaluates enter/exit based on incoming vehicle position using turf.js
// POST body: { vehicleId: number, position: { lng: number, lat: number }, at?: string }

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// Deno globals declaration to satisfy TypeScript tooling outside Deno
// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import booleanPointInPolygon from 'https://esm.sh/@turf/boolean-point-in-polygon@7';
import distance from 'https://esm.sh/@turf/distance@7';
import { point } from 'https://esm.sh/@turf/helpers@7';

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { vehicleId, position, at } = await req.json();
    if (!vehicleId || !position?.lng || !position?.lat) {
      return new Response(
        JSON.stringify({ error: 'Missing vehicleId/position' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const now = at ? new Date(at).toISOString() : new Date().toISOString();
    const pt = point([position.lng, position.lat]);

    // 1) Load active geofences
    const { data: geofences, error: gfErr } = await supabase
      .from('geofences')
      .select('*')
      .eq('activo', true);
    if (gfErr) throw gfErr;

    const transitions: Array<{
      geofence_id: number;
      event_type: 'enter' | 'exit';
    }> = [];

    for (const gf of geofences ?? []) {
      const type = gf.tipo as 'circle' | 'polygon';
      let inside = false;

      if (type === 'polygon') {
        // geometry should be Polygon or Feature<Polygon>
        const geom =
          gf.geometry?.type === 'Feature' ? gf.geometry.geometry : gf.geometry;
        inside = booleanPointInPolygon(pt, geom);
      } else if (type === 'circle') {
        const center =
          gf.geometry?.type === 'Feature' ? gf.geometry.geometry : gf.geometry;
        const coords = center?.coordinates as [number, number];
        const dKm = distance(pt, point(coords), { units: 'kilometers' });
        inside = dKm * 1000 <= (gf.radio_m ?? 0);
      }

      // 2) Get previous state
      const { data: state } = await supabase
        .from('geofence_state')
        .select('*')
        .eq('geofence_id', gf.id)
        .eq('vehicle_id', vehicleId)
        .maybeSingle();

      const wasInside = state?.is_inside ?? false;
      if (inside !== wasInside) {
        // Transition
        transitions.push({
          geofence_id: gf.id,
          event_type: inside ? 'enter' : 'exit',
        });
        // Upsert state
        const payload = {
          geofence_id: gf.id,
          vehicle_id: vehicleId,
          is_inside: inside,
          last_position: {
            type: 'Point',
            coordinates: [position.lng, position.lat],
          },
          updated_at: now,
        };
        await supabase
          .from('geofence_state')
          .upsert(payload, { onConflict: 'geofence_id,vehicle_id' });

        // Insert geofence event
        const { data: ev, error: evErr } = await supabase
          .from('geofence_events')
          .insert({
            geofence_id: gf.id,
            vehicle_id: vehicleId,
            event_type: inside ? 'enter' : 'exit',
            position: {
              type: 'Point',
              coordinates: [position.lng, position.lat],
            },
            occurred_at: now,
          })
          .select()
          .single();
        if (evErr) throw evErr;

        // Create alert
        const tipo = inside ? 'geocerca_entrada' : 'geocerca_salida';
        const mensaje = inside
          ? `Vehículo ${vehicleId} entró a geocerca ${gf.nombre}`
          : `Vehículo ${vehicleId} salió de geocerca ${gf.nombre}`;
        await supabase.from('alerts').insert({
          vehicle_id: vehicleId,
          tipo_alerta: tipo,
          mensaje,
          nivel_prioridad: inside ? 'media' : 'alta',
          estado: 'pendiente',
          fecha_alerta: now,
          metadata: {
            geofence_id: gf.id,
            geofence_nombre: gf.nombre,
            event_id: ev?.id,
          },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, transitions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
