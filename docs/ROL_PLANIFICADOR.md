# 🗺️ Rol de Planificador - Sistema de Rutas

## 📋 Descripción

El rol **Planificador** es un perfil especializado diseñado para usuarios que se encargan exclusivamente de la **planificación y optimización de rutas** en el sistema de gestión de flota vehicular.

## 🎯 Objetivo del Rol

Permitir a usuarios dedicados gestionar de manera eficiente las rutas de entrega, recolección o servicio, sin necesidad de acceso completo al sistema, manteniendo la seguridad y separación de responsabilidades.

---

## ✅ Permisos y Capacidades

### 🟢 Acceso COMPLETO

El planificador tiene permisos completos (crear, editar, eliminar) para:

#### **Gestión de Rutas**

- ✅ Crear nuevas rutas con waypoints (2-12 puntos)
- ✅ Editar rutas existentes
- ✅ Eliminar rutas
- ✅ Optimizar rutas mediante Mapbox API
- ✅ Ver historial de rutas creadas

#### **Asignación de Rutas**

- ✅ Asignar rutas a conductores y vehículos
- ✅ Programar horarios de inicio/fin
- ✅ Actualizar estado de asignaciones
- ✅ Agregar notas a las asignaciones
- ✅ Cancelar asignaciones

### 🔵 Acceso de SOLO LECTURA

El planificador puede **ver pero NO modificar**:

- 👁️ Listado de conductores (para asignación de rutas)
- 👁️ Listado de vehículos (para asignación de rutas)
- 👁️ Asignaciones conductor-vehículo activas
- 👁️ Información básica de conductores y vehículos

### 🔴 SIN ACCESO

El planificador **NO puede**:

- ❌ Crear, editar o eliminar conductores
- ❌ Crear, editar o eliminar vehículos
- ❌ Gestionar usuarios del sistema
- ❌ Modificar configuraciones generales
- ❌ Acceder a módulos de mantenimiento
- ❌ Acceder a módulos de combustible
- ❌ Ver reportes financieros
- ❌ Gestionar incidentes
- ❌ Modificar asignaciones conductor-vehículo

---

## 🚀 Flujo de Trabajo del Planificador

### 1️⃣ Crear una Ruta

```
Login → Menú "Planificación Rutas" → Nueva Ruta
→ Agregar waypoints en el mapa (click)
→ Optimizar ruta con Mapbox
→ Guardar ruta
```

### 2️⃣ Asignar Ruta a Conductor

```
Planificación Rutas → Seleccionar ruta → Asignar
→ Elegir conductor (con vehículo asignado)
→ Configurar horario programado
→ Agregar notas (opcional)
→ Confirmar asignación
```

### 3️⃣ Gestionar Rutas Existentes

```
Planificación Rutas → Ver lista de rutas
→ Filtrar por estado (activas/archivadas)
→ Ver asignaciones por ruta
→ Editar o eliminar según necesidad
```

---

## 🔐 Seguridad y Políticas RLS

Las políticas de seguridad a nivel de base de datos (Row Level Security) garantizan que:

1. **Solo usuarios autenticados** con rol `planificador` pueden acceder
2. **No pueden modificar** datos de otras tablas (conductores, vehículos)
3. **Auditoría completa** de todas las acciones realizadas
4. **Aislamiento de datos** según permisos del rol

---

## 👥 Crear un Usuario Planificador

### Opción 1: Usando el Script

```bash
node scripts/create-planificador.js "Nombre Completo" email@empresa.com password123
```

**Ejemplo:**

```bash
node scripts/create-planificador.js "María Rodríguez" maria.rodriguez@fleet.com PlanMaría2025
```

### Opción 2: SQL Directo en Supabase

```sql
INSERT INTO usuario (nombre, email, password_hash, rol, estado)
VALUES (
  'María Rodríguez',
  'maria.rodriguez@fleet.com',
  '$2a$10$TuHashBcrypt...', -- Hashear con bcrypt
  'planificador',
  'activo'
);
```

