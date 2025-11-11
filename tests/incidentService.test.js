import { describe, it, expect } from 'vitest';
import { computeKPIs } from '../src/services/incidentService.js';

// Helper para crear incidente falso
function inc({ type = 'other', severity = 'low' } = {}) {
  return {
    id: Math.random(),
    type,
    severity,
  };
}

describe('computeKPIs', () => {
  it('regresa totales y estructuras vacías con lista vacía', () => {
    const r = computeKPIs([], 0);
    expect(r.total).toBe(0);
    expect(r.avgSeverityScore).toBe(0);
    expect(Object.values(r.bySeverity).every((v) => v === 0)).toBe(true);
    expect(Object.values(r.byType).every((v) => v === 0)).toBe(true);
    expect(r.incidentsPer1000Km).toBeNull();
  });

  it('calcula severidad promedio correctamente', () => {
    const incidents = [
      inc({ severity: 'low' }), // 1
      inc({ severity: 'medium' }), // 2
      inc({ severity: 'high' }), // 3
      inc({ severity: 'critical' }), // 4
    ];
    const r = computeKPIs(incidents, null);
    // (1+2+3+4)/4 = 2.5
    expect(r.total).toBe(4);
    expect(r.avgSeverityScore).toBe(2.5);
    expect(r.bySeverity.low).toBe(1);
    expect(r.bySeverity.medium).toBe(1);
    expect(r.bySeverity.high).toBe(1);
    expect(r.bySeverity.critical).toBe(1);
  });

  it('contabiliza tipos y calcula incidentes por 1000 km', () => {
    const incidents = [
      inc({ type: 'accident', severity: 'medium' }),
      inc({ type: 'accident', severity: 'high' }),
      inc({ type: 'breakdown', severity: 'low' }),
    ];
    const r = computeKPIs(incidents, 1500); // 3 / 1500 * 1000 = 2.00
    expect(r.total).toBe(3);
    expect(r.byType.accident).toBe(2);
    expect(r.byType.breakdown).toBe(1);
    expect(r.incidentsPer1000Km).toBe(2.0);
  });

  it('maneja kmInPeriod = 0 o indefinido', () => {
    const incidents = [inc(), inc()];
    const r1 = computeKPIs(incidents, 0);
    const r2 = computeKPIs(incidents, undefined);
    expect(r1.incidentsPer1000Km).toBeNull();
    expect(r2.incidentsPer1000Km).toBeNull();
  });
});
