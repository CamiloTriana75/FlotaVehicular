import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { conductorService } from '../services/conductorService';
import Card from '../components/Card';
import Table from '../components/Table';
import {
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit,
} from 'lucide-react';

const DriversList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar conductores desde la base de datos
  useEffect(() => {
    loadConductores();
  }, []);

  const loadConductores = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await conductorService.getAll();
      if (fetchError) throw fetchError;
      setConductores(data || []);
    } catch (err) {
      console.error('Error cargando conductores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = conductores.filter(
    (driver) =>
      driver.nombre_completo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      driver.cedula?.includes(searchTerm) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre_completo',
      cell: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">CC: {row.cedula}</p>
        </div>
      ),
    },
    {
      header: 'Contacto',
      accessor: 'telefono',
      cell: (value, row) => (
        <div>
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1" />
            {value || 'N/A'}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {row.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === 'activo'
              ? 'bg-green-100 text-green-800'
              : value === 'disponible'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: 'Vehículo Asignado',
      accessor: 'vehiculoAsignado',
      cell: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      header: 'Licencia',
      accessor: 'fecha_venc_licencia',
      cell: (value) => {
        if (!value) return <span className="text-gray-400">N/A</span>;

        const fecha = new Date(value);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
        const proximoVencimiento = diasRestantes >= 0 && diasRestantes <= 30;
        const vencida = diasRestantes < 0;

        return (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span
              className={`text-sm ${
                vencida
                  ? 'text-red-700 font-semibold'
                  : proximoVencimiento
                    ? 'text-yellow-700 font-semibold'
                    : ''
              }`}
            >
              {fecha.toLocaleDateString('es-CO')}
            </span>
            {vencida && (
              <span className="ml-1 text-xs text-red-600 font-bold">
                (¡Vencida!)
              </span>
            )}
            {proximoVencimiento && !vencida && (
              <span className="ml-1 text-xs text-yellow-600 font-bold">
                ({diasRestantes}d)
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Acciones',
      accessor: 'id_conductor',
      cell: (value) => (
        <Link
          to={`/conductores/${value}`}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Link>
      ),
    },
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
        <div className="flex items-center gap-4">
          <button
            onClick={loadConductores}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <Link
            to="/conductores/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Conductor
          </Link>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total de conductores</p>
            <p className="text-2xl font-bold text-blue-600">
              {conductores.length}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar conductores
            </h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadConductores}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

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
                {
                  conductores.filter(
                    (d) => d.estado === 'activo' || d.estado === 'en_servicio'
                  ).length
                }
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
                {conductores.filter((d) => d.estado === 'disponible').length}
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
                {
                  conductores.filter((d) => {
                    if (!d.fecha_venc_licencia) return false;
                    const fecha = new Date(d.fecha_venc_licencia);
                    const hoy = new Date();
                    const diasRestantes = Math.ceil(
                      (fecha - hoy) / (1000 * 60 * 60 * 24)
                    );
                    return diasRestantes >= 0 && diasRestantes <= 30;
                  }).length
                }
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
