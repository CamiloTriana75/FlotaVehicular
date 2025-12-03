import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Simple circle polygon approximator (meters on WGS84)
function circleToPolygon([lng, lat], radiusM, points = 64) {
  const coords = [];
  const R = 6371000; // Earth radius in meters
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
  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

export default function MapGeofencePicker({
  tipo,
  radius = 300,
  onRadiusChange,
  onGeometryChange,
  initialCenter = [-74.08175, 4.60971], // Bogotá
  initialZoom = 11,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [mapError, setMapError] = useState('');

  const token = (import.meta.env.VITE_MAPBOX_TOKEN || '').trim();
  useEffect(() => {
    if (!containerRef.current) return;
    if (!token) {
      console.warn('VITE_MAPBOX_TOKEN no está configurado.');
      return;
    }
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: initialZoom,
    });
    mapRef.current = map;

    // Capturar errores de Mapbox (por ejemplo token inválido 401)
    map.on('error', (e) => {
      console.error('Mapbox error:', e);
      const msg =
        e?.error?.message ||
        e?.message ||
        'Error al cargar Mapbox. Verifica el token y permisos.';
      setMapError(msg);
    });

    map.on('load', () => {
      // Sources
      if (!map.getSource('geofence-circle')) {
        map.addSource('geofence-circle', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
      if (!map.getSource('geofence-polygon')) {
        map.addSource('geofence-polygon', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      // Layers
      if (!map.getLayer('geofence-circle-fill')) {
        map.addLayer({
          id: 'geofence-circle-fill',
          type: 'fill',
          source: 'geofence-circle',
          paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.2 },
        });
      }
      if (!map.getLayer('geofence-circle-line')) {
        map.addLayer({
          id: 'geofence-circle-line',
          type: 'line',
          source: 'geofence-circle',
          paint: { 'line-color': '#2563eb', 'line-width': 2 },
        });
      }
      if (!map.getLayer('geofence-polygon-fill')) {
        map.addLayer({
          id: 'geofence-polygon-fill',
          type: 'fill',
          source: 'geofence-polygon',
          paint: { 'fill-color': '#10b981', 'fill-opacity': 0.2 },
        });
      }
      if (!map.getLayer('geofence-polygon-line')) {
        map.addLayer({
          id: 'geofence-polygon-line',
          type: 'line',
          source: 'geofence-polygon',
          paint: { 'line-color': '#059669', 'line-width': 2 },
        });
      }
    });

    const handleClick = (e) => {
      if (tipo === 'circle') {
        const lngLat = e.lngLat.wrap();
        // marker
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(map);
        } else {
          markerRef.current.setLngLat([lngLat.lng, lngLat.lat]);
        }
        const poly = circleToPolygon(
          [lngLat.lng, lngLat.lat],
          Number(radius) || 0
        );
        const feature = { type: 'Feature', geometry: poly };
        const src = map.getSource('geofence-circle');
        src.setData({ type: 'FeatureCollection', features: [feature] });
        onGeometryChange &&
          onGeometryChange({
            type: 'Point',
            coordinates: [lngLat.lng, lngLat.lat],
          });
      } else if (tipo === 'polygon' && !isClosed) {
        const lngLat = e.lngLat.wrap();
        const next = [...polygonCoords, [lngLat.lng, lngLat.lat]];
        setPolygonCoords(next);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [tipo, radius, token, isClosed, polygonCoords.length]);

  // Update circle polygon if radius changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || tipo !== 'circle') return;
    const marker = markerRef.current;
    if (!marker) return;
    const [lng, lat] = marker.getLngLat().toArray();
    const poly = circleToPolygon([lng, lat], Number(radius) || 0);
    const feature = { type: 'Feature', geometry: poly };
    const src = map.getSource('geofence-circle');
    if (src) src.setData({ type: 'FeatureCollection', features: [feature] });
  }, [radius, tipo]);

  // Draw polygon as it grows
  useEffect(() => {
    const map = mapRef.current;
    if (!map || tipo !== 'polygon') return;
    const coords =
      polygonCoords.length > 1
        ? [...polygonCoords, polygonCoords[0]]
        : polygonCoords;
    const polygon =
      coords.length >= 3
        ? { type: 'Polygon', coordinates: [coords] }
        : { type: 'LineString', coordinates: coords };
    const feature = { type: 'Feature', geometry: polygon };
    const src = map.getSource('geofence-polygon');
    if (src)
      src.setData({
        type: 'FeatureCollection',
        features: coords.length ? [feature] : [],
      });
  }, [polygonCoords, tipo]);

  const closePolygon = () => {
    if (polygonCoords.length >= 3) {
      const geo = {
        type: 'Polygon',
        coordinates: [[...polygonCoords, polygonCoords[0]]],
      };
      onGeometryChange && onGeometryChange(geo);
      setIsClosed(true);
    }
  };
  const undoLast = () => {
    if (!polygonCoords.length) return;
    const next = polygonCoords.slice(0, -1);
    setPolygonCoords(next);
    setIsClosed(false);
  };
  const reset = () => {
    setPolygonCoords([]);
    setIsClosed(false);
    const map = mapRef.current;
    if (map) {
      const src = map.getSource('geofence-polygon');
      src && src.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  return (
    <div className="space-y-2">
      {!token && (
        <div className="p-2 text-sm text-yellow-800 bg-yellow-50 rounded">
          Falta configurar `VITE_MAPBOX_TOKEN` en tu entorno.
        </div>
      )}
      {!!mapError && (
        <div className="p-2 text-sm text-red-700 bg-red-50 rounded">
          {mapError.includes('access token')
            ? 'Token de Mapbox inválido o sin permisos para este dominio.'
            : mapError}
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-80 rounded overflow-hidden border"
      />
      {tipo === 'circle' ? (
        <div className="text-sm text-gray-600">
          Clic en el mapa para establecer el centro del círculo.
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Clic para agregar vértices.</span>
          <button
            type="button"
            onClick={closePolygon}
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={polygonCoords.length < 3 || isClosed}
          >
            Cerrar polígono
          </button>
          <button
            type="button"
            onClick={undoLast}
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={!polygonCoords.length}
          >
            Deshacer
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1 border rounded"
          >
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}
