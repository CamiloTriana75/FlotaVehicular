# Guía rápida: cómo crear una Pull Request vinculada a una issue

Esta guía explica cómo crear o seleccionar la rama adecuada, referenciar la issue en tus commits y abrir una Pull Request (PR) hacia la rama correcta (recomendado: `develop`).

## 1) Elegir o crear la rama

- Nueva funcionalidad: prefijo `feature/`
- Corrección de bug: prefijo `fix/`
- Formato sugerido: `feature/<numero-issue>-descripcion-corta`

Ejemplos:

- `feature/32-dashboard-principal`
- `fix/45-corregir-alertas`

CLI (elige una):

```bash
# Crear y cambiar a la nueva rama
git checkout -b feature/<numero-issue>-descripcion

# O cambiar a una rama existente
git checkout feature/<numero-issue>-descripcion
```

## 2) Hacer commits que referencien la issue

Usa Conventional Commits y referencia la issue con `#<numero>`.

Ejemplos:

```bash
git add .
# Nueva funcionalidad
git commit -m "feat: implementar dashboard principal (#32)"
# Corrección de bug
git commit -m "fix: corregir cálculo de KPIs en dashboard (#32)"
# Documentación/CI/configuración
git commit -m "docs: actualizar guía de PR (#32)"
```

Consejos:

- Usa minúsculas en el asunto (commitlint lo valida).
- Si Husky/commitlint falla, corrige el texto en lugar de omitir los hooks.

## 3) Subir la rama al remoto

```bash
git push --set-upstream origin feature/<numero-issue>-descripcion
```

## 4) Abrir la Pull Request

- Base (target) recomendada: `develop` (Git Flow).
- Comparar (compare): `feature/<numero-issue>-descripcion`.
- Título sugerido: `feat: <resumen corto> (#<numero-issue>)`.
- Descripción: incluye "Closes #<numero>" o "Fixes #<numero>" para cerrar la issue al hacer merge.

Enlace directo (reemplaza datos):

```
https://github.com/<usuario>/<repo>/compare/develop...feature/<numero-issue>-descripcion?expand=1
```

En el formulario de la PR:

- Revisa archivos cambiados y checks.
- Asigna reviewers si aplica.
- Agrega labels según corresponda.

## 5) Actualizar la PR con cambios nuevos (si te piden ajustes)

```bash
git checkout feature/<numero-issue>-descripcion
# ... realiza cambios
git add .
git commit -m "feat: ajuste de UI en KPIs (#32)"
git push
```

Los nuevos commits se sumarán automáticamente a la PR abierta.

## 6) Merge y cierre de issue

- Tras aprobación y checks verdes, merge a `develop`.
- Con `Closes #<numero>` en el título o descripción, la issue se cierra automáticamente.
- Si tu PR referencia la issue (por ejemplo `#32`), el workflow del repo la moverá a "In review" al abrir la PR.

## 7) Hotfix directo a main (solo emergencias)

- Base: `main`.
- Rama: `hotfix/<numero-issue>-descripcion`.
- Tras merge a `main`, haz back-merge a `develop` para mantener sincronía.

---

Checklist de PR:

- [ ] Base es `develop` (o `main` si es hotfix)
- [ ] Referencia la issue (`#<numero>` y/o `Closes #<numero>`)
- [ ] Descripción clara y breve
- [ ] Checks verdes (lint, tests)
- [ ] Reviewers asignados
