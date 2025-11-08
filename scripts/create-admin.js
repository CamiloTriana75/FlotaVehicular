/**
 * Script para crear usuario administrador en Supabase
 * Ejecutar con: node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Cargar variables de entorno (asegúrate de tener un .env en la raíz)
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://nqsfitpsygpwfglchihl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitas la SERVICE KEY, no la ANON KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.log('Agrega esta variable a tu archivo .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui');
  console.log(
    '\nPuedes obtenerla en: https://app.supabase.com/project/nqsfitpsygpwfglchihl/settings/api'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  console.log('\n🔧 Creación de Usuario Administrador\n');
  console.log('Configuración por defecto:');
  console.log('- Username: admin');
  console.log('- Email: admin@flotavehicular.com');
  console.log('- Password: Admin123!');
  console.log('- Rol: superusuario\n');

  const useDefaults = await question(
    '¿Usar configuración por defecto? (S/n): '
  );

  let username = 'admin';
  let email = 'admin@flotavehicular.com';
  let password = 'Admin123!';
  let rol = 'superusuario';

  if (useDefaults.toLowerCase() === 'n') {
    username = await question('Username: ');
    email = await question('Email: ');
    password = await question('Password: ');
    const rolInput = await question(
      'Rol (superusuario/administrador/mecanico/conductor): '
    );
    if (rolInput) rol = rolInput;
  }

  console.log('\n⏳ Creando usuario...\n');

  try {
    // Primero, verificar si existe la tabla 'usuario' o 'users'
    const { data: tables, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
          SELECT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'usuario'
          ) as has_usuario,
          EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'users'
          ) as has_users
        `,
    });

    if (tableError) {
      console.error('❌ Error verificando tablas:', tableError.message);

      // Intento alternativo: insertar directamente
      console.log('⚠️  Intentando inserción directa...\n');

      const { data, error } = await supabase
        .from('usuario')
        .upsert(
          {
            username,
            email,
            rol,
            activo: true,
            password_hash: password, // Nota: necesitarás hashear esto en un trigger o función
          },
          {
            onConflict: 'username',
          }
        )
        .select();

      if (error) {
        throw error;
      }

      console.log('✅ Usuario creado exitosamente (sin hash de password)');
      console.log('⚠️  ADVERTENCIA: La contraseña no está hasheada.');
      console.log(
        '   Ejecuta manualmente el script SQL para hashearla correctamente.\n'
      );
      console.log(data);
    } else {
      // Ejecutar el SQL completo con hash
      const sqlQuery = `
        -- Asegurar que pgcrypto está instalado
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        
        -- Insertar usuario
        INSERT INTO public.usuario (
          username,
          password_hash,
          rol,
          email,
          activo,
          fecha_creacion
        ) 
        VALUES (
          '${username}',
          crypt('${password}', gen_salt('bf')),
          '${rol}',
          '${email}',
          true,
          NOW()
        )
        ON CONFLICT (username) DO UPDATE
          SET 
            rol = EXCLUDED.rol,
            activo = true,
            email = EXCLUDED.email,
            password_hash = crypt('${password}', gen_salt('bf'))
        RETURNING id_usuario, username, email, rol, activo;
      `;

      const { data, error } = await supabase.rpc('exec_sql', { sql: sqlQuery });

      if (error) {
        throw error;
      }

      console.log('✅ Usuario administrador creado exitosamente!\n');
      console.log('📧 Email:', email);
      console.log('👤 Username:', username);
      console.log('🔑 Password:', password);
      console.log('👑 Rol:', rol);
      console.log(
        '\n⚠️  IMPORTANTE: Cambia esta contraseña en el primer login\n'
      );
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Solución alternativa:');
    console.log('Ejecuta manualmente el archivo SQL:');
    console.log('supabase/migrations/20251108000001_add_admin_user.sql\n');
    console.log('En el SQL Editor de Supabase Dashboard:');
    console.log(
      `https://app.supabase.com/project/nqsfitpsygpwfglchihl/editor\n`
    );
  } finally {
    rl.close();
  }
}

// Ejecutar
createAdminUser().catch(console.error);
