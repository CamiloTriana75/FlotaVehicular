import { supabase, isInMockMode } from '../lib/supabaseClient';

/**
 * Servicio para gestión de ubicaciones de vehículos en tiempo real
 * Soporta tracking GPS, actualización en vivo y consultas geoespaciales
 */
export const locationService = {
  /**
   * Obtiene las ubicaciones más recientes de todos los vehículos
   * @returns {Promise<{data: Array, error: null|Error}>}
   */
  async getLatestLocations() {
    if (isInMockMode()) {
      // Datos mock para desarrollo sin backend
      const mockLocations = [
        {
          vehicle_id: 'ABC-123',
          placa: 'ABC-123',
          marca: 'Toyota',
          modelo: 'Corolla',
          conductor: 'Juan Pérez',
          status: 'activo',
          latitude: 4.6097 + (Math.random() - 0.5) * 0.02,
          longitude: -74.0817 + (Math.random() - 0.5) * 0.02,
          speed: Math.random() * 60,
          heading: Math.random() * 360,
          last_update: new Date().toISOString(),
        },
        {
          vehicle_id: 'XYZ-789',
          placa: 'XYZ-789',
          marca: 'Chevrolet',
          modelo: 'Spark',
          conductor: 'María García',
          status: 'activo',
          latitude: 4.631 + (Math.random() - 0.5) * 0.02,
          longitude: -74.0653 + (Math.random() - 0.5) * 0.02,
          speed: Math.random() * 50,
          heading: Math.random() * 360,
          last_update: new Date().toISOString(),
        },
        {
          vehicle_id: 'DEF-456',
          placa: 'DEF-456',
          marca: 'Nissan',
          modelo: 'Sentra',
          conductor: 'Carlos López',
          status: 'inactivo',
          latitude: 4.6533 + (Math.random() - 0.5) * 0.02,
          longitude: -74.0836 + (Math.random() - 0.5) * 0.02,
          speed: 0,
          heading: 0,
          last_update: new Date(Date.now() - 30000).toISOString(), // 30 segundos atrás
        },
      ];

      return { data: mockLocations, error: null };
    }

    try {
      const { data, error } = await supabase.rpc(
        'get_latest_vehicle_locations'
      );

      if (error) {
        throw new Error(`Error RPC: ${error.message}`);
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error al obtener ubicaciones:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Obtiene vehículos asociados a un conductor (por nombre en columna conductor)
   * @param {string} conductorName - Nombre del conductor asignado (de user metadata)
   * @returns {Promise<{data: Array, error: null|Error}>}
   */
  async getVehiclesByConductor(conductorName) {
    if (!conductorName) {
      return { data: [], error: new Error('Nombre de conductor vacío') };
    }

    if (isInMockMode()) {
      // Filtrar de mockLocations si ya existen (reusa lógica simple)
      const { data } = await this.getLatestLocations();
      const filtered = (data || []).filter(
        (v) =>
          v.conductor &&
          v.conductor.toLowerCase() === conductorName.toLowerCase()
      );
      return { data: filtered, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .ilike('conductor', `%${conductorName}%`); // patrón flexible por si hay nombre compuesto

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error obteniendo vehículos por conductor:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Obtiene vehículos asignados actualmente a un conductor a través de la tabla de asignaciones
   * Busca el driver por email y luego consulta la vista v_active_assignments para obtener la placa
   * @param {string} email - Email del usuario autenticado (rol conductor)
   * @returns {Promise<{data: Array, error: null|Error}>}
   */
  async getAssignedVehiclesByDriverEmail(email) {
    if (!email) {
      return { data: [], error: new Error('Email vacío') };
    }

    if (isInMockMode()) {
      const { data } = await this.getLatestLocations();
      return { data, error: null };
    }

    try {
      console.log('[assign] start for email', email);
      // 1) Resolver driver por email (case-insensitive) en 'drivers' y fallback a 'conductor'
      let driver = null;
      let dErr = null;
      try {
        const res = await supabase
          .from('drivers')
          .select('id, nombre, apellidos, email')
          .ilike('email', email)
          .single();
        driver = res.data;
        dErr = res.error || null;
        console.log('[assign] drivers lookup', {
          driver,
          error: dErr?.message,
        });
      } catch (e) {
        dErr = e;
        console.warn('[assign] drivers lookup error', e.message || e);
      }

      if ((!driver || dErr) && !driver) {
        try {
          const res2 = await supabase
            .from('conductor')
            .select('id, nombre, apellidos, email')
            .ilike('email', email)
            .single();
          driver = res2.data;
          dErr = res2.error || null;
          console.log('[assign] conductor lookup', {
            driver,
            error: dErr?.message,
          });
        } catch (e2) {
          dErr = e2;
          console.warn('[assign] conductor lookup error', e2.message || e2);
        }
      }

      if (!driver) {
        if (dErr)
          console.warn(
            'No se encontró driver por email en drivers/conductor:',
            dErr.message || dErr
          );
        return { data: [], error: null };
      }

      // 2) Consultar asignaciones activas: preferir vista v_active_assignments
      let vehicles = [];
      let usedSource = 'v_active_assignments';
      try {
        const { data: assignments, error: aErr } = await supabase
          .from('v_active_assignments')
          .select('vehicle_id, plate_number, brand, model, currently_active')
          .eq('driver_id', driver.id)
          .eq('currently_active', true);
        if (aErr) throw aErr;
        console.log(
          '[assign] v_active_assignments active',
          assignments?.length
        );
        if (assignments && assignments.length > 0) {
          vehicles = assignments.map((a) => ({
            id: a.vehicle_id,
            placa: a.plate_number,
            marca: a.brand,
            modelo: a.model,
          }));
        }
      } catch (ve) {
        console.warn(
          'Fallo consulta a v_active_assignments, intentando vehicle_assignments:',
          ve.message || ve
        );
        usedSource = 'vehicle_assignments';
      }

      // 2a) Si la vista no retorna activos por tiempo, intentar sin filtrar por currently_active
      if (vehicles.length === 0) {
        try {
          const { data: assignmentsAny, error: aErr2 } = await supabase
            .from('v_active_assignments')
            .select('vehicle_id, plate_number, brand, model, currently_active')
            .eq('driver_id', driver.id);
          if (aErr2) throw aErr2;
          console.log(
            '[assign] v_active_assignments any',
            assignmentsAny?.length
          );
          if (assignmentsAny && assignmentsAny.length > 0) {
            vehicles = assignmentsAny.map((a) => ({
              id: a.vehicle_id,
              placa: a.plate_number,
              marca: a.brand,
              modelo: a.model,
            }));
            usedSource = 'v_active_assignments(any)';
          }
        } catch (ve2) {
          console.warn(
            'Fallo consulta a v_active_assignments (sin filtro tiempo):',
            ve2.message || ve2
          );
        }
      }

      // 2b) Fallback a tabla vehicle_assignments + lookup en vehicles
      if (vehicles.length === 0) {
        try {
          const { data: vas, error: vaErr } = await supabase
            .from('vehicle_assignments')
            .select('vehicle_id, driver_id, status, start_time, end_time')
            .eq('driver_id', driver.id)
            .eq('status', 'active');
          if (vaErr) throw vaErr;
          console.log('[assign] vehicle_assignments active', vas?.length);
          const ids = (vas || []).map((x) => x.vehicle_id).filter(Boolean);
          if (ids.length > 0) {
            const { data: vehs, error: vErr } = await supabase
              .from('vehicles')
              .select('id, placa, marca, modelo')
              .in('id', ids);
            if (vErr) throw vErr;
            vehicles = (vehs || []).map((v) => ({
              id: v.id,
              placa: v.placa || v.id,
              marca: v.marca,
              modelo: v.modelo,
            }));
          }
        } catch (vae) {
          console.warn(
            'Fallo fallback vehicle_assignments:',
            vae.message || vae
          );
        }
      }

      // 2c) Último recurso: tomar la asignación más reciente aunque no esté activa en tiempo
      if (vehicles.length === 0) {
        try {
          const { data: vasRecent, error: vaErr2 } = await supabase
            .from('vehicle_assignments')
            .select('vehicle_id')
            .eq('driver_id', driver.id)
            .order('start_time', { ascending: false })
            .limit(1);
          if (vaErr2) throw vaErr2;
          console.log('[assign] vehicle_assignments recent', vasRecent?.length);
          const vid = vasRecent?.[0]?.vehicle_id;
          if (vid) {
            const { data: v, error: vErr2 } = await supabase
              .from('vehicles')
              .select('id, placa, marca, modelo')
              .eq('id', vid)
              .single();
            if (vErr2) throw vErr2;
            if (v) {
              vehicles = [
                {
                  id: v.id,
                  placa: v.placa || v.id,
                  marca: v.marca,
                  modelo: v.modelo,
                },
              ];
            }
          }
        } catch (vre) {
          console.warn(
            'Fallo búsqueda de última asignación reciente:',
            vre.message || vre
          );
        }
      }

      console.log('[assign] result vehicles', vehicles);
      return { data: vehicles, error: null };
    } catch (err) {
      console.error('Error obteniendo vehículos asignados por email:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Inserta nueva ubicación GPS de vehículo
   * @param {Object} location - Datos de ubicación
   * @param {string} location.vehicle_id - ID/placa del vehículo
   * @param {number} location.latitude - Latitud
   * @param {number} location.longitude - Longitud
   * @param {number} [location.speed=0] - Velocidad en km/h
   * @param {number} [location.heading=0] - Dirección en grados (0-360)
   * @param {number} [location.accuracy] - Precisión GPS en metros
   * @param {number} [location.altitude] - Altitud en metros
   * @returns {Promise<{data: any, error: null|Error}>}
   */
  async insertLocation({
    vehicle_id,
    latitude,
    longitude,
    speed = 0,
    heading = 0,
    accuracy = null,
    altitude = null,
  }) {
    if (isInMockMode()) {
      // Simular inserción en modo mock
      console.log('Mock: Insertando ubicación', {
        vehicle_id,
        latitude,
        longitude,
        speed,
        heading,
      });
      return {
        data: {
          id: Date.now(),
          vehicle_id,
          latitude,
          longitude,
          speed,
          heading,
        },
        error: null,
      };
    }

    try {
      // PASO 1: Resolver vehicle_id si se pasó una placa
      let resolvedVehicleId = vehicle_id;
      let vehiclePlaca = vehicle_id;

      if (isNaN(vehicle_id)) {
        console.log(`🔍 Buscando vehículo por placa: "${vehicle_id}"`);
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, placa')
          .eq('placa', vehicle_id.toUpperCase())
          .single();

        if (vehicleError || !vehicleData) {
          console.error(
            `❌ Vehículo no encontrado con placa "${vehicle_id}":`,
            vehicleError
          );
          throw new Error(`Vehículo con placa "${vehicle_id}" no encontrado`);
        }

        resolvedVehicleId = vehicleData.id;
        vehiclePlaca = vehicleData.placa;
        console.log(
          `✅ Vehículo encontrado: ID=${resolvedVehicleId}, Placa=${vehiclePlaca}`
        );
      }

      // PASO 2: Insertar ubicación usando RPC
      const { data, error } = await supabase.rpc('insert_vehicle_location', {
        p_vehicle_id: vehiclePlaca, // La función RPC acepta placa
        p_latitude: latitude,
        p_longitude: longitude,
        p_speed: speed,
        p_heading: heading,
        p_accuracy: accuracy,
        p_altitude: altitude,
      });

      if (error) {
        throw new Error(`Error insertando ubicación: ${error.message}`);
      }

      console.log(
        `📍 Ubicación insertada: Placa=${vehiclePlaca}, Speed=${speed} km/h, Lat=${latitude.toFixed(6)}, Lng=${longitude.toFixed(6)}`
      );

      // PASO 3: EVALUAR ALERTAS después de insertar la ubicación
      try {
        // Importar dinámicamente para evitar dependencia circular
        const { evaluarAlertasUbicacion } = await import('./alertService.js');

        console.log(
          `🔍 Evaluando alertas: vehicle_id=${resolvedVehicleId} (${vehiclePlaca}), speed=${speed} km/h`
        );

        const resultado = await evaluarAlertasUbicacion(
          parseInt(resolvedVehicleId),
          speed, // velocidad en km/h
          latitude, // latitud
          longitude // longitud
        );

        if (resultado.data && resultado.data.length > 0) {
          console.log(
            `🚨 ${resultado.data.length} Alertas generadas:`,
            resultado.data
          );
        }
      } catch (alertError) {
        console.error('⚠️ Error evaluando alertas (no crítico):', alertError);
        // No fallar la inserción si la evaluación de alertas falla
      }

      return { data, error: null };
    } catch (err) {
      console.error('❌ Error al insertar ubicación:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Obtiene historial de ubicaciones de un vehículo específico
   * @param {string} vehicleId - ID/placa del vehículo
   * @param {Object} [options={}] - Opciones de consulta
   * @param {number} [options.limit=100] - Límite de registros
   * @param {Date} [options.startDate] - Fecha inicial
   * @param {Date} [options.endDate] - Fecha final
   * @returns {Promise<{data: Array, error: null|Error}>}
   */
  async getVehicleHistory(vehicleId, options = {}) {
    const { limit = 100, startDate, endDate } = options;

    if (isInMockMode()) {
      // Datos mock para historial
      const mockHistory = Array.from(
        { length: Math.min(limit, 20) },
        (_, i) => ({
          id: i + 1,
          vehicle_id: vehicleId,
          latitude: 4.6097 + (Math.random() - 0.5) * 0.05,
          longitude: -74.0817 + (Math.random() - 0.5) * 0.05,
          speed: Math.random() * 60,
          heading: Math.random() * 360,
          timestamp: new Date(Date.now() - i * 60000).toISOString(), // Cada minuto hacia atrás
        })
      );

      return { data: mockHistory, error: null };
    }

    try {
      let query = supabase
        .from('vehicle_locations')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error obteniendo historial: ${error.message}`);
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error al obtener historial:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Configura suscripción a actualizaciones en tiempo real
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Object|null} - Objeto de suscripción para cleanup
   */
  subscribeToUpdates(callback) {
    if (isInMockMode()) {
      console.log('Mock mode: simulando suscripción realtime');
      // Simular actualizaciones cada 5 segundos en modo mock
      const interval = setInterval(() => {
        callback({
          eventType: 'INSERT',
          new: { vehicle_id: 'MOCK-UPDATE', timestamp: new Date() },
          old: null,
        });
      }, 5000);

      return {
        unsubscribe: () => clearInterval(interval),
      };
    }

    try {
      const subscription = supabase
        .channel('vehicle_locations_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vehicle_locations',
          },
          (payload) => {
            console.log('Cambio detectado en vehicle_locations:', payload);
            callback(payload);
          }
        )
        .subscribe();

      return subscription;
    } catch (err) {
      console.error('Error configurando suscripción realtime:', err);
      return null;
    }
  },

  /**
   * Obtiene vehículos dentro de un área geográfica (geocerca)
   * @param {Object} bounds - Límites geográficos
   * @param {number} bounds.north - Latitud norte
   * @param {number} bounds.south - Latitud sur
   * @param {number} bounds.east - Longitud este
   * @param {number} bounds.west - Longitud oeste
   * @returns {Promise<{data: Array, error: null|Error}>}
   */
  async getVehiclesInBounds({ north, south, east, west }) {
    if (isInMockMode()) {
      // Filtrar datos mock por bounds
      const { data: allLocations } = await this.getLatestLocations();
      const filtered = allLocations.filter(
        (location) =>
          location.latitude >= south &&
          location.latitude <= north &&
          location.longitude >= west &&
          location.longitude <= east
      );

      return { data: filtered, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('vehicle_locations')
        .select(
          `
          *,
          vehicles!inner(placa, marca, modelo, conductor, status)
        `
        )
        .gte('latitude', south)
        .lte('latitude', north)
        .gte('longitude', west)
        .lte('longitude', east)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Error consultando geocerca: ${error.message}`);
      }

      // Filtrar solo la ubicación más reciente por vehículo
      const latestByVehicle = {};
      (data || []).forEach((location) => {
        const vehicleId = location.vehicle_id;
        if (
          !latestByVehicle[vehicleId] ||
          new Date(location.timestamp) >
            new Date(latestByVehicle[vehicleId].timestamp)
        ) {
          latestByVehicle[vehicleId] = location;
        }
      });

      return { data: Object.values(latestByVehicle), error: null };
    } catch (err) {
      console.error('Error en consulta de geocerca:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Función helper para obtener coordenadas del dispositivo
   * @param {Object} [options={}] - Opciones de geolocalización
   * @returns {Promise<{coords: Object, error: null|Error}>}
   */
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };

    if (!navigator.geolocation) {
      return {
        coords: null,
        error: new Error('Geolocalización no soportada en este dispositivo'),
      };
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          defaultOptions
        );
      });

      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed ? position.coords.speed * 3.6 : 0, // m/s a km/h
        },
        error: null,
      };
    } catch (err) {
      console.error('Error obteniendo posición GPS:', err);
      return {
        coords: null,
        error: new Error(`Error GPS: ${err.message}`),
      };
    }
  },

  /**
   * Helper para watchear posición GPS continua
   * @param {Function} callback - Función llamada en cada actualización
   * @param {Object} [options={}] - Opciones de geolocalización
   * @returns {number|null} - ID del watch para clearWatch
   */
  watchPosition(callback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000,
      ...options,
    };

    if (!navigator.geolocation) {
      callback(null, new Error('Geolocalización no soportada'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed ? position.coords.speed * 3.6 : 0, // m/s a km/h
          timestamp: new Date(position.timestamp).toISOString(),
        };
        callback(coords, null);
      },
      (error) => {
        callback(null, new Error(`Error GPS watch: ${error.message}`));
      },
      defaultOptions
    );

    return watchId;
  },

  /**
   * Para el seguimiento GPS
   * @param {number} watchId - ID retornado por watchPosition
   */
  clearWatch(watchId) {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  },
};

export default locationService;
