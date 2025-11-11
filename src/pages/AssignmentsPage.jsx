/**
 * Página de Gestión de Asignaciones de Vehículos a Conductores
 * Historia de Usuario: HU3
 */

import React, { useState, useEffect, useRef } from 'react';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentList from '../components/AssignmentList';
import {
  getAssignments,
  getActiveAssignments,
  getAssignmentStats,
} from '../services/assignmentService';
import { supabase } from '../lib/supabaseClient';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Ref para hacer scroll al formulario
  const formRef = useRef(null);

  // Filtros
  const [filters, setFilters] = useState({
    status: 'all',
    vehicleId: '',
    driverId: '',
    startDate: '',
    endDate: '',
    viewMode: 'all', // all, active, history
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  // Recargar cuando cambian los filtros
  useEffect(() => {
    loadAssignments();
  }, [filters]);

  // Scroll al formulario cuando se abre
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadVehicles(),
        loadDrivers(),
        loadAssignments(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, placa, marca, modelo, status')
        .order('placa');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, cedula, nombre, apellidos, estado, numero_licencia')
        .order('nombre');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      let result;

      if (filters.viewMode === 'active') {
        result = await getActiveAssignments();
      } else {
        const filterParams = {};

        if (filters.status && filters.status !== 'all') {
          filterParams.status = filters.status;
        }

        if (filters.vehicleId) {
          filterParams.vehicleId = filters.vehicleId;
        }

        if (filters.driverId) {
          filterParams.driverId = filters.driverId;
        }

        if (filters.startDate) {
          filterParams.startDate = new Date(filters.startDate);
        }

        if (filters.endDate) {
          filterParams.endDate = new Date(filters.endDate);
        }

        result = await getAssignments(filterParams);
      }

      if (result.error) throw result.error;
      setAssignments(result.data || []);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getAssignmentStats();
      if (result.error) throw result.error;
      setStats(result);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleFormSuccess = (data) => {
    console.log('Asignación guardada:', data);
    setShowForm(false);
    setEditingAssignment(null);
    loadAssignments();
    loadStats();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = () => {
    loadAssignments();
    loadStats();
  };

  const handleUpdate = () => {
    loadAssignments();
    loadStats();
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      vehicleId: '',
      driverId: '',
      startDate: '',
      endDate: '',
      viewMode: 'all',
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== 'all' ||
      filters.vehicleId ||
      filters.driverId ||
      filters.startDate ||
      filters.endDate ||
      filters.viewMode !== 'all'
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Asignaciones de Vehículos
        </h1>
        <p className="text-gray-600">
          Asigna vehículos a conductores con horarios y fechas específicas
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Asignaciones</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-green-700 mb-1">Activas</p>
          <p className="text-3xl font-bold text-green-800">{stats.active}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm text-blue-700 mb-1">Completadas</p>
          <p className="text-3xl font-bold text-blue-800">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm text-red-700 mb-1">Canceladas</p>
          <p className="text-3xl font-bold text-red-800">{stats.cancelled}</p>
        </div>
      </div>

      {/* Botón para nueva asignación */}
      {!showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
          >
            ➕ Nueva Asignación
          </button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div ref={formRef} className="mb-8">
          <AssignmentForm
            assignment={editingAssignment}
            vehicles={vehicles}
            drivers={drivers}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Modo de vista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modo de Vista
            </label>
            <select
              value={filters.viewMode}
              onChange={(e) => handleFilterChange('viewMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="active">Solo Activas</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Vehículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehículo
            </label>
            <select
              value={filters.vehicleId}
              onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los vehículos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                </option>
              ))}
            </select>
          </div>

          {/* Conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductor
            </label>
            <select
              value={filters.driverId}
              onChange={(e) => handleFilterChange('driverId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los conductores</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.nombre} {driver.apellidos}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de asignaciones */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Asignaciones ({assignments.length})
          </h3>
          <button
            onClick={loadAssignments}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
          >
            🔄 Recargar
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
          </div>
        ) : (
          <AssignmentList
            assignments={assignments}
            onUpdate={handleUpdate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
