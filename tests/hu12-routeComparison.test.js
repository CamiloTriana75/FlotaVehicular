import { describe, it, expect, vi } from 'vitest';
import {
  getRouteTrajectory,
  getRouteStatistics,
  getActiveRoutesMonitoring,
} from '../src/services/routeService';
import { supabase } from '../src/lib/supabaseClient';

// HU12: Comparar rutas planificadas vs. recorridas reales

vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('HU12 - Route comparison and monitoring', () => {
  it('getRouteTrajectory returns list of GPS points', async () => {
    supabase.rpc.mockResolvedValue({
      data: [{ lat: 4.7, lng: -74.07 }],
      error: null,
    });
    const { data, error } = await getRouteTrajectory('asig-1');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('lat');
  });

  it('getRouteStatistics returns summarized metrics', async () => {
    supabase.rpc.mockResolvedValue({
      data: [{ total_distance_km: 15, avg_speed_kmh: 30 }],
      error: null,
    });
    const { data, error } = await getRouteStatistics('asig-2');
    expect(error).toBeNull();
    expect(data.total_distance_km).toBe(15);
  });

  it('getActiveRoutesMonitoring lists current routes in progress', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (onFulfilled) =>
        onFulfilled({ data: [{ id: 'ra1' }], error: null }),
    };
    supabase.from.mockReturnValue(builder);

    const { data, error } = await getActiveRoutesMonitoring();
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
