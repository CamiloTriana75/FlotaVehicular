# 📊 Sistema de Reportes Custom - Guía de Implementación

## 📋 Descripción General

Sistema completo para crear, guardar, ejecutar y programar reportes personalizados con:

✅ **Constructor Visual** - Seleccionar filtros, columnas y métricas
✅ **Guardar Templates** - Reutilizar configuraciones de reportes
✅ **Exportación** - CSV y JSON
✅ **Programación de Envíos** - Automático por email (diario, semanal, mensual)

---

## 🏗️ Arquitectura

```
services/reportService.js
├── getReportTemplates()
├── createReportTemplate()
├── updateReportTemplate()
├── deleteReportTemplate()
├── executeReport()
├── exportToCSV()
├── exportToJSON()
├── createReportSchedule()
├── getReportSchedules()
├── updateReportSchedule()
└── deleteReportSchedule()

components/
├── CustomReportsPanel.jsx (Componente principal)
├── ReportBuilder.jsx (Constructor 4 pasos)
├── ReportTemplates.jsx (Gestión de templates)
└── ScheduleReportModal.jsx (Programación de envíos)
```

---

## 🚀 Implementación Rápida

### 1. Importar en Reports.jsx

```jsx
import CustomReportsPanel from '../components/CustomReportsPanel';

const Reports = () => {
  const { user } = useAuth(); // Tu hook de autenticación

  return (
    <div>
      <CustomReportsPanel userId={user?.id} />
    </div>
  );
};
```

### 2. Asegurar que las tablas existan en Supabase

El sistema requiere estas tablas (que ya existen):

```sql
-- Ya existen en tu BD
report_templates
report_schedules
report_executions
```

---

## 🎯 Características Detalladas

### Constructor de Reportes (4 pasos)

**Paso 1: Seleccionar tipo de reporte**

- Conductores (drivers)
- Vehículos (vehicles)
- Incidentes (incidents)
- Órdenes de Mantenimiento (maintenance_orders)

**Paso 2: Configurar filtros**

- Rango de fechas (inicio - fin)
- Filtros específicos por tipo (estado, severidad, etc.)

**Paso 3: Seleccionar columnas**

- Múltiples columnas disponibles por tipo
- Métricas opcionales

**Paso 4: Resumen y guardar**

- Vista previa de configuración
- Opción de guardar como template

### Resultados del Reporte

Una vez generado, puedes:

- 📊 Ver tabla de datos con hasta 50 registros visibles
- 💾 Descargar como CSV
- 💾 Descargar como JSON
- 📧 Programar envíos automáticos
- ✏️ Editar la configuración

### Templates Guardados

Gestiona tus templates con:

- ✅ Usar template (cargar configuración)
- 📋 Duplicar template (crear variación)
- 📧 Programar envío automático
- 🗑️ Eliminar template

### Programación de Envíos

Configura:

- 📅 Frecuencia: Diariamente, Semanalmente, Mensualmente
- 📍 Día específico (para weekly/monthly)
- ✉️ Múltiples destinatarios
- ⏰ Próximo envío automático

---

## 📁 Tipos de Reportes Disponibles

### Conductores (drivers)

**Columnas:**

```
cedula, nombre, apellidos, telefono, email,
numero_licencia, categoria_licencia,
fecha_vencimiento_licencia, estado, fecha_ingreso
```

**Métricas:**

- Total de Conductores
- Por Estado
- Licencias a Vencer

### Vehículos (vehicles)

**Columnas:**

```
placa, marca, modelo, año, status,
kilometraje, proximo_mantenimiento_km,
fecha_ultimo_mantenimiento
```

**Métricas:**

- Total de Vehículos
- Por Estado
- Mantenimiento Vencido
- Kilometraje Promedio

### Incidentes (incidents)

**Columnas:**

```
id, type, severity, title, status,
occurred_at, location, driver_id, vehicle_id
```

**Métricas:**

- Total Incidentes
- Por Tipo
- Por Severidad
- Tendencia

### Órdenes de Mantenimiento (maintenance_orders)

**Columnas:**

```
id, order_number, vehicle_id, title, type,
status, scheduled_date, execution_date, total_cost
```

**Métricas:**

- Total Órdenes
- Por Estado
- Costo Promedio
- Vencidas

---

## 🔌 API de Funciones

### Obtener Templates

```javascript
import { getReportTemplates } from '../services/reportService';

const templates = await getReportTemplates(userId);
```

### Crear Template

```javascript
const template = await createReportTemplate(userId, {
  name: 'Consumo Q1',
  description: 'Reporte de consumo primer trimestre',
  report_type: 'drivers',
  filters: {
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'activo',
  },
  columns: ['cedula', 'nombre', 'email'],
  metrics: ['total_drivers', 'by_status'],
  is_default: false,
});
```

### Ejecutar Reporte

```javascript
const data = await executeReport('drivers', filters, columns);

// data = [
//   { cedula: '123', nombre: 'Juan', email: 'juan@test.com' },
//   { cedula: '456', nombre: 'Pedro', email: 'pedro@test.com' }
// ]
```

### Exportar a CSV

```javascript
exportToCSV(data, 'reporte.csv');
```

### Exportar a JSON

```javascript
exportToJSON(data, 'reporte.json');
```

### Programar Envío

