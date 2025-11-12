/**
 * Simulación deTracking de vehículo enviando ubicaciones periódicas.
 * Uso: node scripts/simulate-tracking.js ABC-123
 * Requiere variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el entorno'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const vehicleId = (process.argv[2] || 'ABC-123').toUpperCase();

// Centro aproximado Bogotá para ejemplo
const BASE_LAT = 4.711;
const BASE_LON = -74.0721;

function randomOffset() {
  // Pequeño desplazamiento ~ metros
  return (Math.random() - 0.5) * 0.005;
}

async function sendPoint(iteration) {
  const latitude = BASE_LAT + randomOffset();
  const longitude = BASE_LON + randomOffset();
  const speed = Math.round(Math.random() * 60); // km/h
  const heading = Math.round(Math.random() * 359);

  const { data, error } = await supabase.rpc('insert_vehicle_location', {
    p_vehicle_id: vehicleId,
    p_latitude: latitude,
    p_longitude: longitude,
    p_speed: speed,
    p_heading: heading,
  });

  if (error) {
    console.error(`[${iteration}] Error insert:`, error.message);
  } else {
    console.log(
      `[${iteration}] OK id=${data} lat=${latitude.toFixed(5)} lon=${longitude.toFixed(5)} speed=${speed} heading=${heading}`
    );
  }
}

async function loop() {
  let i = 1;
  console.log(
    `Iniciando simulación para vehículo ${vehicleId} (Ctrl+C para detener)`
  );
  while (true) {
    await sendPoint(i++);
    await new Promise((r) => setTimeout(r, 4000)); // cada ~4s
  }
}

loop();
