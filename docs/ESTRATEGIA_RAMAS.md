# 🌿 Estrategia de Branching para Scrum

## 📋 Estructura de Ramas

### **Ramas Principales**

```
main (producción)
├── develop (integración)
├── release/v1.0.0 (preparación de release)
└── hotfix/critical-fix (correcciones urgentes)
```

### **Ramas de Desarrollo**

```
develop
├── feature/FLT-001-dashboard-kpis
├── feature/FLT-002-vehicle-tracking
├── feature/FLT-003-driver-management
└── feature/FLT-004-route-optimization
```

## 🏷️ Convenciones de Nombres

### **Features (Historias de Usuario)**

```bash
feature/FLT-XXX-descripcion-corta
# Ejemplos:
feature/FLT-001-dashboard-kpis
feature/FLT-002-vehicle-tracking
feature/FLT-003-driver-management
```

### **Bugs**

```bash
bugfix/FLT-XXX-descripcion-corta
# Ejemplos:
bugfix/FLT-101-login-validation-error
bugfix/FLT-102-map-loading-issue
```

### **Technical Tasks**

```bash
tech/FLT-XXX-descripcion-corta
# Ejemplos:
tech/FLT-201-setup-testing-framework
tech/FLT-202-optimize-database-queries
```

### **Hotfixes**

```bash
hotfix/FLT-XXX-descripcion-corta
# Ejemplos:
hotfix/FLT-301-security-patch
hotfix/FLT-302-critical-bug-fix
```

## 🔄 Flujo de Trabajo Scrum

### **1. Sprint Planning**

```bash
# Crear rama para el sprint
git checkout develop
git pull origin develop
git checkout -b sprint/sprint-1

# Crear ramas para cada historia
git checkout -b feature/FLT-001-dashboard-kpis
git checkout -b feature/FLT-002-vehicle-tracking
```

### **2. Desarrollo de Historia**

```bash
# Trabajar en la historia
git checkout feature/FLT-001-dashboard-kpis
git add .
git commit -m "feat(dashboard): implementar KPIs básicos"
git push origin feature/FLT-001-dashboard-kpis
```

### **3. Pull Request**

```bash
# Crear PR hacia develop
# - Asignar reviewers
# - Agregar labels
# - Vincular con issue
# - Ejecutar CI/CD
```

### **4. Code Review**

```bash
# Revisar código
# - Aprobar cambios
# - Solicitar modificaciones
# - Merge a develop
```

### **5. Sprint Review**

```bash
# Al final del sprint
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
# Preparar release
```

## 📊 Gestión de Issues

### **Etiquetado de Issues**

- **Tipo**: `user-story`, `bug`, `technical`
- **Prioridad**: `priority-critical`, `priority-high`, `priority-medium`, `priority-low`
- **Sprint**: `sprint-1`, `sprint-2`, `sprint-3`
- **Estado**: `backlog`, `in-progress`, `review`, `done`
- **Componente**: `frontend`, `backend`, `database`, `ui`

### **Workflow de Issues**

1. **Backlog** → **Ready for Sprint** → **In Progress** → **Review** → **Done**
2. **Blocked** (si hay impedimentos)
3. **Needs Refinement** (si necesita más detalle)

## 🚀 GitHub Projects

### **Configuración del Proyecto**

```
📋 Sprint Backlog
├── 📝 To Do
├── 🔄 In Progress
├── 👀 Review
└── ✅ Done
```

### **Vistas del Proyecto**

- **Sprint View**: Vista por sprint
- **Epic View**: Vista por épicas
- **Component View**: Vista por componentes
- **Assignee View**: Vista por asignados

## 📋 Templates de Issues

### **User Story Template**

```markdown
## 📋 User Story

**Como** [rol]
**Quiero** [funcionalidad]
**Para** [beneficio]

## ✅ Criterios de Aceptación

- [ ] Criterio 1
- [ ] Criterio 2

## 🎯 Definition of Done

- [ ] Código implementado
- [ ] Tests escritos
- [ ] Documentación actualizada
```

### **Bug Report Template**

```markdown
## 🐛 Descripción del Bug

[Descripción clara]

## 🔄 Pasos para Reproducir

1. Paso 1
2. Paso 2

## ✅ Comportamiento Esperado

[Qué debería pasar]

## ❌ Comportamiento Actual

[Qué está pasando]
```

## 🔧 Configuración de Protección de Ramas

### **Rama `main`**

- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to matching branches

### **Rama `develop`**

- Require pull request reviews
- Require status checks to pass
- Allow force pushes (para rebase)

## 📊 Métricas de Sprint

### **Velocity Tracking**

- Story points completados por sprint
- Tiempo promedio por story point
- Burndown chart

### **Quality Metrics**

- Bugs encontrados vs. corregidos
- Tiempo de code review
- Tiempo de CI/CD

## 🎯 Mejores Prácticas

### **Commits**

- Usar Conventional Commits
- Commits pequeños y frecuentes
- Mensajes descriptivos

### **Pull Requests**

- Títulos descriptivos
- Descripción detallada
- Screenshots si aplica
- Tests incluidos

### **Code Review**

- Revisar dentro de 24 horas
- Feedback constructivo
- Aprobar solo si está listo

## 📚 Recursos Adicionales

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Scrum Guide](https://scrumguides.org/)
- [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
