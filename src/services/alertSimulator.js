import { locationService } from '../services/locationService';
import { evaluarAlertasUbicacion } from '../services/alertService';

/**
 * Simulador de Alertas para Pruebas
 * Simula escenarios de velocidad excesiva y paradas prolongadas
 */

// Coordenadas de Bogotá (puedes cambiarlas)
const BASE_LAT = 4.6097;
const BASE_LNG = -74.0817;

/**
 * Simula un vehículo excediendo velocidad
 * @param {number} vehicleId - ID del vehículo
 * @param {number} duracionSegundos - Cuánto tiempo mantener la velocidad alta
 */
export const simularVelocidadExcesiva = async (
  vehicleId,
  duracionSegundos = 15
) => {
  console.log(`🚗 Simulando velocidad excesiva para vehículo ${vehicleId}...`);

  const intervalo = 5000; // Cada 5 segundos
  const iteraciones = Math.ceil(duracionSegundos / 5);

  for (let i = 0; i < iteraciones; i++) {
    const velocidad = 95 + Math.random() * 10; // Entre 95-105 km/h
    const lat = BASE_LAT + (Math.random() - 0.5) * 0.01;
    const lng = BASE_LNG + (Math.random() - 0.5) * 0.01;

    console.log(`  📍 Enviando: ${velocidad.toFixed(1)} km/h`);

    // Insertar ubicación
    await locationService.insertLocation({
      vehicle_id: vehicleId,
      latitude: lat,
      longitude: lng,
      speed: velocidad,
      heading: Math.random() * 360,
    });

    // Esperar 5 segundos
    if (i < iteraciones - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalo));
    }
  }

  console.log(
    '✅ Simulación completada. Verifica /alertas para ver la alerta generada.'
  );
};

/**
 * Simula un vehículo detenido por mucho tiempo
 * @param {number} vehicleId - ID del vehículo
 * @param {number} duracionMinutos - Cuántos minutos simular parado
 */
export const simularParadaProlongada = async (
  vehicleId,
  duracionMinutos = 35
) => {
  console.log(`🛑 Simulando parada prolongada para vehículo ${vehicleId}...`);

  const lat = BASE_LAT;
  const lng = BASE_LNG;
  const intervalo = 5000; // Cada 5 segundos
  const iteraciones = Math.ceil((duracionMinutos * 60) / 5);

  for (let i = 0; i < iteraciones; i++) {
    console.log(
      `  📍 Enviando: 0 km/h (parado) - minuto ${Math.floor((i * 5) / 60)}`
    );

    // Insertar ubicación (misma posición, velocidad 0)
    await locationService.insertLocation({
      vehicle_id: vehicleId,
      latitude: lat + (Math.random() - 0.5) * 0.0001, // Variación mínima (GPS drift)
      longitude: lng + (Math.random() - 0.5) * 0.0001,
      speed: 0,
      heading: 0,
    });

    // Esperar 5 segundos
    if (i < iteraciones - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalo));
    }
  }

  console.log(
    '✅ Simulación completada. Verifica /alertas para ver la alerta generada.'
  );
};

/**
 * Simula un vehículo en movimiento normal (sin alertas)
 * @param {number} vehicleId - ID del vehículo
 */
export const simularMovimientoNormal = async (
  vehicleId,
  duracionSegundos = 30
) => {
  console.log(`🚙 Simulando movimiento normal para vehículo ${vehicleId}...`);

  const intervalo = 5000;
  const iteraciones = Math.ceil(duracionSegundos / 5);

  for (let i = 0; i < iteraciones; i++) {
    const velocidad = 40 + Math.random() * 30; // Entre 40-70 km/h
    const lat = BASE_LAT + i * 0.001;
    const lng = BASE_LNG + i * 0.001;

    console.log(`  📍 Enviando: ${velocidad.toFixed(1)} km/h`);

    await locationService.insertLocation({
      vehicle_id: vehicleId,
      latitude: lat,
      longitude: lng,
      speed: velocidad,
      heading: 45,
    });

    if (i < iteraciones - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalo));
    }
  }

  console.log(
    '✅ Movimiento normal completado. No deberían generarse alertas.'
  );
};

// Exportar todo
export default {
  simularVelocidadExcesiva,
  simularParadaProlongada,
  simularMovimientoNormal,
};
