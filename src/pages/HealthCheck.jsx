import { useState, useEffect } from 'react';
import { checkConnection, isInMockMode } from '../lib/supabaseClient';
import {
  Activity,
  CheckCircle,
  XCircle,
  Database,
  RefreshCw,
} from 'lucide-react';

/**
 * HealthCheck - Página de verificación de conectividad
 *
 * Permite verificar en tiempo real si la aplicación puede comunicarse
 * con Supabase y muestra información de configuración útil para debugging.
 */
export default function HealthCheck() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  const performCheck = async () => {
    setLoading(true);
    try {
      const result = await checkConnection();
      setStatus(result);
      setLastCheck(new Date());
    } catch (error) {
      setStatus({
        connected: false,
        message: `Error inesperado: ${error.message}`,
        mode: 'error',
      });
      setLastCheck(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performCheck();
  }, []);

  const StatusIcon = status?.connected ? CheckCircle : XCircle;
  const statusColor = status?.connected ? 'text-green-500' : 'text-red-500';
  const statusBg = status?.connected ? 'bg-green-50' : 'bg-red-50';
  const statusBorder = status?.connected
    ? 'border-green-200'
    : 'border-red-200';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Estado de Conectividad
            </h1>
          </div>
          <p className="text-gray-600">
            Verificación del estado de conexión con Supabase
          </p>
        </div>

        {/* Status Card */}
        <div
          className={`bg-white rounded-lg shadow-md border-2 ${statusBorder} p-6 mb-6`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-12 h-12 ${statusColor}`} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {status?.connected ? 'Conexión Exitosa' : 'Sin Conexión'}
                </h2>
                <p className={`text-sm mt-1 ${statusColor}`}>
                  {status?.message || 'Verificando...'}
                </p>
              </div>
            </div>
            <button
              onClick={performCheck}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              Verificar
            </button>
          </div>

          {lastCheck && (
            <p className="text-sm text-gray-500">
              Última verificación: {lastCheck.toLocaleString('es-CO')}
            </p>
          )}
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Información de Configuración
          </h3>

          <div className="space-y-3">
            <InfoRow
              label="Modo"
              value={
                isInMockMode() ? '🎭 MOCK (Desarrollo)' : '🌐 REAL (Supabase)'
              }
            />
            <InfoRow
              label="URL Proyecto"
              value={import.meta.env.VITE_SUPABASE_URL || 'No configurada'}
            />
            <InfoRow
              label="Clave Anónima"
              value={
                import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? '✓ Configurada'
                  : '✗ No configurada'
              }
            />
            <InfoRow
              label="Entorno"
              value={import.meta.env.VITE_APP_ENVIRONMENT || 'development'}
            />
            <InfoRow
              label="Modo Debug"
              value={
                import.meta.env.VITE_DEBUG_MODE === 'true'
                  ? 'Activado'
                  : 'Desactivado'
              }
            />
          </div>
        </div>

        {/* Status Details */}
        {status && (
          <div className={`rounded-lg p-6 ${statusBg}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Detalles del Estado
            </h3>
            <div className="bg-white rounded p-4 font-mono text-sm overflow-auto">
              <pre>{JSON.stringify(status, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Solución de Problemas
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Verifica que las variables{' '}
                <code className="bg-blue-100 px-1 rounded">
                  VITE_SUPABASE_URL
                </code>{' '}
                y{' '}
                <code className="bg-blue-100 px-1 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{' '}
                estén configuradas en{' '}
                <code className="bg-blue-100 px-1 rounded">.env</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Si acabas de cambiar el archivo .env, reinicia el servidor de
                desarrollo (
                <code className="bg-blue-100 px-1 rounded">npm run dev</code>)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Asegúrate de que tu proyecto Supabase esté activo y la tabla{' '}
                <code className="bg-blue-100 px-1 rounded">conductor</code>{' '}
                exista
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                Verifica que las políticas RLS (Row Level Security) permitan
                acceso público de lectura si es necesario
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900 font-mono">{value}</span>
    </div>
  );
}
