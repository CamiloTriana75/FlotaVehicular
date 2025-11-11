# Guía de Prueba - Historia de Usuario 3 (HU3)

## Asociar Vehículos a Conductores con Fechas y Horarios

### ✅ Estado de Implementación

**Backend (Base de Datos):**

- ✅ Migración `20251111000001_vehicle_assignments.sql` ejecutada exitosamente
- ✅ Tabla `vehicle_assignments` creada con validación de conflictos
- ✅ 5 funciones SQL creadas:
  - `check_assignment_overlap()` - Validación automática de conflictos
  - `get_active_assignments_by_vehicle(vehicle_id)`
  - `get_active_assignments_by_driver(driver_id)`
  - `complete_assignment(assignment_id)`
  - `cancel_assignment(assignment_id)`
- ✅ Vista `v_active_assignments` para consultas completas
- ✅ Datos de prueba insertados:
  - 3 vehículos (ABC-123, DEF-456, GHI-789)
  - 3 conductores (Carlos Mendoza, María García, Luis Rodríguez)
  - 2 asignaciones de ejemplo

**Backend (Servicio JavaScript):**

- ✅ `assignmentService.js` completamente actualizado
- ✅ Uso de INTEGER IDs (no UUID)
- ✅ Nombres de columnas en español (placa, marca, modelo, nombre, apellidos, numero_licencia)
- ✅ 11 funciones disponibles:
  - `getAssignments()` - Listar con filtros
  - `createAssignment()` - Crear nueva
  - `updateAssignment()` - Modificar existente
  - `completeAssignment()` - Marcar completada
  - `cancelAssignment()` - Cancelar asignación
  - `deleteAssignment()` - Eliminar permanentemente
  - `checkAssignmentConflicts()` - Validar conflictos
  - `getAssignmentStats()` - Estadísticas
  - Y más...

**Frontend (React):**

- ✅ `AssignmentsPage.jsx` - Página principal actualizada
- ✅ `AssignmentForm.jsx` - Formulario con validación de conflictos
- ✅ `AssignmentList.jsx` - Lista con acciones (completar, cancelar, editar, eliminar)
- ✅ Ruta `/asignaciones` agregada al `App.jsx`
- ✅ Enlace "Asignaciones" agregado al `Sidebar.jsx`
- ✅ Todos los componentes usando nombres en español

---

## 📋 Plan de Pruebas

### 1. Iniciar la Aplicación

