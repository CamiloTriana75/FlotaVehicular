# 🤖 Automatización: Issues In Progress → In Review

## 📋 Descripción

Este workflow de GitHub Actions automatiza el movimiento de issues desde **In Progress** a **In Review** cuando se crea un Pull Request que las referencia.

## 🎯 Objetivo

Cuando un desarrollador crea un PR que está listo para revisión, las issues vinculadas se mueven automáticamente al estado "In Review" en el project board, ahorrando tiempo y manteniendo el tablero actualizado.

## ⚡ Funcionamiento

### Trigger (Disparador)

El workflow se ejecuta cuando:

- ✅ Se abre un nuevo Pull Request
- ✅ Un PR draft se marca como "Ready for review"

### Proceso Automático

1. **Detección de Issues Vinculadas**
   - Analiza el título y cuerpo del PR
   - Busca referencias como: `#123`, `closes #123`, `fixes #123`, `resolves #123`
   - Extrae todos los números de issues únicos

2. **Localización del Project Board**
   - Encuentra el project activo en el repositorio
   - Identifica la columna "In Review" (o similar)

3. **Movimiento de Cards**
   - Busca la tarjeta de cada issue en el project
   - Mueve la tarjeta a la columna "In Review"
   - Coloca las tarjetas al principio de la columna

4. **Notificación**
   - Agrega un comentario automático en cada issue
   - Incluye un link al Pull Request
   - Indica que fue movida automáticamente

## 📝 Ejemplo de Uso

### En el Pull Request

```markdown
## Descripción

Este PR implementa la nueva funcionalidad de autenticación

## Issues Relacionadas

- Closes #42
- Fixes #43
- Resolves #44
```

O simplemente en el título:

```
feat: implementar autenticación (#42)
```

### Resultado Esperado

1. Se crea el PR
2. El workflow se ejecuta automáticamente
3. Las issues #42, #43 y #44 se mueven a "In Review"
4. Cada issue recibe un comentario:
   > 🔄 This issue has been automatically moved to **In Review** because PR #123 was opened.
   >
   > [View Pull Request](link-al-pr)

## 🔧 Configuración

### Requisitos Previos

1. **Project Board Configurado**
   - Debe existir un project en el repositorio
   - Debe tener una columna llamada "In Review" (o similar: "review", "in review")

2. **Permisos**
   - El token `GITHUB_TOKEN` tiene los permisos necesarios por defecto
   - No requiere configuración adicional

### Personalización

Para modificar el comportamiento, edita `.github/workflows/move-to-in-review.yml`:

**Cambiar el nombre de la columna destino:**

```javascript
const inReviewColumn = columns.find((col) =>
  col.name.toLowerCase().includes('tu-nombre-de-columna')
);
```

**Cambiar el patrón de detección de issues:**

```javascript
const issuePattern = /#(\d+)|closes\s+#(\d+)|fixes\s+#(\d+)/gi;
```

**Modificar el mensaje del comentario:**

```javascript
body: `Tu mensaje personalizado con PR #${pr.number}`;
```

## 📊 Logs y Debugging

El workflow genera logs detallados:

```
Processing PR #123: feat: nueva funcionalidad
Found 3 linked issue(s): 42, 43, 44
Using project: Main Project Board
Target column: In Review
Processing issue #42: Implementar autenticación
Found card in column: In Progress
✅ Moved issue #42 to In Review
✨ Automation completed successfully
```

Para ver los logs:

1. Ve a la pestaña "Actions" en GitHub
2. Selecciona el workflow "Auto Move to In Review"
3. Click en la ejecución específica
4. Expande el step "Move linked issues to In Review"

## 🔍 Casos Especiales

### PR en Draft

Los PRs marcados como "draft" son ignorados automáticamente:

```
PR is draft, skipping...
```

Para activar la automatización:

1. Marca el PR como "Ready for review"
2. El workflow se ejecutará automáticamente

### Issue sin Card en Project

Si una issue no tiene tarjeta en el project, el workflow:

1. Crea una nueva tarjeta automáticamente
2. La coloca en "In Review"
3. Registra en logs: `✅ Created new card for issue #X in In Review`

### Múltiples Projects

Si el repositorio tiene múltiples projects:

- Se usa el primer project abierto
- Para cambiar esto, modifica:

```javascript
const project = projects[0]; // Cambiar índice o filtrar por nombre
```

## ⚠️ Solución de Problemas

### "No 'In Review' column found"

**Causa:** No existe una columna con ese nombre

**Solución:**

1. Crea una columna llamada "In Review" en tu project
2. O modifica el código para buscar otro nombre

### "No projects found in repository"

**Causa:** No hay projects configurados

**Solución:**

1. Ve a la pestaña "Projects" en GitHub
2. Crea un nuevo project
3. Agrega las columnas necesarias

### "Card not found for issue"

**Causa:** La issue no está en el project board

**Solución:**

- El workflow creará automáticamente una nueva tarjeta
- O agrega manualmente la issue al project antes de crear el PR

## 🎨 Mejoras Futuras

Posibles extensiones del workflow:

- [ ] Mover de vuelta a "In Progress" si el PR se marca como draft
- [ ] Mover a "Done" cuando se hace merge del PR
- [ ] Asignar reviewers automáticamente
- [ ] Agregar labels automáticos
- [ ] Integración con Slack/Discord para notificaciones
- [ ] Métricas de tiempo en cada columna

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Script Action](https://github.com/actions/github-script)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Project Boards API](https://docs.github.com/en/rest/projects)

## 🤝 Contribución

Para mejorar esta automatización:

1. Haz cambios en `.github/workflows/move-to-in-review.yml`
2. Prueba con un PR de ejemplo
3. Revisa los logs en Actions
4. Documenta los cambios aquí

---

**✨ Automatización creada para mejorar el flujo de trabajo del equipo**

Issue relacionada: #53
