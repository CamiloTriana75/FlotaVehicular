import React from 'react';
import Card from '../components/Card';
import {
  AlertTriangle,
  Bell,
  Filter,
  Clock,
  MapPin,
  Shield,
} from 'lucide-react';

const Alerts = () => {
  const alerts = [
    {
      id: 1,
      type: 'critica',
      title: 'Exceso de velocidad',
      desc: 'Vehículo MNO-345 a 85 km/h en zona escolar',
      time: 'hace 5 min',
    },
    {
      id: 2,
      type: 'advertencia',
      title: 'Combustible bajo',
      desc: 'Vehículo JKL-012 con 12%',
      time: 'hace 12 min',
    },
    {
      id: 3,
      type: 'info',
      title: 'Nueva ruta asignada',
      desc: 'Vehículo ABC-123',
      time: 'hace 30 min',
    },
    {
      id: 4,
      type: 'critica',
      title: 'Impacto detectado',
      desc: 'Vehículo DEF-456',
      time: 'hace 1 h',
    },
  ];

  const getColor = (type) => {
    switch (type) {
      case 'critica':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'advertencia':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
            <p className="text-gray-600">Incidentes y eventos de la flota</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Monitoreo activo</span>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option>Todas</option>
              <option>Críticas</option>
              <option>Advertencias</option>
              <option>Info</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Bell className="w-4 h-4" />
            <span>Silenciar 1h</span>
          </button>
        </div>

        <div className="space-y-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-start p-4 rounded-xl border-l-4 ${getColor(a.type)}`}
            >
              <AlertTriangle className="w-5 h-5 mt-0.5 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs mt-1 opacity-80">{a.desc}</p>
                <div className="flex items-center space-x-4 text-xs mt-2 opacity-60">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {a.time}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Bogotá
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Alerts;
