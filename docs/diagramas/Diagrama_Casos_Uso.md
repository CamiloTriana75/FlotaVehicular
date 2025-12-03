# Diagrama General de Casos de Uso

> Ver también: `Diagrama_Secuencia_Casos_Uso.md` para los flujos detallados de cada caso de uso.

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
            UC8[Asociar Vehículo a Conductor]
            UC9[Ver Geocercas]
        end
        subgraph ModuloConductores["Módulo de Conductores"]
            UC10[Registrar Conductor]
            UC11[Actualizar Datos Conductor]
            UC12[Eliminar Conductor]
            UC13[Consultar Conductores]
            UC14[Ver Historial Conductor]
            UC15[Gestionar Horarios y Turnos]
            UC16[Ver Incidentes]
        end
        subgraph ModuloMantenimiento["Módulo de Mantenimiento"]
            UC17[Programar Mantenimiento]
            UC18[Registrar Mantenimiento Realizado]
            UC19[Consultar Historial Mantenimiento]
            UC20[Generar Alerta Mantenimiento]
            UC21[Calcular Próximo Mantenimiento]
        end
        subgraph ModuloRutas["Módulo de Rutas"]
            UC22[Crear Ruta]
            UC23[Asignar Ruta a Vehículo/Conductor]
            UC24[Monitorear Ruta en Progreso]
            UC25[Finalizar Ruta]
            UC26[Optimizar Rutas]
            UC27[Comparar Ruta Planificada vs Real]
        end
        subgraph ModuloAlertas["Módulo de Alertas"]
            UC28[Ver Alertas Activas]
            UC29[Generar Alerta Automática]
            UC30[Descartar Alerta]
            UC31[Configurar Notificaciones]
            UC32[Configurar Geocercas]
            UC33[Alertas por Velocidad/Detención/Desvío]
        end
        subgraph ModuloIncidentes["Módulo de Incidentes"]
            UC34[Reportar Incidente/Emergencia]
            UC35[Recibir Notificación de Incidente]
            UC36[Generar Reporte de Incidentes]
        end
        subgraph ModuloReportes["Módulo de Reportes"]
            UC37[Generar Reporte Vehículos]
            UC38[Generar Reporte Conductores]
            UC39[Generar Reporte Mantenimiento]
            UC40[Generar Reporte Combustible]
            UC41[Exportar Reporte PDF]
            UC42[Exportar Reporte Excel]
            UC43[Ver Dashboard KPIs]
            UC44[Reportes Personalizados]
        end
        subgraph ModuloIntegraciones["Módulo de Integraciones"]
            UC45[Integrar con Sistemas de Tráfico/Mapas]
            UC46[Integrar con ERP]
            UC47[Comunicación Central-Conductor]
        end
        subgraph ModuloConfig["Módulo de Configuración y Seguridad"]
            UC48[Gestionar Usuarios y Roles]
            UC49[Configurar Parámetros del Sistema]
            UC50[Configurar Políticas de Privacidad]
            UC51[Almacenar Datos Históricos]
        end
        subgraph ModuloAuth["Módulo de Autenticación"]
            UC52[Iniciar Sesión]
            UC53[Cerrar Sesión]
            UC54[Recuperar Contraseña]
            UC55[Cambiar Contraseña]
        end
    end
    Admin((Administrador))
    Manager((Supervisor))
    Operator((Operador))
    Viewer((Visualizador))
    Driver((Conductor))
    Sistema_Externo[Sistema Externo<br/>GPS/Sensores/ERP]
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC15
    Admin --> UC48
    Admin --> UC49
    Admin --> UC50
    Admin --> UC51
    Admin --> UC52
    Admin --> UC53
    Admin --> UC54
    Admin --> UC55
    Manager --> UC4
    Manager --> UC5
    Manager --> UC6
    Manager --> UC7
    Manager --> UC8
    Manager --> UC9
    Manager --> UC13
    Manager --> UC14
    Manager --> UC15
    Manager --> UC16
    Manager --> UC17
    Manager --> UC18
    Manager --> UC19
    Manager --> UC20
    Manager --> UC22
    Manager --> UC23
    Manager --> UC24
    Manager --> UC25
    Manager --> UC26
    Manager --> UC27
    Manager --> UC28
    Manager --> UC29
    Manager --> UC30
    Manager --> UC31
    Manager --> UC32
    Manager --> UC33
    Manager --> UC34
    Manager --> UC35
    Manager --> UC36
    Manager --> UC37
    Manager --> UC38
    Manager --> UC39
    Manager --> UC40
    Manager --> UC41
    Manager --> UC42
    Manager --> UC43
    Manager --> UC44
    Manager --> UC45
    Manager --> UC46
    Manager --> UC47
    Manager --> UC48
    Manager --> UC49
    Manager --> UC50
    Manager --> UC51
    Manager --> UC52
    Manager --> UC53
    Manager --> UC54
    Manager --> UC55
    Operator --> UC4
    Operator --> UC5
    Operator --> UC13
    Operator --> UC16
    Operator --> UC18
    Operator --> UC24
    Operator --> UC25
    Operator --> UC28
    Operator --> UC34
    Operator --> UC35
    Operator --> UC52
    Operator --> UC53
    Operator --> UC54
    Operator --> UC55
    Driver --> UC34
    Driver --> UC35
    Driver --> UC52
    Driver --> UC53
    Driver --> UC54
    Driver --> UC55
    Viewer --> UC4
    Viewer --> UC5
    Viewer --> UC13
    Viewer --> UC28
    Viewer --> UC43
    Sistema_Externo -.-> UC5
    Sistema_Externo -.-> UC6
    Sistema_Externo -.-> UC29
    Sistema_Externo -.-> UC45
    Sistema_Externo -.-> UC46
    UC29 --> UC33
    UC20 --> UC33
    UC34 --> UC35
    UC36 --> UC35
