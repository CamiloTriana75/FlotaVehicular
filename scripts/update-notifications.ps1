# Script para mejorar las notificaciones en AlertCenter.jsx
$filePath = "src\pages\AlertCenter.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Buscar y reemplazar la sección de notificación
$oldPattern = @'
      // Mostrar notificación del navegador
      if \('Notification' in window && Notification\.permission === 'granted'\) \{
        const prioridadEmoji = \{
          critica: '🚨',
          alta: '⚠️',
          media: '⚡',
          baja: 'ℹ️',
        \};
        
        const notification = new Notification\(
          `\$\{prioridadEmoji\[nuevaAlerta\.nivel_prioridad\] \|\| '�'\} Nueva Alerta - \$\{nuevaAlerta\.nivel_prioridad\.toUpperCase\(\)\}`,
          \{
            body: nuevaAlerta\.mensaje,
            icon: '/logo\.png',
            badge: '/logo\.png',
            tag: `alert-\$\{nuevaAlerta\.id\}`,
            requireInteraction: nuevaAlerta\.nivel_prioridad === 'critica',
            vibrate: nuevaAlerta\.nivel_prioridad === 'critica' \? \[300, 100, 300, 100, 300\] : \[200, 100, 200\],
            silent: false,
          \}
        \);

        // Auto-cerrar notificaciones no críticas después de 5s
        if \(nuevaAlerta\.nivel_prioridad !== 'critica'\) \{
          setTimeout\(\(\) => notification\.close\(\), 5000\);
        \}

        // Reproducir sonido de alerta \(opcional\)
        try \{
          const audio = new Audio\('/notification\.mp3'\); // Asegúrate de tener este archivo
          audio\.volume = nuevaAlerta\.nivel_prioridad === 'critica' \? 0\.7 : 0\.4;
          audio\.play\(\)\.catch\(\(\) => \{\}\); // Ignorar si el navegador bloquea
        \} catch \(e\) \{\}
      \}
'@

$newPattern = @'
      // Mostrar notificación del navegador con información completa
      if ('Notification' in window && Notification.permission === 'granted') {
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

        // Construir información detallada de la alerta
        const vehiculoInfo = nuevaAlerta.vehicles 
          ? `${nuevaAlerta.vehicles.placa} - ${nuevaAlerta.vehicles.marca} ${nuevaAlerta.vehicles.modelo}`
          : 'Vehículo desconocido';

        const conductorInfo = nuevaAlerta.drivers
          ? `\n👤 Conductor: ${nuevaAlerta.drivers.nombre} ${nuevaAlerta.drivers.apellido}`
          : '';

        const ubicacionInfo = nuevaAlerta.metadata?.ubicacion
          ? `\n📍 Lat ${nuevaAlerta.metadata.ubicacion.lat.toFixed(4)}, Lng ${nuevaAlerta.metadata.ubicacion.lng.toFixed(4)}`
          : '';

        const velocidadInfo = nuevaAlerta.metadata?.velocidad_actual
          ? `\n🏎️ Velocidad: ${nuevaAlerta.metadata.velocidad_actual} km/h`
          : '';

        const duracionInfo = nuevaAlerta.metadata?.duracion_segundos
          ? `\n⏱️ Duración: ${Math.floor(nuevaAlerta.metadata.duracion_segundos / 60)}m ${nuevaAlerta.metadata.duracion_segundos % 60}s`
          : '';

        const fechaHora = new Date(nuevaAlerta.fecha_alerta).toLocaleString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const titulo = `${prioridadEmoji[nuevaAlerta.nivel_prioridad] || '🔔'} ${tipoEmoji[nuevaAlerta.tipo_alerta] || ''} ${nuevaAlerta.tipo_alerta.replace(/_/g, ' ').toUpperCase()}`;
        
        const cuerpo = `🚗 ${vehiculoInfo}${conductorInfo}
📝 ${nuevaAlerta.mensaje}${velocidadInfo}${duracionInfo}${ubicacionInfo}
🕐 ${fechaHora}`;

        const notification = new Notification(titulo, {
          body: cuerpo,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `alert-${nuevaAlerta.id}`,
          requireInteraction: nuevaAlerta.nivel_prioridad === 'critica',
          vibrate: nuevaAlerta.nivel_prioridad === 'critica' 
            ? [300, 100, 300, 100, 300] 
            : nuevaAlerta.nivel_prioridad === 'alta'
            ? [200, 100, 200]
            : [100],
          silent: false,
          data: {
            alertaId: nuevaAlerta.id,
            tipo: nuevaAlerta.tipo_alerta,
            prioridad: nuevaAlerta.nivel_prioridad,
          },
        });

        // Auto-cerrar según prioridad
        if (nuevaAlerta.nivel_prioridad === 'critica') {
          // Críticas requieren interacción manual
        } else if (nuevaAlerta.nivel_prioridad === 'alta') {
          setTimeout(() => notification.close(), 10000); // 10 segundos
        } else {
          setTimeout(() => notification.close(), 5000); // 5 segundos
        }

        // Click en notificación - enfocar ventana
        notification.onclick = function(event) {
          event.preventDefault();
          window.focus();
          notification.close();
        };

        // Reproducir sonido según prioridad
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = {
            critica: 0.8,
            alta: 0.6,
            media: 0.4,
            baja: 0.2,
          }[nuevaAlerta.nivel_prioridad] || 0.4;
          
          audio.play().catch(() => {
            console.log('🔇 Sonido bloqueado por el navegador');
          });
        } catch (e) {
          console.error('Error al reproducir sonido:', e);
        }
      }
'@

$newContent = $content -replace $oldPattern,$newPattern

if ($newContent -ne $content) {
    $newContent | Set-Content $filePath -Encoding UTF8 -NoNewline
    Write-Host "✅ Archivo actualizado exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠️ No se encontró el patrón para reemplazar" -ForegroundColor Yellow
}
