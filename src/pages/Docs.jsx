import React, { useState } from 'react';
import Card from '../components/Card';
import { FileText, Image, Download } from 'lucide-react';

const Docs = () => {
  const [selectedDiagram, setSelectedDiagram] = useState(null);

  const diagramas = [
    {
      id: 1,
      nombre: 'Casos de Uso',
      archivo: 'casos_de_uso.png',
      descripcion: 'Diagrama de casos de uso del sistema de gestión de flota',
      categoria: 'Análisis',
    },
    {
      id: 2,
      nombre: 'Entidad-Relación',
      archivo: 'ER.png',
      descripcion: 'Modelo entidad-relación de la base de datos',
      categoria: 'Base de Datos',
    },
    {
      id: 3,
      nombre: 'Diagrama de Clases',
      archivo: 'clases.png',
      descripcion: 'Diagrama de clases del sistema',
      categoria: 'Diseño',
    },
  ];

  const documentos = [
    {
      id: 1,
      nombre: 'Manual de Usuario',
      tipo: 'PDF',
      descripcion: 'Guía completa para el uso del sistema',
    },
    {
      id: 2,
      nombre: 'Especificaciones Técnicas',
      tipo: 'PDF',
      descripcion: 'Documentación técnica del sistema',
    },
    {
      id: 3,
      nombre: 'Schema de Base de Datos',
      tipo: 'SQL',
      descripcion: 'Script de creación de tablas',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <FileText className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentación</h1>
          <p className="text-gray-600">
            Diagramas y documentos técnicos del proyecto
          </p>
        </div>
      </div>

      {/* Diagramas */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Diagramas Técnicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diagramas.map((diagrama) => (
            <div
              key={diagrama.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <div className="text-center p-4">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-lg font-medium text-gray-700">
                    Placeholder
                  </p>
                  <p className="text-sm text-gray-500">{diagrama.nombre}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {diagrama.nombre}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {diagrama.categoria}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {diagrama.descripcion}
                </p>
                <button
                  onClick={() => setSelectedDiagram(diagrama)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Ver Diagrama
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Documentos */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Documentos</h2>
        <div className="space-y-4">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-gray-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">{doc.nombre}</h3>
                  <p className="text-sm text-gray-600">{doc.descripcion}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {doc.tipo}
                </span>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal para ver diagrama */}
      {selectedDiagram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedDiagram.nombre}
                </h2>
                <button
                  onClick={() => setSelectedDiagram(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <Image className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl font-medium text-gray-700 mb-2">
                    Placeholder
                  </p>
                  <p className="text-gray-500">{selectedDiagram.nombre}</p>
                  <p className="text-sm text-gray-400 mt-4">
                    Reemplazar con imagen real: /docs/diagrams/
                    {selectedDiagram.archivo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Docs;
