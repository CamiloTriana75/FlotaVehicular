# Corrección de Guardado de Vehículos

## Problema Identificado

El sistema de registro de vehículos validaba correctamente el formulario pero **no guardaba los datos en la base de datos**. El vehículo mostraba mensaje de éxito pero no persistía en la tabla `vehicles`.

### Causa Raíz

1. **Hook sin persistencia**: El hook `useVehicles` solo actualizaba el estado local de Redux, no llamaba a Supabase
2. **Servicio incorrecto**: El archivo `api/vehiculos.js` apuntaba a la tabla `vehiculo` (español) en vez de `vehicles` (estandarizada)
3. **Falta de validación de errores**: No se mostraban errores de BD al usuario

## Solución Implementada

### 1. Nuevo Servicio de Vehículos

**Archivo**: `src/services/vehicleService.js`

Servicio completo para operaciones CRUD en la tabla `vehicles`:

```javascript
export const vehicleService = {
  createFromForm, // Crea vehículo desde datos del formulario
  getAll, // Obtiene todos los vehículos
  getById, // Obtiene vehículo por ID
  getByPlaca, // Busca vehículo por placa
  update, // Actualiza vehículo existente
  deleteVehicle, // Elimina vehículo
  getByStatus, // Filtra por estado
};
```

**Mapeo de Campos**: El servicio convierte automáticamente los nombres del formulario a las columnas de BD:

| Formulario (camelCase)     | Base de Datos (español)      | Notas                    |
| -------------------------- | ---------------------------- | ------------------------ |
| `anio`                     | `año`                        | Año del vehículo         |
| `numeroMotor`              | `numero_motor`               | Número de motor          |
| `vin`                      | `numero_chasis`              | VIN → Número de chasis   |
| `capacidad`                | `capacidad_combustible`      | Capacidad del tanque     |
| `estado`                   | `status`                     | Estado operativo         |
| `fechaCompra`              | `fecha_compra`               | Fecha de compra          |
| `fechaUltimoMantenimiento` | `fecha_ultimo_mantenimiento` | Último mantenimiento     |
| `proximoMantenimientoKm`   | `proximo_mantenimiento_km`   | KM próximo mantenimiento |

**Campos NO soportados** (ignorados por el servicio, no existen en BD):

- `tipo` (Sedán, SUV, etc.)
- `tipoCombustible` (Gasolina, Diesel, etc.)
- `fechaProximoMantenimiento` (se usa `proximo_mantenimiento_km` en su lugar)
- `precioCompra` (no existe en esquema)

### 2. Actualización de NewVehiclePage

**Antes**:

```javascript
import { useVehicles } from '../hooks/useVehicles';

const { addVehicle } = useVehicles();
await addVehicle(vehicleData); // Solo Redux, no BD
```

**Después**:

```javascript
import { vehicleService } from '../services/vehicleService';

const { data, error: saveError } =
  await vehicleService.createFromForm(vehicleData);
// Valida error y muestra mensaje al usuario
```

**Mejoras**:

- ✅ Persistencia en base de datos
- ✅ Validación de errores
- ✅ Mensaje de error visible para el usuario
- ✅ Logs en consola para debugging

### 3. Actualización de VehiclesList

**Antes**:

```javascript
import { mockVehicles } from '../data/mockVehicles';
// Mostraba datos falsos
```

**Después**:

```javascript
import { vehicleService } from '../services/vehicleService';

useEffect(() => {
  loadVehicles(); // Carga desde BD
}, []);

const { data, error } = await vehicleService.getAll();
```

**Mejoras**:

- ✅ Carga datos reales de la BD
- ✅ Estado de carga (spinner)
- ✅ Manejo de errores con botón de reintento
- ✅ Columnas actualizadas: Placa, Marca, Modelo, Año, Color, Estado
- ✅ Estados correctos: disponible, asignado, mantenimiento

## Validaciones Implementadas

### En el Servicio

```javascript
// Validar campos requeridos
if (
  !vehicleData.placa ||
  !vehicleData.marca ||
  !vehicleData.modelo ||
  !vehicleData.año
) {
  throw new Error('Campos requeridos faltantes: placa, marca, modelo, año');
}
```

### En la UI

```jsx
{
  error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <AlertCircle className="h-6 w-6 text-red-600" />
      <p className="text-red-800 font-medium">Error al guardar el vehículo</p>
      <p className="text-red-700 text-sm">{error}</p>
    </div>
  );
}
```

## Esquema de Base de Datos

**Tabla**: `vehicles` (esquema actual en `white_temple.sql`)

