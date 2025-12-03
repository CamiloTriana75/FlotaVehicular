import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCSVString,
  addStatusChange,
  loadStatusHistory,
} from '../src/shared/utils/statusHistory';

// Polyfill localStorage for tests if necessary
const memoryStore = (() => {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = global.localStorage || memoryStore;

describe('statusHistory utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates CSV string with headers and rows', () => {
    const history = [
      {
        id: '1',
        vehicleId: 10,
        oldStatus: 'activo',
        newStatus: 'mantenimiento',
        userId: 'u1',
        userEmail: 'admin@test.com',
        timestamp: '2024-01-01T12:34:56Z',
      },
    ];

    const csv = generateCSVString(history);
    expect(csv).toContain('Fecha,Hora,Usuario,Estado anterior,Estado nuevo');
    expect(csv).toContain('01/01/2024');
    expect(csv).toContain('12:34:56');
    expect(csv).toContain('admin@test.com');
    expect(csv).toContain('activo');
    expect(csv).toContain('mantenimiento');
  });

  it('adds status change and persists to storage', () => {
    const vehicle = { id: 99, status: 'activo' };
    const user = { id: 'u2', email: 'admin@test.com' };
    const { vehicle: updated, entry } = addStatusChange(
      vehicle,
      'mantenimiento',
      user
    );
    expect(updated.status).toBe('mantenimiento');
    expect(entry.oldStatus).toBe('activo');
    expect(entry.newStatus).toBe('mantenimiento');

    const loaded = loadStatusHistory(99);
    expect(loaded.length).toBe(1);
    expect(loaded[0].newStatus).toBe('mantenimiento');
  });
});
