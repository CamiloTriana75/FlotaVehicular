import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft,
  Download,
  Loader,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
} from 'lucide-react';
import {
  getRouteAssignments,
  getRouteTrajectory,
  getRouteStatistics,
} from '../services/routeService';
import { locationService } from '../services/locationService';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

// Calcula distancia entre dos puntos (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcula desviación promedio entre ruta planificada y recorrida
function calculateRouteDeviation(plannedCoords, actualCoords) {
  if (!actualCoords || actualCoords.length === 0)
    return { avgDeviation: 0, maxDeviation: 0 };

  let totalDeviation = 0;
  let maxDeviation = 0;
  let count = 0;

  actualCoords.forEach(([lng, lat]) => {
    let minDist = Infinity;
    plannedCoords.forEach(([pLng, pLat]) => {
      const dist = calculateDistance(lat, lng, pLat, pLng);
      if (dist < minDist) minDist = dist;
    });
    totalDeviation += minDist;
    if (minDist > maxDeviation) maxDeviation = minDist;
    count++;
  });

  return {
    avgDeviation: count > 0 ? totalDeviation / count : 0,
    maxDeviation,
  };
}

// Calcula distancia total de una ruta
function calculateTotalDistance(coords) {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += calculateDistance(
      coords[i - 1][1],
      coords[i - 1][0],
      coords[i][1],
      coords[i][0]
    );
  }
  return total;
}

