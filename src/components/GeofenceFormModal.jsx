import React, { Suspense, useState } from 'react';
const MapGeofencePicker = React.lazy(() => import('./MapGeofencePicker'));

export default function GeofenceFormModal({ onClose, onSave }) {
  const [tipo, setTipo] = useState('circle');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [radio, setRadio] = useState(300);
  const [selectedGeometry, setSelectedGeometry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      let geometry;
      let radio_m = null;
      if (tipo === 'circle') {
        if (!selectedGeometry || selectedGeometry.type !== 'Point') {
          setError('Selecciona el centro del círculo en el mapa');
          setLoading(false);
          return;
        }
        geometry = selectedGeometry;
        radio_m = parseInt(radio, 10);
      } else {
        if (!selectedGeometry || selectedGeometry.type !== 'Polygon') {
          setError('Dibuja un polígono en el mapa y ciérralo');
          setLoading(false);
          return;
        }
        geometry = selectedGeometry;
      }
      await onSave({ nombre, descripcion, tipo, geometry, radio_m: radio_m });
      onClose();
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nueva Geocerca</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="circle">Círculo</option>
                <option value="polygon">Polígono</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            {tipo === 'circle' && (
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Radio (m)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={radio}
                    min={10}
                    onChange={(e) => setRadio(e.target.value)}
                    required
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Clic en el mapa para fijar el centro.
                </div>
              </div>
            )}
            <Suspense
              fallback={
                <div className="w-full h-80 border rounded flex items-center justify-center text-sm text-gray-600">
                  Cargando mapa…
                </div>
              }
            >
              <MapGeofencePicker
                tipo={tipo}
                radius={radio}
                onRadiusChange={setRadio}
                onGeometryChange={setSelectedGeometry}
              />
            </Suspense>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
