# Diagramas de Casos de Uso

## Diagrama General de Casos de Uso

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#61DAFB'}}}%%
graph TB
    subgraph Sistema["Sistema de Gestión de Flota"]
        subgraph ModuloVehiculos["Módulo de Vehículos"]
            UC1[Registrar Vehículo]
            UC2[Actualizar Datos Vehículo]
            UC3[Eliminar Vehículo]
            UC4[Consultar Vehículos]
            UC5[Rastrear Ubicación Tiempo Real]
            UC6[Monitorear Combustible]
            UC7[Ver Historial Vehículo]
        end
        
        subgraph ModuloConductores["Módulo de Conductores"]
            UC8[Registrar Conductor]
            UC9[Actualizar Datos Conductor]
            UC10[Eliminar Conductor]
            UC11[Consultar Conductores]
            UC12[Asignar Vehículo a Conductor]
            UC13[Desasignar Vehículo]
            UC14[Ver Historial Conductor]
        end
        
        subgraph ModuloMantenimiento["Módulo de Mantenimiento"]
            UC15[Programar Mantenimiento]
            UC16[Registrar Mantenimiento Realizado]
            UC17[Consultar Historial Mantenimiento]
            UC18[Generar Alerta Mantenimiento]
            UC19[Calcular Próximo Mantenimiento]
        end
        
        subgraph ModuloRutas["Módulo de Rutas"]
            UC20[Crear Ruta]
            UC21[Asignar Ruta a Vehículo]
            UC22[Monitorear Ruta en Progreso]
            UC23[Finalizar Ruta]
            UC24[Optimizar Rutas]
        end
        
        subgraph ModuloAlertas["Módulo de Alertas"]
            UC25[Ver Alertas Activas]
            UC26[Generar Alerta Automática]
            UC27[Descartar Alerta]
            UC28[Configurar Notificaciones]
        end
        
        subgraph ModuloReportes["Módulo de Reportes"]
            UC29[Generar Reporte Vehículos]
            UC30[Generar Reporte Conductores]
            UC31[Generar Reporte Mantenimiento]
            UC32[Generar Reporte Combustible]
            UC33[Exportar Reporte PDF]
            UC34[Exportar Reporte Excel]
            UC35[Ver Dashboard KPIs]
        end
        
        subgraph ModuloAuth["Módulo de Autenticación"]
            UC36[Iniciar Sesión]
            UC37[Cerrar Sesión]
            UC38[Recuperar Contraseña]
            UC39[Cambiar Contraseña]
        end
    end
    
    Admin((Administrador))
    Manager((Manager))
    Operator((Operador))
    Viewer((Visualizador))
    Sistema_Externo[Sistema Externo<br/>GPS/Sensores]
    
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC15
    Admin --> UC28
    Admin --> UC39
    
    Manager --> UC4
    Manager --> UC5
    Manager --> UC6
    Manager --> UC7
    Manager --> UC11
    Manager --> UC12
    Manager --> UC13
    Manager --> UC14
    Manager --> UC16
    Manager --> UC17
    Manager --> UC20
    Manager --> UC21
    Manager --> UC22
    Manager --> UC23
    Manager --> UC24
    Manager --> UC25
    Manager --> UC27
    Manager --> UC29
    Manager --> UC30
    Manager --> UC31
    Manager --> UC32
    Manager --> UC33
    Manager --> UC34
    Manager --> UC35
    
    Operator --> UC4
    Operator --> UC5
    Operator --> UC11
    Operator --> UC16
    Operator --> UC22
    Operator --> UC23
    Operator --> UC25
    
    Viewer --> UC4
    Viewer --> UC5
    Viewer --> UC11
    Viewer --> UC25
    Viewer --> UC35
    
    Admin --> UC36
    Admin --> UC37
    Manager --> UC36
    Manager --> UC37
    Operator --> UC36
    Operator --> UC37
    Viewer --> UC36
    Viewer --> UC37
    
    Sistema_Externo -.-> UC5
    Sistema_Externo -.-> UC6
    Sistema_Externo -.-> UC26
    
    UC26 --> UC18
    UC19 --> UC18
```

## Caso de Uso Detallado: Registrar Vehículo

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant UI as Interface
    participant Form as Formulario
    participant Hook as useVehicles Hook
    participant Store as Store Global
    participant API as Supabase API
    participant DB as Base de Datos
    
    Admin->>UI: Navega a "Agregar Vehículo"
    UI->>Form: Muestra formulario vacío
    
    Admin->>Form: Completa datos del vehículo
    Note over Form: Placa, Marca, Modelo,<br/>Año, Tipo, etc.
    
    Admin->>Form: Click en "Guardar"
    Form->>Form: Valida campos requeridos
    
    alt Validación Exitosa
        Form->>Hook: addVehicle(vehicleData)
        Hook->>Hook: Genera ID único
        Hook->>Store: Dispatch ADD_VEHICLE
        Store->>Store: Actualiza estado
        Store-->>UI: Notifica actualización
        UI->>Admin: Muestra vehículo agregado
        
        Hook->>API: POST /vehicles
        API->>DB: INSERT INTO vehicles
        DB-->>API: Success
        API-->>Hook: Vehicle created
        Hook->>Store: Confirma persistencia
    else Validación Fallida
        Form->>Admin: Muestra errores de validación
    end
```

## Caso de Uso Detallado: Monitorear Vehículo en Tiempo Real