export default function RouteComparison() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [actualTrack, setActualTrack] = useState([]);
  const [matchedTrack, setMatchedTrack] = useState([]); // Ruta ajustada a calles
  const [metrics, setMetrics] = useState(null);
  const [showPlanned, setShowPlanned] = useState(true);
  const [showActual, setShowActual] = useState(true);

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Cargar asignación
        const { data: assignments } = await getRouteAssignments({});
        const found = assignments?.find((a) => a.id === parseInt(assignmentId));
        if (!found) throw new Error('Asignación no encontrada');
        setAssignment(found);

        // MÉTODO 1 (PREFERIDO): Cargar trayectoria desde route_tracking
        console.log(
          '🔍 Buscando trayectoria en route_tracking para assignment:',
          assignmentId
        );
        let trackingData = null;
        let trackingError = null;

        try {
          const result = await getRouteTrajectory(parseInt(assignmentId));
          trackingData = result.data;
          trackingError = result.error;
        } catch (err) {
          console.warn(
            '⚠️ Función get_route_trajectory no disponible (migración no ejecutada):',
            err.message
          );
          trackingError = err;
        }

        if (trackingData && trackingData.length > 0) {
          console.log(
            `✅ Encontrados ${trackingData.length} puntos en route_tracking`
          );
          const coords = trackingData.map((point) => [
            parseFloat(point.longitude),
            parseFloat(point.latitude),
          ]);
          setActualTrack(coords);
        } else {
          console.log(
            '⚠️ No se encontraron puntos en route_tracking, intentando con vehicle_locations'
          );

          // MÉTODO 2 (FALLBACK): Cargar desde vehicle_locations si no hay datos en route_tracking
          if (found.vehicle_id && found.actual_start) {
            const startDate = new Date(found.actual_start);
            const endDate = found.actual_end
              ? new Date(found.actual_end)
              : new Date();

            console.log(
              `🔍 Buscando en vehicle_locations: vehicle=${found.vehicle_id}, desde=${startDate}, hasta=${endDate}`
            );

            const { data: locations } = await locationService.getVehicleHistory(
              found.vehicle_id,
              {
                startDate,
                endDate,
                limit: 5000,
              }
            );

            if (locations && locations.length > 0) {
              console.log(
                `✅ Encontrados ${locations.length} puntos en vehicle_locations`
              );
              const coords = locations
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((loc) => [loc.longitude, loc.latitude]);
              setActualTrack(coords);
            } else {
              console.warn(
                '⚠️ No se encontraron datos de ubicación en ninguna tabla'
              );
              setActualTrack([]);
            }
          } else {
            console.warn(
              '⚠️ Faltan datos de vehículo o fecha de inicio para buscar ubicaciones'
            );
            setActualTrack([]);
          }
        }
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);

  // Map Matching: Ajustar puntos GPS a las calles
  useEffect(() => {
    if (actualTrack.length === 0 || !MAPBOX_TOKEN) {
      setMatchedTrack([]);
      return;
    }

    const matchToRoads = async () => {
      try {
        // Filtrar puntos duplicados (mismo lat/lng)
        const uniquePoints = [];
        const seen = new Set();

        for (const [lng, lat] of actualTrack) {
          const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniquePoints.push([lng, lat]);
          }
        }

        console.log(
          `🔍 Puntos únicos después de filtrar duplicados: ${uniquePoints.length} de ${actualTrack.length}`
        );

        if (uniquePoints.length < 2) {
          console.warn('⚠️ Insuficientes puntos únicos para map matching');
          setMatchedTrack(actualTrack);
          return;
        }

        // Limitar a 100 puntos máximo (límite de la API de Mapbox)
        const maxPoints = 100;
        let sampledPoints = uniquePoints;

        if (uniquePoints.length > maxPoints) {
          const step = Math.ceil(uniquePoints.length / maxPoints);
          sampledPoints = uniquePoints.filter((_, i) => i % step === 0);
          // Asegurar que el último punto siempre esté incluido
          if (
            sampledPoints[sampledPoints.length - 1] !==
            uniquePoints[uniquePoints.length - 1]
          ) {
            sampledPoints.push(uniquePoints[uniquePoints.length - 1]);
          }
        }

        // Convertir a formato "lng,lat;lng,lat;..."
        const coordinates = sampledPoints
          .map(([lng, lat]) => `${lng},${lat}`)
          .join(';');

        // Llamar a Mapbox Map Matching API
        const url = `https://api.mapbox.com/matching/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&radiuses=${sampledPoints.map(() => '25').join(';')}&access_token=${MAPBOX_TOKEN}`;

        console.log(
          `🗺️ Ajustando ${sampledPoints.length} puntos GPS a las calles...`
        );

        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.matchings && data.matchings.length > 0) {
          const matchedCoords = data.matchings[0].geometry.coordinates;
          setMatchedTrack(matchedCoords);
          console.log(
            `✅ Ruta ajustada a calles: ${matchedCoords.length} puntos`
          );
        } else {
          console.warn(
            '⚠️ No se pudo ajustar la ruta a las calles, usando puntos originales'
          );
          setMatchedTrack(actualTrack);
        }
      } catch (error) {
        console.warn(
          '⚠️ Error en map matching, usando puntos GPS originales:',
          error.message
        );
        setMatchedTrack(actualTrack);
      }
    };

    matchToRoads();
  }, [actualTrack]);

  // Calcular métricas
  useEffect(() => {
    if (!assignment?.route?.geometry?.coordinates || actualTrack.length === 0) {
      setMetrics(null);
      return;
    }

    const plannedCoords = assignment.route.geometry.coordinates;
    const plannedDistance = calculateTotalDistance(plannedCoords);
    const actualDistance = calculateTotalDistance(actualTrack);
    const { avgDeviation, maxDeviation } = calculateRouteDeviation(
      plannedCoords,
      actualTrack
    );

    const distanceDiff = actualDistance - plannedDistance;
    const distanceDiffPercent =
      plannedDistance > 0 ? (distanceDiff / plannedDistance) * 100 : 0;

    // Tiempo estimado vs real (si hay datos)
    let timeDiff = null;
    let timeDiffPercent = null;
    if (assignment.start_time && assignment.end_time) {
      const plannedTime = assignment.route.estimated_duration || 0;
      const actualTime =
        (new Date(assignment.end_time) - new Date(assignment.start_time)) /
        1000;
      timeDiff = actualTime - plannedTime;
      timeDiffPercent = plannedTime > 0 ? (timeDiff / plannedTime) * 100 : 0;
    }

    setMetrics({
      plannedDistance,
      actualDistance,
      distanceDiff,
      distanceDiffPercent,
      avgDeviation,
      maxDeviation,
      timeDiff,
      timeDiffPercent,
      complianceScore: Math.max(0, 100 - avgDeviation / 10), // Score básico
    });
  }, [assignment, actualTrack]);

  // Inicializar mapa
  useEffect(() => {
    if (!assignment || map.current) return;

    // Esperar a que el contenedor esté listo
    const initMap = () => {
      if (!mapContainer.current) {
        console.log('⏳ Esperando contenedor del mapa...');
        setTimeout(initMap, 100);
        return;
      }

      try {
        console.log('🗺️ Inicializando mapa...');

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: assignment.route?.geometry?.coordinates?.[0] || [
            -74.0817, 4.6097,
          ],
          zoom: 12,
        });

        map.current.on('load', () => {
          console.log('✅ Mapa cargado correctamente');

          // Ruta planificada (azul)
          if (assignment.route?.geometry) {
            // Verificar si ya existe la fuente
            if (!map.current.getSource('planned-route')) {
              map.current.addSource('planned-route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: assignment.route.geometry,
                },
              });
            }

            // Verificar si ya existe la capa
            if (!map.current.getLayer('planned-route-line')) {
              map.current.addLayer({
                id: 'planned-route-line',
                type: 'line',
                source: 'planned-route',
                paint: {
                  'line-color': '#3b82f6',
                  'line-width': 4,
                  'line-opacity': 0.7,
                },
              });
            }

            // Fit bounds a la ruta planificada
            const coords = assignment.route.geometry.coordinates;
            if (coords.length > 0) {
              const bounds = coords.reduce(
                (acc, c) => acc.extend(c),
                new mapboxgl.LngLatBounds(coords[0], coords[0])
              );
              map.current.fitBounds(bounds, { padding: 60 });
            }
          }
        });

        map.current.on('error', (e) => {
          console.error('❌ Error del mapa:', e);
        });
      } catch (error) {
        console.error('❌ Error inicializando mapa:', error);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [assignment]);

  // Actualizar ruta real en el mapa
  useEffect(() => {
    if (!map.current || matchedTrack.length === 0) return;

    const addActualTrack = () => {
      if (!map.current || !map.current.isStyleLoaded()) {
        setTimeout(addActualTrack, 100);
        return;
      }

      const actualLineData = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: matchedTrack, // Usar ruta ajustada a calles
        },
      };

      if (map.current.getSource('actual-track')) {
        console.log('🔄 Actualizando ruta recorrida en el mapa');
        map.current.getSource('actual-track').setData(actualLineData);
      } else {
        console.log('➕ Agregando ruta recorrida al mapa');
        map.current.addSource('actual-track', {
          type: 'geojson',
          data: actualLineData,
        });

        if (!map.current.getLayer('actual-track-line')) {
          map.current.addLayer({
            id: 'actual-track-line',
            type: 'line',
            source: 'actual-track',
            paint: {
              'line-color': '#ef4444',
              'line-width': 4,
              'line-opacity': 0.9,
            },
          });
        }
      }

      // Ajustar vista para mostrar ambas rutas
      if (matchedTrack.length > 0 && assignment?.route?.geometry?.coordinates) {
        const allCoords = [
          ...assignment.route.geometry.coordinates,
          ...matchedTrack,
        ];
        const bounds = allCoords.reduce(
          (acc, c) => acc.extend(c),
          new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
        );
        map.current.fitBounds(bounds, { padding: 80 });
      }

      console.log(
        `✅ Ruta recorrida en el mapa: ${matchedTrack.length} puntos (ajustada a calles)`
      );
    };

    addActualTrack();
  }, [matchedTrack, assignment]);

  // Controlar visibilidad de la ruta planificada
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (map.current.getLayer('planned-route-line')) {
      map.current.setLayoutProperty(
        'planned-route-line',
        'visibility',
        showPlanned ? 'visible' : 'none'
      );
    }
  }, [showPlanned]);

  // Controlar visibilidad de la ruta recorrida
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (map.current.getLayer('actual-track-line')) {
      map.current.setLayoutProperty(
        'actual-track-line',
        'visibility',
        showActual ? 'visible' : 'none'
      );
    }
  }, [showActual]);

  // Exportar reporte en PDF
  const exportReport = async () => {
    if (!metrics || !assignment) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(31, 78, 120);
    doc.text('Reporte de Comparación de Ruta', pageWidth / 2, yPos, {
      align: 'center',
    });

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generado el ${new Date().toLocaleString('es-CO')}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );

    yPos += 15;

    // Información General
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Información General', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Campo', 'Valor']],
      body: [
        ['Ruta', assignment.route?.name || 'N/A'],
        ['ID Asignación', assignment.id.toString()],
        ['Vehículo', assignment.vehicle?.placa || 'N/A'],
        [
          'Conductor',
          `${assignment.driver?.nombre || ''} ${assignment.driver?.apellidos || ''}`.trim() ||
            'N/A',
        ],
        [
          'Fecha Inicio',
          assignment.actual_start
            ? new Date(assignment.actual_start).toLocaleString('es-CO')
            : 'N/A',
        ],
        [
          'Fecha Fin',
          assignment.actual_end
            ? new Date(assignment.actual_end).toLocaleString('es-CO')
            : 'N/A',
        ],
        ['Estado', assignment.status || 'N/A'],
        ['Puntos GPS Registrados', actualTrack.length.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [31, 78, 120] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Métricas de Rendimiento
    doc.setFontSize(14);
    doc.text('Métricas de Rendimiento', 14, yPos);
    yPos += 7;

    const formatDist = (m) =>
      m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(2)} km`;
    const formatPercent = (p) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: [
        ['Distancia Planificada', formatDist(metrics.plannedDistance)],
        ['Distancia Recorrida', formatDist(metrics.actualDistance)],
        [
          'Diferencia de Distancia',
          `${formatDist(Math.abs(metrics.distanceDiff))} (${formatPercent(metrics.distanceDiffPercent)})`,
        ],
        ['Desviación Promedio', formatDist(metrics.avgDeviation)],
        ['Desviación Máxima', formatDist(metrics.maxDeviation)],
        [
          'Puntuación de Cumplimiento',
          `${metrics.complianceScore.toFixed(0)}%`,
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [31, 78, 120] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Evaluación de Cumplimiento
    doc.setFontSize(14);
    doc.text('Evaluación de Cumplimiento', 14, yPos);
    yPos += 7;

    const compliance = metrics.complianceScore;
    const rating =
      compliance >= 80
        ? 'Excelente'
        : compliance >= 60
          ? 'Aceptable'
          : 'Requiere Atención';
    const color =
      compliance >= 80
        ? [34, 197, 94]
        : compliance >= 60
          ? [234, 179, 8]
          : [239, 68, 68];

    doc.setFillColor(...color);
    doc.rect(14, yPos, 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(rating, 29, yPos + 6.5, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Score: ${compliance.toFixed(1)}%`, 50, yPos + 6.5);

    yPos += 20;

    // Observaciones
    doc.setFontSize(14);
    doc.text('Observaciones y Recomendaciones', 14, yPos);
    yPos += 7;

    const observations = [];

    if (metrics.avgDeviation > 100) {
      observations.push(
        '• Alta desviación promedio detectada. Revisar ruta seguida por el conductor.'
      );
    }
    if (metrics.distanceDiffPercent > 15) {
      observations.push(
        '• Diferencia significativa en distancia recorrida. Posibles desvíos o rutas alternas.'
      );
    }
    if (metrics.complianceScore < 60) {
      observations.push(
        '• Cumplimiento bajo. Se recomienda capacitación al conductor.'
      );
    }
    if (actualTrack.length < 50) {
      observations.push(
        '• Pocos puntos GPS registrados. Verificar activación de tracking durante la ruta.'
      );
    }
    if (observations.length === 0) {
      observations.push(
        '• Ruta ejecutada conforme a lo planificado. Buen desempeño del conductor.'
      );
    }

    doc.setFontSize(10);
    observations.forEach((obs, i) => {
      doc.text(obs, 14, yPos + i * 7, { maxWidth: pageWidth - 28 });
    });

    yPos += observations.length * 7 + 15;

    // Waypoints visitados (si hay espacio)
    if (assignment.route?.waypoints && yPos < 250) {
      doc.setFontSize(14);
      doc.text('Waypoints de la Ruta', 14, yPos);
      yPos += 7;

      const waypointData = assignment.route.waypoints.map((wp, i) => [
        `Punto ${i + 1}`,
        wp.address || `${wp.lat.toFixed(6)}, ${wp.lng.toFixed(6)}`,
        wp.notes || '-',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Dirección', 'Notas']],
        body: waypointData,
        theme: 'striped',
        headStyles: { fillColor: [31, 78, 120] },
        margin: { left: 14, right: 14 },
      });
    }

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `FleetManager - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Guardar PDF
    doc.save(
      `reporte-ruta-${assignment.id}-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  const formatDistance = (m) =>
    m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(2)} km`;
  const formatTime = (s) =>
    s < 60 ? `${s.toFixed(0)} s` : `${Math.round(s / 60)} min`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Asignación no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Comparación de Ruta
            </h1>
            <p className="text-sm text-gray-600">{assignment.route?.name}</p>
          </div>
        </div>
        <button
          onClick={exportReport}
          disabled={!metrics}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Alerta informativa sobre datos */}
        {actualTrack.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  No hay datos de trayectoria disponibles
                </h3>
                <p className="text-sm text-yellow-800">
                  Para poder comparar la ruta planificada con la recorrida, el
                  conductor debe:
                </p>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside ml-2">
                  <li>Activar el GPS en la vista de conductor</li>
                  <li>Presionar "Iniciar GPS" al comenzar la ruta</li>
                  <li>Mantener el GPS activo durante todo el recorrido</li>
                </ul>
                <p className="text-sm text-yellow-800 mt-3">
                  Los datos se guardarán automáticamente y estarán disponibles
                  para comparación al finalizar la ruta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información sobre la fuente de datos */}
        {actualTrack.length > 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                <strong>{actualTrack.length}</strong> puntos GPS registrados
                durante la ruta
              </span>
            </div>
          </div>
        )}

        {/* Métricas */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Desviación promedio */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Desviación Promedio
                </span>
                <Navigation className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDistance(metrics.avgDeviation)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Máxima: {formatDistance(metrics.maxDeviation)}
              </div>
            </div>

            {/* Distancia */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Diferencia Distancia
                </span>
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.distanceDiffPercent >= 0 ? '+' : ''}
                {metrics.distanceDiffPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDistance(Math.abs(metrics.distanceDiff))}{' '}
                {metrics.distanceDiff >= 0 ? 'extra' : 'menos'}
              </div>
            </div>

            {/* Tiempo */}
            {metrics.timeDiff !== null && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Diferencia Tiempo
                  </span>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.timeDiffPercent >= 0 ? '+' : ''}
                  {metrics.timeDiffPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(Math.abs(metrics.timeDiff))}{' '}
                  {metrics.timeDiff >= 0 ? 'extra' : 'menos'}
                </div>
              </div>
            )}

            {/* Score de cumplimiento */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Puntuación</span>
                {metrics.complianceScore >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : metrics.complianceScore >= 60 ? (
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.complianceScore.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.complianceScore >= 80
                  ? 'Excelente'
                  : metrics.complianceScore >= 60
                    ? 'Aceptable'
                    : 'Requiere atención'}
              </div>
            </div>
          </div>
        )}

        {/* Leyenda y controles */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Capas del Mapa</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPlanned(true);
                  setShowActual(true);
                }}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Mostrar Todo
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showPlanned}
                onChange={(e) => setShowPlanned(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <div
                  className={`w-12 h-1 bg-blue-500 transition-opacity ${showPlanned ? 'opacity-70' : 'opacity-30'}`}
                ></div>
                <span
                  className={`text-sm transition-colors ${showPlanned ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                >
                  Ruta Planificada
                </span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showActual}
                onChange={(e) => setShowActual(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <div className="flex items-center gap-2">
                <div
                  className={`w-12 h-1 bg-red-500 transition-opacity ${showActual ? 'opacity-80' : 'opacity-30'}`}
                ></div>
                <span
                  className={`text-sm transition-colors ${showActual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                >
                  Ruta Recorrida
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div
            ref={mapContainer}
            className="w-full h-[600px]"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>
    </div>
  );
}
