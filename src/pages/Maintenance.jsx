import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { useMaintenance, useVehicles } from '../hooks';
import { downloadInvoice, previewInvoice } from '../services/invoiceService';
import {
  Calendar,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  Wrench,
} from 'lucide-react';

const statusOptions = [
  { id: 'all', label: 'Todos' },
  { id: 'scheduled', label: 'Programados' },
  { id: 'in_progress', label: 'En progreso' },
  { id: 'completed', label: 'Completados' },
];

const typeOptions = [
  { id: 'preventivo', label: 'Preventivo' },
  { id: 'correctivo', label: 'Correctivo' },
  { id: 'inspeccion', label: 'Inspección' },
];

const emptyForm = {
  vehicleId: '',
  vehiclePlate: '',
  title: '',
  type: 'preventivo',
  description: '',
  scheduledDate: '',
  actualDate: '',
  odometer: '',
  laborHours: 0,
  laborRate: 0,
  otherCosts: 0,
  status: 'scheduled',
  notes: '',
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const calculateLaborCost = (hours, rate) =>
  (Number(hours) || 0) * (Number(rate) || 0);

const statusBadge = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

const Maintenance = () => {
  const { vehicles } = useVehicles();
  const {
    filteredOrders,
    orders,
    filters,
    setFilters,
    addOrder,
    updateOrder,
    totalsByVehicle,
  } = useMaintenance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const totals = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalCost += order.totalCost || 0;
        return acc;
      },
      { scheduled: 0, in_progress: 0, completed: 0, overdue: 0, totalCost: 0 }
    );
    return totals;
  }, [orders]);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const vehicleId = Number(form.vehicleId) || form.vehicleId;
    const vehicle = vehicles.find(
      (v) => v.id === vehicleId || Number(v.id) === vehicleId
    );

    if (!vehicleId) {
      alert('Por favor selecciona un vehículo');
      return;
    }
    if (!form.title?.trim()) {
      alert('Por favor ingresa un título');
      return;
    }

    const orderPayload = {
      ...form,
      vehicleId,
      vehiclePlate: vehicle?.placa || vehicle?.plate || form.vehiclePlate,
      laborHours: Number(form.laborHours) || 0,
      laborRate: Number(form.laborRate) || 0,
      otherCosts: Number(form.otherCosts) || 0,
      mileage: Number(form.odometer) || undefined,
      status: form.status,
    };

    const result = await addOrder(orderPayload);

    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      alert('✅ Orden de mantenimiento creada exitosamente');
    } else {
      alert(`❌ Error al crear la orden: ${result.error}`);
    }
  };

  const laborCost = calculateLaborCost(form.laborHours, form.laborRate);
  const totalCost = laborCost + (Number(form.otherCosts) || 0);

  const updateStatus = async (orderId, status) => {
    const result = await updateOrder(orderId, { status });
    if (!result.success) {
      alert(`Error al actualizar estado: ${result.error}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-gray-600 mt-1">
            Registra reparaciones con repuestos, mano de obra y facturas.
          </p>
          <p className="text-xs text-gray-500">
            Usuario sugerido: mecanico@flotavehicular.com / Mecanico123!
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva orden</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Programados</p>
            <p className="text-2xl font-semibold">{stats.scheduled}</p>
          </div>
          <Calendar className="w-8 h-8 text-blue-600" />
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">En progreso</p>
            <p className="text-2xl font-semibold">{stats.in_progress}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-600" />
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Completados</p>
            <p className="text-2xl font-semibold">{stats.completed}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Costo total</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(stats.totalCost)}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-600" />
        </Card>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilters({ status: option.id })}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    filters.status === option.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Buscar por placa o título"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Car className="w-6 h-6 text-gray-700" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.vehiclePlate || 'Vehículo'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[order.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {order.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {order.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    {order.title}
                  </p>
                  <p className="text-sm text-gray-500">{order.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Programado:{' '}
                      {order.scheduledDate}
                    </span>
                    {order.actualDate && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Ejecutado:{' '}
                        {order.actualDate}
                      </span>
                    )}
                    {order.odometer && (
                      <span className="inline-flex items-center gap-1">
                        <Car className="w-3 h-3" />{' '}
                        {order.odometer.toLocaleString()} km
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Costo acumulado vehículo:{' '}
                    {formatCurrency(
                      totalsByVehicle[order.vehicleId] || order.totalCost || 0
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-2 min-w-[180px]">
                <p className="text-sm text-gray-500">Costo total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(order.totalCost || 0)}
                </p>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions
                    .filter((o) => o.id !== 'all')
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                </select>

                {/* Botones de factura */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const vehicle = vehicles.find(
                        (v) => v.id === order.vehicleId
                      );
                      downloadInvoice(order, vehicle);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-medium flex items-center justify-center gap-1"
                    title="Descargar factura PDF"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      const vehicle = vehicles.find(
                        (v) => v.id === order.vehicleId
                      );
                      previewInvoice(order, vehicle);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-1"
                    title="Imprimir factura"
                  >
                    <Printer className="w-3 h-3" />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="border rounded-lg p-4 border-gray-100 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Mano de obra
                </h4>
                <p className="text-sm text-gray-700">
                  {order.laborHours} h x {formatCurrency(order.laborRate)} =
                  <span className="font-semibold text-gray-900">
                    {' '}
                    {formatCurrency(order.laborCost)}
                  </span>
                </p>
                {order.otherCosts ? (
                  <p className="text-sm text-gray-700">
                    Otros: {formatCurrency(order.otherCosts)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Sin costos adicionales
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Notas: {order.notes || 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {!filteredOrders.length && (
          <Card className="p-8 text-center text-gray-500">
            No hay órdenes con los filtros actuales.
          </Card>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Nueva orden de mantenimiento
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Vehículo</label>
                  <select
                    required
                    value={form.vehicleId}
                    onChange={(e) =>
                      setForm({ ...form, vehicleId: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un vehículo</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa || v.plate} - {v.modelo || v.model || ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Título</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. Reparación frenos delanteros"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions
                      .filter((o) => o.id !== 'all')
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">
                    Fecha programada
                  </label>
                  <input
                    required
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) =>
                      setForm({ ...form, scheduledDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">
                    Fecha de ejecución
                  </label>
                  <input
                    type="date"
                    value={form.actualDate}
                    onChange={(e) =>
                      setForm({ ...form, actualDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Kilometraje</label>
                  <input
                    type="number"
                    value={form.odometer}
                    onChange={(e) =>
                      setForm({ ...form, odometer: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. 45250"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Notas</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Indicaciones adicionales"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-gray-600">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Detalles de la intervención"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Horas</label>
                  <input
                    type="number"
                    value={form.laborHours}
                    onChange={(e) =>
                      setForm({ ...form, laborHours: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Valor hora</label>
                  <input
                    type="number"
                    value={form.laborRate}
                    onChange={(e) =>
                      setForm({ ...form, laborRate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Otros costos</label>
                  <input
                    type="number"
                    value={form.otherCosts}
                    onChange={(e) =>
                      setForm({ ...form, otherCosts: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Card className="p-4 bg-gray-50 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <p className="text-sm text-gray-700">
                    Mano de obra:{' '}
                    <span className="font-semibold">
                      {formatCurrency(laborCost)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    Total estimado: {formatCurrency(totalCost)}
                  </p>
                </div>
              </Card>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Guardar orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
