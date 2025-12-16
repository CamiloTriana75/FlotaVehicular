import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geofenceService } from '../src/services/geofenceService';
import { supabase } from '../src/lib/supabaseClient';

// Mock supabase
vi.mock('../src/lib/supabaseClient', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      functions: { invoke: vi.fn() },
    },
  };
});

const makeBuilder = ({ data = [], error = null, tracker = {} } = {}) => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  builder.then = (onFulfilled) => onFulfilled({ data, error });
  tracker.builder = builder;
  return builder;
};

describe('HU8 - Geocercas (geofenceService)', () => {
  const fromSpy = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista geocercas ordenadas por updated_at', async () => {
    const tracker = {};
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('geofences');
      return makeBuilder({ data: [{ id: 1 }], tracker });
    });

    const data = await geofenceService.list();

    expect(Array.isArray(data)).toBe(true);
    expect(tracker.builder.order).toHaveBeenCalledWith('updated_at', {
      ascending: false,
    });
  });

  it('crea geocerca y devuelve registro', async () => {
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('geofences');
      const builder = makeBuilder({ data: { id: 99, nombre: 'Zona' } });
      builder.insert.mockReturnThis();
      return builder;
    });

    const created = await geofenceService.create({
      nombre: 'Zona',
      descripcion: 'Desc',
      tipo: 'circle',
      geometry: { type: 'Point', coordinates: [0, 0] },
      radio_m: 100,
    });

    expect(created.id).toBe(99);
    expect(created.nombre).toBe('Zona');
  });

  it('actualiza geocerca existente', async () => {
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('geofences');
      const builder = makeBuilder({ data: { id: 1, nombre: 'Nueva' } });
      builder.update.mockReturnThis();
      builder.eq.mockReturnThis();
      return builder;
    });

    const updated = await geofenceService.update(1, { nombre: 'Nueva' });

    expect(updated.nombre).toBe('Nueva');
  });

  it('elimina geocerca', async () => {
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('geofences');
      const builder = makeBuilder({ data: null, error: null });
      builder.delete.mockReturnThis();
      builder.eq.mockReturnThis();
      builder.then = (onFulfilled) => onFulfilled({ data: null, error: null });
      return builder;
    });

    const res = await geofenceService.remove(10);
    expect(res).toBe(true);
  });

  it('lista eventos de geocerca con join de vehículo', async () => {
    const tracker = {};
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('geofence_events');
      const builder = makeBuilder({
        data: [{ id: 1, vehicle_id: 5 }],
        tracker,
      });
      builder.order.mockReturnThis();
      builder.limit.mockReturnThis();
      return builder;
    });

    const events = await geofenceService.listEvents({
      vehicleId: 5,
      limit: 10,
    });
    expect(events[0].vehicle_id).toBe(5);
    expect(tracker.builder.eq).toHaveBeenCalledWith('vehicle_id', 5);
  });

  it('evalúa posición llamando a función edge', async () => {
    const invokeSpy = vi.mocked(supabase.functions.invoke);
    invokeSpy.mockResolvedValue({ data: { inside: true }, error: null });

    const res = await geofenceService.evaluate({
      vehicleId: 1,
      lng: -74,
      lat: 4.6,
    });

    expect(res.inside).toBe(true);
    expect(invokeSpy).toHaveBeenCalledWith('geofence-evaluator', {
      body: { vehicleId: 1, position: { lng: -74, lat: 4.6 } },
    });
  });
});