```mermaid
sequenceDiagram
    actor Manager as Manager
    participant UI as Dashboard
    participant Map as MapViewer
    participant Hook as useVehicles Hook
    participant Store as Store Global
    participant API as Supabase API
    participant GPS as Sistema GPS
    
    Manager->>UI: Accede al Dashboard
    UI->>Hook: getVehicles()
    Hook->>Store: Lee estado de vehículos
    Store-->>UI: Retorna lista de vehículos
    UI->>Manager: Muestra vehículos en mapa
    
    loop Actualización cada 30 segundos
        GPS->>API: Envía coordenadas GPS
        API->>Store: Actualiza ubicaciones
        Store-->>Map: Notifica cambio
        Map->>Map: Actualiza marcadores
        Map-->>Manager: Muestra nueva posición
        
        alt Combustible Bajo
            Store->>Store: Detecta fuel < 20%
            Store->>UI: Genera alerta
            UI->>Manager: Muestra notificación
        end
        
        alt Velocidad Excesiva
            Store->>Store: Detecta speed > límite
            Store->>UI: Genera alerta crítica
            UI->>Manager: Muestra alerta roja
        end
    end
```

## Caso de Uso Detallado: Asignar Conductor a Vehículo

```mermaid
sequenceDiagram
    actor Manager as Manager
    participant UI as Interface
    participant VList as Lista Vehículos
    participant DList as Lista Conductores
    participant Hook1 as useVehicles Hook
    participant Hook2 as useDrivers Hook
    participant Store as Store Global
    
    Manager->>UI: Selecciona vehículo
    UI->>VList: Muestra detalle del vehículo
    VList->>Manager: Muestra "Asignar Conductor"
    
    Manager->>VList: Click "Asignar Conductor"
    VList->>Hook2: getActiveDrivers()
    Hook2->>Store: Lee conductores disponibles
    Store-->>DList: Retorna lista filtrada
    DList->>Manager: Muestra conductores activos
    
    Manager->>DList: Selecciona conductor
    Manager->>UI: Confirma asignación
    
    UI->>Hook1: updateVehicle(vehicleId, {driverId})
    Hook1->>Store: Dispatch UPDATE_VEHICLE
    Store->>Store: Actualiza vehicle.driverId
    
    UI->>Hook2: updateDriver(driverId, {assignedVehicle})
    Hook2->>Store: Dispatch UPDATE_DRIVER
    Store->>Store: Actualiza driver.assignedVehicle
    Store->>Store: Cambia driver.status = "en_viaje"
    
    Store-->>UI: Notifica actualización
    UI->>Manager: Muestra asignación exitosa
```

## Caso de Uso: Generar Reporte de Mantenimiento

```mermaid
sequenceDiagram
    actor Manager as Manager
    participant UI as Reportes Page
    participant Filter as Filtros
    participant Hook as useVehicles Hook
    participant Store as Store Global
    participant Export as Export Service
    
    Manager->>UI: Navega a "Reportes"
    UI->>Manager: Muestra opciones de reporte
    
    Manager->>Filter: Selecciona "Mantenimiento"
    Manager->>Filter: Define rango de fechas
    Manager->>Filter: Selecciona vehículos
    
    Manager->>UI: Click "Generar Reporte"
    UI->>Hook: getVehicles()
    Hook->>Store: Filtra por criterios
    Store-->>UI: Retorna datos filtrados
    
    UI->>UI: Calcula estadísticas
    Note over UI: - Total mantenimientos<br/>- Costo promedio<br/>- Tiempo promedio<br/>- Próximos vencimientos
    
    UI->>Manager: Muestra reporte en pantalla
    
    alt Exportar PDF
        Manager->>Export: Click "Exportar PDF"
        Export->>Export: Genera PDF con datos
        Export->>Manager: Descarga archivo PDF
    else Exportar Excel
        Manager->>Export: Click "Exportar Excel"
        Export->>Export: Genera Excel con datos
        Export->>Manager: Descarga archivo Excel
    end
```

## Matriz de Casos de Uso por Rol

```mermaid
graph LR
    subgraph "Administrador (Admin)"
        A1[CRUD Vehículos]
        A2[CRUD Conductores]
        A3[Gestión Usuarios]
        A4[Configuración Sistema]
        A5[Todos los reportes]
    end
    
    subgraph "Manager"
        M1[Consultar Vehículos]
        M2[Asignar Conductores]
        M3[Programar Mantenimiento]
        M4[Gestionar Rutas]
        M5[Ver Reportes]
        M6[Gestionar Alertas]
    end
    
    subgraph "Operador"
        O1[Consultar Vehículos]
        O2[Registrar Mantenimiento]
        O3[Finalizar Rutas]
        O4[Ver Alertas]
    end
    
    subgraph "Visualizador (Viewer)"
        V1[Ver Dashboard]
        V2[Consultar Vehículos]
        V3[Ver Alertas]
        V4[Vista de Mapa]
    end
    
    style A1 fill:#FF6B6B
    style A2 fill:#FF6B6B
    style A3 fill:#FF6B6B
    style A4 fill:#FF6B6B
    style A5 fill:#FF6B6B
    
    style M1 fill:#4CAF50
    style M2 fill:#4CAF50
    style M3 fill:#4CAF50
    style M4 fill:#4CAF50
    style M5 fill:#4CAF50
    style M6 fill:#4CAF50
    
    style O1 fill:#2196F3
    style O2 fill:#2196F3
    style O3 fill:#2196F3
    style O4 fill:#2196F3
    
    style V1 fill:#FFC107
    style V2 fill:#FFC107
    style V3 fill:#FFC107
    style V4 fill:#FFC107
```
