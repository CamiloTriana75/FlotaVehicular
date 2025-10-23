# Diagrama de Arquitectura del Sistema

Este archivo contiene todos los diagramas técnicos del sistema FleetManager utilizando Mermaid.

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Capa de Presentación"
        UI[Interface de Usuario<br/>React Components]
        Pages[Páginas/Vistas]
    end

    subgraph "Capa de Aplicación"
        Hooks[Custom Hooks<br/>useAuth, useVehicles, useDrivers]
        Store[Estado Global<br/>Context + Reducers]
    end
    .

    subgraph "Capa de Dominio"
        Entities[Entidades<br/>Vehicle, Driver]
        UseCases[Casos de Uso<br/>Lógica de Negocio]
    end

    subgraph "Capa de Infraestructura"
        API[Supabase Client]
        DB[(PostgreSQL<br/>Database)]
    end

    UI --> Hooks
    Pages --> Hooks
    Hooks --> Store
    Store --> UseCases
    UseCases --> Entities
    UseCases --> API
    API --> DB

    style UI fill:#61DAFB
    style Store fill:#764ABC
    style Entities fill:#FF6B6B
    style DB fill:#336791
```

## 2. Flujo de Datos Unidireccional (Flux Pattern)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant V as Vista/Componente
    participant H as Hook
    participant A as Action Creator
    participant D as Dispatch
    participant R as Reducer
    participant S as Store

    U->>V: Interacción (click, input)
    V->>H: Llama función del hook
    H->>A: Crea acción
    A->>D: Despacha acción
    D->>R: Envía acción al reducer
    R->>R: Calcula nuevo estado
    R->>S: Actualiza estado global
    S->>V: Notifica cambio
    V->>V: Re-renderiza
    V->>U: Muestra nuevo estado
```

## 3. Arquitectura de Componentes

```mermaid
graph TB
    App[App.jsx]

    subgraph "Layout"
        TopBar[TopBar]
        Sidebar[Sidebar]
    end

    subgraph "Páginas"
        Dashboard[Dashboard]
        VehiclesList[VehiclesList]
        VehicleDetail[VehicleDetail]
        DriversList[DriversList]
        Maintenance[Maintenance]
        Routes[Routes]
        Alerts[Alerts]
        Reports[Reports]
        Settings[Settings]
    end

    subgraph "Componentes Compartidos"
        Card[Card]
        Table[Table]
        MapViewer[MapViewer]
        VehicleForm[VehicleForm]
    end

    App --> TopBar
    App --> Sidebar
    App --> Dashboard
    App --> VehiclesList
    App --> VehicleDetail
    App --> DriversList
    App --> Maintenance
    App --> Routes
    App --> Alerts
    App --> Reports
    App --> Settings

    Dashboard --> Card
    VehiclesList --> Table
    VehiclesList --> Card
    VehicleDetail --> MapViewer
    VehicleDetail --> VehicleForm
    Routes --> MapViewer

    style App fill:#61DAFB
    style Dashboard fill:#4CAF50
    style Card fill:#FFC107
```

## 4. Modelo de Datos (Entidad-Relación)

```mermaid
erDiagram
    VEHICLES ||--o{ LOCATIONS : tracks
    VEHICLES }o--|| DRIVERS : "assigned to"
    VEHICLES ||--o{ MAINTENANCE : requires
    VEHICLES ||--o{ ROUTES : travels
    DRIVERS ||--o{ ROUTES : drives
    VEHICLES ||--o{ ALERTS : generates
    DRIVERS ||--o{ ALERTS : generates

    VEHICLES {
        string id PK
        string plate UK
        string brand
        string model
        int year
        string type
        string status
        int mileage
        int fuel
        string driver_id FK
        timestamp created_at
        timestamp updated_at
    }

    DRIVERS {
        string id PK
        string name
        string license UK
        string phone
        string email UK
        string status
        int experience
        string assigned_vehicle FK
        timestamp created_at
        timestamp updated_at
    }

    LOCATIONS {
        string id PK
        string vehicle_id FK
        float lat
        float lng
        float speed
        float heading
        timestamp recorded_at
    }

    MAINTENANCE {
        string id PK
        string vehicle_id FK
        string type
        string description
        date scheduled_date
        date completed_date
        string status
        decimal cost
    }

    ROUTES {
        string id PK
        string vehicle_id FK
        string driver_id FK
        string origin
        string destination
        float distance
        int estimated_duration
        string status
        timestamp start_time
        timestamp end_time
    }

    ALERTS {
        string id PK
        string type
        string level
        string message
        string vehicle_id FK
        string driver_id FK
        boolean dismissed
        timestamp created_at
    }
```

## 5. Flujo de Autenticación

```mermaid
stateDiagram-v2
    [*] --> NoAutenticado

    NoAutenticado --> Autenticando : login(email, password)
    Autenticando --> Autenticado : Success
    Autenticando --> NoAutenticado : Error

    Autenticado --> Dashboard : Redirect
    Dashboard --> Autenticado : Navegación

    Autenticado --> CerrandoSesion : logout()
    CerrandoSesion --> NoAutenticado : Success

    NoAutenticado --> LoginPage : Mostrar
    LoginPage --> NoAutenticado : Render
```

## 6. Casos de Uso Principales

