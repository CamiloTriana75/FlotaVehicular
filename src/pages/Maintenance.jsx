import React, { useState } from 'react';
import Card from '../components/Card';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Search,
  Truck,
  Settings,
} from 'lucide-react';

const Maintenance = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const maintenanceTypes = [
    { id: 'all', name: 'Todos', count: 12 },
    { id: 'scheduled', name: 'Programados', count: 5 },
    { id: 'overdue', name: 'Vencidos', count: 2 },
    { id: 'completed', name: 'Completados', count: 5 },
  ];

  const mockMaintenance = [
    {
      id: 1,
      vehicle: 'ABC-123',
      type: 'Mantenimiento Preventivo',
      description: 'Cambio de aceite y filtros',
      scheduledDate: '2024-01-20',
      status: 'scheduled',
      priority: 'medium',
      estimatedCost: 150000,
      assignedTo: 'Juan Pérez',
      odometer: 45000,
    },
    {
      id: 2,
      vehicle: 'DEF-456',
      type: 'Reparación',
      description: 'Revisión de frenos',
      scheduledDate: '2024-01-18',
      status: 'overdue',
      priority: 'high',
      estimatedCost: 300000,
      assignedTo: 'María García',
      odometer: 52000,
    },
    {
      id: 3,
      vehicle: 'GHI-789',
      type: 'Inspección',
      description: 'Inspección técnica anual',
      scheduledDate: '2024-01-15',
      status: 'completed',
      priority: 'high',
      estimatedCost: 200000,
      assignedTo: 'Carlos López',
      odometer: 38000,
    },
    {
      id: 4,
      vehicle: 'JKL-012',
      type: 'Mantenimiento Correctivo',
      description: 'Reparación de motor',
      scheduledDate: '2024-01-25',
      status: 'scheduled',
      priority: 'high',
      estimatedCost: 800000,
      assignedTo: 'Ana Martínez',
      odometer: 67000,
    },
    {
      id: 5,
      vehicle: 'MNO-345',
      type: 'Mantenimiento Preventivo',
      description: 'Revisión de neumáticos',
      scheduledDate: '2024-01-22',
      status: 'scheduled',
      priority: 'low',
      estimatedCost: 100000,
      assignedTo: 'Diego Rodríguez',
      odometer: 29000,
    },
  ];

  const kpis = [
    {
      title: 'Mantenimientos Programados',
      value: '5',
      change: '+2',
      changeType: 'positive',
      icon: Calendar,
    },
    {
      title: 'Vencidos',
      value: '2',
      change: '-1',
      changeType: 'positive',
      icon: AlertTriangle,
    },
    {
      title: 'Completados',
      value: '5',
      change: '+3',
      changeType: 'positive',
      icon: CheckCircle,
    },
    {
      title: 'Costo Total',
      value: '$1.5M',
      change: '+12%',
      changeType: 'negative',
      icon: Settings,
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return Clock;
      case 'overdue':
        return AlertTriangle;
      case 'completed':
        return CheckCircle;
      default:
        return Wrench;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaintenance = mockMaintenance.filter((item) => {
    const matchesFilter =
      selectedFilter === 'all' || item.status === selectedFilter;
    const matchesSearch =
      item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-gray-600 mt-1">
            Gestión de mantenimiento preventivo y correctivo
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nuevo Mantenimiento</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-medium ${
                    kpi.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {kpi.change}
                </span>
                <p className="text-xs text-gray-500">vs mes anterior</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtros:
              </span>
            </div>

            <div className="flex space-x-2">
              {maintenanceTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedFilter(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name} ({type.count})
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por vehículo o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
        </div>
      </Card>

      {/* Maintenance List */}
      <div className="space-y-4">
        {filteredMaintenance.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          return (
            <Card
              key={item.id}
              className="p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Truck className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.vehicle}
                    </h3>
                    <p className="text-sm text-gray-600">{item.type}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha Programada</p>
                  <p className="font-medium text-gray-900">
                    {new Date(item.scheduledDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Asignado a</p>
                  <p className="font-medium text-gray-900">{item.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kilometraje</p>
                  <p className="font-medium text-gray-900">
                    {item.odometer.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Costo Estimado</p>
                  <p className="font-medium text-gray-900">
                    ${item.estimatedCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <StatusIcon className="w-4 h-4" />
                  <span>
                    {item.status === 'scheduled' && 'Programado para'}
                    {item.status === 'overdue' && 'Vencido desde'}
                    {item.status === 'completed' && 'Completado el'}
                  </span>
                  <span className="font-medium">
                    {new Date(item.scheduledDate).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Ver Detalles
                  </button>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {item.status === 'completed' ? 'Ver Reporte' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                Programar Mantenimiento
              </p>
              <p className="text-sm text-gray-500">Crear nueva tarea</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                Alertas de Mantenimiento
              </p>
              <p className="text-sm text-gray-500">Configurar notificaciones</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Configuración</p>
              <p className="text-sm text-gray-500">Parámetros del sistema</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Maintenance;
