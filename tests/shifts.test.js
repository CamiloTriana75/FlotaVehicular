import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../src/lib/supabaseClient';
import {
  createShiftTemplate,
  assignShiftToDriver,
  getDriverHoursForPeriod,
  deleteDriverShiftsByDriver,
} from '../src/api/shifts';

describe('Shifts Service', () => {
  let driverId;
  let templateId;

  beforeAll(async () => {
    // crear driver de prueba
    const { data: driver, error: dErr } = await supabase
      .from('drivers')
      .insert({ cedula: '9991000', nombre: 'Test', apellidos: 'Driver' })
      .select()
      .single();
    if (dErr) throw dErr;
    driverId = driver.id;

    // crear plantilla: turno nocturno 22:00-06:00
    const res = await createShiftTemplate({ name: 'Nocturno', start_time: '22:00', end_time: '06:00', notes: 'Turno nocturno' });
    if (res.error) throw res.error;
    templateId = res.data.id;
  });

  afterAll(async () => {
    if (driverId) {
      await deleteDriverShiftsByDriver(driverId);
      await supabase.from('drivers').delete().eq('id', driverId);
    }
    if (templateId) {
      await supabase.from('shift_templates').delete().eq('id', templateId);
    }
  });

  it('calcula correctamente horas para turno nocturno (22:00-06:00)', async () => {
    // Asignar turno para 2025-01-06 (22:00 del día 6 hasta 06:00 del día 7)
    const assign = await assignShiftToDriver({ driver_id: driverId, shift_id: templateId, shift_date: '2025-01-06' });
    expect(assign.error).toBeNull();
    expect(assign.data).toBeDefined();

    // Calcular horas en semana que contiene la fecha (ej. 2025-01-05 a 2025-01-11)
    const hoursRes = await getDriverHoursForPeriod(driverId, '2025-01-05', '2025-01-11');
    expect(hoursRes.error).toBeNull();
    expect(hoursRes.data).toBeDefined();
    // Turno 22:00-06:00 = 8 horas
    expect(Number(hoursRes.data.total_hours)).toBeCloseTo(8, 2);
  });
});
