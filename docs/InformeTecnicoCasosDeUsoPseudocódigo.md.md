# SISTEMA DE FLOTA VEHICULAR

## Desarrollo de software 2  
### Tecnologia en Desarrollo de Software

**Realizado por:**  
Yerlin Dayana Alvarez Posada - Cod. 1756652  
Leonardo Castillo Torres - Cod. 2262332  

**UNIVERSIDAD DEL VALLE**  
**SECCIONAL ZARZAL**

---

# DOCUMENTACION DE CASOS DE USO Y SEUDOCODIGO DEL SISTEMA FLOTA VEHICULAR

## Indice
1. [Descripcion general del sistema](#descripcion-general-del-sistema)
2. [Arquitectura modular](#arquitectura-modular)
3. [Roles del sistema](#roles-del-sistema)
4. [Casos de uso por modulo](#casos-de-uso-por-modulo)
   - [Modulo de Vehiculos](#modulo-de-vehiculos)
   - [Modulo de Conductores](#modulo-de-conductores)
   - [Modulo de Mantenimiento](#modulo-de-mantenimiento)
   - [Modulo de Rutas](#modulo-de-rutas)
   - [Modulo de Alertas](#modulo-de-alertas)
   - [Modulo de Incidentes](#modulo-de-incidentes)
   - [Modulo de Reportes e Integraciones](#modulo-de-reportes-e-integraciones)
   - [Modulo de Configuracion y Seguridad](#modulo-de-configuracion-y-seguridad)
   - [Modulo de Autenticacion](#modulo-de-autenticacion)
5. [Conclusiones generales](#conclusiones-generales)

---

## Descripcion general del sistema

El sistema Flota Vehicular es una aplicacion web desarrollada con el proposito de optimizar la gestion integral de vehiculos institucionales o empresariales, que permite Administrar de forma centralizada los registros de vehiculos, conductores, rutas, mantenimientos, incidentes, alertas y reportes operativos.

El objetivo principal del sistema es ofrecer una herramienta confiable que facilite la planificacion, control y seguimiento de todas las operaciones relacionadas con una flota vehicular, a su vez, busca garantizar la seguridad, trazabilidad y eficiencia en la gestion de recursos.

El sistema se estructura mediante modulos interconectados, que permiten la automatizacion de tareas Administradoristrativas y operativas, con distintos niveles de acceso segun los roles de usuario. Esta orientado a ser escalable, seguro y facilmente integrable con plataformas externas mediante APIs.

---

## Arquitectura modular

El sistema esta compuesto por los siguientes modulos principales:

1. Modulo de Vehiculos
2. Modulo de Conductores
3. Modulo de Mantenimiento
4. Modulo de Rutas
5. Modulo de Alertas
6. Modulo de Incidentes
7. Modulo de Reportes e Integraciones
8. Modulo de Configuracion y Seguridad
9. Modulo de Autenticacion

Cada modulo incluye casos de uso especificos y seudocodigo que representan la logica operativa del sistema.

---

## Roles del sistema

Los actores que interactuan con el sistema son los siguientes:

- **Administrador:** Gestiona la configuracion general, usuarios, permisos y mantenimiento del sistema.
- **Supervisor:** Supervisa el cumplimiento de rutas, mantenimiento y desempeno del personal.
- **Operador:** Registra, consulta y actualiza informacion operativa.
- **Visualizador:** Consulta informacion sin permisos de modificacion.
- **Conductor :** Accede a su informacion, rutas y reportes individuales.
- **Sistema Externo:** Interactua mediante integraciones y API para intercambio de datos.

---

## Casos de uso por modulo

A continuacion se documentan por modulo los casos de uso identificados en el diagrama del proyecto. Cada caso de uso incluye: nombre, actor, descripcion, flujo principal, flujo alterno, precondiciones, postcondiciones y seudocodigo indentado y legible.

---

## Modulo de Vehiculos

### CU-01: Registrar vehiculo
**Actor:** Administrador
**Descripcion:** Permite ingresar un nuevo vehiculo en el sistema con sus datos tecnicos y Administrador.  
**Precondiciones:** Usuario autenticado con permisos.  
**Flujo principal:**  
1. Administrador selecciona "Registrar vehiculo".  
2. Sistema muestra formulario vacio.  
3. Administrador completa datos (placa, marca, modelo, año, tipo, etc).  
4. Administrador confirma.  
5. Sistema valida y guarda registro.  
**Flujo alterno:** Si la placa ya existe se muestra error y se cancela.  
**Postcondiciones:** Vehiculo guardado en la base de datos.

**Seudocodigoopcion1:**
```
# Registrar vehiculo
def registrar_vehiculo():
    mostrar_formulario_registro()
    datos = leer_datos()  # placa, marca, modelo, año, tipo, etc
    if placa_existe(datos['placa']):
        mostrar_mensaje("Error: la placa ya esta registrada")
        return
    guardar_vehiculo(datos)
    mostrar_mensaje("Registro exitoso")
```
**Seudocodigoopcion2:**
```
PROCESO Agregar_Vehiculo
    ACTOR Administrador
    COMPONENTES: Interface, Formulario, useVehiclesHook, StoreGlobal, SupabaseAPI, BaseDeDatos

    // 1. Administrador inicia el proceso
    Administrador → Interface: Navega a "Agregar Vehículo"
    Interface → Formulario: Muestra formulario vacío

    // 2. Ingreso de información
    Administrador → Formulario: Completa datos del vehículo
    // Campos: Placa, Marca, Modelo, Año, Tipo, etc.
    Administrador → Formulario: Click en "Guardar"

    // 3. Validación de campos
    Formulario.validaCampos()
    SI Validación es EXITOSA ENTONCES

        // 4. Se agrega el vehículo
        Formulario → useVehiclesHook: addVehicle(vehicleData)
        useVehiclesHook: Genera ID único
        useVehiclesHook → StoreGlobal: Dispatch ADD_VEHICLE
        StoreGlobal: Actualiza estado global
        StoreGlobal → SupabaseAPI: POST /vehicles

        // 5. Persistencia en base de datos
        SupabaseAPI → BaseDeDatos: INSERT INTO vehicles
        BaseDeDatos → SupabaseAPI: Success
        SupabaseAPI → StoreGlobal: vehicle created
        StoreGlobal → useVehiclesHook: Confirma persistencia
        useVehiclesHook → Formulario: Notifica actualización
        Formulario → Interface: Muestra vehículo agregado

    SINO // Validación fallida
        Formulario → Interface: Muestra errores de validación
    FIN SI

FIN PROCESO
```

### CU-02: Consultar vehiculo
**Actor:** Administrador / Supervisor / Operador / Visualizador 
**Descripcion:** Buscar y visualizar datos de un vehiculo.  
**Precondiciones:** Tener vehiculos registrados.  
**Flujo principal:** Ingresar criterio y mostrar resultados.  
**Flujo alterno:** Si no existe, mostrar "Vehiculo no encontrado".  
**Postcondiciones:** Datos mostrados.

**Seudocodigo:**
```
def consultar_vehiculo():
    criterio = solicitar_criterio("placa o id")
    resultado = buscar_vehiculo(criterio)
    if resultado:
        mostrar_datos(resultado)
    else:
        mostrar_mensaje("Vehiculo no encontrado")
```

### CU-03: Actualizar vehiculo
**Actor:** Administrador
**Descripcion:** Modificar datos de un vehiculo registrado.  
**Precondiciones:** Vehiculo existente.  
**Flujo principal:** Seleccionar vehiculo, editar campos, guardar.  
**Flujo alterno:** Si no existe, mostrar error.  
**Postcondiciones:** Registro actualizado.

**Seudocodigo:**
```
def actualizar_vehiculo():
    placa = solicitar_dato("placa del vehiculo a actualizar")
    vehiculo = buscar_vehiculo(placa)
    if not vehiculo:
        mostrar_mensaje("Vehiculo no encontrado")
        return
    nuevos_datos = solicitar_nuevos_datos()
    actualizar_registro_vehiculo(placa, nuevos_datos)
    mostrar_mensaje("Actualizacion exitosa")
```

### CU-04: Eliminar vehiculo
**Actor:** Administrador
**Descripcion:** Eliminar vehiculo del sistema.  
**Precondiciones:** Vehiculo registrado y sin asignaciones activas.  
**Flujo principal:** Solicitar placa, verificar asignaciones, confirmar, eliminar.  
**Flujo alterno:** Si tiene asignaciones activas, bloquear.  
**Postcondiciones:** Vehiculo eliminado.

**Seudocodigo:**
```
def eliminar_vehiculo():
    placa = solicitar_dato("placa a eliminar")
    if not placa:
        return
    if verificar_asignaciones_activas(placa):
        mostrar_mensaje("No se puede eliminar, vehiculo en uso")
        return
    confirmar = solicitar_confirmacion("Confirmar eliminacion?")
    if confirmar:
        borrar_vehiculo(placa)
        mostrar_mensaje("Vehiculo eliminado correctamente")
    else:
        mostrar_mensaje("Operacion cancelada")
```

---

## Modulo de Conductores

### CU-05: Registrar conductor
**Actor:**  Administrador
**Descripcion:** Crear nuevo registro de conductor con datos personales y de licencia.  
**Precondiciones:** Usuario autenticado.  
**Flujo principal:** Completar formulario y guardar.  
**Flujos alternos:** Si documento existe, cancelar.  
**Postcondiciones:** Conductor registrado.

**Seudocodigo:**
```
def registrar_conductor():
    datos = leer_datos_conductor()  # nombre, documento, licencia, categoria, vencimiento, telefono
    if conductor_existe(datos['documento']):
        mostrar_mensaje("Error: conductor ya registrado")
        return
    guardar_conductor(datos)
    mostrar_mensaje("Registro exitoso")
```

### CU-06: Consultar conductor
**Actor:** Todos los roles  
**Descripcion:** Buscar y mostrar datos del conductor.  
**Precondiciones:** Conductores registrados.  
**Flujo principal:** Ingresar criterio y mostrar.  
**Flujo alterno:** Mostrar "Conductor no encontrado".  
**Postcondiciones:** Datos mostrados.

**Seudocodigo:**
```
def consultar_conductor():
    criterio = solicitar_criterio("documento o nombre")
    resultado = buscar_conductor(criterio)
    if resultado:
        mostrar_datos(resultado)
    else:
        mostrar_mensaje("Conductor no encontrado")
```

### CU-07: Actualizar conductor
**Actor:** Administrador
**Descripcion:** Modificar datos de conductor.  
**Precondiciones:** Registro existente.  
**Flujo principal:** Seleccionar conductor, editar, guardar.  
**Flujo alterno:** Si no existe, notificar.  
**Postcondiciones:** Datos actualizados.

**Seudocodigo:**
```
def actualizar_conductor():
    documento = solicitar_dato("documento del conductor")
    conductor = buscar_conductor(documento)
    if not conductor:
        mostrar_mensaje("Conductor no encontrado")
        return
    nuevos_datos = solicitar_nuevos_datos_conductor()
    actualizar_registro_conductor(documento, nuevos_datos)
    mostrar_mensaje("Conductor actualizado")
```

### CU-08: Eliminar conductor
**Actor:** Administrador
**Descripcion:** Eliminar conductor si no tiene asignaciones activas.  
**Precondiciones:** Conductor sin asignaciones activas.  
**Flujo principal:** Verificar asignaciones, confirmar y eliminar.  
**Flujo alterno:** Bloquear si tiene asignaciones.  
**Postcondiciones:** Registro eliminado.

**Seudocodigo:**
```
def eliminar_conductor():
    documento = solicitar_dato("documento a eliminar")
    if verificar_asignaciones_conductor(documento):
        mostrar_mensaje("No se puede eliminar, conductor en uso")
        return
    confirmar = solicitar_confirmacion("Confirmar eliminacion?")
    if confirmar:
        borrar_conductor(documento)
        mostrar_mensaje("Conductor eliminado correctamente")
    else:
        mostrar_mensaje("Operacion cancelada")
```

---

## Modulo de Mantenimiento

### CU-09: Registrar mantenimiento
**Actor:** Operador / Administrador
**Descripcion:** Crear registro de mantenimiento preventivo o correctivo para un vehiculo.  
**Precondiciones:** Vehiculo existente.  
**Flujo principal:** Completar formulario, validar y guardar.  
**Flujo alterno:** Si vehiculo no existe o tiene mantenimiento activo, cancelar.  
**Postcondiciones:** Mantenimiento registrado.

**Seudocodigo:**
```
def registrar_mantenimiento():
    datos = leer_datos_mantenimiento()  # placa, tipo, fecha, kilometraje, descripcion, costo
    if not vehiculo_existe(datos['placa']):
        mostrar_mensaje("Vehiculo no registrado")
        return
    if mantenimiento_activo(datos['placa']):
        mostrar_mensaje("Mantenimiento pendiente, no se puede registrar nuevo")
        return
    guardar_mantenimiento(datos)
    mostrar_mensaje("Registro exitoso")
```

### CU-10: Consultar historial de mantenimiento
**Actor:** Administrador / Supervisor / Operador / Vizualizador
**Descripcion:** Consultar historial por placa o rango de fechas.  
**Precondiciones:** Registros de mantenimiento existentes.  
**Flujo principal:** Ingresar criterio y mostrar lista.  
**Flujo alterno:** Si no hay registros, notificar.  
**Postcondiciones:** Historial mostrado.

**Seudocodigo:**
```
def consultar_historial_mantenimiento():
    criterio = solicitar_criterio("placa o rango de fechas")
    resultados = buscar_mantenimientos(criterio)
    if resultados:
        mostrar_lista(resultados)
    else:
        mostrar_mensaje("No hay mantenimientos registrados")
```

### CU-11: Actualizar mantenimiento
**Actor:** Operador / Administrador
**Descripcion:** Actualizar estado, fecha final o costo real de un mantenimiento.  
**Precondiciones:** Mantenimiento activo.  
**Flujo principal:** Seleccionar registro, editar y guardar.  
**Flujo alterno:** Si registro no existe o esta cerrado, notificar.  
**Postcondiciones:** Registro actualizado.

**Seudocodigo:**
```
def actualizar_mantenimiento():
    id_mantenimiento = solicitar_dato("ID mantenimiento")
    mantenimiento = buscar_mantenimiento(id_mantenimiento)
    if not mantenimiento or mantenimiento['estado'] == 'Cerrado':
        mostrar_mensaje("Mantenimiento no encontrado o ya cerrado")
        return
    nuevos_datos = solicitar_nuevos_datos_mantenimiento()
    actualizar_registro_mantenimiento(id_mantenimiento, nuevos_datos)
    mostrar_mensaje("Actualizacion exitosa")
```

### CU-12: Generar alerta de mantenimiento pendiente
**Actor:** Sistema / Supervisor / Administrador
**Descripcion:** Generar alertas automaticas segun kilometraje o fecha programada.  
**Precondiciones:** Parametros de mantenimiento configurados.  
**Flujo principal:** Proceso periodico que verifica condiciones y genera alertas.  
**Postcondiciones:** Alertas registradas y notificadas.

**Seudocodigo:**
```
def verificar_mantenimientos_pendientes():
    vehiculos = obtener_todos_vehiculos()
    for v in vehiculos:
        if v['kilometraje_actual'] >= v['kilometraje_programado'] or fecha_actual() >= v['fecha_programada']:
            crear_alerta("Mantenimiento pendiente", v['placa'])
            notificar_roles(['Supervisor', 'Administrador'], "Mantenimiento pendiente para " + v['placa'])
```

---

## Modulo de Rutas

### CU-13: Registrar ruta
**Actor:** Administrador / Supervisor 
**Descripcion:** Crear nueva ruta con origen, destino, puntos intermedios, distancia y tiempo estimado.  
**Precondiciones:** Usuario con permisos.  
**Flujo principal:** Completar formulario y guardar.  
**Flujo alterno:** Si ruta duplicada, notificar.  
**Postcondiciones:** Ruta creada.

**Seudocodigo:**
```
def registrar_ruta():
    datos = leer_datos_ruta()  # origen, destino, puntos_intermedios, distancia, tiempo_estimado
    if ruta_duplicada(datos['origen'], datos['destino']):
        mostrar_mensaje("Ruta previamente registrada")
        return
    guardar_ruta(datos)
    mostrar_mensaje("Ruta registrada exitosamente")
```

### CU-14: Consultar rutas
**Actor:** Todos los roles  
**Descripcion:** Visualizar rutas existentes con filtros.  
**Precondiciones:** Pueden existir rutas registradas.  
**Flujo principal:** Aplicar filtros y mostrar lista.  
**Flujo alterno:** Si no hay rutas, notificar.  
**Postcondiciones:** Rutas mostradas.

**Seudocodigo:**
```
def consultar_rutas():
    filtros = solicitar_filtros()
    resultados = buscar_rutas(filtros)
    if resultados:
        mostrar_lista(resultados)
    else:
        mostrar_mensaje("No hay rutas disponibles")
```

### CU-15: Actualizar ruta
**Actor:** Supervisor / Administrador
**Descripcion:** Modificar datos de una ruta existente.  
**Precondiciones:** Ruta existente.  
**Flujo principal:** Seleccionar ruta, editar, guardar.  
**Flujo alterno:** Si ruta no existe, notificar.  
**Postcondiciones:** Ruta actualizada.

**Seudocodigo:**
```
def actualizar_ruta():
    id_ruta = solicitar_dato("ID de la ruta")
    ruta = buscar_ruta(id_ruta)
    if not ruta:
        mostrar_mensaje("Ruta no encontrada")
        return
    nuevos_datos = solicitar_nuevos_datos_ruta()
    actualizar_registro_ruta(id_ruta, nuevos_datos)
    mostrar_mensaje("Ruta actualizada")
```

### CU-16: Asignar ruta a vehiculo y conductor
**Actor:** Supervisor / Administrador
**Descripcion:** Asignar ruta a vehiculo y conductor disponibles.  
**Precondiciones:** Vehiculo y conductor disponibles.  
**Flujo principal:** Seleccionar ruta, vehiculo y conductor; verificar disponibilidad; guardar asignacion; notificar.  
**Flujo alterno:** Si vehiculo o conductor ocupados, notificar.  
**Postcondiciones:** Asignacion creada.

**Seudocodigo:**
```
def asignar_ruta(id_ruta, id_vehiculo, id_conductor):
    if not ruta_existe(id_ruta):
        mostrar_mensaje("Ruta no encontrada")
        return
    if vehiculo_ocupado(id_vehiculo) or conductor_ocupado(id_conductor):
        mostrar_mensaje("No disponibles para asignar")
        return
    guardar_asignacion(id_ruta, id_vehiculo, id_conductor)
    notificar_conductor(id_conductor, "Se te asigno la ruta " + str(id_ruta))
    mostrar_mensaje("Ruta asignada correctamente")
```

### CU-17: Finalizar ruta
**Actor:** Conductor / Operador  
**Descripcion:** Cerrar una ruta en ejecucion registrando datos finales.  
**Precondiciones:** Ruta en ejecucion.  
**Flujo principal:** Confirmar llegada, registrar kilometraje y observaciones, marcar como completada.  
**Postcondiciones:** Ruta finalizada y datos guardados.

**Seudocodigo:**
```
def finalizar_ruta(id_ruta):
    ruta = buscar_ruta(id_ruta)
    if not ruta or ruta['estado'] != 'En ejecucion':
        mostrar_mensaje("Ruta no encontrada o ya cerrada")
        return
    datos_finales = leer_datos_finales()  # hora_llegada, kilometraje, observaciones
    actualizar_ruta_final(id_ruta, datos_finales)
    mostrar_mensaje("Ruta finalizada correctamente")
```

---

## Modulo de Alertas

### CU-18: Generar alerta automatica
**Actor:** Sistema  
**Descripcion:** Motor de alertas que crea notificaciones segun condiciones predefinidas.  
**Precondiciones:** Reglas de alerta configuradas.  
**Flujo principal:** Proceso periodico evalua condiciones y crea alertas.  
**Postcondiciones:** Alertas registradas y notificadas.

**Seudocodigo:**
```
def generar_alertas():
    reglas = obtener_reglas_alerta()
    for regla in reglas:
        if evaluar_regla(regla):
            alerta = crear_alerta(regla)
            notificar(alerta['roles'], alerta['mensaje'])
```

### CU-19: Registrar alerta manual
**Actor:** Conductor / Operador / Supervisor  
**Descripcion:** Usuario registra alerta manual con descripcion y prioridad.  
**Precondiciones:** Usuario autenticado.  
**Flujo principal:** Completar formulario y guardar alerta.  
**Flujo alterno:** Si faltan campos, notificar.  
**Postcondiciones:** Alerta registrada.

**Seudocodigoopcion1:**
```
def registrar_alerta_manual():
    datos = leer_form_alerta()  # tipo, descripcion, prioridad, vehiculo
    if campos_incompletos(datos):
        mostrar_mensaje("Complete todos los campos obligatorios")
        return
    guardar_alerta(datos)
    notificar_roles(datos['roles_destinatarios'], "Nueva alerta: " + datos['descripcion'])
    mostrar_mensaje("Alerta registrada correctamente")
```

**Seudocodigoopcion2:**
```
dPROCESO Configurar_Geocercas
    ACTOR Supervisor
    COMPONENTES: Dashboard, Geocercas, Supabase_API, Sistema_GPS

    // 1. Supervisor inicia la configuración
    Supervisor → Dashboard: Accede a "Configurar Geocercas"
    Dashboard → Supervisor: Muestra mapa y opciones

    // 2. Supervisor define la zona geográfica
    Supervisor → Dashboard: Dibuja zona geográfica
    Dashboard → Geocercas: Envía datos de la zona

    // 3. Registrar la geocerca en la base de datos
    Geocercas → Supabase_API: POST /geofences (datos de la zona)
    Supabase_API → Geocercas: Confirma registro

    // 4. Sistema GPS comienza a enviar ubicación de vehículos
    Sistema_GPS → Supabase_API: Envía ubicación vehículo
    Supabase_API → Geocercas: Notifica coordenadas recibidas

    // 5. Verificación de entrada/salida en geocercas
    SI Geocercas.detectaEntradaSalidaZona(vehículo) ENTONCES
        Geocercas → Dashboard: Genera alerta geocerca
        Dashboard → Supervisor: Muestra notificación
    FIN SI

FIN PROCESO
```


### CU-20: Consultar alertas
**Actor:** Administrador / Supervisor / Operador / Vizualizador 
**Descripcion:** Visualizar alertas con filtros por tipo, estado o prioridad.  
**Precondiciones:** Pueden existir alertas registradas.  
**Flujo principal:** Aplicar filtros y mostrar lista.  
**Flujo alterno:** Si no hay alertas, notificar.  
**Postcondiciones:** Alertas mostradas.

**Seudocodigo:**
```
def consultar_alertas():
    filtros = solicitar_filtros_alerta()
    resultados = buscar_alertas(filtros)
    if resultados:
        mostrar_lista(resultados)
    else:
        mostrar_mensaje("No hay alertas disponibles")
```

### CU-21: Atender alerta
**Actor:** Supervisor / Operador / Administrador
**Descripcion:** Marcar alerta como atendida y registrar la accion realizada.  
**Precondiciones:** Alerta pendiente.  
**Flujo principal:** Seleccionar alerta, registrar accion, marcar como atendida.  
**Postcondiciones:** Estado actualizado y historial guardado.

**Seudocodigo:**
```
def atender_alerta(id_alerta):
    alerta = buscar_alerta(id_alerta)
    if not alerta or alerta['estado'] != 'Pendiente':
        mostrar_mensaje("La alerta ya fue atendida o no existe")
        return
    accion = solicitar_dato("Describa la accion realizada")
    actualizar_estado_alerta(id_alerta, 'Atendida', accion)
    mostrar_mensaje("Alerta atendida exitosamente")
```

### CU-22: Configurar tipos de alerta
**Actor:** Administrador
**Descripcion:** Definir reglas, prioridades y destinatarios de alertas.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Crear o editar tipos de alerta y guardar.  
**Postcondiciones:** Configuracion aplicada.

**Seudocodigo:**
```
def configurar_tipos_alerta():
    mostrar_lista_tipos()
    accion = solicitar_accion()
    if accion in ['crear', 'modificar']:
        datos = leer_datos_tipo_alerta()
        guardar_tipo_alerta(datos)
        mostrar_mensaje("Configuracion actualizada")
```

---

## Modulo de Incidentes

### CU-23: Registrar incidente
**Actor:** Conductor / Operador  
**Descripcion:** Registrar evento ocurrido en ruta con evidencia.  
**Precondiciones:** Vehiculo y ruta activos.  
**Flujo principal:** Completar formulario, adjuntar evidencia, guardar y generar alerta.  
**Flujo alterno:** Si vehiculo o ruta no activos, cancelar.  
**Postcondiciones:** Incidente registrado y alerta enviada.

**Seudocodigo:**
```
def registrar_incidente():
    datos = leer_form_incidente()  # tipo, descripcion, fecha, hora, ubicacion, vehiculo, evidencia
    if not vehiculo_existe(datos['vehiculo']) or not ruta_activa(datos.get('ruta')):
        mostrar_mensaje("No se puede registrar incidente")
        return
    guardar_incidente(datos)
    crear_alerta("Incidente registrado", datos['vehiculo'])
    mostrar_mensaje("Incidente registrado exitosamente")
```

### CU-24: Consultar incidentes
**Actor:** Administrador / supervisor / Operador / Vizualizador  
**Descripcion:** Buscar incidentes por filtros y mostrar detalle.  
**Precondiciones:** Pueden existir incidentes registrados.  
**Flujo principal:** Ingresar filtros y mostrar resultados.  
**Postcondiciones:** Incidentes mostrados.

**Seudocodigo:**
```
def consultar_incidentes():
    filtros = solicitar_filtros_incidente()
    resultados = buscar_incidentes(filtros)
    if resultados:
        mostrar_lista(resultados)
    else:
        mostrar_mensaje("No hay incidentes registrados")
```

### CU-25: Actualizar informacion del incidente
**Actor:** Operador / Supervisor / Administrador
**Descripcion:** Modificar datos, observaciones o estado del incidente.  
**Precondiciones:** Incidente no cerrado.  
**Flujo principal:** Seleccionar incidente, editar y guardar.  
**Flujo alterno:** Si incidente cerrado, bloquear.  
**Postcondiciones:** Incidente actualizado.

**Seudocodigo:**
```
def actualizar_incidente(id_incidente):
    incidente = buscar_incidente(id_incidente)
    if not incidente or incidente['estado'] == 'Cerrado':
        mostrar_mensaje("Incidente cerrado, no se puede modificar")
        return
    nuevos_datos = solicitar_nuevos_datos_incidente()
    actualizar_registro_incidente(id_incidente, nuevos_datos)
    mostrar_mensaje("Actualizacion realizada con exito")
```

### CU-26: Cerrar incidente
**Actor:** Supervisor / Administrador
**Descripcion:** Marcar incidente como cerrado y registrar medidas tomadas.  
**Precondiciones:** Informacion completa del incidente.  
**Flujo principal:** Ingresar conclusiones y medidas, marcar como cerrado.  
**Flujo alterno:** Si falta informacion, bloquear.  
**Postcondiciones:** Incidente cerrado.

**Seudocodigo:**
```
def cerrar_incidente(id_incidente):
    incidente = buscar_incidente(id_incidente)
    if not incidente:
        mostrar_mensaje("Incidente no encontrado")
        return
    if not informacion_completa(incidente):
        mostrar_mensaje("Complete la informacion antes de cerrar")
        return
    conclusiones = solicitar_dato("Ingrese conclusiones")
    medidas = solicitar_dato("Ingrese medidas tomadas")
    actualizar_estado_incidente(id_incidente, 'Cerrado', conclusiones, medidas)
    mostrar_mensaje("Incidente cerrado correctamente")
```

### CU-27: Generar reporte de incidentes
**Actor:** Administrador / Supervisor  
**Descripcion:** Generar informe consolidado de incidentes por periodo.  
**Precondiciones:** Existencia de registros.  
**Flujo principal:** Solicitar rango, compilar datos y exportar.  
**Postcondiciones:** Reporte generado.

**Seudocodigo:**
```
def generar_reporte_incidentes(rango_fechas):
    incidentes = buscar_incidentes_por_rango(rango_fechas)
    reporte = compilar_estadisticas_incidentes(incidentes)
    exportar_reporte(reporte)
    mostrar_mensaje("Reporte generado")
```

---

## Modulo de Reportes e Integraciones

### CU-28: Generar reporte general de flota
**Actor:** Administrador / Supervisor  
**Descripcion:** Informe consolidado del estado de la flota.  
**Precondiciones:** Datos sincronizados.  
**Flujo principal:** Solicitar criterios, recopilar datos, procesar y mostrar o exportar.
**Postcondiciones:** Reporte disponible.

**Seudocodigo:**
```
def generar_reporte_general(rango_fechas, filtros):
    datos = recopilar_datos_modulos(['vehiculos','rutas','mantenimiento','incidentes','alertas'])
    resumen = procesar_datos(datos, filtros)
    mostrar_reporte(resumen)
    if usuario_solicita_exportar():
        exportar('pdf', resumen)
```

### CU-29: Generar reporte de rendimiento de conductor
**Actor:** Supervisor / Administrador
**Descripcion:** Indicadores de cumplimiento y eficiencia por conductor.  
**Precondiciones:** Registros de rutas e incidentes.  
**Flujo principal:** Seleccionar conductor y periodo, calcular indicadores, mostrar.

**Seudocodigo:**
```
def reporte_rendimiento_conductor(id_conductor, rango_fechas):
    rutas = buscar_rutas_por_conductor(id_conductor, rango_fechas)
    incidentes = buscar_incidentes_por_conductor(id_conductor, rango_fechas)
    indicadores = calcular_indicadores(rutas, incidentes)
    mostrar_reporte(indicadores)
```

### CU-30: Generar reporte de mantenimiento
**Actor:** Operador / Supervisor  
**Descripcion:** Resumen de mantenimientos realizados y pendientes.  
**Precondiciones:** Registros de mantenimiento.  
**Flujo principal:** Solicitar filtros, calcular totales y mostrar.

**Seudocodigo:**
```
def reporte_mantenimiento(filtros):
    registros = buscar_mantenimientos(filtros)
    totales = calcular_totales(registros)
    mostrar_tabla_y_graficos(totales)
    if usuario_solicita_exportar():
        exportar('excel', totales)
```

### CU-31: Integrar con sistema externo (API)
**Actor:** Sistema / Administrador
**Descripcion:** Sincronizar datos mediante API REST.  
**Precondiciones:** Credenciales y parametros configurados.  
**Flujo principal:** Validar conexion, enviar/recibir datos, registrar logs.  
**Flujo alterno:** Si falla conexion, generar alerta.  
**Postcondiciones:** Datos sincronizados o alerta generada.

**Seudocodigo:**
```
def integrar_api(url_api, token):
    if not validar_token(token):
        generar_alerta("Error de autentificacion API")
        return
    try:
        respuesta = realizar_peticion(url_api, token)
        procesar_respuesta(respuesta)
        registrar_log("Integracion exitosa")
    except Exception as e:
        registrar_log("Error de integracion: " + str(e))
        generar_alerta("Error de conexion con sistema externo")
```

### CU-32: Configurar plantillas de reporte
**Actor:** Administrador
**Descripcion:** Crear y modificar plantillas de reporte.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Crear/editar plantilla y guardar.  
**Postcondiciones:** Plantilla disponible para exportacion.

**Seudocodigo:**
```
def configurar_plantilla_reporte():
    mostrar_plantillas()
    accion = solicitar_accion()
    if accion in ['crear','editar']:
        datos = leer_datos_plantilla()
        guardar_plantilla(datos)
        mostrar_mensaje("Plantilla actualizada exitosamente")
```

---

## Modulo de Configuracion y Seguridad

### CU-33: Configurar parametros generales del sistema
**Actor:** Administrador
**Descripcion:** Ajustar idioma, zona horaria, formato de fecha, moneda y politicas de sesion.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Mostrar parametros, editar y guardar.  
**Postcondiciones:** Parametros aplicados globalmente.

**Seudocodigo:**
```
def configurar_parametros():
    parametros = obtener_parametros()
    nuevos = leer_nuevos_parametros()
    validar_parametros(nuevos)
    guardar_parametros(nuevos)
    mostrar_mensaje("Cambios aplicados correctamente")
```

### CU-34: Gestionar usuarios
**Actor:** Administrador
**Descripcion:** Crear, modificar, eliminar usuarios y asignar roles.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Seleccionar accion, completar formulario y guardar.  
**Flujo alterno:** Si usuario duplicado, notificar.
**Postcondiciones:** Usuarios actualizados.

**Seudocodigo:**
```
def gestionar_usuarios():
    accion = solicitar_accion_usuario()  # crear, modificar, eliminar
    if accion == 'crear':
        datos = leer_datos_usuario()
        if usuario_existe(datos['correo']):
            mostrar_mensaje("Usuario duplicado")
            return
        crear_usuario(datos)
        mostrar_mensaje("Usuario creado con exito")
    elif accion == 'modificar':
        id_usuario = solicitar_dato("ID usuario")
        cambios = leer_cambios()
        actualizar_usuario(id_usuario, cambios)
    elif accion == 'eliminar':
        id_usuario = solicitar_dato("ID usuario")
        confirmar = solicitar_confirmacion("Confirmar eliminacion?")
        if confirmar:
            eliminar_usuario(id_usuario)
            mostrar_mensaje("Usuario eliminado")
```

### CU-35: Asignar roles y permisos
**Actor:** Administrador
**Descripcion:** Definir acciones permitidas por rol.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Seleccionar rol y asignar permisos.  
**Postcondiciones:** Permisos actualizados.

**Seudocodigo:**
```
def asignar_roles_permisos():
    rol = seleccionar_rol()
    permisos = seleccionar_permisos()
    guardar_permisos(rol, permisos)
    mostrar_mensaje("Permisos actualizados")
```

### CU-36: Configurar politicas de seguridad
**Actor:** Administrador
**Descripcion:** Establecer politicas de contrasena, MFA, bloqueo por intentos y caducidad de sesiones.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Editar politicas y aplicar.  
**Postcondiciones:** Politicas aplicadas.

**Seudocodigo:**
```
def configurar_politicas_seguridad():
    politicas = leer_politicas()
    validar_politicas(politicas)
    aplicar_politicas(politicas)
    mostrar_mensaje("Politicas de seguridad actualizadas")
```

### CU-37: Respaldo y restauracion del sistema
**Actor:** Administrador
**Descripcion:** Generar copias de seguridad y restaurarlas si es necesario.  
**Precondiciones:** Permisos de Administrador.  
**Flujo principal:** Ejecutar respaldo o restauracion y validar integridad.  
**Postcondiciones:** Sistema respaldado o restaurado.

**Seudocodigo:**
```
def gestionar_respaldo_restauracion(accion):
    if accion == 'respaldo':
        archivo = exportar_base_datos()
        mostrar_mensaje("Respaldo completado: " + archivo)
    elif accion == 'restaurar':
        archivo = solicitar_archivo()
        if validar_archivo(archivo):
            importar_base_datos(archivo)
            mostrar_mensaje("Restauracion exitosa")
        else:
            mostrar_mensaje("Archivo invalido")
```

---

## Modulo de Autenticacion

### CU-38: Iniciar sesion
**Actor:** Todos los roles  
**Descripcion:** Validar credenciales y crear sesion de usuario.  
**Precondiciones:** Usuario registrado.  
**Flujo principal:** Ingresar credenciales y autenticar.  
**Flujo alterno:** Si credenciales invalidas, mostrar error.  
**Postcondiciones:** Sesion activa.

**Seudocodigo:**
```
def iniciar_sesion():
    usuario = leer_input("usuario")
    contrasena = leer_input("contrasena")
    registro = buscar_usuario(usuario)
    if not registro:
        mostrar_mensaje("Usuario no encontrado")
        return
    if validar_contrasena(registro, contrasena):
        token = crear_token_sesion(registro['id'])
        crear_sesion(token)
        redirigir_panel(registro['rol'])
    else:
        mostrar_mensaje("Contrasena incorrecta")
```

### CU-39: Cerrar sesion
**Actor:** Usuario autenticado  
**Descripcion:** Invalidar sesion y tokens.
**Precondiciones:** Sesion activa.  
**Flujo principal:** Solicitar cierre y invalidar sesion.  
**Postcondiciones:** Sesion cerrada.

**Seudocodigo:**
```
def cerrar_sesion():
    token = obtener_token_actual()
    invalidar_token(token)
    registrar_evento_log("Cierre de sesion")
    redirigir_login()
```

### CU-40: Recuperar contrasena
**Actor:** Usuario registrado  
**Descripcion:** Restablecer contrasena mediante enlace seguro enviado al correo.  
**Precondiciones:** Correo registrado.  
**Flujo principal:** Solicitar correo, generar token, enviar enlace, cambiar contrasena.  
**Flujo alterno:** Si correo no registrado, mostrar error.  
**Postcondiciones:** Contrasena actualizada.

**Seudocodigo:**
```
def recuperar_contrasena():
    correo = leer_input("correo")
    if not correo_registrado(correo):
        mostrar_mensaje("Correo no registrado")
        return
    token = generar_token_restablecer(correo)
    enviar_correo_restablecer(correo, token)
    mostrar_mensaje("Revisa tu bandeja de entrada para restablecer la contrasena")
```

### CU-41: Validar sesion activa
**Actor:** Sistema / Usuario autenticado  
**Descripcion:** Verificar que el token de sesion sea valido y no haya expirado.  
**Precondiciones:** Sesion iniciada.  
**Flujo principal:** Comprobar validez del token en cada peticion.  
**Postcondiciones:** Acceso permitido o sesion cerrada.

**Seudocodigo:**
```
def validar_sesion(token):
    if token_valido(token) and not token_expirado(token):
        return True
    else:
        cerrar_sesion()
        return False
```

### CU-42: Autenticacion multifactor (MFA)
**Actor:** Administrador / Usuario autenticado  
**Descripcion:** Reforzar seguridad mediante codigo adicional enviado por correo o app.  
**Precondiciones:** Usuario con MFA habilitado.  
**Flujo principal:** Generar codigo, enviar, validar y crear sesion.  
**Flujo alterno:** Si codigo invalido, denegar.  
**Postcondiciones:** Acceso autorizado.

**Seudocodigo:**
```
def autenticacion_mfa(usuario, contrasena):
    registro = buscar_usuario(usuario)
    if not validar_contrasena(registro, contrasena):
        mostrar_mensaje("Credenciales invalidas")
        return
    codigo = generar_codigo_mfa(registro['id'])
    enviar_codigo(registro['contacto'], codigo)
    codigo_ingresado = leer_input("codigo mfa")
    if codigo_ingresado == codigo:
        crear_sesion_para_usuario(registro)
        mostrar_mensaje("Acceso autorizado")
    else:
        mostrar_mensaje("Codigo incorrecto")
```

---

## Conclusiones generales

El sistema Flota Vehicular representa una solucion integral para la gestion Administrativa y operativa de flotas. La documentacion de casos de uso y seudocodigo suministrada permite comprender las interacciones entre usuarios y modulos, asi como la logica principal de cada proceso. El documento es util tanto para fines academicos como para servir de base en la implementacion y pruebas del sistema.

FIN DEL DOCUMENTO
