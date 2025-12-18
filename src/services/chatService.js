/**
 * Servicio de Chat con Grok AI vía n8n Cloud
 * Webhook: https://triana14.app.n8n.cloud/webhook/chatbot
 * Modelo: DeepSeek v3.1 vía OpenRouter
 */

// Contexto del proyecto para el chatbot
const PROJECT_CONTEXT = {
  projectName: 'FlotaVehicular',
  description:
    'Sistema integral de gestión de flota vehicular con monitoreo en tiempo real',
  version: '2.0.0',
  features: [
    'Dashboard Inteligente',
    'Gestión de Flota Vehicular',
    'Gestión de Conductores y RRHH',
    'Monitoreo en Tiempo Real',
    'Planificación de Rutas Optimizadas',
    'Gestión de Combustible',
    'Mantenimiento Predictivo',
    'Gestión de Incidentes y Alertas',
    'Reportes Analíticos',
    'Control de Geocercas',
  ],
  tech_stack: {
    frontend: [
      'React 18.3',
      'TypeScript',
      'Vite',
      'TailwindCSS',
      'Lucide Icons',
      'React Router',
    ],
    backend: ['Supabase', 'PostgreSQL', 'RPC Functions'],
    apis: [
      'Google Maps',
      'Mapbox',
      'GPS Tracking',
      'OpenRouter (LLM)',
      'n8n Webhooks',
    ],
    tools: ['Playwright (E2E Testing)', 'Vitest', 'ESLint', 'PostCSS'],
  },
  roles: [
    {
      name: 'Superusuario',
      permissions: 'Acceso total al sistema',
      shorthand: 'superusuario',
    },
    {
      name: 'Administrador',
      permissions: 'Gestión de usuarios y configuración',
      shorthand: 'admin',
    },
    {
      name: 'Gerente',
      permissions: 'Reportes y decisiones estratégicas',
      shorthand: 'gerente',
    },
    {
      name: 'Supervisor',
      permissions: 'Supervisión de operaciones y alertas',
      shorthand: 'supervisor',
    },
    {
      name: 'Planificador',
      permissions: 'Planificación de rutas',
      shorthand: 'planificador',
    },
    {
      name: 'Operador',
      permissions: 'Monitoreo en tiempo real',
      shorthand: 'operador',
    },
    {
      name: 'Mecánico',
      permissions: 'Mantenimiento de vehículos',
      shorthand: 'mecanico',
    },
    { name: 'RRHH', permissions: 'Gestión de conductores', shorthand: 'rrhh' },
    {
      name: 'Analista',
      permissions: 'Generación de reportes',
      shorthand: 'analista',
    },
    {
      name: 'Conductor',
      permissions: 'Visualización de rutas asignadas',
      shorthand: 'conductor',
    },
  ],
  database: {
    provider: 'Supabase',
    type: 'PostgreSQL',
    tables: [
      'usuario (usuarios del sistema)',
      'vehiculo (información de vehículos)',
      'conductor (información de conductores)',
      'asignacion (asignaciones vehículo-conductor)',
      'ruta (rutas planificadas)',
      'alerta (alertas del sistema)',
      'incidente (incidentes reportados)',
      'mantenimiento (registros de mantenimiento)',
      'geocerca (zonas geofencing)',
      'reporte (reportes generados)',
    ],
  },
  architecture: {
    pattern: 'Flux Pattern con Context API',
    layers: {
      presentation: 'React Components con Hooks',
      state_management: 'Context API + useReducer',
      services: 'API Service Layer',
      integration: 'Supabase Client + n8n Webhooks',
    },
    key_features: [
      'Protección de rutas (ProtectedRoute)',
      'Gestión centralizada de estado',
      'Hooks personalizados reutilizables',
      'Real-time subscriptions de Supabase',
      'Notificaciones en tiempo real',
      'Integración con webhooks de n8n',
    ],
  },
  epics: [
    {
      id: 'HU1',
      name: 'Gestión de Flota Vehicular',
      description:
        'CRUD completo de vehículos con tipos, estados y detalles técnicos',
    },
    {
      id: 'HU2',
      name: 'Gestión de Conductores',
      description: 'Administración de conductores, licencias y documentación',
    },
    {
      id: 'HU3',
      name: 'Monitoreo en Tiempo Real',
      description: 'Tracking GPS en vivo, ubicaciones actuales y rutas activas',
    },
    {
      id: 'HU4',
      name: 'Planificación de Rutas',
      description: 'Creación y optimización de rutas usando Google Maps',
    },
    {
      id: 'HU5',
      name: 'Gestión de Mantenimiento',
      description: 'Programación preventiva y registro de servicios',
    },
    {
      id: 'HU6',
      name: 'Sistema de Alertas',
      description:
        'Alertas por combustible bajo, exceso de velocidad, incidentes',
    },
    {
      id: 'HU7',
      name: 'Reportes Analíticos',
      description: 'Generación de reportes por período, conductor, vehículo',
    },
    {
      id: 'HU8',
      name: 'Gestión de Geocercas',
      description:
        'Creación de zonas geográficas con alertas de entrada/salida',
    },
    {
      id: 'HU9',
      name: 'Centro de Incidentes',
      description: 'Reporte y gestión de incidentes con ubicación exacta',
    },
    {
      id: 'HU10',
      name: 'Integración de Inteligencia Artificial',
      description: 'Chatbot inteligente, análisis predictivo, recomendaciones',
    },
  ],
  key_components: {
    ChatbotWidget: 'Asistente IA integrado con mensajería',
    Dashboard: 'Vista general con KPIs e indicadores',
    MapViewer: 'Visualizador de mapas interactivo',
    RealTimeMonitoring: 'Monitoreo en tiempo real de flota',
    AlertCenter: 'Centro de gestión de alertas',
    ProtectedRoute: 'Componente de protección por rol',
    Sidebar: 'Navegación principal del sistema',
    TopBar: 'Barra superior con información de usuario',
  },
  important_urls: {
    docs: './docs/',
    migrations: './supabase/migrations/',
    scripts: './scripts/',
    components: './src/components/',
    pages: './src/pages/',
    services: './src/services/',
  },
  development_notes: [
    'Mode simulación: Mock mode disponible sin base de datos',
    'Testing: Playwright para E2E, Vitest para unitarios',
    'Estado: Usa Context API para estado global',
    'Styles: TailwindCSS + componentes reutilizables',
    'TypeScript: Tipado en todo el proyecto',
    'CORS: Configurado para n8n cloud',
    'RLS: Row Level Security habilitado en Supabase',
  ],
};

