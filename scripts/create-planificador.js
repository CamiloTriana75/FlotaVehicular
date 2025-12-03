/**
 * Script para crear usuarios con rol "planificador"
 *
 * Uso:
 *   node scripts/create-planificador.js <nombre> <email> <password>
 *
 * Ejemplo:
 *   node scripts/create-planificador.js "María Planificadora" planificador@fleet.com planificador123
 */

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Error: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidos en .env'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPlanificador(nombre, email, password) {
  try {
    console.log('🔐 Hasheando contraseña...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('📝 Creando usuario planificador en la base de datos...');

    const { data, error } = await supabase
      .from('usuario')
      .insert([
        {
          nombre: nombre,
          email: email,
          password_hash: passwordHash,
          rol: 'planificador',
          estado: 'activo',
        },
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        console.error('❌ Error: El email ya existe en la base de datos');
      } else {
        console.error('❌ Error al crear usuario:', error.message);
      }
      process.exit(1);
    }

    console.log('\n✅ Usuario planificador creado exitosamente!');
    console.log('📋 Detalles:');
    console.log(`   - ID: ${data[0].id}`);
    console.log(`   - Nombre: ${data[0].nombre}`);
    console.log(`   - Email: ${data[0].email}`);
    console.log(`   - Rol: ${data[0].rol}`);
    console.log(`   - Estado: ${data[0].estado}`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log(`   - Email: ${email}`);
    console.log(`   - Contraseña: ${password}`);
    console.log('\n📌 Permisos del planificador:');
    console.log('   ✅ Crear, editar y eliminar rutas');
    console.log('   ✅ Asignar rutas a conductores/vehículos');
    console.log('   ✅ Ver conductores (solo lectura)');
    console.log('   ✅ Ver vehículos (solo lectura)');
    console.log('   ✅ Ver asignaciones conductor-vehículo');
    console.log('   ❌ NO puede gestionar usuarios');
    console.log('   ❌ NO puede modificar vehículos');
    console.log('   ❌ NO puede modificar conductores');
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    process.exit(1);
  }
}

// Validar argumentos
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('❌ Uso incorrecto');
  console.log('\n📖 Uso:');
  console.log(
    '   node scripts/create-planificador.js <nombre> <email> <password>'
  );
  console.log('\n📝 Ejemplo:');
  console.log(
    '   node scripts/create-planificador.js "María Planificadora" planificador@fleet.com planificador123'
  );
  console.log(
    '\n💡 Nota: Si el nombre tiene espacios, enciérralo entre comillas'
  );
  process.exit(1);
}

const [nombre, email, password] = args;

// Validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Error: Email inválido');
  process.exit(1);
}

// Validar contraseña
if (password.length < 8) {
  console.error('❌ Error: La contraseña debe tener al menos 8 caracteres');
  process.exit(1);
}

// Crear usuario
createPlanificador(nombre, email, password);
