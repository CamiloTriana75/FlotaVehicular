import React, { useEffect, useState } from 'react';
import { X, Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import {
  createReportSchedule,
  getReportSchedules,
  updateReportSchedule,
  deleteReportSchedule,
  FREQUENCIES,
  DAYS_OF_WEEK,
} from '../services/reportService';

/**
 * Componente para programar envíos automáticos de reportes por email
 */
const ScheduleReportModal = ({
  isOpen,
  template,
  userId,
  onClose,
  onScheduled,
}) => {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    email_recipients: [],
    newEmail: '',
  });

  // =====================================================
  // Cargar programaciones
  // =====================================================

  useEffect(() => {
    if (isOpen && userId) {
      loadSchedules();
    }
  }, [isOpen, userId]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getReportSchedules(userId);
      // Filtrar solo las programaciones del template actual
      if (template?.id) {
        const filtered = data.filter((s) => s.template_id === template.id);
        setSchedules(filtered);
      } else {
        setSchedules(data);
      }
      setError(null);
    } catch (err) {
      console.error('Error cargando programaciones:', err);
      setError('Error al cargar programaciones');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Handlers de formulario
  // =====================================================

  const handleFrequencyChange = (value) => {
    setFormData({ ...formData, frequency: value });
  };

  const handleAddEmail = () => {
    const email = formData.newEmail.trim();
    if (!email) return;

    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }

    if (formData.email_recipients.includes(email)) {
      setError('Este email ya está agregado');
      return;
    }

    setFormData({
      ...formData,
      email_recipients: [...formData.email_recipients, email],
      newEmail: '',
    });
  };

  const handleRemoveEmail = (email) => {
    setFormData({
      ...formData,
      email_recipients: formData.email_recipients.filter((e) => e !== email),
    });
  };

  const handleSubmit = async () => {
    if (formData.email_recipients.length === 0) {
      setError('Agrega al menos un email');
      return;
    }

    try {
      setLoading(true);

      // Calcular próxima fecha de envío
      const nextDate = calculateNextSendDate(
        formData.frequency,
        formData.day_of_week,
        formData.day_of_month
      );

      const schedule = await createReportSchedule(userId, {
        template_id: template.id,
        email_recipients: formData.email_recipients,
        frequency: formData.frequency,
        day_of_week:
          formData.frequency === 'weekly' ? formData.day_of_week : null,
        day_of_month:
          formData.frequency === 'monthly' ? formData.day_of_month : null,
        next_send_date: nextDate,
        is_active: true,
      });

      setSchedules([...schedules, schedule]);
      setFormData({
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: 1,
        email_recipients: [],
        newEmail: '',
      });
      setShowForm(false);
      setError(null);

      if (onScheduled) onScheduled(schedule);
    } catch (err) {
      console.error('Error creando programación:', err);
      setError('Error al guardar programación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('¿Eliminar esta programación?')) return;

    try {
      await deleteReportSchedule(scheduleId);
      setSchedules(schedules.filter((s) => s.id !== scheduleId));
    } catch (err) {
      console.error('Error eliminando programación:', err);
      setError('Error al eliminar programación');
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      await updateReportSchedule(schedule.id, {
        is_active: !schedule.is_active,
      });
      setSchedules(
        schedules.map((s) =>
          s.id === schedule.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (err) {
      console.error('Error actualizando programación:', err);
    }
  };

  // =====================================================
  // Utilidades
  // =====================================================

  const calculateNextSendDate = (frequency, dayOfWeek, dayOfMonth) => {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        // Calcular próximo día de la semana
        const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(
          Math.min(
            dayOfMonth,
            new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
          )
        );
        break;
    }

    return next.toISOString().split('T')[0];
  };

  const getFrequencyLabel = (schedule) => {
    const freq = FREQUENCIES.find((f) => f.id === schedule.frequency);
    let label = freq?.label || schedule.frequency;

    if (schedule.frequency === 'weekly') {
      const day = DAYS_OF_WEEK.find((d) => d.id === schedule.day_of_week);
      label += ` (${day?.label || 'Sin día'})`;
    } else if (schedule.frequency === 'monthly') {
      label += ` (día ${schedule.day_of_month})`;
    }

    return label;
  };

  // =====================================================
  // Render
  // =====================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Programar Envío de Reporte
            </h2>
            {template && (
              <p className="text-gray-600 mt-1">Template: {template.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Programaciones existentes */}
          {schedules.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Programaciones Activas
              </h3>
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggleActive(schedule)}
                        className={`transition ${
                          schedule.is_active
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      >
                        <CheckCircle size={20} />
                      </button>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getFrequencyLabel(schedule)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Destinatarios: {schedule.email_recipients.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Próximo envío: {schedule.next_send_date}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="mt-3 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
              >
                + Agregar otra programación
              </button>
            </div>
          )}

          {/* Formulario */}
          {showForm && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Nueva Programación
              </h3>

              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCIES.map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => handleFrequencyChange(freq.id)}
                      className={`py-2 px-3 rounded-lg border transition text-sm font-medium ${
                        formData.frequency === freq.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Día específico según frecuencia */}
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día de la Semana
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day_of_week: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día del Mes
                  </label>
                  <select
                    value={formData.day_of_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day_of_month: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Día {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Emails */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinatarios (Emails)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.newEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, newEmail: e.target.value })
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddEmail();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Agregar
                  </button>
                </div>

                {formData.email_recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.email_recipients.map((email) => (
                      <div
                        key={email}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {email}
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:text-blue-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || formData.email_recipients.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Guardando...' : 'Guardar Programación'}
                </button>
              </div>
            </div>
          )}

          {!showForm && schedules.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-700 font-medium"
            >
              + Crear Primera Programación
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleReportModal;
