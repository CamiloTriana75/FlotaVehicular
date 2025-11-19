import { describe, it, expect, beforeEach } from 'vitest';
import * as consumo from '../src/api/consumo.js';

describe('Detección de consumo atípico', () => {
  beforeEach(() => {
    consumo.rules.length = 0;
    consumo.readings.length = 0;
    consumo.alerts.length = 0;
  });

  it('genera alerta cuando un consumo de 15L/100km supera esperado 8L/100km', () => {
    // Regla: 8 L/100km, tolerancia 30% -> umbral superior = 10.4
    consumo.setRule({ id: 'r1', vehicleId: 'veh-1', expectedLPer100: 8, tolerancePercent: 30 });

    // Registrar lectura con 15 L en 100 km -> 15 L/100km
    const result = consumo.recordReading({ id: 'read-1', vehicleId: 'veh-1', date: '2025-11-19T12:00:00', liters: 15, kilometers: 100 });

    expect(result.reading.lPer100).toBeCloseTo(15, 3);
    expect(result.alert).not.toBeNull();
    expect(result.alert.observed).toBeCloseTo(15, 3);
    expect(result.alert.expected).toBe(8);
    expect(result.alert.deviationPercent).toBeGreaterThan(30);
    const listed = consumo.listAlerts('veh-1');
    expect(listed.length).toBeGreaterThanOrEqual(1);
  });
});
