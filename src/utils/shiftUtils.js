// Utilidades para cálculo de horas de turnos
// Trabaja junto a los arrays `shifts` y `assignments` del servicio de turnos.

function parseTimeToDate(baseDateISO, timeHHMM) {
  // baseDateISO like '2025-11-03'
  return new Date(baseDateISO + 'T' + timeHHMM + ':00');
}

function overlapDurationMs(aStart, aEnd, bStart, bEnd) {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  return Math.max(0, end - start);
}

export function calculateHoursForPeriod(driverId, fromISO, toISO, assignments, shifts) {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  let totalMs = 0;

  const driverAssignments = assignments.filter(a => a.driverId === driverId);

  for (const a of driverAssignments) {
    const shift = shifts.find(s => s.id === a.shiftId);
    if (!shift) continue;

    // Build shift start/end as Date objects relative to assignment date
    const shiftStart = parseTimeToDate(a.date, shift.startTime);
    let shiftEnd = parseTimeToDate(a.date, shift.endTime);
    // If end <= start, shift ends next day
    if (shiftEnd <= shiftStart) {
      shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    const overlapMs = overlapDurationMs(shiftStart, shiftEnd, from, to);
    totalMs += overlapMs;
  }

  const hours = totalMs / (1000 * 60 * 60);
  return Number(hours.toFixed(3));
}

export function driverHoursWithAlert(driverId, fromISO, toISO, assignments, shifts, limitHours = 40) {
  const hours = calculateHoursForPeriod(driverId, fromISO, toISO, assignments, shifts);
  return { hours, exceeds: hours > limitHours };
}