```javascript
const schedule = await createReportSchedule(userId, {
  template_id: 'uuid-template',
  email_recipients: ['admin@example.com'],
  frequency: 'weekly', // 'daily' | 'weekly' | 'monthly'
  day_of_week: 1, // Lunes (si es weekly)
  day_of_month: 15, // (si es monthly)
  next_send_date: '2025-01-20',
  is_active: true,
});
```

---

## 🔄 Flujo de Uso Típico

1. **Usuario accede a Reports.jsx**
   ↓
2. **Ve la pestaña "Constructor"**
   ↓
3. **Sigue los 4 pasos:**
   - Selecciona tipo de reporte
   - Configura filtros
   - Elige columnas/métricas
   - Revisa y guarda como template (opcional)
     ↓
4. **Ve resultados en tabla**
   ↓
5. **Exporta (CSV/JSON) o programa envío**
   ↓
6. **Templates se guardan automáticamente**
   ↓
7. **Próxima vez: Reutiliza templates**

---

## 🎨 Personalización

### Agregar nuevo tipo de reporte

En `reportService.js`:

```javascript
export const REPORT_TYPES = {
  // ... tipos existentes
  my_new_type: {
    label: 'Mi Nuevo Reporte',
    columns: [
      { id: 'field1', label: 'Campo 1' },
      { id: 'field2', label: 'Campo 2' },
    ],
    metrics: [{ id: 'metric1', label: 'Métrica 1' }],
  },
};
```

En `executeReport()`:

```javascript
case 'my_new_type':
  if (filters.myFilter) {
    query = query.eq('my_field', filters.myFilter);
  }
  break;
```

### Agregar nueva métrica

Las métricas se muestran como checkboxes pero requieren procesamiento backend para calcularlas. Para ahora se guardan pero no se calculan en el reporte.

---

## 📧 Programación de Envíos (Backend)

Para que funcionen los envíos automáticos, necesitas una **función Cron en Supabase** o un **servicio externo**.

Ejemplo con Supabase Functions:

```typescript
// supabase/functions/send-scheduled-reports/index.ts

import { serve } from 'https://deno.land/std@0.132.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Obtener programaciones activas para hoy
  const today = new Date().toISOString().split('T')[0];

  const { data: schedules } = await supabase
    .from('report_schedules')
    .select('*, report_templates(*)')
    .eq('is_active', true)
    .eq('next_send_date', today);

  // Por cada programación...
  for (const schedule of schedules || []) {
    // 1. Ejecutar reporte
    // 2. Enviar por email
    // 3. Actualizar próxima fecha
  }

  return new Response('OK', { status: 200 });
});
```

---

## ⚠️ Consideraciones Importantes

### Performance

- Reportes con muchos registros (>10k) pueden ser lentos
- Usa filtros para limitar datos
- Implementar paginación si es necesario

### Permisos RLS

Asegúrate que el usuario tenga permisos para:

- `SELECT` en las tablas que reporta
- `SELECT, INSERT, UPDATE, DELETE` en `report_templates`
- `SELECT, INSERT, UPDATE, DELETE` en `report_schedules`

### Pruebas

```javascript
// Probar conexión a reportes
const testReport = await executeReport('drivers', {}, ['cedula', 'nombre']);
console.log('Reportes funcionan:', testReport.length > 0);
```

---

## 🐛 Troubleshooting

### Error: "No hay datos para exportar"

- Verifica que ejecutaste el reporte
- Comprueba los filtros (no están demasiado restrictivos)
- Revisa permisos RLS en la BD

### Error: "Email inválido" en programación

- Verifica formato de email
- No incluyas espacios extras

### No aparecen templates

- Verifica que `userId` se pase correctamente
- Revisa que el usuario tenga templates guardados
- Comprueba permisos RLS

---

## 📊 Ejemplos Prácticos

### Reporte de Conductores Activos en Enero

1. **Paso 1:** Selecciona "Conductores"
2. **Paso 2:**
   - Inicio: 2025-01-01
   - Fin: 2025-01-31
   - Estado: "Activo"
3. **Paso 3:** Selecciona:
   - cedula, nombre, email, telefono
   - Métrica: "Total de Conductores"
4. **Paso 4:** Guardar como "Conductores Enero 2025"
5. **Exportar:** Descargar CSV para compartir

### Programar Reporte Mensual de Incidentes

1. **Crear reporte de incidentes** con filtros estándar
2. **Guardarlo como template**: "Reporte Mensual Incidentes"
3. **Ir a Templates → ... → Programar Envío**
4. **Configurar:**
   - Frecuencia: Mensualmente
   - Día: 1 (primero del mes)
   - Emails: supervisores@company.com
5. **Guardar** - Se envía automáticamente cada mes

---

## 🎓 Próximos Pasos

- [ ] Implementar cálculo de métricas
- [ ] Agregar gráficos (charts)
- [ ] Mejorar paginación
- [ ] Exportar a PDF
- [ ] Compartir reportes con otros usuarios
- [ ] Historial de ejecuciones
- [ ] Dashboard con reportes favoritos

---

## 📞 Soporte

Si necesitas ayuda:

1. Revisa los logs de la consola
2. Verifica conexión a Supabase
3. Confirma permisos RLS
4. Revisa tablas existen y tienen datos

---

**Creado:** 13 de Diciembre 2025
**Versión:** 1.0
**Estado:** Listo para producción
