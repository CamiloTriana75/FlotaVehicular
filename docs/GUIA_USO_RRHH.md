# 📖 Guía de Uso - Rol RRHH (Recursos Humanos)

## 🎯 Introducción

Esta guía está diseñada para el personal de **Recursos Humanos** que utilizará el sistema FlotaVehicular para gestionar la información de los conductores.

---

## 🔐 Acceso al Sistema

### Credenciales de Acceso

```
URL: http://localhost:5174/login
Usuario: rrhh
Contraseña: RRHH2025!
```

> ⚠️ **Importante:** Cambiar la contraseña en el primer inicio de sesión por seguridad.

### Cambiar Contraseña

1. Click en tu perfil (esquina superior derecha)
2. Seleccionar "Cambiar contraseña"
3. Ingresar contraseña actual y nueva contraseña
4. Guardar cambios

---

## 🏠 Dashboard RRHH

Al iniciar sesión, serás redirigido automáticamente al **Dashboard RRHH** (`/rrhh/dashboard`).

### Indicadores Principales (KPIs)

El dashboard muestra 4 tarjetas con información clave:

1. **Total Conductores** (Azul)
   - Número total de conductores registrados en el sistema

2. **Activos** (Verde)
   - Conductores actualmente trabajando
   - Muestra el porcentaje respecto al total

3. **Disponibles** (Índigo)
   - Conductores sin vehículo asignado

4. **Licencias por Vencer** (Amarillo)
   - Licencias que vencen en los próximos 30 días
   - ⚠️ Requiere atención inmediata

### Accesos Rápidos

- **Ver Todos los Conductores** → Lista completa con filtros
- **Registrar Conductor** → Formulario de creación
- **Reportes** → Análisis y estadísticas

### Secciones Informativas

- **Conductores Recientes:** Últimos 5 conductores registrados
- **Licencias por Vencer:** Alertas de vencimiento próximo

---

## 📋 Gestión de Conductores

### Ver Lista de Conductores

**Ruta:** `/conductores`

#### Filtros y Búsqueda

- **Barra de búsqueda:** Buscar por nombre, cédula o email
- Resultados se filtran en tiempo real

#### Información Mostrada

| Columna           | Descripción                                  |
| ----------------- | -------------------------------------------- |
| Nombre            | Nombre completo y cédula                     |
| Contacto          | Teléfono y email                             |
| Estado            | activo / disponible / en_servicio / inactivo |
| Vehículo Asignado | Placa del vehículo (si tiene)                |
| Licencia          | Fecha de vencimiento con alertas visuales    |
| Acciones          | Botón "Editar" para ir al detalle            |

#### Indicadores de Licencia

- 🔴 **Rojo + "¡Vencida!"** → Licencia ya vencida (acción inmediata)
- 🟡 **Amarillo + días restantes** → Vence en ≤ 30 días (atención necesaria)
- ⚫ **Negro** → Licencia vigente (sin problemas)

#### Estadísticas Rápidas

Tres tarjetas en la parte superior muestran:

- Conductores Activos (verde)
- Disponibles (azul)
- Licencias por Vencer (rojo)

---

## ➕ Crear Nuevo Conductor

**Ruta:** `/conductores/nuevo`

### Paso a Paso

1. Click en el botón **"Nuevo Conductor"** (verde) en la lista o dashboard
2. Llenar el formulario con los datos del conductor
3. Click en **"Crear Conductor"**
4. Serás redirigido a la lista donde aparecerá el nuevo conductor

### Campos del Formulario

#### Datos Personales

| Campo           | Obligatorio | Tipo     | Ejemplo                   |
| --------------- | ----------- | -------- | ------------------------- |
| Nombre Completo | ✅ Sí       | Texto    | Juan Pérez García         |
| Cédula          | ✅ Sí       | Texto    | 1234567890                |
| Teléfono        | ❌ No       | Teléfono | 3001234567                |
| Email           | ❌ No       | Email    | conductor@email.com       |
| Dirección       | ❌ No       | Textarea | Calle 123 # 45-67, Bogotá |

