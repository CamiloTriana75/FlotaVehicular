# 🚗 FleetManager - Sistema de Gestión de Flota Vehicular

Sistema integral para la gestión, monitoreo y optimización de flota vehicular con tracking en tiempo real, planificación de rutas, control de combustible y mantenimiento predictivo.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estrategia de Branching](#-estrategia-de-branching)
- [Guía de Pull Requests](docs/PULL_REQUEST_GUIDE.md)
- [Base de Datos](#-base-de-datos)
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

## 🛠️ Tecnologías

### Frontend

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Leaflet** - Mapas interactivos
- **Lucide React** - Iconografía

### Backend & Base de Datos

- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security** - Seguridad a nivel de fila

### Herramientas de Desarrollo

- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Vitest** - Framework de testing
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

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

```
FlotaVehicular-1/
├── 📁 docs/                    # Documentación
│   ├── 📁 diagrams/            # Diagramas del sistema
│   └── 📄 README.md
├── 📁 src/                     # Código fuente
│   ├── 📁 components/          # Componentes reutilizables
│   ├── 📁 pages/              # Páginas de la aplicación
│   ├── 📁 lib/                # Utilidades y configuración
│   ├── 📁 data/               # Datos mock para desarrollo
│   └── 📁 test/               # Tests unitarios
├── 📁 supabase/               # Configuración de Supabase
│   └── 📁 migrations/         # Migraciones de BD
├── 📁 tests/                  # Tests de integración
├── 📄 package.json            # Dependencias y scripts
├── 📄 vite.config.ts          # Configuración de Vite
├── 📄 tailwind.config.js      # Configuración de Tailwind
├── 📄 tsconfig.json           # Configuración de TypeScript
└── 📄 README.md               # Este archivo
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construcción para producción
npm run preview      # Vista previa de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier

# Testing
npm run test         # Ejecutar tests
npm run test:ui      # Interfaz de testing

# Base de datos
npm run db:reset     # Resetear base de datos
npm run db:seed      # Poblar con datos de prueba
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

## 🤝 Contribución

### Proceso de Contribución

1. Fork del repositorio
2. Crear feature branch
3. Implementar cambios
4. Ejecutar tests
5. Crear Pull Request
6. Revisión y merge

### Estándares de Código

- **TypeScript** para tipado
- **ESLint** para linting
- **Prettier** para formato
- **Conventional Commits** para mensajes
- **Tests** para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---
