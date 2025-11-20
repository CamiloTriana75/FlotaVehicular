import React from 'react';
import { tableToCSV, downloadCSV, generatePDF, buildMetadata } from '../utils/exportUtils.js';

export default function ExportButtons({ filename = 'report', title = '', columns = [], rows = [], logoDataUrl = null, author = '' }) {
  const onDownloadCSV = () => {
    const csv = tableToCSV(columns, rows);
    downloadCSV(`${filename}.csv`, csv);
  };

  const onDownloadPDF = () => {
    const metadata = buildMetadata({ author, filters: null });
    const dataUrl = generatePDF({ title, columns, rows, logoDataUrl, metadata });
    // trigger download
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button type="button" onClick={onDownloadCSV}>Exportar CSV</button>
      <button type="button" onClick={onDownloadPDF}>Exportar PDF</button>
    </div>
  );
}