#### Licencia y Empleo

| Campo                      | Obligatorio | Tipo   | Ejemplo    | Notas                        |
| -------------------------- | ----------- | ------ | ---------- | ---------------------------- |
| Fecha Vencimiento Licencia | ✅ Sí       | Fecha  | 2026-12-31 | Debe ser hoy o fecha futura  |
| Estado                     | ✅ Sí       | Select | activo     | Ver opciones de estado abajo |
| Fecha de Ingreso           | ❌ No       | Fecha  | 2025-01-15 | Por defecto: hoy             |

#### Opciones de Estado

- **activo:** Conductor trabajando activamente
- **disponible:** Sin vehículo asignado, listo para trabajar
- **en_servicio:** Realizando una ruta actualmente
- **inactivo:** No disponible temporalmente

### Validaciones

El sistema valida automáticamente:

- ✅ Nombre completo no puede estar vacío
- ✅ Cédula no puede estar vacía
- ✅ Fecha de vencimiento de licencia obligatoria
- ✅ Fecha debe ser hoy o futura (no pasada)
- ✅ Email debe tener formato válido (si se proporciona)

### Alertas Automáticas

Si la fecha de vencimiento está dentro de los próximos 30 días, verás:

> ⚠️ Licencia vence en X días

Esto es solo informativo, el conductor se puede crear igual.

---

## ✏️ Editar Conductor

**Ruta:** `/conductores/:id`

### Acceso

1. Desde la lista de conductores, click en el botón **"Editar"**
2. O navegar directamente con el ID del conductor

### Proceso de Edición

1. El formulario se carga con los datos actuales
2. Modificar los campos que necesites actualizar
3. Click en **"Guardar Cambios"**
4. Serás redirigido a la lista con los cambios aplicados

### Datos que se Pueden Actualizar

- Todos los campos del formulario de creación
- Estado del conductor
- Fechas de licencia y ingreso
- Información de contacto

---

## 🗑️ Eliminar Conductor

### ⚠️ Zona Peligrosa

La opción de eliminar está en una sección especial de color rojo al final de la página de detalle.

### Proceso de Eliminación

1. Ir a `/conductores/:id`
2. Scroll hasta la sección **"Zona Peligrosa"**
3. Click en el botón **"Eliminar Conductor"** (rojo)
4. Aparece confirmación: _"¿Estás seguro de que deseas eliminar al conductor [Nombre]? Esta acción no se puede deshacer."_
5. Click en **"Aceptar"** para confirmar
6. El conductor es eliminado permanentemente

> ⚠️ **Advertencia:** Esta acción **NO se puede deshacer**. Toda la información del conductor se borrará permanentemente del sistema.

### Consideraciones

- Verificar que el conductor no tenga asignaciones activas
- Descargar reportes antes de eliminar si necesitas conservar historial
- Consultar con supervisor antes de eliminar

---

## 🔔 Alertas de Licencias

### Licencias Próximas a Vencer

El sistema monitorea automáticamente las fechas de vencimiento de licencias y genera alertas visuales.

#### ¿Cuándo se Genera una Alerta?

- Cuando la fecha de vencimiento está a **30 días o menos**
- Se muestra en:
  - Dashboard RRHH (tarjeta "Licencias por Vencer")
  - Lista de conductores (columna "Licencia")
  - Formulario de edición (advertencia amarilla)

#### Tipos de Alerta

| Días Restantes | Color       | Mensaje      | Acción Recomendada         |
| -------------- | ----------- | ------------ | -------------------------- |
| < 0            | 🔴 Rojo     | "¡Vencida!"  | Acción inmediata requerida |
| 1-30           | 🟡 Amarillo | "X días"     | Programar renovación       |
| > 30           | ⚫ Negro    | Fecha normal | Sin acción requerida       |

