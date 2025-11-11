# 🚗 Sistema de Asignación de Vehículos a Conductores

## HU3: Asociar Vehículos a Conductores con Fechas y Horarios

Este módulo permite a los supervisores asignar vehículos a conductores con rangos específicos de fecha/hora, validando automáticamente que no haya solapamientos.

---

## 📋 Características Principales

✅ **Crear asignaciones** de vehículos a conductores con fecha/hora  
✅ **Validación automática** de solapamientos (trigger en base de datos)  
✅ **Gestión completa**: Crear, editar, completar, cancelar  
✅ **Filtros avanzados** por vehículo, conductor, fecha, estado  
✅ **Auditoría completa** (quién creó, timestamps)  
✅ **Row Level Security** (multi-tenant)  
✅ **Tests automatizados**

---

## 🚀 Instalación y Configuración

### 1. Ejecutar Migraciones

Asegúrate de que Supabase esté configurado y ejecuta las migraciones:

```bash
# Navegar al directorio de Supabase
cd supabase

# Ejecutar migraciones
npx supabase db push

# O ejecutar migración específica
npx supabase migration up
```

**Migraciones incluidas:**

- `20251111000001_vehicle_assignments.sql` - Tabla de asignaciones y funciones
- `20251111000002_add_supervisor_user.sql` - Usuario supervisor

### 2. Crear Usuario Supervisor

Opción A: **Ejecutar migración SQL** (recomendado)

```bash
# La migración 20251111000002_add_supervisor_user.sql ya crea los usuarios
# Solo necesitas ejecutar las migraciones
```

Opción B: **Usar script Node.js**

```bash
# Asegúrate de tener las variables de entorno configuradas
cp .env.example .env
# Edita .env y agrega SUPABASE_SERVICE_ROLE_KEY

# Ejecutar script
node scripts/create-supervisor.js
```

**Credenciales por defecto:**

- **Usuario 1:**
  - Email: `supervisor@flotavehicular.com`
  - Username: `supervisor`
  - Password: `Supervisor123!`
  - Rol: `supervisor`

- **Usuario 2:**
  - Email: `turnos@flotavehicular.com`
  - Username: `supervisor_turnos`
  - Password: `Turnos2025$`
  - Rol: `supervisor`

⚠️ **IMPORTANTE:** Cambiar estas contraseñas en el primer login

---

## 🗄️ Estructura de Base de Datos

### Tabla: `vehicle_assignments`

```sql
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    company_id UUID REFERENCES companies(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);
```

### Funciones SQL

| Función                                         | Descripción                                      |
| ----------------------------------------------- | ------------------------------------------------ |
| `check_assignment_overlap()`                    | Trigger que valida solapamientos automáticamente |
| `get_active_assignments_by_vehicle(vehicle_id)` | Obtiene asignaciones activas de un vehículo      |
| `get_active_assignments_by_driver(driver_id)`   | Obtiene asignaciones activas de un conductor     |
| `complete_assignment(assignment_id, user_id)`   | Marca asignación como completada                 |
| `cancel_assignment(assignment_id, user_id)`     | Cancela una asignación                           |

### Vista: `v_active_assignments`

Vista optimizada con información completa de asignaciones activas.

---

## 💻 Uso de la Interfaz

### Acceder al Módulo

1. Autenticarse como supervisor
2. Navegar a **Asignaciones** en el menú
3. La página muestra:
   - Estadísticas (Total, Activas, Completadas, Canceladas)
   - Botón "Nueva Asignación"
   - Filtros avanzados
   - Lista de asignaciones

### Crear una Nueva Asignación

1. Clic en **"➕ Nueva Asignación"**
2. Seleccionar:
   - **Vehículo**: Placa del vehículo a asignar
   - **Conductor**: Conductor que manejará el vehículo
   - **Fecha/Hora Inicio**: Cuándo comienza la asignación
   - **Fecha/Hora Fin**: Cuándo termina la asignación
   - **Notas** (opcional): Información adicional
