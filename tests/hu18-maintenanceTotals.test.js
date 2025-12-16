import { describe, it, expect } from 'vitest';
import {
  withMaintenanceTotals,
  calculateMaintenanceTotals,
} from '../src/store/utils/maintenanceTotals';

describe('HU18 - Historial de mantenimiento (totales)', () => {
  it('calcula costos de partes, mano de obra y total', () => {
    const order = {
      parts: [
        { quantity: 2, unitCost: 10 },
        { quantity: 1, unitCost: 5 },
      ],
      laborHours: 3,
      laborRate: 20,
      otherCosts: 15,
    };

    const res = withMaintenanceTotals(order);
    expect(res.partsCost).toBe(25);
    expect(res.laborCost).toBe(60);
    expect(res.totalCost).toBe(100);
  });

  it('calcula totales para lista de órdenes', () => {
    const totals = calculateMaintenanceTotals([
      { parts: [], laborHours: 1, laborRate: 10, otherCosts: 0 },
      {
        parts: [{ quantity: 1, unitCost: 5 }],
        laborHours: 0,
        laborRate: 0,
        otherCosts: 0,
      },
    ]);

    expect(totals[0].totalCost).toBe(10);
    expect(totals[1].totalCost).toBe(5);
  });
});
