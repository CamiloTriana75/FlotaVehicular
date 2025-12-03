import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Table from '../components/Table';
import { Search, Eye, Truck, Plus, AlertCircle } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';

const VehiclesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar vehículos de la BD
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await vehicleService.getAll();

      if (fetchError) {
        console.error('Error al cargar vehículos:', fetchError);
        setError(fetchError.message || 'Error al cargar vehículos');
        setVehicles([]);
        return;
      }

      setVehicles(data || []);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError(err.message || 'Error inesperado al cargar vehículos');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(
        (vehicle) =>
          vehicle.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((vehicle) =>
        statusFilter === 'all' ? true : vehicle.status === statusFilter
      );
  }, [vehicles, searchTerm, statusFilter]);

  const columns = [
    {
      header: 'Placa',
      accessor: 'placa',
      cell: (value) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      header: 'Marca',
      accessor: 'marca',
    },
    {
      header: 'Modelo',
      accessor: 'modelo',
    },
    {
      header: 'Año',
      accessor: 'año',
    },
    {
      header: 'Color',
      accessor: 'color',
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
                ? 'bg-blue-100 text-blue-800'
                : value === 'mantenimiento'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value === 'activo'
            ? 'Activo'
            : value === 'estacionado'
              ? 'Estacionado'
              : value === 'mantenimiento'
                ? 'Mantenimiento'
                : value === 'inactivo'
                  ? 'Inactivo'
                  : value}
        </span>
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
          <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">
              Error al cargar vehículos
            </p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={loadVehicles}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por placa, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="estacionado">Estacionado</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/vehiculos/nuevo')}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Vehículo
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Cargando vehículos...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredVehicles}
            emptyMessage="No se encontraron vehículos"
          />
        )}
      </Card>
    </div>
  );
};

export default VehiclesList;
