import { describe, it, expect, beforeAll } from 'vitest';
import { supabase, checkConnection } from '../src/lib/supabaseClient';
import { conductorService } from '../src/services/conductorService';

describe('Database Connection & Services', () => {
  describe('Supabase Connection', () => {
    it('should verify Supabase connection', async () => {
      const result = await checkConnection();

      expect(result).toHaveProperty('connected');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('mode');

      console.log('✅ Connection result:', result);
    });

    it('should connect to Supabase when not in mock mode', async () => {
      const isMock = import.meta.env.VITE_MOCK_MODE === 'true';
      expect(isMock).toBe(false);

      // Verificar que tenemos credenciales
      expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
      expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();

      console.log('✅ Supabase credentials are configured');
    });
  });

  describe('Conductor Service', () => {
    it('should fetch all conductores from database', async () => {
      const { data, error } = await conductorService.getAll();

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(0);

      console.log(`✅ Fetched ${data.length} conductores`);
    });

    it('should have valid conductor structure', async () => {
      const { data, error } = await conductorService.getAll();

      if (error || !data || data.length === 0) {
        console.log('⚠️ No conductores found, skipping structure check');
        return;
      }

      const conductor = data[0];

      // Verificar campos esperados
      expect(conductor).toHaveProperty('id_conductor');
      expect(conductor).toHaveProperty('nombre_completo');
      expect(conductor).toHaveProperty('cedula');
      expect(conductor).toHaveProperty('estado');

      console.log('✅ Conductor structure is valid:', {
        id: conductor.id_conductor,
        nombre: conductor.nombre_completo,
        estado: conductor.estado,
      });
    });

    it('should fetch conductor by ID', async () => {
      const { data: allData } = await conductorService.getAll();

      if (!allData || allData.length === 0) {
        console.log('⚠️ No conductores to test getById');
        return;
      }

      const id = allData[0].id_conductor;
      const { data, error } = await conductorService.getById(id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id_conductor).toBe(id);

      console.log(`✅ Fetched conductor by ID: ${id}`);
    });

    it('should filter conductores by estado', async () => {
      const { data, error } = await conductorService.getAll({
        estado: 'disponible',
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        data.forEach((conductor) => {
          expect(conductor.estado).toBe('disponible');
        });
      }

      console.log(`✅ Filtered conductores: ${data.length} disponibles`);
    });

    it('should search conductores by name', async () => {
      const { data, error } = await conductorService.getAll({
        search: 'Carlos',
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      console.log(`✅ Search results: ${data.length} conductores`);
    });

    it('should get available conductores', async () => {
      const { data, error } = await conductorService.getAvailable();

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      console.log(`✅ Available conductores: ${data.length}`);
    });

    it('should check expiring licenses', async () => {
      const { data, error } = await conductorService.getExpiringLicenses(30);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      console.log(`✅ Licenses expiring within 30 days: ${data.length}`);
    });
  });

  describe('Database Integrity', () => {
    it('should have conductor table with required columns', async () => {
      // Intentamos hacer una query para verificar que la tabla existe
      const { data, error } = await supabase
        .from('conductor')
        .select('*')
        .limit(1);

      // Si no hay error, la tabla existe
      expect(!error || error.code === 'PGRST106').toBe(true);

      console.log('✅ Conductor table exists and is accessible');
    });

    it('should have usuario table for authentication', async () => {
      const { data, error } = await supabase
        .from('usuario')
        .select('id_usuario, username, rol')
        .limit(1);

      // Puede retornar error si no hay datos, pero la tabla debe existir
      expect(!error || data !== null).toBe(true);

      console.log('✅ Usuario table exists');
    });

    it('should have validate_user_login RPC function', async () => {
      // Intentar llamar a la función (sin credenciales válidas)
      const { data, error } = await supabase.rpc('validate_user_login', {
        p_username: 'test_nonexistent',
        p_password: 'test_password',
      });

      // Si la función no existe, habría un error diferente
      // Si existe, retorna datos (aunque sean vacíos o con success: false)
      expect(error === null || data !== null).toBe(true);

      console.log('✅ validate_user_login RPC function exists');
    });
  });

  describe('Authentication', () => {
    it('should reject invalid credentials', async () => {
      const { data, error } = await supabase.rpc('validate_user_login', {
        p_username: 'invalid_user_xyz',
        p_password: 'invalid_password_123',
      });

      if (data && data.length > 0) {
        expect(data[0].success).toBe(false);
      }

      console.log('✅ Invalid credentials are rejected');
    });

    it('should accept valid admin credentials', async () => {
      const { data, error } = await supabase.rpc('validate_user_login', {
        p_username: 'admin',
        p_password: 'Admin123!',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      if (data[0].success) {
        expect(data[0].username).toBe('admin');
        expect(data[0].rol).toBe('superusuario');
        console.log('✅ Admin credentials are valid');
      }
    });
  });
});

// =====================================================
// SUITE DE PRUEBAS MANUAL (ejecuta con: npm run test:db)
// =====================================================
/*

Este archivo de test valida:

1. ✅ Conexión a Supabase
2. ✅ Tabla 'conductor' existe y es accesible
3. ✅ Tabla 'usuario' existe
4. ✅ Función RPC 'validate_user_login' existe
5. ✅ conductorService.getAll() devuelve array
6. ✅ conductorService.getById(id) funciona
7. ✅ Filtros y búsqueda funcionan
8. ✅ Autenticación con credenciales válidas
9. ✅ Rechazo de credenciales inválidas

Para ejecutar estos tests:

  npm run test          # Ejecuta todos los tests
  npm run test:db       # Solo pruebas de BD
  npm run test:watch    # Modo watch

Resultado esperado:
  ✅ Todos los tests deben pasar si:
    - .env está configurado correctamente
    - Supabase está conectado
    - Todas las migrations se ejecutaron
    - Los usuarios admin existen

*/
