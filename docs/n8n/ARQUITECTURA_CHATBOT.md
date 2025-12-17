# 🏗️ Arquitectura del Chatbot Inteligente

Documentación visual de cómo funciona el chatbot internamente.

---

## 📊 Diagrama del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USUARIO/CLIENTE                              │
│              (Envía pregunta vía API/Webhook)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ POST /webhook/chatbot
                             │ {message: "...", history: [...]}
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1️⃣  WEBHOOK (n8n)                                                  │
│  ├─ Recibe POST request                                             │
│  ├─ Path: /chatbot                                                  │
│  ├─ Modo respuesta: Via nodo respondToWebhook                       │
│  └─ Pasa datos al siguiente nodo                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2️⃣  EXTRAER CONTEXTO (Code Node)                                   │
│  ├─ Obtiene: message del usuario                                    │
│  ├─ Obtiene: history de conversación                                │
│  ├─ Extrae: projectContext (embedido)                               │
│  │   └─ Características del proyecto                                │
│  │   └─ Stack tecnológico                                           │
│  │   └─ Épicas y features                                           │
│  │   └─ Roles del sistema                                           │
│  │   └─ Estructura del proyecto                                     │
│  │   └─ Base de datos                                               │
│  └─ Retorna: {userMessage, conversationHistory, projectContext}     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3️⃣  CONSTRUIR PROMPT (Code Node)                                   │
│  ├─ Crea System Prompt:                                             │
│  │   ├─ Contexto completo del proyecto                              │
│  │   ├─ Instrucciones de comportamiento                             │
│  │   └─ Restricciones y guidelines                                  │
│  ├─ Crea User Prompt:                                               │
│  │   ├─ Historial de conversación (si existe)                       │
│  │   └─ Pregunta actual del usuario                                 │
│  └─ Formatea para LLM en JSON                                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4️⃣  LLM (OpenAI o Claude)                                          │
│  ├─ Recibe: [{role: system, content: systemPrompt},                 │
│  │           {role: user, content: userPrompt}]                     │
│  ├─ Parámetros:                                                     │
│  │   ├─ Model: gpt-4-turbo o claude-3-5-sonnet                      │
│  │   ├─ Temperature: 0.7 (balance)                                  │
│  │   └─ MaxTokens: 1000-1024                                        │
│  └─ Retorna: Respuesta generada por IA                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5️⃣  PROCESAR RESPUESTA (Code Node)                                 │
│  ├─ Extrae contenido de la respuesta LLM                            │
│  ├─ Agrega timestamp actual                                         │
│  ├─ Marca como success: true/false                                  │
│  └─ Retorna: {reply, timestamp, success, model}                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6️⃣  RESPONDER (Webhook Response Node)                              │
│  ├─ Formatea respuesta JSON                                         │
│  ├─ Status HTTP 200 OK                                              │
│  └─ Retorna al cliente                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPUESTA AL USUARIO                             │
│  {                                                                  │
│    "reply": "El sistema FlotaVehicular es...",                      │
│    "timestamp": "2025-12-17T10:30:00Z",                             │
│    "success": true,                                                 │
│    "model": "GPT-4 Turbo" o "Claude 3.5 Sonnet"                     │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos Detallado

### Stage 1: Ingesta

```
INPUT:
{
  "message": "¿Cuál es la arquitectura?",
  "history": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "Hola, soy..."}
  ]
}

VALIDACIÓN:
✅ message: string válido
✅ history: array válido
```

### Stage 2: Preparación de Contexto

```
PROJECT_CONTEXT = {
  características: [
    "Dashboard Inteligente",
    "Gestión de Flota",
    "Monitoreo RT",
    ...
  ],
  stack: {
    frontend: ["React 18.3", "TypeScript", "Vite"],
    backend: ["Supabase", "PostgreSQL"],
    otros: ["Google Maps", "GPS"]
  },
  épicas: 10,
  roles: 7,
  base_datos: "Supabase PostgreSQL"
}
```

### Stage 3: Construcción de Prompt

```
SYSTEM_PROMPT = """
Eres un asistente experto sobre FlotaVehicular...
[Contexto completo]
[Instrucciones detalladas]
"""

USER_PROMPT = """
[Historial de conversación previo]
Usuario: ¿Cuál es la arquitectura?
"""
```

### Stage 4: Procesamiento en LLM

```
LLM_INPUT = [{
  "role": "system",
  "content": SYSTEM_PROMPT
}, {
  "role": "user",
  "content": USER_PROMPT
}]

LLM_CONFIG = {
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "max_tokens": 1000
}

LLM_OUTPUT = {
  "choices": [{
    "message": {
      "content": "La arquitectura está basada en Flux Pattern..."
    }
  }]
}
```

### Stage 5: Formato de Respuesta

```
OUTPUT = {
  "reply": "La arquitectura está basada en Flux Pattern...",
  "timestamp": "2025-12-17T10:30:00.000Z",
  "success": true,
  "model": "gpt-4-turbo"
}
```

---

## 🧠 Sistema Inteligente

### Contexto Embedido

El sistema incluye automáticamente en cada prompt:

```
NIVEL 1: Información General
├─ Nombre del proyecto
├─ Descripción
└─ Visión general

NIVEL 2: Características
├─ Dashboard
├─ Gestión de Flota
├─ Monitoreo RT
└─ ... (9 características más)

NIVEL 3: Stack Técnico
├─ React 18.3
├─ TypeScript
├─ Vite
├─ TailwindCSS
├─ Supabase
├─ PostgreSQL
└─ APIs (Google Maps, GPS)

NIVEL 4: Arquitectura
├─ Capas de la aplicación
├─ Flux Pattern
├─ Componentes
├─ Hooks
├─ Store
└─ Servicios

NIVEL 5: Épicas
├─ Gestión de Flota
├─ Gestión de Conductores
├─ Monitoreo RT
├─ Planificación de Rutas
├─ Gestión de Combustible
├─ Mantenimiento Predictivo
├─ Gestión de Incidentes
├─ Reportes
├─ Integraciones
└─ Seguridad

NIVEL 6: Roles
├─ Administrador
├─ Gerente
├─ Supervisor
├─ Planificador
├─ Conductor
├─ Mecánico
└─ RRHH

NIVEL 7: Base de Datos
├─ Supabase
├─ PostgreSQL
├─ 8+ tablas principales
└─ RPC Functions
```

### Inteligencia Conversacional

```
ENTRADA 1: "¿Cuál es la arquitectura?"
CONTEXTO: usuario nuevo
RESPUESTA: Explicación general

ENTRADA 2: "¿Me explicas Flux Pattern?" (con histórico)
CONTEXTO: conversación continua
RESPUESTA: Profundiza en lo anterior

ENTRADA 3: "Dame un ejemplo" (con histórico completo)
CONTEXTO: usuario entiende conceptos
RESPUESTA: Ejemplo práctico del proyecto

← El chatbot aprende y profundiza según el contexto
```

---

## 💾 Almacenamiento de Estado

### En n8n (Ephemeral)

```
EXECUTION_MEMORY = {
  nodeInputs: {
    webhook: $json,
    extraer_contexto: {...},
    construir_prompt: {...}
  },
  nodeOutputs: {
    extraer_contexto: {...},
    construir_prompt: {...},
    openai_llm: {...}
  }
}
```

### En Cliente (Histórico)

```
CLIENT_STORAGE = {
  conversationHistory: [
    {role: "user", content: "..."},
    {role: "assistant", content: "..."},
    {role: "user", content: "..."},
    {role: "assistant", content: "..."}
  ]
}
```

⚠️ **Importante**: Guardar histórico en cliente es responsabilidad de quien consume la API

---

## 🔐 Seguridad y Credenciales

### Jerarquía de Credenciales

```
┌─────────────────────────────┐
│   n8n Credentials Store     │  🔒 Encriptado
│  (OpenAI/Anthropic keys)    │
└────────────────┬────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ LLM Providers  │  🌐 Externo
        │ (OpenAI/Claude)│
        └────────────────┘
```

- ✅ Keys nunca en JSON
- ✅ Keys nunca en git
- ✅ Keys encriptadas en n8n
- ✅ Comunicación HTTPS

---

## 📊 Performance y Optimizaciones

### Tiempo de Respuesta

```
Webhook              ~50ms
├─ Extraer Contexto  ~10ms (Code node)
├─ Construir Prompt  ~20ms (Code node)
├─ OpenAI Request    ~2-5 segundos ⏰ (BOTTLENECK)
│  ├─ Network        ~500ms
│  ├─ LLM Processing ~1500-4000ms
│  └─ Response       ~500ms
├─ Procesar Respuesta ~10ms
└─ Responder         ~10ms

TOTAL: 2-6 segundos (típicamente)
```

### Optimizaciones Posibles

```
1️⃣  Caching
    - Almacenar preguntas frecuentes
    - Respuestas cacheadas: ~50ms

2️⃣  Modelo más rápido
    - Cambiar a GPT-3.5-turbo: ~1-2 seg
    - O Claude-Instant: ~1-2 seg

3️⃣  Contexto menor
    - Reducir maxTokens: 1000 → 500
    - Impacto: ~20% menos lento

4️⃣  Batching
    - Procesar múltiples preguntas juntas
    - Reducir overhead de network
```

---

## 🔄 Manejo de Errores

### Error Handling Flow

```
TRY:
  1. Validar entrada JSON
  2. Conectar a LLM
  3. Procesar respuesta
  4. Formatear salida

CATCH ERROR:
  ├─ API Key inválida
  │  → Mensaje: "Error de credenciales"
  │  → Status: 401
  │
  ├─ Timeout (>30 seg)
  │  → Mensaje: "LLM no respondió"
  │  → Status: 504
  │
  ├─ Formato inválido
  │  → Mensaje: "Solicitud malformada"
  │  → Status: 400
  │
  └─ Error desconocido
     → Mensaje: "Error interno"
     → Status: 500
```

---

## 📈 Escalabilidad

### Capacidad Actual

```
Requests simultáneos: ~10-20 (dependiendo de n8n)
Conversaciones activas: Ilimitadas (sin histórico)
Usuarios concurrentes: 5-10
Requests/día: ~1000-2000 (estimado)
Costo/mes: $5-20 USD (OpenAI) o $1-5 USD (Claude)
```

### Para Escalar

```
🚀 Soluciones:
1. Más instancias de n8n
2. Load balancer (nginx)
3. Caché Redis para respuestas frecuentes
4. Base de datos para historial persistente
5. Message queue (RabbitMQ) para picos

📊 Monitoreo necesario:
- Latencia por nodo
- Uso de tokens
- Tasa de errores
- Costos mensuales
```

---

## 🎯 Casos de Uso

### Caso 1: Pregunta Simple

```
Usuario: "¿Cuál es el stack?"

→ Contextualización: Usuario pregunta sobre tech stack
→ LLM procesa: Acceso a PROJECT_CONTEXT
→ Respuesta: React, TypeScript, Supabase...
→ Tiempo: ~2-3 segundos
```

### Caso 2: Conversación Progresiva

```
M1: "¿Cuál es la arquitectura?"
    → Respuesta general

M2: "¿Qué es Flux Pattern?" (con M1 como contexto)
    → Respuesta con referencia a M1

M3: "¿Dónde está en el código?" (con M1+M2)
    → Respuesta técnica con ubicaciones
```

### Caso 3: Debugging

```
Dev: "¿Por qué el mapa es lento?"

→ LLM analiza:
  - Estructura del código
  - Patrones usados
  - Posibles problemas

→ Respuesta:
  - Causas potenciales
  - Optimizaciones
  - Referencia a código
```

---

## 🔮 Futuras Mejoras

### V3.0 Planeada

```
✨ Features Futuras:
├─ 🔍 Búsqueda en archivos del repo
├─ 💾 Persistencia de históricos
├─ 🎯 Recomendaciones automáticas
├─ 📊 Analytics del uso
├─ 🤖 Multi-LLM (seleccionar mejor)
├─ 🔄 Streaming de respuestas
└─ 🌍 Soporte multi-idioma
```

---

## 📚 Referencias

- [n8n Docs](https://docs.n8n.io)
- [OpenAI API](https://platform.openai.com/docs)
- [Claude API](https://docs.anthropic.com)
- [Flux Pattern](https://redux.js.org/understanding/history-and-design/prior-art)

---

**Última actualización**: 2025-12-17  
**Versión**: 1.0
