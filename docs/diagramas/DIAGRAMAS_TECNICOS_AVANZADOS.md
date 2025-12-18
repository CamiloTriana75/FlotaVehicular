# 🔧 Diagramas Técnicos Avanzados - Mermaid

**Versión**: 2.0.0  
**Contenido**: Diagramas técnicos especializados del sistema

---

## 📋 Índice

1. [Flujo de Integración con APIs Externas](#flujo-apis)
2. [Ciclo de Vida de una Alerta](#ciclo-alerta)
3. [Flujo de Sincronización de Datos](#flujo-sync)
4. [Gestión de Errores y Excepciones](#manejo-errores)
5. [Matriz de Matriz de Casos Exito/Fracaso](#matriz-exito)
6. [Ciclo de Vida de Mantenimiento Preventivo](#ciclo-mantenimiento)
7. [Algoritmo de Optimización de Rutas](#algoritmo-rutas)
8. [Escalabilidad y Performance](#escalabilidad)

---

## 1. Flujo de Integración con APIs Externas {#flujo-apis}

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (React)"]
        Component["Componente<br/>solicita datos"]
    end

    subgraph LocalCache["💾 Cache Local"]
        Cache["LocalStorage<br/>+ Memory Cache"]
    end

    subgraph Services["🔧 Services Layer"]
        Service["googleMapsService<br/>mapboxService<br/>n8nService"]
    end

    subgraph SupabaseLayer["🌍 Supabase Layer"]
        SupabaseClient["SupabaseClient<br/>Auth + DB + Realtime"]
    end

    subgraph ExternalAPIs["🌐 APIs Externas"]
        GMaps["🗺️ Google Maps<br/>Directions<br/>Distance Matrix<br/>Geocoding"]
        Mapbox["🗺️ Mapbox<br/>Static Maps<br/>Tileset"]
        n8n["🤖 n8n Cloud<br/>Chatbot Workflow"]
        OpenRouter["🧠 OpenRouter<br/>DeepSeek v3.1"]
    end

    subgraph PostgresDB["🗄️ PostgreSQL"]
        DB["Datos Persistentes<br/>RLS enabled<br/>Triggers activos"]
    end

    Component -->|1. Check cache| Cache
    Cache -->|2. Miss| Service

    Service -->|3. Valida creds| SupabaseClient
    SupabaseClient -->|4. GetJWT| SupabaseClient

    SupabaseClient -->|5a. Llamada| GMaps
    SupabaseClient -->|5b. Llamada| Mapbox
    SupabaseClient -->|5c. Llamada| n8n
    n8n -->|→| OpenRouter

    GMaps -->|6a. Respuesta| Service
    Mapbox -->|6b. Respuesta| Service
    n8n -->|6c. Respuesta| Service

    Service -->|7. Parsea| Service
    Service -->|8. Cachea| Cache
    Service -->|9. Retorna| Component

    par Persistencia
        Service -->|INSERT/UPDATE| SupabaseClient
        SupabaseClient -->|→| DB
        DB -->|Triggers| DB
    end

    style Frontend fill:#e1f5ff
    style Services fill:#f3e5f5
    style ExternalAPIs fill:#fff9c4
    style PostgresDB fill:#fce4ec
```

---

## 2. Ciclo de Vida de una Alerta {#ciclo-alerta}

```mermaid
stateDiagram-v2
    [*] --> ConfigurandoRegla: Admin configura<br/>alerta_rules

    ConfigurandoRegla --> Monitoreando: Vehículo en movimiento<br/>Alert activa

    Monitoreando --> CondicionDetectada: Condición met<br/>ej. velocidad > umbral

    CondicionDetectada --> Debounce: Aplica debounce<br/>(delay configurado)

    Debounce --> CondicionRepetida: Espera N segundos

    CondicionRepetida --> GenerandoAlerta: Condición persiste
    CondicionRepetida --> Monitoreando: Condición dejó<br/>de cumplirse

    GenerandoAlerta --> CreandoRegistro: Crea registro<br/>en tabla alerts

    CreandoRegistro --> NotificandoUsuarios: Envía notificaciones<br/>Push + Email

    NotificandoUsuarios --> Activa: Estado='pendiente'

    Activa --> VistaUsuario: Usuario marca<br/>como 'vista'
    Activa --> IgnoradaUsuario: Usuario 'ignora'

    VistaUsuario --> Monitoreando: Alerta calmada<br/>o resuelto

    IgnoradaUsuario --> MarcadaIgnorada: No monitorear<br/>similar 30min

    MarcadaIgnorada --> Monitoreando: Tiempo expiró

    note right of Monitoreando
        - Real-time tracking
        - Condiciones activas
        - Umbral evaluado
    end note

    note right of NotificandoUsuarios
        Según configuración:
        - Push: Sí/No
        - Email: Sí/No
        - SMS: Sí/No (futuro)
    end note

    style Monitoreando fill:#4CAF50
    style GenerandoAlerta fill:#FF9800
    style NotificandoUsuarios fill:#F44336
    style Activa fill:#2196F3
```

---

## 3. Flujo de Sincronización de Datos {#flujo-sync}

```mermaid
sequenceDiagram
    participant Frontend as 💻 Frontend
    participant LocalDB as 💾 IndexedDB Local
    participant SupabaseRT as 🔌 Supabase Realtime
    participant PostgreSQL as 🗄️ PostgreSQL
    participant RLS as 🔐 RLS Policies

    rect rgb(200, 220, 255)
        note over Frontend, PostgreSQL
            INICIALIZACIÓN - Cuando usuario se autentica
        end
    end

    Frontend->>LocalDB: 1. Clear IndexedDB
    Frontend->>SupabaseRT: 2. Subscribe a tablas<br/>vehicles, routes, alerts

    SupabaseRT->>RLS: 3. Validate JWT
    RLS-->>SupabaseRT: ✅ Permisos OK

    SupabaseRT->>PostgreSQL: 4. SELECT * WHERE user_has_access
    PostgreSQL-->>SupabaseRT: Initial snapshot
    SupabaseRT-->>Frontend: Datos iniciales

    Frontend->>LocalDB: 5. Store snapshot
    Frontend->>Frontend: 6. Renderiza UI

    rect rgb(200, 255, 200)
        note over Frontend, PostgreSQL
            OPERACIÓN - Usuario hace cambio
        end
    end

    Frontend->>Frontend: 7. Optimistic update<br/>en local
    Frontend->>SupabaseRT: 8. POST/PUT/DELETE

    SupabaseRT->>RLS: 9. Valida permiso

    alt Permisos OK
        RLS-->>SupabaseRT: ✅ Autorizado
        SupabaseRT->>PostgreSQL: 10. Ejecuta operación
        PostgreSQL->>PostgreSQL: 11. Trigger ejecuta<br/>lógica negocio
        PostgreSQL-->>SupabaseRT: ✅ Success
        SupabaseRT->>SupabaseRT: 12. Broadcast a<br/>otros clientes
    else Permisos Fallan
        RLS-->>SupabaseRT: ❌ Denegado
        SupabaseRT-->>Frontend: Error
        Frontend->>LocalDB: Revert cambio local
    end

    rect rgb(255, 200, 200)
        note over SupabaseRT, PostgreSQL
            TIEMPO REAL - Cambio en otra sesión
        end
    end

    PostgreSQL->>SupabaseRT: 13. Change broadcast
    SupabaseRT->>Frontend: 14. Websocket update

    Frontend->>LocalDB: 15. Sync cambio
    Frontend->>Frontend: 16. Re-renderiza
    Frontend-->>Frontend: 17. Merge con local<br/>si hay conflictos
```

---

## 4. Gestión de Errores y Excepciones {#manejo-errores}

```mermaid
graph TB
    Error["❌ Error Detectado"]

    Error --> ErrorType{Tipo de Error?}

    ErrorType -->|Auth| AuthError["🔐 Error Autenticación"]
    ErrorType -->|Network| NetError["🌐 Error de Red"]
    ErrorType -->|Validation| ValError["⚠️ Error Validación"]
    ErrorType -->|API| APIError["🔌 Error API Externa"]
    ErrorType -->|Database| DBError["🗄️ Error BD"]

    AuthError --> AuthAction["Acciones:<br/>- Redirect a login<br/>- Clear token<br/>- Show msg"]
    NetError --> NetAction["Acciones:<br/>- Retry automático<br/>- Queue offline<br/>- Show notification"]
    ValError --> ValAction["Acciones:<br/>- Highlight fields<br/>- Show msg específico<br/>- No api call"]
    APIError --> APIAction["Acciones:<br/>- Retry con backoff<br/>- Log a Sentry<br/>- Fallback data"]
    DBError --> DBAction["Acciones:<br/>- Rollback transacción<br/>- Log a auditoría<br/>- Alert admin"]

    AuthAction --> Logging["📝 Log Error"]
    NetAction --> Logging
    ValAction --> Logging
    APIAction --> Logging
    DBAction --> Logging

    Logging --> LogDest{Destino?}
    LogDest -->|Dev| LocalConsole["📊 console.log"]
    LogDest -->|Prod| Sentry["🔴 Sentry/LogRocket"]
    LogDest -->|Always| AuditTable["📋 audit_logs BD"]

    LocalConsole --> User["👤 Muestra Usuario"]
    Sentry --> User
    AuditTable --> User

    User --> Recovery{"¿Recuperable?"}
    Recovery -->|Sí| Retry["🔄 Retry automático<br/>con backoff exponencial"]
    Recovery -->|No| Manual["👨‍💼 Intervención manual<br/>contactar admin"]

    Retry --> Success{"¿Éxito?"}
    Success -->|Sí| Resolved["✅ Resuelto"]
    Success -->|No| Manual

    style Error fill:#FF6B6B
    style AuthError fill:#FF8C42
    style NetError fill:#FFD93D
    style ValError fill:#6BCB77
    style APIError fill:#4D96FF
    style DBError fill:#9B59B6
    style Resolved fill:#4CAF50
```

---

## 5. Ciclo de Vida de Mantenimiento Preventivo {#ciclo-mantenimiento}

```mermaid
stateDiagram-v2
    [*] --> DefiniendoRegla: Admin define<br/>maintenance_rules<br/>ej: cada 5000km<br/>o cada 3 meses

    DefiniendoRegla --> Monitoreando: Regla activa

    Monitoreando --> VerificandoCondicion: Daily job<br/>verifica condiciones

    VerificandoCondicion --> CondicionCumplida: km > umbral<br/>O fecha > umbral
    VerificandoCondicion --> Monitoreando: No cumple

    CondicionCumplida --> GenerandoAlerta: Anticipación<br/>-500km o -7 días

    GenerandoAlerta --> CreandoOrdenMantenimiento: Crea<br/>maintenance_order

    CreandoOrdenMantenimiento --> EnviandoNotificacion: Push a mecánico<br/>+ supervisor

    EnviandoNotificacion --> Programada: Status='programada'

    Programada --> EnProgreso: Mecánico inicia

    EnProgreso --> Registrando: Registra:<br/>- Partes reemplazadas<br/>- Horas trabajo<br/>- Costo total<br/>- Observaciones

    Registrando --> MarcandoCompleta: Marca completa

    MarcandoCompleta --> GenerandoHistorial: Crea registro<br/>en maintenance_history

    GenerandoHistorial --> CalculandoProxima: Calcula<br/>próximo mantenimiento<br/>= fecha_actual + 3 meses<br/>= km_actual + 5000

    CalculandoProxima --> Completada: Alerta cierra

    Completada --> Monitoreando: Continúa monitoreo

    note right of CondicionCumplida
        Anticipación permite:
        - Planificación
        - Minimiza fallos
        - Mantiene SLA
    end note

    style Programada fill:#4CAF50
    style EnProgreso fill:#FF9800
    style Completada fill:#2196F3
```

---

## 6. Algoritmo de Optimización de Rutas {#algoritmo-rutas}

```mermaid
graph TB
    Input["📍 Waypoints<br/>Origen, Destino,<br/>Paradas intermedias"]

    Input --> Validate["✅ Validar<br/>- Todos válidos?<br/>- Mismo país?<br/>- Sin duplicados?"]

    Validate -->|No| Error["❌ Error"]
    Validate -->|Sí| Original["🔵 Ruta Original<br/>Orden input"]

    Original --> Distance1["📏 Distance Matrix<br/>Google Maps<br/>Todas combinaciones"]

    Distance1 --> TSP["🎯 Traveling Salesman<br/>Problem Solver<br/>Genetic Algorithm"]

    TSP --> Fitness["⚖️ Calcula fitness<br/>- Distancia total<br/>- Tiempo total<br/>- Desviaciones"]

    Fitness --> Generation["🔄 Genera N mejores<br/>variaciones"]

    Generation --> Iterate{Max generaciones<br/>o convergencia?}

    Iterate -->|No| TSP
    Iterate -->|Sí| Optimal["🟢 Ruta Optimizada<br/>Orden mejor"]

    Optimal --> Polyline["🗺️ Google Maps<br/>Directions<br/>Polyline"]

    Polyline --> Result["✅ Resultado<br/>- Waypoints ordenados<br/>- Distancia km<br/>- Tiempo min<br/>- Polyline"]

    Result --> Store["💾 Guardar<br/>en BD"]

    Error --> Notify["📧 Notificar usuario"]
    Notify --> Manual["👨‍💼 Entrada manual"]

    style Input fill:#e1f5ff
    style TSP fill:#FF9800
    style Optimal fill:#4CAF50
    style Result fill:#2196F3
```

---

## 7. Escalabilidad y Performance {#escalabilidad}

```mermaid
graph TB
    Users["👥 Usuarios<br/>Activos"]
    Vehicles["🚙 Vehículos<br/>Rastreando"]

    Users -->|100-500| Tier1["⚡ Tier 1<br/>Small Fleet<br/>- Supabase Free<br/>- Caché Local<br/>- 30s refresh"]
    Users -->|500-2000| Tier2["⚡⚡ Tier 2<br/>Medium Fleet<br/>- Supabase Pro<br/>- Redis Cache<br/>- 10s refresh"]
    Users -->|2000-5000| Tier3["⚡⚡⚡ Tier 3<br/>Large Fleet<br/>- Supabase Enterprise<br/>- Redis + CDN<br/>- 5s refresh"]
    Users -->|5000+| Tier4["⚡⚡⚡⚡ Tier 4<br/>Enterprise<br/>- Custom DB<br/>- Multi-region<br/>- Real-time"]

    Tier1 --> Metrics1["🔍 SLA<br/>- 99%<br/>- 200ms avg<br/>- 500 vehicle max"]
    Tier2 --> Metrics2["🔍 SLA<br/>- 99.5%<br/>- 100ms avg<br/>- 2000 vehicle max"]
    Tier3 --> Metrics3["🔍 SLA<br/>- 99.9%<br/>- 50ms avg<br/>- 5000 vehicle max"]
    Tier4 --> Metrics4["🔍 SLA<br/>- 99.99%<br/>- 20ms avg<br/>- Unlimited"]

    Metrics1 --> Optimization["⚙️ Optimizaciones"]
    Metrics2 --> Optimization
    Metrics3 --> Optimization
    Metrics4 --> Optimization

    Optimization --> Cache["💾 Caching Strategy<br/>- LocalStorage: User prefs<br/>- Memory: Queries hot<br/>- Redis: Shared data<br/>- CDN: Static assets"]
    Optimization --> DB["🗄️ BD Optimization<br/>- Índices en vehicle_id<br/>- Particionamiento temporal<br/>- Denormalización estratégica<br/>- Archivado de histórico"]
    Optimization --> Network["🌐 Network<br/>- Compresión gzip<br/>- WebSocket para RT<br/>- Image optimization<br/>- Lazy loading"]
    Optimization --> Workers["👷 Background Jobs<br/>- n8n para workflows<br/>- Cron para cálculos<br/>- Queue para async"]

    Cache --> Monitoring["📊 Monitoring"]
    DB --> Monitoring
    Network --> Monitoring
    Workers --> Monitoring

    Monitoring --> Metrics["📈 Métricas<br/>- CPU/Memory<br/>- DB queries/s<br/>- Latency p95<br/>- Error rate"]

    Metrics --> Alert{"Umbrales<br/>excedidos?"}
    Alert -->|Sí| AutoScale["🚀 Auto-scaling<br/>- Aumenta recursos<br/>- Distribuye carga<br/>- Notifica admin"]
    Alert -->|No| Continue["✅ Continúa"]

    style Tier1 fill:#90EE90
    style Tier2 fill:#FFD700
    style Tier3 fill:#FF8C00
    style Tier4 fill:#FF4500
    style Monitoring fill:#9C27B0
```

---

## 8. Flujo de Notificaciones Multicanal {#notificaciones}

```mermaid
sequenceDiagram
    participant Event as 🔔 Event<br/>Trigger
    participant Queue as 📮 Queue<br/>RabbitMQ/n8n
    participant NotifSvc as 📧 Notification<br/>Service
    participant Push as 📲 Push<br/>Firebase
    participant Email as ✉️ Email<br/>SendGrid
    participant SMS as 📱 SMS<br/>Twilio
    participant User as 👤 Usuario

    Event->>Queue: 1. Enqueue<br/>notificación

    Queue->>NotifSvc: 2. Dequeue evento

    NotifSvc->>NotifSvc: 3. Valida:<br/>- Usuario existe<br/>- Preferencias ON<br/>- No está en DND

    alt Validación OK
        NotifSvc->>Push: 4a. Push notification
        Push->>Push: Envia a Firebase
        Push->>User: 📲 Notif en mobile

        NotifSvc->>Email: 4b. Email notification
        Email->>Email: Renderiza template
        Email->>User: ✉️ Email recibido

        NotifSvc->>SMS: 4c. SMS (si crítica)
        SMS->>User: 📱 SMS recibido

        NotifSvc->>NotifSvc: 5. Log evento<br/>en BD
    else Validación Falla
        NotifSvc->>NotifSvc: Descarta
    end

    User->>User: 6. Recibe notificación
    User->>User: 7. Interactúa o ignora

    par Tracking
        NotifSvc->>NotifSvc: Track delivery
        NotifSvc->>NotifSvc: Track read/click
    end

    note over NotifSvc
        Preferencias usuario:
        - Canal preferido (push/email/sms)
        - Horario silencioso
        - Tipos alertas
    end note
```

---

## 📊 Resumen de Diagramas Técnicos

| Diagrama       | Propósito                 | Usuarios Objetivo          |
| -------------- | ------------------------- | -------------------------- |
| Flujo APIs     | Integraciones externas    | Developers                 |
| Ciclo Alerta   | Sistema alertas           | QA, Supervisores           |
| Sync Datos     | Realtime sincronización   | Developers, DevOps         |
| Manejo Errores | Robustez sistema          | Developers, QA             |
| Mantenimiento  | Gestión preventiva        | Supervisores, Mecánicos    |
| Rutas Óptimas  | Planificación inteligente | Planificadores, Operadores |
| Escalabilidad  | Capacidad sistema         | DevOps, Arquitectos        |
| Notificaciones | Multi-canal               | Developers, Product        |

---

**Última actualización**: Diciembre 18, 2025  
**Validado por**: Equipo Técnico  
**Próxima revisión**: Marzo 2026
