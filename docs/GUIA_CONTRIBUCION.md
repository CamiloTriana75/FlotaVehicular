# Guía de Contribución

¡Gracias por tu interés en contribuir a FleetManager! Esta guía te ayudará a entender cómo contribuir efectivamente al proyecto.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Estándares de Código](#estándares-de-código)
6. [Commits](#commits)
7. [Pull Requests](#pull-requests)
8. [Revisión de Código](#revisión-de-código)
9. [Testing](#testing)

---

## Código de Conducta

Este proyecto adhiere a un código de conducta profesional y respetuoso. Al participar, se espera que:

- ✅ Uses lenguaje acogedor e inclusivo
- ✅ Seas respetuoso con diferentes puntos de vista
- ✅ Aceptes críticas constructivas de manera profesional
- ✅ Te enfoques en lo mejor para el proyecto

## ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no haya sido reportado antes en [Issues](../../issues)
2. **Crea un Issue** con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Versión del navegador/sistema

**Plantilla de Bug Report:**

```markdown
## Descripción del Bug

[Descripción clara del problema]

## Pasos para Reproducir

1. Ir a '...'
2. Click en '...'
3. Ver error

## Comportamiento Esperado

[Qué debería pasar]

## Comportamiento Actual

[Qué pasa realmente]

## Screenshots

[Si aplica]

## Entorno

- OS: [ej. Windows 11]
- Navegador: [ej. Chrome 120]
- Versión: [ej. 1.0.0]
```

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. **Verifica** que no exista una sugerencia similar
2. **Crea un Issue** de tipo "Feature Request"
3. **Describe** el problema que resuelve
4. **Explica** cómo debería funcionar

### Contribuir con Código

1. Encuentra un Issue para trabajar o crea uno nuevo
2. Comenta en el Issue que trabajarás en él
3. Sigue el [Flujo de Trabajo](#flujo-de-trabajo)

## Configuración del Entorno

### Requisitos Previos

```bash
node >= 18.0.0
npm >= 9.0.0
git >= 2.30.0
```

### Instalación

```bash
# 1. Fork el repositorio en GitHub

# 2. Clona tu fork
git clone https://github.com/TU-USUARIO/FlotaVehicular.git
cd FlotaVehicular

# 3. Agrega el repositorio original como upstream
git remote add upstream https://github.com/CamiloTriana75/FlotaVehicular.git

# 4. Instala dependencias
npm install

# 5. Copia las variables de entorno
cp .env.example .env.local

# 6. Inicia el servidor de desarrollo
npm run dev
```

### Verificar Instalación

```bash
# Ejecutar linter
npm run lint

# Ejecutar tests
npm run test

# Verificar tipos
npm run type-check
```

## Flujo de Trabajo

### Estrategia de Branching (GitFlow)

```
main (producción estable)
  ├── develop (desarrollo activo)
  │    ├── feature/nombre-feature
  │    ├── bugfix/nombre-bug
  │    └── hotfix/nombre-hotfix
  └── release/vX.X.X
```

### Crear una Feature Branch

```bash
# 1. Actualizar develop
git checkout develop
git pull upstream develop

# 2. Crear nueva branch desde develop
git checkout -b feature/nombre-descriptivo

# 3. Trabajar en la feature...

# 4. Commitear cambios
git add .
git commit -m "feat(scope): descripción"

# 5. Push a tu fork
git push origin feature/nombre-descriptivo

# 6. Crear Pull Request en GitHub
```

### Tipos de Branches

| Tipo    | Prefijo    | Descripción         | Base      |
| ------- | ---------- | ------------------- | --------- |
| Feature | `feature/` | Nueva funcionalidad | `develop` |
| Bugfix  | `bugfix/`  | Corrección de bug   | `develop` |
| Hotfix  | `hotfix/`  | Corrección urgente  | `main`    |
| Release | `release/` | Preparar release    | `develop` |

**Ejemplos:**

- `feature/add-vehicle-tracking`
- `bugfix/fix-login-validation`
- `hotfix/critical-security-patch`

## Estándares de Código

### Principios Generales

1. **Claridad sobre brevedad**: Código legible es mejor que código corto
2. **DRY (Don't Repeat Yourself)**: Reutiliza código
3. **KISS (Keep It Simple, Stupid)**: Mantén soluciones simples
4. **YAGNI (You Aren't Gonna Need It)**: No agregues funcionalidad que no necesitas

### JavaScript/TypeScript

```javascript
// ✅ Buenas prácticas

// 1. Nombres descriptivos
const activeVehicles = vehicles.filter((v) => v.status === 'active');

// 2. Funciones pequeñas y con una sola responsabilidad
const calculateFuelAverage = (vehicles) => {
  const total = vehicles.reduce((sum, v) => sum + v.fuel, 0);
  return total / vehicles.length;
};

// 3. Destructuring
const { id, name, status } = driver;

// 4. Template literals
const message = `Vehicle ${plate} has low fuel: ${fuel}%`;

// 5. Arrow functions para callbacks
vehicles.map((vehicle) => vehicle.plate);

// 6. Async/await sobre Promises
const fetchData = async () => {
  try {
    const data = await api.getVehicles();
    return data;
  } catch (error) {
    console.error(error);
  }
};
```

```javascript
// ❌ Evitar

// 1. Variables no descriptivas
const x = vehicles.filter((v) => v.status === 'active');

// 2. Funciones largas
const doEverything = () => {
  // 100 líneas de código...
};

// 3. Callbacks anidados (callback hell)
getData(function (a) {
  getMoreData(a, function (b) {
    getMoreData(b, function (c) {
      // ...
    });
  });
});

// 4. Modificar arrays directamente
vehicles.push(newVehicle); // En reducers
```

### React Components

```jsx
// ✅ Componente bien estructurado

/**
 * Componente que muestra una tarjeta de vehículo
 * @param {Object} props
 * @param {Object} props.vehicle - Datos del vehículo
 * @param {Function} props.onSelect - Callback al seleccionar
 */
export const VehicleCard = ({ vehicle, onSelect }) => {
  const { plate, brand, model, status } = vehicle;

  const handleClick = () => {
    onSelect(vehicle.id);
  };

  return (
    <div className="vehicle-card" onClick={handleClick}>
      <h3>{plate}</h3>
      <p>
        {brand} {model}
      </p>
      <span className={`status-${status}`}>{status}</span>
    </div>
  );
};
```

### Custom Hooks

```javascript
// ✅ Hook bien estructurado

/**
 * Hook para gestión de vehículos
 * @returns {Object} Estado y funciones de vehículos
 */
export const useVehicles = () => {
  const { state, dispatch } = useAppContext();

  const addVehicle = useCallback(
    (vehicle) => {
      dispatch(addVehicleAction(vehicle));
    },
    [dispatch]
  );

  return {
    vehicles: state.vehicles.vehicles,
    loading: state.vehicles.loading,
    error: state.vehicles.error,
    addVehicle,
  };
};
```

### CSS/Tailwind

```jsx
// ✅ Usar Tailwind de manera consistente

// 1. Orden lógico de clases
<div className="
  flex items-center justify-between  // Layout
  px-4 py-2                          // Spacing
  bg-white                           // Background
  rounded-lg shadow-md               // Borders & Effects
  hover:shadow-lg                    // Interactions
  transition-shadow                  // Animations
">

// 2. Extraer clases repetidas
const cardClasses = "bg-white rounded-lg shadow-md p-4";
<div className={cardClasses}>
```

## Commits

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensajes consistentes:

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

| Tipo       | Descripción              | Ejemplo                                     |
| ---------- | ------------------------ | ------------------------------------------- |
| `feat`     | Nueva funcionalidad      | `feat(vehicles): add vehicle tracking`      |
| `fix`      | Corrección de bug        | `fix(auth): resolve login validation`       |
| `docs`     | Cambios en documentación | `docs(readme): update installation steps`   |
| `style`    | Formato de código        | `style(components): format with prettier`   |
| `refactor` | Refactorización          | `refactor(hooks): simplify useVehicles`     |
| `test`     | Tests                    | `test(utils): add formatDate tests`         |
| `chore`    | Tareas de mantenimiento  | `chore(deps): update dependencies`          |
| `perf`     | Mejoras de performance   | `perf(dashboard): optimize KPI calculation` |

### Ejemplos

```bash
# Feature
feat(dashboard): add real-time vehicle tracking

# Bugfix
fix(login): correct email validation regex

# Breaking change
feat(api): change vehicle status enum

BREAKING CHANGE: status field now uses lowercase values

# Con issue
fix(vehicles): resolve filter bug

Closes #123
```

### Usando Commitizen

```bash
# Usar el asistente interactivo
npm run commit
```

## Pull Requests

### Antes de Crear un PR

- [ ] Tests pasan localmente: `npm run test`
- [ ] Linter pasa: `npm run lint`
- [ ] Types correctos: `npm run type-check`
- [ ] Código formateado: `npm run format`
- [ ] Branch actualizado con develop: `git pull upstream develop`
- [ ] Cambios commitados con Conventional Commits

### Plantilla de Pull Request

```markdown
## Descripción

[Descripción clara de los cambios]

## Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## ¿Cómo se ha probado?

[Describe las pruebas realizadas]

## Checklist

- [ ] Mi código sigue el style guide del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código, especialmente en áreas difíciles
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests unitarios nuevos y existentes pasan localmente
- [ ] Cambios dependientes han sido mergeados

## Screenshots (si aplica)

[Capturas de pantalla]

## Issues relacionados

Closes #[número]
```

### Tamaño del PR

- ✅ **Pequeño**: < 200 líneas (ideal)
- ⚠️ **Medio**: 200-400 líneas (aceptable)
- ❌ **Grande**: > 400 líneas (dividir en PRs más pequeños)

## Revisión de Código

### Como Autor

- Responde a comentarios de manera constructiva
- Explica decisiones técnicas cuando sea necesario
- Actualiza el PR basado en feedback
- Solicita re-revisión después de cambios

### Como Revisor

- Sé constructivo y respetuoso
- Enfócate en el código, no en la persona
- Sugiere alternativas cuando sea posible
- Aprueba cuando el código cumple los estándares

### Criterios de Aprobación

- [ ] Código cumple estándares del proyecto
- [ ] Tests adecuados incluidos
- [ ] Documentación actualizada
- [ ] Sin conflictos con develop
- [ ] CI/CD pasa exitosamente

## Testing

### Escribir Tests

```javascript
// ✅ Test bien estructurado

import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-15');
    const formatted = formatDate(date, 'DD/MM/YYYY');
    expect(formatted).toBe('15/01/2025');
  });

  it('should handle invalid dates', () => {
    expect(() => formatDate('invalid')).toThrow();
  });
});
```

### Cobertura de Tests

- Objetivo: > 80% de cobertura
- Tests requeridos para:
  - Utilidades y helpers
  - Lógica de negocio
  - Reducers
  - Custom hooks

## Preguntas Frecuentes

### ¿Puedo trabajar en múltiples features a la vez?

Sí, pero cada una en su propia branch separada.

### ¿Qué hago si mi PR tiene conflictos?

```bash
# Actualizar tu branch con develop
git checkout feature/mi-feature
git fetch upstream
git merge upstream/develop
# Resolver conflictos
git push origin feature/mi-feature
```

### ¿Cuánto tarda una revisión de PR?

Generalmente 1-3 días laborales. Si es urgente, menciona al equipo.

### ¿Puedo contribuir a la documentación?

¡Absolutamente! La documentación es tan importante como el código.

## Recursos Adicionales

- [Arquitectura del Proyecto](ARCHITECTURE.md)
- [Guía de Estilo de Código](CODE_STYLE.md)
- [Guía de Deployment](DEPLOYMENT.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

**¡Gracias por contribuir a FleetManager! 🚗💨**
