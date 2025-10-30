import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import VehicleForm from '../components/VehicleForm';
import { useVehicles } from '../hooks/useVehicles';

export default function NewVehiclePage() {
  const navigate = useNavigate();
  const { addVehicle } = useVehicles();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (vehicleData) => {
    try {
      await addVehicle(vehicleData);

      // Mostrar mensaje de éxito
      setShowSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/vehiculos');
      }, 2000);
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
      // TODO: Mostrar mensaje de error
    }
  };

  const handleCancel = () => {
    navigate('/vehiculos');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/vehiculos')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Registrar Nuevo Vehículo
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Inicio / Vehículos / Nuevo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de Éxito */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">
                ¡Vehículo registrado exitosamente!
              </p>
              <p className="text-green-700 text-sm">
                Redirigiendo a la lista de vehículos...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <VehicleForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
