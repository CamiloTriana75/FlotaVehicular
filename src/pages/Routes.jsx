import React, { useState } from 'react';
import Card from '../components/Card';
import {
  Route as RouteIcon,
  MapPin,
  Clock,
  TrendingUp,
  Search,
  Plus,
} from 'lucide-react';

const Routes = () => {
  const [search, setSearch] = useState('');
  const routes = [
    {
      id: 1,
      name: 'Ruta Norte',
      vehicle: 'ABC-123',
      stops: 12,
      eta: '3h 20m',
      efficiency: 94,
    },
    {
      id: 2,
      name: 'Ruta Centro',
      vehicle: 'DEF-456',
      stops: 8,
      eta: '1h 50m',
      efficiency: 88,
    },
    {
      id: 3,
      name: 'Ruta Sur',
      vehicle: 'GHI-789',
      stops: 10,
      eta: '2h 15m',
      efficiency: 91,
    },
  ].filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <RouteIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rutas</h1>
            <p className="text-gray-600">Planificación y eficiencia de rutas</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Nueva Ruta</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Eficiencia Promedio</p>
              <p className="text-2xl font-bold text-gray-900">91.3%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">ETA Promedio</p>
              <p className="text-2xl font-bold text-gray-900">2h 28m</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Paradas Totales</p>
              <p className="text-2xl font-bold text-gray-900">30</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar rutas..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {routes.map((r) => (
            <div
              key={r.id}
              className="p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{r.name}</p>
                <p className="text-sm text-gray-600">
                  Vehículo {r.vehicle} · {r.stops} paradas
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">ETA</p>
                <p className="font-medium">{r.eta}</p>
                <div className="mt-1 w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${r.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Routes;
