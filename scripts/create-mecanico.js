/**
 * Script: create-mecanico.js (simplificado - sin bcryptjs)
 * Uso: node scripts/create-mecanico.js username email password
 *
 * Insertar en tabla usuario con rol 'mecanico'
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    '❌ Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env'
  );
  console.log('\nAsegúrate de agregar a .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_key_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createMecanico(username, email, password) {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .upsert(
        [
          {
            username,
            password_hash: password,
            email,
            rol: 'mecanico',
            activo: true,
          },
        ],
        { onConflict: 'username' }
      )
      .select();

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Usuario mecanico creado/actualizado exitosamente');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Rol: mecanico`);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('❌ Faltan argumentos');
  console.log('Uso: node scripts/create-mecanico.js username email password');
  console.log('');
  console.log('Ejemplo:');
  console.log(
    '  node scripts/create-mecanico.js mecanico mecanico@flota.com Mecanico123!'
  );
  process.exit(1);
}

createMecanico(args[0], args[1], args[2]);