**Generar hash bcrypt en Node.js:**

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('tuContraseña', 10);
console.log(hash);
```

### Opción 3: Ejecutar Migración SQL

Ejecuta el archivo de migración:

```
supabase/migrations/20251112210000_add_planificador_role.sql
```

Esto:

- ✅ Agrega el rol al ENUM
- ✅ Crea usuario de ejemplo
- ✅ Configura políticas RLS

---

## 📊 Casos de Uso Típicos

### 🎯 Caso 1: Empresa de Entregas

**Planificador:** Crea rutas diarias de reparto

- Agrega direcciones de clientes como waypoints
- Optimiza para menor distancia/tiempo
- Asigna a conductores disponibles

### 🎯 Caso 2: Servicio de Transporte

**Planificador:** Organiza rutas de recogida de pasajeros

- Define puntos de recogida y destino
- Asigna según capacidad del vehículo
- Programa horarios de inicio

### 🎯 Caso 3: Servicios de Campo

**Planificador:** Coordina visitas técnicas

- Establece orden de clientes a visitar
- Optimiza tiempo de desplazamiento
- Asigna técnicos con vehículos adecuados

---

## 🛡️ Limitaciones de Seguridad

Para mantener la integridad del sistema:

| Acción                      | Permitido | Razón                         |
| --------------------------- | --------- | ----------------------------- |
| Ver lista de conductores    | ✅ Sí     | Necesario para asignaciones   |
| Editar datos de conductor   | ❌ No     | Responsabilidad de RRHH       |
| Ver vehículos disponibles   | ✅ Sí     | Necesario para asignaciones   |
| Modificar datos de vehículo | ❌ No     | Responsabilidad de Admin      |
| Crear rutas                 | ✅ Sí     | Función principal             |
| Ver reportes financieros    | ❌ No     | Información sensible          |
| Asignar conductor-vehículo  | ❌ No     | Responsabilidad de Supervisor |

---

## 📱 Interfaz de Usuario

El planificador ve en el menú lateral:

```
📍 Planificación Rutas
   - Nueva Ruta
   - Lista de Rutas
   - Asignaciones
```

**NO ve:**

- Dashboard General
- Gestión de Vehículos
- Gestión de Conductores (crear/editar)
- Mantenimiento
- Combustible
- Usuarios
- Configuración avanzada

---

## 🔄 Integración con Otros Roles

| Rol              | Interacción con Planificador                             |
| ---------------- | -------------------------------------------------------- |
| **Superusuario** | Puede hacer todo lo que hace el planificador + más       |
| **Admin**        | Puede hacer todo lo que hace el planificador + más       |
| **Operador**     | Puede hacer todo lo que hace el planificador + monitoreo |
| **Conductor**    | Recibe las rutas asignadas por el planificador           |
| **RRHH**         | Gestiona conductores que el planificador asigna a rutas  |
| **Supervisor**   | Monitorea el cumplimiento de rutas planificadas          |

---

## 📝 Notas Importantes

1. **Un planificador NO puede auto-asignarse rutas** si también es conductor
2. **Requiere conexión a Internet** para optimización con Mapbox API
3. **Los waypoints mínimos son 2**, máximo 12 (límite de Mapbox)
4. **Las rutas archivadas** no se pueden asignar, solo visualizar
5. **Las asignaciones pueden ser canceladas** antes de iniciar

---

## 🆘 Soporte y Ayuda

Si un planificador necesita:

- **Crear conductores**: Contactar a RRHH o Admin
- **Modificar vehículos**: Contactar a Admin u Operador
- **Problemas técnicos**: Contactar a Superusuario
- **Cambiar permisos**: Solo Superusuario puede modificar roles

---

## ✨ Ventajas del Rol Dedicado

1. 🎯 **Especialización**: Usuario enfocado solo en rutas
2. 🔒 **Seguridad**: No puede modificar datos críticos
3. 📊 **Trazabilidad**: Auditoría de quién planifica cada ruta
4. ⚡ **Eficiencia**: Interfaz simplificada sin distracciones
5. 🤝 **Colaboración**: Trabaja con RRHH y Operaciones sin conflictos

---

**Última actualización:** 12 de noviembre de 2025  
**Versión del sistema:** HU10 - Sistema de Rutas Optimizadas
