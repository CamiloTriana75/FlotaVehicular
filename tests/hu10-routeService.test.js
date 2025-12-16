import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  optimizeRoute,
  calculateSimpleRoute,
  createRoute,
  getRoutes,
  assignRouteToDriver,
} from '../src/services/routeService';
import { supabase } from '../src/lib/supabaseClient';

// HU10: Crear y asignar rutas optimizadas

vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const makeBuilder = ({ data = [], error = null }) => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    then: (onFulfilled) => onFulfilled({ data, error }),
  };
  return builder;
};

describe('HU10 - RouteService', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_MAPBOX_TOKEN = 'test-token';
  });

  it('optimizeRoute returns structured data on success', async () => {
    const mapboxResponse = {
      trips: [
        {
          distance: 5000,
          duration: 900,
          geometry: { type: 'LineString', coordinates: [] },
          legs: [
            { distance: 3000, duration: 500, steps: [{}, {}], summary: 'leg1' },
            { distance: 2000, duration: 400, steps: [{}], summary: 'leg2' },
          ],
        },
      ],
      waypoints: [
        { waypoint_index: 0, name: 'A', location: [0, 0] },
        { waypoint_index: 1, name: 'B', location: [1, 1] },
      ],
    };

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => mapboxResponse });

    const { data, error } = await optimizeRoute([
      { lng: -74.0, lat: 4.7 },
      { lng: -74.1, lat: 4.71 },
    ]);

    expect(error).toBeNull();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.optimizedOrder)).toBe(true);
    expect(data.totalDistance).toBe(5000);
    expect(data.legs.length).toBe(2);

    global.fetch = originalFetch;
  });

  it('calculateSimpleRoute returns legs on success', async () => {
    const directionsResponse = {
      routes: [{ distance: 1000, duration: 200, geometry: {}, legs: [{}, {}] }],
    };

    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => directionsResponse });

    const { data, error } = await calculateSimpleRoute(
      { lng: -74.0, lat: 4.7 },
      { lng: -74.1, lat: 4.71 }
    );

    expect(error).toBeNull();
    expect(data.distance).toBe(1000);
    expect(data.legs.length).toBe(2);

    global.fetch = originalFetch;
  });

  it('createRoute inserts record via supabase', async () => {
    const builder = makeBuilder({ data: { id: 'r1', name: 'Ruta test' } });
    supabase.from.mockReturnValue(builder);

    const { data, error } = await createRoute({
      name: 'Ruta test',
      waypoints: [],
      totalDistance: 1234,
      totalDuration: 567,
      geometry: {},
    });

    expect(error).toBeNull();
    expect(data.id).toBe('r1');
  });

  it('getRoutes filters by status', async () => {
    const rows = [
      { id: 1, status: 'active' },
      { id: 2, status: 'active' },
    ];
    const builder = makeBuilder({ data: rows });
    supabase.from.mockReturnValue(builder);

    const { data, error } = await getRoutes({ status: 'active' });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('assignRouteToDriver returns joined data', async () => {
    const joined = {
      id: 'ra1',
      route: { id: 'r1', name: 'Ruta A' },
      driver: { id: 'd1', nombre: 'Juan', apellidos: 'Perez' },
      vehicle: { id: 'v1', placa: 'ABC123' },
    };
    const builder = makeBuilder({ data: joined });
    supabase.from.mockReturnValue(builder);

    const { data, error } = await assignRouteToDriver({
      routeId: 'r1',
      driverId: 'd1',
      vehicleId: 'v1',
      scheduledStart: new Date(),
      scheduledEnd: new Date(),
    });

    expect(error).toBeNull();
    expect(data.route.name).toBe('Ruta A');
    expect(data.vehicle.placa).toBe('ABC123');
  });
});
