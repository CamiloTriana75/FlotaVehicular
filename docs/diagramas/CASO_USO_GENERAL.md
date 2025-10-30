# Caso de Uso General del Sistema

Este documento resume el alcance funcional del sistema FlotaVehicular y enlaza a los diagramas principales y al backlog.

## 1. Propósito y Alcance

- Gestionar vehículos y conductores
- Planificar y monitorear rutas en tiempo real
- Controlar combustible, mantenimiento e incidentes
- Generar reportes y KPIs
- Administrar usuarios, roles y configuraciones

## 2. Actores

- Administrador: Configuración, usuarios, seguridad, alta/baja de datos
- Supervisor/Manager: Operación diaria (rutas, alertas, reportes)
- Operador: Monitoreo y acciones operativas
- Conductor: Reporte de incidentes, recepción de rutas
- Visualizador: Lectura de datos y KPIs
- Sistemas Externos: GPS, Mapas, ERP

## 3. Diagrama General

Ver `Diagrama_Casos_Uso.md` (módulos: Vehículos, Conductores, Rutas, Mantenimiento, Alertas, Incidentes, Reportes, Integraciones, Configuración, Auth).
Además, para los flujos detallados, consulta `Diagrama_Secuencia_Casos_Uso.md`.

## 4. Flujo Principal (Happy Path)

1. Autenticación del usuario (Admin/Manager/Operador)
2. Consulta de estado general en Dashboard
3. Operaciones diarias:
   - Vehículos/Conductores: alta, actualización, consultas
   - Rutas: creación, asignación, monitoreo y cierre
   - Alertas: revisión, configuración de geocercas y umbrales
   - Mantenimiento: programación y registro
   - Reportes: generación y exportación
4. Cierre de sesión

## 5. Flujos Alternativos

- Incidente reportado por conductor → notificación inmediata a supervisor
- Consumo anómalo o velocidad excedida → generación automática de alerta
- Desvío de geocerca → alerta y replanificación
- Fallo de integración → reintento y log de error

## 6. Reglas y Políticas

- Roles y permisos granulares por módulo
- Integridad referencial en BD (ver `Diagrama_ER.md`)
- RLS en Supabase para acceso a datos por rol
- Convenciones de commits y PRs para cambios

## 7. Criterios de Aceptación Generales

- Actualización de ubicación ≤ 30s
- UI responsive, disponibilidad ≥ 99.9%
- Rendimiento hasta 500 vehículos activos
- Cumplimiento de privacidad y seguridad

## 8. Trazabilidad al Backlog

- Alineado con `docs/BACKLOG_PRODUCTO.md`.
- Épicas 1–10 y HU asociadas cubiertas en el diagrama general.

## 9. Referencias

- Diagrama de Casos de Uso: `Diagrama_Casos_Uso.md`
- Diagramas de Secuencia de Casos de Uso: `Diagrama_Secuencia_Casos_Uso.md`
- Diagrama ER: `Diagrama_ER.md`
- Arquitectura: `../ARQUITECTURA.md`
- Backlog: `../BACKLOG_PRODUCTO.md`

> Mantener este documento actualizado al incorporar nuevas funcionalidades.