```powershell
# Navegar al directorio del proyecto
cd c:\Users\jtria\Downloads\FlotaVehicular

# Instalar dependencias (si no se ha hecho)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 2. Iniciar Sesión como Supervisor

**Credenciales:**

- **Email:** `supervisor@flota.com`
- **Password:** `Supervisor123!`

### 3. Navegar a Asignaciones

Una vez autenticado:

1. En el menú lateral (Sidebar), buscar **"Asignaciones"** con icono de calendario 📅
2. Hacer clic para ir a `/asignaciones`

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Visualizar Asignaciones Existentes

**Objetivo:** Verificar que se muestran las asignaciones de prueba

**Pasos:**

1. Ingresar a la página de Asignaciones
2. Observar las 4 tarjetas de estadísticas:
   - Total Asignaciones
   - Asignaciones Activas
   - Completadas
   - Canceladas

**Resultado Esperado:**

- Se muestran 2 asignaciones de ejemplo:
  - ABC-123 → Carlos Mendoza
  - DEF-456 → María García
- Estadísticas correctas mostradas

---

### ✅ Caso 2: Crear Nueva Asignación SIN Conflictos

**Objetivo:** Crear una asignación válida sin solapamiento

**Pasos:**

1. Hacer clic en el botón **"+ Nueva Asignación"**
2. Llenar el formulario:
   - **Vehículo:** GHI-789 - Nissan Versa (2019)
   - **Conductor:** Luis Rodríguez - Lic: 987654321
   - **Fecha Inicio:** Mañana a las 08:00
   - **Fecha Fin:** Mañana a las 17:00
   - **Notas:** Entrega de paquetes zona norte
3. Hacer clic en **"Crear Asignación"**

**Resultado Esperado:**

- ✅ Asignación creada exitosamente
- ✅ Aparece mensaje de éxito
- ✅ La nueva asignación se muestra en la lista
- ✅ Estadísticas se actualizan

---

### ✅ Caso 3: Detectar Conflictos de Horario

**Objetivo:** Verificar que el sistema detecta solapamientos

**Pasos:**

1. Hacer clic en **"+ Nueva Asignación"**
2. Intentar asignar:
   - **Vehículo:** ABC-123 (ya tiene asignación activa)
   - **Conductor:** María García
   - **Fecha Inicio:** Una fecha que solape con la asignación existente de ABC-123
   - **Fecha Fin:** Posterior al inicio
3. Observar el formulario después de 500ms (debounce)

**Resultado Esperado:**

- ⚠️ Aparece advertencia amarilla: **"Conflictos de Horario Detectados"**
- 📋 Lista los conflictos:
  - "Ya asignado a [Conductor] desde [fecha] hasta [fecha]"
- ❌ Botón "Crear Asignación" deshabilitado mientras haya conflictos

---

### ✅ Caso 4: Filtrar Asignaciones

**Objetivo:** Probar todos los filtros disponibles

**Pasos:**

1. Usar el selector **"Estado"**:
   - Filtrar por "Activas"
   - Filtrar por "Completadas"
   - Filtrar por "Canceladas"
2. Usar el selector **"Vehículo"**:
   - Seleccionar un vehículo específico
3. Usar el selector **"Conductor"**:
   - Seleccionar un conductor específico
4. Usar los campos de fecha:
   - Establecer "Desde" y "Hasta"

**Resultado Esperado:**

- ✅ La lista se actualiza dinámicamente con cada filtro
- ✅ Se pueden combinar múltiples filtros
- ✅ Botón "Limpiar Filtros" restaura la vista completa

---

### ✅ Caso 5: Completar una Asignación

**Objetivo:** Marcar una asignación como completada

**Pasos:**

1. Encontrar una asignación con estado **"Activa"**
2. Hacer clic en el botón verde **"✓ Completar"**
3. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Estado cambia a "Completada"
- ✅ Badge azul muestra "Completada"
- ✅ Botones de acción desaparecen (ya no se puede editar)
- ✅ Estadísticas se actualizan

---

### ✅ Caso 6: Cancelar una Asignación

**Objetivo:** Cancelar una asignación activa

**Pasos:**

1. Encontrar una asignación con estado **"Activa"**
2. Hacer clic en el botón amarillo **"✗ Cancelar"**
3. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Estado cambia a "Cancelada"
- ✅ Badge rojo muestra "Cancelada"
- ✅ Botones de acción desaparecen
- ✅ Estadísticas se actualizan

---

### ✅ Caso 7: Editar Asignación Existente

**Objetivo:** Modificar fechas de una asignación activa

**Pasos:**

1. Encontrar asignación con estado **"Activa"**
2. Hacer clic en botón azul **"✏️ Editar"**
3. Cambiar las fechas (mantener sin conflictos)
4. Hacer clic en **"Actualizar Asignación"**

**Resultado Esperado:**

- ✅ Formulario se abre con datos pre-llenados
- ✅ Vehículo y Conductor están deshabilitados (no se pueden cambiar)
- ✅ Se pueden modificar fechas y notas
- ✅ Validación de conflictos funciona también en edición
- ✅ Cambios se guardan correctamente

---

### ✅ Caso 8: Eliminar Asignación Pendiente

**Objetivo:** Eliminar permanentemente una asignación que aún no ha iniciado

**Pasos:**

1. Encontrar asignación **"Activa"** con fecha futura (estado "PENDIENTE")
2. Hacer clic en botón rojo **"🗑️ Eliminar"**
3. Confirmar acción

**Resultado Esperado:**

- ✅ Asignación eliminada de la lista
- ✅ Mensaje de confirmación
- ✅ Estadísticas actualizadas

**Nota:** El botón de eliminar solo aparece en asignaciones pendientes (no iniciadas aún).

---

### ✅ Caso 9: Verificar Indicadores Visuales

**Objetivo:** Comprobar que se distinguen estados fácilmente

**Pasos:**

1. Observar las asignaciones en la lista

**Resultado Esperado:**

- 🟢 Borde VERDE + badge "EN CURSO" = Asignación activa en este momento
- 🟡 Borde AMARILLO + badge "PENDIENTE" = Asignación futura
- ⚪ Borde GRIS = Asignación completada o cancelada

---

### ✅ Caso 10: Verificar Cálculo de Duración

**Objetivo:** Comprobar cálculo automático de horas

**Pasos:**

1. Crear o editar asignación
2. Establecer fecha inicio: **08:00**
3. Establecer fecha fin: **17:00**
4. Observar debajo del campo "Fecha de Fin"

**Resultado Esperado:**

- ℹ️ Recuadro azul muestra: **"Duración: 9.00 horas"**
- ✅ Cálculo se actualiza automáticamente al cambiar fechas

---

## 🗂️ Datos de Prueba Disponibles

### Vehículos (3)

| ID  | Placa   | Marca  | Modelo  | Año  | Estado     |
| --- | ------- | ------ | ------- | ---- | ---------- |
| 1   | ABC-123 | Toyota | Corolla | 2022 | disponible |
| 2   | DEF-456 | Honda  | Civic   | 2021 | disponible |
| 3   | GHI-789 | Nissan | Versa   | 2019 | disponible |

### Conductores (3)

| ID  | Cédula     | Nombre | Apellidos | Licencia  | Estado |
| --- | ---------- | ------ | --------- | --------- | ------ |
| 1   | 0123456789 | Carlos | Mendoza   | 123456789 | activo |
| 2   | 9876543210 | María  | García    | 987654321 | activo |
| 3   | 5555555555 | Luis   | Rodríguez | 555555555 | activo |

### Asignaciones Existentes (2)

1. **Asignación 1:**
   - Vehículo: ABC-123 (Toyota Corolla)
   - Conductor: Carlos Mendoza
   - Inicio: Hace 1 hora
   - Fin: Dentro de 23 horas
   - Estado: Activa
   - Notas: Ruta de entregas matutinas

2. **Asignación 2:**
   - Vehículo: DEF-456 (Honda Civic)
   - Conductor: María García
   - Inicio: Mañana 08:00
   - Fin: Mañana 17:00
   - Estado: Activa (Pendiente)
   - Notas: Visita a proveedores

---

## 🐛 Qué Verificar en Caso de Errores

### Error: "No se pueden cargar las asignaciones"

**Posibles Causas:**

- Conexión a Supabase fallida
- Tablas no existen en la base de datos

**Solución:**

1. Verificar archivo `.env` con credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
2. Verificar que la migración se ejecutó:
   ```sql
   SELECT * FROM vehicle_assignments LIMIT 1;
   ```

---

### Error: "Cannot read property 'placa' of undefined"

**Posibles Causas:**

- Datos de vehículos/conductores no cargados
- Query SQL incorrecto

**Solución:**

1. Abrir consola del navegador (F12)
2. Verificar red (Network) si las peticiones a Supabase fallan
3. Verificar que existan vehículos y conductores en la BD:
   ```sql
   SELECT * FROM vehicles;
   SELECT * FROM drivers;
   ```

---

### Error: "Validation failed"

**Causa:**

- Trigger de validación de conflictos detectó solapamiento

**Comportamiento Esperado:**

- ⚠️ Es normal! El sistema está funcionando correctamente
- Ajustar fechas para evitar conflictos

---

## 📊 Funcionalidades Implementadas

✅ **CRUD Completo:**

- [x] Crear asignaciones
- [x] Leer/Listar asignaciones
- [x] Actualizar asignaciones
- [x] Eliminar asignaciones

✅ **Validaciones:**

- [x] Validación de conflictos de vehículo
- [x] Validación de conflictos de conductor
- [x] Validación de fechas (fin > inicio)
- [x] Validación en tiempo real (debounce 500ms)

✅ **Acciones Especiales:**

- [x] Completar asignación
- [x] Cancelar asignación
- [x] Cálculo automático de duración

✅ **Filtros:**

- [x] Por estado (activa, completada, cancelada)
- [x] Por vehículo
- [x] Por conductor
- [x] Por rango de fechas

✅ **Estadísticas:**

- [x] Total de asignaciones
- [x] Asignaciones activas
- [x] Asignaciones completadas
- [x] Asignaciones canceladas

✅ **UI/UX:**

- [x] Indicadores visuales de estado
- [x] Badges de estado coloreados
- [x] Mensajes de confirmación
- [x] Advertencias de conflictos
- [x] Responsive design
- [x] Loading states

---

## 🎯 Criterios de Aceptación HU3

| #   | Criterio                                     | Estado |
| --- | -------------------------------------------- | ------ |
| 1   | Supervisor puede ver lista de asignaciones   | ✅     |
| 2   | Supervisor puede crear nueva asignación      | ✅     |
| 3   | Supervisor puede especificar fechas/horarios | ✅     |
| 4   | Sistema valida conflictos de vehículos       | ✅     |
| 5   | Sistema valida conflictos de conductores     | ✅     |
| 6   | Supervisor puede editar asignaciones activas | ✅     |
| 7   | Supervisor puede completar asignaciones      | ✅     |
| 8   | Supervisor puede cancelar asignaciones       | ✅     |
| 9   | Supervisor puede filtrar asignaciones        | ✅     |
| 10  | Sistema muestra estadísticas en tiempo real  | ✅     |

---

## ✅ Checklist de Funcionalidad

Marca con ✅ cada prueba que completes:

- [ ] Login como supervisor exitoso
- [ ] Navegación a /asignaciones funciona
- [ ] Se muestran las 2 asignaciones de prueba
- [ ] Crear asignación SIN conflictos funciona
- [ ] Crear asignación CON conflictos muestra advertencia
- [ ] Filtro por estado funciona
- [ ] Filtro por vehículo funciona
- [ ] Filtro por conductor funciona
- [ ] Completar asignación funciona
- [ ] Cancelar asignación funciona
- [ ] Editar asignación funciona
- [ ] Eliminar asignación pendiente funciona
- [ ] Cálculo de duración correcto
- [ ] Estadísticas se actualizan correctamente

---

## 📞 Soporte

Si encuentras algún error no documentado aquí:

1. **Abrir consola del navegador (F12)** → Ver errores en la pestaña "Console"
2. **Verificar Network** → Ver si las peticiones HTTP fallan
3. **Revisar base de datos** → Ejecutar queries directamente en Supabase
4. **Verificar logs** → Ver terminal donde corre `npm run dev`

---

**¡Listo para probar! 🚀**