```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  año INTEGER,
  marca VARCHAR(50),
  color VARCHAR(30),
  numero_chasis VARCHAR(50),
  numero_motor VARCHAR(50),
  capacidad_combustible DECIMAL(5,2) DEFAULT 0,
  kilometraje INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'activo'
    CHECK (status IN ('activo', 'estacionado', 'mantenimiento', 'inactivo')),
  fecha_compra DATE,
  fecha_ultimo_mantenimiento DATE,
  proximo_mantenimiento_km INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Estados Válidos**:

- `activo` - Vehículo en operación
- `estacionado` - Vehículo parqueado temporalmente
- `mantenimiento` - En taller o servicio
- `inactivo` - Fuera de servicio

## Pruebas de Funcionamiento

### 1. Crear Vehículo

1. Ir a `/vehiculos/nuevo`
2. Llenar formulario con datos mínimos:
   - **Placa**: `ABC-123` (requerido)
   - **Marca**: `Toyota` (requerido)
   - **Modelo**: `Corolla` (requerido)
   - **Año**: `2025`
   - **Color**: `Blanco`
   - **Estado**: `activo`
   - **Kilometraje**: `0`
   - (Los demás campos son opcionales)

3. Click en "Guardar Vehículo"
4. **Verificar**:
   - ✅ Mensaje verde "¡Vehículo registrado exitosamente!"
   - ✅ Redirección a `/vehiculos` después de 2 segundos
   - ✅ Vehículo aparece en la lista
   - ✅ Datos guardados en BD correctamente

### 2. Verificar en BD

```sql
-- Consultar el vehículo creado
SELECT * FROM vehicles WHERE placa = 'ABC-123';

-- Debe retornar:
-- id | placa   | marca  | modelo  | año  | ...
-- 1  | ABC-123 | Toyota | Corolla | 2025 | ...
```

### 3. Verificar en Lista

1. Ir a `/vehiculos`
2. **Verificar**:
   - ✅ Lista carga desde BD (no mock data)
   - ✅ Muestra spinner mientras carga
   - ✅ Vehículo recién creado aparece
   - ✅ Datos correctos en columnas

### 4. Verificar en Asignaciones

1. Ir a `/asignaciones`
2. Click en "Nueva Asignación"
3. En el selector de vehículos:
   - ✅ Vehículo `ABC-123` aparece disponible
   - ✅ Muestra: "ABC-123 - Toyota Corolla"

## Cambios en Archivos

### Archivos Nuevos

- ✅ `src/services/vehicleService.js` - Servicio completo de vehículos

### Archivos Modificados

- ✅ `src/pages/NewVehiclePage.jsx` - Usa vehicleService en vez de hook
- ✅ `src/pages/VehiclesList.jsx` - Carga datos de BD, estados de loading/error

### Archivos Sin Cambios

- `src/hooks/useVehicles.js` - Se mantiene para estado local/Redux
- `src/api/vehiculos.js` - Legacy, se puede deprecar
- `src/components/VehicleForm.jsx` - Funciona correctamente

## Próximos Pasos

### Recomendado

1. ✅ **Probar creación de vehículos** con datos reales
2. ✅ **Verificar integración con asignaciones** - vehículo debe aparecer en selector
3. ⏳ **Actualizar VehicleDetail** para usar vehicleService.getById()
4. ⏳ **Migrar edición de vehículos** a vehicleService.update()
5. ⏳ **Deprecar api/vehiculos.js** una vez migrado todo

### Opcional

- Agregar validación de placa única en frontend (consultar BD antes de guardar)
- Agregar autocompletado de marcas/modelos desde catálogo
- Implementar carga de imagen del vehículo
- Historial de mantenimientos del vehículo

## Notas Técnicas

### Diferencia entre Hook y Servicio

**Hook `useVehicles()`**:

- Maneja estado local (Redux)
- Útil para UI reactiva
- No persiste en BD

**Servicio `vehicleService`**:

- Comunica con Supabase
- Persistencia real
- Independiente de React

**Arquitectura Actual**:

```
VehicleForm → NewVehiclePage → vehicleService → Supabase
                    ↓
              vehicleService.getAll() → vehicles state → VehiclesList
```

### Mapeo Automático

El servicio acepta tanto `anio` como `año`:

```javascript
año: formData.anio || formData.año;
```

Esto permite flexibilidad sin romper código existente.

---

**Fecha**: 2025-01-11  
**Autor**: GitHub Copilot  
**Contexto**: Corrección de HU3 - Asignación de Vehículos a Conductores
