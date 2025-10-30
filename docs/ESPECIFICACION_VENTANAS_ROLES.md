# Especificación de Ventanas, Funcionalidades y Roles

Este documento define todas las pantallas, funcionalidades y permisos por rol del sistema FlotaVehicular, derivado del backlog de producto y casos de uso.

---

## 📋 Índice

1. [Roles del Sistema](#-roles-del-sistema)
2. [Matriz de Permisos](#-matriz-de-permisos)
3. [Ventanas y Funcionalidades](#-ventanas-y-funcionalidades)
4. [Flujos de Navegación](#-flujos-de-navegación)
5. [Componentes Reutilizables](#-componentes-reutilizables)

---

## 👥 Roles del Sistema

### 1. Administrador (Admin)

**Descripción:** Control total del sistema, gestión de usuarios y configuración.

**Responsabilidades:**

- Crear, editar y eliminar vehículos
- Crear, editar y eliminar conductores
- Gestionar usuarios y roles
- Configurar parámetros del sistema
- Gestionar integraciones externas
- Acceso a todos los módulos

**Casos de uso:** UC1-UC3, UC10-UC12, UC15, UC48-UC51, UC52-UC55

---

### 2. Supervisor/Manager (Manager)

**Descripción:** Gestión operativa diaria de la flota, asignaciones y monitoreo.

**Responsabilidades:**

- Consultar vehículos y conductores
- Monitorear ubicación en tiempo real
- Asignar conductores a vehículos
- Crear y asignar rutas
- Programar mantenimientos
- Ver y gestionar alertas
- Generar reportes
- Reportar incidentes

**Casos de uso:** UC4-UC9, UC13-UC27, UC28-UC36, UC37-UC47, UC52-UC55

---

### 3. Operador (Operator)

**Descripción:** Ejecución de tareas operativas y registro de eventos.

**Responsabilidades:**

- Consultar vehículos y conductores (solo lectura)
- Registrar mantenimientos realizados
- Monitorear rutas en progreso
- Finalizar rutas
- Ver alertas activas
- Reportar incidentes

**Casos de uso:** UC4, UC5, UC13, UC16, UC18, UC24, UC25, UC28, UC34, UC35, UC52-UC55

---

### 4. Visualizador (Viewer)

**Descripción:** Solo lectura de información y KPIs, sin capacidad de modificar datos.

**Responsabilidades:**

- Consultar vehículos (solo lectura)
- Consultar conductores (solo lectura)
- Ver dashboard con KPIs
- Ver alertas activas (sin resolver)
- Visualizar mapas

**Casos de uso:** UC4, UC5, UC13, UC28, UC43, UC52-UC55

---

### 5. Conductor (Driver)

**Descripción:** Uso limitado para reportar incidentes y recibir asignaciones.

**Responsabilidades:**

- Reportar incidentes/emergencias
- Recibir notificaciones de rutas
- Ver sus asignaciones
- Botón de pánico

**Casos de uso:** UC34, UC35, UC52-UC55

---

## 🔐 Matriz de Permisos

| Módulo/Funcionalidad         | Admin | Manager | Operator | Viewer | Driver |
| ---------------------------- | ----- | ------- | -------- | ------ | ------ |
| **VEHÍCULOS**                |
| Registrar vehículo           | ✅    | ❌      | ❌       | ❌     | ❌     |
| Actualizar vehículo          | ✅    | ❌      | ❌       | ❌     | ❌     |
| Eliminar vehículo            | ✅    | ❌      | ❌       | ❌     | ❌     |
| Consultar vehículos          | ✅    | ✅      | ✅       | ✅     | ❌     |
| Ver ubicación tiempo real    | ✅    | ✅      | ✅       | ✅     | ❌     |
| Ver historial vehículo       | ✅    | ✅      | 🟡       | 🟡     | ❌     |
| Monitorear combustible       | ✅    | ✅      | ✅       | 🟡     | ❌     |
| **CONDUCTORES**              |
| Registrar conductor          | ✅    | ❌      | ❌       | ❌     | ❌     |
| Actualizar conductor         | ✅    | ❌      | ❌       | ❌     | ❌     |
| Eliminar conductor           | ✅    | ❌      | ❌       | ❌     | ❌     |
| Consultar conductores        | ✅    | ✅      | ✅       | ✅     | ❌     |
| Ver historial conductor      | ✅    | ✅      | 🟡       | ❌     | ❌     |
| Gestionar turnos             | ✅    | ✅      | ❌       | ❌     | ❌     |
| **ASIGNACIONES**             |
| Asignar conductor a vehículo | ✅    | ✅      | ❌       | ❌     | ❌     |
| Ver asignaciones             | ✅    | ✅      | ✅       | ✅     | 🟡     |
| **RUTAS**                    |
| Crear ruta                   | ✅    | ✅      | ❌       | ❌     | ❌     |
| Asignar ruta                 | ✅    | ✅      | ❌       | ❌     | ❌     |
| Monitorear ruta              | ✅    | ✅      | ✅       | ✅     | ❌     |
| Finalizar ruta               | ✅    | ✅      | ✅       | ❌     | ❌     |
| Optimizar rutas              | ✅    | ✅      | ❌       | ❌     | ❌     |
| **MANTENIMIENTO**            |
| Programar mantenimiento      | ✅    | ✅      | ❌       | ❌     | ❌     |
| Registrar mantenimiento      | ✅    | ✅      | ✅       | ❌     | ❌     |
| Ver historial mantenimiento  | ✅    | ✅      | ✅       | 🟡     | ❌     |
| **COMBUSTIBLE**              |
| Registrar carga              | ✅    | ✅      | ✅       | ❌     | ❌     |
| Ver consumo                  | ✅    | ✅      | ✅       | 🟡     | ❌     |
| Análisis consumo             | ✅    | ✅      | 🟡       | ❌     | ❌     |
| **ALERTAS**                  |
| Ver alertas                  | ✅    | ✅      | ✅       | ✅     | ❌     |
| Resolver alertas             | ✅    | ✅      | ✅       | ❌     | ❌     |
| Configurar alertas           | ✅    | ✅      | ❌       | ❌     | ❌     |
| Configurar geocercas         | ✅    | ✅      | ❌       | ❌     | ❌     |
| **INCIDENTES**               |
| Reportar incidente           | ✅    | ✅      | ✅       | ❌     | ✅     |
| Ver incidentes               | ✅    | ✅      | ✅       | ❌     | ❌     |
| Generar reportes incidentes  | ✅    | ✅      | ❌       | ❌     | ❌     |
| **REPORTES**                 |
| Ver dashboard KPIs           | ✅    | ✅      | 🟡       | ✅     | ❌     |
| Generar reportes             | ✅    | ✅      | 🟡       | ❌     | ❌     |
| Exportar PDF/Excel           | ✅    | ✅      | 🟡       | ❌     | ❌     |
| Reportes personalizados      | ✅    | ✅      | ❌       | ❌     | ❌     |
| **CONFIGURACIÓN**            |
| Gestionar usuarios           | ✅    | 🟡      | ❌       | ❌     | ❌     |
| Configurar sistema           | ✅    | ❌      | ❌       | ❌     | ❌     |
| Integraciones                | ✅    | ❌      | ❌       | ❌     | ❌     |

**Leyenda:**

- ✅ Acceso completo
- 🟡 Acceso parcial/limitado
- ❌ Sin acceso

---

## 🖥️ Ventanas y Funcionalidades

### 1. Autenticación

#### 1.1 Ventana: Login Page

**Ruta:** `/login`  
**Roles:** Todos (no autenticado)  
**Componente:** `LoginPage.jsx`

**Funcionalidades:**

- Formulario de login (email/usuario + contraseña)
- Opción "Recordar sesión"
- Enlace "¿Olvidaste tu contraseña?"
- Validación de credenciales
- Redirección según rol

**Campos:**

- Email/Usuario (required)
- Contraseña (required, type=password)
- Checkbox "Recordarme"

**Acciones:**

- `Iniciar Sesión` → Validar y redirigir a Dashboard
- `Recuperar Contraseña` → Ir a `/recuperar-password`

---

#### 1.2 Ventana: Recuperar Contraseña

**Ruta:** `/recuperar-password`  
**Roles:** Todos (no autenticado)  
**Componente:** `PasswordRecoveryPage.jsx`

**Funcionalidades:**

- Formulario con email
- Envío de email de recuperación
- Mensaje de confirmación

**Campos:**

- Email (required)

**Acciones:**

- `Enviar enlace` → Enviar email de recuperación
- `Volver al login` → Ir a `/login`

---

#### 1.3 Ventana: Cambiar Contraseña

**Ruta:** `/cambiar-password`  
**Roles:** Todos (autenticado)  
**Componente:** `ChangePasswordPage.jsx`

**Funcionalidades:**

- Formulario de cambio de contraseña
- Validación de contraseña actual
- Validación de nueva contraseña (fuerza)

**Campos:**

- Contraseña actual (required)
- Nueva contraseña (required, min 8 caracteres)
- Confirmar nueva contraseña (required)

**Acciones:**

- `Guardar nueva contraseña` → Actualizar y cerrar sesión
- `Cancelar` → Volver

---

### 2. Dashboard Principal

#### 2.1 Ventana: Dashboard

**Ruta:** `/dashboard` o `/`  
**Roles:** Admin, Manager, Operator, Viewer  
**Componente:** `Dashboard.jsx`

**Funcionalidades:**

- Tarjetas de KPIs principales
- Mapa con ubicación de vehículos en tiempo real
- Lista de alertas recientes
- Gráficos de resumen
- Accesos rápidos a módulos

**Widgets/Secciones:**

1. **Header con KPIs**
   - Total vehículos activos
   - Conductores en servicio
   - Alertas activas
   - Mantenimientos pendientes

2. **Mapa Principal**
   - Ubicación en tiempo real de todos los vehículos
   - Marcadores con estado (activo, detenido, alerta)
   - Click en marcador → Ver detalle rápido

3. **Panel de Alertas**
   - Últimas 5 alertas críticas
   - Botón "Ver todas las alertas"

4. **Gráficos**
   - Consumo de combustible (última semana)
   - Rutas completadas vs. planificadas
   - Incidentes por tipo (mes actual)

**Acciones:**

- Click en KPI → Navegar a módulo correspondiente
- Click en alerta → Ver detalle de alerta
- Click en vehículo en mapa → Ver detalle de vehículo

---

### 3. Módulo Vehículos

#### 3.1 Ventana: Lista de Vehículos

**Ruta:** `/vehiculos`  
**Roles:** Admin (CRUD), Manager/Operator/Viewer (lectura)  
**Componente:** `VehiclesList.jsx`

**Funcionalidades:**

- Tabla con listado de vehículos
- Filtros y búsqueda
- Acciones según rol
- Paginación
- Exportar listado

**Columnas de la tabla:**

- Placa
- Marca/Modelo
- Año
- Tipo
- Estado (disponible, asignado, mantenimiento, inactivo)
- Conductor asignado
- Kilometraje actual
- Próximo mantenimiento
- Acciones (Ver/Editar/Eliminar)

**Filtros:**

- Estado (dropdown)
- Tipo de vehículo (dropdown)
- Búsqueda por placa/marca/modelo

**Acciones (según rol):**

- Admin: `+ Nuevo Vehículo`, Editar, Eliminar
- Manager/Operator/Viewer: Solo ver detalle

**Botones globales:**

- `+ Nuevo Vehículo` (solo Admin)
- `Exportar` (Excel/PDF)
- `Filtros` (toggle panel de filtros)

---

#### 3.2 Ventana: Detalle de Vehículo

**Ruta:** `/vehiculos/:id`  
**Roles:** Todos (lectura), Admin (edición)  
**Componente:** `VehicleDetail.jsx`

**Funcionalidades:**

- Información completa del vehículo
- Historial de asignaciones
- Historial de mantenimientos
- Historial de combustible
- Ubicación actual en mapa
- Gráficos de uso

**Secciones:**

1. **Datos Principales** (Card)
   - Placa, Marca, Modelo, Año, Color
   - VIN, Número de motor
   - Capacidad, Tipo de combustible
   - Estado actual
   - Conductor asignado (con link)

2. **Métricas** (Cards pequeñas)
   - Kilometraje actual
   - Último mantenimiento
   - Próximo mantenimiento
   - Consumo promedio

3. **Ubicación Actual** (Mapa)
   - Mapa con ubicación en tiempo real
   - Velocidad, dirección
   - Última actualización

4. **Tabs:**
   - **Historial de Asignaciones**: Tabla con fechas, conductores, rutas
   - **Mantenimientos**: Tabla con tipo, fecha, costo, descripción
   - **Combustible**: Tabla y gráfico de cargas
   - **Incidentes**: Tabla de incidentes relacionados
   - **Documentos**: (opcional) Seguro, SOAT, revisión técnica

**Acciones:**

- `Editar` (solo Admin)
- `Asignar Conductor` (Admin, Manager)
- `Programar Mantenimiento` (Admin, Manager)
- `Registrar Carga Combustible` (Admin, Manager, Operator)
- `Volver a listado`

---

#### 3.3 Ventana: Formulario Vehículo (Crear/Editar)

**Ruta:** `/vehiculos/nuevo` o `/vehiculos/:id/editar`  
**Roles:** Admin  
**Componente:** `VehicleForm.jsx`

**Funcionalidades:**

- Formulario con validaciones
- Modo creación o edición
- Guardado optimista

**Campos del formulario:**

**Sección: Identificación**

- Placa\* (text, unique)
- Marca\* (text)
- Modelo\* (text)
- Año\* (number, min:1980, max:año actual+1)
- Color (text)
- VIN (text)
- Número de motor (text)

**Sección: Características**

- Tipo de vehículo\* (select: sedán, camión, bus, camioneta, etc.)
- Capacidad (number, kg o pasajeros)
- Tipo de combustible\* (select: gasolina, diesel, eléctrico, híbrido)

**Sección: Estado**

- Estado\* (select: disponible, asignado, mantenimiento, inactivo)
- Kilometraje actual\* (number, min:0)

**Sección: Mantenimiento**

- Fecha último mantenimiento (date)
- Fecha próximo mantenimiento (date)

**Sección: Compra (opcional)**

- Fecha de compra (date)
- Precio de compra (number)

**Acciones:**

- `Guardar` → Validar y crear/actualizar
- `Cancelar` → Volver sin guardar

**Validaciones:**

- Placa única
- Año válido
- Kilometraje >= 0
- Fecha próximo mantenimiento > fecha último mantenimiento

---

### 4. Módulo Conductores

#### 4.1 Ventana: Lista de Conductores

**Ruta:** `/conductores`  
**Roles:** Admin (CRUD), Manager/Operator/Viewer (lectura)  
**Componente:** `DriversList.jsx`

**Funcionalidades:**

- Tabla con listado de conductores
- Filtros y búsqueda
- Acciones según rol
- Indicadores visuales (licencia por vencer, etc.)

**Columnas de la tabla:**

- Nombre completo
- Cédula
- Teléfono
- Email
- Licencia
- Vencimiento licencia
- Estado (activo, inactivo, disponible, en_servicio)
- Vehículo asignado
- Acciones

**Filtros:**

- Estado (dropdown)
- Búsqueda por nombre/cédula

**Acciones:**

- Admin: `+ Nuevo Conductor`, Editar, Eliminar
- Manager/Operator/Viewer: Solo ver detalle

**Indicadores:**

- 🔴 Licencia vencida
- 🟡 Licencia por vencer (<30 días)
- 🟢 Licencia vigente

---

#### 4.2 Ventana: Detalle de Conductor

**Ruta:** `/conductores/:id`  
**Roles:** Todos (lectura), Admin (edición)  
**Componente:** `DriverDetail.jsx`

**Funcionalidades:**

- Información completa del conductor
- Historial de asignaciones
- Historial de incidentes
- Estadísticas de desempeño

**Secciones:**

1. **Datos Personales** (Card)
   - Nombre, Apellidos, Cédula
   - Teléfono, Email, Dirección
   - Fecha de ingreso

2. **Licencia de Conducción** (Card)
   - Número de licencia
   - Tipo/Categoría
   - Fecha de expedición
   - Fecha de vencimiento
   - Estado (vigente/vencida/por vencer)

3. **Estado Actual** (Card)
   - Estado (activo/inactivo/disponible/en_servicio)
   - Vehículo asignado actualmente
   - Ruta actual (si aplica)

4. **Tabs:**
   - **Historial de Asignaciones**: Tabla con vehículos, fechas, rutas
   - **Incidentes**: Tabla de incidentes en los que estuvo involucrado
   - **Cargas de Combustible**: Tabla de registros
   - **Desempeño**: Gráficos (rutas completadas, incidentes, consumo)
   - **Horarios/Turnos**: Calendario (Admin/Manager)

**Acciones:**

- `Editar` (solo Admin)
- `Asignar Vehículo` (Admin, Manager)
- `Gestionar Horarios` (Admin, Manager)
- `Volver a listado`

---

#### 4.3 Ventana: Formulario Conductor (Crear/Editar)

**Ruta:** `/conductores/nuevo` o `/conductores/:id/editar`  
**Roles:** Admin  
**Componente:** `DriverForm.jsx`

**Campos del formulario:**

**Sección: Datos Personales**

- Nombre\* (text)
- Apellidos\* (text)
- Cédula\* (text, unique)
- Fecha de nacimiento (date)
- Teléfono (text)
- Email (email)
- Dirección (textarea)

**Sección: Licencia de Conducción**

- Número de licencia\* (text, unique)
- Tipo/Categoría\* (select: B1, B2, C1, C2, etc.)
- Fecha de expedición (date)
- Fecha de vencimiento\* (date)

**Sección: Empleo**

- Estado\* (select: activo, inactivo, disponible, en_servicio)
- Fecha de ingreso (date, default: hoy)

**Acciones:**

- `Guardar`
- `Cancelar`

**Validaciones:**

- Cédula única
- Licencia única
- Email válido
- Fecha vencimiento > fecha expedición

---

### 5. Módulo Rutas

#### 5.1 Ventana: Lista de Rutas

**Ruta:** `/rutas`  
**Roles:** Admin/Manager (CRUD), Operator/Viewer (lectura)  
**Componente:** `RoutesList.jsx`

**Funcionalidades:**

- Tabla de rutas (planificadas, activas, completadas, canceladas)
- Filtros por estado y fecha
- Ver en mapa

**Columnas:**

- Nombre de ruta
- Origen → Destino
- Vehículo asignado
- Conductor asignado
- Distancia estimada
- Tiempo estimado
- Estado (planificada, activa, completada, cancelada)
- Fecha programada
- Acciones

**Filtros:**

- Estado (dropdown)
- Rango de fechas
- Vehículo/Conductor

**Acciones:**

- `+ Nueva Ruta` (Admin, Manager)
- Editar (Admin, Manager, solo si planificada)
- Ver detalle
- Finalizar (Admin, Manager, Operator, solo si activa)

---

#### 5.2 Ventana: Detalle de Ruta

**Ruta:** `/rutas/:id`  
**Roles:** Todos (lectura), Admin/Manager (edición)  
**Componente:** `RouteDetail.jsx`

**Funcionalidades:**

- Información completa de la ruta
- Mapa con ruta trazada y paradas
- Seguimiento en tiempo real (si activa)
- Comparación planificado vs. real

**Secciones:**

1. **Datos de la Ruta** (Card)
   - Nombre, Descripción
   - Origen → Destino
   - Distancia estimada / real
   - Tiempo estimado / real
   - Estado

2. **Asignación** (Card)
   - Vehículo (con link)
   - Conductor (con link)
   - Fecha/hora inicio programada
   - Fecha/hora inicio real
   - Fecha/hora fin real

3. **Mapa Interactivo**
   - Ruta planificada (azul)
   - Ruta real (verde, si activa/completada)
   - Paradas/waypoints
   - Posición actual del vehículo (si activa)

4. **Paradas** (Tabla)
   - Secuencia, Dirección
   - Llegada estimada / real
   - Salida estimada / real
   - Estado (pendiente, en curso, completada)

5. **Métricas** (si completada)
   - Desviación de ruta (km)
   - Retraso/adelanto (min)
   - Consumo de combustible

**Acciones:**

- `Editar` (Admin, Manager, solo si planificada)
- `Asignar Vehículo/Conductor` (Admin, Manager)
- `Iniciar Ruta` (Admin, Manager, si planificada)
- `Finalizar Ruta` (Admin, Manager, Operator, si activa)
- `Optimizar Ruta` (Admin, Manager)
- `Volver a listado`

---

#### 5.3 Ventana: Formulario Ruta (Crear/Editar)

**Ruta:** `/rutas/nueva` o `/rutas/:id/editar`  
**Roles:** Admin, Manager  
**Componente:** `RouteForm.jsx`

**Funcionalidades:**

- Formulario con selección de origen/destino en mapa
- Agregar paradas intermedias
- Calcular distancia y tiempo estimado (integración con API de mapas)

**Campos:**

**Sección: Información Básica**

- Nombre de la ruta\* (text)
- Descripción (textarea)

**Sección: Origen y Destino**

- Dirección de origen\* (text con autocompletado)
- Coordenadas origen (lat/lng, autocompletado)
- Dirección de destino\* (text con autocompletado)
- Coordenadas destino (lat/lng, autocompletado)

**Sección: Paradas Intermedias** (opcional, lista dinámica)

- Agregar parada (botón +)
- Lista de paradas con orden, dirección, tiempo estimado

**Sección: Asignación**

- Vehículo (select)
- Conductor (select)
- Fecha/hora programada (datetime)

**Sección: Estimaciones** (auto-calculadas)

- Distancia estimada (km)
- Tiempo estimado (min)

**Acciones:**

- `Calcular Ruta` → Usar API de mapas para trazar y estimar
- `Optimizar Paradas` → Reordenar paradas para minimizar distancia
- `Guardar`
- `Cancelar`

---

### 6. Módulo Mantenimiento

#### 6.1 Ventana: Lista de Mantenimientos

**Ruta:** `/mantenimiento`  
**Roles:** Admin/Manager (CRUD), Operator (registrar), Viewer (lectura)  
**Componente:** `MaintenanceList.jsx`

**Funcionalidades:**

- Tabla de mantenimientos (programados, en progreso, completados, cancelados)
- Filtros por estado, tipo, vehículo
- Indicadores visuales de vencimiento

**Columnas:**

- Vehículo (placa)
- Tipo (preventivo, correctivo, inspección)
- Título
- Fecha programada
- Fecha realizada
- Kilometraje
- Costo
- Estado (programado, en_progreso, completado, cancelado)
- Acciones

**Filtros:**

- Estado (dropdown)
- Tipo de mantenimiento (dropdown)
- Vehículo (autocomplete)
- Rango de fechas

**Indicadores:**

- 🔴 Vencido
- 🟡 Próximo a vencer (<7 días)
- 🟢 Programado

**Acciones:**

- `+ Programar Mantenimiento` (Admin, Manager)
- Editar (Admin, Manager, solo si programado)
- Registrar como realizado (Admin, Manager, Operator)
- Ver detalle

---

#### 6.2 Ventana: Formulario Mantenimiento

**Ruta:** `/mantenimiento/nuevo` o `/mantenimiento/:id/editar`  
**Roles:** Admin, Manager (programar), Operator (registrar)  
**Componente:** `MaintenanceForm.jsx`

**Modos:**

1. **Programar** (crear nuevo)
2. **Registrar realizado** (editar existente o crear directo)

**Campos:**

**Sección: Información del Mantenimiento**

- Vehículo\* (select/autocomplete)
- Tipo\* (select: preventivo, correctivo, inspección)
- Título\* (text)
- Descripción (textarea)

**Sección: Programación**

- Fecha programada\* (date)
- Kilometraje recomendado (number)

**Sección: Realización** (solo al registrar)

- Fecha real\* (date)
- Kilometraje al realizar (number)
- Costo (number)
- Creado por (text, nombre del mecánico/taller)
- Notas adicionales (textarea)

**Acciones:**

- `Guardar como programado`
- `Guardar como completado`
- `Cancelar`

---

### 7. Módulo Combustible

#### 7.1 Ventana: Registro de Combustible

**Ruta:** `/combustible`  
**Roles:** Admin/Manager/Operator (crear/editar), Viewer (lectura)  
**Componente:** `FuelRecords.jsx`

**Funcionalidades:**

- Tabla de registros de cargas de combustible
- Filtros por vehículo, conductor, fechas
- Gráficos de consumo

**Columnas:**

- Fecha
- Vehículo (placa)
- Conductor
- Cantidad (litros)
- Costo por litro
- Costo total
- Odómetro
- Tipo de combustible
- Estación
- Acciones

**Filtros:**

- Vehículo (autocomplete)
- Conductor (autocomplete)
- Rango de fechas

**Gráficos:**

- Consumo por vehículo (litros/km)
- Costo total por mes
- Comparación entre vehículos

**Acciones:**

- `+ Registrar Carga` (Admin, Manager, Operator)
- Editar
- Eliminar (solo Admin)
- `Exportar`

---

#### 7.2 Ventana: Formulario Carga de Combustible

**Ruta:** `/combustible/nuevo` o `/combustible/:id/editar`  
**Roles:** Admin, Manager, Operator  
**Componente:** `FuelForm.jsx`

**Campos:**

**Sección: Identificación**

- Vehículo\* (select/autocomplete)
- Conductor\* (select/autocomplete)
- Fecha\* (date, default: hoy)

**Sección: Carga**

- Cantidad (litros)\* (number, min:0)
- Costo por litro (number)
- Costo total\* (number, puede auto-calcularse)
- Odómetro/Kilometraje (number)
- Tipo de combustible\* (select: gasolina, diesel, eléctrico)

**Sección: Estación**

- Nombre de la estación (text)
- Dirección (text)
- Número de recibo (text)

**Sección: Notas**

- Notas adicionales (textarea)

**Acciones:**

- `Guardar`
- `Cancelar`

---

### 8. Módulo Alertas

#### 8.1 Ventana: Centro de Alertas

**Ruta:** `/alertas`  
**Roles:** Todos (lectura), Admin/Manager/Operator (gestión)  
**Componente:** `Alerts.jsx`

**Funcionalidades:**

- Lista de alertas activas y resueltas
- Filtros por tipo, gravedad, estado
- Acciones rápidas de resolución

**Columnas:**

- Fecha/hora
- Vehículo
- Conductor
- Tipo (combustible_bajo, velocidad_excesiva, geocerca, mantenimiento, etc.)
- Gravedad (baja, media, alta, crítica)
- Mensaje
- Estado (pendiente, vista, resuelta, ignorada)
- Acciones

**Filtros:**

- Estado (dropdown)
- Gravedad (dropdown)
- Tipo (dropdown)
- Vehículo/Conductor

**Indicadores visuales:**

- 🔴 Crítica
- 🟠 Alta
- 🟡 Media
- 🔵 Baja

**Acciones:**

- Marcar como vista
- Resolver (Admin, Manager, Operator)
- Ignorar (Admin, Manager)
- Ver detalle

---

#### 8.2 Ventana: Configuración de Alertas

**Ruta:** `/alertas/configuracion`  
**Roles:** Admin, Manager  
**Componente:** `AlertsConfig.jsx`

**Funcionalidades:**

- Configurar umbrales de alertas
- Activar/desactivar tipos de alerta
- Configurar notificaciones (email, push)

**Secciones:**

1. **Alertas de Combustible**
   - Activar alerta de combustible bajo (toggle)
   - Umbral (%, default: 20%)

2. **Alertas de Velocidad**
   - Activar alerta de velocidad excesiva (toggle)
   - Velocidad máxima (km/h, default: 120)

3. **Alertas de Mantenimiento**
   - Activar alerta de mantenimiento vencido (toggle)
   - Días de anticipación (number, default: 7)

4. **Geocercas**
   - Ver/gestionar geocercas (link a otra ventana)

5. **Notificaciones**
   - Notificaciones por email (toggle)
   - Notificaciones push (toggle)
   - Usuarios a notificar (multi-select)

**Acciones:**

- `Guardar configuración`
- `Restaurar valores por defecto`

---

#### 8.3 Ventana: Gestión de Geocercas

**Ruta:** `/alertas/geocercas`  
**Roles:** Admin, Manager  
**Componente:** `GeofencesManagement.jsx`

**Funcionalidades:**

- Mapa interactivo para dibujar geocercas
- Lista de geocercas existentes
- Configurar alertas por entrada/salida

**Secciones:**

1. **Mapa Interactivo**
   - Herramientas de dibujo (círculo, polígono, rectángulo)
   - Geocercas existentes superpuestas

2. **Lista de Geocercas** (Tabla lateral)
   - Nombre
   - Tipo (círculo/polígono)
   - Activa (toggle)
   - Alerta entrada (toggle)
   - Alerta salida (toggle)
   - Acciones (Editar, Eliminar)

**Formulario de Geocerca:**

- Nombre\* (text)
- Descripción (textarea)
- Tipo\* (auto-detectado al dibujar)
- Coordenadas/Radio (auto-rellenado)
- Activa (checkbox)
- Alertar al entrar (checkbox)
- Alertar al salir (checkbox)

**Acciones:**

- `Dibujar nueva geocerca`
- Editar geocerca
- Eliminar geocerca
- `Guardar`

---

### 9. Módulo Incidentes

#### 9.1 Ventana: Lista de Incidentes

**Ruta:** `/incidentes`  
**Roles:** Admin/Manager/Operator (gestión), Driver (solo crear)  
**Componente:** `IncidentsList.jsx`

**Funcionalidades:**

- Tabla de incidentes reportados
- Filtros por tipo, gravedad, estado
- Ver ubicación en mapa

**Columnas:**

- Fecha/hora
- Vehículo
- Conductor
- Tipo (accidente, avería, robo, infracción, etc.)
- Gravedad (baja, media, alta, crítica)
- Título
- Ubicación
- Costo estimado
- Estado (reportado, investigando, resuelto, cerrado)
- Acciones

**Filtros:**

- Estado (dropdown)
- Tipo (dropdown)
- Gravedad (dropdown)
- Vehículo/Conductor
- Rango de fechas

**Acciones:**

- `+ Reportar Incidente` (todos los roles autenticados)
- Ver detalle
- Actualizar estado (Admin, Manager)

---

#### 9.2 Ventana: Detalle de Incidente

**Ruta:** `/incidentes/:id`  
**Roles:** Todos (lectura), Admin/Manager (edición)  
**Componente:** `IncidentDetail.jsx`

**Secciones:**

1. **Información del Incidente** (Card)
   - Tipo, Gravedad, Título
   - Descripción completa
   - Fecha/hora
   - Reportado por (usuario)

2. **Involucrados** (Card)
   - Vehículo (con link)
   - Conductor (con link)

3. **Ubicación** (Mapa)
   - Mapa con pin de ubicación del incidente
   - Dirección

4. **Costos** (Card)
   - Costo estimado
   - Costo real (si completado)

5. **Estado y Resolución** (Card)
   - Estado actual
   - Notas de resolución
   - Fecha de resolución

**Acciones:**

- `Editar` (Admin, Manager)
- `Actualizar estado` (Admin, Manager)
- `Agregar notas` (Admin, Manager)
- `Cerrar incidente` (Admin, Manager)
- `Volver a listado`

---

#### 9.3 Ventana: Formulario Incidente (Reportar/Editar)

**Ruta:** `/incidentes/nuevo` o `/incidentes/:id/editar`  
**Roles:** Todos (crear), Admin/Manager (editar)  
**Componente:** `IncidentForm.jsx`

**Campos:**

**Sección: Tipo de Incidente**

- Tipo\* (select: accidente, avería, robo, infracción, otro)
- Gravedad\* (select: baja, media, alta, crítica)
- Título\* (text)
- Descripción\* (textarea)

**Sección: Involucrados**

- Vehículo\* (select/autocomplete)
- Conductor\* (select/autocomplete)

**Sección: Ubicación**

- Dirección (text con autocompletado)
- Coordenadas (lat/lng, auto o manual)
- Botón "Usar mi ubicación actual"

**Sección: Fecha y Hora**

- Fecha del incidente\* (datetime, default: ahora)

**Sección: Costos** (opcional al reportar)

- Costo estimado (number)

**Sección: Notas** (solo Admin/Manager al editar)

- Notas de resolución (textarea)
- Estado (select)
- Costo real (number)

**Acciones:**

- `Reportar` / `Guardar`
- `Cancelar`

**Funcionalidad especial para Driver:**

- **Botón de Pánico**: Ícono visible en header que crea incidente de emergencia automático con ubicación

---

### 10. Módulo Reportes

#### 10.1 Ventana: Centro de Reportes

**Ruta:** `/reportes`  
**Roles:** Admin/Manager (todos), Operator (limitados), Viewer (solo dashboard)  
**Componente:** `Reports.jsx`

**Funcionalidades:**

- Selector de tipo de reporte
- Filtros dinámicos según tipo
- Vista previa
- Exportación (PDF, Excel)

**Tipos de Reportes:**

1. **Reporte de Vehículos**
   - Listado completo con filtros
   - Estadísticas (total, por tipo, por estado)
   - Gráficos

2. **Reporte de Conductores**
   - Listado con desempeño
   - Incidentes por conductor
   - Horas de servicio

3. **Reporte de Mantenimiento**
   - Mantenimientos realizados
   - Costos totales
   - Próximos vencimientos

4. **Reporte de Combustible**
   - Consumo total por vehículo
   - Consumo promedio (litros/km)
   - Costos totales
   - Comparaciones

5. **Reporte de Rutas**
   - Rutas completadas
   - Desviaciones promedio
   - Eficiencia

6. **Reporte de Incidentes**
   - Incidentes por tipo
   - Incidentes por gravedad
   - Costos totales

7. **Reportes Personalizados** (Admin/Manager)
   - Constructor de consultas
   - Seleccionar campos
   - Filtros avanzados

**Filtros Comunes:**

- Rango de fechas
- Vehículos específicos
- Conductores específicos
- Estado

**Acciones:**

- `Generar Reporte`
- `Exportar PDF`
- `Exportar Excel`
- `Programar reporte automático` (Admin)

---

#### 10.2 Ventana: Dashboard de KPIs

**Ruta:** `/dashboard` (integrado) o `/reportes/kpis`  
**Roles:** Todos  
**Componente:** `Dashboard.jsx` o sección dentro

**KPIs Principales:**

1. **Flota**
   - Total de vehículos
   - Vehículos activos
   - Vehículos en mantenimiento
   - Tasa de disponibilidad (%)

2. **Operación**
   - Conductores activos
   - Rutas activas
   - Rutas completadas hoy/semana/mes
   - Eficiencia de rutas (%)

3. **Mantenimiento**
   - Mantenimientos pendientes
   - Mantenimientos vencidos
   - Costo total de mantenimiento (mes/año)

4. **Combustible**
   - Consumo total (mes)
   - Consumo promedio (litros/km)
   - Costo total combustible (mes)
   - Ahorro vs. mes anterior (%)

5. **Alertas e Incidentes**
   - Alertas activas
   - Incidentes del mes
   - Incidentes críticos
   - Tiempo promedio de resolución

**Gráficos:**

- Línea: Consumo de combustible últimos 6 meses
- Barras: Incidentes por tipo (mes actual)
- Pastel: Distribución vehículos por estado
- Barras: Mantenimientos por tipo (mes actual)
- Línea: Rutas completadas últimas 4 semanas

**Acciones:**

- Click en KPI → Navegar a módulo/reporte detallado
- `Actualizar` (refrescar datos)
- `Exportar dashboard` (PDF)

---

### 11. Módulo Configuración

#### 11.1 Ventana: Gestión de Usuarios

**Ruta:** `/configuracion/usuarios`  
**Roles:** Admin (total), Manager (limitado)  
**Componente:** `UserManagement.jsx`

**Funcionalidades:**

- Tabla de usuarios del sistema
- Crear, editar, eliminar usuarios
- Asignar roles
- Activar/desactivar usuarios

**Columnas:**

- Nombre completo
- Email/Usuario
- Rol (Admin, Manager, Operator, Viewer, Driver)
- Activo (toggle)
- Último acceso
- Fecha de creación
- Acciones

**Acciones:**

- `+ Nuevo Usuario` (Admin)
- Editar (Admin, Manager limitado)
- Eliminar (solo Admin)
- Desactivar/Activar

---

#### 11.2 Ventana: Formulario Usuario

**Ruta:** `/configuracion/usuarios/nuevo` o `/configuracion/usuarios/:id/editar`  
**Roles:** Admin  
**Componente:** `UserForm.jsx`

**Campos:**

**Sección: Datos de Usuario**

- Email\* (email, unique)
- Nombre\* (text)
- Apellidos\* (text)
- Contraseña\* (password, solo al crear)
- Confirmar contraseña\* (password, solo al crear)

**Sección: Rol y Permisos**

- Rol\* (select: Admin, Manager, Operator, Viewer, Driver)
- Vinculado a conductor (select, solo si rol=Driver)

**Sección: Estado**

- Usuario activo (checkbox, default: true)

**Acciones:**

- `Guardar`
- `Cancelar`

---

#### 11.3 Ventana: Configuración del Sistema

**Ruta:** `/configuracion/sistema`  
**Roles:** Admin  
**Componente:** `Settings.jsx`

**Funcionalidades:**

- Configurar parámetros generales del sistema
- Configurar integraciones
- Políticas y privacidad

**Secciones:**

1. **General**
   - Nombre de la empresa (text)
   - Logo (upload)
   - Zona horaria (select)
   - Idioma (select)

2. **Integraciones**
   - API de Mapas (Google Maps, Mapbox, etc.)
     - Clave API (text)
     - Probar conexión (botón)
   - ERP
     - URL del ERP (text)
     - Credenciales
     - Estado de conexión
   - GPS/Tracking
     - Proveedor (select)
     - Configuración

3. **Notificaciones**
   - Email SMTP
     - Servidor, Puerto, Usuario, Contraseña
     - Probar envío (botón)
   - Push Notifications
     - Activar (toggle)

4. **Políticas**
   - Política de privacidad (editor de texto)
   - Términos de uso (editor de texto)
   - Período de retención de datos (number, días)

5. **Backup y Mantenimiento**
   - Frecuencia de backup (select: diario, semanal)
   - Última ejecución de backup (fecha)
   - Ejecutar backup ahora (botón)

**Acciones:**

- `Guardar configuración`
- `Restaurar valores por defecto`

---

### 12. Componentes Adicionales

#### 12.1 Componente: Sidebar/Menú de Navegación

**Componente:** `Sidebar.jsx`

**Estructura del Menú (según rol):**

**Todos los roles:**

- 🏠 Dashboard
- 🔔 Alertas (con badge de alertas activas)
- 👤 Mi Perfil
- 🔐 Cerrar Sesión

**Admin:**

- 🚗 Vehículos
  - Lista
  - Nuevo
- 👨‍✈️ Conductores
  - Lista
  - Nuevo
- 🗺️ Rutas
  - Lista
  - Nueva
- 🔧 Mantenimiento
  - Lista
  - Programar
- ⛽ Combustible
- 🚨 Incidentes
- 📊 Reportes
  - Dashboard KPIs
  - Reportes
- ⚙️ Configuración
  - Usuarios
  - Sistema
  - Alertas
  - Geocercas

**Manager:**

- 🚗 Vehículos (solo lista)
- 👨‍✈️ Conductores (solo lista)
- 🗺️ Rutas
  - Lista
  - Nueva
- 🔧 Mantenimiento
  - Lista
  - Programar
- ⛽ Combustible
- 🚨 Incidentes
- 📊 Reportes
- ⚙️ Configuración
  - Alertas
  - Geocercas

**Operator:**

- 🚗 Vehículos (solo lista)
- 👨‍✈️ Conductores (solo lista)
- 🗺️ Rutas (solo lista)
- 🔧 Mantenimiento
- ⛽ Combustible
- 🚨 Incidentes

**Viewer:**

- 🚗 Vehículos (solo lista)
- 👨‍✈️ Conductores (solo lista)
- 📊 Dashboard KPIs

**Driver:**

- 🚨 Reportar Incidente
- 📋 Mis Asignaciones

---

#### 12.2 Componente: TopBar/Header

**Componente:** `TopBar.jsx`

**Elementos:**

- Logo de la aplicación (izquierda)
- Breadcrumbs de navegación
- Buscador global (opcional)
- Notificaciones (campana con badge)
- Perfil de usuario (dropdown)
  - Ver perfil
  - Cambiar contraseña
  - Cerrar sesión
- Botón de pánico (solo para Driver, visible siempre)

---

#### 12.3 Componente: MapViewer

**Componente:** `MapViewer.jsx`  
**Uso:** Dashboard, Detalle Vehículo, Rutas, Incidentes, Geocercas

**Funcionalidades:**

- Mapa base (Leaflet/Google Maps)
- Marcadores de vehículos con estado
- Geocercas superpuestas
- Rutas trazadas
- Clustering de marcadores (si muchos vehículos)
- Controles de zoom, capas, etc.
- Click en marcador → Popup con información

**Props:**

- `vehicles` (array): Vehículos a mostrar
- `routes` (array): Rutas a trazar
- `geofences` (array): Geocercas a mostrar
- `center` (lat/lng): Centro inicial
- `zoom` (number): Zoom inicial
- `onMarkerClick` (function): Callback al hacer click

---

#### 12.4 Componente: Table

**Componente:** `Table.jsx`  
**Uso:** Todas las listas (vehículos, conductores, rutas, etc.)

**Funcionalidades:**

- Tabla responsive
- Ordenamiento por columnas
- Paginación
- Búsqueda/filtros
- Acciones por fila
- Selección múltiple (checkboxes)
- Exportar datos

**Props:**

- `columns` (array): Definición de columnas
- `data` (array): Datos a mostrar
- `onRowClick` (function): Callback al hacer click en fila
- `actions` (array): Acciones disponibles
- `pagination` (object): Config de paginación
- `filters` (object): Filtros activos

---

#### 12.5 Componente: Card

**Componente:** `Card.jsx`  
**Uso:** KPIs, información resumida, widgets

**Variantes:**

- Card de KPI (con número grande y ícono)
- Card de información (con título y contenido)
- Card de alerta (con color según gravedad)
- Card de gráfico (con chart.js/recharts)

**Props:**

- `title` (string)
- `value` (string/number)
- `icon` (component)
- `color` (string)
- `onClick` (function)
- `children` (ReactNode)

---

## 🔄 Flujos de Navegación

### Flujo 1: Administrador - Agregar Vehículo y Asignar Conductor

1. Login → Dashboard
2. Sidebar → Vehículos → Lista
3. Botón "+ Nuevo Vehículo"
4. Completar formulario
5. Guardar
6. Redirección a Detalle del vehículo
7. Botón "Asignar Conductor"
8. Seleccionar conductor de lista
9. Confirmar
10. Vehículo asignado, estado actualizado

---

### Flujo 2: Manager - Crear y Asignar Ruta

1. Login → Dashboard
2. Sidebar → Rutas → Nueva
3. Formulario de ruta:
   - Definir origen/destino en mapa
   - Agregar paradas
   - Calcular ruta automáticamente
4. Asignar vehículo y conductor
5. Programar fecha/hora
6. Guardar
7. Ruta en estado "planificada"
8. Al llegar la hora, Manager hace clic en "Iniciar Ruta"
9. Estado cambia a "activa"
10. Monitoreo en tiempo real en mapa
11. Al finalizar, clic en "Finalizar Ruta"
12. Ver comparación planificado vs. real

---

### Flujo 3: Operator - Registrar Mantenimiento Realizado

1. Login → Dashboard
2. Sidebar → Mantenimiento → Lista
3. Buscar vehículo con mantenimiento programado
4. Clic en "Registrar realizado"
5. Formulario con datos prellenados
6. Completar:
   - Fecha real
   - Costo
   - Notas
7. Guardar
8. Estado del mantenimiento cambia a "completado"
9. Se actualiza "último mantenimiento" del vehículo
10. Se calcula próximo mantenimiento automáticamente

---

### Flujo 4: Driver - Reportar Incidente (Botón de Pánico)

1. Login en app móvil o web
2. En cualquier pantalla, ver botón de pánico en header
3. Clic en botón de pánico
4. Formulario pre-rellenado:
   - Tipo: Emergencia
   - Gravedad: Crítica
   - Vehículo: Auto-detectado de asignación actual
   - Conductor: Usuario actual
   - Ubicación: GPS actual
   - Fecha/hora: Ahora
5. Opción de agregar descripción rápida
6. Botón "Enviar Alerta"
7. Incidente creado
8. Notificación push inmediata a Admin/Manager
9. Alerta visible en Dashboard de supervisores

---

### Flujo 5: Viewer - Consultar KPIs

1. Login → Dashboard
2. Ver KPIs principales en cards
3. Ver mapa con vehículos activos
4. Ver alertas recientes
5. Clic en card de KPI (ej: "Vehículos Activos")
6. Redirección a Lista de Vehículos con filtro aplicado
7. Solo lectura, sin acciones de edición

---

## 📊 Resumen de Ventanas por Rol

| Ventana                  | Admin     | Manager    | Operator   | Viewer  | Driver    |
| ------------------------ | --------- | ---------- | ---------- | ------- | --------- |
| Login                    | ✅        | ✅         | ✅         | ✅      | ✅        |
| Dashboard                | ✅        | ✅         | ✅         | ✅      | ❌        |
| Lista Vehículos          | ✅ CRUD   | ✅ Read    | ✅ Read    | ✅ Read | ❌        |
| Detalle Vehículo         | ✅ Edit   | ✅ Read    | ✅ Read    | ✅ Read | ❌        |
| Formulario Vehículo      | ✅        | ❌         | ❌         | ❌      | ❌        |
| Lista Conductores        | ✅ CRUD   | ✅ Read    | ✅ Read    | ✅ Read | ❌        |
| Detalle Conductor        | ✅ Edit   | ✅ Read    | ✅ Read    | ❌      | ❌        |
| Formulario Conductor     | ✅        | ❌         | ❌         | ❌      | ❌        |
| Lista Rutas              | ✅ CRUD   | ✅ CRUD    | ✅ Read    | ✅ Read | ❌        |
| Detalle Ruta             | ✅ Edit   | ✅ Edit    | ✅ Read    | ✅ Read | ❌        |
| Formulario Ruta          | ✅        | ✅         | ❌         | ❌      | ❌        |
| Lista Mantenimientos     | ✅ CRUD   | ✅ CRUD    | ✅ Update  | ✅ Read | ❌        |
| Formulario Mantenimiento | ✅        | ✅         | ✅         | ❌      | ❌        |
| Combustible              | ✅ CRUD   | ✅ CRUD    | ✅ Create  | ✅ Read | ❌        |
| Formulario Combustible   | ✅        | ✅         | ✅         | ❌      | ❌        |
| Centro Alertas           | ✅ Manage | ✅ Manage  | ✅ Manage  | ✅ Read | ❌        |
| Config Alertas           | ✅        | ✅         | ❌         | ❌      | ❌        |
| Geocercas                | ✅        | ✅         | ❌         | ❌      | ❌        |
| Lista Incidentes         | ✅ Manage | ✅ Manage  | ✅ Create  | ❌      | ✅ Create |
| Detalle Incidente        | ✅ Edit   | ✅ Edit    | ✅ Read    | ❌      | ❌        |
| Formulario Incidente     | ✅        | ✅         | ✅         | ❌      | ✅        |
| Reportes                 | ✅ All    | ✅ All     | ✅ Limited | ❌      | ❌        |
| Dashboard KPIs           | ✅        | ✅         | ✅         | ✅      | ❌        |
| Gestión Usuarios         | ✅        | 🟡 Limited | ❌         | ❌      | ❌        |
| Formulario Usuario       | ✅        | ❌         | ❌         | ❌      | ❌        |
| Config Sistema           | ✅        | ❌         | ❌         | ❌      | ❌        |
| Mi Perfil                | ✅        | ✅         | ✅         | ✅      | ✅        |
| Cambiar Contraseña       | ✅        | ✅         | ✅         | ✅      | ✅        |

---

## 📝 Notas Adicionales

### Responsividad

- Todas las ventanas deben ser responsive (móvil, tablet, desktop)
- Uso de Tailwind CSS con breakpoints estándar
- Navegación móvil con menú hamburguesa

### Accesibilidad

- Cumplir WCAG 2.1 nivel AA
- Soporte de teclado para navegación
- Etiquetas aria para lectores de pantalla
- Contraste de colores adecuado

### Performance

- Lazy loading de componentes pesados (mapas, gráficos)
- Paginación en tablas grandes
- Virtualización para listas largas
- Caching de datos frecuentes

### Seguridad

- Validación en cliente y servidor
- Protección CSRF
- Sanitización de inputs
- RLS en Supabase por rol

### UX

- Mensajes de confirmación para acciones destructivas
- Loaders/spinners para acciones asíncronas
- Toasts/notificaciones para feedback
- Breadcrumbs para orientación
- Estados vacíos con CTAs claros

---

**Documento generado acorde a:**

- `docs/BACKLOG_PRODUCTO.md`
- `docs/diagramas/Diagrama_Casos_Uso.md`
- `docs/diagramas/Diagrama_Secuencia_Casos_Uso.md`
- `docs/ARQUITECTURA.md`
