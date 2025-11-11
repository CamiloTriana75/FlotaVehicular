import React, { useEffect, useMemo, useState } from 'react';
import {
  getIncidents,
  createIncident,
  deleteIncident,
  getIncidentComments,
  addIncidentComment,
} from '../services/incidentService';
import { driverService } from '../services/driverService';
import { vehicleService } from '../services/vehicleService';
import { FileDown, Plus, Trash2, MessageSquare, X } from 'lucide-react';

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
    const { data } = await getIncidents(filters);
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
      ],
      ...incidents.map((i) => [
        i.id,
        i.driver ? `${i.driver.nombre} ${i.driver.apellidos}` : '',
        i.vehicle
          ? `${i.vehicle.placa} ${i.vehicle.marca} ${i.vehicle.modelo}`
          : '',
        i.type,
        i.severity,
        i.title,
        new Date(i.occurred_at).toLocaleString(),
        i.status,
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
    a.download = 'incidentes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickCreate = async () => {
    if (!filters.driverId) {
      alert('Seleccione un conductor para crear incidente rápido');
      return;
    }
    const payload = {
      driver_id: Number(filters.driverId),
      type: 'other',
      severity: 'low',
      title: 'Incidente reportado',
      occurred_at: new Date().toISOString(),
      status: 'reported',
    };
    await createIncident(payload);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar incidente?')) return;
    await deleteIncident(id);
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
            onClick={exportCSV}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
          >
            <FileDown size={16} /> Exportar CSV
          </button>
          <button
            onClick={handleQuickCreate}
            className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
          >
            <Plus size={16} /> Nuevo rápido
          </button>
        </div>
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
          <div className="p-12 text-center text-gray-500">Sin incidentes</div>
        ) : (
          <ul className="divide-y">
            {incidents.map((i) => (
              <li
                key={i.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(i.occurred_at).toLocaleString()} • {i.type} •{' '}
                    {i.severity}
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
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openComments(i)}
                    className="text-blue-600 hover:bg-blue-50 rounded-md p-2"
                    title="Comentarios"
                  >
                    <MessageSquare size={16} />
                  </button>
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
