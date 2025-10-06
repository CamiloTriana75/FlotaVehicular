import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear iconos personalizados para diferentes estados
const createCustomIcon = (status) => {
  const color =
    status === 'activo'
      ? '#10b981'
      : status === 'estacionado'
        ? '#f59e0b'
        : '#ef4444';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const RecenterButton = ({ center }) => {
  const map = useMap();
  return (
    <button
      aria-label="Centrar mapa"
      onClick={() => map.setView(center, map.getZoom())}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '6px 10px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      Centrar
    </button>
  );
};

const Legend = () => (
  <div
    aria-label="Leyenda de estados"
    style={{
      position: 'absolute',
      bottom: 10,
      right: 10,
      zIndex: 1000,
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 10,
      fontSize: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          background: '#10b981',
          borderRadius: '50%',
          marginRight: 6,
        }}
      />{' '}
      Activo
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          background: '#f59e0b',
          borderRadius: '50%',
          marginRight: 6,
        }}
      />{' '}
      Estacionado
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          width: 10,
          height: 10,
          background: '#ef4444',
          borderRadius: '50%',
          marginRight: 6,
        }}
      />{' '}
      Mantenimiento
    </div>
  </div>
);

const MapViewer = ({
  vehicles = [],
  center = [4.711, -74.0721],
  zoom = 11,
}) => {
  const getDirectionText = (heading) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterButton center={center} />
      <Legend />

      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lng]}
          icon={createCustomIcon(vehicle.status)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-2">{vehicle.placa}</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Modelo:</strong> {vehicle.modelo}
                </p>
                <p>
                  <strong>Conductor:</strong> {vehicle.conductor}
                </p>
                <p>
                  <strong>Velocidad:</strong> {vehicle.speed} km/h
                </p>
                <p>
                  <strong>Dirección:</strong>{' '}
                  {getDirectionText(vehicle.heading)}
                </p>
                <p>
                  <strong>Combustible:</strong> {vehicle.combustible}%
                </p>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      vehicle.status === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'estacionado'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapViewer;
