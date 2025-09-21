import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVehicles } from '../data/mockVehicles';
import Card from '../components/Card';
import Table from '../components/Table';
import { Search, Eye, Truck } from 'lucide-react';

const VehiclesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredVehicles = mockVehicles.filter(
    (vehicle) =>
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.conductor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Placa',
      accessor: 'placa',
      cell: (value) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      header: 'Modelo',
      accessor: 'modelo',
    },
    {
      header: 'Conductor',
      accessor: 'conductor',
    },
    {
      header: 'Estado',
      accessor: 'status',
      cell: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === 'activo'
              ? 'bg-green-100 text-green-800'
              : value === 'estacionado'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: 'Velocidad',
      accessor: 'speed',
      cell: (value) => `${value} km/h`,
    },
    {
      header: 'Combustible',
      accessor: 'combustible',
      cell: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className={`h-2 rounded-full ${
                value > 50
                  ? 'bg-green-500'
                  : value > 20
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm">{value}%</span>
        </div>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value) => (
        <button
          onClick={() => navigate(`/vehiculos/${value}`)}
          className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Truck className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
            <p className="text-gray-600">Gestión de la flota vehicular</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de vehículos</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockVehicles.length}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por placa, modelo o conductor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredVehicles}
          emptyMessage="No se encontraron vehículos"
        />
      </Card>
    </div>
  );
};

export default VehiclesList;