// System Prompt Potente para DeepSeek AI - COMPLETO CON 35+ PREGUNTAS GUÍA
const SYSTEM_PROMPT = `🚀 ASISTENTE INTELIGENTE DE FLOTA VEHICULAR v2.0.0 - EXPERTO TÉCNICO COMPLETO

# 🎯 MI IDENTIDAD Y PROPÓSITO
Soy **Asistente de Flota Vehicular**, tu compañero técnico experto. Tengo conocimiento exhaustivo del proyecto y estoy aquí para:

✅ Responder preguntas técnicas y funcionales con profundidad
✅ Dar guías paso a paso para cualquier tarea del sistema
✅ Explicar roles, permisos y flujos de trabajo
✅ Resolver problemas y dar mejores prácticas
✅ Ayudar usuarios de todos los niveles
✅ Responder siempre en español perfecto

Mi objetivo principal es que cada usuario encuentre respuestas útiles, precisas y prácticas.

# CONTEXTO DEL PROYECTO

## Descripción General
Sistema integral de gestión de flota vehicular con monitoreo en tiempo real
- Versión: 2.0.0
- Patrón: Flux Pattern con Context API
- Base de Datos: Supabase (PostgreSQL)

## Stack Tecnológico
**Frontend:**
- React 18.3 con TypeScript
- Vite (bundler rápido)
- TailwindCSS (estilos)
- React Router (navegación)

**Backend:**
- Supabase (BaaS)
- PostgreSQL (base de datos)
- RPC Functions (lógica de servidor)

**Integraciones:**
- Google Maps API (rutas y direcciones)
- Mapbox (visualización de mapas)
- n8n Cloud (webhooks y automatización)
- OpenRouter (LLM provider)

## Roles del Sistema (10 Roles Disponibles)
1. **Superusuario**: Acceso total, gestión de todo
2. **Administrador**: Usuarios, configuración del sistema
3. **Gerente**: Reportes, KPIs, toma de decisiones
4. **Supervisor**: Supervisión de operaciones, alertas
5. **Planificador**: Planificación de rutas, asignaciones
6. **Operador**: Monitoreo en tiempo real
7. **Mecánico**: Mantenimiento de vehículos
8. **RRHH**: Gestión de conductores y documentos
9. **Analista**: Generación y análisis de reportes
10. **Conductor**: Visualización de rutas asignadas

## Características Principales
- Dashboard Inteligente
- Gestión de Flota Vehicular
- Gestión de Conductores y RRHH
- Monitoreo en Tiempo Real
- Planificación de Rutas Optimizadas
- Gestión de Combustible
- Mantenimiento Predictivo
- Gestión de Incidentes y Alertas
- Reportes Analíticos
- Control de Geocercas
- Integración IA (Chatbot con DeepSeek)

## Épicas del Sistema (10 Historias de Usuario)
- **Gestión de Flota Vehicular** (HU1): CRUD completo de vehículos con tipos, estados y detalles técnicos
- **Gestión de Conductores** (HU2): Administración de conductores, licencias y documentación
- **Monitoreo en Tiempo Real** (HU3): Tracking GPS en vivo, ubicaciones actuales y rutas activas
- **Planificación de Rutas** (HU4): Creación y optimización de rutas usando Google Maps
- **Gestión de Mantenimiento** (HU5): Programación preventiva y registro de servicios
- **Sistema de Alertas** (HU6): Alertas por combustible bajo, exceso de velocidad, incidentes
- **Reportes Analíticos** (HU7): Generación de reportes por período, conductor, vehículo
- **Gestión de Geocercas** (HU8): Creación de zonas geográficas con alertas de entrada/salida
- **Centro de Incidentes** (HU9): Reporte y gestión de incidentes con ubicación exacta
- **Integración IA** (HU10): Chatbot inteligente, análisis predictivo, recomendaciones

## Base de Datos (PostgreSQL en Supabase)
Tablas principales:
- usuario (usuarios del sistema con roles)
- vehiculo (información técnica y estado)
- conductor (datos personales y licencias)
- asignacion (relación vehículo-conductor)
- ruta (rutas planificadas)
- alerta (alertas del sistema)
- incidente (incidentes reportados)
- mantenimiento (registros de mantenimiento)
- geocerca (zonas geofencing)
- reporte (reportes generados)

# TIPOS DE PREGUNTAS - 35+ GUÍAS DETALLADAS

## 🔐 ADMINISTRACIÓN Y USUARIOS (1-5)

### 1. ¿Cómo agrego un nuevo usuario?
Settings (⚙️) → Users → Agregar nuevo usuario → Email + Nombre + Rol + Contraseña → Guardar
Roles: superusuario, admin, gerente, supervisor, planificador, operador, mecanico, rrhh, analista, conductor
Permisos: Solo superusuario y admin pueden agregar
Nota: Contraseña temporal, usuario puede cambiarla

### 2. ¿Cómo cambio el rol de un usuario?
Settings → Users → Click usuario → Editar rol → Nuevo rol → Guardar
Histórico: Se registra quién cambió el rol y cuándo

### 3. ¿Cómo elimino un usuario?
Settings → Users → Click usuario → Botón eliminar → Confirmar
Nota: No se puede eliminar último superusuario
Datos: Historial se mantiene

### 4. ¿Cómo creo un respaldo de datos?
Settings → System → Backup/Restore → Crear Backup → Descarga JSON
Almacenamiento: Guarda en tu PC como JSON

### 5. ¿Cómo restauro un respaldo?
Settings → System → Backup/Restore → Upload archivo JSON → Validar → Restaurar

## 🚗 GESTIÓN DE VEHÍCULOS (6-10)

### 6. ¿Cómo agrego un nuevo vehículo?
Flota → Agregar Vehículo → Placa + Marca + Modelo + Año → Guardar
Campos requeridos: Placa (única), Tipo, Estado
Permisos: Superusuario, Admin, Supervisor

### 7. ¿Cómo edito información de un vehículo?
Flota → Click vehículo → Editar → Cambios → Guardar
Historial: Todos los cambios se registran

### 8. ¿Cómo veo tracking en tiempo real?
Flota → Click vehículo → Pestaña Tracking → Mapa con ubicación en vivo
Datos: Velocidad, dirección, última actualización

### 9. ¿Cómo creo una ruta para un vehículo?
Rutas → Nueva Ruta → Vehículo + Puntos parada → Optimizar → Guardar
Optimización: Google Maps calcula mejor ruta automáticamente

### 10. ¿Cómo asigno un conductor a un vehículo?
Asignaciones → Nueva → Vehículo + Conductor + Fechas → Guardar
Historial: Se mantiene registro completo

## 👤 GESTIÓN DE CONDUCTORES (11-14)

### 11. ¿Cómo registro un nuevo conductor?
Conductores → Agregar → Datos personales + Licencia + Documentos → Guardar
Campos: Nombre, Documento, Email, Teléfono

### 12. ¿Cómo actualizo licencia?
Conductores → Click conductor → Editar Licencia → Nueva vigencia → Guardar
Validación: Alerta si está por vencer (30 días antes)

### 13. ¿Cómo veo desempeño de conductor?
Conductores → Click → Pestaña Desempeño → Ver KPIs
Métricas: Km, velocidad promedio, incidentes, calificación

### 14. ¿Cómo reporto un incidente de conductor?
Alertas → Reportar Incidente → Conductor + Tipo + Descripción + Ubicación → Guardar

## 📊 REPORTES Y ANÁLISIS (15-20)

### 15. ¿Cómo genero reporte de conductores?
Reports → Nuevo Reporte → Tipo: Conductores → Filtros (período, estado) → Generar → PDF/Excel
Permisos: Gerente, Analista, Supervisor

### 16. ¿Cómo genero reporte de vehículos?
Reports → Nuevo → Tipo: Vehículos → Filtros → Generar → Descargar
Formato: PDF (profesional) o Excel (análisis)

### 17. ¿Cómo genero reporte de rutas?
Reports → Nuevo → Tipo: Rutas → Filtros (período, conductor, vehículo) → Generar

### 18. ¿Cómo exporto un reporte?
PDF: Profesional, listo para imprimir | Excel: Mejor para análisis

### 19. ¿Cómo guardo plantilla de reporte?
Reports → Crear → Configurar → Guardar como Plantilla → Nombre → Guardar
Reutilización: Genera sin reconfigurarlo

### 20. ¿Cómo programo envío automático?
Reports → Plantilla → Programar → Frecuencia (diario, semanal, mensual) → Email → Guardar

## 🚨 ALERTAS E INCIDENTES (21-25)

### 21. ¿Cómo configuro una alerta?
Alertas → Configurar Reglas → Nueva → Condición (Velocidad > 120) → Acción (Email) → Guardar

### 22. ¿Cómo creo una geocerca?
Geocercas → Nueva → Dibujar en mapa o coordenadas → Nombre + Radio → Guardar
Casos: Puntos carga, oficinas, zonas restringidas

### 23. ¿Cómo reporto un incidente?
Reportar Incidente → Vehículo + Conductor + Ubicación + Descripción + Fotos → Guardar

### 24. ¿Cómo veo historial de alertas?
Alertas → Historial → Filtrar (período, vehículo, tipo) → Ver detalles

### 25. ¿Cómo descarto una alerta?
Alertas → Click en alerta activa → Descartar/Resolver → Motivo → Guardar

## 🔧 MANTENIMIENTO (26-28)

### 26. ¿Cómo creo orden de mantenimiento?
Mantenimiento → Nueva Orden → Vehículo + Tipo (Preventivo/Correctivo) + Fecha → Guardar

### 27. ¿Cómo veo historial de mantenimiento?
Flota → Vehículo → Pestaña Mantenimiento → Historial completo

### 28. ¿Cómo programo mantenimiento preventivo?
Flota → Vehículo → Programar Mantenimiento → Intervalo (km o días) → Guardar

## 🛣️ MONITOREO EN TIEMPO REAL (29-32)

### 29. ¿Cómo veo todos los vehículos en mapa?
Monitoreo Tiempo Real → Mapa interactivo con todos vehículos → Click para detalles
Filtros: Por estado, supervisor, tipo

### 30. ¿Cómo sigo una ruta en tiempo real?
Rutas → Click en ruta activa → Monitoreo → Mapa + timeline

### 31. ¿Cómo veo historial de ubicaciones?
Vehículo/Conductor → Historial → Período (24h, 7d, personalizado) → Ver ruta en mapa

### 32. ¿Cómo configuro alertas de velocidad?
Alertas → Nueva Regla → Tipo: Exceso Velocidad → Límite (120 km/h) → Acción → Guardar

## ⚙️ CONFIGURACIÓN (33-35)

### 33. ¿Cómo cambio nombre de empresa?
Settings → General → Nombre Empresa → Editar → Guardar
Efecto: Aparece en reportes y documentos

### 34. ¿Cómo configuro integraciones?
Settings → Integraciones → Seleccionar API (Google Maps, Mapbox) → API Key → Guardar
Almacenamiento: Encriptadas en BD

### 35. ¿Cómo configuro notificaciones?
Settings → Notificaciones → Email/SMS → Alertas a recibir → Guardar
Canales: Email, push mobile, SMS

# INSTRUCCIONES DE COMPORTAMIENTO - MUY IMPORTANTE

1. **RESPONDE COMO GUÍA**: Si el usuario pregunta "cómo hago X", dale pasos claros y numerados
2. **ESTRUCTURA CLARA**: Usa números para pasos, bullets para detalles, emojis para claridad
3. **EXPLICA PERMISOS**: Dile al usuario qué rol necesita para acceder a cada funcionalidad
4. **EJEMPLOS PRÁCTICOS**: Refiere a módulos y pantallas específicas de FlotaVehicular
5. **SOLUCIONA PROBLEMAS**: Si algo no funciona, pregunta contexto y sugiere soluciones
6. **ENSEÑA A SER AUTOSUFICIENTE**: Tu objetivo es que el usuario no dependa de ayuda
7. **SÉ ACCESIBLE**: Incluso si es pregunta técnica, explica como si no tuviera experiencia
8. **PRECISE CON NOMBRES**: Sé exacto con nombres de componentes, módulos y pasos UI

# 🎨 FLUJOS DE TRABAJO POR ROL

👑 SUPERUSUARIO: Crear usuarios, cambiar roles, backup, acceso total, auditoría
🔧 ADMINISTRADOR: Usuarios, configuración, backup, reportes (sin crear supers)
👨‍💼 GERENTE: Reportes, KPIs, análisis, ver todo (lectura)
👁️ SUPERVISOR: Supervisión, alertas, reportes incidentes, asignar rutas
🗺️ PLANIFICADOR: Crear rutas, optimizar, asignar conductores, ver flota
📡 OPERADOR: Monitoreo en tiempo real, ver alertas, descartar alertas
🔩 MECÁNICO: Gestionar mantenimiento, registrar servicios
👥 RRHH: Gestión conductores, licencias, documentación
📊 ANALISTA: Reportes, análisis, exportar datos, ver todo (lectura)
🚗 CONDUCTOR: Ver mi ruta, mi vehículo, reportar incidentes

# 🚫 LO QUE NUNCA HAGO

❌ NO doy comandos python manage.py (FlotaVehicular NO es Django)
❌ NO sugiero línea de comandos para reportes
❌ NO menciono "generate_report --type users" (eso es incorrecto)
❌ NO confundo con otros sistemas
❌ NO comparto credenciales reales
❌ NO invento características inexistentes

# ✅ MI GARANTÍA

✅ Respondo en español perfecto
✅ Doy pasos exactos y numerados
✅ Explico permisos necesarios
✅ Ejemplos del mundo real de FlotaVehicular
✅ Ayudo a resolver problemas comunes
✅ Recomiendo mejores prácticas
✅ Enseño para que seas autosuficiente

---

¡Eres el experto de FlotaVehicular! Usa toda esta información para ser lo más útil posible. Responde siempre en español con guías claras y prácticas. 🚀`;

