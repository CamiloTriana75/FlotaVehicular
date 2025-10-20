# 🚀 Guía Rápida para el Equipo

> **Guía práctica para comenzar a trabajar en el proyecto sin conocimientos previos de Git/GitHub**

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#-configuración-inicial-solo-una-vez)
2. [Trabajar en una Tarea](#-trabajar-en-una-tarea-día-a-día)
3. [Hacer Commits](#-hacer-commits)
4. [Crear Pull Request](#-crear-pull-request)
5. [Problemas Comunes](#-problemas-comunes)
6. [Glosario](#-glosario)

---

## 🎯 Configuración Inicial (Solo una vez)

### Paso 1: Instalar Herramientas

1. **Instalar Node.js** (v18 o superior)
   - Descarga: https://nodejs.org/
   - Verificar: Abrir terminal y ejecutar `node --version`

2. **Instalar Git**
   - Descarga: https://git-scm.com/
   - Verificar: Abrir terminal y ejecutar `git --version`

3. **Instalar VS Code** (recomendado)
   - Descarga: https://code.visualstudio.com/

### Paso 2: Configurar Git

```bash
# Configurar tu nombre (usa tu nombre real)
git config --global user.name "Tu Nombre"

# Configurar tu email (usa el mismo email de GitHub)
git config --global user.email "tuemail@ejemplo.com"

# Verificar configuración
git config --global --list
```

### Paso 3: Clonar el Proyecto

```bash
# 1. Ir a la carpeta donde quieres el proyecto
cd C:\Users\TuUsuario\Documents

# 2. Clonar el repositorio
git clone https://github.com/CamiloTriana75/FlotaVehicular.git

# 3. Entrar al proyecto
cd FlotaVehicular

# 4. Instalar dependencias
npm install

# 5. Crear archivo de configuración
copy .env.example .env.local

# 6. Probar que funcione
npm run dev
```

Si todo funciona, verás: `Local: http://localhost:5173/`

---

## 💼 Trabajar en una Tarea (Día a día)

### Paso 1: Ver tu Tarea Asignada

1. Ve a: https://github.com/CamiloTriana75/FlotaVehicular/issues
2. Busca el issue asignado a ti (ejemplo: **#25 - Crear formulario de conductores**)
3. Lee la descripción y criterios de aceptación

### Paso 2: Crear una Rama Nueva

**¿Qué es una rama?** Es como una copia temporal del proyecto donde trabajarás sin afectar el código principal.

```bash
# 1. SIEMPRE actualizar primero
git checkout main
git pull origin main

# 2. Crear tu rama nueva
# Formato: feature/numero-nombre-corto
# Ejemplo: feature/25-formulario-conductores
git checkout -b feature/25-formulario-conductores
```

### Paso 3: Trabajar en el Código

1. Abre VS Code: `code .`
2. Haz tus cambios en los archivos
3. Guarda frecuentemente (Ctrl+S)
4. Prueba que funcione: `npm run dev`

---

## 💾 Hacer Commits

**¿Qué es un commit?** Es guardar tus cambios con una descripción de qué hiciste.

### Cuándo Hacer Commits

- ✅ Cada vez que completes algo funcional (ejemplo: "Agregué el botón de guardar")
- ✅ Antes de terminar el día de trabajo
- ✅ Después de cada avance importante

### Cómo Hacer Commits

```bash
# 1. Ver qué archivos cambiaste
git status

# 2. Agregar los archivos que quieres guardar
git add .                    # Agrega TODOS los cambios
# o
git add src/components/DriverForm.jsx    # Agrega un archivo específico

# 3. Hacer el commit con mensaje
git commit -m "feat: crear formulario de conductores"
```

### Formato de Mensajes de Commit

Usa este formato: `tipo: descripción corta`

**Tipos comunes:**

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (espacios, comas, etc)

**Ejemplos:**

```bash
git commit -m "feat: agregar botón de guardar conductor"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar README con nuevas instrucciones"
git commit -m "style: formatear código del componente"
```

### Subir tus Commits a GitHub

```bash
# Subir tu rama al repositorio
git push origin feature/25-formulario-conductores
```

---

## 🔄 Crear Pull Request (PR)

**¿Qué es un Pull Request?** Es pedir que tu código sea revisado y agregado al proyecto principal.

### Paso a Paso

1. **Ir a GitHub**
   - Ve a: https://github.com/CamiloTriana75/FlotaVehicular
   - Verás un banner amarillo: "Compare & pull request" → Click aquí

2. **Llenar la Información del PR**

   **Título:** (automático, basado en tu último commit)

   **Descripción:** Usa esta plantilla:

   ```markdown
   ## ¿Qué hace este PR?

   [Explica qué agregaste o cambiaste]

   ## Issue relacionado

   Closes #25

   ## ¿Cómo probarlo?

   1. Ir a la página de conductores
   2. Click en "Nuevo conductor"
   3. Llenar el formulario
   4. Click en "Guardar"

   ## Capturas de pantalla

   [Pega aquí capturas de tu trabajo]
   ```

3. **Asignar Revisores**
   - En la derecha, click en "Reviewers"
   - Selecciona a quien quieras que revise tu código

4. **Crear el PR**
   - Click en "Create pull request"
   - ¡Listo! Ahora espera la revisión

### Después de Crear el PR

- 📝 Espera comentarios de los revisores
- 🔧 Si te piden cambios, hazlos en la misma rama:
  ```bash
  # Hacer cambios en los archivos
  git add .
  git commit -m "fix: corregir validaciones según review"
  git push origin feature/25-formulario-conductores
  ```
- ✅ Cuando te aprueben, tu código se integrará al proyecto

---

## ⚠️ Problemas Comunes

### Error: "Your branch is behind"

**Significa:** Tu rama está desactualizada

**Solución:**

```bash
git pull origin main
```

### Error: "Conflict in file..."

**Significa:** Alguien más cambió el mismo archivo que tú

**Solución:** (Pide ayuda al líder técnico)

```bash
# 1. Actualizar
git pull origin main

# 2. VS Code te mostrará los conflictos
# 3. Elige qué cambios conservar
# 4. Guarda el archivo
# 5. Hacer commit
git add .
git commit -m "fix: resolver conflictos"
git push
```

### No puedo hacer push

**Posibles causas:**

1. No has hecho commit: `git commit -m "mensaje"`
2. No has configurado tu email: Ver [Configuración Inicial](#paso-2-configurar-git)
3. No tienes permisos: Pide al líder que te agregue como colaborador

### ¿Cómo saber en qué rama estoy?

```bash
git branch
# La rama con * es donde estás
```

### ¿Cómo cambiar de rama?

```bash
git checkout nombre-de-la-rama
```

### ¿Cómo ver mis commits?

```bash
git log --oneline
```

---

## 📚 Glosario

| Término               | Significado                              |
| --------------------- | ---------------------------------------- |
| **Repository (Repo)** | El proyecto completo                     |
| **Branch (Rama)**     | Una copia del código donde trabajas      |
| **Commit**            | Guardar cambios con una descripción      |
| **Push**              | Subir tus commits a GitHub               |
| **Pull**              | Descargar cambios de GitHub              |
| **Pull Request (PR)** | Pedir que tu código sea revisado         |
| **Merge**             | Integrar tu código al proyecto principal |
| **Main**              | La rama principal del proyecto           |
| **Issue**             | Una tarea o bug que resolver             |
| **Fork**              | Copia del proyecto en tu cuenta          |
| **Clone**             | Descargar el proyecto a tu computadora   |

---

## 🎯 Flujo Completo Resumido

```
1. Ver tu issue asignado en GitHub
   ↓
2. Crear rama nueva: git checkout -b feature/XX-nombre
   ↓
3. Escribir código
   ↓
4. Guardar cambios: git add . && git commit -m "feat: descripción"
   ↓
5. Subir a GitHub: git push origin feature/XX-nombre
   ↓
6. Crear Pull Request en GitHub
   ↓
7. Esperar revisión
   ↓
8. ¡Merge! Tu código ya está en el proyecto
```

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisar esta guía de nuevo**
2. **Preguntar en el grupo del equipo**
3. **Ver documentación más detallada:**
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Guía completa de contribución
   - [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) - Estrategia de ramas
   - [PULL_REQUEST_GUIDE.md](PULL_REQUEST_GUIDE.md) - Guía de PRs

---

## 🎓 Recursos para Aprender

- **Git Básico:** https://www.youtube.com/watch?v=HiXLkL42tMU
- **GitHub para Principiantes:** https://www.youtube.com/watch?v=RGOj5yH7evk
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

**¿Listo para tu primera tarea? ¡Adelante! 🚀**
