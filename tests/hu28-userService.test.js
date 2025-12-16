import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService, ALLOWED_ROLES } from '../src/services/userService';

// HU28: Gestión de usuarios y permisos con roles granulares

vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
  isInMockMode: () => true,
}));

const mockLocal = () => {
  const store = new Map();
  vi.spyOn(global, 'localStorage', 'get').mockReturnValue({
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, v),
  });
  return store;
};

describe('HU28 - userService roles', () => {
  let store;
  beforeEach(() => {
    vi.clearAllMocks();
    store = mockLocal();
    store.set('usersMockList', JSON.stringify([]));
  });

  it('create adds user in mock mode and normalizes role', async () => {
    const { data, error } = await userService.create({
      username: 'carlos',
      email: 'carlos@example.com',
      rol: 'admin',
      password: 'Secret$123',
    });
    expect(error).toBeNull();
    expect(data.id_usuario).toBeDefined();
    const list = JSON.parse(store.get('usersMockList'));
    expect(list.length).toBe(1);
    expect(list[0].role).toBe('admin');
  });

  it('updateRole enforces allowed roles', async () => {
    const invalid = await userService.updateRole(1, 'invalid');
    expect(invalid.error).toBeDefined();

    const ok = await userService.updateRole(1, ALLOWED_ROLES[0]);
    expect(ok.error).toBeNull();
    expect(ok.data.rol).toBe(ALLOWED_ROLES[0]);
  });

  it('list returns normalized fields from local mock', async () => {
    const rawUser = {
      id: 99,
      name: 'ana',
      email: 'ana@example.com',
      role: 'supervisor',
      createdAt: new Date().toISOString(),
    };
    store.set('usersMockList', JSON.stringify([rawUser]));
    const { data, error } = await userService.list();
    expect(error).toBeNull();
    expect(data[0].id_usuario).toBe(99);
    expect(data[0].rol).toBe('supervisor');
  });

  it('remove deletes user in mock mode', async () => {
    const rawUser = {
      id: 77,
      name: 'mark',
      email: 'mark@example.com',
      role: 'operador',
      createdAt: new Date().toISOString(),
    };
    store.set('usersMockList', JSON.stringify([rawUser]));
    const { error } = await userService.remove(77);
    expect(error).toBeNull();
    const list = JSON.parse(store.get('usersMockList'));
    expect(list.length).toBe(0);
  });
});