```

## Casos de Uso Detallados

### Registrar Vehículo

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

### Configurar Geocerca y Alertas

```mermaid
sequenceDiagram
    actor Manager as Supervisor
    participant UI as Dashboard
    participant Geo as Geocercas
    participant API as Supabase API
    participant GPS as Sistema GPS
    Manager->>UI: Accede a "Configurar Geocercas"
    UI->>Geo: Muestra mapa y opciones
    Manager->>Geo: Dibuja zona geográfica
    Geo->>API: POST /geofences
    API->>Geo: Confirma registro
    GPS->>API: Envía ubicación vehículo
    API->>Geo: Detecta entrada/salida de zona
    alt Vehículo entra/sale
        Geo->>UI: Genera alerta geocerca
        UI->>Manager: Muestra notificación
    end
```

### Reportar Incidente/Emergencia

```mermaid
sequenceDiagram
    actor Driver as Conductor
    participant UI as App Móvil/Web
    participant API as Supabase API
    participant Store as Store Global
    participant Supervisor as Supervisor
    Driver->>UI: Presiona "Botón de Pánico"
    UI->>API: POST /incidents
    API->>Store: Guarda incidente
    API->>Supervisor: Envía notificación inmediata
    Supervisor->>UI: Visualiza alerta y ubicación
```

### Integrar con Sistema Externo (ERP/Tráfico)

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant UI as Configuración
    participant API as Supabase API
    participant ERP as Sistema ERP
    Admin->>UI: Accede a "Integraciones"
    UI->>API: Solicita sincronización
    API->>ERP: Envía/recibe datos
    ERP-->>API: Respuesta OK/Error
    API->>UI: Muestra estado de integración
```

### Gestionar Usuarios y Roles

```mermaid
sequenceDiagram
    actor Admin as Administrador
    participant UI as Configuración
    participant API as Supabase API
    participant DB as Base de Datos
    Admin->>UI: Accede a "Gestión de Usuarios"
    UI->>API: GET /users
    API->>DB: Consulta usuarios
    DB-->>API: Retorna lista
    API-->>UI: Muestra usuarios
    Admin->>UI: Crea/edita/elimina usuario o rol
    UI->>API: POST/PUT/DELETE /users
    API->>DB: Actualiza datos
    DB-->>API: Confirma cambios
    API-->>UI: Muestra resultado
```

### Exportar Reporte PDF/Excel

```mermaid
sequenceDiagram
    actor Manager as Supervisor
    participant UI as Reportes
    participant Export as Servicio Exportación
    Manager->>UI: Selecciona tipo de reporte y formato
    UI->>Export: Solicita generación de PDF/Excel
    Export->>Export: Procesa datos y genera archivo
    Export->>Manager: Descarga archivo
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
