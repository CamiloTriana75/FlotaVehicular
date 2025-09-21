import React, { useState } from 'react';
import Card from '../components/Card';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  Activity,
} from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('all');

  const reportTypes = [
    { id: 'all', name: 'Todos los Reportes', icon: BarChart3 },
    { id: 'fuel', name: 'Consumo de Combustible', icon: Activity },
    { id: 'maintenance', name: 'Mantenimiento', icon: FileText },
    { id: 'routes', name: 'Eficiencia de Rutas', icon: TrendingUp },
    { id: 'drivers', name: 'Desempeño de Conductores', icon: PieChart },
  ];

  const periods = [
    { id: '7d', name: 'Últimos 7 días' },
    { id: '30d', name: 'Últimos 30 días' },
    { id: '90d', name: 'Últimos 90 días' },
    { id: '1y', name: 'Último año' },
  ];

  const mockReports = [
    {
      id: 1,
      title: 'Reporte de Consumo de Combustible',
      type: 'fuel',
      period: '30d',
      generated: '2024-01-15T10:30:00Z',
      size: '2.3 MB',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Análisis de Eficiencia de Rutas',
      type: 'routes',
      period: '30d',
      generated: '2024-01-15T09:15:00Z',
      size: '1.8 MB',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Reporte de Mantenimiento Preventivo',
      type: 'maintenance',
      period: '90d',
      generated: '2024-01-14T16:45:00Z',
      size: '3.1 MB',
      status: 'completed',
    },
    {
      id: 4,
      title: 'Desempeño de Conductores',
      type: 'drivers',
      period: '30d',
      generated: '2024-01-14T14:20:00Z',
      size: '1.5 MB',
      status: 'completed',
    },
    {
      id: 5,
      title: 'Reporte de Incidentes',
      type: 'all',
      period: '30d',
      generated: '2024-01-14T11:30:00Z',
      size: '0.9 MB',
      status: 'completed',
    },
  ];

  const kpis = [
    {
      title: 'Reportes Generados',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      title: 'Tiempo Promedio',
      value: '2.3 min',
      change: '-8%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      title: 'Tamaño Promedio',
      value: '1.8 MB',
      change: '+5%',
      changeType: 'negative',
      icon: BarChart3,
    },
    {
      title: 'Tasa de Éxito',
      value: '98.5%',
      change: '+2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ];

  const getReportIcon = (type) => {
    const reportType = reportTypes.find((rt) => rt.id === type);
    return reportType ? reportType.icon : BarChart3;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reportes y Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado del rendimiento de la flota
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar Todo</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-medium ${
                    kpi.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {kpi.change}
                </span>
                <p className="text-xs text-gray-500">vs mes anterior</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtros:
              </span>
            </div>

            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockReports
          .filter(
            (report) =>
              selectedReport === 'all' || report.type === selectedReport
          )
          .map((report) => {
            const Icon = getReportIcon(report.type);
            return (
              <Card
                key={report.id}
                className="p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Generado:{' '}
                        {new Date(report.generated).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Tamaño: {report.size}</span>
                  <span>
                    Período: {periods.find((p) => p.id === report.period)?.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Ver
                  </button>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                Generar Reporte de Eficiencia
              </p>
              <p className="text-sm text-gray-500">Análisis de rendimiento</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                Reporte de Combustible
              </p>
              <p className="text-sm text-gray-500">Consumo y ahorros</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                Dashboard Personalizado
              </p>
              <p className="text-sm text-gray-500">Métricas personalizadas</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
