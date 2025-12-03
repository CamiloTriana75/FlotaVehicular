import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Car,
  Filter,
  RefreshCw,
  Users,
  MapPin,
  Clock,
  Activity,
  Maximize2,
} from 'lucide-react';
import { locationService } from '../services/locationService';

// Fix para íconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Íconos personalizados por estado
const vehicleIcons = {
  activo: new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTdIMTdMMTkgMTJWOEg1VjEyTDcgMTdaIiBmaWxsPSIjMTBCOTgxIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iMTciIHI9IjIiIGZpbGw9IiNmZmYiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNyIgcj0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  inactivo: new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTdIMTdMMTkgMTJWOEg1VjEyTDcgMTdaIiBmaWxsPSIjNkI3MjgwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iMTciIHI9IjIiIGZpbGw9IiNmZmYiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNyIgcj0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  mantenimiento: new L.Icon({
    iconUrl:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTdIMTdMMTkgMTJWOEg1VjEyTDcgMTdaIiBmaWxsPSIjRjU5RTBCIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iMTciIHI9IjIiIGZpbGw9IiNmZmYiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNyIgcj0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

// Componente para actualizar vista del mapa
const MapUpdater = ({ vehicles }) => {
  const map = useMap();
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    // Solo centrar automáticamente la primera vez
    if (vehicles.length > 0 && !hasInitialized.current) {
      const group = new L.FeatureGroup(
        vehicles.map((v) => L.marker([v.latitude, v.longitude]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
      hasInitialized.current = true;
    }
  }, [vehicles, map]);

  return null;
};

// Botón para re-centrar el mapa
const RecenterButton = ({ vehicles }) => {
  const map = useMap();

  const handleRecenter = () => {
    if (vehicles.length > 0) {
      const group = new L.FeatureGroup(
        vehicles.map((v) => L.marker([v.latitude, v.longitude]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <button
      onClick={handleRecenter}
      className="leaflet-control absolute top-20 right-2 z-[1000] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
      title="Re-centrar vista en vehículos"
    >
      <Maximize2 className="w-5 h-5 text-gray-700" />
    </button>
  );
};

const RealTimeMonitoring = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    conductor: 'all',
  });

  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    mantenimiento: 0,
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadVehicleLocations();
  }, []);

  // Configurar Realtime subscription
  useEffect(() => {
    const subscription = locationService.subscribeToUpdates((payload) => {
      console.log('Actualización en tiempo real:', payload);
      loadVehicleLocations();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Auto-refresh cada 5 segundos como fallback
  useEffect(() => {
    const interval = setInterval(() => {
      loadVehicleLocations();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadVehicleLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await locationService.getLatestLocations();

      if (err) {
        throw new Error(err.message || 'Error al cargar ubicaciones');
      }

      setVehicles(data || []);
      updateStats(data || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error cargando ubicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (vehicleList) => {
    const stats = vehicleList.reduce(
      (acc, v) => {
        acc.total++;
        if (v.status === 'activo') acc.activos++;
        else if (v.status === 'inactivo') acc.inactivos++;
        else if (v.status === 'mantenimiento') acc.mantenimiento++;
        return acc;
      },
      { total: 0, activos: 0, inactivos: 0, mantenimiento: 0 }
    );

    setStats(stats);
  };

  // Filtrar vehículos
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filters.status !== 'all' && vehicle.status !== filters.status) {
      return false;
    }
    if (
      filters.conductor !== 'all' &&
      !vehicle.conductor.toLowerCase().includes(filters.conductor.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Obtener conductores únicos para filtro
  const uniqueConductors = [
    ...new Set(vehicles.map((v) => v.conductor)),
  ].sort();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Monitoreo en Tiempo Real
              </h1>
              <p className="text-sm text-gray-600">
                Ubicación y estado de vehículos activos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Última actualización: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}

            <button
              onClick={loadVehicleLocations}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 bg-white border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Car className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Activos</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.activos}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactivos}
                </p>
              </div>
              <Car className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Mantenimiento</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.mantenimiento}
                </p>
              </div>
              <Car className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="mantenimiento">En mantenimiento</option>
          </select>

          <select
            value={filters.conductor}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, conductor: e.target.value }))
            }
            className="px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los conductores</option>
            {uniqueConductors.map((conductor) => (
              <option key={conductor} value={conductor}>
                {conductor}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-600">
            Mostrando: {filteredVehicles.length} de {vehicles.length} vehículos
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg px-4 py-2 z-[1000]">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">
                Cargando ubicaciones...
              </span>
            </div>
          </div>
        )}

        {filteredVehicles.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay vehículos para mostrar</p>
              <p className="text-sm text-gray-500 mt-2">
                {vehicles.length === 0
                  ? 'No se encontraron ubicaciones'
                  : 'Los filtros no coinciden con ningún vehículo'}
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[4.6097, -74.0817]} // Bogotá por defecto
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url={
                import.meta.env.VITE_MAPBOX_TOKEN &&
                import.meta.env.VITE_MAPBOX_STYLE_ID
                  ? `https://api.mapbox.com/styles/v1/${import.meta.env.VITE_MAPBOX_STYLE_ID}/tiles/512/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
              attribution={
                import.meta.env.VITE_MAPBOX_TOKEN &&
                import.meta.env.VITE_MAPBOX_STYLE_ID
                  ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }
            />

            <MapUpdater vehicles={filteredVehicles} />
            <RecenterButton vehicles={filteredVehicles} />

            {filteredVehicles.map((vehicle) => (
              <Marker
                key={`${vehicle.vehicle_id}-${vehicle.last_update}`}
                position={[vehicle.latitude, vehicle.longitude]}
                icon={vehicleIcons[vehicle.status] || vehicleIcons.activo}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">
                      {vehicle.placa}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Conductor:</strong> {vehicle.conductor}
                      </div>
                      <div>
                        <strong>Vehículo:</strong> {vehicle.marca}{' '}
                        {vehicle.modelo}
                      </div>
                      <div>
                        <strong>Velocidad:</strong> {Math.round(vehicle.speed)}{' '}
                        km/h
                      </div>
                      <div>
                        <strong>Estado:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            vehicle.status === 'activo'
                              ? 'bg-green-100 text-green-800'
                              : vehicle.status === 'inactivo'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {vehicle.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <strong>Dirección:</strong>{' '}
                        {Math.round(vehicle.heading)}°
                      </div>
                      <div className="text-gray-500">
                        <strong>Última actualización:</strong>
                        <br />
                        {new Date(vehicle.last_update).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
