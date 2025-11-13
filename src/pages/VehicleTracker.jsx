import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Play,
  Pause,
  Navigation,
  Wifi,
  WifiOff,
  Battery,
  Clock,
  Car,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { locationService } from '../services/locationService';
import { useAuth } from '../lib/supabaseClient';

const VehicleTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    speed: 0,
    heading: 0,
    accuracy: 0,
    pointsSent: 0,
    errors: 0,
  });
  const [userVehicles, setUserVehicles] = useState([]);
  const [isSimulation, setIsSimulation] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const auth = useAuth();

  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const simSpeedRef = useRef(18); // km/h (≈5 m/s)
  const simHeadingRef = useRef(45); // grados (NE)
  const sendingRef = useRef(false);
  const lastCoordsRef = useRef(null);

  useEffect(() => {
    // Cleanup al desmontar componente
    return () => {
      if (watchIdRef.current) {
        locationService.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Cargar vehículos asignados al usuario (por nombre de conductor y/o por asignaciones activas del driver)
  useEffect(() => {
    let cancelled = false;
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const { data: userData } = await auth.getUser();
        const user = userData?.user;
        if (!user) return;

        // Obtener nombre para buscar: username, full_name, o parte local del email
        const conductorName = (
          user.username ||
          user.user_metadata?.full_name ||
          (user.email ? String(user.email).split('@')[0] : '')
        ).trim();
        const userEmail = user.email || '';

        let aggregated = [];

        if (conductorName) {
          const { data, error } =
            await locationService.getVehiclesByConductor(conductorName);
          if (error) {
            console.warn(
              'No se pudo cargar vehículos por nombre del usuario:',
              error.message
            );
          } else if (Array.isArray(data)) {
            aggregated = data;
          }
        }

        // Fallback: si no se encontró por nombre, buscar por asignación activa via email del driver
        if (aggregated.length === 0 && userEmail) {
          const { data: assigned, error: errAssigned } =
            await locationService.getAssignedVehiclesByDriverEmail(userEmail);
          if (errAssigned) {
            console.warn(
              'No se pudo cargar vehículos por asignación activa:',
              errAssigned.message
            );
          } else if (Array.isArray(assigned)) {
            aggregated = assigned;
          }
        }

        if (!cancelled) {
          setUserVehicles(aggregated);
          // Autoprefill si solo hay uno y no se ha escrito nada
          if (aggregated.length === 1 && !vehicleId) {
            setVehicleId(aggregated[0].placa?.toUpperCase() || '');
          }
        }
      } catch (err) {
        console.error('Error cargando vehículos usuario:', err);
      } finally {
        if (!cancelled) setLoadingVehicles(false);
      }
    };
    loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  const startTracking = async () => {
    if (!vehicleId.trim()) {
      setError('Ingrese la placa del vehículo');
      return;
    }

    setError('');
    setIsTracking(true);
    setConnectionStatus('connecting');

    try {
      // Verificar si la API de geolocalización está disponible
      if (!navigator.geolocation) {
        throw new Error('Tu navegador no soporta geolocalización');
      }

      // Solicitar permisos explícitamente solo si NO estamos en simulación
      if (!isSimulation) {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Permiso de ubicación concedido:', position);
              setCurrentPosition({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                heading: position.coords.heading,
                speed: position.coords.speed ? position.coords.speed * 3.6 : 0,
              });
              resolve(position);
            },
            (error) => {
              console.error('Error solicitando permisos GPS:', error);
              let errorMsg = 'No se pudo acceder a tu ubicación. ';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg +=
                    'Permiso denegado. Por favor, activa los permisos de ubicación para este sitio en la configuración de tu navegador.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg +=
                    'Ubicación no disponible. Verifica que el GPS esté activado en tu dispositivo.';
                  break;
                case error.TIMEOUT:
                  errorMsg += 'Tiempo de espera agotado. Intenta nuevamente.';
                  break;
                default:
                  errorMsg += error.message;
              }
              reject(new Error(errorMsg));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        });
      } else {
        // Semilla de simulación inmediata si no hay coordenadas
        const seed = lastCoordsRef.current ||
          currentPosition || {
            latitude: 4.711,
            longitude: -74.072,
            accuracy: 10,
            altitude: null,
            heading: simHeadingRef.current,
            speed: simSpeedRef.current,
            timestamp: new Date().toISOString(),
          };
        lastCoordsRef.current = seed;
        setCurrentPosition(seed);
      }

      // Iniciar watchPosition para mantener la última posición disponible sin bloquear
      // Iniciar watchPosition solo si NO estamos en simulación
      if (!isSimulation) {
        watchIdRef.current = locationService.watchPosition(
          (coords, error) => {
            if (error) {
              console.warn(
                'GPS watch (continuará reintentando):',
                error.message
              );
              setConnectionStatus('connecting');
              return;
            }
            if (coords) {
              lastCoordsRef.current = coords;
              setCurrentPosition(coords);
              setStats((prev) => ({
                ...prev,
                speed: Math.round(coords.speed || 0),
                heading: Math.round(coords.heading || 0),
                accuracy: Math.round(coords.accuracy || 0),
              }));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );

        if (!watchIdRef.current) {
          throw new Error('No se pudo iniciar el seguimiento GPS');
        }
      }

      // Iniciar polling cada 1 segundo para garantizar envíos constantes usando la última posición conocida
      intervalRef.current = setInterval(async () => {
        if (sendingRef.current) return;
        sendingRef.current = true;
        try {
          let coords = lastCoordsRef.current;

          if (isSimulation) {
            // Generar punto simulado cada segundo
            const base = coords ||
              currentPosition || {
                latitude: 4.711,
                longitude: -74.072,
                accuracy: 10,
                altitude: null,
                heading: simHeadingRef.current,
                speed: simSpeedRef.current,
                timestamp: new Date().toISOString(),
              };

            const metersPerSec = simSpeedRef.current / 3.6; // km/h -> m/s
            const headingRad = (simHeadingRef.current * Math.PI) / 180;
            const dNorth = metersPerSec * Math.cos(headingRad); // metros
            const dEast = metersPerSec * Math.sin(headingRad); // metros
            const latRad = (base.latitude * Math.PI) / 180;
            const newLat = base.latitude + dNorth / 111111;
            const newLon = base.longitude + dEast / (111111 * Math.cos(latRad));

            coords = {
              latitude: newLat,
              longitude: newLon,
              accuracy: 5,
              altitude: base.altitude,
              heading: simHeadingRef.current,
              speed: simSpeedRef.current,
              timestamp: new Date().toISOString(),
            };
            lastCoordsRef.current = coords;
          }
          if (coords) {
            setCurrentPosition(coords);
            setStats((prev) => ({
              ...prev,
              speed: Math.round(coords.speed || 0),
              heading: Math.round(coords.heading || 0),
              accuracy: Math.round(coords.accuracy || 0),
            }));

            try {
              const result = await locationService.insertLocation({
                vehicle_id: vehicleId.trim().toUpperCase(),
                latitude: coords.latitude,
                longitude: coords.longitude,
                speed: coords.speed || 0,
                heading: coords.heading || 0,
                accuracy: coords.accuracy,
                altitude: coords.altitude,
              });

              if (result.error) throw result.error;

              setConnectionStatus('connected');
              setLastUpdate(new Date());
              setStats((prev) => ({
                ...prev,
                pointsSent: prev.pointsSent + 1,
              }));
            } catch (err) {
              console.error('Error enviando ubicación:', err);
              setError(`Error de conexión: ${err.message}`);
              setConnectionStatus('error');
              setStats((prev) => ({ ...prev, errors: prev.errors + 1 }));
            }
          }
        } finally {
          sendingRef.current = false;
        }
      }, 1000);

      if (!intervalRef.current) {
        throw new Error('No se pudo iniciar el polling de ubicación');
      }
    } catch (err) {
      setError(err.message);
      setIsTracking(false);
      setConnectionStatus('error');
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      locationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
    setConnectionStatus('disconnected');
    setCurrentPosition(null);
    setError('');
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Error';
      default:
        return 'Desconectado';
    }
  };

  const formatCoordinate = (value, precision = 6) => {
    return value ? value.toFixed(precision) : '0.000000';
  };

  const formatTime = (date) => {
    return date ? date.toLocaleTimeString() : '--:--:--';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-500 rounded-full">
              <Car className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vehicle Tracker
          </h1>
          <p className="text-gray-600">Seguimiento GPS en tiempo real</p>
        </div>

        {/* Vehicle Input / Selector */}
        <div className="bg-white shadow-lg p-6 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placa del Vehículo
            </label>
            <input
              type="text"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value.toUpperCase())}
              placeholder="Ej: ABC-123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
              disabled={isTracking}
            />
          </div>

          {loadingVehicles && (
            <div className="text-xs text-gray-500 animate-pulse">
              Cargando vehículos asignados...
            </div>
          )}

          {!loadingVehicles && userVehicles.length === 0 && (
            <div className="text-xs text-gray-500">
              No tienes vehículos asignados. Puedes escribir la placa
              manualmente.
            </div>
          )}

          {userVehicles.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tus vehículos asignados
              </label>
              <div className="grid gap-2">
                {userVehicles.map((v) => (
                  <button
                    key={v.id || v.placa}
                    type="button"
                    onClick={() =>
                      !isTracking && setVehicleId(v.placa.toUpperCase())
                    }
                    className={`px-3 py-2 rounded-md border text-sm flex justify-between items-center transition-colors ${
                      vehicleId === v.placa.toUpperCase()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                    }`}
                    disabled={isTracking}
                  >
                    <span className="font-mono">{v.placa.toUpperCase()}</span>
                    <span className="text-xs opacity-80">
                      {v.modelo || '–'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white shadow-lg p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isSimulation}
                onChange={(e) => setIsSimulation(e.target.checked)}
                disabled={isTracking}
              />
              <span>Modo simulación (puntos sintéticos cada 1s)</span>
            </label>
            <div className="text-xs text-gray-500">
              Vel: {simSpeedRef.current} km/h · Rumbo: {simHeadingRef.current}°
            </div>
          </div>
          <div className="flex gap-4">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Iniciar Tracking</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-red-700 transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Detener</span>
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white shadow-lg p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Estado</span>
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span
                className={`text-sm font-medium ${
                  connectionStatus === 'connected'
                    ? 'text-green-600'
                    : connectionStatus === 'connecting'
                      ? 'text-yellow-600'
                      : connectionStatus === 'error'
                        ? 'text-red-600'
                        : 'text-gray-500'
                }`}
              >
                {getConnectionText()}
              </span>
            </div>
          </div>

          {lastUpdate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Última actualización
              </span>
              <span className="text-sm font-mono text-gray-800">
                {formatTime(lastUpdate)}
              </span>
            </div>
          )}
        </div>

        {/* GPS Data */}
        {currentPosition && (
          <div className="bg-white shadow-lg p-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Ubicación GPS
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Latitud</div>
                <div className="font-mono text-gray-900 bg-gray-50 p-2 rounded">
                  {formatCoordinate(currentPosition.latitude)}
                </div>
              </div>

              <div>
                <div className="text-gray-600 mb-1">Longitud</div>
                <div className="font-mono text-gray-900 bg-gray-50 p-2 rounded">
                  {formatCoordinate(currentPosition.longitude)}
                </div>
              </div>

              <div>
                <div className="text-gray-600 mb-1">Velocidad</div>
                <div className="font-mono text-gray-900 bg-gray-50 p-2 rounded">
                  {stats.speed} km/h
                </div>
              </div>

              <div>
                <div className="text-gray-600 mb-1">Dirección</div>
                <div className="font-mono text-gray-900 bg-gray-50 p-2 rounded flex items-center">
                  <Navigation
                    className="w-4 h-4 mr-1"
                    style={{ transform: `rotate(${stats.heading}deg)` }}
                  />
                  {stats.heading}°
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-600 mb-1">Precisión GPS</div>
                <div className="font-mono text-gray-900 bg-gray-50 p-2 rounded">
                  ±{stats.accuracy} metros
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-white shadow-lg p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estadísticas
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.pointsSent}
              </div>
              <div className="text-green-800">Puntos enviados</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.errors}
              </div>
              <div className="text-red-800">Errores</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              {isTracking
                ? `Enviando ubicación cada 1 segundo para ${vehicleId}`
                : 'Tracker detenido'}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-b-2xl shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isTracking && !error && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-b-2xl shadow-lg">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Instrucciones:</p>
                <ol className="text-blue-700 list-decimal list-inside space-y-1">
                  <li>Ingrese o seleccione la placa del vehículo</li>
                  <li>Presione "Iniciar Tracking"</li>
                  <li>
                    Conceda permisos de ubicación cuando el navegador lo
                    solicite
                  </li>
                  <li>Mantenga la app abierta durante el tracking</li>
                </ol>
                <p className="mt-2 text-xs text-blue-600">
                  💡 Si no aparece el diálogo de permisos, verifica en la
                  configuración del navegador que los permisos de ubicación
                  estén permitidos para este sitio.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleTracker;
