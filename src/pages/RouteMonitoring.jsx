import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  GitCompare,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  getActiveRoutesMonitoring,
  getWaypointCheckins,
} from '../services/routeService';
import { geofenceService } from '../services/geofenceService';
import { supabase } from '../lib/supabaseClient';
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
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const vehicleMarkersRef = useRef({});
  const geofenceRefreshRef = useRef(null);
  const eventsTimerRef = useRef(null);
  const evalDebounceRef = useRef({});
  const vehicleIdCacheRef = useRef(new Map());

  const [activeRoutes, setActiveRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [geofences, setGeofences] = useState([]);
  const [latestEvents, setLatestEvents] = useState([]);

  // Helper: circle (meters) to polygon
  const circleToPolygon = ([lng, lat], radiusM, points = 64) => {
    const coords = [];
    const R = 6371000;
    const angDist = radiusM / R;
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    for (let i = 0; i <= points; i++) {
      const bearing = (i / points) * 2 * Math.PI;
      const sinLat =
        Math.sin(latRad) * Math.cos(angDist) +
        Math.cos(latRad) * Math.sin(angDist) * Math.cos(bearing);
      const dLat = Math.asin(sinLat);
      const dLng =
        lngRad +
        Math.atan2(
          Math.sin(bearing) * Math.sin(angDist) * Math.cos(latRad),
          Math.cos(angDist) - Math.sin(latRad) * Math.sin(dLat)
        );
      coords.push([(dLng * 180) / Math.PI, (dLat * 180) / Math.PI]);
    }
    return { type: 'Polygon', coordinates: [coords] };
  };

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

  // Cargar eventos recientes de geocercas (panel)
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const evs = await geofenceService.listEvents({ limit: 5 });
        setLatestEvents(evs || []);
      } catch (e) {
        // noop
      }
    };
    loadEvents();
    const t = setInterval(loadEvents, 10000);
    eventsTimerRef.current = t;
    return () => clearInterval(t);
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

    map.current.on('load', async () => {
      setLoading(false);
      // Prepare geofence sources/layers
      if (!map.current.getSource('gf-polygons')) {
        map.current.addSource('gf-polygons', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.current.getSource('gf-circles')) {
        map.current.addSource('gf-circles', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.current.getLayer('gf-polygon-fill')) {
        map.current.addLayer({
          id: 'gf-polygon-fill',
          type: 'fill',
          source: 'gf-polygons',
          paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.18 },
        });
      }
      if (!map.current.getLayer('gf-polygon-line')) {
        map.current.addLayer({
          id: 'gf-polygon-line',
          type: 'line',
          source: 'gf-polygons',
          paint: { 'line-color': '#16a34a', 'line-width': 2 },
        });
      }
      if (!map.current.getLayer('gf-circle-fill')) {
        map.current.addLayer({
          id: 'gf-circle-fill',
          type: 'fill',
          source: 'gf-circles',
          paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.16 },
        });
      }
      if (!map.current.getLayer('gf-circle-line')) {
        map.current.addLayer({
          id: 'gf-circle-line',
          type: 'line',
          source: 'gf-circles',
          paint: { 'line-color': '#2563eb', 'line-width': 2 },
        });
      }

      // Initial load
      const loadGf = async () => {
        try {
          const data = await geofenceService.list();
          setGeofences(data);
          const polyFeatures = [];
          const circleFeatures = [];
          data.forEach((gf) => {
            if (!gf.activo) return;
            if (gf.tipo === 'polygon') {
              const geom =
                gf.geometry?.type === 'Feature'
                  ? gf.geometry.geometry
                  : gf.geometry;
              polyFeatures.push({
                type: 'Feature',
                properties: { id: gf.id, nombre: gf.nombre, tipo: 'polygon' },
                geometry: geom,
              });
            } else if (
              gf.tipo === 'circle' &&
              gf.geometry?.type === 'Point' &&
              gf.radio_m
            ) {
              const poly = circleToPolygon(gf.geometry.coordinates, gf.radio_m);
              circleFeatures.push({
                type: 'Feature',
                properties: {
                  id: gf.id,
                  nombre: gf.nombre,
                  tipo: 'circle',
                  radio_m: gf.radio_m,
                },
                geometry: poly,
              });
            }
          });
          const polySrc = map.current.getSource('gf-polygons');
          polySrc.setData({
            type: 'FeatureCollection',
            features: polyFeatures,
          });
          const circSrc = map.current.getSource('gf-circles');
          circSrc.setData({
            type: 'FeatureCollection',
            features: circleFeatures,
          });
        } catch (e) {
          console.warn('No se pudieron cargar geocercas:', e?.message || e);
        }
      };
      await loadGf();
      // periodic refresh
      geofenceRefreshRef.current = setInterval(loadGf, 30000);
    });

    return () => {
      if (map.current) {
        if (geofenceRefreshRef.current)
          clearInterval(geofenceRefreshRef.current);
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

          // Evaluate geofence transitions (debounced per vehicle)
          maybeEvaluateGeofence(loc).catch(() => {});
        });
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000); // Cada 5s
    return () => clearInterval(interval);
  }, [loading]);

  // Resolve numeric vehicle id and invoke geofence evaluator (debounced)
  const maybeEvaluateGeofence = async (loc) => {
    try {
      const now = Date.now();
      const key = String(loc.vehicle_id || loc.placa || 'unknown');
      const last = evalDebounceRef.current[key] || 0;
      if (now - last < 10000) return; // 10s debounce

      // Resolve numeric vehicle id
      let vehicleId = null;
      if (typeof loc.vehicle_id === 'number') {
        vehicleId = loc.vehicle_id;
      } else if (vehicleIdCacheRef.current.has(key)) {
        vehicleId = vehicleIdCacheRef.current.get(key);
      } else if (loc.placa) {
        const { data: v } = await supabase
          .from('vehicles')
          .select('id')
          .eq('placa', String(loc.placa).toUpperCase())
          .single();
        vehicleId = v?.id || null;
        if (vehicleId) vehicleIdCacheRef.current.set(key, vehicleId);
      }

      if (!vehicleId) return;
      if (typeof loc.longitude !== 'number' || typeof loc.latitude !== 'number')
        return;

      await geofenceService.evaluate({
        vehicleId,
        lng: loc.longitude,
        lat: loc.latitude,
      });
      evalDebounceRef.current[key] = now;
    } catch (_) {
      // ignore errors to not break UI
    }
  };

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

            {/* Botón de comparación */}
            <div className="mt-3">
              <button
                onClick={() =>
                  navigate(`/rutas/comparacion/${selectedRoute.assignment_id}`)
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <GitCompare className="w-4 h-4" />
                Comparar Ruta
              </button>
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

        {latestEvents?.length > 0 && (
          <div className="absolute right-4 top-4 bg-white/95 backdrop-blur rounded-lg shadow p-3 w-80 border">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              Entradas/Salidas recientes
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {latestEvents.map((ev) => {
                const vehicleName =
                  ev.vehicle?.placa || `Vehículo #${ev.vehicle_id}`;
                const geofenceName =
                  ev.geofence?.nombre || `Geocerca #${ev.geofence_id}`;
                return (
                  <div
                    key={ev.id}
                    className="text-xs flex items-start justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <div
                        className={`font-semibold ${ev.event_type === 'enter' ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {ev.event_type === 'enter' ? '🟢 Entrada' : '🔴 Salida'}
                      </div>
                      <div className="text-gray-700 font-medium mt-0.5">
                        {vehicleName}
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        {geofenceName}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                      {new Date(ev.occurred_at).toLocaleTimeString('es-CO')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
