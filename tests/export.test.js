import { describe, it, expect } from 'vitest';
import { tableToCSV, buildMetadata } from '../src/utils/exportUtils.js';

describe('Export utils', () => {
  it('converts table to CSV including headers and values', () => {
    const columns = [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Nombre' }];
    const rows = [{ id: 1, name: 'Juan' }, { id: 2, name: 'María, QA' }];
    const csv = tableToCSV(columns, rows);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('ID,Nombre');
    expect(lines[1]).toBe('1,Juan');
    // second row name contains comma -> quoted
    expect(lines[2]).toBe('2,"María, QA"');
  });

  it('builds metadata with generatedAt', () => {
    const meta = buildMetadata({ author: 'Admin', filters: { from: '2025-01-01' } });
    expect(meta.author).toBe('Admin');
    expect(meta.filters.from).toBe('2025-01-01');
    expect(typeof meta.generatedAt).toBe('string');
  });
});
