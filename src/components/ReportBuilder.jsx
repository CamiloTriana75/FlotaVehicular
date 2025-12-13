import React, { useState } from 'react';
import { X, Plus, Eye } from 'lucide-react';
import { REPORT_TYPES } from '../services/reportService';

/**
 * Componente para construir reportes custom
 * Permite seleccionar tipo, filtros, métricas y columnas
 */
const ReportBuilder = ({ onBuild, loading = false }) => {
  const [step, setStep] = useState(1); // 1: tipo, 2: filtros, 3: columnas, 4: preview
  const [reportConfig, setReportConfig] = useState({
    reportType: 'drivers',
    filters: {
      startDate: '',
      endDate: '',
      status: 'all',
    },
    columns: [],
    metrics: [],
  });
  const [previewData, setPreviewData] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const reportType = REPORT_TYPES[reportConfig.reportType];

  // =====================================================
  // Handlers de cambio
  // =====================================================

  const handleReportTypeChange = (type) => {
    setReportConfig({
      ...reportConfig,
      reportType: type,
      columns: [],
      metrics: [],
    });
  };

  const handleFilterChange = (key, value) => {
    setReportConfig({
      ...reportConfig,
      filters: {
        ...reportConfig.filters,
        [key]: value,
      },
    });
  };

  const toggleColumn = (columnId) => {
    const newColumns = reportConfig.columns.includes(columnId)
      ? reportConfig.columns.filter((c) => c !== columnId)
      : [...reportConfig.columns, columnId];

    setReportConfig({
      ...reportConfig,
      columns: newColumns,
    });
  };

  const toggleMetric = (metricId) => {
    const newMetrics = reportConfig.metrics.includes(metricId)
      ? reportConfig.metrics.filter((m) => m !== metricId)
      : [...reportConfig.metrics, metricId];

    setReportConfig({
      ...reportConfig,
      metrics: newMetrics,
    });
  };

  const handleBuild = async () => {
    if (
      reportConfig.columns.length === 0 &&
      reportConfig.metrics.length === 0
    ) {
      alert('Selecciona al menos una columna o métrica');
      return;
    }

    // Validar fechas si están llenas
    if (reportConfig.filters.startDate && reportConfig.filters.endDate) {
      if (
        new Date(reportConfig.filters.startDate) >
        new Date(reportConfig.filters.endDate)
      ) {
        alert('La fecha inicial no puede ser mayor a la final');
        return;
      }
    }

    // Llamar al callback con la configuración
    onBuild({
      ...reportConfig,
      templateName: showSaveTemplate ? templateName : null,
    });
  };

  // =====================================================
  // Render por pasos
  // =====================================================

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Paso 1: Selecciona el tipo de reporte
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(REPORT_TYPES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handleReportTypeChange(key)}
            className={`p-4 rounded-lg border-2 transition ${
              reportConfig.reportType === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold text-sm">{config.label}</div>
            <div className="text-xs text-gray-600 mt-1">
              {config.columns.length} columnas disponibles
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Paso 2: Configura los filtros
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicial
          </label>
          <input
            type="date"
            value={reportConfig.filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Final
          </label>
          <input
            type="date"
            value={reportConfig.filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {reportConfig.reportType === 'drivers' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={reportConfig.filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="disponible">Disponible</option>
            <option value="en_servicio">En Servicio</option>
          </select>
        </div>
      )}

      {reportConfig.reportType === 'incidents' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={reportConfig.filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="accidente">Accidente</option>
              <option value="falla_mecanica">Falla Mecánica</option>
              <option value="velocidad_excesiva">Velocidad Excesiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severidad
            </label>
            <select
              value={reportConfig.filters.severity || 'all'}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </>
      )}

      {reportConfig.reportType === 'maintenance_orders' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={reportConfig.filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="programada">Programada</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 3: Selecciona columnas
        </h3>
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {reportType.columns.map((column) => (
            <label
              key={column.id}
              className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={reportConfig.columns.includes(column.id)}
                onChange={() => toggleColumn(column.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{column.label}</span>
            </label>
          ))}
        </div>
      </div>

      {reportType.metrics && reportType.metrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Paso 3b: Métricas (opcional)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {reportType.metrics.map((metric) => (
              <label
                key={metric.id}
                className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={reportConfig.metrics.includes(metric.id)}
                  onChange={() => toggleMetric(metric.id)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {metric.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Paso 4: Resumen y guardar como template
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm">
          <strong>Tipo:</strong> {reportType.label}
        </p>
        <p className="text-sm">
          <strong>Columnas:</strong> {reportConfig.columns.length} seleccionadas
        </p>
        <p className="text-sm">
          <strong>Métricas:</strong> {reportConfig.metrics.length} seleccionadas
        </p>
        {reportConfig.filters.startDate && (
          <p className="text-sm">
            <strong>Periodo:</strong> {reportConfig.filters.startDate} a{' '}
            {reportConfig.filters.endDate}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={showSaveTemplate}
            onChange={(e) => setShowSaveTemplate(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Guardar como template
          </span>
        </label>

        {showSaveTemplate && (
          <input
            type="text"
            placeholder="Nombre del template (ej: Consumo Q1)"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        )}
      </div>
    </div>
  );

  // =====================================================
  // Render principal
  // =====================================================

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              disabled={
                s > 1 &&
                reportConfig.columns.length === 0 &&
                reportConfig.metrics.length === 0
              }
              className={`flex items-center justify-center w-8 h-8 rounded-full transition ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {step > s ? '✓' : s}
            </button>
          ))}
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="mb-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Atrás
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 3 &&
                reportConfig.columns.length === 0 &&
                reportConfig.metrics.length === 0) ||
              loading
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleBuild}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportBuilder;
