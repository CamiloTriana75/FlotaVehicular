import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  FileText,
  PieChart,
  Activity,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  getIncidents,
  INCIDENT_TYPES,
  INCIDENT_TYPES_LABELS,
  INCIDENT_SEVERITY_LABELS,
} from '../services/incidentService';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const periodOptions = [
  { id: '7d', name: 'Últimos 7 días' },
  { id: '30d', name: 'Últimos 30 días' },
  { id: '90d', name: 'Últimos 90 días' },
  { id: '1y', name: 'Último año' },
  { id: 'all', name: 'Todo el histórico' },
  { id: 'custom', name: 'Rango personalizado' },
];

const palette = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#7c3aed',
  '#f59e0b',
  '#0ea5e9',
];

const buildZoneLabel = (incident) => {
  if (incident.location) return incident.location;
  if (
    typeof incident.location_lat === 'number' &&
    typeof incident.location_lng === 'number'
  ) {
    return `Zona ${incident.location_lat.toFixed(2)}, ${incident.location_lng.toFixed(2)}`;
  }
  return 'Sin ubicación';
};

const Reports = () => {
  const today = new Date();
  const startDefault = new Date();
  startDefault.setDate(today.getDate() - 30);

  const [filters, setFilters] = useState({
    period: '30d',
    startDate: toDateInput(startDefault),
    endDate: toDateInput(today),
    type: 'all',
    severity: 'all',
  });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePeriodChange = (id) => {
    const end = new Date();
    const start = new Date();
    switch (id) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'custom':
        return setFilters((f) => ({ ...f, period: id }));
      case 'all':
        return setFilters((f) => ({
          ...f,
          period: id,
          startDate: '',
          endDate: '',
        }));
      default:
        break;
    }
    setFilters((f) => ({
      ...f,
      period: id,
      startDate: toDateInput(start),
      endDate: toDateInput(end),
    }));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await getIncidents({
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: filters.type !== 'all' ? filters.type : undefined,
        severity: filters.severity !== 'all' ? filters.severity : undefined,
      });
      if (err) {
        setError(err.message || 'No se pudo cargar incidentes');
        setIncidents([]);
      } else {
        setIncidents(data || []);
      }
      setLoading(false);
    };

    load();
  }, [filters.startDate, filters.endDate, filters.type, filters.severity]);

  const incidentsByType = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const key = i.type || 'otro';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([type, value]) => ({
      type: INCIDENT_TYPES_LABELS[type] || type,
      value,
      raw: type,
    }));
  }, [incidents]);

  const incidentsBySeverity = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const key = i.severity || 'N/D';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([severity, value]) => ({
      severity: INCIDENT_SEVERITY_LABELS[severity] || severity,
      value,
    }));
  }, [incidents]);

  const incidentsByZone = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const label = buildZoneLabel(i);
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .map(([zone, value]) => ({ zone, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [incidents]);

  const incidentsByDriver = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const name = i.driver
        ? `${i.driver.nombre} ${i.driver.apellidos}`
        : 'Sin conductor';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map)
      .map(([driver, total]) => ({ driver, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [incidents]);

  const incidentsTimeline = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const day = new Date(i.occurred_at).toISOString().slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [incidents]);

  const totals = useMemo(() => {
    const uniqueDrivers = new Set();
    const uniqueVehicles = new Set();
    let critical = 0;
    incidents.forEach((i) => {
      if (i.driver_id) uniqueDrivers.add(i.driver_id);
      if (i.vehicle_id) uniqueVehicles.add(i.vehicle_id);
      if (i.severity === 'critical' || i.severity === 'high') critical++;
    });
    return {
      total: incidents.length,
      drivers: uniqueDrivers.size,
      vehicles: uniqueVehicles.size,
      critical,
    };
  }, [incidents]);

  const exportCSV = () => {
    const headers = [
      'ID',
      'Fecha',
      'Tipo',
      'Severidad',
      'Conductor',
      'Vehículo',
      'Título',
      'Descripción',
      'Zona',
      'Latitud',
      'Longitud',
      'Estado',
    ];

    const detailRows = (incidents || []).map((i) => [
      i.id,
      new Date(i.occurred_at).toLocaleString('es-CO'),
      INCIDENT_TYPES_LABELS[i.type] || i.type,
      INCIDENT_SEVERITY_LABELS[i.severity] || i.severity,
      i.driver ? `${i.driver.nombre} ${i.driver.apellidos}` : 'Sin conductor',
      i.vehicle ? `${i.vehicle.placa}` : 'Sin vehículo',
      i.title,
      i.description || '',
      buildZoneLabel(i),
      i.location_lat || '',
      i.location_lng || '',
      i.status,
    ]);

    const summary = [
      ['Resumen'],
      ['Total incidentes', totals.total],
      ['Conductores involucrados', totals.drivers],
      ['Vehículos involucrados', totals.vehicles],
      ['Incidentes alta/critica', totals.critical],
      [''],
      ['Incidentes por tipo'],
      ...incidentsByType.map((r) => [r.type, r.value]),
      [''],
      ['Incidentes por severidad'],
      ...incidentsBySeverity.map((r) => [r.severity, r.value]),
      [''],
      ['Detalle'],
    ];

    const rows = [...summary, headers, ...detailRows];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell ?? ''}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_incidentes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text('Reporte de Incidentes', 14, 12);
      doc.setFontSize(10);
      const periodLabel =
        filters.startDate && filters.endDate
          ? `${filters.startDate} a ${filters.endDate}`
          : 'Todo el histórico';
      doc.text(`Período: ${periodLabel}`, 14, 18);
      doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 24);

      autoTable(doc, {
        startY: 28,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total incidentes', totals.total],
          ['Conductores involucrados', totals.drivers],
          ['Vehículos involucrados', totals.vehicles],
          ['Alta / crítica', totals.critical],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 6,
        head: [['Tipo', 'Cantidad']],
        body: incidentsByType.map((r) => [r.type, r.value]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 163, 74] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 6,
        head: [
          [
            'ID',
            'Fecha',
            'Tipo',
            'Severidad',
            'Conductor',
            'Vehículo',
            'Zona',
            'Estado',
          ],
        ],
        body: (incidents || []).map((i) => [
          i.id,
          new Date(i.occurred_at).toLocaleDateString('es-CO'),
          INCIDENT_TYPES_LABELS[i.type] || i.type,
          INCIDENT_SEVERITY_LABELS[i.severity] || i.severity,
          i.driver
            ? `${i.driver.nombre} ${i.driver.apellidos}`
            : 'Sin conductor',
          i.vehicle ? i.vehicle.placa : 'Sin vehículo',
          buildZoneLabel(i),
          i.status,
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save('reporte_incidentes.pdf');
    } catch (err) {
      console.error('Error exportando PDF', err);
      alert('No se pudo generar el PDF');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reportes de incidentes
          </h1>
          <p className="text-gray-600 mt-1">
            Agregados por tipo, severidad, conductor y zona con exportes CSV/PDF
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Incidentes en período</p>
            <p className="text-3xl font-bold text-gray-900">{totals.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Conductores afectados</p>
            <p className="text-3xl font-bold text-gray-900">{totals.drivers}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Vehículos involucrados</p>
            <p className="text-3xl font-bold text-gray-900">
              {totals.vehicles}
            </p>
          </div>
          <div className="p-3 bg-violet-50 rounded-lg">
            <BarChart3 className="w-6 h-6 text-violet-600" />
          </div>
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Alta / crítica</p>
            <p className="text-3xl font-bold text-gray-900">
              {totals.critical}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-4 h-4" />
            Filtros del reporte
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Período rápido</label>
              <select
                value={filters.period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                {periodOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Desde</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    startDate: e.target.value,
                    period: 'custom',
                  }))
                }
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Hasta</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    endDate: e.target.value,
                    period: 'custom',
                  }))
                }
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, type: e.target.value }))
                  }
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Todos</option>
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {INCIDENT_TYPES_LABELS[t] || t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Severidad</label>
                <select
                  value={filters.severity}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, severity: e.target.value }))
                  }
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Todas</option>
                  {Object.keys(INCIDENT_SEVERITY_LABELS).map((s) => (
                    <option key={s} value={s}>
                      {INCIDENT_SEVERITY_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            Última actualización: {new Date().toLocaleString('es-ES')}
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <BarChart3 className="w-4 h-4" />
              Incidentes por tipo
            </div>
            <span className="text-xs text-gray-500">
              {incidentsByType.length} categorías
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {incidentsByType.map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <PieChart className="w-4 h-4" />
              Severidad de incidentes
            </div>
            <span className="text-xs text-gray-500">
              {incidentsBySeverity.length} niveles
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={incidentsBySeverity}
                  dataKey="value"
                  nameKey="severity"
                  outerRadius={100}
                  label
                >
                  {incidentsBySeverity.map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <MapPin className="w-4 h-4" />
              Incidentes por zona
            </div>
            <span className="text-xs text-gray-500">
              Top {incidentsByZone.length}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsByZone} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="zone" width={180} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <Activity className="w-4 h-4" />
              Frecuencia por día
            </div>
            <span className="text-xs text-gray-500">
              {incidentsTimeline.length} días
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incidentsTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={20} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
            <BarChart3 className="w-4 h-4" />
            Conductores con más incidentes
          </div>
          <div className="space-y-2">
            {incidentsByDriver.length === 0 && (
              <p className="text-sm text-gray-500">
                Sin datos para el período.
              </p>
            )}
            {incidentsByDriver.map((row) => (
              <div
                key={row.driver}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="text-sm text-gray-800">{row.driver}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {row.total}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
            <MapPin className="w-4 h-4" />
            Top zonas
          </div>
          <div className="space-y-2">
            {incidentsByZone.length === 0 && (
              <p className="text-sm text-gray-500">
                Sin datos para el período.
              </p>
            )}
            {incidentsByZone.map((row) => (
              <div
                key={row.zone}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="text-sm text-gray-800">{row.zone}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <FileText className="w-4 h-4" />
            Detalle de incidentes filtrados
          </div>
          <span className="text-xs text-gray-500">
            {incidents.length} registros
          </span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Cargando incidentes...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : incidents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay incidentes en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Severidad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Conductor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Vehículo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Zona
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {incidents.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700">
                      {new Date(i.occurred_at).toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {INCIDENT_TYPES_LABELS[i.type] || i.type}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {INCIDENT_SEVERITY_LABELS[i.severity] || i.severity}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {i.driver
                        ? `${i.driver.nombre} ${i.driver.apellidos}`
                        : 'Sin conductor'}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {i.vehicle ? i.vehicle.placa : 'Sin vehículo'}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {buildZoneLabel(i)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
