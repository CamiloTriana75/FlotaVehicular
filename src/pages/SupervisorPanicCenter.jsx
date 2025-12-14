/**
 * Página: Centro de Control de Supervisor
 * Dashboard en tiempo real de alertas de pánico
 */

import React from 'react';
import { useAuth } from '../lib/supabaseClient';
import PanicAlertsDashboard from '../components/PanicAlertsDashboard';
import { AlertTriangle, Shield } from 'lucide-react';

export default function SupervisorPanicCenter() {
  const { user } = useAuth();

  // Verificar que el usuario es supervisor
  const isSupervisor = ['supervisor', 'gerente', 'admin'].includes(user?.role);

  if (!isSupervisor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Este panel solo está disponible para supervisores, gerentes y
            administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎛️ Centro de Control
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema de alertas de pánico en tiempo real
            </p>
          </div>
        </div>

        {/* Dashboard de Alertas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <PanicAlertsDashboard />
        </div>

        {/* Información Adicional */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4">
            <h3 className="font-bold text-blue-900 mb-2">
              📋 Responsabilidades
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Monitorear alertas activas</li>
              <li>✓ Responder rápidamente a emergencias</li>
              <li>✓ Comunicarse con conductores</li>
              <li>✓ Registrar acciones tomadas</li>
            </ul>
          </div>
          <div className="bg-green-50 border-l-4 border-green-600 rounded p-4">
            <h3 className="font-bold text-green-900 mb-2">
              ⚡ Acciones Disponibles
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Marcar como "En camino"</li>
              <li>✓ Marcar como "Resuelto"</li>
              <li>✓ Reportar como "Falsa alarma"</li>
              <li>✓ Ver ubicación exacta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
