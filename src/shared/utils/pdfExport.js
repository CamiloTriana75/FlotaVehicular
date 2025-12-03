// Utilidad para exportar historial de estados a PDF usando jsPDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './index';

export function exportStatusHistoryToPDF(
  history,
  filename = 'historial_estados.pdf'
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Historial de Estados del Vehículo', 14, 18);
  doc.setFontSize(10);
  const tableData = history.map((h) => [
    formatDate(h.timestamp, 'DD/MM/YYYY', true),
    formatDate(h.timestamp, 'HH:mm:ss', true),
    h.userEmail || h.userId,
    h.oldStatus,
    h.newStatus,
  ]);
  doc.autoTable({
    head: [['Fecha', 'Hora', 'Usuario', 'Estado anterior', 'Estado nuevo']],
    body: tableData,
    startY: 24,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 101, 216] },
  });
  doc.save(filename);
}
