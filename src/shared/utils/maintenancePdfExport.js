import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta el historial de mantenimiento completo a PDF
 */
export const exportMaintenanceHistoryToPDF = (
  vehicleData,
  maintenanceHistory,
  costBreakdown,
  chartData,
  filterType,
  filterYear
) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE MANTENIMIENTO DE VEHÍCULO', 14, 20);

  // Información del vehículo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let y = 35;

  doc.setFont('helvetica', 'bold');
  doc.text('Información del Vehículo:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 7;

  doc.text(`Placa: ${vehicleData.placa || 'N/A'}`, 14, y);
  y += 6;
  doc.text(
    `Marca: ${vehicleData.marca || 'N/A'}  Modelo: ${vehicleData.modelo || 'N/A'}  Año: ${vehicleData.año || 'N/A'}`,
    14,
    y
  );
  y += 6;
  doc.text(
    `Color: ${vehicleData.color || 'N/A'}  Kilometraje: ${vehicleData.kilometraje?.toLocaleString() || '0'} km`,
    14,
    y
  );
  y += 10;

  // Filtros aplicados
  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(
    `Tipo: ${filterType === 'all' ? 'Todos' : filterType}  |  Año: ${filterYear === 'all' ? 'Todos' : filterYear}`,
    14,
    y
  );
  y += 10;

  // Resumen de costos - Cards
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Costos:', 14, y);
  y += 8;

  doc.setFontSize(10);

  // Tabla de resumen de costos
  const summaryData = [
    [
      'Total General',
      `$${costBreakdown.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
    ],
    [
      'Mantenimiento Preventivo',
      `$${costBreakdown.preventivo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
    ],
    [
      'Mantenimiento Correctivo',
      `$${costBreakdown.correctivo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
    ],
    [
      'Inspecciones',
      `$${costBreakdown.inspeccion.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
    ],
    [
      'Mantenimiento Predictivo',
      `$${costBreakdown.predictivo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
    ],
    ['Total de Órdenes', costBreakdown.count.toString()],
    [
      'Costo Promedio',
      `$${costBreakdown.avgCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
    ],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Concepto', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [49, 130, 206] },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Gasto mensual
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Gasto Mensual:', 14, y);
  y += 8;

  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  const monthlyData = chartData.map((item) => [
    monthNames[item.month - 1],
    `$${item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Mes', 'Gasto']],
    body: monthlyData,
    theme: 'striped',
    headStyles: { fillColor: [49, 130, 206] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
    },
  });

  // Historial de mantenimiento
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Historial de Mantenimiento:', 14, y);
  y += 8;

  if (maintenanceHistory.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay registros de mantenimiento para este vehículo.', 14, y);
  } else {
    const historyData = maintenanceHistory.map((order) => {
      const partsCost =
        order.parts?.reduce((sum, p) => sum + p.quantity * p.unitCost, 0) || 0;
      const laborCost = (order.laborHours || 0) * (order.laborRate || 0);

      return [
        order.title || 'N/A',
        order.type || 'N/A',
        order.status || 'N/A',
        order.scheduledDate || order.executionDate || 'N/A',
        `$${partsCost.toLocaleString('es-ES')}`,
        `$${laborCost.toLocaleString('es-ES')}`,
        `$${(order.otherCosts || 0).toLocaleString('es-ES')}`,
        `$${(order.totalCost || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [
        [
          'Título',
          'Tipo',
          'Estado',
          'Fecha',
          'Repuestos',
          'M.Obra',
          'Otros',
          'Total',
        ],
      ],
      body: historyData,
      theme: 'grid',
      headStyles: { fillColor: [49, 130, 206], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 },
        2: { cellWidth: 22 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 18 },
        7: { cellWidth: 25 },
      },
    });
  }

  // Pie de página en todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  return doc;
};

/**
 * Descarga el PDF del historial de mantenimiento
 */
export const downloadMaintenancePDF = (
  vehicleData,
  maintenanceHistory,
  costBreakdown,
  chartData,
  filterType,
  filterYear
) => {
  const doc = exportMaintenanceHistoryToPDF(
    vehicleData,
    maintenanceHistory,
    costBreakdown,
    chartData,
    filterType,
    filterYear
  );

  const fileName = `mantenimiento_${vehicleData.placa}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
