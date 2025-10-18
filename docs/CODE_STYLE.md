# Guía de Estilo de Código

Esta guía establece las convenciones y estándares de código para el proyecto FleetManager.

## 📋 Tabla de Contenidos

1. [Principios Generales](#principios-generales)
2. [JavaScript/TypeScript](#javascripttypescript)
3. [React & JSX](#react--jsx)
4. [CSS & Tailwind](#css--tailwind)
5. [Naming Conventions](#naming-conventions)
6. [File Organization](#file-organization)
7. [Comments & Documentation](#comments--documentation)
8. [Error Handling](#error-handling)

---

## Principios Generales

### Los 4 Pilares del Código Limpio

1. **Legibilidad**: El código se lee más veces de las que se escribe
2. **Simplicidad**: Mantén las cosas simples (KISS)
3. **Consistencia**: Sigue siempre los mismos patrones
4. **Mantenibilidad**: Piensa en quien lo mantendrá (tú mismo en 6 meses)

### Reglas de Oro

```javascript
// ✅ DO: Código claro y expresivo
const activeVehicles = vehicles.filter(vehicle => vehicle.status === 'active');
const averageFuel = calculateAverageFuel(activeVehicles);

// ❌ DON'T: Código críptico
const av = vhs.filter(v => v.s === 'a');
const af = av.reduce((s, v) => s + v.f, 0) / av.length;
```

## JavaScript/TypeScript

### Variables y Constantes

```javascript
// ✅ Usar const por defecto
const MAX_VEHICLES = 100;
const API_URL = 'https://api.example.com';

// ✅ Usar let solo si el valor cambiará
let vehicleCount = 0;
vehicleCount++;

// ❌ NUNCA usar var
var oldStyle = 'deprecated';
```

### Funciones

```javascript
// ✅ Arrow functions para funciones cortas
const double = (n) => n * 2;
const sum = (a, b) => a + b;

// ✅ Funciones declaradas para lógica compleja
function calculateMaintenanceCost(vehicle) {
  const baseCost = vehicle.type === 'truck' ? 500 : 300;
  const mileageFactor = vehicle.mileage / 1000;
  return baseCost + mileageFactor * 10;
}

// ✅ Async/await para operaciones asíncronas
async function fetchVehicles() {
  try {
    const response = await api.getVehicles();
    return response.data;
  } catch (error) {
    handleError(error);
    return [];
  }
}

// ❌ Evitar callbacks anidados (callback hell)
getVehicles(function(vehicles) {
  getDrivers(function(drivers) {
    assignDrivers(vehicles, drivers, function(result) {
      // Too deep!
    });
  });
});
```

### Destructuring

```javascript
// ✅ Usar destructuring para objetos
const { id, plate, brand, model } = vehicle;
const { user, isAuthenticated } = useAuth();

// ✅ Usar destructuring en parámetros
function VehicleCard({ vehicle, onSelect }) {
  const { plate, status } = vehicle;
  // ...
}

// ✅ Con valores por defecto
const { status = 'active', fuel = 100 } = vehicle;

// ✅ Destructuring de arrays
const [vehicles, setVehicles] = useState([]);
const [first, second, ...rest] = array;
```

### Template Literals

```javascript
// ✅ Usar template literals para strings complejos
const message = `Vehicle ${plate} has ${fuel}% fuel remaining`;
const url = `${API_URL}/vehicles/${vehicleId}`;

// ❌ Evitar concatenación con +
const message = 'Vehicle ' + plate + ' has ' + fuel + '% fuel';
```

### Operadores Modernos

```javascript
// ✅ Optional chaining
const driverName = vehicle?.driver?.name ?? 'Unassigned';

// ✅ Nullish coalescing
const fuel = vehicle.fuel ?? 100;

// ✅ Spread operator
const updatedVehicle = { ...vehicle, status: 'maintenance' };
const allVehicles = [...activeVehicles, ...inactiveVehicles];

// ✅ Rest parameters
const filterVehicles = (...statuses) => {
  return vehicles.filter(v => statuses.includes(v.status));
};
```

### Arrays

```javascript
// ✅ Usar métodos de array modernos
const activeVehicles = vehicles.filter(v => v.status === 'active');
const plates = vehicles.map(v => v.plate);
const hasLowFuel = vehicles.some(v => v.fuel < 20);
const allFueled = vehicles.every(v => v.fuel > 50);
const total = vehicles.reduce((sum, v) => sum + v.fuel, 0);

// ✅ Encontrar elementos
const vehicle = vehicles.find(v => v.id === vehicleId);
const index = vehicles.findIndex(v => v.plate === plate);

// ❌ NO modificar arrays directamente en reducers
state.vehicles.push(newVehicle); // ❌
return { ...state, vehicles: [...state.vehicles, newVehicle] }; // ✅
```

### Objetos

```javascript
// ✅ Propiedades computadas
const key = 'status';
const vehicle = {
  [key]: 'active',
  [`${key}Updated`]: Date.now()
};

// ✅ Method shorthand
const vehicleService = {
  getAll() { /* ... */ },
  getById(id) { /* ... */ }
};

// ✅ Object shorthand
const id = '123';
const plate = 'ABC123';
const vehicle = { id, plate }; // En vez de { id: id, plate: plate }
```

## React & JSX

### Componentes Funcionales

```jsx
// ✅ Componente funcional con hooks
import React from 'react';

export const VehicleCard = ({ vehicle, onSelect }) => {
  const { plate, brand, model, status } = vehicle;
  
  const handleClick = () => {
    onSelect(vehicle.id);
  };
  
  return (
    <div className="vehicle-card" onClick={handleClick}>
      <h3>{plate}</h3>
      <p>{brand} {model}</p>
      <Badge status={status} />
    </div>
  );
};

// ❌ NO usar class components para nuevos componentes
class VehicleCard extends React.Component {
  // Evitar en código nuevo
}
```

### Props

```jsx
// ✅ Destructuring de props
const Button = ({ text, onClick, variant = 'primary' }) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {text}
    </button>
  );
};

// ✅ PropTypes o TypeScript para validación
Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary'])
};

// ✅ Spread props con cuidado
const Button = ({ text, ...rest }) => (
  <button {...rest}>{text}</button>
);
```

### Hooks

```jsx
// ✅ Orden consistente de hooks
const MyComponent = () => {
  // 1. Context
  const { state, dispatch } = useAppContext();
  
  // 2. State hooks
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  
  // 3. Refs
  const inputRef = useRef(null);
  
  // 4. Custom hooks
  const { vehicles } = useVehicles();
  const { user } = useAuth();
  
  // 5. Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // 6. Callbacks y memoización
  const handleClick = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const expensiveValue = useMemo(() => {
    return calculateExpensive(data);
  }, [data]);
  
  // 7. Render
  return <div>...</div>;
};

// ❌ NO usar hooks condicionalmente
if (condition) {
  const [state, setState] = useState(); // ❌ Error!
}
```

### Conditional Rendering

```jsx
// ✅ Renderizado condicional claro
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{!isLoading && !error && <Content data={data} />}

// ✅ Operador ternario para dos opciones
{isAuthenticated ? <Dashboard /> : <LoginPage />}

// ✅ Componente separado para lógica compleja
const VehicleStatus = ({ vehicle }) => {
  if (vehicle.status === 'active') {
    return <ActiveBadge />;
  }
  
  if (vehicle.status === 'maintenance') {
    return <MaintenanceBadge />;
  }
  
  return <InactiveBadge />;
};

// ❌ Evitar ternarios anidados complejos
{condition1 ? 
  (condition2 ? <A /> : <B />) : 
  (condition3 ? <C /> : <D />)
} // ❌ Difícil de leer
```

### Listas

```jsx
// ✅ Key prop única y estable
{vehicles.map(vehicle => (
  <VehicleCard 
    key={vehicle.id}  // ✅ Usar ID único
    vehicle={vehicle} 
  />
))}

// ❌ NO usar index como key si el orden puede cambiar
{vehicles.map((vehicle, index) => (
  <VehicleCard key={index} vehicle={vehicle} /> // ❌
))}
```

### Event Handlers

```jsx
// ✅ Nombrar con handle prefix
const handleSubmit = (e) => {
  e.preventDefault();
  // ...
};

const handleInputChange = (e) => {
  setValue(e.target.value);
};

// ✅ Pasar función directamente cuando no necesitas el evento
<button onClick={handleClose}>Close</button>

// ✅ Arrow function inline solo si necesitas pasar argumentos
<button onClick={() => handleDelete(id)}>Delete</button>

// ❌ NO crear funciones innecesarias en cada render
<button onClick={(e) => handleClose()}>  // ❌ Crea nueva función cada vez
```

## CSS & Tailwind

### Clases Tailwind

```jsx
// ✅ Orden lógico de clases Tailwind
<div className="
  flex items-center justify-between      // Layout & Flexbox
  w-full max-w-4xl                       // Sizing
  px-4 py-2 mx-auto                      // Spacing
  bg-white dark:bg-gray-800              // Colors
  border border-gray-200                 // Borders
  rounded-lg shadow-md                   // Border Radius & Shadows
  hover:shadow-lg                        // Hover States
  transition-shadow duration-200         // Transitions
">

// ✅ Extraer clases repetidas a constantes
const cardClasses = "bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow";
<div className={cardClasses}>

// ✅ Clases condicionales con template literals
const buttonClasses = `
  btn 
  ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
`;

// ✅ O usar una librería como clsx
import clsx from 'clsx';

const className = clsx(
  'btn',
  {
    'btn-primary': variant === 'primary',
    'btn-secondary': variant === 'secondary',
    'opacity-50 cursor-not-allowed': isDisabled
  }
);
```

### Responsive Design

```jsx
// ✅ Mobile-first approach
<div className="
  flex-col          // Mobile: columna
  md:flex-row       // Tablet+: fila
  lg:max-w-6xl      // Desktop: ancho máximo
">
```

## Naming Conventions

### Variables y Funciones

```javascript
// ✅ camelCase para variables y funciones
const vehicleCount = 10;
const activeVehicles = [];

function calculateTotal() {}
const getUserName = () => {};

// ❌ NO usar snake_case ni PascalCase
const vehicle_count = 10;  // ❌
const VehicleCount = 10;   // ❌
```

### Componentes

```javascript
// ✅ PascalCase para componentes
const VehicleCard = () => {};
const DashboardLayout = () => {};

// ✅ Nombres descriptivos
const UserProfileHeader = () => {};  // ✅
const UPH = () => {};                // ❌ Abreviaciones poco claras
```

### Constantes

```javascript
// ✅ UPPER_SNAKE_CASE para constantes
const MAX_VEHICLES = 100;
const API_BASE_URL = 'https://api.example.com';
const VEHICLE_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  PARKED: 'parked'
};
```

### Archivos

```
✅ PascalCase para componentes
VehicleCard.jsx
DashboardLayout.jsx

✅ camelCase para utilidades
formatDate.js
calculateDistance.js

✅ camelCase para hooks
useVehicles.js
useAuth.js

✅ kebab-case para CSS
vehicle-card.css
dashboard-layout.css
```

### Custom Hooks

```javascript
// ✅ Siempre empezar con 'use'
const useVehicles = () => {};
const useAuth = () => {};
const useLocalStorage = () => {};

// ❌ NO olvidar el prefijo 'use'
const vehicles = () => {};  // ❌ No es claro que es un hook
```

## File Organization

### Estructura de Archivos

```javascript
// ✅ Orden dentro de un archivo

// 1. Imports externos
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports internos
import { useVehicles } from '../hooks/useVehicles';
import { formatDate } from '../shared/utils';
import { VEHICLE_STATUS } from '../shared/constants';

// 3. Imports de componentes
import Card from '../components/Card';
import Table from '../components/Table';

// 4. Imports de estilos (si aplica)
import './Dashboard.css';

// 5. Constantes locales
const REFRESH_INTERVAL = 30000;

// 6. Componentes helper (privados)
const StatusBadge = ({ status }) => {
  // ...
};

// 7. Componente principal
const Dashboard = () => {
  // ...
};

// 8. Export
export default Dashboard;
```

### Importaciones

```javascript
// ✅ Agrupar y ordenar imports
// Externos primero, internos después
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useVehicles } from '@/hooks/useVehicles';
import { formatDate, calculateDistance } from '@/shared/utils';

import Button from '@/components/Button';
import Card from '@/components/Card';

// ✅ Named imports en orden alfabético
import { 
  calculateAverage,
  formatCurrency,
  generateId,
  sortBy 
} from '../utils';

// ❌ Evitar imports relativos profundos
import { utils } from '../../../shared/utils';  // ❌

// ✅ Usar alias de path
import { utils } from '@/shared/utils';  // ✅
```

## Comments & Documentation

### JSDoc para Funciones

```javascript
/**
 * Calcula el promedio de combustible de un array de vehículos
 * @param {Array<Vehicle>} vehicles - Array de objetos vehículo
 * @returns {number} Promedio de combustible (0-100)
 * @throws {Error} Si el array está vacío
 * 
 * @example
 * const avg = calculateFuelAverage(vehicles);
 * console.log(avg); // 75.5
 */
export const calculateFuelAverage = (vehicles) => {
  if (vehicles.length === 0) {
    throw new Error('Vehicle array cannot be empty');
  }
  
  const total = vehicles.reduce((sum, v) => sum + v.fuel, 0);
  return total / vehicles.length;
};
```

### Comentarios en Código

```javascript
// ✅ Comentar el "por qué", no el "qué"

// Usamos 30 segundos porque la API tiene rate limiting
const REFRESH_INTERVAL = 30000;

// ❌ NO comentar lo obvio
// Incrementa el contador
counter++;

// ✅ Comentar lógica compleja
// Calculamos el costo de mantenimiento basado en:
// 1. Tipo de vehículo (camión = más caro)
// 2. Kilometraje (factor multiplicador)
// 3. Última fecha de servicio (si es reciente, descuento)
const maintenanceCost = calculateMaintenanceCost(vehicle);

// ✅ TODO comments con contexto
// TODO(@username): Implementar paginación cuando tengamos >100 vehículos
// TODO: Refactorizar este componente en versión 2.0
// FIXME: Este cálculo falla con vehículos sin conductor asignado
```

### Documentación de Componentes

```jsx
/**
 * Componente de tarjeta de vehículo
 * 
 * Muestra información básica de un vehículo con opción de selección
 * 
 * @component
 * @param {Object} props
 * @param {Vehicle} props.vehicle - Objeto de vehículo
 * @param {Function} props.onSelect - Callback al seleccionar (recibe vehicleId)
 * @param {boolean} [props.showDetails=false] - Si se muestran detalles adicionales
 * 
 * @example
 * <VehicleCard 
 *   vehicle={vehicle} 
 *   onSelect={(id) => navigate(`/vehicles/${id}`)}
 *   showDetails={true}
 * />
 */
export const VehicleCard = ({ vehicle, onSelect, showDetails = false }) => {
  // ...
};
```

## Error Handling

### Try-Catch

```javascript
// ✅ Manejo apropiado de errores
async function fetchVehicles() {
  try {
    const response = await api.getVehicles();
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Notificar al usuario
    showNotification('Error al cargar vehículos', 'error');
    // Retornar valor por defecto
    return [];
  }
}

// ✅ Errores específicos
try {
  const vehicle = parseVehicleData(rawData);
} catch (error) {
  if (error instanceof ValidationError) {
    handleValidationError(error);
  } else if (error instanceof NetworkError) {
    handleNetworkError(error);
  } else {
    handleUnknownError(error);
  }
}
```

### Validaciones

```javascript
// ✅ Validar early, fallar early
function updateVehicle(vehicleId, updates) {
  // Validaciones al inicio
  if (!vehicleId) {
    throw new Error('Vehicle ID is required');
  }
  
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Updates object cannot be empty');
  }
  
  // Lógica principal
  const vehicle = findVehicle(vehicleId);
  return { ...vehicle, ...updates };
}
```

## Performance

### Memoización

```jsx
// ✅ useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return vehicles
    .filter(v => v.status === 'active')
    .map(v => calculateComplexMetrics(v))
    .reduce((sum, metrics) => sum + metrics.total, 0);
}, [vehicles]);

// ✅ useCallback para funciones pasadas como props
const handleVehicleSelect = useCallback((vehicleId) => {
  dispatch(selectVehicle(vehicleId));
  navigate(`/vehicles/${vehicleId}`);
}, [dispatch, navigate]);

// ✅ React.memo para componentes que no cambian frecuentemente
export const VehicleCard = React.memo(({ vehicle, onSelect }) => {
  // ...
});
```

---

## Herramientas de Linting

### ESLint

```bash
# Ejecutar linter
npm run lint

# Auto-fix problemas
npm run lint:fix
```

### Prettier

```bash
# Formatear código
npm run format

# Verificar formato
npm run format:check
```

---

**Recuerda**: La consistencia es más importante que la perfección. Sigue estas guías y el código será más fácil de mantener para todos. 🎯
