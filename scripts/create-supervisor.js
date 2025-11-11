/**
 * Script para crear usuario supervisor en Supabase
 * Ejecutar con: node scripts/create-supervisor.js
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Cargar variables de entorno
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: VITE_SUPABASE_URL no está configurada');
  console.log('Agrega esta variable a tu archivo .env');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.log('Agrega esta variable a tu archivo .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui');
  console.log(
    '\nPuedes obtenerla en: https://app.supabase.com/project/tu-proyecto-id/settings/api'
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

async function createSupervisor() {
  console.log('\n🔧 Creación de Usuario Supervisor\n');
  console.log('El rol de supervisor permite:');
  console.log('  ✅ Crear y gestionar asignaciones de vehículos a conductores');
  console.log('  ✅ Ver y editar información de conductores y vehículos');
  console.log('  ✅ Gestionar turnos y horarios');
  console.log('  ✅ Ver reportes y estadísticas\n');

  console.log('Configuración por defecto:');
  console.log('- Username: supervisor');
  console.log('- Email: supervisor@flotavehicular.com');
  console.log('- Password: Supervisor123!');
  console.log('- Rol: supervisor\n');

  const useDefaults = await question(
    '¿Usar configuración por defecto? (S/n): '
  );

  let username = 'supervisor';
  let email = 'supervisor@flotavehicular.com';
  let password = 'Supervisor123!';
  let firstName = 'Supervisor';
  let lastName = 'General';
  let rol = 'supervisor';

  if (useDefaults.toLowerCase() === 'n') {
    username = await question('Username: ');
    email = await question('Email: ');
    firstName = await question('Nombre: ');
    lastName = await question('Apellido: ');
    password = await question('Password: ');
  }

  console.log('\n⏳ Creando usuario supervisor...\n');

  try {
    // Verificar si existe la tabla 'usuario' o 'users'
    const { data: tablesCheck, error: tableCheckError } = await supabase
      .from('usuario')
      .select('username')
      .limit(1);

    const useUsuarioTable = !tableCheckError;

    if (useUsuarioTable) {
      console.log('📊 Usando tabla "usuario"\n');

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('usuario')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        console.log('⚠️  Usuario ya existe. Actualizando...\n');
      }

      // Insertar o actualizar usando SQL directo con hash de password
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          -- Asegurar que pgcrypto está instalado
          CREATE EXTENSION IF NOT EXISTS pgcrypto;
          
          -- Insertar o actualizar usuario supervisor
          INSERT INTO public.usuario (
            username,
            password_hash,
            rol,
            email,
            activo,
            fecha_creacion
          ) 
          VALUES (
            $1,
            crypt($2, gen_salt('bf')),
            $3,
            $4,
            true,
            NOW()
          )
          ON CONFLICT (username) DO UPDATE
            SET 
              rol = EXCLUDED.rol,
              activo = true,
              email = EXCLUDED.email,
              password_hash = crypt($2, gen_salt('bf'))
          RETURNING id_usuario, username, email, rol, activo;
        `,
        params: [username, password, rol, email],
      });

      if (error) {
        // Si falla, intentar inserción directa
        console.log(
          '⚠️  Método RPC no disponible. Intentando inserción directa...\n'
        );

        const { data: insertData, error: insertError } = await supabase
          .from('usuario')
          .upsert(
            {
              username,
              email,
              rol,
              activo: true,
              // Nota: el password necesitará ser hasheado manualmente
            },
            {
              onConflict: 'username',
            }
          )
          .select();

        if (insertError) throw insertError;

        console.log('✅ Usuario supervisor creado (sin hash de password)\n');
        console.log(
          '⚠️  ADVERTENCIA: Necesitas ejecutar manualmente el script SQL'
        );
        console.log('   para hashear la contraseña correctamente.\n');
        console.log('📧 Email:', email);
        console.log('👤 Username:', username);
        console.log('🔑 Password:', password, '(sin hashear)');
        console.log('👑 Rol:', rol);
      } else {
        console.log('✅ Usuario supervisor creado exitosamente!\n');
        console.log('📧 Email:', email);
        console.log('👤 Username:', username);
        console.log('🔑 Password:', password);
        console.log('👑 Rol:', rol);
      }
    } else {
      // Usar tabla 'users'
      console.log('📊 Usando tabla "users"\n');

      // Obtener o crear company_id
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      let companyId;
      if (companies && companies.length > 0) {
        companyId = companies[0].id;
      } else {
        console.log('⚠️  No se encontró ninguna compañía. Creando una...\n');
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: 'FleetManager Demo',
            nit: '900.123.456-7',
          })
          .select()
          .single();

        if (companyError) throw companyError;
        companyId = newCompany.id;
      }

      // Insertar supervisor
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            email,
            first_name: firstName,
            last_name: lastName,
            role: 'supervisor',
            company_id: companyId,
            is_active: true,
          },
          {
            onConflict: 'email',
          }
        )
        .select();

      if (error) throw error;

      console.log('✅ Usuario supervisor creado exitosamente!\n');
      console.log('📧 Email:', email);
      console.log('👤 Nombre:', firstName, lastName);
      console.log('👑 Rol: supervisor');
      console.log(
        '\n⚠️  NOTA: El password debe configurarse mediante Supabase Auth'
      );
    }

    console.log(
      '\n⚠️  IMPORTANTE: Cambia esta contraseña en el primer login\n'
    );
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Solución alternativa:');
    console.log('Ejecuta manualmente el script SQL en Supabase Dashboard:');
    console.log(`https://app.supabase.com/project/[tu-proyecto-id]/sql/new\n`);
    console.log('SQL a ejecutar:');
    console.log(`
-- Crear usuario supervisor
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  'supervisor',
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
RETURNING id_usuario, username, email, rol;
    `);
  } finally {
    rl.close();
  }
}

// Ejecutar
createSupervisor().catch(console.error);
