# 🔐 Credenciales para Acceder al Sistema de Reportes

## 📊 Usuarios con Acceso a Reportes

### Analista

- **Email:** `analista@flotavehicular.com`
- **Contraseña:** `Analista123!`
- **Rol:** `analista`
- **Acceso:** Reportes Custom, Templates, Programación de Envíos

### Superusuario

- **Email:** `superusuario@flotavehicular.com`
- **Contraseña:** `Superusuario123!`
- **Rol:** `superusuario`
- **Acceso:** Todo el sistema (Admin Total)

---

## 🚀 Cómo Acceder

1. **Abre la aplicación** y ve a la pantalla de login
2. **Ingresa el email** del usuario (ej: `analista@flotavehicular.com`)
3. **Ingresa la contraseña** (ej: `Analista123!`)
4. **Haz clic en Login**
5. **Serás redirigido automáticamente** a `/reportes` (Sistema de Reportes)

---

## 📋 Qué Puedes Hacer en Reportes

### Con el Rol Analista:

✅ **Constructor de Reportes (4 pasos)**

- Seleccionar tipo de reporte (Conductores, Vehículos, Incidentes, Mantenimiento)
- Configurar filtros (fechas, estado, severidad, etc.)
- Seleccionar columnas y métricas
- Guardar como template

✅ **Resultados**

- Ver datos en tabla
- Descargar CSV
- Descargar JSON
- Programar envío por email

✅ **Templates**

- Ver mis templates guardados
- Usar template (cargar configuración)
- Duplicar template
- Programar envío automático
- Eliminar template

✅ **Programación de Envíos**

- Frecuencia: Diario, Semanal, Mensual
- Múltiples destinatarios
- Próximo envío automático

---

## 🔄 Otros Usuarios (para referencia)

### Admin

- **Email:** `admin@flotavehicular.com`
- **Contraseña:** `Admin123!`
- **Acceso:** Todos los módulos

### Mecánico

- **Email:** `mecanico@flotavehicular.com`
- **Contraseña:** `Mecanico123!`
- **Acceso:** Mantenimiento

---

## 📊 Ejemplos de Reportes

### Ejemplo 1: Conductores Activos

```
Tipo: Conductores
Filtros:
  - Inicio: 2025-01-01
  - Fin: 2025-12-31
  - Estado: Activo
Columnas:
  - cedula
  - nombre
  - email
  - numero_licencia
  - fecha_vencimiento_licencia
Guardar como: "Conductores Activos 2025"
```

### Ejemplo 2: Incidentes del Mes

```
Tipo: Incidentes
Filtros:
  - Inicio: 2025-12-01
  - Fin: 2025-12-31
  - Severidad: Alta
Columnas:
  - title
  - type
  - severity
  - occurred_at
  - location
Programación:
  - Enviar el 1 de cada mes
  - Email: supervisores@empresa.com
```

---

## ⚠️ Notas Importantes

- ✅ Los usuarios con rol `analista` **solo** pueden acceder a `/reportes`
- ✅ Los `superusuario` pueden acceder a todo
- ✅ Los reportes se exportan en **CSV y JSON**
- ✅ Puedes guardar **plantillas** para reutilizar
- ✅ Programa envíos automáticos por **email**
- ⏰ Los envíos requieren una función Cron en Supabase (backend)

---

**Última actualización:** 13 de Diciembre 2025