3. El sistema validará automáticamente:
   - ✅ Fecha de fin posterior a inicio
   - ✅ No solapamiento con otras asignaciones del conductor
   - ✅ No solapamiento con otras asignaciones del vehículo
4. Clic en **"Crear Asignación"**

### Gestionar Asignaciones Existentes

**Para asignaciones ACTIVAS:**

- ✏️ **Editar**: Modificar fechas o notas
- ✓ **Completar**: Marcar como completada
- ✗ **Cancelar**: Cancelar la asignación
- 🗑️ **Eliminar**: Solo si no ha iniciado

**Estados visuales:**

- 🚗 **EN CURSO**: Badge verde - La asignación está activa ahora
- ⏰ **PENDIENTE**: Badge amarillo - Iniciará en el futuro

### Filtrar Asignaciones

**Filtros disponibles:**

- **Modo de Vista**: Todas / Solo Activas
- **Estado**: Todos / Activa / Completada / Cancelada
- **Vehículo**: Filtrar por vehículo específico
- **Conductor**: Filtrar por conductor específico
- **Rango de Fechas**: Desde / Hasta

---

## 🔧 API del Servicio

### Importar el servicio

```javascript
import assignmentService from '../services/assignmentService';
```

### Métodos disponibles

#### Crear asignación

```javascript
const result = await assignmentService.createAssignment({
  vehicleId: 'uuid-vehiculo',
  driverId: 'uuid-conductor',
  startTime: new Date('2025-11-15T09:00:00'),
  endTime: new Date('2025-11-15T17:00:00'),
  notes: 'Turno matutino',
});

if (result.error) {
  console.error(result.error.message);
} else {
  console.log('Asignación creada:', result.data);
}
```

#### Obtener asignaciones con filtros

```javascript
const result = await assignmentService.getAssignments({
  vehicleId: 'uuid-vehiculo', // opcional
  driverId: 'uuid-conductor', // opcional
  status: 'active', // opcional
  startDate: new Date(), // opcional
  endDate: new Date(), // opcional
});
```

#### Verificar conflictos antes de guardar

```javascript
const conflicts = await assignmentService.checkAssignmentConflicts({
  vehicleId: 'uuid-vehiculo',
  driverId: 'uuid-conductor',
  startTime: '2025-11-15T09:00:00Z',
  endTime: '2025-11-15T17:00:00Z',
});

if (conflicts.hasConflict) {
  console.log('Conflictos de conductor:', conflicts.driverConflicts);
  console.log('Conflictos de vehículo:', conflicts.vehicleConflicts);
}
```

#### Completar asignación

```javascript
const result = await assignmentService.completeAssignment('uuid-asignacion');
```

#### Cancelar asignación

```javascript
const result = await assignmentService.cancelAssignment('uuid-asignacion');
```

#### Obtener estadísticas

```javascript
const stats = await assignmentService.getAssignmentStats();
console.log(stats); // { total: 50, active: 10, completed: 35, cancelled: 5 }
```

---

## 🧪 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests de asignaciones
npm test assignments.test.js

