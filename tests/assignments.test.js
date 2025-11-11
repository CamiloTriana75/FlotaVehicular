/**
 * Tests para el servicio de asignaciones
 * Historia de Usuario: HU3 - Asociar vehículos a conductores con fechas y horarios
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createAssignment,
  getAssignments,
  getActiveAssignments,
  updateAssignment,
  completeAssignment,
  cancelAssignment,
  checkAssignmentConflicts,
  getAssignmentStats,
} from '../src/services/assignmentService';
import { supabase } from '../src/lib/supabaseClient';

describe('Assignment Service Tests', () => {
  let testVehicleId;
  let testDriverId;
  let testCompanyId;
  let testAssignmentId;

  // Setup: Crear datos de prueba
  beforeAll(async () => {
    // Crear compañía de prueba
    const { data: company } = await supabase
      .from('companies')
      .insert({
        name: 'Test Company',
        nit: '123456789',
      })
      .select()
      .single();

    testCompanyId = company.id;

    // Crear vehículo de prueba
    const { data: vehicle } = await supabase
      .from('vehicles')
      .insert({
        company_id: testCompanyId,
        plate_number: 'TEST-001',
        brand: 'Test Brand',
        model: 'Test Model',
        year: 2024,
        status: 'available',
      })
      .select()
      .single();

    testVehicleId = vehicle.id;

    // Crear conductor de prueba
    const { data: driver } = await supabase
      .from('drivers')
      .insert({
        company_id: testCompanyId,
        cedula: '9999999',
        first_name: 'Test',
        last_name: 'Driver',
        license_number: 'TEST-LIC-001',
        status: 'available',
      })
      .select()
      .single();

    testDriverId = driver.id;
  });

  // Cleanup: Eliminar datos de prueba
  afterAll(async () => {
    // Eliminar asignaciones de prueba
    if (testVehicleId) {
      await supabase
        .from('vehicle_assignments')
        .delete()
        .eq('vehicle_id', testVehicleId);
    }

    // Eliminar vehículo de prueba
    if (testVehicleId) {
      await supabase.from('vehicles').delete().eq('id', testVehicleId);
    }

    // Eliminar conductor de prueba
    if (testDriverId) {
      await supabase.from('drivers').delete().eq('id', testDriverId);
    }

    // Eliminar compañía de prueba
    if (testCompanyId) {
      await supabase.from('companies').delete().eq('id', testCompanyId);
    }
  });

  // Limpiar asignaciones antes de cada test
  beforeEach(async () => {
    if (testVehicleId) {
      await supabase
        .from('vehicle_assignments')
        .delete()
        .eq('vehicle_id', testVehicleId);
    }
  });

  describe('Crear Asignaciones', () => {
    it('debe crear una asignación válida sin solapamientos', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(17, 0, 0, 0);

      const result = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: tomorrow,
        endTime: endTime,
        notes: 'Asignación de prueba',
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.vehicle_id).toBe(testVehicleId);
      expect(result.data.driver_id).toBe(testDriverId);
      expect(result.data.status).toBe('active');

      testAssignmentId = result.data.id;
    });

    it('debe rechazar asignación con fecha de fin anterior a fecha de inicio', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: tomorrow,
        endTime: yesterday,
      });

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });

    it('debe rechazar asignación sin vehículo o conductor', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await createAssignment({
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3600000),
      });

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('Validación de Solapamientos', () => {
    it('debe detectar solapamiento de conductor', async () => {
      // Crear primera asignación
      const start1 = new Date();
      start1.setDate(start1.getDate() + 2);
      start1.setHours(9, 0, 0, 0);

      const end1 = new Date(start1);
      end1.setHours(13, 0, 0, 0);

      await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: start1,
        endTime: end1,
      });

      // Intentar crear segunda asignación con solapamiento
      const start2 = new Date(start1);
      start2.setHours(12, 0, 0, 0); // Solapa con la primera

      const end2 = new Date(start2);
      end2.setHours(15, 0, 0, 0);

      // Crear otro vehículo para la segunda asignación
      const { data: vehicle2 } = await supabase
        .from('vehicles')
        .insert({
          company_id: testCompanyId,
          plate_number: 'TEST-002',
          brand: 'Test Brand 2',
          model: 'Test Model 2',
          year: 2024,
          status: 'available',
        })
        .select()
        .single();

      const result = await createAssignment({
        vehicleId: vehicle2.id,
        driverId: testDriverId, // Mismo conductor
        startTime: start2,
        endTime: end2,
      });

      // Debe fallar por solapamiento
      expect(result.error).toBeDefined();

      // Limpiar
      await supabase.from('vehicles').delete().eq('id', vehicle2.id);
    });

    it('debe detectar solapamiento de vehículo', async () => {
      // Crear primera asignación
      const start1 = new Date();
      start1.setDate(start1.getDate() + 3);
      start1.setHours(9, 0, 0, 0);

      const end1 = new Date(start1);
      end1.setHours(13, 0, 0, 0);

      await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: start1,
        endTime: end1,
      });

      // Crear otro conductor para la segunda asignación
      const { data: driver2 } = await supabase
        .from('drivers')
        .insert({
          company_id: testCompanyId,
          cedula: '8888888',
          first_name: 'Test2',
          last_name: 'Driver2',
          license_number: 'TEST-LIC-002',
          status: 'available',
        })
        .select()
        .single();

      // Intentar crear segunda asignación con solapamiento
      const start2 = new Date(start1);
      start2.setHours(12, 0, 0, 0); // Solapa con la primera

      const end2 = new Date(start2);
      end2.setHours(15, 0, 0, 0);

      const result = await createAssignment({
        vehicleId: testVehicleId, // Mismo vehículo
        driverId: driver2.id,
        startTime: start2,
        endTime: end2,
      });

      // Debe fallar por solapamiento
      expect(result.error).toBeDefined();

      // Limpiar
      await supabase.from('drivers').delete().eq('id', driver2.id);
    });

    it('debe permitir asignaciones consecutivas sin solapamiento', async () => {
      // Primera asignación: 9:00 - 13:00
      const start1 = new Date();
      start1.setDate(start1.getDate() + 4);
      start1.setHours(9, 0, 0, 0);

      const end1 = new Date(start1);
      end1.setHours(13, 0, 0, 0);

      const result1 = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: start1,
        endTime: end1,
      });

      expect(result1.error).toBeNull();

      // Segunda asignación: 13:00 - 17:00 (consecutiva, no solapa)
      const start2 = new Date(end1);
      const end2 = new Date(start2);
      end2.setHours(17, 0, 0, 0);

      const result2 = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: start2,
        endTime: end2,
      });

      expect(result2.error).toBeNull();
    });
  });

  describe('Gestión de Asignaciones', () => {
    it('debe completar una asignación', async () => {
      // Crear asignación
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);

      const { data: assignment } = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3600000),
      });

      // Completar asignación
      const result = await completeAssignment(assignment.id);

      expect(result.error).toBeNull();
      expect(result.data.status).toBe('completed');
    });

    it('debe cancelar una asignación', async () => {
      // Crear asignación
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 6);

      const { data: assignment } = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3600000),
      });

      // Cancelar asignación
      const result = await cancelAssignment(assignment.id);

      expect(result.error).toBeNull();
      expect(result.data.status).toBe('cancelled');
    });

    it('debe actualizar una asignación', async () => {
      // Crear asignación
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      tomorrow.setHours(9, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(13, 0, 0, 0);

      const { data: assignment } = await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: tomorrow,
        endTime: endTime,
        notes: 'Nota original',
      });

      // Actualizar notas
      const result = await updateAssignment(assignment.id, {
        notes: 'Nota actualizada',
      });

      expect(result.error).toBeNull();
      expect(result.data.notes).toBe('Nota actualizada');
    });
  });

  describe('Consultas de Asignaciones', () => {
    it('debe obtener todas las asignaciones', async () => {
      // Crear algunas asignaciones
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 8);

      await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3600000),
      });

      const result = await getAssignments();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('debe obtener asignaciones filtradas por vehículo', async () => {
      const result = await getAssignments({ vehicleId: testVehicleId });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      result.data.forEach((assignment) => {
        expect(assignment.vehicle_id).toBe(testVehicleId);
      });
    });

    it('debe obtener estadísticas de asignaciones', async () => {
      const stats = await getAssignmentStats();

      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.active).toBeGreaterThanOrEqual(0);
      expect(stats.completed).toBeGreaterThanOrEqual(0);
      expect(stats.cancelled).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Verificación de Conflictos', () => {
    it('debe verificar conflictos correctamente', async () => {
      // Crear asignación existente
      const start = new Date();
      start.setDate(start.getDate() + 10);
      start.setHours(9, 0, 0, 0);

      const end = new Date(start);
      end.setHours(13, 0, 0, 0);

      await createAssignment({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: start,
        endTime: end,
      });

      // Verificar conflicto
      const checkStart = new Date(start);
      checkStart.setHours(12, 0, 0, 0);

      const checkEnd = new Date(checkStart);
      checkEnd.setHours(15, 0, 0, 0);

      const result = await checkAssignmentConflicts({
        vehicleId: testVehicleId,
        driverId: testDriverId,
        startTime: checkStart.toISOString(),
        endTime: checkEnd.toISOString(),
      });

      expect(result.hasConflict).toBe(true);
      expect(
        result.driverConflicts.length > 0 || result.vehicleConflicts.length > 0
      ).toBe(true);
    });
  });
});
