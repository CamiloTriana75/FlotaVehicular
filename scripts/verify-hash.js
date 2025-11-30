/**
 * Script para verificar qué contraseña corresponde a un hash bcrypt
 * Usa la API de Supabase para verificar
 */

import { createClient } from '@supabase/supabase-js';

const hash = '$2a$06$HtcQqVyUjxKXPUuKouKOOevjsMhnfTvGYale7FT0MWjYUfz/utJ/m';

const passwords = [
  { name: 'Superusuario', pass: 'Super123!' },
  { name: 'Admin', pass: 'Admin123!' },
  { name: 'RRHH', pass: 'RRHH2025!' },
  { name: 'Supervisor', pass: 'Supervisor123!' },
  { name: 'Planificador', pass: 'Planificador123!' },
  { name: 'Operador', pass: 'Operador2024!' },
  { name: 'Conductor', pass: 'Conductor123!' },
  // Variantes sin signos
  { name: 'Super (sin !)', pass: 'Super123' },
  { name: 'Admin (sin !)', pass: 'Admin123' },
  { name: 'RRHH (sin !)', pass: 'RRHH2025' },
  { name: 'Supervisor (sin !)', pass: 'Supervisor123' },
  { name: 'Planificador (sin !)', pass: 'Planificador123' },
  { name: 'Operador (sin !)', pass: 'Operador2024' },
  { name: 'Conductor (sin !)', pass: 'Conductor123' },
  // Variantes comunes
  { name: 'planificador', pass: 'planificador' },
  { name: 'Planificador', pass: 'Planificador' },
  { name: 'planificador123', pass: 'planificador123' },
  { name: 'Password123', pass: 'Password123' },
  { name: 'password', pass: 'password' },
  { name: '123456', pass: '123456' },
  { name: 'admin', pass: 'admin' },
];

console.log('🔍 Hash a verificar:');
console.log(hash);
console.log('\n📋 Contraseñas del sistema a probar:\n');

passwords.forEach(({ name, pass }) => {
  console.log(`  ${name}: ${pass}`);
});

console.log('\n⚠️ Para verificar el hash, ejecuta este SQL en Supabase:');
console.log('\nSELECT');
passwords.forEach(({ name, pass }, idx) => {
  const comma = idx < passwords.length - 1 ? ',' : '';
  console.log(`  crypt('${pass}', '${hash}') = '${hash}' AS "${name}"${comma}`);
});
console.log(';\n');

console.log('✅ La columna que retorne TRUE indica la contraseña correcta.\n');