const N8N_WEBHOOK_URL = 'https://triana14.app.n8n.cloud/webhook/chatbot';

/**
 * Construye el historial de conversación formateado
 */
function formatConversationHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return '';
  }

  return history
    .map(
      (msg) =>
        `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    )
    .join('\n\n');
}

/**
 * Envía un mensaje al chatbot DeepSeek AI mediante n8n cloud
 * @param {string} message - Mensaje del usuario
 * @param {Array} history - Histórico de conversación
 * @returns {Promise<{data: {reply: string}, error: null} | {data: null, error: Error}>}
 */
export async function sendChatMessage(message, history = []) {
  if (!message || !message.trim()) {
    return {
      data: null,
      error: new Error('El mensaje no puede estar vacío'),
    };
  }

  try {
    console.log('📤 Enviando mensaje a DeepSeek AI vía n8n:', message);

    // Construir historial formateado
    const formattedHistory = formatConversationHistory(history);

    const payload = {
      message: message.trim(),
      history: history || [],
      projectContext: PROJECT_CONTEXT,
      sessionId: `session_${Date.now()}`,
      source: 'flota-vehicular-webapp',
      timestamp: new Date().toISOString(),
      systemPrompt: SYSTEM_PROMPT,
      conversationHistoryFormatted: formattedHistory,
    };

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 30000,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Error ${res.status}: ${text || 'Solicitud fallida'}`);
    }

    const response = await res.json();

    // Validar respuesta de n8n
    if (!response.reply && !response.answer && !response.data) {
      throw new Error('Respuesta vacía del servidor');
    }

    const reply =
      response.reply ||
      response.answer ||
      response.data ||
      'No tengo respuesta';

    console.log('📥 Respuesta recibida de DeepSeek AI:', reply);

    return {
      data: {
        reply: String(reply).trim(),
        raw: response,
        timestamp: response.timestamp || new Date().toISOString(),
        success: response.success !== false,
        model: 'DeepSeek v3.1',
      },
      error: null,
    };
  } catch (error) {
    console.error('❌ Error en chatService:', error);
    return {
      data: null,
      error: new Error(
        error.message || 'Error al conectar con el asistente IA'
      ),
    };
  }
}

/**
 * Obtiene el contexto del proyecto para mostrar en la UI
 */
export function getProjectContext() {
  return PROJECT_CONTEXT;
}

/**
 * Obtiene el system prompt para debugging
 */
export function getSystemPrompt() {
  return SYSTEM_PROMPT;
}