#### Acciones Recomendadas

1. **Licencia vencida (rojo):**
   - Contactar al conductor inmediatamente
   - Suspender asignaciones de vehículos
   - Solicitar renovación urgente

2. **Vence en 1-30 días (amarillo):**
   - Enviar recordatorio al conductor
   - Programar cita para renovación
   - Hacer seguimiento semanal

---

## 📊 Reportes y Análisis

### Generar Reporte de Conductores

**Ruta:** `/reportes`

1. Seleccionar "Reporte de Conductores"
2. Aplicar filtros:
   - Rango de fechas
   - Estado (activo, disponible, etc.)
   - Con/sin licencia por vencer
3. Click en "Generar Reporte"
4. Exportar en PDF o Excel

### Información Incluida

- Lista completa de conductores
- Estado de licencias
- Fecha de ingreso
- Vehículo asignado (si aplica)
- Estadísticas generales

---

## 💡 Consejos y Mejores Prácticas

### Mantenimiento de Datos

- ✅ Actualizar fechas de licencia apenas se renueven
- ✅ Verificar datos de contacto periódicamente
- ✅ Revisar el dashboard diariamente para alertas
- ✅ Exportar reportes mensuales para auditoría

### Prevención de Problemas

- ⚠️ Revisar licencias por vencer al inicio de cada semana
- ⚠️ Contactar a conductores con licencias próximas a vencer
- ⚠️ Mantener actualizado el estado de cada conductor
- ⚠️ Documentar cambios importantes en notas

### Formato de Fechas

Todas las fechas se ingresan en formato:

```
YYYY-MM-DD
Ejemplo: 2026-12-31
```

El sistema automáticamente muestra las fechas en formato local colombiano (DD/MM/YYYY) en la interfaz.

---

## 🆘 Solución de Problemas

### No puedo crear un conductor

**Posibles causas:**

- Campos obligatorios vacíos → Llenar todos los campos con \*
- Fecha de vencimiento pasada → Usar fecha actual o futura
- Email inválido → Verificar formato (ejemplo@dominio.com)

**Solución:** Revisar mensajes de error en rojo debajo de cada campo

---

### La licencia muestra "Vencida" pero está vigente

**Causa:** Fecha mal ingresada o zona horaria

**Solución:**

1. Ir a editar conductor
2. Verificar fecha en el formulario
3. Corregir si es necesario (formato YYYY-MM-DD)
4. Guardar cambios

---

### No aparecen las alertas de licencias

**Causa:** Fecha de vencimiento no configurada

**Solución:**

1. Editar cada conductor sin fecha
2. Agregar la fecha de vencimiento de licencia
3. Guardar cambios

---

### Error al eliminar conductor

**Posibles causas:**

- Conductor tiene asignaciones activas
- Permisos insuficientes

**Solución:** Contactar al administrador del sistema

---

## 📞 Soporte

### ¿Necesitas Ayuda?

- **Documentación técnica:** [README.md](../README.md)
- **Guía de desarrollo:** [docs/DESARROLLO.md](./DESARROLLO.md)
- **Reportar problema:** Crear issue en GitHub

### Contacto

- **Email soporte:** soporte@flotavehicular.com
- **Administrador sistema:** admin@flotavehicular.com

---

## 🔄 Actualizaciones y Cambios

### Historial de Versiones

**Versión 1.0.0** (09/11/2025)

- ✅ CRUD completo de conductores
- ✅ Dashboard RRHH
- ✅ Sistema de alertas de licencias
- ✅ Validaciones automáticas
- ✅ Exportación de reportes

---

**Desarrollado para:** FlotaVehicular  
**Rol:** RRHH (Recursos Humanos)  
**Issue:** #50 - CRUD de Conductores  
**Sprint:** 9 - Gestión de Conductores
