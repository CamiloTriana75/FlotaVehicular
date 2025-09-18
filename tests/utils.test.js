import { describe, it, expect } from 'vitest';

// Utilidades de prueba para el sistema de gestión de flota

describe('Vehicle Utils', () => {
  // Función para calcular el estado del combustible
  const getFuelStatus = (level) => {
    if (level <= 15) return 'crítico';
    if (level <= 30) return 'bajo';
    if (level <= 70) return 'normal';
    return 'alto';
  };

  // Función para formatear placa de vehículo
  const formatPlate = (plate) => {
    if (!plate) return '';
    return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  // Función para calcular distancia entre dos puntos GPS
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  it('should return correct fuel status', () => {
    expect(getFuelStatus(10)).toBe('crítico');
    expect(getFuelStatus(25)).toBe('bajo');
    expect(getFuelStatus(50)).toBe('normal');
    expect(getFuelStatus(80)).toBe('alto');
  });

  it('should format vehicle plates correctly', () => {
    expect(formatPlate('abc-123')).toBe('ABC123');
    expect(formatPlate('def 456')).toBe('DEF456');
    expect(formatPlate('ghi@789')).toBe('GHI789');
    expect(formatPlate('')).toBe('');
  });

  it('should calculate distance between GPS coordinates', () => {
    // Distancia entre dos puntos en Bogotá (aprox. 5km)
    const distance = calculateDistance(4.7110, -74.0721, 4.6588, -74.0535);
    expect(distance).toBeCloseTo(8.5, 0); // Aproximadamente 8.5km
  });
});

describe('Driver Utils', () => {
  // Función para validar cédula colombiana
  const isValidCedula = (cedula) => {
    if (!cedula || cedula.length < 7 || cedula.length > 10) return false;
    return /^\d+$/.test(cedula);
  };

  // Función para calcular días hasta vencimiento de licencia
  const getDaysUntilExpiration = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  it('should validate Colombian cedula correctly', () => {
    expect(isValidCedula('12345678')).toBe(true);
    expect(isValidCedula('1234567890')).toBe(true);
    expect(isValidCedula('123456')).toBe(false);
    expect(isValidCedula('12345678901')).toBe(false);
    expect(isValidCedula('abc12345')).toBe(false);
    expect(isValidCedula('')).toBe(false);
  });

  it('should calculate days until license expiration', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    
    expect(getDaysUntilExpiration(futureDate)).toBeCloseTo(30, 0);
    expect(getDaysUntilExpiration(pastDate)).toBeCloseTo(-10, 0);
  });
});