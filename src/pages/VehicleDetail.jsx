import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Card from '../components/Card';
import MapViewer from '../components/MapViewer';
import VehicleForm from '../components/VehicleForm';
import { useAuth } from '../hooks/useAuth';
import { useMaintenance } from '../hooks';
import { downloadInvoice } from '../services/invoiceService';
import { vehicleService } from '../services/vehicleService';
import {
  addStatusChange,
  loadStatusHistory,
  downloadCSV,
} from '../shared/utils/statusHistory';
import { exportStatusHistoryToPDF } from '../shared/utils/pdfExport';
import { downloadMaintenancePDF } from '../shared/utils/maintenancePdfExport';
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
  Wrench,
  FileText,
  FileDown,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getHistoryByVehicle, totalsByVehicle } = useMaintenance();
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDraft, setStatusDraft] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);

  const isAdmin = useMemo(
    () => (user?.role || '').toLowerCase() === 'admin',
    [user]
  );

  // Cargar vehículo real desde Supabase
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await vehicleService.getById(
          parseInt(id)
        );

        if (fetchError) {
          console.error('Error al cargar vehículo:', fetchError);
          setError(fetchError.message || 'Error al cargar vehículo');
          setVehicleData(null);
          return;
        }

        if (!data) {
          setError('Vehículo no encontrado');
          setVehicleData(null);
          return;
        }

        setVehicleData(data);
        setStatusDraft(data.status);
      } catch (err) {
        console.error('Error inesperado:', err);
        setError(err.message || 'Error inesperado');
        setVehicleData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadVehicle();
    }
  }, [id]);

  // Filtros de tipo y periodo
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  // Obtener historial completo
  const maintenanceHistoryRaw = useMemo(
    () => getHistoryByVehicle(vehicleData?.id),
    [getHistoryByVehicle, vehicleData?.id]
  );

  // Calcular años disponibles
  const availableYears = useMemo(() => {
    const years = maintenanceHistoryRaw
      .map((o) => {
        const date = o.scheduledDate || o.executionDate || o.completionDate;
        return date ? new Date(date).getFullYear() : null;
      })
      .filter((y) => !!y);
    return Array.from(new Set(years));
  }, [maintenanceHistoryRaw]);

  // Filtrar por tipo y año
  const maintenanceHistory = useMemo(() => {
    return maintenanceHistoryRaw.filter((order) => {
      const matchesType = filterType === 'all' || order.type === filterType;
      const date =
        order.scheduledDate || order.executionDate || order.completionDate;
      const year = date ? new Date(date).getFullYear() : null;
      const matchesYear = filterYear === 'all' || year === filterYear;
      return matchesType && matchesYear;
    });
  }, [maintenanceHistoryRaw, filterType, filterYear]);

  // Datos para gráfico de gasto por mes
  const chartData = useMemo(() => {
    // Agrupar por mes
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const data = months.map((month) => {
      const total = maintenanceHistory
        .filter((order) => {
          const date =
            order.scheduledDate || order.executionDate || order.completionDate;
          return date && new Date(date).getMonth() + 1 === month;
        })
        .reduce((sum, o) => sum + (o.totalCost || 0), 0);
      return {
        month,
        total,
      };
    });
    return data;
  }, [maintenanceHistory]);

  const totalMaintenanceCost = useMemo(
    () => totalsByVehicle[vehicleData?.id] || 0,
    [totalsByVehicle, vehicleData?.id]
  );

  // Calcular costos acumulados por tipo
  const costBreakdown = useMemo(() => {
    const breakdown = {
      preventivo: 0,
      correctivo: 0,
      inspeccion: 0,
      predictivo: 0,
      total: 0,
      count: maintenanceHistory.length,
      avgCost: 0,
    };

    maintenanceHistory.forEach((order) => {
      const cost = order.totalCost || 0;
      breakdown.total += cost;
      if (order.type === 'preventivo') breakdown.preventivo += cost;
      else if (order.type === 'correctivo') breakdown.correctivo += cost;
      else if (order.type === 'inspeccion') breakdown.inspeccion += cost;
      else if (order.type === 'predictivo') breakdown.predictivo += cost;
    });

    breakdown.avgCost =
      breakdown.count > 0 ? breakdown.total / breakdown.count : 0;
    return breakdown;
  }, [maintenanceHistory]);

  // Cargar historial de estados cuando vehicleData cambie
  useEffect(() => {
    if (vehicleData?.id) {
      setStatusHistory(loadStatusHistory(vehicleData.id));
    }
  }, [vehicleData?.id]);

  // Handlers
  const handleSave = async (updatedData) => {
    try {
      const { data, error } = await vehicleService.update(
        vehicleData.id,
        updatedData
      );
      if (error) {
        console.error('Error al actualizar vehículo:', error);
        alert('Error al actualizar vehículo: ' + error.message);
        return;
      }
      setVehicleData(data);
      setIsEditing(false);
      alert('Vehículo actualizado exitosamente');
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Error inesperado al actualizar vehículo');
    }
  };

  const handleChangeStatus = () => {
    if (!isAuthenticated || !isAdmin) return;
    if (!statusDraft || statusDraft === vehicleData.status) return;
    const { vehicle, entry } = addStatusChange(vehicleData, statusDraft, user);
    setVehicleData(vehicle);
    setStatusHistory((prev) => [entry, ...prev]);
  };

  const handleExportExcel = () => {
    // Hoja 1: Información del vehículo
    const vehicleInfo = [
      ['REPORTE DE MANTENIMIENTO DE VEHÍCULO'],
      [''],
      ['Placa', vehicleData.placa],
      ['Marca', vehicleData.marca],
      ['Modelo', vehicleData.modelo],
      ['Año', vehicleData.año],
      ['Color', vehicleData.color],
      ['Kilometraje', vehicleData.kilometraje],
      [''],
      ['Filtros Aplicados:'],
      ['Tipo', filterType === 'all' ? 'Todos' : filterType],
      ['Año', filterYear === 'all' ? 'Todos' : filterYear],
    ];

    // Hoja 2: Resumen de costos
    const costSummary = [
      ['RESUMEN DE COSTOS'],
      [''],
      ['Total General', costBreakdown.total],
      ['Mantenimiento Preventivo', costBreakdown.preventivo],
      ['Mantenimiento Correctivo', costBreakdown.correctivo],
      ['Inspecciones', costBreakdown.inspeccion],
      ['Mantenimiento Predictivo', costBreakdown.predictivo],
      [''],
      ['Total de Órdenes', costBreakdown.count],
      ['Costo Promedio', costBreakdown.avgCost],
    ];

    // Hoja 3: Historial de mantenimiento
    const maintenanceData = [
      [
        'ID',
        'Título',
        'Tipo',
        'Estado',
        'Fecha Programada',
        'Fecha Ejecución',
        'Kilometraje',
        'Repuestos',
        'Mano de Obra',
        'Otros',
        'Total',
      ],
    ];

    maintenanceHistory.forEach((order) => {
      const partsCost =
        order.parts?.reduce((sum, p) => sum + p.quantity * p.unitCost, 0) || 0;
      const laborCost = (order.laborHours || 0) * (order.laborRate || 0);

      maintenanceData.push([
        order.id,
        order.title,
        order.type,
        order.status,
        order.scheduledDate || '',
        order.executionDate || '',
        order.mileage || '',
        partsCost,
        laborCost,
        order.otherCosts || 0,
        order.totalCost || 0,
      ]);
    });

    // Hoja 4: Gasto mensual
    const monthlyData = [['Mes', 'Gasto Total']];
    chartData.forEach((item) => {
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
      monthlyData.push([monthNames[item.month - 1], item.total]);
    });

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(vehicleInfo);
    const ws2 = XLSX.utils.aoa_to_sheet(costSummary);
    const ws3 = XLSX.utils.aoa_to_sheet(maintenanceData);
    const ws4 = XLSX.utils.aoa_to_sheet(monthlyData);

    XLSX.utils.book_append_sheet(wb, ws1, 'Información Vehículo');
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen Costos');
    XLSX.utils.book_append_sheet(wb, ws3, 'Historial Mantenimiento');
    XLSX.utils.book_append_sheet(wb, ws4, 'Gasto Mensual');

    // Descargar
    const fileName = `mantenimiento_${vehicleData.placa}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const STATUS_OPTIONS = [
    { value: 'activo', label: 'Activo' },
    { value: 'mantenimiento', label: 'En mantenimiento' },
    { value: 'fuera_servicio', label: 'Fuera de servicio' },
  ];

  // Early returns después de todos los hooks
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando vehículo...</p>
      </div>
    );
  }

  if (error || !vehicleData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Vehículo no encontrado'}</p>
        <button
          onClick={() => navigate('/vehiculos')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros arriba del gráfico y la lista */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm text-gray-600 mr-2">
            Tipo de mantenimiento:
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="inspeccion">Inspección</option>
            <option value="predictivo">Predictivo</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mr-2">Año:</label>
          <select
            value={filterYear}
            onChange={(e) =>
              setFilterYear(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todos</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico de gasto por mes */}
      <div className="mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Gasto de mantenimiento por mes
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(m) => `${m}`} />
              <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="total" name="Gasto" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Cards de resumen de costos acumulados */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total General</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                $
                {costBreakdown.total.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600 opacity-70" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Preventivo</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                $
                {costBreakdown.preventivo.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Wrench className="w-8 h-8 text-green-600 opacity-70" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Correctivo</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                $
                {costBreakdown.correctivo.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Wrench className="w-8 h-8 text-red-600 opacity-70" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Promedio</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                $
                {costBreakdown.avgCost.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {costBreakdown.count} órdenes
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 opacity-70" />
          </div>
        </Card>
      </div>

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
                  <Gauge className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Marca</p>
                    <p className="font-medium">{vehicleData.marca || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Gauge className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Modelo</p>
                    <p className="font-medium">{vehicleData.modelo || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Año</p>
                    <p className="font-medium">{vehicleData.año || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Fuel className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-medium">{vehicleData.color || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Número de Chasis</p>
                    <p className="font-medium">
                      {vehicleData.numero_chasis || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Número de Motor</p>
                    <p className="font-medium">
                      {vehicleData.numero_motor || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Fuel className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Capacidad Combustible
                    </p>
                    <p className="font-medium">
                      {vehicleData.capacidad_combustible
                        ? `${vehicleData.capacidad_combustible} L`
                        : 'N/A'}
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
                        {vehicleData.status || 'N/A'}
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
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Kilometraje</span>
                    <span className="font-medium">
                      {vehicleData.kilometraje
                        ? vehicleData.kilometraje.toLocaleString()
                        : '0'}{' '}
                      km
                    </span>
                  </div>
                  {vehicleData.fecha_compra && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Fecha de Compra
                      </span>
                      <span className="font-medium">
                        {new Date(vehicleData.fecha_compra).toLocaleDateString(
                          'es-CO'
                        )}
                      </span>
                    </div>
                  )}
                  {vehicleData.fecha_ultimo_mantenimiento && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Último Mantenimiento
                      </span>
                      <span className="font-medium">
                        {new Date(
                          vehicleData.fecha_ultimo_mantenimiento
                        ).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  )}
                  {vehicleData.proximo_mantenimiento_km && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Próximo Mant. (km)
                      </span>
                      <span className="font-medium">
                        {vehicleData.proximo_mantenimiento_km.toLocaleString()}{' '}
                        km
                      </span>
                    </div>
                  )}
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

        {/* Historial de Mantenimiento */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Historial de Mantenimiento
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar Excel
                </button>
                <button
                  onClick={() =>
                    downloadMaintenancePDF(
                      vehicleData,
                      maintenanceHistory,
                      costBreakdown,
                      chartData,
                      filterType,
                      filterYear
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </button>
              </div>
            </div>

            {maintenanceHistory.length > 0 ? (
              <div className="space-y-4">
                {maintenanceHistory.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {order.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'completada'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'en_proceso'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : order.status === 'programada'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {order.type}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {order.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                          {order.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Programado: {order.scheduledDate}
                            </span>
                          )}
                          {order.executionDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Ejecutado: {order.executionDate}
                            </span>
                          )}
                          {order.mileage && (
                            <span className="flex items-center gap-1">
                              <Gauge className="w-3 h-3" />
                              {order.mileage.toLocaleString()} km
                            </span>
                          )}
                        </div>

                        {/* Detalles de costos */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {order.parts && order.parts.length > 0 && (
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-gray-600">Repuestos</p>
                              <p className="font-semibold text-blue-700">
                                $
                                {order.parts
                                  .reduce(
                                    (sum, p) => sum + p.quantity * p.unitCost,
                                    0
                                  )
                                  .toLocaleString('es-ES')}
                              </p>
                            </div>
                          )}
                          {order.laborHours > 0 && (
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-gray-600">Mano de Obra</p>
                              <p className="font-semibold text-green-700">
                                $
                                {(
                                  (order.laborHours || 0) *
                                  (order.laborRate || 0)
                                ).toLocaleString('es-ES')}
                              </p>
                            </div>
                          )}
                          {order.otherCosts > 0 && (
                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-gray-600">Otros</p>
                              <p className="font-semibold text-purple-700">
                                ${order.otherCosts.toLocaleString('es-ES')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="text-xl font-bold text-gray-900">
                          $
                          {(order.totalCost || 0).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <button
                          onClick={() => downloadInvoice(order, vehicleData)}
                          className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Factura
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay registros de mantenimiento para este vehículo</p>
              </div>
            )}
          </Card>
        </div>

        {/* Información adicional */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Información Adicional
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Placa</p>
                <p className="font-medium text-lg">
                  {vehicleData.placa || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado Actual</p>
                <p className="font-medium">{vehicleData.status || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Resumen del Vehículo</p>
              <p className="text-sm">
                <strong>
                  {vehicleData.marca} {vehicleData.modelo}
                </strong>{' '}
                ({vehicleData.año})
                <br />
                Color: {vehicleData.color || 'N/A'}
                <br />
                Kilometraje actual:{' '}
                {vehicleData.kilometraje
                  ? vehicleData.kilometraje.toLocaleString()
                  : '0'}{' '}
                km
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
