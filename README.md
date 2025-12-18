# 🚀 FlotaVehicular v2.0.0 - Sistema Integral de Gestión de Flota Vehicular

<div align="center">

![FlotaVehicular](https://img.shields.io/badge/FlotaVehicular-v2.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Sistema completo de gestión de flotas vehiculares con monitoreo en tiempo real, mantenimiento preventivo, rutas optimizadas y análisis inteligente.**

[Documentación Completa](./docs/) • [Casos de Uso](./docs/CASOS_USO_DETALLADOS.md) • [Modelo de BD](./docs/DB_MODELO_FISICO.md) • [Arquitectura](./docs/ARQUITECTURA.md)

</div>

---

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Características Principales](#-características-principales)
- [Arquitectura Técnica](#-arquitectura-técnica)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Guía Rápida de Inicio](#-guía-rápida-de-inicio)
- [Base de Datos](#-base-de-datos)
- [Documentación Técnica](#-documentación-técnica)
- [Testing](#-testing)

---

## 🎯 Visión General

**FlotaVehicular** es una plataforma empresarial de gestión de flota vehicular con 39 tablas PostgreSQL normalizadas, 10 roles con permisos granulares, y 20+ servicios backend integrados.

**Objetivos**:

- ✅ Monitoreo GPS en tiempo real
- ✅ Mantenimiento preventivo automático
- ✅ Control integral de conductores con validación de licencias
- ✅ Sistema de alertas inteligentes (5 tipos)
- ✅ Reportes avanzados con 10+ plantillas
- ✅ Análisis de KPIs por conductor/vehículo
- ✅ Chatbot IA inteligente (n8n + DeepSeek)

---

## ⭐ Características Principales

### 1. 📊 Dashboard Inteligente y Monitoreo Tiempo Real

- Mapa interactivo con GPS de todos los vehículos
- Alertas activas color-coded por prioridad
- KPIs actualizados cada 30 segundos
- Historial de posiciones (últimas 24h)
- Integración Google Maps + Mapbox

### 2. 🚗 Gestión Completa de Flota

- Registro centralizado de vehículos (id, placa, modelo, año, marca)
- Seguimiento de estado (activo/estacionado/mantenimiento/inactivo)
- Asignación dinámica conductor-vehículo
- Control de capacidad y tipo de carga
- Historial de ubicaciones GPS (vehicle_locations)

### 3. 👤 Gestión Integral de Conductores

- Registro con validación (cédula UNIQUE, licencia UNIQUE)
- Validación automática de licencias (renovación, vencimiento)
- KPIs individuales (viajes, km, velocidad promedio, incidentes)
- Comparativas con promedio de flota
- Integración con RRHH para licencias

### 4. 🛣️ Planificación y Optimización de Rutas

- Creación con waypoints y ventanas de tiempo (JSONB)
- Optimización automática MapBox
- Asignación a conductor-vehículo disponibles
- Check-ins automáticos en waypoints
- Historial de rutas (route_assignments)

### 5. ⚠️ Sistema Inteligente de Alertas

- 5 tipos: velocidad_excesiva, parada_prolongada, desvío_ruta, combustible_bajo, mantenimiento_vencido
- Umbrales configurables por alerta (JSONB)
- 4 niveles: baja/media/alta/crítica
- Notificaciones push + email
- Debounce configurable (predeterminado 10 seg)

### 6. 🚨 Incidentes y Centro de Pánico

- Reporte desde móvil con GPS automático
- Clasificación: accidente/falla/robo/multa/otro
- Severidad: leve/moderada/grave/crítica
- Centro de control con ubicación real-time
- Integración con servicios de emergencia

### 7. 🔧 Mantenimiento Preventivo/Correctivo

- Órdenes de trabajo (maintenance_orders)
- Reglas preventivas (cada N km o M meses)
- Alertas automáticas de vencimiento
- Historial detallado (maintenance_history)
- Registro de repuestos (maintenance_parts)
- Adjuntos de documentos (maintenance_attachments)

### 8. 📊 Reportes y Análisis

- 10+ tipos predefinidos
- Plantillas personalizables (report_templates)
- Programación automática (daily/weekly/monthly)
- Exportación PDF/Excel/CSV
- Gráficos interactivos de tendencias

### 9. 📍 Geocercas y Zonas

- Definición de círculos y polígonos (JSONB GeoJSON)
- Eventos automáticos de entrada/salida
- Alertas de desvío de zona
- Historial de movimientos (geofence_events)
- Visualización en mapa


---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```
┌──────────────────────────────────────────────────────────┐
│           FRONTEND (React 18.3 + TypeScript 5.5)         │
│  • 39 páginas componentes                                │
│  • 25+ componentes reutilizables                         │
│  • Context API + useReducer (Flux Pattern)               │
│  • 100+ iconos Lucide                                    │
│  • TailwindCSS 3.4                                       │
│  • Vite 5.4 (build tool)                                 │
└──────────────────────────────────────────────────────────┘
                          ↕
        ┌────────────────────────────────────┐
        │  WebSocket + REST API               │
        │  n8n Workflows + Supabase RPC       │
        └────────────────────────────────────┘
                          ↕
┌──────────────────────────────────────────────────────────┐
│      BACKEND (Supabase - PostgreSQL 15+ + RLS)           │
│  • 39 tablas normalizadas                                │
│  • Row Level Security habilitado                         │
│  • Real-time subscriptions (WebSocket)                   │
│  • Edge Functions (serverless)                           │
│  • Storage para adjuntos                                 │
│  • 10 roles con permisos granulares                      │
│  • 20+ servicios (JavaScript/TypeScript)                 │
│  • Triggers PL/pgSQL para auditoría                      │
└──────────────────────────────────────────────────────────┘
                          ↕
         ┌──────────────────────────────┐
         │  Integraciones Externas      │
         ├──────────────────────────────┤
         │ • Google Maps API            │
         │ • Mapbox API                 │
         │ • n8n Cloud (IA/Workflows)   │
         │ • OpenRouter (DeepSeek v3.1) │
         └──────────────────────────────┘
```

### Patrón Arquitectónico

**Flux Pattern con Context API**:

```
UI Components (React)
        ↓ dispatch(action)
    Reducer (validación + transformación)
        ↓ update state
Global State (Context Provider)
        ↓ subscribe
    Servicios (vehicleService, driverService, etc.)
        ↓ API calls
    Supabase Client
```

---

## ✅ Requisitos Previos

### Software

- **Node.js**: v18+
- **npm**: v9+
- **Git**: v2.30+
- **PostgreSQL**: v12+ (opcional si usas Supabase Cloud)

### Cuentas Externas

- **Supabase**: Proyecto en [supabase.com](https://supabase.com)
- **Google Cloud**: API Key para Google Maps
- **Mapbox**: Token de acceso (opcional)
- **n8n Cloud**: Webhook para chatbot (opcional)
- **OpenRouter**: API Key para IA (opcional)

---

## 🚀 Instalación

### 1. Clonar Repositorio

```bash
git clone https://github.com/tuorganizacion/FlotaVehicular.git
cd FlotaVehicular
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Variables de Entorno

Crear `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx.xxxxx
VITE_GOOGLE_MAPS_KEY=xxxx
VITE_MAPBOX_ACCESS_TOKEN=xxxx
VITE_N8N_WEBHOOK_URL=https://xxxx.app.n8n.cloud/webhook/chatbot
```

### 4. Configurar Base de Datos

```bash
npm run migrate
npm run seed
node scripts/create-admin.js
```

### 5. Iniciar Servidor

```bash
npm run dev
```

Acceder a `http://localhost:5173`

---

## 📘 Guía Rápida

### Demo

- Username: `admin`
- Password: `admin123`
- Rol: Superusuario

### Primeros Pasos

```
1. Settings → Cambiar contraseña
2. Settings → Configurar empresa
3. Vehículos → Agregar vehículos
4. Conductores → Registrar conductores
5. Rutas → Crear rutas
6. Reportes → Generar reportes
```

---

## 👥 Roles del Sistema (10)

| Rol               | Acceso                                |
| ----------------- | ------------------------------------- |
| **Superusuario**  | Total                                 |
| **Administrador** | Usuarios, Config, Backup/Restore      |
| **Gerente**       | Dashboard, Reportes, Análisis         |
| **Supervisor**    | Alertas, Incidentes, Monitoreo, Rutas |
| **Planificador**  | Rutas, Asignaciones, Optimización     |
| **Operador**      | Monitoreo, Alertas, Control real-time |
| **Mecánico**      | Órdenes de trabajo, Mantenimiento     |
| **RRHH**          | Conductores, Licencias, Usuarios      |
| **Analista**      | Reportes, Análisis, Datos             |
| **Conductor**     | Mi ruta, Reportar incidentes          |

---

## 🗄️ Base de Datos

### 39 Tablas Normalizadas

**Usuarios**: `usuario`, `user_profiles`

**Vehículos**: `vehicles`, `vehicle_locations`, `vehicle_assignments`, `vehiculo` (legacy)

**Conductores**: `drivers`, `conductor` (legacy)

**Rutas**: `routes`, `route_assignments`, `route_tracking`, `route_waypoint_checkins`, `route_events`, `ruta` (legacy)

**Alertas**: `alert_rules`, `alerts`, `alert_tracking`

**Incidentes**: `incidents`, `incident_comments`, `incident_notifications`, `incidente` (legacy)

**Mantenimiento**: `maintenance_orders`, `maintenance_rules`, `maintenance_history`, `maintenance_parts`, `maintenance_attachments`, `mantenimiento` (legacy)

**Geocercas**: `geofences`, `geofence_events`, `geofence_state`

**Reportes**: `report_templates`, `report_schedules`, `report_executions`

**Combustible**: `combustible`

### Documentación Completa

Ver [DB_MODELO_FISICO.md](./docs/DB_MODELO_FISICO.md) para:

- Diagrama ER completo
- Descripción detallada de cada tabla
- Relaciones y constraints
- Índices recomendados
- Particionamiento de datos

---

## 📚 Documentación

| Documento                                                 | Descripción       |
| --------------------------------------------------------- | ----------------- |
| [ARQUITECTURA.md](./docs/ARQUITECTURA.md)                 | Diagrama completo |
| [DB_MODELO_FISICO.md](./docs/DB_MODELO_FISICO.md)         | ER + 39 tablas    |
| [CASOS_USO_DETALLADOS.md](./docs/CASOS_USO_DETALLADOS.md) | 18+ CU con flujos |
| [DB_SETUP.md](./docs/DB_SETUP.md)                         | Setup de BD       |
| [GUIA_INICIO_RAPIDO.md](./docs/GUIA_INICIO_RAPIDO.md)     | Quick start       |
| [TESTING-E2E.md](./docs/TESTING-E2E.md)                   | E2E tests         |

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E (Playwright)
npm run test:e2e

# Cobertura
npm run test:coverage
```

---

## 📦 Build

```bash
npm run build
```

Deployment:

- **Vercel**: Auto deploy en push a `main`
- **Netlify**: via `netlify deploy --prod`
- **AWS/Digital Ocean**: Copiar `dist/`

---

## 🐛 Troubleshooting

| Problema                        | Solución                               |
| ------------------------------- | -------------------------------------- |
| "VITE_SUPABASE_URL no definido" | Crear `.env.local` con variables       |
| "No se conecta a BD"            | Verificar URL y ANON_KEY de Supabase   |
| "Error 404 Google Maps"         | Validar VITE_GOOGLE_MAPS_KEY           |
| "WebSocket desconectado"        | Reiniciar servidor, verificar internet |

---

## 📞 Soporte

- **Docs**: [Wiki](./docs/)
- **Issues**: [GitHub Issues](../../issues)
- **Email**: support@flotavehicular.com

---

## 📄 Licencia

MIT License - Ver [LICENSE](./LICENSE)

---

## ✨ Roadmap v3.0

- [ ] Mobile app nativa (React Native)
- [ ] IoT: Sensores de temperatura/presión
- [ ] IA predictiva para mantenimiento
- [ ] Blockchain para auditoría
- [ ] Multi-idioma
- [ ] Carbon footprint dashboard
- [ ] Integración pagos

---

**Última actualización**: Diciembre 2025  
**Versión**: 2.0.0

<div align="center">

Made with ❤️ by FlotaVehicular Team

</div>
