import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  AlertTriangle,
  Gauge,
  MapPin,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  obtenerReglasAlertas,
  actualizarReglaAlerta,
  toggleReglaAlerta,
  inicializarReglasAlertas,
} from '../services/alertService';

const AlertRulesConfig = () => {
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(null);

  const cargarReglas = async () => {
    setLoading(true);
    try {
      const { data, error } = await obtenerReglasAlertas();
      console.log('AlertRulesConfig - Datos recibidos:', { data, error });
      setReglas(data || []);
    } catch (error) {
      console.error('Error cargando reglas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInicializarReglas = async () => {
    setLoading(true);
    try {
      const { data, error } = await inicializarReglasAlertas();
      if (error) {
        alert('Error al inicializar reglas: ' + error.message);
      } else {
        alert('Reglas inicializadas correctamente');
        cargarReglas();
      }
    } catch (error) {
      console.error('Error inicializando reglas:', error);
      alert('Error al inicializar reglas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReglas();
  }, []);

  const handleToggle = async (tipoAlerta) => {
    try {
      await toggleReglaAlerta(tipoAlerta);
      cargarReglas();
    } catch (error) {
      console.error('Error toggleando regla:', error);
    }
  };

  const handleGuardar = async (regla) => {
    setSaving(true);
    try {
      await actualizarReglaAlerta(
        regla.tipo_alerta,
        regla.umbrales,
        regla.habilitado
      );
      setEditando(null);
      cargarReglas();
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error guardando regla:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = (regla) => {
    setEditando({ ...regla });
  };

  const handleCancelar = () => {
    setEditando(null);
  };

  const handleCambioUmbral = (campo, valor) => {
    setEditando((prev) => ({
      ...prev,
      umbrales: {
        ...prev.umbrales,
        [campo]: valor,
      },
    }));
  };

  const getIcono = (tipo) => {
    switch (tipo) {
      case 'velocidad_excesiva':
        return <Gauge className="w-6 h-6" />;
      case 'parada_prolongada':
        return <MapPin className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getDescripcion = (tipo) => {
    switch (tipo) {
      case 'velocidad_excesiva':
        return 'Detecta cuando un vehículo excede el límite de velocidad configurado';
      case 'parada_prolongada':
        return 'Detecta cuando un vehículo permanece detenido en un lugar por mucho tiempo';
      default:
        return 'Configuración de alerta';
    }
  };

  const renderFormularioEdicion = (regla) => {
    const esVelocidad = regla.tipo_alerta === 'velocidad_excesiva';
    const esParada = regla.tipo_alerta === 'parada_prolongada';

    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-4">Editar Umbrales</h4>

        <div className="grid grid-cols-2 gap-4">
          {esVelocidad && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velocidad Máxima (km/h)
                </label>
                <input
                  type="number"
                  value={editando.umbrales.max_velocidad_kmh || 0}
                  onChange={(e) =>
                    handleCambioUmbral(
                      'max_velocidad_kmh',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="200"
                />
                <div className="mt-2">
                  <input
                    type="range"
                    value={editando.umbrales.max_velocidad_kmh || 0}
                    onChange={(e) =>
                      handleCambioUmbral(
                        'max_velocidad_kmh',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                    min="0"
                    max="200"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 km/h</span>
                    <span>100 km/h</span>
                    <span>200 km/h</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración Mínima (segundos)
                </label>
                <input
                  type="number"
                  value={editando.umbrales.duracion_segundos || 0}
                  onChange={(e) =>
                    handleCambioUmbral(
                      'duracion_segundos',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="60"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo que debe mantenerse la velocidad excesiva antes de
                  generar alerta
                </p>
              </div>
            </>
          )}

          {esParada && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración Mínima (segundos)
                </label>
                <input
                  type="number"
                  value={editando.umbrales.duracion_segundos || 0}
                  onChange={(e) =>
                    handleCambioUmbral(
                      'duracion_segundos',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="3600"
                />
                <div className="mt-2">
                  <input
                    type="range"
                    value={editando.umbrales.duracion_segundos || 0}
                    onChange={(e) =>
                      handleCambioUmbral(
                        'duracion_segundos',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                    min="0"
                    max="3600"
                    step="60"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 min</span>
                    <span>30 min</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radio de Detección (metros)
                </label>
                <input
                  type="number"
                  value={editando.umbrales.radio_metros || 0}
                  onChange={(e) =>
                    handleCambioUmbral('radio_metros', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Radio dentro del cual se considera que el vehículo está
                  detenido
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velocidad Máxima (km/h)
                </label>
                <input
                  type="number"
                  value={editando.umbrales.velocidad_max_kmh || 0}
                  onChange={(e) =>
                    handleCambioUmbral(
                      'velocidad_max_kmh',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Velocidad por debajo de la cual se considera detenido
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleGuardar(editando)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleCancelar}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuración de Alertas
            </h1>
            <p className="text-sm text-gray-600">
              Configura los umbrales y reglas para la generación de alertas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (window.location.href = '/alertas')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            ← Volver a Alertas
          </button>
          <button
            onClick={cargarReglas}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Información Importante
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Los cambios en las reglas de alerta se aplican inmediatamente. Las
              alertas existentes no se verán afectadas, solo las nuevas
              evaluaciones.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de reglas */}
      {loading ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      ) : reglas.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay reglas de alerta configuradas
          </h3>
          <p className="text-gray-600 mb-6">
            Haz clic en el botón para inicializar las reglas de alerta con
            valores por defecto.
          </p>
          <button
            onClick={handleInicializarReglas}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 mx-auto"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Inicializando...' : 'Inicializar Reglas de Alerta'}
          </button>

          <div className="mt-8 bg-gray-50 border rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              O ejecuta manualmente en Supabase SQL Editor:
            </p>
            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
              {`INSERT INTO alert_rules (tipo_alerta, nombre, descripcion, habilitado, umbrales, debounce_segundos)
VALUES 
  ('velocidad_excesiva', 'Velocidad Excesiva', 
   'Detecta exceso de velocidad', true, 
   '{"max_velocidad_kmh": 120, "duracion_segundos": 10}'::jsonb, 60),
  ('parada_prolongada', 'Parada Prolongada',
   'Detecta paradas prolongadas', true,
   '{"duracion_segundos": 300, "radio_metros": 50, "velocidad_max_kmh": 5}'::jsonb, 60)
ON CONFLICT (tipo_alerta) DO NOTHING;`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reglas.map((regla) => (
            <div
              key={regla.tipo_alerta}
              className={`bg-white border rounded-xl p-6 ${
                !regla.habilitado ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      regla.habilitado ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {getIcono(regla.tipo_alerta)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {regla.tipo_alerta.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getDescripcion(regla.tipo_alerta)}
                    </p>
                  </div>
                </div>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regla.habilitado}
                    onChange={() => handleToggle(regla.tipo_alerta)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {regla.habilitado ? 'Activa' : 'Inactiva'}
                  </span>
                </label>
              </div>{' '}
              {/* Mostrar umbrales actuales */}
              {regla.umbrales && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Umbrales Configurados:
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(regla.umbrales).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {value}{' '}
                          {key.includes('velocidad')
                            ? 'km/h'
                            : key.includes('duracion')
                              ? 's'
                              : key.includes('radio')
                                ? 'm'
                                : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Botón editar */}
              {editando?.tipo_alerta === regla.tipo_alerta ? (
                renderFormularioEdicion(regla)
              ) : (
                <button
                  onClick={() => handleEditar(regla)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Editar Umbrales
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertRulesConfig;
