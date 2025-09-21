# 🏷️ Configuración de Labels para Scrum

## 📋 Labels por Tipo

### **Tipo de Issue**

- `user-story` - Historia de usuario
- `bug` - Error en el sistema
- `technical` - Tarea técnica
- `epic` - Épica del proyecto
- `spike` - Investigación/exploración

### **Prioridad**

- `priority-critical` - Crítica (rojo)
- `priority-high` - Alta (naranja)
- `priority-medium` - Media (amarillo)
- `priority-low` - Baja (verde)

### **Estado del Sprint**

- `sprint-backlog` - En backlog del sprint
- `sprint-in-progress` - En progreso
- `sprint-review` - En revisión
- `sprint-done` - Completado
- `sprint-blocked` - Bloqueado

### **Componente**

- `component-frontend` - Frontend
- `component-backend` - Backend
- `component-database` - Base de datos
- `component-ui` - Interfaz de usuario
- `component-api` - API
- `component-mobile` - Aplicación móvil

### **Tamaño/Estimación**

- `size-xs` - 1 punto (extra small)
- `size-s` - 2 puntos (small)
- `size-m` - 3 puntos (medium)
- `size-l` - 5 puntos (large)
- `size-xl` - 8 puntos (extra large)
- `size-xxl` - 13+ puntos (extra extra large)

### **Estado de Refinamiento**

- `needs-refinement` - Necesita refinamiento
- `ready-for-sprint` - Listo para sprint
- `in-review` - En revisión
- `needs-triage` - Necesita triage

### **Tipo de Trabajo**

- `feature` - Nueva funcionalidad
- `enhancement` - Mejora existente
- `refactor` - Refactorización
- `documentation` - Documentación
- `testing` - Testing
- `infrastructure` - Infraestructura

## 🎨 Colores Sugeridos

| Label                | Color       | Hex     |
| -------------------- | ----------- | ------- |
| `user-story`         | Azul        | #0075ca |
| `bug`                | Rojo        | #d73a4a |
| `technical`          | Gris        | #6f42c1 |
| `priority-critical`  | Rojo        | #d73a4a |
| `priority-high`      | Naranja     | #f66a0a |
| `priority-medium`    | Amarillo    | #ffc107 |
| `priority-low`       | Verde       | #28a745 |
| `sprint-backlog`     | Azul claro  | #0e8a16 |
| `sprint-in-progress` | Amarillo    | #fbca04 |
| `sprint-done`        | Verde       | #28a745 |
| `component-frontend` | Azul        | #0075ca |
| `component-backend`  | Verde       | #28a745 |
| `size-xs`            | Verde claro | #c2e0c6 |
| `size-s`             | Verde       | #28a745 |
| `size-m`             | Amarillo    | #ffc107 |
| `size-l`             | Naranja     | #f66a0a |
| `size-xl`            | Rojo        | #d73a4a |

## 📝 Instrucciones para Configurar

1. Ve a **Settings** > **Labels** en tu repositorio
2. Haz clic en **New label**
3. Agrega cada label con su color correspondiente
4. Organiza por categorías usando descripciones

## 🔄 Flujo de Labels

### **Nuevo Issue**

1. Asignar tipo: `user-story`, `bug`, `technical`
2. Asignar prioridad: `priority-*`
3. Asignar componente: `component-*`
4. Asignar estado: `needs-refinement`

### **Durante Sprint Planning**

1. Cambiar a `ready-for-sprint`
2. Asignar estimación: `size-*`
3. Asignar a sprint: `sprint-backlog`

### **Durante Desarrollo**

1. Cambiar a `sprint-in-progress`
2. Si hay bloqueos: `sprint-blocked`

### **Durante Review**

1. Cambiar a `sprint-review`
2. Si está listo: `sprint-done`
