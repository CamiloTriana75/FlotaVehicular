import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../src/lib/supabaseClient';
import { createFuelLog, getFuelLogsByVehicle, deleteFuelLogsByVehicle } from '../src/api/fuelLogs';

describe('Fuel Logs Service', () => {
  let vehicleId;

  beforeAll(async () => {
    // Crear vehículo de prueba (solo placa es requerida en muchas migraciones)
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({ placa: 'TEST-FUEL-001' })
      .select()
      .single();

    if (error) throw error;
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    // Limpiar fuel logs y vehículo
    if (vehicleId) {
      await deleteFuelLogsByVehicle(vehicleId);
      await supabase.from('vehicles').delete().eq('id', vehicleId);
    }
  });

  it('calcula rendimiento correctamente entre registros', async () => {
    // Insertar registro previo a 99,500 km
    const prev = await createFuelLog({
      vehicle_id: vehicleId,
      date: '2025-01-01',
      liters: 40,
      cost: 0,
      odometer: 99500,
    });

    expect(prev.error).toBeNull();

    // Insertar nuevo repostaje a 100,000 km con 50 litros
    const res = await createFuelLog({
      vehicle_id: vehicleId,
      date: '2025-01-15',
      liters: 50,
      cost: 100,
      odometer: 100000,
    });

    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();

    const created = res.data;

    // km_since_last = 500
    expect(Number(created.km_since_last)).toBe(500);

    // km_per_l = 500 / 50 = 10
    expect(Number(Number(created.km_per_l).toFixed(4))).toBeCloseTo(10, 4);

    // l_per_100km = (50 / 500) * 100 = 10
    expect(Number(Number(created.l_per_100km).toFixed(4))).toBeCloseTo(10, 4);

    // También comprobar que getFuelLogsByVehicle devuelve registros
    const list = await getFuelLogsByVehicle(vehicleId);
    expect(list.error).toBeNull();
    expect(Array.isArray(list.data)).toBe(true);
    expect(list.data.length).toBeGreaterThanOrEqual(2);
  });
});
