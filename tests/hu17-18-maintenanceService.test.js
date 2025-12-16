import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMaintenanceOrders,
  getMaintenanceOrderById,
  createMaintenanceOrder,
  updateMaintenanceOrder,
  deleteMaintenanceOrder,
  addPartToOrder,
  deletePart,
  uploadAttachment,
  getVehicleMaintenanceStats,
} from '../src/services/maintenanceService';
import { supabase } from '../src/lib/supabaseClient';

global.localStorage = {
  store: {},
  getItem(k) {
    return this.store[k] || null;
  },
  setItem(k, v) {
    this.store[k] = v;
  },
  removeItem(k) {
    delete this.store[k];
  },
  clear() {
    this.store = {};
  },
};

// Mock supabase
vi.mock('../src/lib/supabaseClient', () => {
  const mockFrom = vi.fn();
  const mockStorageFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      storage: { from: mockStorageFrom },
    },
  };
});

const makeBuilder = ({ data = [], error = null, tracker = {} } = {}) => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  builder.then = (onFulfilled) => onFulfilled({ data, error });
  tracker.builder = builder;
  return builder;
};

describe('HU17/18 - Mantenimiento (maintenanceService)', () => {
  const fromSpy = vi.mocked(supabase.from);
  const storageSpy = vi.mocked(supabase.storage.from);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('obtiene órdenes con partes y adjuntos', async () => {
    const tracker = {};
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_orders');
      return makeBuilder({ data: [{ id: 1 }], tracker });
    });
    // parts
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_parts');
      return makeBuilder({ data: [{ id: 'p1', maintenance_order_id: 1 }] });
    });
    // attachments
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_attachments');
      return makeBuilder({ data: [{ id: 'a1', maintenance_order_id: 1 }] });
    });

    const { data, error } = await getMaintenanceOrders();

    expect(error).toBeNull();
    expect(data[0].parts).toHaveLength(1);
    expect(data[0].attachments).toHaveLength(1);
    expect(tracker.builder.order).toHaveBeenCalled();
  });

  it('crea orden con partes y usa currentUser del storage', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ id_usuario: 123 }));

    // insert order
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_orders');
      const builder = makeBuilder({ data: { id: 7 } });
      builder.insert.mockReturnThis();
      builder.single.mockResolvedValue({ data: { id: 7 }, error: null });
      return builder;
    });
    // insert parts
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_parts');
      const builder = makeBuilder({ data: null });
      builder.insert.mockResolvedValue({ data: null, error: null });
      return builder;
    });
    // fetch order by id
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_orders');
      const builder = makeBuilder({ data: { id: 7 } });
      builder.select.mockReturnThis();
      builder.eq.mockReturnThis();
      return builder;
    });
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_parts');
      return makeBuilder({ data: [] });
    });
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_attachments');
      return makeBuilder({ data: [] });
    });

    const { data, error } = await createMaintenanceOrder(
      { vehicleId: 10, title: 'Cambio de aceite' },
      [{ name: 'Aceite', quantity: 1, unitCost: 50 }]
    );

    expect(error).toBeNull();
    expect(data.id).toBe(7);
  });

  it('actualiza una orden de mantenimiento', async () => {
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_orders');
      const builder = makeBuilder({ data: { id: 1, status: 'completada' } });
      builder.update.mockReturnThis();
      builder.eq.mockReturnThis();
      return builder;
    });

    const { data, error } = await updateMaintenanceOrder(1, {
      status: 'completada',
      title: 'Listo',
    });

    expect(error).toBeNull();
    expect(data.status).toBe('completada');
  });

  it('elimina una orden', async () => {
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_orders');
      const builder = makeBuilder({ data: null, error: null });
      builder.delete.mockReturnThis();
      builder.eq.mockReturnThis();
      builder.then = (onFulfilled) => onFulfilled({ data: null, error: null });
      return builder;
    });

    const res = await deleteMaintenanceOrder(5);
    expect(res.success).toBe(true);
  });

  it('agrega y elimina partes de una orden', async () => {
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_parts');
      const builder = makeBuilder({ data: { id: 'part-1' } });
      builder.insert.mockReturnThis();
      return builder;
    });

    const addRes = await addPartToOrder('ord-1', {
      name: 'Filtro',
      quantity: 1,
    });
    expect(addRes.data.id).toBe('part-1');

    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_parts');
      const builder = makeBuilder({});
      builder.delete.mockReturnThis();
      builder.eq.mockReturnThis();
      builder.then = (onFulfilled) => onFulfilled({ data: null, error: null });
      return builder;
    });

    const delRes = await deletePart('part-1');
    expect(delRes.success).toBe(true);
  });

  it('sube adjunto y crea registro', async () => {
    const fakeFile = new File(['data'], 'foto.png', { type: 'image/png' });
    localStorage.setItem('currentUser', JSON.stringify({ id_usuario: 99 }));

    // storage upload + public url
    storageSpy.mockImplementation((bucket) => {
      expect(bucket).toBe('maintenance-attachments');
      return {
        upload: vi.fn().mockResolvedValue({ data: { path: 'p' }, error: null }),
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: 'http://url' } }),
      };
    });

    // insert attachment
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_attachments');
      const builder = makeBuilder({
        data: { id: 'att-1', file_url: 'http://url' },
      });
      builder.insert.mockReturnThis();
      return builder;
    });

    const { data, error } = await uploadAttachment('ord-1', fakeFile, 'foto');
    expect(error).toBeNull();
    expect(data.file_url).toBe('http://url');
  });

  it('calcula estadísticas básicas por vehículo', async () => {
    // getMaintenanceOrders mocked
    fromSpy.mockImplementationOnce((table) => {
      expect(table).toBe('maintenance_orders');
      const builder = makeBuilder({
        data: [
          { id: 1, status: 'programada', type: 'preventivo', total_cost: 100 },
          { id: 2, status: 'completada', type: 'correctivo', total_cost: 50 },
        ],
      });
      builder.order.mockReturnThis();
      return builder;
    });

    // parts and attachments for each order (ignored in stats)
    fromSpy.mockImplementationOnce(() => makeBuilder({ data: [] }));
    fromSpy.mockImplementationOnce(() => makeBuilder({ data: [] }));
    fromSpy.mockImplementationOnce(() => makeBuilder({ data: [] }));
    fromSpy.mockImplementationOnce(() => makeBuilder({ data: [] }));

    const { data, error } = await getVehicleMaintenanceStats(10);
    expect(error).toBeNull();
    expect(data.totalOrders).toBe(2);
    expect(data.totalCost).toBe(150);
    expect(data.byStatus.programada).toBe(1);
    expect(data.byType.correctivo).toBe(1);
  });
});
