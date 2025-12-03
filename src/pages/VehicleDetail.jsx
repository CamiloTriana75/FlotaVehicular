import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockVehicles } from '../data/mockVehicles';
import Card from '../components/Card';
import MapViewer from '../components/MapViewer';
import VehicleForm from '../components/VehicleForm';
import { useAuth } from '../hooks/useAuth';
import {
  addStatusChange,
  loadStatusHistory,
  downloadCSV,
} from '../shared/utils/statusHistory';
import { exportStatusHistoryToPDF } from '../shared/utils/pdfExport';
import {
  ArrowLeft,
  MapPin,
  Gauge,
  Fuel,
  Calendar,
  User,
  Edit,
  Save,
  X,
  Download,
} from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleData, setVehicleData] = useState(
    mockVehicles.find((v) => v.id === parseInt(id))
  );
  const [statusDraft, setStatusDraft] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);

  const isAdmin = useMemo(
    () => (user?.role || '').toLowerCase() === 'admin',
    [user]
  );

  if (!vehicleData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehículo no encontrado</p>
        <button
          onClick={() => navigate('/vehiculos')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const handleSave = (updatedData) => {
    setVehicleData(updatedData);
    setIsEditing(false);
  };

  useEffect(() => {
    if (vehicleData?.id) {
      setStatusHistory(loadStatusHistory(vehicleData.id));
      setStatusDraft(vehicleData.status);
    }
  }, [vehicleData?.id]);

  const handleChangeStatus = () => {
    if (!isAuthenticated || !isAdmin) return;
    if (!statusDraft || statusDraft === vehicleData.status) return;
    const { vehicle, entry } = addStatusChange(vehicleData, statusDraft, user);
    setVehicleData(vehicle);
    setStatusHistory((prev) => [entry, ...prev]);
  };

  const STATUS_OPTIONS = [
    { value: 'activo', label: 'Activo' },
    { value: 'mantenimiento', label: 'En mantenimiento' },
    { value: 'fuera_servicio', label: 'Fuera de servicio' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/vehiculos')}
            className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vehículo {vehicleData.placa}
            </h1>
            <p className="text-gray-600">{vehicleData.modelo}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Vehículo */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>

            {isEditing ? (
              <VehicleForm
                vehicle={vehicleData}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación actual</p>
                    <p className="font-medium">
                      {vehicleData.lat.toFixed(4)}, {vehicleData.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Gauge className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Velocidad</p>
                    <p className="font-medium">{vehicleData.speed} km/h</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Fuel className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Combustible</p>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            vehicleData.combustible > 50
                              ? 'bg-green-500'
                              : vehicleData.combustible > 20
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${vehicleData.combustible}%` }}
                        />
                      </div>
                      <span className="font-medium">
                        {vehicleData.combustible}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Conductor</p>
                    <p className="font-medium">{vehicleData.conductor}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Última actualización
                    </p>
                    <p className="font-medium">
                      {new Date(vehicleData.ultimaActualizacion).toLocaleString(
                        'es-CO'
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Estado</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          vehicleData.status === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : vehicleData.status === 'mantenimiento'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicleData.status}
                      </span>
                      {isAuthenticated && isAdmin && (
                        <div className="flex items-center gap-2">
                          <select
                            value={statusDraft || ''}
                            onChange={(e) => setStatusDraft(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleChangeStatus}
                            disabled={
                              !statusDraft || statusDraft === vehicleData.status
                            }
                            className="flex items-center px-2 py-1 text-xs bg-blue-600 disabled:bg-gray-300 text-white rounded"
                          >
                            <Save className="h-3 w-3 mr-1" /> Guardar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kilometraje</span>
                    <span className="font-medium">
                      {vehicleData.kilometraje.toLocaleString()} km
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Historial de Estados */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">Historial de Estados</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadCSV(statusHistory)}
                  className="flex items-center px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar CSV
                </button>
                <button
                  onClick={() => exportStatusHistoryToPDF(statusHistory)}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar PDF
                </button>
              </div>
            </div>
            {statusHistory.length === 0 ? (
              <p className="text-sm text-gray-500">
                Sin cambios de estado registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {statusHistory.map((h) => (
                  <div
                    key={h.id}
                    className="border-l-2 border-blue-200 pl-4 pb-3"
                  >
                    <p className="font-medium text-sm">
                      {h.oldStatus} → {h.newStatus}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(h.timestamp).toLocaleString('es-CO')} ·{' '}
                      {h.userEmail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">
              Ubicación en Tiempo Real
            </h2>
            <div className="h-96">
              <MapViewer
                vehicles={[vehicleData]}
                center={[vehicleData.lat, vehicleData.lng]}
                zoom={13}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
