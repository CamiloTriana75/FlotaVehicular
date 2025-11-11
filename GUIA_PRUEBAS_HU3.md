# Guía de Pruebas - HU3: Asociar Vehículos a Conductores

## 📋 Historia de Usuario

**Como** supervisor  
**Quiero** asignar vehículos a conductores con rango de fechas/horarios  
**Para** coordinar turnos y responsabilidades

---

## 🎯 Criterios de Aceptación

### ✅ CA1: Crear asignación válida sin solapamientos

- El sistema debe permitir crear una asignación válida
- No debe haber conflictos de horarios con otras asignaciones
- Se debe registrar quién creó la asignación

### ✅ CA2: Ver lista de asignaciones activas

- Por vehículo
- Por conductor
- Con filtros de fecha y estado

### ✅ CA3: Registro de cambios

- Campo `created_by` con el usuario que creó
- Timestamps automáticos (`created_at`, `updated_at`)
- Registro de completado y cancelado

---

## 🧪 Casos de Prueba

### Caso de Prueba 1: Crear Asignación Válida

**Descripción:** Verificar que se puede crear una asignación sin conflictos

**Precondiciones:**

- Usuario con rol supervisor autenticado
- Existe al menos un vehículo disponible
- Existe al menos un conductor disponible
- No hay asignaciones activas en el rango de tiempo seleccionado

**Pasos:**

1. Navegar a la página de Asignaciones
2. Hacer clic en "Nueva Asignación"
3. Seleccionar vehículo: ABC-123
4. Seleccionar conductor: Carlos Mendoza
5. Fecha inicio: Mañana a las 09:00
6. Fecha fin: Mañana a las 17:00
7. Notas: "Turno matutino - Ruta centro"
8. Hacer clic en "Crear Asignación"

**Resultado Esperado:**

- ✅ Asignación creada exitosamente
- ✅ Se muestra mensaje de confirmación
- ✅ La asignación aparece en la lista con estado "Activa"
- ✅ Se registra el usuario que la creó

---

### Caso de Prueba 2: Detectar Solapamiento de Conductor

**Descripción:** El sistema debe bloquear asignaciones que solapen horarios del mismo conductor

**Precondiciones:**

- Existe una asignación activa:
  - Conductor: Carlos Mendoza
  - Vehículo: ABC-123
  - Horario: Mañana 09:00 - 13:00

**Pasos:**

1. Intentar crear nueva asignación:
   - Conductor: Carlos Mendoza (mismo conductor)
   - Vehículo: DEF-456 (diferente vehículo)
   - Horario: Mañana 12:00 - 15:00 (solapa con la anterior)
2. Hacer clic en "Crear Asignación"

**Resultado Esperado:**

- ❌ El sistema muestra advertencia de conflicto
- ❌ El botón de crear está deshabilitado
- ⚠️ Se muestra detalle del conflicto:
  - "El conductor ya tiene una asignación en este rango de tiempo"
  - Detalles de la asignación conflictiva
- ❌ No se permite guardar la asignación

**Validación SQL:**

```sql
SELECT * FROM vehicle_assignments
WHERE driver_id = 'id-carlos'
  AND status = 'active'
  AND tstzrange(start_time, end_time) && tstzrange('2025-11-12 12:00', '2025-11-12 15:00');
```

---

### Caso de Prueba 3: Detectar Solapamiento de Vehículo

**Descripción:** El sistema debe bloquear asignaciones que solapen horarios del mismo vehículo

**Precondiciones:**

- Existe una asignación activa:
  - Conductor: Carlos Mendoza
  - Vehículo: ABC-123
  - Horario: Mañana 09:00 - 13:00

**Pasos:**

1. Intentar crear nueva asignación:
   - Conductor: María García (diferente conductor)
   - Vehículo: ABC-123 (mismo vehículo)
   - Horario: Mañana 11:00 - 15:00 (solapa con la anterior)
2. Hacer clic en "Crear Asignación"

**Resultado Esperado:**

- ❌ El sistema muestra advertencia de conflicto
- ❌ El botón de crear está deshabilitado
- ⚠️ Se muestra detalle del conflicto:
  - "El vehículo ya tiene una asignación en este rango de tiempo"
  - Detalles de la asignación conflictiva
- ❌ No se permite guardar la asignación

---

### Caso de Prueba 4: Asignaciones Consecutivas

**Descripción:** Verificar que se permiten asignaciones consecutivas sin solapamiento

**Precondiciones:**

- Existe una asignación:
  - Conductor: Carlos Mendoza
  - Vehículo: ABC-123
  - Horario: Mañana 09:00 - 13:00

**Pasos:**

1. Crear nueva asignación:
   - Conductor: Carlos Mendoza (mismo conductor)
   - Vehículo: ABC-123 (mismo vehículo)
   - Horario: Mañana 13:00 - 17:00 (inmediatamente después)
2. Hacer clic en "Crear Asignación"

**Resultado Esperado:**

