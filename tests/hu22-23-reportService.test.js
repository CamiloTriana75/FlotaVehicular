import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeReport,
  createReportTemplate,
  exportToCSV,
  exportToJSON,
} from '../src/services/reportService';
import { supabase } from '../src/lib/supabaseClient';

// Mock Supabase client
vi.mock('../src/lib/supabaseClient', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

// Minimal builder to simulate Supabase query chaining
const makeBuilder = ({ data = [], error = null, tracker = {} }) => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };

  builder.then = (onFulfilled) => onFulfilled({ data, error });
  tracker.builder = builder;
  return builder;
};

// JSDOM helpers for export tests
const mockDownload = () => {
  const appendSpy = vi.spyOn(document.body, 'appendChild');
  const removeSpy = vi.spyOn(document.body, 'removeChild');
  const clickSpy = vi.fn();
  const realCreate = document.createElement.bind(document);
  const anchor = realCreate('a');
  vi.spyOn(anchor, 'click').mockImplementation(clickSpy);
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'a') return anchor;
    return realCreate(tag);
  });
  if (!URL.createObjectURL) {
    // @ts-expect-error mock url
    URL.createObjectURL = vi.fn();
  }
  if (!URL.revokeObjectURL) {
    // @ts-expect-error mock url
    URL.revokeObjectURL = vi.fn();
  }
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
  vi.spyOn(URL, 'revokeObjectURL').mockReturnThis();
  return { appendSpy, removeSpy, clickSpy };
};

describe('ReportService (HU22/23 - reportes y exportaciones)', () => {
  const fromSpy = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ejecuta reporte con filtros y columnas específicas', async () => {
    const tracker = {};
    fromSpy.mockImplementation((table) => {
      expect(table).toBe('incidents');
      return makeBuilder({
        tracker,
        data: [
          { id: 1, type: 'accident', severity: 'high', extra: 'x' },
          { id: 2, type: 'other', severity: 'low', extra: 'y' },
        ],
      });
    });

    const data = await executeReport(
      'incidents',
      { type: 'accident', severity: 'high', startDate: '2025-01-01' },
      ['id', 'type', 'severity']
    );

    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toEqual({ id: 1, type: 'accident', severity: 'high' });
    expect(tracker.builder.eq).toHaveBeenCalledWith('type', 'accident');
    expect(tracker.builder.gte).toHaveBeenCalledWith(
      'created_at',
      '2025-01-01'
    );
  });

  it('crea plantilla de reporte y retorna registro', async () => {
    const template = {
      name: 'Incidentes críticos',
      report_type: 'incidents',
      filters: { severity: 'critical' },
      columns: ['id', 'severity'],
      metrics: [],
    };

    fromSpy.mockImplementation((table) => {
      expect(table).toBe('report_templates');
      const builder = makeBuilder({ data: { id: 't1', ...template } });
      builder.insert.mockReturnValue(builder);
      return builder;
    });

    const result = await createReportTemplate('user-1', template);

    expect(result.id).toBe('t1');
    expect(result.report_type).toBe('incidents');
  });

  it('exporta a CSV creando link de descarga', () => {
    const { clickSpy } = mockDownload();
    exportToCSV([
      { a: 1, b: 'hola' },
      { a: 2, b: 'mundo' },
    ]);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exporta a JSON creando link de descarga', () => {
    const { clickSpy } = mockDownload();
    exportToJSON([{ a: 1 }, { a: 2 }]);
    expect(clickSpy).toHaveBeenCalled();
  });
});