```mermaid
graph LR
    subgraph "Actores"
        Admin[Administrador]
        Manager[Manager]
        Operator[Operador]
    end

    subgraph "Casos de Uso - Vehículos"
        UC1[Registrar Vehículo]
        UC2[Actualizar Vehículo]
        UC3[Eliminar Vehículo]
        UC4[Consultar Vehículos]
        UC5[Rastrear Ubicación]
        UC6[Monitorear Combustible]
    end

    subgraph "Casos de Uso - Conductores"
        UC7[Registrar Conductor]
        UC8[Asignar Vehículo]
        UC9[Consultar Conductores]
        UC10[Gestionar Horarios]
    end

    subgraph "Casos de Uso - Mantenimiento"
        UC11[Programar Mantenimiento]
        UC12[Registrar Mantenimiento]
        UC13[Generar Alertas]
    end

    subgraph "Casos de Uso - Reportes"
        UC14[Generar Reporte]
        UC15[Exportar Datos]
        UC16[Visualizar KPIs]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC7

    Manager --> UC4
    Manager --> UC5
    Manager --> UC6
    Manager --> UC9
    Manager --> UC11
    Manager --> UC14
    Manager --> UC16

    Operator --> UC4
    Operator --> UC5
    Operator --> UC8
    Operator --> UC12
    Operator --> UC13
```

## 7. Flujo de Estado de Vehículos

```mermaid
stateDiagram-v2
    [*] --> Registrado

    Registrado --> Estacionado : Inicializar
    Estacionado --> Activo : Asignar conductor
    Activo --> Estacionado : Finalizar viaje

    Activo --> Mantenimiento : Detectar problema
    Estacionado --> Mantenimiento : Mantenimiento programado

    Mantenimiento --> Estacionado : Reparación completada

    Estacionado --> Inactivo : Dar de baja
    Activo --> Inactivo : Dar de baja
    Mantenimiento --> Inactivo : Dar de baja

    Inactivo --> [*]
```

## 8. Arquitectura del Store (Estado Global)

```mermaid
graph TB
    subgraph "Store Global"
        Context[AppContext<br/>React.Context]

        subgraph "Estado"
            Auth[auth state]
            Vehicles[vehicles state]
            Drivers[drivers state]
        end

        subgraph "Reducers"
            AuthR[authReducer]
            VehiclesR[vehicleReducer]
            DriversR[driverReducer]
            RootR[rootReducer]
        end

        subgraph "Actions"
            AuthA[authActions]
            VehiclesA[vehicleActions]
            DriversA[driverActions]
        end
    end

    Context --> RootR
    RootR --> AuthR
    RootR --> VehiclesR
    RootR --> DriversR

    AuthR --> Auth
    VehiclesR --> Vehicles
    DriversR --> Drivers

    AuthA --> AuthR
    VehiclesA --> VehiclesR
    DriversA --> DriversR

    style Context fill:#764ABC
    style Auth fill:#FF6B6B
    style Vehicles fill:#4CAF50
    style Drivers fill:#2196F3
```

## 9. Flujo de una Feature Completa

```mermaid
sequenceDiagram
    participant U as Usuario
    participant P as Page Component
    participant H as useVehicles Hook
    participant A as Action Creator
    participant R as Reducer
    participant S as Store/Context
    participant API as Supabase API
    participant DB as Database

    U->>P: Click "Agregar Vehículo"
    P->>P: Mostrar formulario
    U->>P: Llenar formulario y enviar

    P->>H: addVehicle(vehicleData)
    H->>A: Crea ADD_VEHICLE action
    A->>R: Dispatch action

    alt Validación exitosa
        R->>R: Valida datos
        R->>S: Actualiza estado (optimistic update)
        S->>P: Notifica cambio
        P->>U: Muestra vehículo agregado

        H->>API: POST /vehicles
        API->>DB: INSERT vehicle
        DB->>API: Success
        API->>H: Vehicle created
        H->>S: Confirma cambio
    else Validación fallida
        R->>S: Mantiene estado anterior
        S->>P: Notifica error
        P->>U: Muestra mensaje de error
    end
```

## 10. Estructura de Hooks Personalizados

```mermaid
graph TB
    subgraph "Custom Hooks"
        useAuth[useAuth]
        useVehicles[useVehicles]
        useDrivers[useDrivers]
    end

    subgraph "Funcionalidades useAuth"
        login[login]
        logout[logout]
        user[user state]
        isAuth[isAuthenticated]
    end

    subgraph "Funcionalidades useVehicles"
        addV[addVehicle]
        updateV[updateVehicle]
        deleteV[deleteVehicle]
        filterV[filterVehicles]
        getV[getVehicleById]
        statsV[getVehicleStats]
    end

    subgraph "Funcionalidades useDrivers"
        addD[addDriver]
        updateD[updateDriver]
        deleteD[deleteDriver]
        getD[getDriverById]
        activeD[getActiveDrivers]
        statsD[getDriverStats]
    end

    useAuth --> login
    useAuth --> logout
    useAuth --> user
    useAuth --> isAuth

    useVehicles --> addV
    useVehicles --> updateV
    useVehicles --> deleteV
    useVehicles --> filterV
    useVehicles --> getV
    useVehicles --> statsV

    useDrivers --> addD
    useDrivers --> updateD
    useDrivers --> deleteD
    useDrivers --> getD
    useDrivers --> activeD
    useDrivers --> statsD

    style useAuth fill:#FF6B6B
    style useVehicles fill:#4CAF50
    style useDrivers fill:#2196F3
```
