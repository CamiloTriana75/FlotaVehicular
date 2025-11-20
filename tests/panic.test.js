import { describe, it, expect, beforeEach } from 'vitest';
import * as panic from '../src/api/panic.js';

describe('Botón de pánico', () => {
  beforeEach(() => {
    panic.panicAlerts.length = 0;
    panic.notifications.length = 0;
    panic.incidents.length = 0;
  });

  it('envía alerta, crea incidente y notifica a supervisores', () => {
    const vehicleId = 'veh-123';
    const driverId = 'drv-1';
    const timestamp = new Date().toISOString();
    const location = { lat: -34.0, lon: -58.0 };

    const { alert, incident, notification } = panic.sendPanicAlert({ id: 'panic-1', vehicleId, driverId, timestamp, location });

    expect(alert).toBeDefined();
    expect(alert.vehicleId).toBe(vehicleId);
    expect(incident).toBeDefined();
    expect(incident.type).toBe('panic');
    expect(notification).toBeDefined();
    expect(notification.toRole).toBe('supervisor');

    const listedAlerts = panic.listPanicAlerts(vehicleId);
    expect(listedAlerts.length).toBe(1);

    const listedNotifs = panic.listNotifications('supervisor');
    expect(listedNotifs.length).toBeGreaterThanOrEqual(1);
  });
});
