/**
 * Utilidades para gestionar historial de estados de vehículos
 */

import { formatDate, generateId } from './index';

const STORAGE_KEY = 'vehicle_status_history';

// Carga el diccionario completo de historiales desde localStorage
const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Guarda el diccionario completo en localStorage
const saveAll = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // noop
  }
};

// Obtiene historial por vehículo
export const loadStatusHistory = (vehicleId) => {
  const all = loadAll();
  return all[vehicleId] || [];
};

// Guarda historial por vehículo
export const saveStatusHistory = (vehicleId, history) => {
  const all = loadAll();
  all[vehicleId] = history;
  saveAll(all);
};

// Agrega un cambio de estado, retorna { vehicle: actualizado, entry }
export const addStatusChange = (vehicle, newStatus, user) => {
  if (!vehicle || !vehicle.id) throw new Error('Vehículo inválido');
  const vehicleId = vehicle.id;
  const oldStatus = vehicle.status;
  const entry = {
    id: generateId(),
    vehicleId,
    oldStatus,
    newStatus,
    userId: user?.id || 'anon',
    userEmail: user?.email || 'desconocido',
    timestamp: new Date().toISOString(),
  };
  const prev = loadStatusHistory(vehicleId);
  const history = [entry, ...prev]; // más reciente primero
  saveStatusHistory(vehicleId, history);

  const updatedVehicle = {
    ...vehicle,
    status: newStatus,
    updatedAt: entry.timestamp,
  };
  return { vehicle: updatedVehicle, entry };
};

// Genera string CSV del historial
export const generateCSVString = (history) => {
  const headers = [
    'Fecha',
    'Hora',
    'Usuario',
    'Estado anterior',
    'Estado nuevo',
  ];
  const rows = history.map((h) => {
    // Usar UTC para evitar diferencias por zonas horarias en exportación y tests
    const fecha = formatDate(h.timestamp, 'DD/MM/YYYY', true);
    const hora = formatDate(h.timestamp, 'HH:mm:ss', true);
    const usuario = h.userEmail || h.userId;
    return [fecha, hora, usuario, h.oldStatus, h.newStatus];
  });
  const allRows = [headers, ...rows];
  return allRows.map((r) => r.map(escapeCsv).join(',')).join('\n');
};

const escapeCsv = (value) => {
  const v = value == null ? '' : String(value);
  if (/[",\n]/.test(v)) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
};

// Dispara descarga de CSV en navegador
export const downloadCSV = (history, filename = 'historial_estados.csv') => {
  const csv = generateCSVString(history);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