# Ejecutar con coverage
npm run test:coverage
```

**Tests incluidos:**

- ✅ Crear asignación válida
- ✅ Detectar solapamientos de conductor
- ✅ Detectar solapamientos de vehículo
- ✅ Permitir asignaciones consecutivas
- ✅ Completar/Cancelar asignaciones
- ✅ Actualizar asignaciones
- ✅ Consultas con filtros
- ✅ Verificación de conflictos

---

## 📝 Casos de Uso Comunes

### Ejemplo 1: Turno Matutino

```javascript
// Carlos trabaja de 6am a 2pm en el vehículo ABC-123
await assignmentService.createAssignment({
  vehicleId: vehiculoABC123,
  driverId: conductorCarlos,
  startTime: new Date('2025-11-15T06:00:00'),
  endTime: new Date('2025-11-15T14:00:00'),
  notes: 'Turno matutino - Ruta norte',
});
```

### Ejemplo 2: Turno Vespertino (Consecutivo)

```javascript
// María toma el mismo vehículo de 2pm a 10pm
await assignmentService.createAssignment({
  vehicleId: vehiculoABC123,
  driverId: conductoraMaria,
  startTime: new Date('2025-11-15T14:00:00'),
  endTime: new Date('2025-11-15T22:00:00'),
  notes: 'Turno vespertino - Ruta sur',
});
```

### Ejemplo 3: Asignación de Múltiples Días

```javascript
// Asignación de lunes a viernes, 8 horas diarias
for (let day = 0; day < 5; day++) {
  const startDate = new Date('2025-11-15');
  startDate.setDate(startDate.getDate() + day);
  startDate.setHours(8, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(16, 0, 0, 0);

  await assignmentService.createAssignment({
    vehicleId: vehiculo,
    driverId: conductor,
    startTime: startDate,
    endTime: endDate,
    notes: `Turno semanal - Día ${day + 1}`,
  });
}
```

---

## 🔒 Seguridad y Permisos

### Row Level Security (RLS)

Las políticas RLS garantizan que:

- ✅ Usuarios solo ven asignaciones de su compañía
- ✅ Solo supervisores/admins pueden crear/editar asignaciones
- ✅ Los datos están aislados por tenant (multi-tenant)

### Roles y Permisos

| Rol            | Ver             | Crear | Editar | Eliminar |
| -------------- | --------------- | ----- | ------ | -------- |
| **Admin**      | ✅              | ✅    | ✅     | ✅       |
| **Supervisor** | ✅              | ✅    | ✅     | ✅       |
| **Operador**   | ✅              | ❌    | ❌     | ❌       |
| **Conductor**  | ✅ (solo suyas) | ❌    | ❌     | ❌       |

---

## 🐛 Troubleshooting

### Error: "El conductor ya tiene una asignación en este rango de tiempo"

**Causa:** Intento de crear asignación con solapamiento de horarios.

**Solución:**

1. Verificar asignaciones existentes del conductor
2. Ajustar horarios para no solapar
3. O cancelar/completar asignación anterior

```sql
-- Consultar asignaciones del conductor
SELECT * FROM get_active_assignments_by_driver('conductor-id');
```

### Error: "No se pueden modificar asignaciones completadas o canceladas"

**Causa:** Intento de editar una asignación finalizada.

**Solución:**

- Las asignaciones completadas/canceladas son solo lectura
- Crear una nueva asignación si es necesario

### Error: "Usuario no autenticado"

**Causa:** Token de sesión expirado o no válido.

**Solución:**

1. Cerrar sesión
2. Volver a iniciar sesión
3. Verificar credenciales

### Error: "No se puede eliminar una asignación que ya inició"

**Causa:** Solo se pueden eliminar asignaciones pendientes (no iniciadas).

**Solución:**

- Usar "Cancelar" en lugar de "Eliminar" para asignaciones en curso

---

## 📚 Documentación Adicional

- **Guía de Pruebas:** Ver `GUIA_PRUEBAS_HU3.md`
- **Arquitectura:** Ver `docs/ARQUITECTURA.md`
- **Backlog:** Ver `docs/BACKLOG_ACTUALIZADO.md`

---

## 🤝 Contribuir

1. Crear rama feature desde `develop`
2. Implementar cambios
3. Ejecutar tests: `npm test`
4. Crear Pull Request
5. Revisar y aprobar

---

## 📞 Soporte

Para problemas o preguntas:

- Crear issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar documentación técnica

---

## ✅ Checklist de Implementación

- [x] Migración de base de datos
- [x] Triggers de validación
- [x] Funciones SQL
- [x] Servicio JavaScript
- [x] Componentes React
- [x] Página principal
- [x] Tests unitarios
- [x] Tests de integración
- [x] Documentación
- [x] Guía de pruebas
- [x] Script de usuario supervisor

---

**Versión:** 1.0.0  
**Fecha:** 2025-11-11  
**Historia de Usuario:** HU3  
**Sprint:** Sprint 2
