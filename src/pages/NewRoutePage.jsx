import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  Plus,
  Trash2,
  Navigation,
  Save,
  ArrowLeft,
  Loader,
  CheckCircle,
  AlertCircle,
  Map as MapIcon,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { optimizeRoute, createRoute } from '../services/routeService';
import { locationService } from '../services/locationService';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('❌ VITE_MAPBOX_TOKEN no está configurado en .env');
}

mapboxgl.accessToken = MAPBOX_TOKEN;

const NewRoutePage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Estado del formulario
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [waypoints, setWaypoints] = useState([]);

  // Estado de optimización
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [saving, setSaving] = useState(false);

  // Marcadores en el mapa
  const [markers, setMarkers] = useState([]);
  const [driverMarkers, setDriverMarkers] = useState([]);
  const [driverLocations, setDriverLocations] = useState([]);
  const [lastDriverUpdate, setLastDriverUpdate] = useState(null);
  const markersRef = useRef([]);
  const waypointCounterRef = useRef(1); // Usar ref para contador inmediato
  const [nextWaypointNumber, setNextWaypointNumber] = useState(1); // Solo para UI

  // Inicializar mapa
  useEffect(() => {
    if (map.current) return; // Ya inicializado

    if (!MAPBOX_TOKEN) {
      setMapError('Token de Mapbox no configurado');
      console.error('❌ VITE_MAPBOX_TOKEN no está definido');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-74.0817, 4.6097], // Bogotá por defecto
        zoom: 12,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('✅ Mapa cargado');

        // Agregar capa para la ruta optimizada
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [],
            },
          },
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        // Fuente y capas para waypoints (círculo + número)
        map.current.addSource('waypoints', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        // Círculo de fondo
        map.current.addLayer({
          id: 'waypoints-circle',
          type: 'circle',
          source: 'waypoints',
          paint: {
            'circle-color': '#3b82f6',
            'circle-radius': 14,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
          },
        });

        // Etiqueta con el número
        map.current.addLayer({
          id: 'waypoints-label',
          type: 'symbol',
          source: 'waypoints',
          layout: {
            'text-field': ['to-string', ['get', 'number']],
            'text-size': 12,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          },
          paint: {
            'text-color': '#ffffff',
          },
        });
      });

      map.current.on('error', (e) => {
        console.error('❌ Error en Mapbox:', e);
        setMapError('Error al cargar el mapa');
      });

      // Click en el mapa para agregar waypoint
      map.current.on('click', (e) => {
        addWaypoint({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });
      });
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapError(error.message);
    }

    return () => {
      markers.forEach((marker) => marker.remove());
      driverMarkers.forEach((marker) => marker.remove());
      markersRef.current.forEach((marker) => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Cargar ubicaciones de conductores
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const loadDriverLocations = async () => {
      try {
        const { data, error } = await locationService.getLatestLocations();
        if (error) throw error;

        setDriverLocations(data || []);

        // Limpiar marcadores anteriores de conductores
        driverMarkers.forEach((marker) => marker.remove());

        // Crear nuevos marcadores para conductores
        const newDriverMarkers = (data || []).map((driver) => {
          // Crear elemento HTML para el marcador
          const el = document.createElement('div');
          el.style.cssText = `
            width: 40px;
            height: 40px;
            background-color: ${driver.status === 'activo' ? '#10B981' : '#6B7280'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          `;
          el.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17,8H7L5,12V20H7V18H17V20H19V12L17,8Z M7,16H5V12L6,10H8V16H7Z M11,16H9V10H11V16Z M15,16H13V10H15V16Z M17,16V12L18,10H16V16H17Z"/>
            </svg>
          `;

          // Crear popup con información del conductor
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong>${driver.placa || 'Vehículo'}</strong><br/>
              <small>${driver.conductor_nombre || 'Sin conductor'}</small><br/>
              <small style="color: ${driver.status === 'activo' ? '#10B981' : '#6B7280'}">
                ${driver.status}
              </small>
            </div>
          `);

          // Crear y agregar marcador
          const marker = new mapboxgl.Marker(el)
            .setLngLat([driver.longitude, driver.latitude])
            .setPopup(popup)
            .addTo(map.current);

          return marker;
        });

        setDriverMarkers(newDriverMarkers);
        setLastDriverUpdate(new Date());
      } catch (error) {
        console.error('Error cargando ubicaciones:', error);
      }
    };

    loadDriverLocations();

    // Actualizar cada 5 segundos
    const interval = setInterval(loadDriverLocations, 5000);

    return () => clearInterval(interval);
  }, [mapLoaded]);

  // Renderizar capa de waypoints desde estado
  const refreshWaypointsLayer = (featuresList) => {
    if (!map.current || !map.current.getSource('waypoints')) return;
    const list = featuresList || waypoints;
    const fc = {
      type: 'FeatureCollection',
      features: list.map((wp) => ({
        type: 'Feature',
        properties: { number: wp.number, id: wp.id },
        geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
      })),
    };
    map.current.getSource('waypoints').setData(fc);
  };

  // Agregar waypoint (sin DOM markers)
  const addWaypoint = async (coords) => {
    const currentNumber = waypointCounterRef.current;
    const newWaypoint = {
      id: Date.now(),
      name: `Punto ${currentNumber}`,
      address: '',
      lat: coords.lat,
      lng: coords.lng,
      order: currentNumber - 1,
      notes: '',
      number: currentNumber,
    };

    try {
      const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${MAPBOX_TOKEN}`;
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        newWaypoint.address = data.features[0].place_name;
      }
    } catch (err) {
      console.error('Error en geocoding:', err);
    }

    setWaypoints((prev) => {
      const updated = [...prev, newWaypoint];
      refreshWaypointsLayer(updated);
      return updated;
    });

    waypointCounterRef.current = currentNumber + 1;
    setNextWaypointNumber(currentNumber + 1);
  };

  // Eliminar waypoint (actualiza capa)
  const removeWaypoint = (index) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
    refreshWaypointsLayer(newWaypoints);
    setOptimizedRoute(null);
  };

  // Actualizar datos de waypoint
  const updateWaypoint = (index, field, value) => {
    const updated = [...waypoints];
    updated[index][field] = value;
    setWaypoints(updated);
    refreshWaypointsLayer(updated);
  };

  // Centrar vista en todos los conductores
  const centerOnDrivers = () => {
    if (!map.current || driverLocations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    driverLocations.forEach((driver) => {
      bounds.extend([driver.longitude, driver.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
    });
  };

  // Mantener la capa sincronizada cuando cambie el estado o el mapa cargue
  useEffect(() => {
    if (!mapLoaded) return;
    refreshWaypointsLayer();
  }, [mapLoaded, waypoints]);

  // Optimizar ruta
  const handleOptimize = async () => {
    if (waypoints.length < 2) {
      alert('Se requieren al menos 2 waypoints para optimizar');
      return;
    }

    if (waypoints.length > 12) {
      alert('Mapbox soporta máximo 12 waypoints');
      return;
    }

    setOptimizing(true);

    try {
      const coords = waypoints.map((wp) => ({ lng: wp.lng, lat: wp.lat }));

      const { data, error } = await optimizeRoute(coords, {
        roundtrip: false, // No regresar al inicio
        source: 'first',
        destination: 'last',
      });

      if (error) throw error;

      setOptimizedRoute(data);

      // Dibujar ruta en el mapa
      if (data.geometry && map.current.getSource('route')) {
        map.current.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: data.geometry,
        });

        // Ajustar vista del mapa a la ruta
        const coordinates = data.geometry.coordinates;
        const bounds = coordinates.reduce(
          (bounds, coord) => {
            return bounds.extend(coord);
          },
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );

        map.current.fitBounds(bounds, {
          padding: 80,
        });
      }

      console.log('✅ Ruta optimizada:', {
        distance: `${(data.totalDistance / 1000).toFixed(2)} km`,
        duration: `${Math.round(data.totalDuration / 60)} min`,
      });
    } catch (error) {
      console.error('Error optimizando:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  // Guardar ruta
  const handleSave = async () => {
    if (!routeName.trim()) {
      alert('El nombre de la ruta es obligatorio');
      return;
    }

    if (waypoints.length < 2) {
      alert('Se requieren al menos 2 waypoints');
      return;
    }

    if (!optimizedRoute) {
      alert('Debes optimizar la ruta antes de guardar');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await createRoute({
        name: routeName,
        description: routeDescription,
        waypoints: waypoints,
        optimizedOrder: optimizedRoute.optimizedOrder,
        totalDistance: optimizedRoute.totalDistance,
        totalDuration: optimizedRoute.totalDuration,
        geometry: optimizedRoute.geometry,
      });

      if (error) throw error;

      console.log('✅ Ruta guardada:', data);
      alert('Ruta creada exitosamente');
      navigate('/rutas');
    } catch (error) {
      console.error('Error guardando ruta:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/rutas')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="border-l h-8 border-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-blue-600" />
              Nueva Ruta Optimizada
            </h1>
            <p className="text-sm text-gray-600">
              Agrega waypoints y optimiza la ruta automáticamente
            </p>
            {lastDriverUpdate && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Radio className="w-3 h-3 animate-pulse" />
                Tracking en vivo · {driverLocations.length} conductores ·
                Actualización cada 5s
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={centerOnDrivers}
            disabled={driverLocations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Centrar en conductores"
          >
            <MapPin className="w-5 h-5" />
            <span className="hidden sm:inline">Centrar Conductores</span>
            {driverLocations.length > 0 && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {driverLocations.length}
              </span>
            )}
          </button>

          <button
            onClick={handleOptimize}
            disabled={optimizing || waypoints.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {optimizing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Optimizando...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Optimizar Ruta
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !optimizedRoute}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Ruta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de error si falla el mapa */}
      {mapError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">
                Error al cargar el mapa
              </p>
              <p className="text-sm text-red-700">{mapError}</p>
              <p className="text-xs text-red-600 mt-1">
                Verifica que VITE_MAPBOX_TOKEN esté configurado en .env y
                reinicia el servidor
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel lateral - Formulario y waypoints */}
        <div className="w-96 bg-white border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Información de la ruta */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Información de la Ruta
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Ej: Ruta de entregas zona norte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                    placeholder="Descripción opcional de la ruta"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Control del siguiente waypoint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Siguiente Punto
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Número del próximo waypoint:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={nextWaypointNumber}
                      onChange={(e) =>
                        setNextWaypointNumber(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-20 px-3 py-2 border border-blue-300 rounded-lg font-bold text-2xl text-center focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-blue-700">
                        Haz click en el mapa para agregar el{' '}
                        <strong>Punto {nextWaypointNumber}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newNum = Math.max(1, nextWaypointNumber - 1);
                      waypointCounterRef.current = newNum;
                      setNextWaypointNumber(newNum);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => {
                      const newNum = nextWaypointNumber + 1;
                      waypointCounterRef.current = newNum;
                      setNextWaypointNumber(newNum);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  >
                    Siguiente →
                  </button>
                  <button
                    onClick={() => {
                      const newNum = waypoints.length + 1;
                      waypointCounterRef.current = newNum;
                      setNextWaypointNumber(newNum);
                    }}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Auto ({waypoints.length + 1})
                  </button>
                </div>
              </div>
            </div>

            {/* Estadísticas de ruta optimizada */}
            {optimizedRoute && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">
                    Ruta Optimizada
                  </h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Distancia total:</span>
                    <span className="font-semibold text-green-900">
                      {(optimizedRoute.totalDistance / 1000).toFixed(2)} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Tiempo estimado:</span>
                    <span className="font-semibold text-green-900">
                      {Math.round(optimizedRoute.totalDuration / 60)} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Waypoints:</span>
                    <span className="font-semibold text-green-900">
                      {waypoints.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de waypoints */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Puntos de Ruta ({waypoints.length})
                </h3>
                <span className="text-xs text-gray-500">
                  Click en el mapa para agregar
                </span>
              </div>

              {waypoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    Haz click en el mapa para agregar waypoints
                  </p>
                  <p className="text-xs mt-1">Mínimo 2 puntos, máximo 12</p>
                </div>
              ) : (
                <div className="space-y-3 pr-2">
                  {waypoints.map((wp, index) => (
                    <div
                      key={wp.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {wp.number}
                          </div>
                          <input
                            type="text"
                            value={wp.name}
                            onChange={(e) =>
                              updateWaypoint(index, 'name', e.target.value)
                            }
                            className="font-medium text-sm border-0 bg-transparent focus:outline-none focus:ring-0 p-0"
                          />
                        </div>
                        <button
                          onClick={() => removeWaypoint(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {wp.address ||
                          `${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}`}
                      </div>

                      <input
                        type="text"
                        value={wp.notes}
                        onChange={(e) =>
                          updateWaypoint(index, 'notes', e.target.value)
                        }
                        placeholder="Notas (opcional)"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Instrucciones:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Click en el mapa para agregar waypoints</li>
                    <li>Mínimo 2 puntos, máximo 12</li>
                    <li>Click en "Optimizar" para calcular la mejor ruta</li>
                    <li>Guarda la ruta para asignarla a un conductor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
      </div>
    </div>
  );
};

export default NewRoutePage;
