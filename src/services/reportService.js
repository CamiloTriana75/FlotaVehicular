import { supabase } from '../lib/supabaseClient';

/**
 * Service para gestión de reportes custom
 * Incluye crear, guardar, ejecutar, exportar y programar reportes
 */

// =====================================================
// TEMPLATES - Gestión de plantillas de reportes
// =====================================================

/**
 * Obtener todos los templates del usuario
 */
export const getReportTemplates = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo templates:', err);
    throw err;
  }
};

/**
 * Obtener un template específico
 */
export const getReportTemplate = async (templateId) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo template:', err);
    throw err;
  }
};

/**
 * Crear un nuevo template de reporte
 */
export const createReportTemplate = async (userId, template) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .insert([
        {
          user_id: userId,
          name: template.name,
          description: template.description,
          report_type: template.report_type, // 'drivers', 'vehicles', 'incidents', 'maintenance'
          filters: template.filters || {},
          metrics: template.metrics || [],
          columns: template.columns || [],
          is_default: template.is_default || false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creando template:', err);
    throw err;
  }
};

/**
 * Actualizar un template existente
 */
export const updateReportTemplate = async (templateId, updates) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error actualizando template:', err);
    throw err;
  }
};

/**
 * Eliminar un template
 */
export const deleteReportTemplate = async (templateId) => {
  try {
    const { error } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error eliminando template:', err);
    throw err;
  }
};

// =====================================================
// EJECUCIÓN DE REPORTES - Obtener y procesar datos
// =====================================================

/**
 * Ejecutar reporte y obtener datos
 */
export const executeReport = async (reportType, filters, columns) => {
  try {
    let query = supabase.from(reportType).select('*');

    // Aplicar filtros por fecha
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Aplicar filtros específicos según el tipo de reporte
    switch (reportType) {
      case 'drivers':
        if (filters.status && filters.status !== 'all') {
          query = query.eq('estado', filters.status);
        }
        if (filters.roleFilter) {
          query = query.eq('rol', filters.roleFilter);
        }
        break;

      case 'vehicles':
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.marca) {
          query = query.eq('marca', filters.marca);
        }
        break;

      case 'incidents':
        if (filters.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }
        if (filters.severity && filters.severity !== 'all') {
          query = query.eq('severity', filters.severity);
        }
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        break;

      case 'maintenance_orders':
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }
        break;
    }

    const { data, error } = await query;

    if (error) throw error;

    // Seleccionar solo las columnas requeridas
    if (columns && columns.length > 0) {
      return data.map((row) => {
        const filtered = {};
        columns.forEach((col) => {
          if (col in row) {
            filtered[col] = row[col];
          }
        });
        return filtered;
      });
    }

    return data || [];
  } catch (err) {
    console.error('Error ejecutando reporte:', err);
    throw err;
  }
};

/**
 * Guardar registro de ejecución de reporte
 */
