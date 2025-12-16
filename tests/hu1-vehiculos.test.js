import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from '../src/api/vehiculos';
import { supabase } from '../src/lib/supabaseClient';

// Mock Supabase client
vi.mock('../src/lib/supabaseClient', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

// Helper to build a minimal query builder with chainable methods
function buildQueryBuilder({ data = [], error = null, trackers = {} } = {}) {
  const builder = {
    _data: data,
    _error: error,
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    selectReturn: vi.fn().mockResolvedValue({ data, error }),
  };

  // resolve methods to mimic Supabase response
  builder.then = undefined; // avoid being treated as a Promise
  builder.select.mockImplementation(() => builder);
  builder.order.mockImplementation(() => builder);
  builder.eq.mockImplementation(() => builder);
  builder.or.mockImplementation(() => builder);
  builder.insert.mockImplementation(() => builder);
  builder.update.mockImplementation(() => builder);
  builder.delete.mockImplementation(() => builder);
  builder.selectReturn.mockImplementation(() => ({ data, error }));

  // emulate awaiting the builder directly
  builder.then = (onFulfilled) => onFulfilled({ data, error });

  trackers.builder = builder;
  return builder;
}

describe('Vehiculos API (HU1 - Inventario de vehículos)', () => {
  const mockVehicles = [
    { id: 'v1', placa: 'AAA111', marca: 'Toyota', estado: 'activo' },
    { id: 'v2', placa: 'BBB222', marca: 'Kia', estado: 'mantenimiento' },
  ];

  let fromSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    fromSpy = vi.mocked(supabase.from);
  });

  it('filtra vehículos por estado', async () => {
    const trackers = {};
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('vehiculo');
      return buildQueryBuilder({ data: mockVehicles, trackers });
    });

    const { data, error } = await getVehiculos({ estado: 'activo' });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(trackers.builder.eq).toHaveBeenCalledWith('estado', 'activo');
    expect(trackers.builder.order).toHaveBeenCalled();
  });

  it('crea un vehículo y retorna el registro', async () => {
    const newVehicle = { placa: 'CCC333', marca: 'Mazda' };
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('vehiculo');
      return buildQueryBuilder({ data: { id: 'vx', ...newVehicle } });
    });

    const { data, error } = await createVehiculo(newVehicle);

    expect(error).toBeNull();
    expect(data.placa).toBe('CCC333');
    expect(data.marca).toBe('Mazda');
  });

  it('actualiza un vehículo existente', async () => {
    const updates = { estado: 'mantenimiento' };
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('vehiculo');
      return buildQueryBuilder({ data: { id: 'v1', ...updates } });
    });

    const { data, error } = await updateVehiculo('v1', updates);

    expect(error).toBeNull();
    expect(data.estado).toBe('mantenimiento');
  });

  it('elimina un vehículo y devuelve success', async () => {
    const trackers = {};
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('vehiculo');
      const builder = buildQueryBuilder({ data: null, trackers });
      builder.delete.mockReturnThis();
      builder.eq.mockResolvedValue({ data: null, error: null });
      return builder;
    });

    const { success, error } = await deleteVehiculo('v1');

    expect(error).toBeNull();
    expect(success).toBe(true);
  });
});
