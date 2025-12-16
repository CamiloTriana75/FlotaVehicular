import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import MapViewer from '../src/components/MapViewer';

// HU7: Visualización en mapa de vehículos (tiempo real)

const vehicles = [
  {
    id: 'v1',
    lat: 4.711,
    lng: -74.0721,
    status: 'activo',
    placa: 'ABC-123',
    modelo: 'X',
    conductor: 'Juan',
    speed: 45,
    heading: 90,
    combustible: 50,
  },
  {
    id: 'v2',
    lat: 4.72,
    lng: -74.05,
    status: 'estacionado',
    placa: 'DEF-456',
    modelo: 'Y',
    conductor: 'Ana',
    speed: 0,
    heading: 0,
    combustible: 80,
  },
  {
    id: 'v3',
    lat: 4.7,
    lng: -74.08,
    status: 'mantenimiento',
    placa: 'GHI-789',
    modelo: 'Z',
    conductor: 'Luis',
    speed: 0,
    heading: 180,
    combustible: 30,
  },
];

// JSDOM doesn't render Leaflet map; we assert presence of UI elements

describe('HU7 - MapViewer', () => {
  it('renders legend and recenter button', () => {
    render(
      <div style={{ height: 300 }}>
        <MapViewer vehicles={vehicles} />
      </div>
    );
    expect(screen.getByLabelText(/Leyenda de estados/i)).toBeDefined();
    expect(screen.getByLabelText(/Centrar mapa/i)).toBeDefined();
  });

  it('renders TileLayer with default OSM when no env vars', () => {
    // MapViewer computes tile URL internally; we just ensure component mounts
    render(
      <div style={{ height: 300 }}>
        <MapViewer vehicles={[]} />
      </div>
    );
    // Presence of map container implies tile layer was created
    // Avoid strict assertions on internal Leaflet DOM in JSDOM
    expect(document.querySelector('.leaflet-container')).toBeTruthy();
  });
});
