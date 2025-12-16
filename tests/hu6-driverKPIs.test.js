import { describe, it, expect } from 'vitest';
import { computeKPIs } from '../src/services/incidentService';

// HU6: Historial y desempeño de conductor - KPIs

describe('HU6 - Driver KPIs', () => {
  it('computeKPIs aggregates by severity and type', () => {
    const incidents = [
      { severity: 'high', type: 'accident' },
      { severity: 'low', type: 'violation' },
      { severity: 'critical', type: 'breakdown' },
      { severity: 'medium', type: 'near_miss' },
      { severity: 'high', type: 'other' },
    ];

    const kpi = computeKPIs(incidents, 2500);

    expect(kpi.total).toBe(5);
    expect(kpi.bySeverity.high).toBe(2);
    expect(kpi.bySeverity.critical).toBe(1);
    expect(kpi.byType.accident).toBe(1);
    expect(kpi.byType.violation).toBe(1);
    expect(kpi.incidentsPer1000Km).toBeCloseTo(2, 5);
    expect(kpi.avgSeverityScore).toBeGreaterThan(0);
  });

  it('handles empty incident list gracefully', () => {
    const kpi = computeKPIs([], 0);
    expect(kpi.total).toBe(0);
    expect(kpi.incidentsPer1000Km).toBeNull();
    expect(kpi.avgSeverityScore).toBe(0);
  });
});
