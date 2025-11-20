import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Convierte columnas y filas a CSV (columns: [{key,label}], rows: array of objects)
export function tableToCSV(columns, rows) {
  const header = columns.map(c => c.label ?? c.key);
  const lines = [header.join(',')];
  for (const r of rows) {
    const row = columns.map(c => {
      const v = r[c.key];
      if (v === null || v === undefined) return '';
      // escape quotes
      const s = String(v).replace(/"/g, '""');
      // wrap if contains comma or quote or newline
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s}"`;
      return s;
    });
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

// For browser: trigger CSV download
export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Generate PDF using jspdf + autotable. Returns dataURL string.
// options: { title, columns: [{key,label}], rows, logoDataUrl (optional), metadata: {filters, author} }
export function generatePDF(options = {}) {
  const { title = '', columns = [], rows = [], logoDataUrl = null, metadata = {} } = options;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 40;
  if (logoDataUrl) {
    try {
      // place logo at left
      doc.addImage(logoDataUrl, 'PNG', 40, y - 10, 60, 60);
    } catch (e) {
      // ignore if invalid
    }
  }

  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, y + 20, { align: 'center' });
  y += 50;

  // metadata
  doc.setFontSize(10);
  const metaLines = [];
  if (metadata.author) metaLines.push(`Autor: ${metadata.author}`);
  if (metadata.generatedAt) metaLines.push(`Generado: ${metadata.generatedAt}`);
  if (metadata.filters) metaLines.push(`Filtros: ${JSON.stringify(metadata.filters)}`);
  if (metaLines.length) {
    doc.text(metaLines.join(' | '), 40, y);
    y += 20;
  }

  // Prepare autotable columns
  const atColumns = columns.map(c => ({ header: c.label ?? c.key, dataKey: c.key }));

  // Use autoTable
  // eslint-disable-next-line new-cap
  doc.autoTable({
    startY: y + 10,
    head: [atColumns.map(c => c.header)],
    body: rows.map(r => atColumns.map(c => r[c.dataKey] ?? '')),
    styles: { fontSize: 9 },
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    margin: { left: 40, right: 40 },
  });

  return doc.output('datauristring');
}

// Helper to create metadata object
export function buildMetadata({ author = '', filters = null }) {
  return { author, filters, generatedAt: new Date().toISOString() };
}
