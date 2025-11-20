// Servicio sencillo en memoria para turnos y asignaciones
export const shifts = [];
export const assignments = [];

export function createShift({ id, name, startTime, endTime }) {
  const shift = { id, name, startTime, endTime };
  shifts.push(shift);
  return shift;
}

export function assignShift({ id, shiftId, driverId, date }) {
  // date: ISO date string (YYYY-MM-DD) representing the day the shift starts
  const assignment = { id, shiftId, driverId, date };
  assignments.push(assignment);
  return assignment;
}

export function listAssignmentsForDriver(driverId, fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  return assignments.filter(a => a.driverId === driverId).filter(a => {
    if (!from && !to) return true;
    const d = new Date(a.date + 'T00:00:00');
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export function exportAssignmentsCSV() {
  const header = ['assignmentId', 'shiftId', 'driverId', 'date'];
  const rows = assignments.map(a => [a.id, a.shiftId, a.driverId, a.date]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csv;
}
// Servicio sencillo en memoria para turnos y asignaciones (para pruebas y PoC)
export const shifts = [];
export const assignments = [];

export function createShift({ id, name, startTime, endTime }) {
  const shift = { id, name, startTime, endTime };
  shifts.push(shift);
  return shift;
}

export function assignShift({ id, shiftId, driverId, date }) {
  // date: ISO date string (YYYY-MM-DD) representing the day the shift starts
  const assignment = { id, shiftId, driverId, date };
  assignments.push(assignment);
  return assignment;
}

export function listAssignmentsForDriver(driverId, fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  return assignments.filter(a => a.driverId === driverId).filter(a => {
    if (!from && !to) return true;
    const d = new Date(a.date + 'T00:00:00');
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export function exportAssignmentsCSV() {
  const header = ['assignmentId', 'shiftId', 'driverId', 'date'];
  const rows = assignments.map(a => [a.id, a.shiftId, a.driverId, a.date]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csv;
}
