# 🔧 Configuración de GitHub

## 📋 Configuración Actual

```
Usuario: galeanokevin-code
Email: galeano.kevin@correounivalle.edu.co
```

## 🔄 Cambiar a tu cuenta

### Opción 1: Configuración Global (para todos los repositorios)

```powershell
# Configurar tu nombre
git config --global user.name "TU_NOMBRE_COMPLETO"

# Configurar tu email
git config --global user.email "tu.email@ejemplo.com"

# Verificar los cambios
git config --global user.name
git config --global user.email
```

### Opción 2: Configuración Local (solo para este repositorio)

```powershell
# Configurar tu nombre (solo para este repo)
git config user.name "TU_NOMBRE_COMPLETO"

# Configurar tu email (solo para este repo)
git config user.email "tu.email@ejemplo.com"

# Verificar los cambios
git config user.name
git config user.email
```

---

## 📝 Ejemplo de Configuración

```powershell
# Ejemplo con datos ficticios - REEMPLAZA CON TUS DATOS
git config --global user.name "Juan Triana"
git config --global user.email "juan.triana@ejemplo.com"
```

---

## ✅ Después de Configurar

Una vez configurada tu cuenta, podrás:

1. **Hacer commits** con tu nombre
2. **Crear Pull Requests** desde tu cuenta
3. **Ver tu actividad** en GitHub

---

## 🔐 Autenticación con GitHub

Si necesitas autenticarte con GitHub desde la terminal, tienes dos opciones:

### Opción A: GitHub CLI (Recomendado)

```powershell
# Instalar GitHub CLI
winget install --id GitHub.cli

# Autenticarse
gh auth login
```

### Opción B: Personal Access Token

1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con permisos de `repo`
3. Úsalo como contraseña cuando Git te lo pida

---

## 🚀 Crear Pull Request

Después de configurar tu cuenta:

```powershell
# 1. Agregar todos los cambios
git add .

# 2. Hacer commit con mensaje descriptivo
git commit -m "feat: implementar arquitectura unidireccional y documentación completa"

# 3. Push a tu branch
git push origin 41-mejorar-arquitectura-y-estructura-del-proyecto

# 4. Crear PR desde GitHub.com o usar GitHub CLI
gh pr create --title "Mejorar arquitectura y estructura del proyecto" --body "Descripción de los cambios"
```

---

## 💡 Tips

### Ver configuración completa

```powershell
git config --list
```

### Cambiar solo para este commit

```powershell
git commit --author="Tu Nombre <tu.email@ejemplo.com>" -m "mensaje"
```

### Ver el último commit

```powershell
git log -1
```

---

**Próximos pasos:**

1. Configura tu nombre y email
2. Haz los commits
3. Crea la Pull Request
