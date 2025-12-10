import React, { useEffect, useMemo, useState } from 'react';
import {
  getIncidents,
  updateIncident,
  deleteIncident,
  getIncidentComments,
  addIncidentComment,
  INCIDENT_TYPES_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
} from '../services/incidentService';
import { driverService } from '../services/driverService';
import { vehicleService } from '../services/vehicleService';
import { FileDown, MessageSquare, X, Trash2, FileText } from 'lucide-react';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function DriverIncidents() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    driverId: '',
    vehicleId: '',
    type: '',
    severity: '',
    startDate: '',
    endDate: '',
  });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [viewMode, setViewMode] = useState('active'); // 'active' o 'resolved'

  useEffect(() => {
    (async () => {
      const [d, v] = await Promise.all([
        driverService.getAll(),
        vehicleService.getAll(),
      ]);
      setDrivers(d.data || []);
      setVehicles(v.data || []);
      // Obtener nombre del supervisor desde localStorage
      try {
        const uStr =
          localStorage.getItem('currentUser') ||
          localStorage.getItem('mockUser');
        if (uStr) {
          const u = JSON.parse(uStr);
          const nombre =
            u?.nombre ||
            u?.user_metadata?.name ||
            `${u?.user_metadata?.first_name || ''} ${u?.user_metadata?.last_name || ''}`.trim();
          setSupervisorName(nombre || 'Supervisor');
        } else {
          setSupervisorName('Supervisor');
        }
      } catch {
        setSupervisorName('Supervisor');
      }
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const statusFilter =
      viewMode === 'resolved' ? 'resolved,closed' : 'reported,investigating';
    const { data } = await getIncidents({ ...filters, status: statusFilter });
    setIncidents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [
    filters.driverId,
    filters.vehicleId,
    filters.type,
    filters.severity,
    filters.startDate,
    filters.endDate,
    viewMode,
  ]);

  const openComments = async (incident) => {
    setSelectedIncident(incident);
    setComments([]);
    setCommentsLoading(true);
    const { data } = await getIncidentComments(incident.id);
    setComments(data || []);
    setCommentsLoading(false);
  };

  const closeComments = () => {
    setSelectedIncident(null);
    setComments([]);
    setNewComment('');
  };

  const submitComment = async () => {
    if (!selectedIncident || !newComment.trim()) return;
    const { data } = await addIncidentComment(
      selectedIncident.id,
      newComment.trim(),
      supervisorName || 'Supervisor'
    );
    if (data) {
      setComments((prev) => [...prev, data]);
      setNewComment('');
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        'ID',
        'Conductor',
        'Vehículo',
        'Tipo',
        'Severidad',
        'Título',
        'Fecha',
        'Estado',
        'Descripción',
        'Ubicación',
        'Latitud',
        'Longitud',
      ],
      ...incidents.map((i) => [
        i.id,
        i.driver ? `${i.driver.nombre} ${i.driver.apellidos}` : '',
        i.vehicle
          ? `${i.vehicle.placa} ${i.vehicle.marca} ${i.vehicle.modelo}`
          : '',
        INCIDENT_TYPES_LABELS[i.type] || i.type,
        INCIDENT_SEVERITY_LABELS[i.severity] || i.severity,
        i.title,
        new Date(i.occurred_at).toLocaleString(),
        INCIDENT_STATUS_LABELS[i.status] || i.status,
        i.description || '',
        i.location || '',
        i.location_lat || '',
        i.location_lng || '',
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename =
      viewMode === 'resolved'
        ? 'incidentes_resueltos.csv'
        : 'incidentes_activos.csv';
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const title =
        viewMode === 'resolved'
          ? 'Reporte de Incidentes Resueltos'
          : 'Reporte de Incidentes Activos';

      doc.setFontSize(16);
      doc.text(title, 14, 12);
      doc.setFontSize(9);
      doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 18);

      const filterSummary = [];
      if (filters.driverId) {
        const driver = drivers.find((d) => d.id == filters.driverId);
        filterSummary.push(`Conductor: ${driver?.nombre} ${driver?.apellidos}`);
      }
      if (filters.vehicleId) {
        const vehicle = vehicles.find((v) => v.id == filters.vehicleId);
        filterSummary.push(`Vehículo: ${vehicle?.placa}`);
      }
      if (filters.type)
        filterSummary.push(
          `Tipo: ${INCIDENT_TYPES_LABELS[filters.type] || filters.type}`
        );
      if (filters.severity)
        filterSummary.push(
          `Severidad: ${INCIDENT_SEVERITY_LABELS[filters.severity] || filters.severity}`
        );
      if (filters.startDate)
        filterSummary.push(
          `Desde: ${new Date(filters.startDate).toLocaleDateString('es-CO')}`
        );
      if (filters.endDate)
        filterSummary.push(
          `Hasta: ${new Date(filters.endDate).toLocaleDateString('es-CO')}`
        );

      doc.setFontSize(8);
      doc.text(
        filterSummary.length ? filterSummary : ['Sin filtros aplicados'],
        14,
        24
      );

      const tableData = incidents.map((i) => [
        String(i.id),
        i.driver ? `${i.driver.nombre} ${i.driver.apellidos}` : 'Sin asignar',
        i.vehicle ? i.vehicle.placa : 'Sin asignar',
        INCIDENT_TYPES_LABELS[i.type] || i.type,
        INCIDENT_SEVERITY_LABELS[i.severity] || i.severity,
        i.title,
        i.location || '-',
        new Date(i.occurred_at).toLocaleDateString('es-CO'),
        INCIDENT_STATUS_LABELS[i.status] || i.status,
      ]);

      autoTable(doc, {
        startY: 28,
        head: [
          [
            'ID',
            'Conductor',
            'Vehículo',
            'Tipo',
            'Severidad',
            'Título',
            'Ubicación',
            'Fecha',
            'Estado',
          ],
        ],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 28 },
          2: { cellWidth: 18 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 40 },
          6: { cellWidth: 25 },
          7: { cellWidth: 18 },
          8: { cellWidth: 18 },
        },
        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(8);
          doc.text(
            `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          );
        },
      });

      const filename =
        viewMode === 'resolved'
          ? `reporte_incidentes_resueltos_${Date.now()}.pdf`
          : `reporte_incidentes_activos_${Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error exportando PDF:', err);
      alert('Error al generar PDF: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar incidente?')) return;
    await deleteIncident(id);
    await load();
  };

  const handleChangeStatus = async (id, newStatus) => {
    await updateIncident(id, { status: newStatus });
    await load();
  };

  const driverOptions = useMemo(
    () => [
      { id: '', label: 'Todos' },
      ...(drivers || []).map((d) => ({
        id: d.id,
        label: `${d.nombre} ${d.apellidos}`,
      })),
    ],
    [drivers]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incidentes</h1>
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md flex items-center gap-2"
          >
            <FileText size={16} /> Exportar PDF
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md flex items-center gap-2"
          >
            <FileDown size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Pestañas para cambiar vista */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Incidentes Activos
        </button>
        <button
          onClick={() => setViewMode('resolved')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'resolved'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Incidentes Resueltos
        </button>
      </div>

      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Conductor</label>
          <select
            value={filters.driverId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, driverId: e.target.value }))
            }
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
          <label className="text-sm text-gray-600">Tipo</label>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: e.target.value }))
            }
            className="w-full border rounded p-2"
          >
            <option value="">Todos</option>
            <option value="accident">Accidente</option>
            <option value="breakdown">Avería</option>
            <option value="violation">Infracción</option>
            <option value="near_miss">Casi accidente</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Severidad</label>
          <select
            value={filters.severity}
            onChange={(e) =>
              setFilters((f) => ({ ...f, severity: e.target.value }))
            }
            className="w-full border rounded p-2"
          >
            <option value="">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={toDateInput(filters.startDate)}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: e.target.value }))
            }
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            value={toDateInput(filters.endDate)}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value }))
            }
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando...</div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {viewMode === 'resolved'
              ? 'No hay incidentes resueltos'
              : 'No hay incidentes activos'}
          </div>
        ) : (
          <ul className="divide-y">
            {incidents.map((i) => (
              <li
                key={i.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(i.occurred_at).toLocaleString()} •{' '}
                    {INCIDENT_TYPES_LABELS[i.type] || i.type} •{' '}
                    {INCIDENT_SEVERITY_LABELS[i.severity] || i.severity}
                  </div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-gray-600">
                    {i.driver ? `${i.driver.nombre} ${i.driver.apellidos}` : ''}{' '}
                    •{' '}
                    {i.vehicle
                      ? `${i.vehicle.placa} ${i.vehicle.marca} ${i.vehicle.modelo}`
                      : ''}
                  </div>
                  {i.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {i.description}
                    </div>
                  )}
                  {(typeof i.location_lat === 'number' &&
                    typeof i.location_lng === 'number') ||
                  i.location ? (
                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-2">
                      {typeof i.location_lat === 'number' &&
                      typeof i.location_lng === 'number' ? (
                        <span>
                          📍 Lat {i.location_lat.toFixed(4)}, Lng{' '}
                          {i.location_lng.toFixed(4)}
                        </span>
                      ) : null}
                      {i.location ? <span>{i.location}</span> : null}
                      <a
                        className="underline"
                        href={`https://www.google.com/maps?q=${
                          typeof i.location_lat === 'number' &&
                          typeof i.location_lng === 'number'
                            ? `${i.location_lat},${i.location_lng}`
                            : encodeURIComponent(i.location || '')
                        }`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir mapa
                      </a>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openComments(i)}
                    className="text-blue-600 hover:bg-blue-50 rounded-md p-2"
                    title="Comentarios"
                  >
                    <MessageSquare size={16} />
                  </button>
                  {viewMode === 'active' && (
                    <select
                      value={i.status}
                      onChange={(e) => handleChangeStatus(i.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      title="Cambiar estado"
                    >
                      <option value="reported">
                        {INCIDENT_STATUS_LABELS.reported}
                      </option>
                      <option value="investigating">
                        {INCIDENT_STATUS_LABELS.investigating}
                      </option>
                      <option value="resolved">
                        {INCIDENT_STATUS_LABELS.resolved}
                      </option>
                      <option value="closed">
                        {INCIDENT_STATUS_LABELS.closed}
                      </option>
                    </select>
                  )}
                  {viewMode === 'resolved' && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {INCIDENT_STATUS_LABELS[i.status] || i.status}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="text-red-600 hover:bg-red-50 rounded-md p-2"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Panel de comentarios */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeComments}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">
                  Incidente #{selectedIncident.id}
                </div>
                <div className="font-semibold">{selectedIncident.title}</div>
              </div>
              <button
                onClick={closeComments}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              {commentsLoading ? (
                <div className="text-gray-500">Cargando comentarios...</div>
              ) : comments.length === 0 ? (
                <div className="text-gray-500">Sin comentarios</div>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c.id} className="border rounded p-2">
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>{c.supervisor_name || 'Supervisor'}</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 text-sm">{c.comment}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t space-y-2">
              <div>
                <label className="text-sm text-gray-600">
                  Nuevo comentario
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Escribe una nota para supervisión..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Supervisor: {supervisorName || 'Supervisor'}
                </div>
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Agregar comentario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