export const saveReportExecution = async (
  scheduleId,
  templateId,
  status,
  recordCount,
  errorMessage = null
) => {
  try {
    const { data, error } = await supabase
      .from('report_executions')
      .insert([
        {
          schedule_id: scheduleId,
          template_id: templateId,
          status,
          record_count: recordCount,
          error_message: errorMessage,
          sent_at: status === 'sent' ? new Date() : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error guardando ejecución:', err);
    throw err;
  }
};

// =====================================================
// EXPORTACIÓN - CSV y PDF
// =====================================================

/**
 * Exportar datos a CSV
 */
export const exportToCSV = (data, filename = 'reporte.csv') => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Obtener headers
  const headers = Object.keys(data[0]);

  // Crear CSV
  let csv = headers.join(',') + '\n';
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Escapar comillas y ajustar para CSV
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csv += values.join(',') + '\n';
  });

  // Crear blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exportar datos a JSON
 */
export const exportToJSON = (data, filename = 'reporte.json') => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// =====================================================
// PROGRAMACIÓN DE ENVÍOS
// =====================================================

/**
 * Crear programación de envío de reporte
 */
export const createReportSchedule = async (userId, schedule) => {
  try {
    const { data, error } = await supabase
      .from('report_schedules')
      .insert([
        {
          user_id: userId,
          template_id: schedule.template_id,
          email_recipients: schedule.email_recipients || [],
          frequency: schedule.frequency, // 'daily', 'weekly', 'monthly'
          day_of_week: schedule.day_of_week || null, // 0-6 para weekly
          day_of_month: schedule.day_of_month || null, // 1-31 para monthly
          next_send_date: schedule.next_send_date,
          is_active: schedule.is_active !== false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creando programación:', err);
    throw err;
  }
};

/**
 * Obtener programaciones del usuario
 */
export const getReportSchedules = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('report_schedules')
      .select(
        `
        *,
        report_templates(id, name, report_type)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo programaciones:', err);
    throw err;
  }
};

/**
 * Actualizar programación
 */
export const updateReportSchedule = async (scheduleId, updates) => {
  try {
    const { data, error } = await supabase
      .from('report_schedules')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error actualizando programación:', err);
    throw err;
  }
};

/**
 * Eliminar programación
 */
export const deleteReportSchedule = async (scheduleId) => {
  try {
    const { error } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error eliminando programación:', err);
    throw err;
  }
};

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Opciones disponibles para cada tipo de reporte
 */
export const REPORT_TYPES = {
  drivers: {
    label: 'Conductores',
    columns: [
      { id: 'cedula', label: 'Cédula' },
      { id: 'nombre', label: 'Nombre' },
      { id: 'apellidos', label: 'Apellidos' },
      { id: 'telefono', label: 'Teléfono' },
      { id: 'email', label: 'Email' },
      { id: 'numero_licencia', label: 'Licencia' },
      { id: 'categoria_licencia', label: 'Categoría' },
      { id: 'fecha_vencimiento_licencia', label: 'Vencimiento Licencia' },
      { id: 'estado', label: 'Estado' },
      { id: 'fecha_ingreso', label: 'Fecha Ingreso' },
    ],
    metrics: [
      { id: 'total_drivers', label: 'Total de Conductores' },
      { id: 'by_status', label: 'Por Estado' },
      { id: 'licenses_expiring', label: 'Licencias a Vencer' },
    ],
  },
  vehicles: {
    label: 'Vehículos',
    columns: [
      { id: 'placa', label: 'Placa' },
      { id: 'marca', label: 'Marca' },
      { id: 'modelo', label: 'Modelo' },
      { id: 'año', label: 'Año' },
      { id: 'status', label: 'Estado' },
      { id: 'kilometraje', label: 'Kilometraje' },
      { id: 'proximo_mantenimiento_km', label: 'Próximo Mtto (km)' },
      { id: 'fecha_ultimo_mantenimiento', label: 'Último Mtto' },
    ],
    metrics: [
      { id: 'total_vehicles', label: 'Total de Vehículos' },
      { id: 'by_status', label: 'Por Estado' },
      { id: 'maintenance_due', label: 'Mantenimiento Vencido' },
      { id: 'avg_mileage', label: 'Kilometraje Promedio' },
    ],
  },
  incidents: {
    label: 'Incidentes',
    columns: [
      { id: 'id', label: 'ID' },
      { id: 'type', label: 'Tipo' },
      { id: 'severity', label: 'Severidad' },
      { id: 'title', label: 'Título' },
      { id: 'status', label: 'Estado' },
      { id: 'occurred_at', label: 'Fecha/Hora' },
      { id: 'location', label: 'Ubicación' },
      { id: 'driver_id', label: 'Conductor ID' },
      { id: 'vehicle_id', label: 'Vehículo ID' },
    ],
    metrics: [
      { id: 'total_incidents', label: 'Total Incidentes' },
      { id: 'by_type', label: 'Por Tipo' },
      { id: 'by_severity', label: 'Por Severidad' },
      { id: 'trend', label: 'Tendencia' },
    ],
  },
  maintenance_orders: {
    label: 'Órdenes de Mantenimiento',
    columns: [
      { id: 'id', label: 'ID' },
      { id: 'order_number', label: 'Número Orden' },
      { id: 'vehicle_id', label: 'Vehículo ID' },
      { id: 'title', label: 'Título' },
      { id: 'type', label: 'Tipo' },
      { id: 'status', label: 'Estado' },
      { id: 'scheduled_date', label: 'Fecha Programada' },
      { id: 'execution_date', label: 'Fecha Ejecución' },
      { id: 'total_cost', label: 'Costo Total' },
    ],
    metrics: [
      { id: 'total_orders', label: 'Total Órdenes' },
      { id: 'by_status', label: 'Por Estado' },
      { id: 'avg_cost', label: 'Costo Promedio' },
      { id: 'overdue', label: 'Vencidas' },
    ],
  },
};

export const FREQUENCIES = [
  { id: 'daily', label: 'Diariamente' },
  { id: 'weekly', label: 'Semanalmente' },
  { id: 'monthly', label: 'Mensualmente' },
];

export const DAYS_OF_WEEK = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
];
