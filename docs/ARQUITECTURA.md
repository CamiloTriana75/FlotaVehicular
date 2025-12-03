# Arquitectura del Sistema FleetManager

## Índice

1. [Introducción](#introducción)
2. [Principios de Arquitectura](#principios-de-arquitectura)
3. [Arquitectura Unidireccional](#arquitectura-unidireccional)
4. [Capas de la Aplicación](#capas-de-la-aplicación)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Gestión de Estado](#gestión-de-estado)
7. [Flujo de Datos](#flujo-de-datos)
8. [Estructura de Carpetas](#estructura-de-carpetas)

---

## Introducción

FleetManager implementa una **arquitectura moderna basada en React** con un enfoque en:

- 🎯 **Escalabilidad**: Fácil de extender con nuevas funcionalidades
- 🔒 **Mantenibilidad**: Código organizado y predecible
- ⚡ **Performance**: Optimizado para aplicaciones grandes
- 🧪 **Testabilidad**: Lógica separada de la UI
- 📚 **Documentación**: Código auto-documentado

## Principios de Arquitectura

### 1. Separation of Concerns (SoC)

Cada módulo tiene una responsabilidad única y bien definida:

```
- Components: Solo presentación visual
- Hooks: Lógica reutilizable
- Store: Gestión de estado
- Entities: Lógica de negocio
- Utils: Funciones auxiliares
```

### 2. Single Source of Truth

El estado de la aplicación vive en un único lugar centralizado (Store Global).

### 3. Unidirectional Data Flow

Los datos fluyen en una sola dirección, haciendo el flujo predecible y debuggeable.

### 4. DRY (Don't Repeat Yourself)

Código reutilizable mediante hooks personalizados y utilidades.

### 5. SOLID Principles

- **S**: Single Responsibility - Cada módulo tiene una responsabilidad
- **O**: Open/Closed - Abierto para extensión, cerrado para modificación
- **L**: Liskov Substitution - Los hooks pueden reemplazarse sin romper la app
- **I**: Interface Segregation - Interfaces específicas para cada necesidad
- **D**: Dependency Inversion - Dependemos de abstracciones, no de implementaciones

## Arquitectura Unidireccional

### Flux Pattern Implementado

```
┌──────────┐
│  Action  │ ← Usuario interactúa con la UI
└────┬─────┘
     │
     ▼
┌──────────┐
│ Dispatch │ ← Despacha la acción
└────┬─────┘
     │
     ▼
┌──────────┐
│ Reducer  │ ← Calcula nuevo estado (puro)
└────┬─────┘
     │
     ▼
┌──────────┐
│  Store   │ ← Estado global actualizado
└────┬─────┘
     │
     ▼
┌──────────┐
│   View   │ ← UI se re-renderiza
└──────────┘
```

### Ventajas del Flujo Unidireccional

1. **Predecibilidad**: Siempre sabes cómo y dónde cambia el estado
2. **Debuggeabilidad**: Fácil seguir el flujo de datos
3. **Testing**: Reducers puros son fáciles de testear
4. **Time-travel debugging**: Puedes volver atrás en el tiempo
5. **Undo/Redo**: Fácil implementar funcionalidad de deshacer

## Capas de la Aplicación

### Capa 1: Presentación (UI)

**Responsabilidad**: Renderizar componentes visuales y capturar interacciones del usuario.

```
src/
├── components/     # Componentes reutilizables
└── pages/          # Páginas/Vistas
```

**Características**:

- Sin lógica de negocio
- Solo presentación y manejo de eventos
- Reciben datos vía props o hooks
- Componentes funcionales con React Hooks

### Capa 2: Aplicación

**Responsabilidad**: Coordinar entre la UI y el dominio.

```
src/
├── hooks/          # Custom hooks
└── store/          # Estado global
    ├── actions/    # Creadores de acciones
    ├── reducers/   # Lógica de actualización
    └── context/    # Proveedor de contexto
```

**Características**:

- Hooks personalizados encapsulan lógica
- Store maneja estado global
- Actions son objetos planos
- Reducers son funciones puras

### Capa 3: Dominio (Core)

**Responsabilidad**: Lógica de negocio independiente del framework.

```
src/core/
├── entities/       # Entidades del dominio
└── use-cases/      # Casos de uso
```

**Características**:

- Independiente de React
- Lógica de negocio pura
- Entidades con métodos de negocio
- Validaciones y reglas

### Capa 4: Infraestructura

**Responsabilidad**: Servicios externos y utilidades.

```
src/
├── lib/            # Clientes de APIs
└── shared/         # Utilidades compartidas
    ├── constants/  # Constantes
    └── utils/      # Funciones helper
```

## Patrones de Diseño

### 1. Context API + useReducer (Flux Pattern)

```javascript
// Estado centralizado
const [state, dispatch] = useReducer(rootReducer, initialState);

// Despachar acciones
dispatch({ type: 'ADD_VEHICLE', payload: vehicle });
```

### 2. Custom Hooks Pattern

```javascript
// Encapsular lógica reutilizable
export const useVehicles = () => {
  const { state, dispatch } = useAppContext();

  const addVehicle = (vehicle) => {
    dispatch(addVehicleAction(vehicle));
  };

  return { vehicles: state.vehicles, addVehicle };
};
```

### 3. Composition Pattern

```javascript
// Componentes compuestos
<Dashboard>
  <Card title="KPI 1" />
  <Card title="KPI 2" />
  <MapViewer vehicles={vehicles} />
</Dashboard>
```

### 4. Render Props / Children Pattern

```javascript
<DataProvider>{(data) => <DisplayData data={data} />}</DataProvider>
```

### 5. HOC (Higher Order Components)

```javascript
const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? (
      <Component {...props} />
    ) : (
      <Redirect to="/login" />
    );
  };
};
```

## Gestión de Estado

### Estado Local vs Global

**Estado Local** (useState):

- Datos específicos de un componente
- No se comparten entre componentes
- Ejemplo: estado de un formulario, modal abierto/cerrado

**Estado Global** (Context + useReducer):

- Datos compartidos por múltiples componentes
- Persiste entre navegación
- Ejemplo: usuario autenticado, lista de vehículos

### Estructura del Estado Global

```javascript
{
  auth: {
    user: { id, email, name },
    isAuthenticated: true,
    isMockMode: true,
    loading: false,
    error: null
  },
  vehicles: {
    vehicles: [...],
    filteredVehicles: [...],
    selectedVehicle: null,
    filters: { status: 'all', searchTerm: '' },
    loading: false,
    error: null
  },
  drivers: {
    drivers: [...],
    selectedDriver: null,
    loading: false,
    error: null
  }
}
```

### Inmutabilidad

Los reducers NUNCA modifican el estado directamente:

```javascript
// ❌ Incorrecto
state.vehicles.push(newVehicle);

// ✅ Correcto
return {
  ...state,
  vehicles: [...state.vehicles, newVehicle],
};
```

## Flujo de Datos

### Ejemplo Completo: Agregar un Vehículo

```
1. Usuario completa formulario
   └─> Component: VehicleForm

2. Usuario hace click en "Guardar"
   └─> Event Handler: handleSubmit()

3. Se llama al hook personalizado
   └─> Hook: useVehicles().addVehicle(data)

4. Hook crea y despacha acción
   └─> Action: { type: 'ADD_VEHICLE', payload: vehicle }

5. Reducer procesa la acción
   └─> Reducer: vehicleReducer(state, action)

6. Reducer retorna nuevo estado
   └─> New State: { ...state, vehicles: [...vehicles, newVehicle] }

7. Context notifica cambio
   └─> Context: Re-renderiza componentes suscritos

8. UI se actualiza automáticamente
   └─> Component: VehiclesList muestra nuevo vehículo
```

### Actualización Optimista

Para mejor UX, actualizamos la UI antes de confirmar con el servidor:

```javascript
// 1. Actualizar UI inmediatamente
dispatch({ type: 'ADD_VEHICLE', payload: vehicle });

// 2. Guardar en servidor
try {
  const saved = await api.createVehicle(vehicle);
  // 3. Confirmar con datos del servidor
  dispatch({ type: 'UPDATE_VEHICLE', payload: saved });
} catch (error) {
  // 4. Revertir si falla
  dispatch({ type: 'DELETE_VEHICLE', payload: vehicle.id });
  dispatch({ type: 'SET_ERROR', payload: error.message });
}
```

## Estructura de Carpetas

### Organización por Feature vs por Tipo

Este proyecto usa **organización por tipo** en el nivel superior y **por feature** en subdirectorios:

```
src/
├── core/           # Lógica de negocio (por feature)
│   └── entities/   # Vehicle, Driver, Route
├── store/          # Estado global (por feature)
│   ├── actions/    # authActions, vehicleActions
│   └── reducers/   # authReducer, vehicleReducer
├── hooks/          # Hooks (por feature)
│   ├── useAuth.js
│   └── useVehicles.js
└── components/     # UI components (reutilizables)
```

### Convenciones de Nombres

- **Componentes**: PascalCase (`VehiclesList.jsx`)
- **Hooks**: camelCase con 'use' (`useVehicles.js`)
- **Utilidades**: camelCase (`formatDate.js`)
- **Constantes**: UPPER_SNAKE_CASE (`VEHICLE_STATUS`)
- **Actions**: UPPER_SNAKE_CASE (`ADD_VEHICLE`)

## Conclusión

Esta arquitectura proporciona:

✅ **Escalabilidad**: Fácil agregar nuevas features
✅ **Mantenibilidad**: Código organizado y predecible
✅ **Testabilidad**: Lógica separada de UI
✅ **Performance**: Optimizaciones de React
✅ **Developer Experience**: Estructura clara y consistente

## Referencias

- [React Context API](https://react.dev/reference/react/useContext)
- [useReducer Hook](https://react.dev/reference/react/useReducer)
- [Flux Architecture](https://facebook.github.io/flux/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
