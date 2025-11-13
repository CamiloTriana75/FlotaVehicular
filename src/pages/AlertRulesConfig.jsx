import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  Gauge,
  MapPin,
  Clock,
  Zap,
  Shield,
} from 'lucide-react';
import {
  obtenerReglasAlertas,
  actualizarReglaAlerta,
  toggleReglaAlerta,
} from '../services/alertService';

const RULE_ICONS = {
  velocidad_excesiva: Gauge,
  parada_prolongada: MapPin,
  combustible_bajo: Zap,
  mantenimiento_vencido: Clock,
};

const AlertRulesConfig = () => {
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editando, setEditando] = useState({});

  const cargarReglas = async () => {
    setLoading(true);
    const { data } = await obtenerReglasAlertas();
    setReglas(data || []);
    setLoading(false);
  };

  useEffect(() => {
    cargarReglas();
  }, []);

  const handleToggleRegla = async (id, habilitado) => {
    setSaving(id);
    await toggleReglaAlerta(id, !habilitado);
    await cargarReglas();
    setSaving(null);
  };

  const handleUpdateUmbrales = async (regla) => {
    setSaving(regla.id);
    const updates = {
      umbrales: editando[regla.id]?.umbrales || regla.umbrales,
      tolerancia_porcentaje:
        editando[regla.id]?.tolerancia_porcentaje ??
        regla.tolerancia_porcentaje,
      debounce_segundos:
        editando[regla.id]?.debounce_segundos ?? regla.debounce_segundos,
      nivel_prioridad:
        editando[regla.id]?.nivel_prioridad ?? regla.nivel_prioridad,
    };

    await actualizarReglaAlerta(regla.id, updates);
    await cargarReglas();
    setEditando((prev) => {
      const { [regla.id]: _, ...rest } = prev;
      return rest;
    });
    setSaving(null);
  };

  const handleChangeUmbral = (reglaId, key, value) => {
    setEditando((prev) => ({
      ...prev,
      [reglaId]: {
        ...prev[reglaId],
        umbrales: {
          ...(prev[reglaId]?.umbrales ||
            reglas.find((r) => r.id === reglaId)?.umbrales ||
            {}),
          [key]: parseFloat(value) || 0,
        },
      },
    }));
  };

  const handleChangeConfig = (reglaId, key, value) => {
    setEditando((prev) => ({
      ...prev,
      [reglaId]: {
        ...prev[reglaId],
        [key]: key === 'nivel_prioridad' ? value : parseInt(value) || 0,
      },
    }));
  };

  const getUmbralActual = (regla, key) => {
    return editando[regla.id]?.umbrales?.[key] ?? regla.umbrales?.[key] ?? '';
  };

  const getConfigActual = (regla, key) => {
    return editando[regla.id]?.[key] ?? regla[key] ?? '';
  };

  const tieneEdiciones = (reglaId) => {
    return !!editando[reglaId];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración de Reglas de Alertas
            </h1>
            <p className="text-gray-600">
              Define umbrales y tolerancias para minimizar falsos positivos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Motor de reglas configurable</span>
        </div>
      </div>

      <div className="grid gap-6">
        {reglas.map((regla) => {
          const Icon = RULE_ICONS[regla.tipo_alerta] || AlertTriangle;
          const editado = tieneEdiciones(regla.id);

          return (
            <div
              key={regla.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all ${
                editado ? 'border-blue-400' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        regla.habilitado
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {regla.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {regla.descripcion}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleRegla(regla.id, regla.habilitado)
                    }
                    disabled={saving === regla.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      regla.habilitado
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {regla.habilitado ? 'Habilitado' : 'Deshabilitado'}
                  </button>
                </div>
              </div>

              {/* Umbrales */}
              <div className="p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Umbrales de Detección
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Velocidad excesiva */}
                  {regla.tipo_alerta === 'velocidad_excesiva' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Velocidad máxima (km/h)
                        </label>
                        <input
                          type="number"
                          value={getUmbralActual(regla, 'max_velocidad_kmh')}
                          onChange={(e) =>
                            handleChangeUmbral(
                              regla.id,
                              'max_velocidad_kmh',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración sostenida (segundos)
                        </label>
                        <input
                          type="number"
                          value={getUmbralActual(regla, 'duracion_segundos')}
                          onChange={(e) =>
                            handleChangeUmbral(
                              regla.id,
                              'duracion_segundos',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Parada prolongada */}
                  {regla.tipo_alerta === 'parada_prolongada' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración mínima (segundos)
                        </label>
                        <input
                          type="number"
                          value={getUmbralActual(regla, 'duracion_segundos')}
                          onChange={(e) =>
                            handleChangeUmbral(
                              regla.id,
                              'duracion_segundos',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Para pruebas: 10-20s, producción: 1800s (30 min)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Radio de tolerancia (metros)
                        </label>
                        <input
                          type="number"
                          value={getUmbralActual(regla, 'radio_metros')}
                          onChange={(e) =>
                            handleChangeUmbral(
                              regla.id,
                              'radio_metros',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Combustible bajo */}
                  {regla.tipo_alerta === 'combustible_bajo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentaje mínimo (%)
                      </label>
                      <input
                        type="number"
                        value={getUmbralActual(regla, 'porcentaje_minimo')}
                        onChange={(e) =>
                          handleChangeUmbral(
                            regla.id,
                            'porcentaje_minimo',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Configuración de Tolerancia y Debounce */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Anti-Falsos Positivos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Debounce (segundos)
                      </label>
                      <input
                        type="number"
                        value={getConfigActual(regla, 'debounce_segundos')}
                        onChange={(e) =>
                          handleChangeConfig(
                            regla.id,
                            'debounce_segundos',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tiempo mínimo antes de alertar
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tolerancia (%)
                      </label>
                      <input
                        type="number"
                        value={getConfigActual(regla, 'tolerancia_porcentaje')}
                        onChange={(e) =>
                          handleChangeConfig(
                            regla.id,
                            'tolerancia_porcentaje',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Margen de error permitido
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                      </label>
                      <select
                        value={getConfigActual(regla, 'nivel_prioridad')}
                        onChange={(e) =>
                          handleChangeConfig(
                            regla.id,
                            'nivel_prioridad',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                {editado && (
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        setEditando((prev) => {
                          const { [regla.id]: _, ...rest } = prev;
                          return rest;
                        })
                      }
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateUmbrales(regla)}
                      disabled={saving === regla.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving === regla.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">
              💡 Consejos para configurar umbrales:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>
                <strong>Debounce:</strong> Aumenta para evitar alertas por picos
                momentáneos
              </li>
              <li>
                <strong>Tolerancia:</strong> Usa 5-10% para condiciones
                variables (tráfico, GPS)
              </li>
              <li>
                <strong>Duración:</strong> Para pruebas, usa valores bajos
                (3-5s); en producción, valores mayores
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertRulesConfig;
