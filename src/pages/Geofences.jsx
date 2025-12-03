import React, { useEffect, useState } from 'react';
import { geofenceService } from '../services/geofenceService';
import GeofenceFormModal from '../components/GeofenceFormModal';
import { Plus, MapPin, Trash2, TestTube2 } from 'lucide-react';

export default function Geofences() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando geocercas...');
      const data = await geofenceService.list();
      console.log('✅ Geocercas cargadas:', data);
      setItems(data);
    } catch (e) {
      console.error('❌ Error al cargar geocercas:', e);
      setError(e.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (payload) => {
    await geofenceService.create(payload);
    await load();
  };

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar geocerca?')) return;
    await geofenceService.remove(id);
    await load();
  };

  const onTest = async () => {
    try {
      const vehicleIdStr = prompt('ID de vehículo para evaluar (ej. 1):');
      if (!vehicleIdStr) return;
      const vehicleId = parseInt(vehicleIdStr, 10);
      const lngStr = prompt('Lng posición de prueba (ej. -74.08175):');
      if (!lngStr) return;
      const latStr = prompt('Lat posición de prueba (ej. 4.60971):');
      if (!latStr) return;
      const lng = parseFloat(lngStr);
      const lat = parseFloat(latStr);
      const res = await geofenceService.evaluate({ vehicleId, lng, lat });
      alert(
        `Evaluación ejecutada. Transiciones: ${JSON.stringify(res?.transitions || [])}\nVerifica /alertas para entradas/salidas.`
      );
    } catch (e) {
      alert(`Error al evaluar: ${e.message || e}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6" /> Geocercas
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onTest}
            className="px-3 py-2 rounded border text-gray-700 flex items-center gap-2"
          >
            <TestTube2 className="w-4 h-4" /> Probar evaluación
          </button>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Geocerca
          </button>
        </div>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="p-3">Nombre</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Activo</th>
                <th className="p-3">Actualizado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.nombre}</td>
                  <td className="p-3">{row.tipo}</td>
                  <td className="p-3">{row.activo ? 'Sí' : 'No'}</td>
                  <td className="p-3">
                    {new Date(
                      row.updated_at || row.created_at
                    ).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onDelete(row.id)}
                      className="text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No hay geocercas. Crea la primera.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <GeofenceFormModal onClose={() => setOpen(false)} onSave={onSave} />
      )}
    </div>
  );
}
