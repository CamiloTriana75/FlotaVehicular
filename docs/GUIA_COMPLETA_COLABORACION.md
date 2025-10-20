# 🚀 Guía Completa para Trabajar en el Proyecto

> Todo lo que necesitas saber para colaborar en FlotaVehicular

---

## 📋 Contenido

1. [Introducción](#-introducción)
2. [Configuración Inicial](#-configuración-inicial)
3. [Cómo Trabajar en una Tarea](#-cómo-trabajar-en-una-tarea)
4. [Commits y Git](#-commits-y-git)
5. [Pull Requests](#-pull-requests)
6. [Convenciones del Proyecto](#-convenciones-del-proyecto)
7. [Estructura del Código](#-estructura-del-código)
8. [Preguntas Frecuentes](#-preguntas-frecuentes)

---

## 🎯 Introducción

### ¿Qué es este proyecto?

**FlotaVehicular** es un sistema de gestión de flota vehicular que permite:

- 📊 Monitorear vehículos en tiempo real
- 👥 Gestionar conductores y asignaciones
- 🛠️ Control de mantenimiento
- 📍 Planificación de rutas
- ⛽ Registro de combustible

### ¿Qué voy a aprender?

- ✅ Usar Git y GitHub para colaborar
- ✅ Trabajar en equipo con código
- ✅ Crear ramas, commits y Pull Requests
- ✅ Escribir código React con TypeScript
- ✅ Seguir buenas prácticas de programación

### ¿Necesito saber Git?

**¡No!** Esta guía está diseñada para quien nunca ha usado Git. Te explicamos todo paso a paso.

---

## 🛠️ Configuración Inicial

### Paso 1: Instalar Herramientas

#### 1.1 Node.js (Motor de JavaScript)

```bash
# Descargar e instalar Node.js v18 o superior
# https://nodejs.org/

# Verificar instalación
node --version   # Debe mostrar: v18.x.x o superior
npm --version    # Debe mostrar: 9.x.x o superior
```

#### 1.2 Git (Control de versiones)

```bash
# Descargar e instalar Git
# https://git-scm.com/

# Verificar instalación
git --version    # Debe mostrar: git version 2.x.x
```

#### 1.3 Visual Studio Code (Editor recomendado)

```bash
# Descargar e instalar VS Code
# https://code.visualstudio.com/

# Extensiones recomendadas (opcional pero útil):
- ESLint
- Prettier
- GitLens
- ES7+ React/Redux/React-Native snippets
```

### Paso 2: Configurar Git

**Configura tu identidad** (esto aparecerá en tus commits):

```bash
# Tu nombre real
git config --global user.name "Tu Nombre Completo"

# Tu email (el mismo de GitHub)
git config --global user.email "tuemail@ejemplo.com"

# Verificar
git config --global --list
```

### Paso 3: Obtener el Proyecto

#### 3.1 Clonar el Repositorio

```bash
# 1. Abrir terminal/PowerShell en la carpeta donde quieres el proyecto
# Ejemplo: C:\Users\TuUsuario\Proyectos

# 2. Clonar el repo
git clone https://github.com/CamiloTriana75/FlotaVehicular.git

# 3. Entrar a la carpeta
cd FlotaVehicular
```

#### 3.2 Instalar Dependencias

```bash
# Instalar todos los paquetes necesarios (tarda unos minutos)
npm install
```

#### 3.3 Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
copy .env.example .env.local

# (Opcional) Editar .env.local si tienes credenciales de Supabase
# Si no, el proyecto funcionará en modo demo
```

#### 3.4 Probar que Funciona

```bash
# Iniciar el proyecto
npm run dev

# Debes ver algo como:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose

# Abre tu navegador en http://localhost:5173
```

**¡Listo!** Si ves la aplicación, todo está bien configurado. 🎉

---

## 💼 Cómo Trabajar en una Tarea

### Flujo Completo (Resumen Visual)

```
📋 Ver tu tarea en GitHub
    ↓
🌿 Crear una rama nueva
    ↓
💻 Escribir código
    ↓
💾 Hacer commits
    ↓
📤 Subir a GitHub
    ↓
🔄 Crear Pull Request
    ↓
👀 Esperar revisión
    ↓
✅ Merge (¡tu código ya está en el proyecto!)
```

### Paso 1: Ver Tu Tarea Asignada

1. Ve a https://github.com/CamiloTriana75/FlotaVehicular/issues
2. Busca el issue con tu nombre (ejemplo: **#25 - Crear formulario de conductores**)
3. Lee bien la descripción y criterios de aceptación

**Ejemplo de Issue:**

```
Título: #25 - Crear formulario de conductores
Asignado a: Tu Nombre
Labels: feature, frontend

Descripción:
Crear un formulario para agregar nuevos conductores con:
- Campo: Nombre (obligatorio)
- Campo: Cédula (obligatorio)
- Campo: Licencia (obligatorio)
- Campo: Fecha vencimiento licencia
- Botón: Guardar

Criterios de Aceptación:
✓ El formulario valida que los campos obligatorios estén llenos
✓ No permite guardar sin cédula o licencia
✓ Muestra mensaje de éxito al guardar
```

### Paso 2: Actualizar Tu Código

**SIEMPRE antes de empezar:**

```bash
# Ir a la rama principal
git checkout main

# Descargar lo último
git pull origin main
```

### Paso 3: Crear Tu Rama

**Formato del nombre:** `feature/numero-descripcion-corta`

```bash
# Ejemplo para el issue #25
git checkout -b feature/25-formulario-conductores

# Otros ejemplos:
# git checkout -b feature/30-dashboard-metricas
# git checkout -b bugfix/42-validacion-email
# git checkout -b feature/15-mapa-vehiculos
```

**Reglas para nombres de ramas:**

- ✅ Todo en minúsculas
- ✅ Palabras separadas con guión `-`
- ✅ Incluir número del issue
- ✅ Descripción corta pero clara

❌ **Evitar:**

- `mi-rama` (sin número)
- `Feature/MiFeature` (mayúsculas)
- `feature_con_guion_bajo` (usar guión medio)

### Paso 4: Escribir Código

1. **Abrir VS Code:**

   ```bash
   code .
   ```

2. **Crear/editar archivos** según lo que necesites

3. **Probar constantemente:**

   ```bash
   npm run dev
   # Ir a http://localhost:5173 y probar
   ```

4. **Verificar que no hay errores:**
   ```bash
   npm run lint
   ```

---

## 💾 Commits y Git

### ¿Qué es un Commit?

Un commit es **guardar un punto en la historia** de tu código con una descripción de qué cambiaste.

**Analogía:** Es como guardar un videojuego. Puedes volver a ese punto después si algo sale mal.

### Cuándo Hacer un Commit

- ✅ Completaste una funcionalidad pequeña (ejemplo: "Agregué el botón de guardar")
- ✅ Vas a terminar de trabajar por hoy
- ✅ Antes de hacer algo arriesgado
- ✅ Cada 30-60 minutos de trabajo

❌ **NO hagas commit si:**

- El código no compila o tiene errores
- Dejaste `console.log()` de prueba
- Es código a medias que no funciona

### Cómo Hacer un Commit

#### 1. Ver qué cambió

```bash
git status
```

**Verás algo como:**

```
Changes not staged for commit:
  modified:   src/components/DriverForm.jsx
  modified:   src/pages/DriversList.jsx

Untracked files:
  src/components/DriverModal.jsx
```

#### 2. Agregar archivos al commit

```bash
# Agregar TODO lo que cambió
git add .

# O agregar archivos específicos
git add src/components/DriverForm.jsx
git add src/pages/DriversList.jsx
```

#### 3. Hacer el commit con mensaje

```bash
git commit -m "feat: crear formulario de conductores"
```

### Formato de Mensajes de Commit

**Estructura:** `tipo: descripción corta`

#### Tipos principales:

| Tipo        | Cuándo usar                        | Ejemplo                                       |
| ----------- | ---------------------------------- | --------------------------------------------- |
| `feat:`     | Nueva funcionalidad                | `feat: agregar botón de eliminar`             |
| `fix:`      | Corrección de bug                  | `fix: corregir validación de email`           |
| `style:`    | Cambios de formato                 | `style: formatear código con prettier`        |
| `docs:`     | Documentación                      | `docs: actualizar README`                     |
| `refactor:` | Mejorar código sin cambiar función | `refactor: simplificar función de validación` |

#### ✅ Buenos mensajes:

```bash
git commit -m "feat: agregar formulario de conductores"
git commit -m "fix: corregir validación de cédula"
git commit -m "style: aplicar formato a componente vehiculos"
git commit -m "feat: implementar búsqueda de vehículos"
```

#### ❌ Malos mensajes:

```bash
git commit -m "cambios"
git commit -m "fix"
git commit -m "asdfgh"
git commit -m "ya funciona"
```

### Subir tus Commits a GitHub

```bash
# Primera vez (crear la rama en GitHub)
git push -u origin feature/25-formulario-conductores

# Siguientes veces (ya existe la rama)
git push
```

---

## 🔄 Pull Requests

### ¿Qué es un Pull Request (PR)?

Un PR es **pedir que tu código sea revisado** antes de agregarlo al proyecto. Es como decir: "Terminé mi tarea, ¿pueden revisarla?"

### Paso 1: Crear el Pull Request

1. **Ve a GitHub:** https://github.com/CamiloTriana75/FlotaVehicular

2. **Verás un banner amarillo:**

   ```
   feature/25-formulario-conductores had recent pushes
   [Compare & pull request]
   ```

   👉 Click en "Compare & pull request"

3. **Llenar información:**

   **Título:** (se llena automático, déjalo así)

   ```
   feat: crear formulario de conductores
   ```

   **Descripción:** Usa esta plantilla:

   ```markdown
   ## 📝 Descripción

   Implementé el formulario para agregar conductores con validaciones.

   ## 🔗 Issue relacionado

   Closes #25

   ## ✅ ¿Qué se hizo?

   - [x] Campo de nombre con validación
   - [x] Campo de cédula (solo números)
   - [x] Campo de licencia
   - [x] Fecha de vencimiento
   - [x] Botón guardar con validaciones
   - [x] Mensaje de éxito

   ## 🧪 ¿Cómo probar?

   1. Ir a la página de Conductores
   2. Click en "Nuevo Conductor"
   3. Llenar el formulario
   4. Click en "Guardar"
   5. Verificar que aparece en la lista

   ## 📸 Capturas de pantalla

   [Pega aquí captura del formulario]
   ```

4. **Asignar revisores:**
   - En la barra derecha, click "Reviewers"
   - Selecciona a quien quieras que revise (líder técnico o compañero)

5. **Click en "Create Pull Request"**

### Paso 2: Durante la Revisión

**Si te piden cambios:**

1. Haz los cambios en tu código (en la misma rama)
2. Haz commit:
   ```bash
   git add .
   git commit -m "fix: corregir validaciones según review"
   git push
   ```
3. El PR se actualiza automáticamente ✨

**Si te aprueban:**

- 🎉 ¡Felicitaciones!
- El líder hará el merge
- Tu código ya es parte del proyecto

---

## 📐 Convenciones del Proyecto

### Nombres de Archivos

```
✅ Correcto:
- DriverForm.jsx          (Componentes en PascalCase)
- useDrivers.js           (Hooks en camelCase con 'use')
- driverActions.js        (Archivos normales en camelCase)
- Drivers.jsx             (Páginas en PascalCase)

❌ Incorrecto:
- driverform.jsx
- driver_form.jsx
- DRIVERFORM.jsx
```

### Nombres de Variables y Funciones

```javascript
// ✅ Correcto
const vehicleCount = 10;
const driverName = 'Juan Pérez';
const isActive = true;

function calculateTotal(vehicles) {
  // ...
}

// ❌ Incorrecto
const VehicleCount = 10; // No usar mayúscula al inicio
const driver_name = 'Juan'; // No usar guión bajo
const active = true; // Usar 'isActive' para booleanos
```

### Nombres de Componentes

```jsx
// ✅ Correcto
export const VehicleCard = ({ vehicle }) => {
  return <div>{vehicle.plate}</div>;
};

// ❌ Incorrecto
export const vehicleCard = ({ vehicle }) => {
  // Debe empezar con mayúscula
  return <div>{vehicle.plate}</div>;
};
```

### Estructura de Componentes

```jsx
// ✅ Estructura correcta
import React from 'react';
import { useState } from 'react';

export const DriverForm = ({ onSave }) => {
  // 1. Estados
  const [name, setName] = useState('');
  const [cedula, setCedula] = useState('');

  // 2. Funciones
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, cedula });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // 3. Render
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Nombre"
      />
      <button type="submit">Guardar</button>
    </form>
  );
};
```

### Importaciones

```javascript
// ✅ Orden correcto
// 1. Dependencias externas
import React from 'react';
import { useState, useEffect } from 'react';

// 2. Componentes internos
import { VehicleCard } from '../components/VehicleCard';

// 3. Hooks personalizados
import { useVehicles } from '../hooks/useVehicles';

// 4. Utilidades
import { formatDate } from '../shared/utils';

// 5. Estilos
import './styles.css';
```

---

## 🏗️ Estructura del Código

### Organización de Carpetas

```
src/
├── components/          📦 Componentes reutilizables
│   ├── Card.jsx
│   ├── Table.jsx
│   └── MapViewer.jsx
│
├── pages/              📄 Páginas completas
│   ├── Dashboard.jsx
│   ├── VehiclesList.jsx
│   └── DriversList.jsx
│
├── hooks/              🪝 Custom hooks
│   ├── useVehicles.js
│   └── useDrivers.js
│
├── store/              🗄️ Estado global
│   ├── actions/
│   ├── reducers/
│   └── context/
│
├── core/               🎯 Lógica de negocio
│   ├── entities/
│   └── use-cases/
│
└── shared/             🔧 Utilidades
    ├── constants/
    └── utils/
```

### ¿Dónde pongo mi código?

| Quiero crear...       | Lo pongo en...          | Ejemplo             |
| --------------------- | ----------------------- | ------------------- |
| Un botón reutilizable | `src/components/`       | `Button.jsx`        |
| Una página completa   | `src/pages/`            | `VehicleDetail.jsx` |
| Un hook personalizado | `src/hooks/`            | `useVehicles.js`    |
| Una función helper    | `src/shared/utils/`     | `formatDate.js`     |
| Una constante         | `src/shared/constants/` | `index.js`          |

### Ejemplo: Crear un Componente Nuevo

```jsx
// src/components/DriverCard.jsx

import React from 'react';

/**
 * Tarjeta para mostrar información de un conductor
 * @param {Object} props
 * @param {Object} props.driver - Datos del conductor
 * @param {Function} props.onSelect - Callback al seleccionar
 */
export const DriverCard = ({ driver, onSelect }) => {
  const { name, cedula, licencia, status } = driver;

  const handleClick = () => {
    onSelect(driver.id);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-gray-600">Cédula: {cedula}</p>
      <p className="text-gray-600">Licencia: {licencia}</p>
      <span
        className={`badge ${status === 'active' ? 'badge-success' : 'badge-danger'}`}
      >
        {status}
      </span>
    </div>
  );
};
```

### Ejemplo: Usar un Hook

```jsx
// En tu página o componente

import { useVehicles } from '../hooks/useVehicles';

export const VehiclesList = () => {
  // El hook te da todo lo necesario
  const { vehicles, loading, error, addVehicle, updateVehicle } = useVehicles();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};
```

---

## ❓ Preguntas Frecuentes

### Git y GitHub

**P: ¿En qué rama debo trabajar?**  
R: Siempre crea una rama nueva desde `main`. Nunca trabajes directamente en `main`.

**P: ¿Cómo sé en qué rama estoy?**  
R: Ejecuta `git branch`. La rama con asterisco (\*) es donde estás.

**P: Me equivoqué de rama, ¿cómo cambio?**  
R: `git checkout nombre-de-la-rama`

**P: ¿Cómo veo mis últimos commits?**  
R: `git log --oneline`

**P: Hice un commit mal, ¿puedo deshacerlo?**  
R: Si no hiciste push:

```bash
git reset --soft HEAD~1  # Deshace el último commit pero mantiene cambios
```

**P: ¿Qué significa "Your branch is behind origin/main"?**  
R: Tu código local está desactualizado. Actualiza con:

```bash
git pull origin main
```

**P: ¿Qué es un "merge conflict"?**  
R: Ocurre cuando dos personas cambiaron el mismo archivo. VS Code te ayuda a resolverlo mostrando ambas versiones. Pide ayuda al líder técnico si es tu primera vez.

### Código

**P: ¿Dónde encuentro ejemplos de código?**  
R: Mira archivos similares en `src/components/` o `src/pages/`.

**P: ¿Cómo pruebo mi código?**  
R: `npm run dev` y abre `http://localhost:5173`

**P: ¿Qué hago si hay errores en la terminal?**  
R:

1. Lee el error (usualmente dice qué está mal)
2. Busca el archivo y línea que menciona
3. Verifica sintaxis (comas, llaves, paréntesis)
4. Si no entiendes, pega el error en el chat del equipo

**P: ¿Tengo que escribir tests?**  
R: Si estás empezando, no te preocupes por eso. Enfócate en que funcione bien.

### Pull Requests

**P: ¿Cuánto tarda una revisión?**  
R: Usualmente 1-2 días. Si es urgente, menciona al revisor.

**P: ¿Puedo crear un PR sin terminar?**  
R: Sí, pero márcalo como "Draft" o pon [WIP] en el título (Work In Progress).

**P: Me pidieron cambios, ¿qué hago?**  
R: Haz los cambios en la misma rama, commitea y pushea. El PR se actualiza solo.

**P: ¿Puedo cerrar mi PR si me equivoqué?**  
R: Sí, hay un botón "Close pull request". Pero mejor pregunta primero.

### Problemas Comunes

**P: No puedo hacer push**  
R: Posibles causas:

- No hiciste commit: `git commit -m "mensaje"`
- Rama no existe en GitHub: `git push -u origin nombre-rama`
- No tienes permisos: Pide al líder que te agregue como colaborador

**P: Mi código funciona local pero falla en GitHub**  
R: Puede ser un problema de dependencias. Ejecuta:

```bash
rm -rf node_modules
npm install
```

**P: Borré algo por error**  
R: Si no hiciste commit:

```bash
git checkout -- nombre-archivo  # Restaura el archivo
```

Si ya hiciste commit, Git tiene el historial. Pide ayuda.

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Cómo está organizado el código
- **[CODE_STYLE.md](CODE_STYLE.md)** - Guía de estilo detallada
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Setup avanzado y debugging
- **[Diagramas](diagrams/)** - Diagramas del sistema

### Aprender Más

- **Git:**
  - [Git en 15 minutos](https://www.youtube.com/watch?v=HiXLkL42tMU)
  - [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- **React:**
  - [React Docs](https://react.dev/)
  - [React en Español](https://es.react.dev/)

- **JavaScript:**
  - [JavaScript.info](https://javascript.info/)
  - [MDN Web Docs](https://developer.mozilla.org/)

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa esta guía** otra vez
2. **Busca en Google** el error específico
3. **Pregunta en el chat del equipo**
4. **Pide una videollamada** si estás muy atascado

**¡No tengas miedo de preguntar!** Todos empezamos sin saber. 🚀

---

## ✅ Checklist de Tu Primera Tarea

Usa esto para tu primera contribución:

- [ ] Instalé Node.js, Git y VS Code
- [ ] Configuré mi nombre y email en Git
- [ ] Cloné el repositorio
- [ ] Ejecuté `npm install`
- [ ] Probé que funciona con `npm run dev`
- [ ] Vi mi issue asignado en GitHub
- [ ] Actualicé main con `git pull origin main`
- [ ] Creé mi rama con `git checkout -b feature/XX-nombre`
- [ ] Escribí el código
- [ ] Probé que funciona localmente
- [ ] Hice commits con mensajes claros
- [ ] Ejecuté `npm run lint` sin errores
- [ ] Hice push a mi rama
- [ ] Creé el Pull Request en GitHub
- [ ] Asigné revisor
- [ ] Esperé feedback

---

**¡Éxito en tu primera tarea! 🎉**

Si algo no está claro en esta guía, crea un issue para mejorarla.
