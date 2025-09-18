import React, { useState } from 'react';
import { mockDrivers } from '../data/mockVehicles';
import Card from '../components/Card';
import Table from '../components/Table';
import { Search, Users, Phone, Mail, Calendar } from 'lucide-react';

const DriversList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = mockDrivers.filter(driver =>
    driver.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.cedula.includes(searchTerm) ||
    driver.vehiculoAsignado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      cell: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">CC: {row.cedula}</p>
        </div>
      )
    },
    {
      header: 'Contacto',
      accessor: 'telefono',
      cell: (value, row) => (
        <div>
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1" />
            {value}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {row.email}
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'activo' ? 'bg-green-100 text-green-800' :
          value === 'disponible' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Vehículo Asignado',
      accessor: 'vehiculoAsignado',
      cell: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      header: 'Licencia',
      accessor: 'licenciaVencimiento',
      cell: (value) => {
        const fecha = new Date(value);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
        const proximoVencimiento = diasRestantes <= 30;
        
        return (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span className={`text-sm ${proximoVencimiento ? 'text-red-600' : ''}`}>
              {fecha.toLocaleDateString('es-CO')}
            </span>
            {proximoVencimiento && (
              <span className="ml-1 text-xs text-red-500">(!)</span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
            <p className="text-gray-600">Gestión del personal conductor</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de conductores</p>
          <p className="text-2xl font-bold text-blue-600">{mockDrivers.length}</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Conductores Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {mockDrivers.filter(d => d.estado === 'activo').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockDrivers.filter(d => d.estado === 'disponible').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Licencias por Vencer</p>
              <p className="text-2xl font-bold text-red-600">
                {mockDrivers.filter(d => {
                  const fecha = new Date(d.licenciaVencimiento);
                  const hoy = new Date();
                  const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
                  return diasRestantes <= 30;
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o vehículo asignado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <Table 
          columns={columns}
          data={filteredDrivers}
          emptyMessage="No se encontraron conductores"
        />
      </Card>
    </div>
  );
};

export default DriversList;