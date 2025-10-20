# 🚗 FleetManager - Sistema de Gestión de Flota Vehicular# 🚗 FleetManager - Sistema de Gestión de Flota Vehicular

Sistema integral para la gestión, monitoreo y optimización de flota vehicular con tracking en tiempo real.Sistema integral para la gestión, monitoreo y optimización de flota vehicular con tracking en tiempo real, planificación de rutas, control de combustible y mantenimiento predictivo.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)

[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

## 🎯 ¿Qué es este Proyecto?

- [Características](#-características)

**FlotaVehicular** es una aplicación web para gestionar flotas de vehículos que permite:- [Arquitectura](#-arquitectura)

- [Tecnologías](#-tecnologías)

- 📊 **Monitorear vehículos** en tiempo real- [Configuración del Entorno](#-configuración-del-entorno)

- 👥 **Gestionar conductores** y asignaciones- [Estructura del Proyecto](#-estructura-del-proyecto)

- 🛠️ **Control de mantenimiento** preventivo y correctivo- [Scripts Disponibles](#-scripts-disponibles)

- 📍 **Planificar rutas** optimizadas- [Estrategia de Branching](#-estrategia-de-branching)

- ⛽ **Registrar combustible** y analizar consumo- [Documentación Adicional](#-documentación-adicional)

- 📈 **Generar reportes** y métricas- [Base de Datos](#-base-de-datos)

- [Testing](#-testing)

---- [Contribución](#-contribución)

## 🚀 Inicio Rápido## ✨ Características

### Para Miembros del Equipo### 🎯 Funcionalidades Principales

**¿Eres nuevo en el proyecto?** Lee esto primero:- **Dashboard Inteligente** - KPIs y métricas en tiempo real

- **Gestión de Flota** - Control completo de vehículos

👉 **[GUÍA COMPLETA DE COLABORACIÓN](docs/GUIA_COMPLETA_COLABORACION.md)**- **Gestión de Conductores** - Administración de personal

- **Monitoreo en Tiempo Real** - Tracking GPS con mapas interactivos

Esta guía incluye:- **Planificación de Rutas** - Optimización automática de rutas

- ✅ Instalación paso a paso (Node, Git, VS Code)- **Control de Combustible** - Monitoreo y análisis de consumo

- ✅ Cómo trabajar en una tarea- **Mantenimiento Predictivo** - Alertas y programación automática

- ✅ Git y GitHub desde cero- **Sistema de Alertas** - Notificaciones inteligentes

- ✅ Hacer commits y Pull Requests- **Reportes y Analytics** - Análisis detallado de rendimiento

- ✅ Convenciones del código- **Configuración Avanzada** - Roles, permisos y personalización

- ✅ Preguntas frecuentes

### 🚀 Funcionalidades Técnicas

### Instalación Rápida

- **Interfaz Responsive** - Compatible con móviles y desktop

````bash- **Modo Demo** - Funcionamiento sin base de datos

# 1. Clonar el repositorio- **Autenticación** - Sistema de login seguro

git clone https://github.com/CamiloTriana75/FlotaVehicular.git- **Tiempo Real** - Actualizaciones automáticas

cd FlotaVehicular- **Exportación** - Reportes en PDF y Excel

- **Integraciones** - APIs de mapas y servicios externos

# 2. Instalar dependencias

npm install## 🏗️ Arquitectura



# 3. Configurar variables de entorno### Arquitectura Unidireccional (Flux Pattern)

copy .env.example .env.local

El proyecto implementa una **arquitectura unidireccional de flujo de datos** inspirada en Flux/Redux, garantizando un flujo predecible y mantenible:

# 4. Iniciar servidor de desarrollo

npm run dev```

┌─────────────┐

# 5. Abrir en el navegador│   Action    │  ← Usuario interactúa

# http://localhost:5173└──────┬──────┘

```       │

       ▼

---┌─────────────┐

│  Dispatch   │  ← Despacha acción al reducer

## 🛠️ Tecnologías└──────┬──────┘

       │

### Frontend       ▼

- **React 18** - Biblioteca de UI┌─────────────┐

- **TypeScript** - Tipado estático│   Reducer   │  ← Actualiza el estado inmutablemente

- **Vite** - Build tool rápido└──────┬──────┘

- **Tailwind CSS** - Estilos utility-first       │

- **React Router** - Enrutamiento       ▼

- **Leaflet** - Mapas interactivos┌─────────────┐

│    Store    │  ← Estado global centralizado

### Backend└──────┬──────┘

- **Supabase** - Backend as a Service       │

- **PostgreSQL** - Base de datos       ▼

┌─────────────┐

### Herramientas de Desarrollo│    View     │  ← UI se actualiza reactivamente

- **ESLint** - Linter de código└─────────────┘

- **Prettier** - Formateador```

- **Vitest** - Testing

- **Husky** - Git hooks### Principios de Diseño

- **Commitlint** - Validación de commits

- **Flujo Unidireccional**: Los datos fluyen en una sola dirección, haciendo el estado predecible

---- **Single Source of Truth**: Estado centralizado en el Store

- **Inmutabilidad**: El estado nunca se modifica directamente

## 📁 Estructura del Proyecto- **Separación de Responsabilidades**: Lógica de negocio separada de la UI

- **Arquitectura Limpia**: Organización por capas (Core, Infrastructure, Presentation)

````

FlotaVehicular/### Capas de la Aplicación

├── src/

│ ├── components/ # Componentes reutilizables```

│ ├── pages/ # Páginas completassrc/

│ ├── hooks/ # Custom hooks├── core/ # 🎯 Lógica de negocio

│ ├── store/ # Estado global (Flux pattern)│ ├── entities/ # Entidades del dominio

│ ├── core/ # Lógica de negocio│ └── use-cases/ # Casos de uso

│ └── shared/ # Utilidades y constantes│

│├── store/ # 🗄️ Estado global (Flux pattern)

├── docs/ # Documentación│ ├── actions/ # Action creators

│ ├── GUIA_COMPLETA_COLABORACION.md ← EMPIEZA AQUÍ│ ├── reducers/ # Reducers puros

│ ├── ARQUITECTURA.md│ ├── context/ # React Context

│ ├── ESTILO_CODIGO.md│ └── types.js # Action types

│ └── diagrams/ # Diagramas UML│

│├── hooks/ # 🪝 Custom hooks para lógica reutilizable

├── supabase/ # Migraciones de BD│

└── tests/ # Tests unitarios├── components/ # 🧩 Componentes de presentación

````│

├── pages/          # 📄 Páginas/Vistas

---│

└── shared/         # 🔧 Utilidades compartidas

## 📜 Scripts Disponibles    ├── constants/  # Constantes de la app

    └── utils/      # Funciones de utilidad

```bash```

# Desarrollo

npm run dev          # Iniciar servidor de desarrollo## 🛠️ Tecnologías

npm run build        # Construir para producción

npm run preview      # Preview de la build### Frontend



# Calidad de Código- **React 18** - Biblioteca de UI con Hooks

npm run lint         # Ejecutar ESLint- **TypeScript** - Tipado estático para mayor seguridad

npm run lint:fix     # Corregir errores automáticamente- **Vite** - Build tool de nueva generación

npm run format       # Formatear con Prettier- **Tailwind CSS** - Framework de estilos utility-first

npm run type-check   # Verificar tipos TypeScript- **React Router** - Enrutamiento declarativo

- **Leaflet** - Mapas interactivos

# Testing- **Lucide React** - Iconografía moderna

npm run test         # Ejecutar tests

npm run test:ui      # Tests con UI### Estado Global

npm run test:coverage # Cobertura de tests

- **React Context API** - Gestión de estado compartido

# Git- **useReducer** - Lógica de estado compleja

npm run commit       # Commit con Commitizen (asistente)- **Custom Hooks** - Lógica reutilizable encapsulada

````

### Backend & Base de Datos

---

- **Supabase** - Backend as a Service

## 📚 Documentación- **PostgreSQL** - Base de datos relacional

- **Row Level Security** - Seguridad a nivel de fila

### Para Desarrolladores

### Herramientas de Desarrollo

| Documento | ¿Cuándo leerlo? |

|-----------|-----------------|- **ESLint** - Linter de código

| **[Guía de Colaboración](docs/GUIA_COMPLETA_COLABORACION.md)** | 👈 **EMPIEZA AQUÍ** - Tu primera tarea |- **Prettier** - Formateador de código

| [Arquitectura](docs/ARQUITECTURA.md) | Entender la estructura del código |- **Vitest** - Framework de testing

| [Estilo de Código](docs/ESTILO_CODIGO.md) | Antes de escribir código |- **Git** - Control de versiones

| [Desarrollo](docs/DESARROLLO.md) | Configuración avanzada |- **GitHub** - Repositorio y CI/CD

| [Estrategia de Ramas](docs/ESTRATEGIA_RAMAS.md) | Gestión de ramas y workflow |- **Commitlint** - Validación de commits

| [Guía de Pull Request](docs/GUIA_PULL_REQUEST.md) | Antes de crear un PR |

| [Guía de Contribución](docs/GUIA_CONTRIBUCION.md) | Guía completa de contribución |## ⚙️ Configuración del Entorno

### Diagramas### Prerrequisitos

- **[Arquitectura del Sistema](docs/diagrams/Arquitectura_Sistema.md)**- Node.js 18+

- **[Diagrama Entidad-Relación](docs/diagrams/Diagrama_ER.md)**- npm 9+ o yarn 1.22+

- **[Casos de Uso](docs/diagrams/Diagrama_Casos_Uso.md)**- Git 2.30+

- Cuenta de Supabase

---

### Instalación

## 🌿 Estrategia de Ramas

1. **Clonar el repositorio**

````

main (producción)```bash

  └── feature/XX-nombre-tarea  (tu trabajo)git clone https://github.com/tu-usuario/FlotaVehicular-1.git

```cd FlotaVehicular-1

````

### Workflow Básico

2. **Instalar dependencias**

````bash

# 1. Actualizar main```bash

git checkout mainnpm install

git pull origin main```



# 2. Crear tu rama3. **Configurar variables de entorno**

git checkout -b feature/25-formulario-conductores

```bash

# 3. Trabajar y hacer commitscp .env.example .env.local

git add .```

git commit -m "feat: crear formulario de conductores"

4. **Configurar Supabase** (Opcional para modo demo)

# 4. Subir cambios

git push origin feature/25-formulario-conductores```bash

# Editar .env.local con tus credenciales de Supabase

# 5. Crear Pull Request en GitHubVITE_SUPABASE_URL=tu_url_de_supabase

```VITE_SUPABASE_ANON_KEY=tu_clave_anonima

````

**Más detalles:** [docs/GUIA_COMPLETA_COLABORACION.md](docs/GUIA_COMPLETA_COLABORACION.md)

5. **Ejecutar en modo desarrollo**

---

```bash

## 🤝 Cómo Contribuirnpm run dev

```

### Proceso Simple

6. **Abrir en el navegador**

1. **Toma una tarea** del [backlog de issues](https://github.com/CamiloTriana75/FlotaVehicular/issues)

1. **Crea una rama** desde `main````

1. **Escribe código** siguiendo las convencioneshttp://localhost:5173

1. **Haz commits** con mensajes claros```

1. **Crea un Pull Request**

1. **Espera revisión**## 📁 Estructura del Proyecto

1. **¡Merge!** Tu código ya está en el proyecto

### Organización por Capas (Clean Architecture)

### Tipos de Commits

````

```bashFlotaVehicular/

feat:     Nueva funcionalidad├── 📁 docs/                           # 📚 Documentación del proyecto

fix:      Corrección de bug│   ├── 📁 diagrams/                   # Diagramas UML y técnicos

docs:     Cambios en documentación│   ├── 📄 ARQUITECTURA.md             # Arquitectura detallada

style:    Cambios de formato│   ├── 📄 GUIA_CONTRIBUCION.md             # Guía de contribución

refactor: Mejora de código sin cambiar función│   ├── 📄 ESTILO_CODIGO.md              # Convenciones de código

test:     Agregar o modificar tests│   ├── 📄 DEPLOYMENT.md              # Guía de despliegue

```│   └── 📄 DESARROLLO.md             # Guía de desarrollo

│

**Ejemplos:**├── 📁 src/                           # 💻 Código fuente

```bash│   │

git commit -m "feat: agregar búsqueda de vehículos"│   ├── 📁 core/                      # 🎯 Capa de dominio (lógica de negocio)

git commit -m "fix: corregir validación de email"│   │   ├── 📁 entities/              # Entidades del negocio

git commit -m "docs: actualizar guía de instalación"│   │   │   ├── Vehicle.js            # Entidad Vehículo

```│   │   │   ├── Driver.js             # Entidad Conductor

│   │   │   └── index.js              # Exports

---│   │   │

│   │   └── 📁 use-cases/             # Casos de uso

## 🧪 Testing│   │       ├── manageVehicles.js     # Lógica de vehículos

│   │       └── manageDrivers.js      # Lógica de conductores

```bash│   │

# Ejecutar todos los tests│   ├── 📁 store/                     # 🗄️ Estado global (Flux pattern)

npm run test│   │   ├── 📁 actions/               # Action creators

│   │   │   ├── authActions.js

# Tests con interfaz visual│   │   │   ├── vehicleActions.js

npm run test:ui│   │   │   └── driverActions.js

│   │   │

# Ver cobertura de código│   │   ├── 📁 reducers/              # Reducers puros

npm run test:coverage│   │   │   ├── authReducer.js

```│   │   │   ├── vehicleReducer.js

│   │   │   ├── driverReducer.js

**Objetivo:** > 80% de cobertura│   │   │   └── index.js              # Root reducer

│   │   │

---│   │   ├── 📁 context/               # React Context

│   │   │   └── AppContext.jsx        # Contexto global

## 🗄️ Base de Datos│   │   │

│   │   ├── types.js                  # Action types

El proyecto usa **Supabase** con **PostgreSQL**.│   │   └── index.js                  # Exports del store

│   │

### Configuración│   ├── 📁 hooks/                     # 🪝 Custom hooks

│   │   ├── useAuth.js                # Hook de autenticación

1. Crea una cuenta en [Supabase](https://supabase.com/)│   │   ├── useVehicles.js            # Hook de vehículos

2. Crea un nuevo proyecto│   │   ├── useDrivers.js             # Hook de conductores

3. Copia las credenciales a `.env.local`:│   │   └── index.js                  # Exports

   ```env│   │

   VITE_SUPABASE_URL=tu-url│   ├── 📁 components/                # 🧩 Componentes de UI

   VITE_SUPABASE_ANON_KEY=tu-key│   │   ├── Card.jsx                  # Tarjetas informativas

   ```│   │   ├── Table.jsx                 # Tablas de datos

│   │   ├── MapViewer.jsx             # Visor de mapas

### Esquema│   │   ├── Sidebar.jsx               # Barra lateral

│   │   ├── TopBar.jsx                # Barra superior

Ver diagramas en:│   │   └── VehicleForm.jsx           # Formulario de vehículos

- [Diagrama ER](docs/diagrams/Diagrama_ER.md)│   │

- [Migraciones](supabase/migrations/)│   ├── 📁 pages/                     # 📄 Páginas/Vistas

│   │   ├── Dashboard.jsx             # Dashboard principal

---│   │   ├── VehiclesList.jsx          # Lista de vehículos

│   │   ├── VehicleDetail.jsx         # Detalle de vehículo

## 👥 Equipo│   │   ├── DriversList.jsx           # Lista de conductores

│   │   ├── Maintenance.jsx           # Mantenimiento

Este proyecto es desarrollado por estudiantes como trabajo académico.│   │   ├── Routes.jsx                # Rutas

│   │   ├── Alerts.jsx                # Alertas

### Para Nuevos Miembros│   │   ├── Reports.jsx               # Reportes

│   │   ├── Settings.jsx              # Configuración

**¿Primera vez aquí?**│   │   └── LoginPage.jsx             # Página de login

│   │

1. Lee la [Guía de Colaboración](docs/GUIA_COMPLETA_COLABORACION.md)│   ├── 📁 shared/                    # 🔧 Recursos compartidos

2. Instala el proyecto (ver arriba)│   │   ├── 📁 constants/             # Constantes de la app

3. Toma tu primera tarea│   │   │   └── index.js              # Estados, tipos, rutas

4. Pide ayuda si la necesitas│   │   │

│   │   ├── 📁 utils/                 # Utilidades

**No necesitas saber Git previamente.** Todo está explicado paso a paso.│   │   │   └── index.js              # Funciones helper

│   │   │

### Para Profesores│   │   └── 📁 types/                 # Tipos TypeScript

│   │       └── database.ts           # Tipos de BD

**Conceptos aplicados:**│   │

- ✅ Arquitectura Unidireccional (Flux pattern)│   ├── 📁 data/                      # 📊 Datos mock

- ✅ Context API + useReducer│   │   └── mockVehicles.js           # Datos de prueba

- ✅ Custom Hooks│   │

- ✅ Clean Architecture│   ├── 📁 lib/                       # 📚 Configuración

- ✅ Principios SOLID│   │   └── supabaseClient.js         # Cliente de Supabase

- ✅ GitFlow simplificado│   │

- ✅ Testing con Vitest│   ├── App.jsx                       # Componente principal

- ✅ TypeScript para type safety│   ├── main.tsx                      # Punto de entrada

- ✅ Conventional Commits│   └── index.css                     # Estilos globales

- ✅ Code review process│

├── 📁 supabase/                      # 🗄️ Backend

**Documentación técnica:**│   ├── 📁 migrations/                # Migraciones de BD

- [ARQUITECTURA.md](docs/ARQUITECTURA.md)│   └── config.toml                   # Configuración

- [Diagramas UML](docs/diagrams/)│

├── 📁 tests/                         # 🧪 Tests

---│   ├── components.test.jsx           # Tests de componentes

│   └── utils.test.js                 # Tests de utilidades

## 📄 Licencia│

├── 📄 package.json                   # Dependencias y scripts

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.├── 📄 vite.config.ts                 # Configuración de Vite

├── 📄 vitest.config.js               # Configuración de tests

---├── 📄 tailwind.config.js             # Configuración de Tailwind

├── 📄 tsconfig.json                  # Configuración de TypeScript

## 🔗 Enlaces Útiles├── 📄 eslint.config.js               # Configuración de ESLint

├── 📄 commitlint.config.cjs          # Configuración de commits

- **Repositorio:** https://github.com/CamiloTriana75/FlotaVehicular├── 📄 .env.example                   # Variables de entorno

- **Issues:** https://github.com/CamiloTriana75/FlotaVehicular/issues└── 📄 README.md                      # Este archivo

- **Pull Requests:** https://github.com/CamiloTriana75/FlotaVehicular/pulls```



---### 📦 Módulos Principales



## 📞 Soporte#### **Store (Estado Global)**

Implementación del patrón Flux con React Context + useReducer:

¿Tienes preguntas?- **Actions**: Definen qué ocurrió

- **Reducers**: Especifican cómo cambia el estado

1. Revisa la [Guía de Colaboración](docs/GUIA_COMPLETA_COLABORACION.md)- **Context**: Provee el estado a toda la app

2. Busca en los [Issues cerrados](https://github.com/CamiloTriana75/FlotaVehicular/issues?q=is%3Aissue+is%3Aclosed)

3. Pregunta en el chat del equipo#### **Hooks Personalizados**

4. Crea un nuevo issue si es necesarioEncapsulan lógica reutilizable:

- `useAuth()` - Manejo de autenticación

---- `useVehicles()` - CRUD de vehículos

- `useDrivers()` - CRUD de conductores

**¡Gracias por contribuir! 🚀**

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
````

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

### 🚀 Para Nuevos Miembros del Equipo

**¿Eres nuevo en el proyecto?** Empieza aquí:

1. 📖 **[Guía Rápida del Equipo](docs/GUIA_RAPIDA_EQUIPO.md)** - Todo lo que necesitas saber para empezar (sin experiencia previa en Git)
2. 📋 **[Índice de Documentación](docs/README.md)** - Navegación completa de toda la documentación
3. ⚙️ **[Guía de Desarrollo](docs/DESARROLLO.md)** - Setup del entorno y herramientas

### 📖 Documentación por Categoría

#### Arquitectura y Diseño

- **[ARQUITECTURA.md](docs/ARQUITECTURA.md)** - Arquitectura del sistema (Flux pattern, capas)
- **[Diagrama de Arquitectura](docs/diagrams/Arquitectura_Sistema.md)** - Visualización de la arquitectura
- **[Diagrama ER](docs/diagrams/Diagrama_ER.md)** - Modelo de base de datos
- **[Casos de Uso](docs/diagrams/Diagrama_Casos_Uso.md)** - Diagramas de casos de uso

#### Desarrollo Día a Día

- **[Guía Rápida](docs/GUIA_RAPIDA_EQUIPO.md)** - Para trabajar sin conocimientos previos de Git
- **[Estrategia de Ramas](docs/ESTRATEGIA_RAMAS.md)** - Cómo crear y nombrar ramas
- **[Guía de Pull Requests](docs/GUIA_PULL_REQUEST.md)** - Cómo crear PRs correctamente
- **[Estilo de Código](docs/ESTILO_CODIGO.md)** - Convenciones y mejores prácticas

#### Contribución y Colaboración

- **[Guía de Contribución](docs/GUIA_CONTRIBUCION.md)** - Guía completa de contribución
- **[Planificación de Sprints](docs/SPRINT_PLANNING.md)** - Gestión de sprints y metodología
- **[Etiquetas de GitHub](docs/GITHUB_LABELS.md)** - Sistema de organización de issues

#### Deploy e Infraestructura

- **[INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md)** - Infraestructura y servicios (Supabase, hosting)
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Proceso de despliegue

### 🎯 Accesos Rápidos

| Necesito...              | Documento                                                          |
| ------------------------ | ------------------------------------------------------------------ |
| Empezar mi primera tarea | [Guía Rápida del Equipo](docs/GUIA_RAPIDA_EQUIPO.md)               |
| Crear una rama           | [Estrategia de Ramas](docs/BRANCHING_STRATEGY.md)                  |
| Hacer un commit          | [Guía Rápida - Commits](docs/GUIA_RAPIDA_EQUIPO.md#-hacer-commits) |
| Crear un Pull Request    | [Guía de PRs](docs/PULL_REQUEST_GUIDE.md)                          |
| Entender la arquitectura | [Architecture](docs/ARCHITECTURE.md)                               |
| Ver la base de datos     | [Diagrama ER](docs/diagrams/Diagrama_ER.md)                        |
| Instalar el proyecto     | [⚙️ Configuración del Entorno](#️-configuración-del-entorno)       |

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

**¿Primera vez con Git/GitHub?**

- 📖 Lee [GUIA_RAPIDA_EQUIPO.md](docs/GUIA_RAPIDA_EQUIPO.md) - Todo explicado paso a paso
- 🎯 Sigue el flujo: Issue → Rama → Código → Commit → Push → Pull Request
- ❓ ¿Dudas? Revisa la sección [Problemas Comunes](docs/GUIA_RAPIDA_EQUIPO.md#️-problemas-comunes)

**Workflow Diario:**

1. Ver tu issue asignado en [GitHub Issues](https://github.com/CamiloTriana75/FlotaVehicular/issues)
2. Crear rama: `git checkout -b feature/XX-nombre-tarea`
3. Hacer commits: `git commit -m "feat: descripción"`
4. Subir cambios: `git push origin feature/XX-nombre-tarea`
5. Crear Pull Request en GitHub
6. Esperar revisión y merge

**Recursos Útiles:**

- [Cheat Sheet de Git](https://education.github.com/git-cheat-sheet-education.pdf)
- [Video: Git en 15 minutos](https://www.youtube.com/watch?v=HiXLkL42tMU)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ para la gestión eficiente de flotas vehiculares**
