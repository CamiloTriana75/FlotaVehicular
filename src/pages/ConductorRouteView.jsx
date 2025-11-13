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
} from 'lucide-react';
import {
  getRouteAssignments,
  createWaypointCheckin,
  createRouteEvent,
  getWaypointCheckins,
  getRouteProgress,
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

  // Helpers
  const formatDistance = (m) =>
    m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(2)} km`;
  const formatDuration = (sec) =>
    sec < 60 ? `${sec.toFixed(0)} s` : `${Math.round(sec / 60)} min`;

  const checkedWaypointsRef = useRef(new Set());

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

    const checkGeofence = async (coords) => {
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
          if (map.current.getSource('wps')) {
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

    const watchId = locationService.watchPosition(
      (coords) => {
        if (!coords) return;
        setCurrentPosition(coords);
        checkGeofence(coords);

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

  if (!assignment) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>
        <p>No se encontró la asignación.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header con info de ruta */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>
        <div className="text-sm text-gray-700 font-medium">
          {assignment.route?.name}
        </div>
      </div>

      {/* Panel de progreso flotante */}
      {progress && (
        <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Progreso</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completados:</span>
              <span className="font-medium">
                {progress.completed_waypoints} / {progress.total_waypoints}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress_percentage || 0}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {progress.progress_percentage?.toFixed(0) || 0}% completado
            </div>
          </div>
        </div>
      )}

      {/* Panel de siguiente waypoint */}
      {nextWaypoint && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Navigation2 className="w-5 h-5 text-orange-600" />
            <span className="font-semibold">Siguiente punto</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">
              Punto #{nextWaypoint.number}
            </div>
            {nextWaypoint.name && (
              <div className="text-sm text-gray-600">{nextWaypoint.name}</div>
            )}
            {nextWaypoint.address && (
              <div className="text-xs text-gray-500">
                {nextWaypoint.address}
              </div>
            )}
            {distanceToNext !== null && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-gray-500">Distancia:</div>
                <div className="text-lg font-bold text-blue-600">
                  {distanceToNext < 1000
                    ? `${distanceToNext.toFixed(0)} m`
                    : `${(distanceToNext / 1000).toFixed(2)} km`}
                </div>
                {distanceToNext <= GEOFENCE_RADIUS && (
                  <div className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ¡Llegaste!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mapa */}
      <div ref={mapContainer} className="flex-1" />

      {/* Panel inferior con pasos y acciones de navegación */}
      <div className="bg-white border-t shadow-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Navegación</div>
            <div className="text-base font-semibold text-gray-900">
              {assignment.route?.name || 'Ruta asignada'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
              />
              Instrucciones de voz
            </label>
          </div>
        </div>

        {directionsMeta && (
          <div className="text-xs text-gray-600">
            Distancia total: {formatDistance(directionsMeta.distance)} • Tiempo
            estimado: {formatDuration(directionsMeta.duration)}
          </div>
        )}

        <div className="flex items-center gap-3">
          <a
            href={externalNav.gmaps}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
          >
            Abrir en Google Maps
          </a>
          <a
            href={externalNav.waze}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
          >
            Abrir en Waze
          </a>
        </div>

        {/* Lista de pasos: Mapbox primero; si falla, fallback a waypoints */}
        <div className="max-h-56 overflow-auto divide-y rounded-md border">
          {turnSteps.length > 0 ? (
            turnSteps.map((st) => (
              <div key={st.key} className="p-3">
                <div className="text-sm font-medium text-gray-800">
                  {st.instruction}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistance(st.distance)} • {formatDuration(st.duration)}
                </div>
              </div>
            ))
          ) : routeSteps.length > 0 ? (
            routeSteps.map((leg, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {leg.text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistance(leg.distance)} •{' '}
                    {formatDuration(leg.etaSec)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">#{leg.index}</div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-gray-500">
              No hay pasos disponibles.
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/50">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
