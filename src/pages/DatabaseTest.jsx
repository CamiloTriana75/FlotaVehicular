/**
 * Página de Prueba de Conexión a Base de Datos
 *
 * Componente para verificar conectividad con Supabase y probar
 * operaciones CRUD básicas.
 */

import { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../lib/supabaseClient';
import { getConductores, getConductoresStats } from '../api/conductores';
import { getVehiculos, getVehiculosStats } from '../api/vehiculos';

export default function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionMessage, setConnectionMessage] = useState(
    'Verificando conexión...'
  );
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [statsC, setStatsC] = useState(null);
  const [statsV, setStatsV] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    setLoading(true);

    // Test 1: Conexión básica
    const connResult = await checkConnection();
    setConnectionStatus(connResult.connected ? 'success' : 'error');
    setConnectionMessage(connResult.message);

    if (!connResult.connected) {
      setLoading(false);
      return;
    }

    // Test 2: Obtener conductores
    const { data: conductoresData, error: errorC } = await getConductores();
    if (!errorC) {
      setConductores(conductoresData || []);
    }

    // Test 3: Obtener vehículos
    const { data: vehiculosData, error: errorV } = await getVehiculos();
    if (!errorV) {
      setVehiculos(vehiculosData || []);
    }

    // Test 4: Estadísticas
    const { data: statsCondData } = await getConductoresStats();
    setStatsC(statsCondData);

    const { data: statsVehData } = await getVehiculosStats();
    setStatsV(statsVehData);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Test de Conexión a Base de Datos
          </h1>
          <p className="text-gray-600">
            Verificación de conectividad con Supabase y operaciones CRUD
          </p>
        </div>

        {/* Estado de Conexión */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Conexión</h2>
          <div className="flex items-center gap-3">
            {connectionStatus === 'checking' && (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">{connectionMessage}</span>
              </>
            )}
            {connectionStatus === 'success' && (
              <>
                <span className="text-green-600 text-2xl">✅</span>
                <span className="text-green-700 font-medium">
                  {connectionMessage}
                </span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <span className="text-red-600 text-2xl">❌</span>
                <div>
                  <p className="text-red-700 font-medium">Error de conexión</p>
                  <p className="text-sm text-red-600">{connectionMessage}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Verifica tu archivo .env y las credenciales de Supabase
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {loading && connectionStatus === 'success' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        )}

        {!loading && connectionStatus === 'success' && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Stats Conductores */}
              {statsC && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    👤 Estadísticas de Conductores
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {statsC.total}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Activos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {statsC.activos}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Disponibles</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {statsC.disponibles}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm text-gray-600">En Servicio</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {statsC.enServicio}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Vehículos */}
              {statsV && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🚗 Estadísticas de Vehículos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {statsV.total}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Activos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {statsV.activos}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Disponibles</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {statsV.disponibles}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Mantenimiento</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {statsV.mantenimiento}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Conductores */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                👥 Conductores ({conductores.length})
              </h2>
              {conductores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cédula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Licencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {conductores.map((conductor) => (
                        <tr key={conductor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {conductor.nombre_completo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {conductor.cedula}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {conductor.licencia}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${conductor.estado === 'activo' ? 'bg-green-100 text-green-800' : ''}
                              ${conductor.estado === 'disponible' ? 'bg-blue-100 text-blue-800' : ''}
                              ${conductor.estado === 'en_servicio' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${conductor.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' : ''}
                            `}
                            >
                              {conductor.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {conductor.email || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay conductores registrados
                </p>
              )}
            </div>

            {/* Lista de Vehículos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                🚗 Vehículos ({vehiculos.length})
              </h2>
              {vehiculos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Placa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marca / Modelo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conductor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kilometraje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vehiculos.map((vehiculo) => (
                        <tr key={vehiculo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {vehiculo.placa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehiculo.marca} {vehiculo.modelo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehiculo.tipo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${vehiculo.estado === 'activo' ? 'bg-green-100 text-green-800' : ''}
                              ${vehiculo.estado === 'disponible' ? 'bg-blue-100 text-blue-800' : ''}
                              ${vehiculo.estado === 'mantenimiento' ? 'bg-orange-100 text-orange-800' : ''}
                              ${vehiculo.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' : ''}
                            `}
                            >
                              {vehiculo.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehiculo.conductor?.nombre_completo || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vehiculo.kilometraje_actual?.toLocaleString() || 0}{' '}
                            km
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay vehículos registrados
                </p>
              )}
            </div>

            {/* Botón de recarga */}
            <div className="mt-6 text-center">
              <button
                onClick={testConnection}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                🔄 Recargar Datos
              </button>
            </div>
          </>
        )}

        {/* Información de configuración */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Si ves datos, la conexión a Supabase funciona correctamente
            </li>
            <li>
              • Los datos de seed se crearon automáticamente con la migración
            </li>
            <li>
              • Puedes probar operaciones CRUD desde la consola del navegador
            </li>
            <li>
              • Revisa{' '}
              <code className="bg-blue-100 px-1 rounded">
                docs/GUIA_CONFIGURACION_BD.md
              </code>{' '}
              para más detalles
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
