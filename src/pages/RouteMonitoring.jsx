import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Navigation,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  getActiveRoutesMonitoring,
  getWaypointCheckins,
} from '../services/routeService';
import { locationService } from '../services/locationService';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

const metersToKm = (m) => `${(m / 1000).toFixed(2)} km`;
const secondsToHhmm = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export default function RouteMonitoring() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const vehicleMarkersRef = useRef({});

  const [activeRoutes, setActiveRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleLocations, setVehicleLocations] = useState({});

  // Cargar rutas activas
  const loadActiveRoutes = async () => {
    const { data, error } = await getActiveRoutesMonitoring();
    if (!error && data) {
      setActiveRoutes(data);
      if (!selectedRoute && data.length > 0) {
        setSelectedRoute(data[0]);
      }
    }
  };

  useEffect(() => {
    loadActiveRoutes();
    const interval = setInterval(loadActiveRoutes, 10000); // Refrescar cada 10s
    return () => clearInterval(interval);
  }, []);

  // Cargar check-ins cuando se selecciona una ruta
  useEffect(() => {
    if (!selectedRoute) return;
    const load = async () => {
      const { data } = await getWaypointCheckins(selectedRoute.assignment_id);
      if (data) setCheckins(data);
    };
    load();
  }, [selectedRoute]);

  // Inicializar mapa
  useEffect(() => {
    if (!MAPBOX_TOKEN || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-74.0817, 4.6097],
      zoom: 12,
    });

    map.current.on('load', () => {
      setLoading(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Actualizar ubicaciones de vehículos en tiempo real
  useEffect(() => {
    if (!map.current) return;

    const fetchLocations = async () => {
      const { data } = await locationService.getLatestLocations();
      if (data) {
        const locMap = {};
        data.forEach((loc) => {
          locMap[loc.vehicle_id || loc.placa] = loc;
        });
        setVehicleLocations(locMap);

        // Actualizar marcadores en el mapa
        data.forEach((loc) => {
          const id = loc.vehicle_id || loc.placa;
          if (!vehicleMarkersRef.current[id]) {
            const el = document.createElement('div');
            el.style.cssText =
              'width:14px;height:14px;background:#10b981;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)';
            vehicleMarkersRef.current[id] = new mapboxgl.Marker(el)
              .setLngLat([loc.longitude, loc.latitude])
              .addTo(map.current);
          } else {
            vehicleMarkersRef.current[id].setLngLat([
              loc.longitude,
              loc.latitude,
            ]);
          }
        });
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000); // Cada 5s
    return () => clearInterval(interval);
  }, [loading]);

  // Dibujar ruta seleccionada en el mapa
  useEffect(() => {
    if (!map.current || !selectedRoute || loading) return;

    // Limpiar capa anterior
    if (map.current.getSource('selected-route')) {
      map.current.removeLayer('selected-route-line');
      map.current.removeLayer('selected-wps-c');
      map.current.removeLayer('selected-wps-l');
      map.current.removeSource('selected-route');
      map.current.removeSource('selected-wps');
    }

    // Agregar ruta
    map.current.addSource('selected-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: selectedRoute.geometry || {
          type: 'LineString',
          coordinates: [],
        },
      },
    });
    map.current.addLayer({
      id: 'selected-route-line',
      type: 'line',
      source: 'selected-route',
      paint: { 'line-color': '#f59e0b', 'line-width': 5, 'line-opacity': 0.8 },
    });

    // Agregar waypoints
    const wpFeatures = (selectedRoute.waypoints || []).map((wp) => {
      const wpNum = wp.number || wp.order + 1 || 1;
      const completed = checkins.some((c) => c.waypoint_number === wpNum);
      return {
        type: 'Feature',
        properties: { number: wpNum, completed },
        geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
      };
    });

    map.current.addSource('selected-wps', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: wpFeatures },
    });
    map.current.addLayer({
      id: 'selected-wps-c',
      type: 'circle',
      source: 'selected-wps',
      paint: {
        'circle-color': ['case', ['get', 'completed'], '#22c55e', '#f59e0b'],
        'circle-radius': 10,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });
    map.current.addLayer({
      id: 'selected-wps-l',
      type: 'symbol',
      source: 'selected-wps',
      layout: {
        'text-field': ['to-string', ['get', 'number']],
        'text-size': 11,
      },
      paint: { 'text-color': '#fff' },
    });

    // Fit bounds
    const coords = selectedRoute.geometry?.coordinates;
    if (coords && coords.length > 0) {
      const bounds = coords.reduce(
        (acc, c) => acc.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.current.fitBounds(bounds, { padding: 80 });
    }
  }, [selectedRoute, loading, checkins]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_progress':
        return 'En progreso';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  return (
    <div className="h-screen flex">
      {/* Panel lateral */}
      <div className="w-96 bg-white border-r flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-blue-600 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6" />
            Monitoreo de Rutas
          </h1>
          <p className="text-sm text-blue-100 mt-1">
            {activeRoutes.length}{' '}
            {activeRoutes.length === 1 ? 'ruta activa' : 'rutas activas'}
          </p>
        </div>

        {/* Lista de rutas */}
        <div className="flex-1 overflow-y-auto">
          {activeRoutes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay rutas activas en este momento</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {activeRoutes.map((route) => {
                const progress =
                  route.total_waypoints > 0
                    ? (
                        (route.completed_waypoints / route.total_waypoints) *
                        100
                      ).toFixed(0)
                    : 0;

                return (
                  <div
                    key={route.assignment_id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRoute?.assignment_id === route.assignment_id
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {route.route_name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {route.driver_name}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(route.status)}`}
                      >
                        {getStatusLabel(route.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.completed_waypoints}/{route.total_waypoints}
                      </span>
                      <span>{route.vehicle_plate}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {progress}% completado
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel de detalles de ruta seleccionada */}
        {selectedRoute && (
          <div className="border-t p-4 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Detalles
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Distancia:</span>
                <span className="font-medium">
                  {metersToKm(selectedRoute.total_distance || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración est.:</span>
                <span className="font-medium">
                  {secondsToHhmm(selectedRoute.total_duration || 0)}
                </span>
              </div>
              {selectedRoute.last_checkin_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Último check-in:</span>
                  <span className="font-medium text-xs">
                    {new Date(selectedRoute.last_checkin_at).toLocaleTimeString(
                      'es-CO'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
