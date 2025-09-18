import React from 'react';
import { mockVehicles, mockDrivers } from '../data/mockVehicles';
import Card from '../components/Card';
import MapViewer from '../components/MapViewer';
import { Truck, Users, MapPin, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const vehiculosActivos = mockVehicles.filter(v => v.status === 'activo').length;
  const vehiculosTotal = mockVehicles.length;
  const conductoresActivos = mockDrivers.filter(d => d.estado === 'activo').length;
  const vehiculosMantenimiento = mockVehicles.filter(v => v.status === 'mantenimiento').length;

  const kpis = [
    {
      title: 'Vehículos Activos',
      value: vehiculosActivos,
      total: vehiculosTotal,
      icon: Truck,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Conductores Activos',
      value: conductoresActivos,
      total: mockDrivers.length,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'En Mantenimiento',
      value: vehiculosMantenimiento,
      total: vehiculosTotal,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Ubicaciones Activas',
      value: vehiculosActivos,
      total: vehiculosTotal,
      icon: MapPin,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const vehiculosRecientes = mockVehicles.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general de la flota</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                  <span className="text-sm font-normal text-gray-500">/{kpi.total}</span>
                </p>
              </div>
              <div className={`p-3 rounded-full ${kpi.color}`}>
                <kpi.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${kpi.color}`}
                style={{ width: `${(kpi.value / kpi.total) * 100}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vehículos Activos</h2>
          <div className="space-y-4">
            {vehiculosRecientes.map((vehiculo) => (
              <div key={vehiculo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{vehiculo.placa}</p>
                  <p className="text-sm text-gray-600">{vehiculo.modelo}</p>
                  <p className="text-sm text-gray-500">Conductor: {vehiculo.conductor}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    vehiculo.status === 'activo' ? 'bg-green-100 text-green-800' :
                    vehiculo.status === 'estacionado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehiculo.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{vehiculo.speed} km/h</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Alertas y Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Combustible bajo</p>
                <p className="text-xs text-red-600">Vehículo JKL-012 - 15% restante</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-800">Mantenimiento programado</p>
                <p className="text-xs text-orange-600">Vehículo ABC-123 - Próxima semana</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <MapPin className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Nueva ubicación</p>
                <p className="text-xs text-blue-600">Vehículo GHI-789 - Centro de la ciudad</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vista General de Flota</h2>
          <div className="h-64">
            <MapViewer 
              vehicles={mockVehicles}
              center={[4.7110, -74.0721]}
              zoom={11}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;