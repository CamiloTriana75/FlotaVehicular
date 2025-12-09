/**
 * Servicio para generar facturas de órdenes de mantenimiento en PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera una factura PDF de una orden de mantenimiento
 * @param {Object} order - Orden de mantenimiento
 * @param {Object} vehicle - Información del vehículo
 * @returns {jsPDF} Documento PDF
 */
export const generateMaintenanceInvoice = (order, vehicle) => {
  const doc = new jsPDF();

  // Configuración de fuentes y colores
  const primaryColor = [41, 128, 185]; // Azul
  const secondaryColor = [52, 73, 94]; // Gris oscuro
  const lightGray = [236, 240, 241];

  // === ENCABEZADO ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA DE MANTENIMIENTO', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión de Flota Vehicular', 105, 30, {
    align: 'center',
  });

  // === INFORMACIÓN DE LA ORDEN ===
  let yPos = 50;

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  // Columna izquierda - Info de orden
  doc.text('ORDEN DE MANTENIMIENTO', 14, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`Orden N°: ${order.orderNumber || 'N/A'}`, 14, yPos);
  yPos += 5;
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, yPos);
  yPos += 5;
  doc.text(`Estado: ${order.status || 'N/A'}`, 14, yPos);
  yPos += 5;
  doc.text(`Tipo: ${order.type || 'N/A'}`, 14, yPos);

  // Columna derecha - Info de vehículo
  yPos = 50;
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL VEHÍCULO', 110, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Placa: ${vehicle?.plate_number || vehicle?.plate || 'N/A'}`,
    110,
    yPos
  );
  yPos += 5;
  doc.text(`Marca: ${vehicle?.brand || 'N/A'}`, 110, yPos);
  yPos += 5;
  doc.text(
    `Modelo: ${vehicle?.model || 'N/A'} (${vehicle?.year || 'N/A'})`,
    110,
    yPos
  );
  yPos += 5;
  if (order.mileage) {
    doc.text(
      `Kilometraje: ${order.mileage.toLocaleString('es-ES')} km`,
      110,
      yPos
    );
  }

  // === DESCRIPCIÓN ===
  yPos += 10;
  doc.setFillColor(...lightGray);
  doc.rect(14, yPos - 5, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN DEL TRABAJO', 14, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const descriptionLines = doc.splitTextToSize(
    order.description || order.title || 'Sin descripción',
    170
  );
  doc.text(descriptionLines, 14, yPos);
  yPos += descriptionLines.length * 5 + 5;

  // === TABLA DE REPUESTOS ===
  if (order.parts && order.parts.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REPUESTOS Y MATERIALES', 14, yPos);
    yPos += 5;

    const partsData = order.parts.map((part) => [
      part.name || part.part_name,
      part.partNumber || part.part_number || '-',
      part.quantity,
      `$${(part.unitCost || part.unit_cost || 0).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      `$${(
        part.quantity * (part.unitCost || part.unit_cost || 0)
      ).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Repuesto', 'Código', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: partsData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // === MANO DE OBRA ===
  if (order.laborHours > 0 || order.labor_hours > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MANO DE OBRA', 14, yPos);
    yPos += 5;

    const laborHours = order.laborHours || order.labor_hours || 0;
    const laborRate = order.laborRate || order.labor_rate || 0;
    const laborTotal = laborHours * laborRate;

    autoTable(doc, {
      startY: yPos,
      head: [['Descripción', 'Horas', 'Tarifa/Hora', 'Total']],
      body: [
        [
          'Servicio de mano de obra',
          laborHours.toFixed(2),
          `$${laborRate.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          `$${laborTotal.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // === RESUMEN DE COSTOS ===
  const partsCost =
    order.parts?.reduce(
      (sum, p) => sum + p.quantity * (p.unitCost || p.unit_cost || 0),
      0
    ) || 0;
  const laborCost =
    (order.laborHours || order.labor_hours || 0) *
    (order.laborRate || order.labor_rate || 0);
  const otherCosts = order.otherCosts || order.other_costs || 0;
  const totalCost =
    order.totalCost || order.total_cost || partsCost + laborCost + otherCosts;

  // Recuadro para totales
  const summaryY = yPos;
  doc.setFillColor(...lightGray);
  doc.rect(130, summaryY - 5, 66, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RESUMEN DE COSTOS', 163, summaryY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  yPos = summaryY + 7;

  doc.text('Repuestos:', 135, yPos);
  doc.text(
    `$${partsCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    191,
    yPos,
    { align: 'right' }
  );

  yPos += 5;
  doc.text('Mano de Obra:', 135, yPos);
  doc.text(
    `$${laborCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    191,
    yPos,
    { align: 'right' }
  );

  if (otherCosts > 0) {
    yPos += 5;
    doc.text('Otros Costos:', 135, yPos);
    doc.text(
      `$${otherCosts.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      191,
      yPos,
      { align: 'right' }
    );
  }

  // Total
  yPos += 7;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(135, yPos - 2, 191, yPos - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', 135, yPos);
  doc.text(
    `$${totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    191,
    yPos,
    { align: 'right' }
  );

  // === NOTAS ===
  if (order.notes) {
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTAS:', 14, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(order.notes, 170);
    doc.text(notesLines, 14, yPos);
  }

  // === PIE DE PÁGINA ===
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado el ${new Date().toLocaleString('es-ES')}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};

/**
 * Descarga la factura PDF
 * @param {Object} order - Orden de mantenimiento
 * @param {Object} vehicle - Información del vehículo
 */
export const downloadInvoice = (order, vehicle) => {
  const doc = generateMaintenanceInvoice(order, vehicle);
  const fileName = `Factura_${order.orderNumber || order.id}_${vehicle?.plate_number || vehicle?.plate || 'vehiculo'}.pdf`;
  doc.save(fileName);
};

/**
 * Genera vista previa de la factura en nueva ventana
 * @param {Object} order - Orden de mantenimiento
 * @param {Object} vehicle - Información del vehículo
 */
export const previewInvoice = (order, vehicle) => {
  const doc = generateMaintenanceInvoice(order, vehicle);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
