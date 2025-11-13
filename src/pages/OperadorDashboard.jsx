import React from 'react';
import { MapPin, Activity, Eye, Navigation } from 'lucide-react';
import RealTimeMonitoring from './RealTimeMonitoring';

const OperadorDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Panel de Operador</h1>
              <p className="text-blue-100 mt-1">
                Monitoreo en tiempo real de la flota vehicular
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Monitoreo Activo</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Función Principal
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                Monitoreo GPS
              </p>
            </div>
            <MapPin className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Visualiza la ubicación en tiempo real de todos los vehículos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Acceso</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                Solo Lectura
              </p>
            </div>
            <Eye className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Puedes ver pero no editar información de vehículos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tracking</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                Tiempo Real
              </p>
            </div>
            <Navigation className="w-10 h-10 text-indigo-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Actualizaciones automáticas cada segundo
          </p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 mb-2">
              📍 Instrucciones de Monitoreo:
            </p>
            <ul className="text-blue-700 space-y-1">
              <li>
                • <strong>Mapa Interactivo:</strong> Haz clic en los marcadores
                para ver detalles del vehículo
              </li>
              <li>
                • <strong>Actualización Automática:</strong> El mapa se
                actualiza en tiempo real sin necesidad de recargar
              </li>
              <li>
                • <strong>Filtros:</strong> Usa los filtros para ver solo
                vehículos activos o específicos
              </li>
              <li>
                • <strong>Estilos de Mapa:</strong> Cambia entre vista de
                calles, satélite o modo oscuro
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mapa de Monitoreo en Tiempo Real */}
      <div className="bg-white rounded-lg shadow-lg">
        <RealTimeMonitoring />
      </div>
    </div>
  );
};

export default OperadorDashboard;
