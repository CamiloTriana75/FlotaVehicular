// Servicio en memoria para reglas de consumo, lecturas y alertas
export const rules = []; // { id, vehicleId, expectedLPer100, tolerancePercent }
export const readings = []; // { id, vehicleId, date, liters, kilometers, lPer100 }
export const alerts = []; // { id, vehicleId, date, readingId, observed, expected, deviationPercent, reason, possibleCauses }

import { computeLPer100, detectAnomaly } from '../utils/fuelUtils.js';

export function setRule({ id, vehicleId, expectedLPer100, tolerancePercent = 30 }) {
  const existing = rules.find(r => r.id === id || (r.vehicleId === vehicleId && r.id === id));
  const rule = { id, vehicleId, expectedLPer100, tolerancePercent };
  if (existing) {
    Object.assign(existing, rule);
    return existing;
  }
  rules.push(rule);
  return rule;
}

export function getRuleForVehicle(vehicleId) {
  return rules.find(r => r.vehicleId === vehicleId) || null;
}

export function recordReading({ id, vehicleId, date, liters, kilometers }) {
  const lPer100 = computeLPer100(liters, kilometers);
  const reading = { id, vehicleId, date, liters, kilometers, lPer100 };
  readings.push(reading);

  const rule = getRuleForVehicle(vehicleId);
  if (rule) {
    const result = detectAnomaly(rule.expectedLPer100, lPer100, rule.tolerancePercent);
    if (result.isAnomaly) {
      const alert = {
        id: `alert-${alerts.length + 1}`,
        vehicleId,
        date,
        readingId: id,
        observed: lPer100,
        expected: rule.expectedLPer100,
        deviationPercent: result.deviationPercent,
        reason: result.reason,
        possibleCauses: result.possibleCauses,
      };
      alerts.push(alert);
      return { reading, alert };
    }
  }

  return { reading, alert: null };
}

export function listAlerts(vehicleId, fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  return alerts.filter(a => (vehicleId ? a.vehicleId === vehicleId : true)).filter(a => {
    const d = new Date(a.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export function listReadings(vehicleId, fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  return readings.filter(r => (vehicleId ? r.vehicleId === vehicleId : true)).filter(r => {
    const d = new Date(r.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export function exportAlertsCSV() {
  const header = ['alertId', 'vehicleId', 'date', 'readingId', 'observed', 'expected', 'deviationPercent', 'reason'];
  const rows = alerts.map(a => [a.id, a.vehicleId, a.date, a.readingId, a.observed, a.expected, a.deviationPercent, `"${a.reason}"`]);
  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
}
