import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Settings,
  Eye,
  Package,
  Mail,
  Loader,
} from 'lucide-react';
import ReportBuilder from './ReportBuilder';
import ReportTemplates from './ReportTemplates';
import ScheduleReportModal from './ScheduleReportModal';
import {
  executeReport,
  createReportTemplate,
  exportToCSV,
  exportToJSON,
  REPORT_TYPES,
} from '../services/reportService';

/**
 * Componente completo para crear, ejecutar, guardar y programar reportes
 * Este reemplazará la sección de reportes en Reports.jsx
 */
const CustomReportsPanel = ({ userId }) => {
  const [tab, setTab] = useState('builder'); // 'builder', 'templates', 'results'
  const [reportData, setReportData] = useState(null);
  const [loadedTemplate, setLoadedTemplate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // =====================================================
  // Manejar generación de reporte
  // =====================================================

  const handleBuild = async (config) => {
    try {
      setGenerating(true);
      setError(null);

      // Ejecutar reporte
      const data = await executeReport(
        config.reportType,
        config.filters,
        config.columns
      );

      setReportData({
        config,
        data,
        generatedAt: new Date(),
      });

      // Guardar como template si se indica
      if (config.templateName && userId) {
        try {
          await createReportTemplate(userId, {
            name: config.templateName,
            report_type: config.reportType,
            filters: config.filters,
            metrics: config.metrics,
            columns: config.columns,
          });
        } catch (err) {
          console.error('Error guardando template:', err);
        }
      }

      setTab('results');
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError(
        err.message || 'Error al generar el reporte. Intenta nuevamente.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadTemplate = (template) => {
    setLoadedTemplate(template);
    setTab('builder');
  };

  const handleSchedule = (template) => {
    setSelectedTemplate(template);
    setShowScheduleModal(true);
  };

  // =====================================================
  // Exportación
  // =====================================================

  const handleExportCSV = () => {
    if (!reportData?.data) {
      alert('No hay datos para exportar');
      return;
    }

    const filename = `reporte_${reportData.config.reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(reportData.data, filename);
  };

  const handleExportJSON = () => {
    if (!reportData?.data) {
      alert('No hay datos para exportar');
      return;
    }

    const filename = `reporte_${reportData.config.reportType}_${new Date().toISOString().split('T')[0]}.json`;
    exportToJSON(reportData.data, filename);
  };

  // =====================================================
  // Render tab Builder
  // =====================================================

  const renderBuilder = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Constructor de Reportes
        </h2>
        <p className="text-gray-600">
          Crea reportes personalizados con filtros, columnas y métricas
          específicas
        </p>
      </div>

      {loadedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Editando template: <strong>{loadedTemplate.name}</strong>
            <button
              onClick={() => setLoadedTemplate(null)}
              className="text-blue-600 hover:text-blue-800 ml-4"
            >
              Limpiar
            </button>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <ReportBuilder
        onBuild={handleBuild}
        loading={generating}
        initialConfig={loadedTemplate}
      />
    </div>
  );

  // =====================================================
  // Render tab Templates
  // =====================================================

  const renderTemplates = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Templates</h2>
        <p className="text-gray-600">
          Gestiona tus plantillas de reportes guardadas
        </p>
      </div>

      <ReportTemplates
        userId={userId}
        onLoadTemplate={handleLoadTemplate}
        onSchedule={handleSchedule}
      />
    </div>
  );

  // =====================================================
  // Render tab Resultados
  // =====================================================

  const renderResults = () => {
    if (!reportData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">
            Genera un reporte para ver los resultados aquí
          </p>
        </div>
      );
    }

    const { config, data, generatedAt } = reportData;
    const reportType = REPORT_TYPES[config.reportType];

    return (
      <div className="space-y-6">
        {/* Header de resultados */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reporte de {reportType?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                Generado el {generatedAt?.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {data?.length || 0}
            </div>
          </div>

          {/* Información del reporte */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Columnas</p>
              <p className="text-xl font-bold text-blue-600">
                {config.columns.length}
              </p>
            </div>
            {config.metrics.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Métricas</p>
                <p className="text-xl font-bold text-green-600">
                  {config.metrics.length}
                </p>
              </div>
            )}
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Registros</p>
              <p className="text-xl font-bold text-purple-600">
                {data?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} />
            Descargar CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Descargar JSON
          </button>

          <button
            onClick={() => {
              setSelectedTemplate({
                id: Date.now(),
                name: `Reporte ${reportType?.label}`,
                report_type: config.reportType,
                filters: config.filters,
                columns: config.columns,
                metrics: config.metrics,
              });
              setShowScheduleModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <Mail size={18} />
            Programar Envío
          </button>

          <button
            onClick={() => setTab('builder')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <Settings size={18} />
            Editar Reporte
          </button>
        </div>

        {/* Tabla de datos */}
        {data && data.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {config.columns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      {config.columns.map((col) => (
                        <td key={col} className="px-6 py-3 text-gray-900">
                          {typeof row[col] === 'object'
                            ? JSON.stringify(row[col])
                            : String(row[col] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length > 50 && (
              <div className="px-6 py-3 bg-gray-50 text-center text-xs text-gray-600 border-t border-gray-200">
                Mostrando 50 de {data.length} registros
              </div>
            )}
          </div>
        )}

        {(!data || data.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No hay datos para mostrar</p>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // Render principal
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('builder')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            tab === 'builder'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FileText size={20} />
          Constructor
        </button>

        <button
          onClick={() => setTab('templates')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
            tab === 'templates'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Package size={20} />
          Templates
        </button>

        {reportData && (
          <button
            onClick={() => setTab('results')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              tab === 'results'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye size={20} />
            Resultados ({reportData.data?.length || 0})
          </button>
        )}
      </div>

      {/* Contenido */}
      {generating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Generando reporte...</p>
          </div>
        </div>
      )}

      {!generating && (
        <>
          {tab === 'builder' && renderBuilder()}
          {tab === 'templates' && renderTemplates()}
          {tab === 'results' && renderResults()}
        </>
      )}

      {/* Modal de programación */}
      {showScheduleModal && selectedTemplate && (
        <ScheduleReportModal
          isOpen={showScheduleModal}
          template={selectedTemplate}
          userId={userId}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedTemplate(null);
          }}
          onScheduled={() => {
            setShowScheduleModal(false);
            alert('Programación guardada exitosamente');
          }}
        />
      )}
    </div>
  );
};

export default CustomReportsPanel;
