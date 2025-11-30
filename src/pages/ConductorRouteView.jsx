import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ArrowLeft,
  Loader,
  MapPin,
  CheckCircle2,
  Navigation2,
  Navigation,
  ChevronDown,
  ChevronUp,
  Locate,
  Phone,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  getRouteAssignments,
  createWaypointCheckin,
  createRouteEvent,
  getWaypointCheckins,
  getRouteProgress,
  insertRouteTrackingPoint,
  // updateRouteAssignmentStatus, // opcional: habilitar si se desea cambiar estado
} from '../services/routeService';
import { locationService } from '../services/locationService';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

const GEOFENCE_RADIUS = 40; // metros - radio para considerar llegada a waypoint

// Calcula distancia entre dos puntos en metros (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

export default function ConductorRouteView() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const { state } = useLocation();
  const preloaded = state?.assignment || null;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const vehicleMarkerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(preloaded);
  const [checkins, setCheckins] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [nextWaypoint, setNextWaypoint] = useState(null);
  const [distanceToNext, setDistanceToNext] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [lastSpokenWp, setLastSpokenWp] = useState(null);
  const [turnSteps, setTurnSteps] = useState([]);
  const [directionsMeta, setDirectionsMeta] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const lastCoordsRef = useRef(null);
  const sendIntervalRef = useRef(null);
  const lastSentTsRef = useRef(0);
  const [stats, setStats] = useState({
    speed: 0,
    heading: 0,
    accuracy: 0,
    pointsSent: 0,
    errors: 0,
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSimulation, setIsSimulation] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(20);
  const simHeadingRef = useRef(45);
  const simWaypointIndexRef = useRef(0);
  const simProgressRef = useRef(0);

  // Estados para UI móvil mejorada
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Helpers
  const formatDistance = (m) =>
    m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(2)} km`;
  const formatDuration = (sec) =>
    sec < 60 ? `${sec.toFixed(0)} s` : `${Math.round(sec / 60)} min`;

  const checkedWaypointsRef = useRef(new Set());

  // Función de geofencing compartida (GPS real y simulación)
  const checkGeofence = async (coords) => {
    if (!assignment) return;

    const waypoints = assignment.route?.waypoints || [];

    // Encontrar siguiente waypoint pendiente
    let next = null;
    for (const wp of waypoints) {
      const wpNum = wp.number || wp.order + 1 || 1;
      if (!checkedWaypointsRef.current.has(wpNum)) {
        next = { ...wp, number: wpNum };
        break;
      }
    }

    if (next) {
      setNextWaypoint(next);
      const dist = calculateDistance(
        coords.latitude,
        coords.longitude,
        next.lat,
        next.lng
      );
      setDistanceToNext(dist);

      // Check-in automático si está dentro del geofence
      if (
        dist <= GEOFENCE_RADIUS &&
        !checkedWaypointsRef.current.has(next.number)
      ) {
        console.log(`✅ Llegaste al waypoint ${next.number}`);
        checkedWaypointsRef.current.add(next.number);

        // Registrar check-in
        await createWaypointCheckin({
          assignmentId: assignment.id,
          waypointNumber: next.number,
          latitude: coords.latitude,
          longitude: coords.longitude,
          notes: `Auto check-in (${dist.toFixed(0)}m)`,
        });

        // Registrar evento
        await createRouteEvent({
          assignmentId: assignment.id,
          eventType: 'waypoint_reached',
          eventData: { waypoint_number: next.number, distance: dist },
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        // Recargar progreso
        const { data: progressData } = await getRouteProgress(assignment.id);
        if (progressData) setProgress(progressData);

        // Actualizar waypoints en el mapa
        if (map.current && map.current.getSource('wps')) {
          const wpFeatures = waypoints.map((wp) => {
            const wpNum = wp.number || wp.order + 1 || 1;
            return {
              type: 'Feature',
              properties: {
                number: wpNum,
                completed: checkedWaypointsRef.current.has(wpNum),
              },
              geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
            };
          });
          map.current
            .getSource('wps')
            .setData({ type: 'FeatureCollection', features: wpFeatures });
        }
      }
    } else {
      setNextWaypoint(null);
      setDistanceToNext(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!assignment) {
        const { data, error } = await getRouteAssignments({});
        if (!error) {
          const found = (data || []).find(
            (a) => a.id === parseInt(assignmentId)
          );
          setAssignment(found || null);
        }
      }
      // Cargar check-ins existentes
      if (assignmentId) {
        const { data: checkinsData } = await getWaypointCheckins(
          parseInt(assignmentId)
        );
        if (checkinsData) {
          setCheckins(checkinsData);
          checkinsData.forEach((c) =>
            checkedWaypointsRef.current.add(c.waypoint_number)
          );
        }
        // Cargar progreso
        const { data: progressData } = await getRouteProgress(
          parseInt(assignmentId)
        );
        if (progressData) {
          setProgress(progressData);
        }
      }
    };
    load();
  }, [assignmentId]);

  useEffect(() => {
    if (!assignment || !assignment.route || !MAPBOX_TOKEN) return;
    if (map.current) return; // init once

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-74.0817, 4.6097],
        zoom: 12,
      });

      map.current.on('load', () => {
        // Ruta
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: assignment.route.geometry || {
              type: 'LineString',
              coordinates: [],
            },
          },
        });
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#22c55e', 'line-width': 5 },
        });

        // Waypoints
        const wpFeatures = (assignment.route.waypoints || []).map((wp) => ({
          type: 'Feature',
          properties: { number: wp.number || wp.order + 1 || 1 },
          geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
        }));
        map.current.addSource('wps', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: wpFeatures },
        });
        map.current.addLayer({
          id: 'wps-c',
          type: 'circle',
          source: 'wps',
          paint: {
            'circle-color': [
              'case',
              ['get', 'completed'],
              '#22c55e', // verde si está completado
              '#2563eb', // azul si está pendiente
            ],
            'circle-radius': 12,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });
        map.current.addLayer({
          id: 'wps-l',
          type: 'symbol',
          source: 'wps',
          layout: {
            'text-field': ['to-string', ['get', 'number']],
            'text-size': 12,
          },
          paint: { 'text-color': '#fff' },
        });

        // Fit bounds to route
        const coords = assignment.route.geometry?.coordinates;
        if (coords && coords.length > 0) {
          const b = coords.reduce(
            (acc, c) => acc.extend(c),
            new mapboxgl.LngLatBounds(coords[0], coords[0])
          );
          map.current.fitBounds(b, { padding: 60 });
        }

        setLoading(false);
      });
    } catch (e) {
      console.error('Error iniciando mapa:', e);
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [assignment]);

  // Obtener instrucciones giro a giro desde Mapbox Directions (español)
  useEffect(() => {
    const wps = assignment?.route?.waypoints || [];
    if (!MAPBOX_TOKEN || !assignment || !wps || wps.length < 2) {
      setTurnSteps([]);
      setDirectionsMeta(null);
      return;
    }

    const controller = new AbortController();
    const fetchDirections = async () => {
      try {
        const coords = wps.map((w) => `${w.lng},${w.lat}`).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?alternatives=false&geometries=geojson&steps=true&overview=full&language=es&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const route = json?.routes?.[0];
        if (!route) throw new Error('Ruta no encontrada');
        const steps = [];
        (route.legs || []).forEach((leg, legIdx) => {
          (leg.steps || []).forEach((st, stepIdx) => {
            steps.push({
              key: `${legIdx}-${stepIdx}`,
              instruction: st.maneuver?.instruction || 'Sigue recto',
              distance: st.distance || 0,
              duration: st.duration || 0,
            });
          });
        });
        setTurnSteps(steps);
        setDirectionsMeta({
          distance: route.distance,
          duration: route.duration,
        });
      } catch (e) {
        console.warn(
          'No se pudieron cargar instrucciones de Mapbox:',
          e?.message || e
        );
        setTurnSteps([]);
        setDirectionsMeta(null);
      }
    };

    fetchDirections();
    return () => controller.abort();
  }, [assignment]);

  // Construir pasos sencillos entre waypoints con distancia y ETA estimada
  const routeSteps = useMemo(() => {
    const wps = assignment?.route?.waypoints || [];
    if (!wps || wps.length === 0) return [];
    const legs = [];
    const assumedKmh = 30; // velocidad urbana estimada
    const assumedMs = (assumedKmh * 1000) / 3600;
    for (let i = 0; i < wps.length; i++) {
      if (i === 0) continue;
      const from = wps[i - 1];
      const to = wps[i];
      const d = calculateDistance(from.lat, from.lng, to.lat, to.lng);
      const etaSec = d / assumedMs;
      legs.push({
        index: i + 1,
        from,
        to,
        distance: d,
        etaSec,
        text: `Conduce al Punto #${to.number || to.order + 1 || i + 1}`,
      });
    }
    return legs;
  }, [assignment]);

  // URLs externas para abrir navegación
  const externalNav = useMemo(() => {
    const wps = assignment?.route?.waypoints || [];
    if (!wps || wps.length === 0) return { gmaps: '#', waze: '#' };
    const origin = currentPosition
      ? `${currentPosition.latitude},${currentPosition.longitude}`
      : `${wps[0].lat},${wps[0].lng}`;
    const destination = `${wps[wps.length - 1].lat},${wps[wps.length - 1].lng}`;
    const waypoints =
      wps.length > 2
        ? wps
            .slice(1, -1)
            .map((w) => `${w.lat},${w.lng}`)
            .join('|')
        : '';
    const gmaps = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(
      destination
    )}&travelmode=driving${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}`;
    // Waze no soporta múltiples paradas en URL pública: usamos destino final
    const waze = `https://waze.com/ul?ll=${destination}&navigate=yes&zoom=17`;
    return { gmaps, waze };
  }, [assignment, currentPosition]);

  // Mostrar ubicación actual del dispositivo en el mapa + geofencing
  useEffect(() => {
    if (!map.current || !assignment) return;

    const watchId = locationService.watchPosition(
      (coords) => {
        if (!coords) return;
        setCurrentPosition(coords);
        checkGeofence(coords);

        // Actualizar métricas locales
        setStats((prev) => ({
          ...prev,
          speed: Math.round(coords.speed || 0),
          heading: Math.round(coords.heading || 0),
          accuracy: Math.round(coords.accuracy || 0),
        }));

        // Guardar última coordenada para bucle de envío
        lastCoordsRef.current = coords;

        // Voice guidance básico: anunciar siguiente punto al acercarse
        if (voiceEnabled && nextWaypoint && distanceToNext !== null) {
          const shouldAnnounce =
            nextWaypoint.number !== lastSpokenWp && distanceToNext <= 200;
          if (shouldAnnounce) {
            try {
              const phrase = `Siguiente punto número ${nextWaypoint.number} a ${
                distanceToNext < 1000
                  ? `${Math.max(1, distanceToNext.toFixed(0))} metros`
                  : `${(distanceToNext / 1000).toFixed(1)} kilómetros`
              }`;
              const u = new SpeechSynthesisUtterance(phrase);
              u.lang = 'es-ES';
              window.speechSynthesis?.speak(u);
              setLastSpokenWp(nextWaypoint.number);
            } catch (e) {
              // silenciar errores de síntesis
            }
          }
        }

        const el = document.createElement('div');
        el.style.cssText =
          'width:16px;height:16px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)';
        if (!vehicleMarkerRef.current) {
          vehicleMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([coords.longitude, coords.latitude])
            .addTo(map.current);
        } else {
          vehicleMarkerRef.current.setLngLat([
            coords.longitude,
            coords.latitude,
          ]);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 1000 }
    );

    return () => locationService.clearWatch(watchId);
  }, [loading, assignment]);

  // Envío continuo cada 1s con soporte de simulación (portado del Tracker)
  useEffect(() => {
    if (!trackingEnabled || !assignment?.vehicle) {
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
        sendIntervalRef.current = null;
      }
      return;
    }

    sendIntervalRef.current = setInterval(async () => {
      let coords = lastCoordsRef.current || currentPosition;
      if (isSimulation) {
        // Obtener waypoints de la ruta
        const waypoints = assignment?.route?.waypoints || [];

        if (waypoints.length >= 2) {
          // Determinar waypoint actual y siguiente
          const currentWpIndex = simWaypointIndexRef.current;
          const nextWpIndex = Math.min(
            currentWpIndex + 1,
            waypoints.length - 1
          );

          const start = waypoints[currentWpIndex];
          const end = waypoints[nextWpIndex];

          // Calcular distancia total entre waypoints
          const totalDistance = calculateDistance(
            start.lat,
            start.lng,
            end.lat,
            end.lng
          );

          // Velocidad simulada en metros por segundo
          const metersPerSec = simulatedSpeed / 3.6;

          // Incrementar progreso basado en velocidad (1 segundo de intervalo)
          simProgressRef.current += metersPerSec / totalDistance;

          // Si llegamos al siguiente waypoint, avanzar
          if (simProgressRef.current >= 1.0) {
            if (nextWpIndex < waypoints.length - 1) {
              simWaypointIndexRef.current = nextWpIndex;
              simProgressRef.current = 0;
            } else {
              // Llegamos al final, detener simulación
              simProgressRef.current = 1.0;
            }
          }

          // Interpolar posición entre waypoints usando progreso
          const progress = Math.min(simProgressRef.current, 1.0);
          const lat = start.lat + (end.lat - start.lat) * progress;
          const lng = start.lng + (end.lng - start.lng) * progress;

          // Calcular heading hacia el siguiente waypoint
          const latDiff = end.lat - start.lat;
          const lngDiff = end.lng - start.lng;
          const heading = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
          simHeadingRef.current = heading;

          coords = {
            latitude: lat,
            longitude: lng,
            accuracy: 5,
            altitude: null,
            heading: heading,
            speed: simulatedSpeed,
            timestamp: new Date().toISOString(),
          };
        } else {
          // Fallback: movimiento en línea recta si no hay waypoints
          const base = coords || {
            latitude: 4.711,
            longitude: -74.072,
            accuracy: 10,
            altitude: null,
            heading: simHeadingRef.current,
            speed: simulatedSpeed,
            timestamp: new Date().toISOString(),
          };
          const metersPerSec = simulatedSpeed / 3.6;
          const headingRad = (simHeadingRef.current * Math.PI) / 180;
          const dNorth = metersPerSec * Math.cos(headingRad);
          const dEast = metersPerSec * Math.sin(headingRad);
          const latRad = (base.latitude * Math.PI) / 180;
          coords = {
            latitude: base.latitude + dNorth / 111111,
            longitude: base.longitude + dEast / (111111 * Math.cos(latRad)),
            accuracy: 5,
            altitude: base.altitude,
            heading: simHeadingRef.current,
            speed: simulatedSpeed,
            timestamp: new Date().toISOString(),
          };
        }

        lastCoordsRef.current = coords;
        setCurrentPosition(coords);
        setStats((prev) => ({
          ...prev,
          speed: Math.round(coords.speed || 0),
          heading: Math.round(coords.heading || 0),
          accuracy: Math.round(coords.accuracy || 0),
        }));

        // Ejecutar geofencing con coordenadas simuladas
        await checkGeofence(coords);

        // Actualizar marcador del vehículo en el mapa con posición simulada
        if (map.current && vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLngLat([
            coords.longitude,
            coords.latitude,
          ]);
        } else if (map.current && !vehicleMarkerRef.current) {
          const el = document.createElement('div');
          el.style.cssText =
            'width:16px;height:16px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)';
          vehicleMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([coords.longitude, coords.latitude])
            .addTo(map.current);
        }
      }

      if (!coords) return;

      try {
        // 1. Guardar en vehicle_locations (sistema general de tracking)
        const vehicleIdentifier =
          assignment.vehicle.placa || assignment.vehicle.id;
        const speedToSend = isSimulation ? simulatedSpeed : coords.speed || 0;
        const res = await locationService.insertLocation({
          vehicle_id: vehicleIdentifier,
          latitude: coords.latitude,
          longitude: coords.longitude,
          speed: speedToSend,
          heading: coords.heading || 0,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
        });
        if (res?.error) throw res.error;

        // 2. Guardar en route_tracking (específico para esta asignación de ruta)
        const trackingRes = await insertRouteTrackingPoint({
          assignmentId: assignment.id,
          vehicleId: assignment.vehicle.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
          speed: speedToSend,
          heading: coords.heading || 0,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
        });
        if (trackingRes?.error) {
          console.warn(
            '⚠️ No se pudo guardar punto en route_tracking:',
            trackingRes.error
          );
        }

        setStats((prev) => ({ ...prev, pointsSent: prev.pointsSent + 1 }));
        setLastUpdate(new Date());
      } catch (e) {
        setStats((prev) => ({ ...prev, errors: prev.errors + 1 }));
      }
    }, 1000);

    return () => {
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
        sendIntervalRef.current = null;
      }
    };
  }, [trackingEnabled, isSimulation, simulatedSpeed, assignment]);

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No se encontró la asignación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* Header optimizado para móvil */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg z-30">
        <div className="px-3 py-2.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Volver</span>
          </button>

          <div className="flex-1 mx-3 min-w-0">
            <div className="text-sm font-semibold truncate">
              {assignment.route?.name || 'Mi Ruta'}
            </div>
            <div className="text-xs opacity-90 truncate">
              {assignment.vehicle?.placa || 'Vehículo'} •{' '}
              {assignment.driver?.nombre || 'Conductor'}
            </div>
          </div>

          <button
            onClick={async () => {
              const next = !trackingEnabled;
              setTrackingEnabled(next);
              try {
                await createRouteEvent({
                  assignmentId: assignment.id,
                  eventType: next ? 'tracking_started' : 'tracking_stopped',
                  eventData: null,
                });
              } catch (_) {}
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              trackingEnabled
                ? 'bg-red-500 hover:bg-red-600 shadow-lg'
                : 'bg-green-500 hover:bg-green-600 shadow-lg'
            }`}
          >
            {trackingEnabled ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="hidden sm:inline">Detener</span>
              </>
            ) : (
              <>
                <Locate className="w-4 h-4" />
                <span className="hidden sm:inline">Iniciar</span>
              </>
            )}
          </button>
        </div>

        {/* Barra de progreso compacta */}
        {progress && (
          <div className="px-3 pb-2">
            <div className="flex items-center justify-between text-xs mb-1 opacity-90">
              <span>
                {progress.completed_waypoints}/{progress.total_waypoints} puntos
              </span>
              <span>{progress.progress_percentage?.toFixed(0) || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress.progress_percentage || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mapa con controles flotantes */}
      <div className={`relative flex-1 ${isMapFullscreen ? 'z-20' : 'z-0'}`}>
        <div ref={mapContainer} className="w-full h-full" />

        {/* Controles de mapa flotantes */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={() => {
              if (map.current && currentPosition) {
                map.current.flyTo({
                  center: [currentPosition.longitude, currentPosition.latitude],
                  zoom: 16,
                  duration: 1000,
                });
              }
            }}
            className="bg-white p-2.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="Centrar en mi ubicación"
          >
            <Locate className="w-5 h-5 text-blue-600" />
          </button>

          <button
            onClick={() => setIsMapFullscreen(!isMapFullscreen)}
            className="bg-white p-2.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors sm:hidden"
            title={isMapFullscreen ? 'Minimizar mapa' : 'Expandir mapa'}
          >
            {isMapFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Card de siguiente waypoint - mejorado para móvil */}
        {nextWaypoint && !isMapFullscreen && (
          <div className="absolute top-3 left-3 right-16 sm:right-auto sm:max-w-xs bg-white rounded-xl shadow-xl z-10 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Navigation2 className="w-4 h-4" />
                <span className="font-semibold text-sm">Siguiente Punto</span>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                #{nextWaypoint.number}
              </span>
            </div>

            <div className="p-3 space-y-2">
              {nextWaypoint.name && (
                <div className="font-medium text-gray-900 text-sm">
                  {nextWaypoint.name}
                </div>
              )}
              {nextWaypoint.address && (
                <div className="text-xs text-gray-600 line-clamp-2">
                  {nextWaypoint.address}
                </div>
              )}

              {distanceToNext !== null && (
                <div className="pt-2 border-t border-gray-100">
                  {distanceToNext <= GEOFENCE_RADIUS ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold text-base">¡Has llegado!</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">
                        Distancia
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {distanceToNext < 1000
                          ? `${distanceToNext.toFixed(0)} m`
                          : `${(distanceToNext / 1000).toFixed(1)} km`}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicador de velocidad flotante */}
        {trackingEnabled && currentPosition && !isMapFullscreen && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2 z-10">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.speed}
                </div>
                <div className="text-xs text-gray-500">km/h</div>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div className="text-center">
                <Navigation
                  className="w-5 h-5 text-blue-600 mx-auto"
                  style={{ transform: `rotate(${stats.heading}deg)` }}
                />
                <div className="text-xs text-gray-500">{stats.heading}°</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel inferior tipo bottom sheet para móvil */}
      <div
        className={`bg-white border-t shadow-2xl z-30 transition-all duration-300 ease-out ${
          isMapFullscreen ? 'hidden' : ''
        } ${isBottomSheetExpanded ? 'h-[70vh]' : 'h-auto'}`}
      >
        {/* Handle para arrastrar (visual) */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
            className="w-full flex items-center justify-center py-2 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </button>
        </div>

        {/* Contenido del panel */}
        <div
          className={`px-4 pb-4 ${isBottomSheetExpanded ? 'overflow-y-auto h-[calc(70vh-40px)]' : ''}`}
        >
          {/* Acciones rápidas */}
          <div className="flex gap-2 mb-3">
            <a
              href={externalNav.gmaps}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm shadow-md transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Google Maps
            </a>
            <a
              href={externalNav.waze}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-sm shadow-md transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Waze
            </a>
          </div>

          {/* Sección de instrucciones de voz */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 mb-3 border border-purple-100">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 text-sm">
                  Asistente de voz
                </span>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>
            {voiceEnabled && (
              <div className="mt-2 text-xs text-purple-700 bg-purple-100/50 rounded-lg px-2 py-1.5">
                ✓ Te avisaremos al acercarte a los puntos
              </div>
            )}
          </div>

          {/* Información de ruta */}
          {directionsMeta && (
            <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-around text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Distancia total
                </div>
                <div className="font-bold text-gray-900">
                  {formatDistance(directionsMeta.distance)}
                </div>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Tiempo estimado
                </div>
                <div className="font-bold text-gray-900">
                  {formatDuration(directionsMeta.duration)}
                </div>
              </div>
            </div>
          )}

          {/* Sección colapsable de pasos */}
          <div className="mb-3">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Instrucciones de navegación
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {turnSteps.length || routeSteps.length}
                </span>
              </div>
              {showSteps ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showSteps && (
              <div className="mt-2 max-h-64 overflow-auto bg-white rounded-xl border border-gray-200 divide-y">
                {turnSteps.length > 0 ? (
                  turnSteps.map((st, idx) => (
                    <div key={st.key} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {st.instruction}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistance(st.distance)} •{' '}
                            {formatDuration(st.duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : routeSteps.length > 0 ? (
                  routeSteps.map((leg, idx) => (
                    <div key={idx} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {leg.index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {leg.text}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistance(leg.distance)} •{' '}
                            {formatDuration(leg.etaSec)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No hay instrucciones disponibles
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sección colapsable de estadísticas GPS */}
          {currentPosition && (
            <div className="mb-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Locate className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Datos GPS</span>
                  {trackingEnabled && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                      Activo
                    </span>
                  )}
                </div>
                {showStats ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showStats && (
                <div className="mt-2 bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">Latitud</div>
                      <div className="font-mono text-xs text-gray-900">
                        {currentPosition.latitude?.toFixed(6)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">Longitud</div>
                      <div className="font-mono text-xs text-gray-900">
                        {currentPosition.longitude?.toFixed(6)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Precisión
                      </div>
                      <div className="font-mono text-xs text-gray-900">
                        ±{stats.accuracy} m
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Puntos enviados
                      </div>
                      <div className="font-mono text-xs text-gray-900">
                        {stats.pointsSent}
                      </div>
                    </div>
                  </div>

                  {lastUpdate && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Última actualización: {lastUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modo simulación - colapsable */}
          {trackingEnabled && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 overflow-hidden">
              <div className="p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-purple-900">
                      Modo simulación
                    </span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      Pruebas
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSimulation}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSimulation(checked);

                      // Inicializar simulación desde el primer waypoint
                      if (checked && assignment?.route?.waypoints) {
                        const waypoints = assignment.route.waypoints;
                        if (waypoints.length > 0) {
                          const firstWp = waypoints[0];
                          simWaypointIndexRef.current = 0;
                          simProgressRef.current = 0;

                          // Establecer posición inicial en el primer waypoint
                          const initialCoords = {
                            latitude: firstWp.lat,
                            longitude: firstWp.lng,
                            accuracy: 5,
                            altitude: null,
                            heading: 0,
                            speed: 0,
                            timestamp: new Date().toISOString(),
                          };

                          lastCoordsRef.current = initialCoords;
                          setCurrentPosition(initialCoords);

                          console.log(
                            '🎯 Simulación iniciada desde waypoint 1:',
                            firstWp
                          );
                        }
                      }
                    }}
                    className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                </label>

                {isSimulation && (
                  <div className="mt-3 pt-3 border-t border-purple-200 space-y-2">
                    <div className="mb-2 p-2 bg-purple-100 rounded-lg">
                      <div className="text-xs text-purple-700 mb-1">
                        Simulando ruta:
                      </div>
                      <div className="text-sm font-semibold text-purple-900">
                        Waypoint {simWaypointIndexRef.current + 1} →{' '}
                        {Math.min(
                          simWaypointIndexRef.current + 2,
                          assignment?.route?.waypoints?.length || 0
                        )}
                        {simProgressRef.current > 0 && (
                          <span className="ml-2 text-xs text-purple-600">
                            ({Math.round(simProgressRef.current * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-700 font-medium">
                        Velocidad:
                      </span>
                      <span className="text-purple-900 font-bold">
                        {simulatedSpeed} km/h
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={simulatedSpeed}
                      onChange={(e) =>
                        setSimulatedSpeed(parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSimulatedSpeed(0)}
                        className="flex-1 px-2 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-xs font-medium transition-colors"
                      >
                        ⏸ Detenido
                      </button>
                      <button
                        onClick={() => setSimulatedSpeed(60)}
                        className="flex-1 px-2 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-xs font-medium transition-colors"
                      >
                        ✓ Normal
                      </button>
                      <button
                        onClick={() => setSimulatedSpeed(130)}
                        className="flex-1 px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-medium transition-colors"
                      >
                        ⚡ Rápido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Cargando ruta...</p>
          </div>
        </div>
      )}
    </div>
  );
}