- ✅ Asignación creada exitosamente
- ✅ No hay conflictos detectados
- ✅ Ambas asignaciones aparecen en la lista

---

### Caso de Prueba 5: Ver Asignaciones Activas por Vehículo

**Descripción:** Listar todas las asignaciones activas de un vehículo específico

**Precondiciones:**

- Existen varias asignaciones en la base de datos
- Al menos 2 asignaciones para el vehículo ABC-123

**Pasos:**

1. Navegar a la página de Asignaciones
2. En filtros, seleccionar:
   - Vehículo: ABC-123
   - Estado: Activa
3. Aplicar filtros

**Resultado Esperado:**

- ✅ Se muestran solo asignaciones del vehículo ABC-123
- ✅ Se muestran solo asignaciones con estado "Activa"
- ✅ Cada asignación muestra:
  - Placa del vehículo
  - Nombre del conductor
  - Fechas y horarios
  - Duración
  - Notas
  - Estado

**Validación SQL:**

```sql
SELECT * FROM v_active_assignments
WHERE vehicle_id = 'id-vehiculo-abc123'
  AND status = 'active'
ORDER BY start_time;
```

---

### Caso de Prueba 6: Ver Asignaciones Activas por Conductor

**Descripción:** Listar todas las asignaciones activas de un conductor específico

**Pasos:**

1. Navegar a la página de Asignaciones
2. En filtros, seleccionar:
   - Conductor: Carlos Mendoza
   - Modo de vista: Solo Activas
3. Aplicar filtros

**Resultado Esperado:**

- ✅ Se muestran solo asignaciones de Carlos Mendoza
- ✅ Se muestran solo asignaciones activas
- ✅ Ordenadas por fecha de inicio

---

### Caso de Prueba 7: Completar Asignación

**Descripción:** Marcar una asignación como completada

**Precondiciones:**

- Existe una asignación activa

**Pasos:**

1. Localizar una asignación activa en la lista
2. Hacer clic en botón "✓ Completar"
3. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Estado cambia a "Completada"
- ✅ Se registra la fecha de completado
- ✅ Ya no aparece en la lista de "Activas"
- ✅ Aparece en la lista de "Completadas"
- ❌ No se puede editar ni volver a completar

**Validación SQL:**

```sql
SELECT status, completed_at
FROM vehicle_assignments
WHERE id = 'id-asignacion'
  AND status = 'completed'
  AND completed_at IS NOT NULL;
```

---

### Caso de Prueba 8: Cancelar Asignación

**Descripción:** Cancelar una asignación activa

**Precondiciones:**

- Existe una asignación activa

**Pasos:**

1. Localizar una asignación activa en la lista
2. Hacer clic en botón "✗ Cancelar"
3. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Estado cambia a "Cancelada"
- ✅ Se registra la fecha de cancelación
- ✅ Ya no aparece en la lista de "Activas"
- ✅ Aparece en la lista de "Canceladas"

---

### Caso de Prueba 9: Editar Asignación

**Descripción:** Modificar las notas o fechas de una asignación activa

**Precondiciones:**

- Existe una asignación activa

**Pasos:**

1. Hacer clic en botón "✏️ Editar"
2. Modificar las notas: "Ruta actualizada"
3. Cambiar hora de fin de 17:00 a 18:00
4. Hacer clic en "Actualizar Asignación"

**Resultado Esperado:**

- ✅ Asignación actualizada correctamente
- ✅ Se validan nuevamente los solapamientos
- ✅ Se actualiza el timestamp `updated_at`
- ✅ Los cambios se reflejan en la lista

---

### Caso de Prueba 10: Eliminar Asignación Pendiente

**Descripción:** Eliminar una asignación que aún no ha iniciado

**Precondiciones:**

- Existe una asignación con fecha de inicio futura

**Pasos:**

1. Localizar asignación pendiente (con badge "PENDIENTE")
2. Hacer clic en botón "🗑️ Eliminar"
3. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Asignación eliminada de la base de datos
- ✅ Ya no aparece en ninguna lista

---

### Caso de Prueba 11: No Permitir Eliminar Asignación Iniciada

**Descripción:** Verificar que no se puede eliminar una asignación que ya comenzó

**Precondiciones:**

- Existe una asignación con fecha de inicio en el pasado o presente

**Pasos:**

1. Localizar asignación en curso (con badge "EN CURSO")
2. Verificar que NO existe botón "Eliminar"

**Resultado Esperado:**

- ✅ Solo se muestran botones: Editar, Completar, Cancelar
- ❌ No hay opción de eliminar

---

### Caso de Prueba 12: Validar Fechas en el Formulario

**Descripción:** El formulario debe validar que la fecha de fin sea posterior a la de inicio

**Pasos:**

1. Abrir formulario de nueva asignación
2. Fecha inicio: 2025-11-15 10:00
3. Fecha fin: 2025-11-15 09:00 (anterior a inicio)
4. Intentar guardar

**Resultado Esperado:**

