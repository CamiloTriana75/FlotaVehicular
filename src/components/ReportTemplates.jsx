import React, { useEffect, useState } from 'react';
import { Trash2, Edit2, Copy, Download, Mail } from 'lucide-react';
import {
  getReportTemplates,
  deleteReportTemplate,
  REPORT_TYPES,
} from '../services/reportService';

/**
 * Componente para gestionar templates de reportes guardados
 */
const ReportTemplates = ({ userId, onLoadTemplate, onSchedule }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // =====================================================
  // Cargar templates
  // =====================================================

  useEffect(() => {
    if (!userId) return;
    loadTemplates();
  }, [userId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getReportTemplates(userId);
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando templates:', err);
      setError('Error al cargar los templates');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Acciones
  // =====================================================

  const handleDelete = async (templateId) => {
    if (!window.confirm('¿Eliminar este template?')) return;

    try {
      await deleteReportTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));
    } catch (err) {
      console.error('Error eliminando template:', err);
      setError('Error al eliminar template');
    }
  };

  const handleDuplicate = (template) => {
    // Crear copia del template (sin ID para que sea nuevo)
    const copy = {
      ...template,
      name: `${template.name} (copia)`,
    };
    onLoadTemplate(copy);
  };

  const handleUse = (template) => {
    onLoadTemplate(template);
  };

  // =====================================================
  // Render
  // =====================================================

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Cargando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Mis Templates Guardados
        </h3>
        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
          {templates.length} templates
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">No hay templates guardados aún</p>
          <p className="text-gray-500 text-sm">
            Crea tu primer reporte y guárdalo como template
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => {
            const reportType = REPORT_TYPES[template.report_type];
            return (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {template.name}
                    </h4>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {reportType?.label || template.report_type}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {template.columns?.length || 0} columnas
                      </span>
                      {template.metrics?.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {template.metrics.length} métricas
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUse(template)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded transition"
                      title="Usar este template"
                    >
                      <Download size={18} />
                    </button>

                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-2 hover:bg-purple-100 text-purple-600 rounded transition"
                      title="Duplicar template"
                    >
                      <Copy size={18} />
                    </button>

                    <button
                      onClick={() => onSchedule && onSchedule(template)}
                      className="p-2 hover:bg-orange-100 text-orange-600 rounded transition"
                      title="Programar envío"
                    >
                      <Mail size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportTemplates;
