import React, { useEffect, useMemo, useState } from 'react';
import { driverService } from '../services/driverService';
import { getDriverKPIs } from '../services/incidentService';
import { FileDown, RefreshCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function DriverPerformance() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kmInPeriod, setKmInPeriod] = useState('');
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await driverService.getAll();
      setDrivers(res.data || []);
    })();
  }, []);

  const driverOptions = useMemo(
    () => [
      { id: '', label: 'Seleccione' },
      ...(drivers || []).map((d) => ({
        id: d.id,
        label: `${d.nombre} ${d.apellidos}`,
      })),
    ],
    [drivers]
  );

  const load = async () => {
    if (!driverId) {
      setError('Seleccione un conductor');
      return;
    }
    setError('');
    setLoading(true);
    const { data, error } = await getDriverKPIs(Number(driverId), {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      kmInPeriod: kmInPeriod ? Number(kmInPeriod) : undefined,
    });
    if (error) {
      setError(error.message || 'Error al cargar KPIs');
      setKpis(null);
    } else {
      setKpis(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Auto-cargar cuando haya conductor seleccionado y fechas
    if (driverId) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId, startDate, endDate, kmInPeriod]);

  const exportPDF = () => {
    if (!kpis) return;
    const doc = new jsPDF();
    const driverName =
      driverOptions.find((o) => String(o.id) === String(driverId))?.label || '';

    doc.setFontSize(16);
    doc.text('Reporte de Desempeño del Conductor', 14, 18);
    doc.setFontSize(11);
    doc.text(`Conductor: ${driverName}`, 14, 26);
    doc.text(`Periodo: ${startDate || 'N/A'} a ${endDate || 'N/A'}`, 14, 33);

    const summary = [
      ['Incidentes totales', String(kpis.total)],
      [
        'Incidentes por 1000 km',
        kpis.incidentsPer1000Km != null
          ? String(kpis.incidentsPer1000Km)
          : 'N/A',
      ],
      ['Severidad promedio (1-4)', String(kpis.avgSeverityScore)],
    ];

    autoTable(doc, {
      head: [['Métrica', 'Valor']],
      body: summary,
      startY: 40,
      styles: { fontSize: 10 },
    });

    const bySeverityRows = Object.entries(kpis.bySeverity || {}).map(
      ([sev, count]) => [sev, String(count)]
    );
    autoTable(doc, {
      head: [['Severidad', 'Cantidad']],
      body: bySeverityRows,
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 10 },
    });

    const byTypeRows = Object.entries(kpis.byType || {}).map(
      ([type, count]) => [type, String(count)]
    );
    autoTable(doc, {
      head: [['Tipo', 'Cantidad']],
      body: byTypeRows,
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 10 },
    });

    doc.save('desempeno_conductor.pdf');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Desempeño por Conductor</h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Actualizar
          </button>
          <button
            disabled={!kpis}
            onClick={exportPDF}
            className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            <FileDown size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Conductor</label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full border rounded p-2"
          >
            {driverOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={toDateInput(startDate)}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            value={toDateInput(endDate)}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">
            Km en el periodo (opcional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={kmInPeriod}
            onChange={(e) => setKmInPeriod(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando KPIs...</div>
        ) : !kpis ? (
          <div className="p-6 text-gray-500">
            Seleccione un conductor y parámetros para ver KPIs.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Incidentes totales</div>
                <div className="text-2xl font-semibold">{kpis.total}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">
                  Incidentes por 1000 km
                </div>
                <div className="text-2xl font-semibold">
                  {kpis.incidentsPer1000Km != null
                    ? kpis.incidentsPer1000Km
                    : 'N/A'}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">
                  Severidad promedio (1-4)
                </div>
                <div className="text-2xl font-semibold">
                  {kpis.avgSeverityScore}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold mb-2">Por severidad</div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border">Severidad</th>
                      <th className="text-right p-2 border">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(kpis.bySeverity || {}).map(
                      ([sev, count]) => (
                        <tr key={sev}>
                          <td className="p-2 border">{sev}</td>
                          <td className="p-2 border text-right">{count}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="font-semibold mb-2">Por tipo</div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border">Tipo</th>
                      <th className="text-right p-2 border">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(kpis.byType || {}).map(([type, count]) => (
                      <tr key={type}>
                        <td className="p-2 border">{type}</td>
                        <td className="p-2 border text-right">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
