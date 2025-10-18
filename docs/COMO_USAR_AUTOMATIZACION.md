# 🚀 Cómo Usar la Automatización de Issues

## Paso a Paso: Desde VS Code hasta GitHub

### 1️⃣ Trabajar en tu Branch

Cuando trabajas en una issue (ejemplo: #53):

```bash
# Ya estás en la rama correcta
git branch
# ✅ 53-automatizar-flujo-de-issues-in-progress-a-in-review
```

### 2️⃣ Hacer tus Commits

Trabaja normalmente, haz tus cambios y commits:

```bash
git add .
git commit -m "feat: implementar funcionalidad"
git push origin 53-automatizar-flujo-de-issues-in-progress-a-in-review
```

### 3️⃣ Crear Pull Request desde VS Code

#### Opción A: Usando la extensión GitHub Pull Request

1. **Abre el panel de GitHub** (icono de GitHub en la barra lateral)
2. **Click en "Create Pull Request"**
3. **Vincula la issue en el título o descripción:**

   ```markdown
   Título: feat: automatizar flujo de issues (#53)

   O en la descripción:

   ## Descripción

   Este PR implementa la automatización de issues

   ## Issues Relacionadas

   Closes #53
   ```

#### Opción B: Desde GitHub Web

1. Ve a tu repositorio en GitHub
2. Click en "Pull requests" → "New pull request"
3. Selecciona tu branch
4. En el título o descripción incluye: `Closes #53` o `#53`

### 4️⃣ ✨ Magia Automática

**Cuando creas el PR, automáticamente:**

1. 🔍 El workflow detecta que vinculaste la issue #53
2. 📊 Busca el project board "Flota-Vehicular"
3. 🔄 Mueve la issue de "In Progress" a "In Review"
4. 💬 Agrega un comentario en la issue:
   > 🔄 This issue has been automatically moved to **In Review** because PR #XX was opened.
   > [View Pull Request](link)

### 5️⃣ Verificar que Funcionó

1. **Ve a tu GitHub Project Board**
2. **Verifica que la issue #53 esté en "In Review"**
3. **Revisa los comentarios en la issue #53**

---

## 🎯 Ejemplos de Vincular Issues

### En el Título del PR

```
✅ feat: automatizar issues (#53)
✅ fix: corregir bug en login (Closes #42)
✅ docs: actualizar README (Fixes #15)
```

### En la Descripción del PR

```markdown
## Descripción

Implementa la nueva funcionalidad de autenticación

## Issues Relacionadas

- Closes #42
- Fixes #43
- Resolves #44

## Cambios

- Agrega validación de usuario
- Mejora seguridad de contraseñas
```

### Formatos Reconocidos

El workflow detecta estos formatos:

- `#53` - Referencia simple
- `Closes #53` - Cierra la issue
- `Fixes #53` - Arregla la issue
- `Resolves #53` - Resuelve la issue

---

## ✅ Checklist Pre-PR

Antes de crear tu Pull Request:

- [ ] Hice commit de todos mis cambios
- [ ] Hice push a mi branch
- [ ] El título o descripción del PR incluye el número de issue
- [ ] La issue está en la columna "In Progress" del project
- [ ] Existe una columna "In Review" en el project

---

## 🔧 Configuración Necesaria en GitHub

### Verificar Columnas del Project

Tu GitHub Project debe tener estas columnas:

```
📋 Flota-Vehicular (Project)
├── 📝 To Do
├── 🚧 In Progress  ← Issue #53 está aquí
├── 👀 In Review    ← Issue se moverá aquí automáticamente
└── ✅ Done
```

Si no tienes la columna "In Review":

1. Ve a tu project en GitHub
2. Click en "+ Add column"
3. Nombre: "In Review"
4. Guarda

---

## 🎬 Demo Completo

### Ejemplo Real con Issue #53

1. **Estado Inicial:**
   - Issue #53 en columna "In Progress"
   - Branch: `53-automatizar-flujo-de-issues-in-progress-a-in-review`

2. **Crear PR desde VS Code:**
   - Título: `feat: automatizar flujo de issues (#53)`
   - Click en "Create Pull Request"

3. **Resultado Automático:**

   ```
   ✅ Issue #53 movida a "In Review"
   💬 Comentario agregado en issue #53
   🔗 Link al PR en el comentario
   ```

4. **Siguiente Paso:**
   - Tus compañeros revisan el PR
   - Aprueban los cambios
   - Haces merge del PR
   - (Puedes crear otra automatización para mover a "Done" cuando se hace merge)

---

## ❓ FAQ

### ¿Qué pasa si mi PR es Draft?

El workflow **no se ejecuta** si el PR está en draft. Se ejecutará cuando lo marques como "Ready for review".

### ¿Funciona con múltiples issues?

¡Sí! Si tu PR referencia varias issues, todas se mueven:

```markdown
Closes #42, #43, #44
```

Resultado: Issues 42, 43 y 44 todas se mueven a "In Review"

### ¿Puedo personalizar el mensaje del comentario?

Sí, edita el archivo `.github/workflows/move-to-in-review.yml` línea ~135:

```javascript
body: `Tu mensaje personalizado para PR #${pr.number}`;
```

### ¿Funciona con GitHub Projects v2 (Projects Beta)?

⚠️ Actualmente el workflow está configurado para GitHub Projects (Classic). Para Projects v2 se necesita una versión diferente del workflow que usa GraphQL.

---

## 📞 Soporte

Si algo no funciona:

1. **Revisa los logs del workflow:**
   - GitHub → Pestaña "Actions"
   - Click en el workflow "Auto Move to In Review"
   - Revisa los logs detallados

2. **Verifica la configuración:**
   - Existe columna "In Review" en el project
   - La issue está en el project board
   - El PR vincula correctamente la issue

3. **Consulta la documentación completa:**
   - Ver `docs/AUTOMATION_IN_REVIEW.md`

---

**✨ ¡Ahora tu flujo de trabajo está automatizado!**

Cada vez que abras un PR, las issues se moverán automáticamente. 🎉
