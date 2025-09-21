import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">FleetManager</h1>
        <p className="text-gray-600 mb-6">
          Sistema de Gestión de Flota Vehicular
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900">Estado del Sistema</h2>
            <p className="text-blue-700">
              ✅ Aplicación funcionando correctamente
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-900">Próximos Pasos</h2>
            <p className="text-green-700">
              🚀 Interfaz moderna lista para implementar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