- ❌ Error: "La fecha de fin debe ser posterior a la fecha de inicio"
- ❌ No se permite guardar

---

### Caso de Prueba 13: Mostrar Duración Calculada

**Descripción:** El formulario debe calcular y mostrar la duración

**Pasos:**

1. Abrir formulario de nueva asignación
2. Fecha inicio: 2025-11-15 09:00
3. Fecha fin: 2025-11-15 17:00

**Resultado Esperado:**

- ✅ Se muestra: "Duración: 8.00 horas"

---

### Caso de Prueba 14: Estadísticas

**Descripción:** Verificar que se muestran estadísticas correctas

**Pasos:**

1. Navegar a la página de Asignaciones
2. Observar los 4 cards de estadísticas

**Resultado Esperado:**

- ✅ Total Asignaciones: Suma de todas
- ✅ Activas: Solo con status='active'
- ✅ Completadas: Solo con status='completed'
- ✅ Canceladas: Solo con status='cancelled'

**Validación SQL:**

```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'active') as activas,
  COUNT(*) FILTER (WHERE status = 'completed') as completadas,
  COUNT(*) FILTER (WHERE status = 'cancelled') as canceladas,
  COUNT(*) as total
FROM vehicle_assignments;
```

---

## 🔒 Pruebas de Seguridad y Permisos

### Caso de Prueba 15: Solo Supervisores Pueden Crear

**Descripción:** Verificar que solo usuarios con rol supervisor/admin pueden crear asignaciones

**Pasos:**

1. Autenticarse con usuario rol "conductor" u "operador"
2. Intentar acceder a crear asignación

**Resultado Esperado:**

- ❌ RLS bloquea la inserción
- ❌ Error de permisos

---

### Caso de Prueba 16: Row Level Security

**Descripción:** Verificar que los usuarios solo ven asignaciones de su compañía

**Precondiciones:**

- Existen 2 compañías: A y B
- Usuario pertenece a compañía A

**Pasos:**

1. Autenticarse con usuario de compañía A
2. Consultar asignaciones

**Resultado Esperado:**

- ✅ Solo se muestran asignaciones de compañía A
- ❌ No se ven asignaciones de compañía B

---

## 📊 Validaciones de Base de Datos

### Trigger de Solapamiento

```sql
-- Debe fallar por solapamiento de conductor
INSERT INTO vehicle_assignments (
  vehicle_id, driver_id, company_id, start_time, end_time, status
) VALUES (
  'vehiculo-2', 'conductor-1', 'company-1',
  '2025-11-15 12:00:00', '2025-11-15 15:00:00', 'active'
);
-- Si existe otra asignación del mismo conductor entre 09:00-13:00

-- Debe fallar por solapamiento de vehículo
INSERT INTO vehicle_assignments (
  vehicle_id, driver_id, company_id, start_time, end_time, status
) VALUES (
  'vehiculo-1', 'conductor-2', 'company-1',
  '2025-11-15 12:00:00', '2025-11-15 15:00:00', 'active'
);
-- Si existe otra asignación del mismo vehículo entre 09:00-13:00
```

### Funciones SQL

```sql
-- Obtener asignaciones activas por vehículo
SELECT * FROM get_active_assignments_by_vehicle('vehiculo-id');

-- Obtener asignaciones activas por conductor
SELECT * FROM get_active_assignments_by_driver('conductor-id');

-- Completar asignación
SELECT * FROM complete_assignment('asignacion-id', 'usuario-id');

-- Cancelar asignación
SELECT * FROM cancel_assignment('asignacion-id', 'usuario-id');
```

---

## ✅ Checklist de Pruebas

- [ ] Crear asignación válida sin solapamientos
- [ ] Detectar solapamiento de conductor
- [ ] Detectar solapamiento de vehículo
- [ ] Permitir asignaciones consecutivas
- [ ] Ver asignaciones activas por vehículo
- [ ] Ver asignaciones activas por conductor
- [ ] Completar asignación
- [ ] Cancelar asignación
- [ ] Editar asignación
- [ ] Eliminar asignación pendiente
- [ ] No permitir eliminar asignación iniciada
- [ ] Validar fechas en formulario
- [ ] Mostrar duración calculada
- [ ] Estadísticas correctas
- [ ] Permisos de supervisor
- [ ] Row Level Security

---

## 🐛 Escenarios de Error Conocidos

1. **Error de permisos**: Asegúrate de tener rol supervisor
2. **Error de compañía**: El vehículo debe pertenecer a tu compañía
3. **Error de trigger**: Revisar que las extensiones estén instaladas
4. **Error de RLS**: Verificar políticas de seguridad

---

## 📝 Notas Adicionales

- Todas las asignaciones registran quién las creó (`created_by`)
- Los timestamps se actualizan automáticamente
- La validación de solapamientos se hace a nivel de base de datos (trigger)
- Existe una validación adicional en el cliente para mejor UX
- Las asignaciones completadas o canceladas no se pueden editar
