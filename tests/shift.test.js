import { describe, it, expect, beforeEach } from 'vitest';
import * as turnos from '../src/api/turnos.js';
import { calculateHoursForPeriod, driverHoursWithAlert } from '../src/utils/shiftUtils.js';

describe('Shift calculations', () => {
  beforeEach(() => {
    turnos.shifts.length = 0;
    turnos.assignments.length = 0;
  });

  it('includes night shift 22:00-06:00 correctly in weekly total (8h)', () => {
    turnos.createShift({ id: 'night-1', name: 'Nocturno', startTime: '22:00', endTime: '06:00' });
    turnos.assignShift({ id: 'a1', shiftId: 'night-1', driverId: 'driver-1', date: '2025-11-03' });

    const from = '2025-11-03T00:00:00';
    const to = '2025-11-09T23:59:59';

    const hours = calculateHoursForPeriod('driver-1', from, to, turnos.assignments, turnos.shifts);
    expect(hours).toBeCloseTo(8, 3);
  });

  it('flags when exceeding limit', () => {
    turnos.createShift({ id: 'day-1', name: 'Diurno', startTime: '08:00', endTime: '17:00' });
    // 9 hours per shift
    for (let i = 0; i < 6; i++) {
      const day = 3 + i;
      const dateStr = `2025-11-${String(day).padStart(2, '0')}`;
      turnos.assignShift({ id: `d${i}`, shiftId: 'day-1', driverId: 'driver-2', date: dateStr });
    }

    const from = '2025-11-01T00:00:00';
    const to = '2025-11-30T23:59:59';

    const { hours, exceeds } = driverHoursWithAlert('driver-2', from, to, turnos.assignments, turnos.shifts, 40);
    expect(hours).toBeGreaterThan(50);
    expect(exceeds).toBe(true);
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import * as turnos from '../src/api/turnos.js';
import { calculateHoursForPeriod, driverHoursWithAlert } from '../src/utils/shiftUtils.js';

describe('Shift calculations', () => {
  beforeEach(() => {
    // limpiar arrays in-memory
    turnos.shifts.length = 0;
    turnos.assignments.length = 0;
  });

  it('includes night shift 22:00-06:00 correctly in weekly total (8h)', () => {
    // Crear turno nocturno
    turnos.createShift({ id: 'night-1', name: 'Nocturno', startTime: '22:00', endTime: '06:00' });

    // Asignar turno al conductor para 2025-11-03 (comienza 22:00 del 3 y termina 06:00 del 4)
    turnos.assignShift({ id: 'a1', shiftId: 'night-1', driverId: 'driver-1', date: '2025-11-03' });

    const from = '2025-11-03T00:00:00';
    const to = '2025-11-09T23:59:59';

    const hours = calculateHoursForPeriod('driver-1', from, to, turnos.assignments, turnos.shifts);
    expect(hours).toBeCloseTo(8, 3);
  });

  it('aggregates multiple shifts and flags when exceeding limit', () => {
    turnos.createShift({ id: 'day-1', name: 'Diurno', startTime: '08:00', endTime: '17:00' });
    // 9 hours per shift
    for (let i = 0; i < 6; i++) {
      // assign to consecutive dates
      const day = 3 + i; // 2025-11-03 .. 2025-11-08
      const dateStr = `2025-11-${String(day).padStart(2, '0')}`;
      turnos.assignShift({ id: `d${i}`, shiftId: 'day-1', driverId: 'driver-2', date: dateStr });
    }

    const from = '2025-11-01T00:00:00';
    const to = '2025-11-30T23:59:59';

    const { hours, exceeds } = driverHoursWithAlert('driver-2', from, to, turnos.assignments, turnos.shifts, 40);
    // 6 * 9 = 54 hours > 40
    expect(hours).toBeGreaterThan(50);
    expect(exceeds).toBe(true);
  });
});
