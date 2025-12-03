/**
 * Servicio Global de Notificaciones
 * Maneja las notificaciones push del navegador para alertas del sistema
 * Funciona independientemente de qué página esté abierta
 */

import { suscribirseAAlertas } from './alertService';

let subscription = null;
let isInitialized = false;

/**
 * Solicitar permisos de notificación al usuario
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Permisos de notificación concedidos');
      // Mostrar notificación de confirmación
      showTestNotification();
      return true;
    }
  }

  return false;
};

/**
 * Mostrar notificación de prueba
 */
const showTestNotification = () => {
  new Notification('✅ Notificaciones Activadas', {
    body: 'Recibirás alertas en tiempo real del sistema de flota',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: 'test-notification',
  });
};

/**
 * Mostrar notificación de alerta con toda la información
 */
const showAlertNotification = async (alerta) => {
  if (Notification.permission !== 'granted') {
    console.log('⚠️ Permisos de notificación no concedidos');
    return;
  }

  const prioridadEmoji = {
    critica: '🚨',
    alta: '⚠️',
    media: '⚡',
    baja: 'ℹ️',
  };

  const tipoEmoji = {
    velocidad_excesiva: '🏎️',
    parada_prolongada: '⏸️',
    combustible_bajo: '⛽',
    mantenimiento_vencido: '🔧',
    licencia_vencida: '📄',
    parada_no_autorizada: '🚫',
    falla_sistema: '⚠️',
  };

  // Si la alerta no tiene info de vehículo (viene de Realtime), buscarla
  let vehiculoInfo = 'Vehículo desconocido';

  if (alerta.vehicles) {
    vehiculoInfo = `${alerta.vehicles.placa} - ${alerta.vehicles.marca} ${alerta.vehicles.modelo}`;
  } else if (alerta.vehicle_id) {
    // Buscar info del vehículo en la BD
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: vehiculo, error } = await supabase
        .from('vehicles')
        .select('placa, marca, modelo')
        .eq('id', alerta.vehicle_id)
        .single();

      if (!error && vehiculo) {
        vehiculoInfo = `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`;
        console.log('✅ Info de vehículo obtenida:', vehiculoInfo);
      }
    } catch (e) {
      console.warn('⚠️ No se pudo obtener info del vehículo:', e);
    }
  }

  const conductorInfo = alerta.drivers
    ? `\n👤 ${alerta.drivers.nombre} ${alerta.drivers.apellido}`
    : '';

  const velocidadInfo = alerta.metadata?.velocidad_actual
    ? `\n🏎️ Velocidad: ${alerta.metadata.velocidad_actual} km/h`
    : '';

  const duracionInfo = alerta.metadata?.duracion_segundos
    ? `\n⏱️ Duración: ${Math.floor(alerta.metadata.duracion_segundos / 60)}m ${alerta.metadata.duracion_segundos % 60}s`
    : '';

  const ubicacionInfo = alerta.metadata?.ubicacion
    ? `\n📍 Lat ${alerta.metadata.ubicacion.lat.toFixed(4)}, Lng ${alerta.metadata.ubicacion.lng.toFixed(4)}`
    : '';

  const fechaHora = new Date(alerta.fecha_alerta).toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const titulo = `${prioridadEmoji[alerta.nivel_prioridad] || '🔔'} ${tipoEmoji[alerta.tipo_alerta] || ''} ${alerta.tipo_alerta.replace(/_/g, ' ').toUpperCase()}`;

  const cuerpo = `🚗 ${vehiculoInfo}${conductorInfo}
📝 ${alerta.mensaje}${velocidadInfo}${duracionInfo}${ubicacionInfo}
🕐 ${fechaHora}`;

  console.log('🔔 Mostrando notificación:', { titulo, alerta });

  const notification = new Notification(titulo, {
    body: cuerpo,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `alert-${alerta.id}`,
    requireInteraction: alerta.nivel_prioridad === 'critica',
    vibrate:
      alerta.nivel_prioridad === 'critica'
        ? [300, 100, 300, 100, 300]
        : alerta.nivel_prioridad === 'alta'
          ? [200, 100, 200]
          : [100],
    silent: false,
    data: {
      alertaId: alerta.id,
      tipo: alerta.tipo_alerta,
      prioridad: alerta.nivel_prioridad,
      vehiculoId: alerta.vehiculo_id,
      timestamp: alerta.fecha_alerta,
    },
  });

  // Auto-cerrar según prioridad
  if (alerta.nivel_prioridad === 'critica') {
    // Críticas requieren interacción manual
  } else if (alerta.nivel_prioridad === 'alta') {
    setTimeout(() => notification.close(), 10000); // 10 segundos
  } else {
    setTimeout(() => notification.close(), 5000); // 5 segundos
  }

  // Click en notificación - enfocar ventana y navegar a alertas
  notification.onclick = function (event) {
    event.preventDefault();
    window.focus();

    // Intentar navegar a la página de alertas
    if (window.location.pathname !== '/alertas') {
      window.location.href = '/alertas';
    }

    notification.close();
  };

  // Reproducir sonido según prioridad
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume =
      {
        critica: 0.8,
        alta: 0.6,
        media: 0.4,
        baja: 0.2,
      }[alerta.nivel_prioridad] || 0.4;

    audio.play().catch(() => {
      console.log('🔇 Sonido bloqueado por el navegador');
    });
  } catch (e) {
    console.error('Error al reproducir sonido:', e);
  }
};

/**
 * Inicializar el servicio de notificaciones globales
 */
export const initializeNotifications = async () => {
  if (isInitialized) {
    console.log('⚠️ Notificaciones ya inicializadas');
    return;
  }

  console.log('🔔 Inicializando servicio de notificaciones globales...');

  // Solicitar permisos
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('⚠️ No se concedieron permisos de notificación');
    return;
  }

  // Suscribirse a nuevas alertas
  subscription = suscribirseAAlertas(async (nuevaAlerta) => {
    console.log('🚨 Nueva alerta recibida:', nuevaAlerta);
    await showAlertNotification(nuevaAlerta);
  });

  isInitialized = true;
  console.log('✅ Servicio de notificaciones globales activo');
};

/**
 * Detener el servicio de notificaciones
 */
export const stopNotifications = () => {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
    isInitialized = false;
    console.log('🔕 Servicio de notificaciones detenido');
  }
};

/**
 * Verificar si las notificaciones están habilitadas
 */
export const areNotificationsEnabled = () => {
  return isInitialized && Notification.permission === 'granted';
};

export default {
  initializeNotifications,
  stopNotifications,
  requestNotificationPermission,
  areNotificationsEnabled,
};
