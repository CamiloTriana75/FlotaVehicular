# 🛠️ Guía de Desarrollo - FleetManager

Esta guía te ayudará a configurar y desarrollar el sistema FleetManager desde cero.

## 📋 Prerrequisitos

### Software Requerido

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Git** 2.30+ ([Descargar](https://git-scm.com/))
- **Supabase CLI** ([Instalar](https://supabase.com/docs/guides/cli))
- **Editor de código** (VS Code recomendado)

### Cuentas Necesarias

- **GitHub** - Para el repositorio
- **Supabase** - Para la base de datos
- **Vercel** (opcional) - Para deployment

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/FlotaVehicular-1.git
cd FlotaVehicular-1

# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env.local

# Editar variables de entorno
nano .env.local
```

**Variables importantes:**

```env
# Supabase (Obligatorio para producción)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# Aplicación
VITE_APP_NAME=FleetManager
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Modo Demo (para desarrollo sin BD)
VITE_MOCK_MODE=true
```

### 3. Configurar Supabase

```bash
# Inicializar Supabase localmente
supabase init

# Iniciar servicios locales
supabase start

# Aplicar migraciones
supabase db push

# Generar tipos TypeScript
npm run db:types
```

### 4. Configurar Git Hooks

```bash
# Instalar Husky
npm run prepare

# Configurar hooks
npx husky install
```

## 🏗️ Estructura del Proyecto

```
FlotaVehicular-1/
├── 📁 .github/                 # GitHub Actions CI/CD
├── 📁 .husky/                  # Git hooks
├── 📁 docs/                    # Documentación
├── 📁 src/                     # Código fuente
│   ├── 📁 components/          # Componentes reutilizables
│   ├── 📁 pages/              # Páginas de la aplicación
│   ├── 📁 lib/                # Utilidades y configuración
│   ├── 📁 data/               # Datos mock
│   ├── 📁 types/              # Tipos TypeScript
│   └── 📁 test/               # Tests
├── 📁 supabase/               # Configuración de Supabase
│   ├── 📁 migrations/         # Migraciones de BD
│   └── 📄 config.toml         # Configuración local
├── 📄 package.json            # Dependencias y scripts
├── 📄 vite.config.ts          # Configuración de Vite
├── 📄 tailwind.config.js      # Configuración de Tailwind
└── 📄 tsconfig.json           # Configuración de TypeScript
```

## 🚀 Scripts de Desarrollo

### Scripts Principales

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Construcción para producción
npm run preview          # Vista previa de producción

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores de linting
npm run format           # Formatear código
npm run format:check     # Verificar formato
npm run type-check       # Verificar tipos TypeScript

# Testing
npm run test             # Ejecutar tests
npm run test:ui          # Interfaz de testing
npm run test:coverage    # Cobertura de tests
npm run test:watch       # Tests en modo watch

# Base de datos
npm run db:reset         # Resetear base de datos
npm run db:push          # Aplicar migraciones
npm run db:pull          # Obtener cambios de BD
npm run db:seed          # Poblar con datos de prueba
npm run db:types         # Generar tipos TypeScript

# Git y releases
npm run commit           # Commit interactivo
npm run release          # Crear release
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

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato: tipo(scope): descripción

feat(dashboard): agregar KPIs de eficiencia
fix(auth): corregir validación de login
docs(readme): actualizar instrucciones
style(components): mejorar diseño de cards
refactor(api): optimizar consultas
test(utils): agregar tests para formateo
```

### Flujo de Trabajo

1. **Crear Feature Branch**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad
```

2. **Desarrollar**

```bash
# Hacer cambios
git add .
npm run commit  # Commit interactivo
git push origin feature/nueva-funcionalidad
```

3. **Crear Pull Request**

- Crear PR hacia `develop`
- Revisión de código
- Tests pasando
- Merge a `develop`

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Tablas principales
companies          # Empresas
users              # Usuarios del sistema
drivers            # Conductores
vehicles           # Vehículos
locations          # Ubicaciones GPS
routes             # Rutas
geofences          # Geocercas
alerts             # Alertas
maintenance        # Mantenimiento
fuel_records       # Combustible
incidents          # Incidentes
```

### Migraciones

```bash
# Crear nueva migración
supabase migration new nombre_migracion

# Aplicar migraciones
supabase db push

# Resetear base de datos
supabase db reset

# Ver estado de migraciones
supabase migration list
```

### Tipos TypeScript

```bash
# Generar tipos desde la BD
npm run db:types

# Los tipos se guardan en: src/types/database.ts
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

# Interfaz de testing
npm run test:ui

# Cobertura de tests
npm run test:coverage
```

### Escribir Tests

```javascript
// Ejemplo de test
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Dashboard from '../pages/Dashboard';

test('renders dashboard title', () => {
  render(<Dashboard />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
```

## 📊 Monitoreo y Métricas

### KPIs del Proyecto

- **Cobertura de Tests**: > 80%
- **Performance**: < 3s carga inicial
- **Accesibilidad**: WCAG 2.1 AA
- **Compatibilidad**: Chrome, Firefox, Safari, Edge

### Herramientas de Calidad

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Tipado estático
- **Vitest** - Testing
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit hooks

## 🚀 Deployment

### Desarrollo Local

```bash
# Modo desarrollo
npm run dev

# Modo producción local
npm run build
npm run preview
```

### Producción

```bash
# Build para producción
npm run build

# Deploy automático via GitHub Actions
git push origin main
```

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de Supabase**

```bash
# Verificar que Supabase esté corriendo
supabase status

# Reiniciar servicios
supabase stop
supabase start
```

2. **Error de dependencias**

```bash
# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

3. **Error de TypeScript**

```bash
# Verificar tipos
npm run type-check

# Regenerar tipos de BD
npm run db:types
```

### Logs y Debugging

```bash
# Ver logs de Supabase
supabase logs

# Debug de Vite
npm run dev -- --debug

# Debug de tests
npm run test -- --reporter=verbose
```

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/FlotaVehicular-1/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/FlotaVehicular-1/discussions)
- **Documentación**: [docs/](docs/)

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**¡Happy Coding! 🚀**
