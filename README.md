# 🚗 FleetManager - Sistema de Gestión de Flota Vehicular

Sistema integral para la gestión, monitoreo y optimización de flota vehicular con tracking en tiempo real, planificación de rutas, control de combustible y mantenimiento predictivo.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estrategia de Branching](#-estrategia-de-branching)
- [Documentación Adicional](#-documentación-adicional)
- [Base de Datos](#-base-de-datos)
- [Testing](#-testing)
- [Contribución](#-contribución)

## ✨ Características

### 🎯 Funcionalidades Principales

- **Dashboard Inteligente** - KPIs y métricas en tiempo real
- **Gestión de Flota** - Control completo de vehículos
- **Gestión de Conductores** - Administración de personal
- **Monitoreo en Tiempo Real** - Tracking GPS con mapas interactivos
- **Planificación de Rutas** - Optimización automática de rutas
- **Control de Combustible** - Monitoreo y análisis de consumo
- **Mantenimiento Predictivo** - Alertas y programación automática
- **Sistema de Alertas** - Notificaciones inteligentes
- **Reportes y Analytics** - Análisis detallado de rendimiento
- **Configuración Avanzada** - Roles, permisos y personalización

### 🚀 Funcionalidades Técnicas

- **Interfaz Responsive** - Compatible con móviles y desktop
- **Modo Demo** - Funcionamiento sin base de datos
- **Autenticación** - Sistema de login seguro
- **Tiempo Real** - Actualizaciones automáticas
- **Exportación** - Reportes en PDF y Excel
- **Integraciones** - APIs de mapas y servicios externos

## 🏗️ Arquitectura

### Arquitectura Unidireccional (Flux Pattern)

El proyecto implementa una **arquitectura unidireccional de flujo de datos** inspirada en Flux/Redux, garantizando un flujo predecible y mantenible:

```
┌─────────────┐
│   Action    │  ← Usuario interactúa
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dispatch   │  ← Despacha acción al reducer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Reducer   │  ← Actualiza el estado inmutablemente
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Store    │  ← Estado global centralizado
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    View     │  ← UI se actualiza reactivamente
└─────────────┘
```

### Principios de Diseño

- **Flujo Unidireccional**: Los datos fluyen en una sola dirección, haciendo el estado predecible
- **Single Source of Truth**: Estado centralizado en el Store
- **Inmutabilidad**: El estado nunca se modifica directamente
- **Separación de Responsabilidades**: Lógica de negocio separada de la UI
- **Arquitectura Limpia**: Organización por capas (Core, Infrastructure, Presentation)

### Capas de la Aplicación

```
src/
├── core/           # 🎯 Lógica de negocio
│   ├── entities/   # Entidades del dominio
│   └── use-cases/  # Casos de uso
│
├── store/          # 🗄️ Estado global (Flux pattern)
│   ├── actions/    # Action creators
│   ├── reducers/   # Reducers puros
│   ├── context/    # React Context
│   └── types.js    # Action types
│
├── hooks/          # 🪝 Custom hooks para lógica reutilizable
│
├── components/     # 🧩 Componentes de presentación
│
├── pages/          # 📄 Páginas/Vistas
│
└── shared/         # 🔧 Utilidades compartidas
    ├── constants/  # Constantes de la app
    └── utils/      # Funciones de utilidad
```

## 🛠️ Tecnologías

### Frontend

- **React 18** - Biblioteca de UI con Hooks
- **TypeScript** - Tipado estático para mayor seguridad
- **Vite** - Build tool de nueva generación
- **Tailwind CSS** - Framework de estilos utility-first
- **React Router** - Enrutamiento declarativo
- **Leaflet** - Mapas interactivos
- **Lucide React** - Iconografía moderna

### Estado Global

- **React Context API** - Gestión de estado compartido
- **useReducer** - Lógica de estado compleja
- **Custom Hooks** - Lógica reutilizable encapsulada

### Backend & Base de Datos

- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security** - Seguridad a nivel de fila

### Herramientas de Desarrollo

- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Vitest** - Framework de testing
- **Git** - Control de versiones
- **GitHub** - Repositorio y CI/CD
- **Commitlint** - Validación de commits

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- npm 9+ o yarn 1.22+
- Git 2.30+
- Cuenta de Supabase

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/FlotaVehicular-1.git
cd FlotaVehicular-1
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

4. **Configurar Supabase** (Opcional para modo demo)

```bash
# Editar .env.local con tus credenciales de Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

5. **Ejecutar en modo desarrollo**

```bash
npm run dev
```

6. **Abrir en el navegador**

```
http://localhost:5173
```

## 📁 Estructura del Proyecto

### Organización por Capas (Clean Architecture)

```
FlotaVehicular/
├── 📁 docs/                           # 📚 Documentación del proyecto
│   ├── 📁 diagrams/                   # Diagramas UML y técnicos
│   ├── 📄 ARCHITECTURE.md             # Arquitectura detallada
│   ├── 📄 CONTRIBUTING.md             # Guía de contribución
│   ├── 📄 CODE_STYLE.md              # Convenciones de código
│   ├── 📄 DEPLOYMENT.md              # Guía de despliegue
│   └── 📄 DEVELOPMENT.md             # Guía de desarrollo
│
├── 📁 src/                           # 💻 Código fuente
│   │
│   ├── 📁 core/                      # 🎯 Capa de dominio (lógica de negocio)
│   │   ├── 📁 entities/              # Entidades del negocio
│   │   │   ├── Vehicle.js            # Entidad Vehículo
│   │   │   ├── Driver.js             # Entidad Conductor
│   │   │   └── index.js              # Exports
│   │   │
│   │   └── 📁 use-cases/             # Casos de uso
│   │       ├── manageVehicles.js     # Lógica de vehículos
│   │       └── manageDrivers.js      # Lógica de conductores
│   │
│   ├── 📁 store/                     # 🗄️ Estado global (Flux pattern)
│   │   ├── 📁 actions/               # Action creators
│   │   │   ├── authActions.js
│   │   │   ├── vehicleActions.js
│   │   │   └── driverActions.js
│   │   │
│   │   ├── 📁 reducers/              # Reducers puros
│   │   │   ├── authReducer.js
│   │   │   ├── vehicleReducer.js
│   │   │   ├── driverReducer.js
│   │   │   └── index.js              # Root reducer
│   │   │
│   │   ├── 📁 context/               # React Context
│   │   │   └── AppContext.jsx        # Contexto global
│   │   │
│   │   ├── types.js                  # Action types
│   │   └── index.js                  # Exports del store
│   │
│   ├── 📁 hooks/                     # 🪝 Custom hooks
│   │   ├── useAuth.js                # Hook de autenticación
│   │   ├── useVehicles.js            # Hook de vehículos
│   │   ├── useDrivers.js             # Hook de conductores
│   │   └── index.js                  # Exports
│   │
│   ├── 📁 components/                # 🧩 Componentes de UI
│   │   ├── Card.jsx                  # Tarjetas informativas
│   │   ├── Table.jsx                 # Tablas de datos
│   │   ├── MapViewer.jsx             # Visor de mapas
│   │   ├── Sidebar.jsx               # Barra lateral
│   │   ├── TopBar.jsx                # Barra superior
│   │   └── VehicleForm.jsx           # Formulario de vehículos
│   │
│   ├── 📁 pages/                     # 📄 Páginas/Vistas
│   │   ├── Dashboard.jsx             # Dashboard principal
│   │   ├── VehiclesList.jsx          # Lista de vehículos
│   │   ├── VehicleDetail.jsx         # Detalle de vehículo
│   │   ├── DriversList.jsx           # Lista de conductores
│   │   ├── Maintenance.jsx           # Mantenimiento
│   │   ├── Routes.jsx                # Rutas
│   │   ├── Alerts.jsx                # Alertas
│   │   ├── Reports.jsx               # Reportes
│   │   ├── Settings.jsx              # Configuración
│   │   └── LoginPage.jsx             # Página de login
│   │
│   ├── 📁 shared/                    # 🔧 Recursos compartidos
│   │   ├── 📁 constants/             # Constantes de la app
│   │   │   └── index.js              # Estados, tipos, rutas
│   │   │
│   │   ├── 📁 utils/                 # Utilidades
│   │   │   └── index.js              # Funciones helper
│   │   │
│   │   └── 📁 types/                 # Tipos TypeScript
│   │       └── database.ts           # Tipos de BD
│   │
│   ├── 📁 data/                      # 📊 Datos mock
│   │   └── mockVehicles.js           # Datos de prueba
│   │
│   ├── 📁 lib/                       # 📚 Configuración
│   │   └── supabaseClient.js         # Cliente de Supabase
│   │
│   ├── App.jsx                       # Componente principal
│   ├── main.tsx                      # Punto de entrada
│   └── index.css                     # Estilos globales
│
├── 📁 supabase/                      # 🗄️ Backend
│   ├── 📁 migrations/                # Migraciones de BD
│   └── config.toml                   # Configuración
│
├── 📁 tests/                         # 🧪 Tests
│   ├── components.test.jsx           # Tests de componentes
│   └── utils.test.js                 # Tests de utilidades
│
├── 📄 package.json                   # Dependencias y scripts
├── 📄 vite.config.ts                 # Configuración de Vite
├── 📄 vitest.config.js               # Configuración de tests
├── 📄 tailwind.config.js             # Configuración de Tailwind
├── 📄 tsconfig.json                  # Configuración de TypeScript
├── 📄 eslint.config.js               # Configuración de ESLint
├── 📄 commitlint.config.cjs          # Configuración de commits
├── 📄 .env.example                   # Variables de entorno
└── 📄 README.md                      # Este archivo
```

### 📦 Módulos Principales

#### **Store (Estado Global)**
Implementación del patrón Flux con React Context + useReducer:
- **Actions**: Definen qué ocurrió
- **Reducers**: Especifican cómo cambia el estado
- **Context**: Provee el estado a toda la app

#### **Hooks Personalizados**
Encapsulan lógica reutilizable:
- `useAuth()` - Manejo de autenticación
- `useVehicles()` - CRUD de vehículos
- `useDrivers()` - CRUD de conductores

#### **Core (Dominio)**
Lógica de negocio independiente del framework:
- Entidades del dominio
- Casos de uso
- Reglas de negocio

## 🚀 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo con hot-reload
npm run dev

# Construir para producción
npm run build

# Vista previa de la build de producción
npm run preview
```

### Calidad de Código

```bash
# Ejecutar linter (detectar problemas)
npm run lint

# Ejecutar linter y corregir automáticamente
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato sin modificar
npm run format:check

# Verificar tipos de TypeScript
npm run type-check
```

### Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con interfaz visual
npm run test:ui

# Tests con cobertura de código
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch
```

### Base de Datos

```bash
# Resetear base de datos (desarrollo)
npm run db:reset

# Aplicar migraciones
npm run db:push

# Obtener esquema de producción
npm run db:pull

# Poblar con datos de prueba
npm run db:seed

# Generar tipos TypeScript desde BD
npm run db:types
```

### Git & Versionado

```bash
# Commitear con formato convencional
npm run commit

# Crear nueva versión (changelog automático)
npm run release
```

## 🌿 Estrategia de Branching

### GitFlow Workflow

```
main (producción)
├── develop (desarrollo)
├── feature/nueva-funcionalidad
├── hotfix/correccion-critica
└── release/version-x.x.x
```

### Convenciones de Commits

```bash
# Formato: tipo(scope): descripción

feat(dashboard): agregar KPIs de eficiencia
fix(auth): corregir validación de login
docs(readme): actualizar instrucciones de instalación
style(components): mejorar diseño de cards
refactor(api): optimizar consultas de vehículos
test(utils): agregar tests para formateo de fechas
```

### Flujo de Trabajo

1. **Feature Branch**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad
# ... desarrollo ...
git commit -m "feat(scope): descripción"
git push origin feature/nueva-funcionalidad
```

2. **Pull Request**

- Crear PR hacia `develop`
- Revisión de código
- Tests pasando
- Merge a `develop`

3. **Release**

```bash
git checkout develop
git checkout -b release/v1.0.0
# ... preparar release ...
git checkout main
git merge release/v1.0.0
git tag v1.0.0
```

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Tabla de vehículos
vehicles (
  id, placa, modelo, marca, año,
  capacidad, estado, conductor_id,
  created_at, updated_at
)

-- Tabla de conductores
drivers (
  id, nombre, cedula, telefono, email,
  licencia, vencimiento_licencia, estado,
  created_at, updated_at
)

-- Tabla de ubicaciones (tracking)
locations (
  id, vehicle_id, lat, lng, speed, heading,
  timestamp, created_at
)

-- Tabla de rutas
routes (
  id, vehicle_id, driver_id, origen, destino,
  distancia, duracion_estimada, estado,
  created_at, updated_at
)
```

### Migraciones

```bash
# Aplicar migraciones
supabase db push

# Resetear base de datos
supabase db reset

# Generar tipos TypeScript
supabase gen types typescript --local > src/types/database.ts
```

## 🧪 Testing

### Estrategia de Testing

- **Unit Tests** - Componentes individuales
- **Integration Tests** - Flujos completos
- **E2E Tests** - Casos de uso críticos

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📊 Monitoreo y Métricas

### KPIs del Proyecto

- **Cobertura de Tests**: > 80%
- **Performance**: < 3s carga inicial
- **Accesibilidad**: WCAG 2.1 AA
- **Compatibilidad**: Chrome, Firefox, Safari, Edge

### Herramientas

- **Lighthouse** - Auditoría de performance
- **ESLint** - Calidad de código
- **Prettier** - Consistencia de formato
- **GitHub Actions** - CI/CD

## 📚 Documentación Adicional

Para información más detallada, consulta los siguientes documentos:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura detallada del sistema
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Guía completa de contribución
- **[CODE_STYLE.md](docs/CODE_STYLE.md)** - Convenciones y estándares de código
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guía de despliegue
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Guía de desarrollo
- **[PULL_REQUEST_GUIDE.md](docs/PULL_REQUEST_GUIDE.md)** - Guía de Pull Requests

## 🤝 Contribución

### Proceso de Contribución

1. **Fork** del repositorio
2. Crear **feature branch** desde `develop`
   ```bash
   git checkout develop
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. Implementar cambios siguiendo [CODE_STYLE.md](docs/CODE_STYLE.md)
4. Escribir tests para nuevas funcionalidades
5. Ejecutar todos los tests y linters
   ```bash
   npm run lint
   npm run test
   npm run type-check
   ```
6. Commitear con **Conventional Commits**
   ```bash
   npm run commit
   ```
7. Push y crear **Pull Request** hacia `develop`
8. Revisión de código por el equipo
9. Merge después de aprobación

### Estándares de Código

- ✅ **TypeScript** para tipado estático
- ✅ **ESLint** configurado con reglas estrictas
- ✅ **Prettier** para formato consistente
- ✅ **Conventional Commits** para mensajes descriptivos
- ✅ **Tests** obligatorios para nuevas features
- ✅ **JSDoc** para funciones públicas
- ✅ **Arquitectura unidireccional** con Flux pattern

### Tipos de Commits

```bash
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Cambios de formato (no afectan código)
refactor: Refactorización de código
test:     Agregar o modificar tests
chore:    Cambios en build o herramientas
perf:     Mejoras de performance
```

## 👥 Equipo

Este proyecto es desarrollado por estudiantes como trabajo académico.

### Para Profesores

- Arquitectura implementada: **Unidireccional (Flux pattern)**
- Patrón de diseño: **Context API + useReducer**
- Principios aplicados: **SOLID, Clean Architecture, DRY**
- Documentación completa en carpeta `docs/`
- Tests unitarios e integración configurados
- CI/CD con GitHub Actions

### Para Compañeros de Equipo

- Revisa [CONTRIBUTING.md](docs/CONTRIBUTING.md) antes de empezar
- Usa `npm run commit` para commits consistentes
- Ejecuta tests antes de crear PR
- Documenta nuevas funcionalidades
- Pregunta en el equipo si tienes dudas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ para la gestión eficiente de flotas vehiculares**
