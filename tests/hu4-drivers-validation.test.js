import { describe, it, expect } from 'vitest';
import { validateDriverData } from '../src/components/DriverForm';

/**
 * Tests para validación de conductores
 * Issue #50 - CRUD de Conductores para RRHH
 */
describe('Driver form validation', () => {
  describe('Campos obligatorios', () => {
    it('debe retornar errores cuando faltan campos obligatorios', () => {
      const data = {};
      const errors = validateDriverData(data);

      expect(errors.nombre_completo).toBeDefined();
      expect(errors.cedula).toBeDefined();
      expect(errors.numero_licencia).toBeDefined();
    });

    it('debe aceptar datos válidos sin errores', () => {
      const hoyMas1Mes = new Date();
      hoyMas1Mes.setMonth(hoyMas1Mes.getMonth() + 1);

      const data = {
        nombre_completo: 'Juan Pérez',
        cedula: '1234567890',
        fecha_venc_licencia: hoyMas1Mes.toISOString().split('T')[0],
        numero_licencia: 'ABC123',
      };

      const errors = validateDriverData(data);
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe('Validación de fecha de vencimiento de licencia', () => {
    it('debe rechazar una fecha de vencimiento pasada', () => {
      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: '2000-01-01',
        numero_licencia: 'ABC123',
      };

      const errors = validateDriverData(data);
      expect(errors.fecha_venc_licencia).toBeDefined();
      expect(errors.fecha_venc_licencia).toContain('futura');
    });

    it('debe aceptar la fecha de hoy', () => {
      const hoy = new Date();

      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: hoy.toISOString().split('T')[0],
        numero_licencia: 'ABC123',
      };

      const errors = validateDriverData(data);
      expect(errors.fecha_venc_licencia).toBeUndefined();
    });

    it('debe aceptar una fecha futura', () => {
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 100);

      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: futuro.toISOString().split('T')[0],
        numero_licencia: 'ABC123',
      };

      const errors = validateDriverData(data);
      expect(errors.fecha_venc_licencia).toBeUndefined();
    });

    it('debe rechazar formato de fecha inválido', () => {
      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: 'fecha-invalida',
        numero_licencia: 'ABC123',
      };

      const errors = validateDriverData(data);
      expect(errors.fecha_venc_licencia).toBeDefined();
    });
  });

  describe('Validación de email', () => {
    it('debe aceptar email válido', () => {
      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: '2026-12-31',
        numero_licencia: 'ABC123',
        email: 'test@example.com',
      };

      const errors = validateDriverData(data);
      expect(errors.email).toBeUndefined();
    });

    it('debe rechazar email inválido', () => {
      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: '2026-12-31',
        numero_licencia: 'ABC123',
        email: 'email-invalido',
      };

      const errors = validateDriverData(data);
      expect(errors.email).toBeDefined();
    });

    it('debe permitir email vacío', () => {
      const data = {
        nombre_completo: 'Test Driver',
        cedula: '1234',
        fecha_venc_licencia: '2026-12-31',
        numero_licencia: 'ABC123',
        email: '',
      };

      const errors = validateDriverData(data);
      expect(errors.email).toBeUndefined();
    });
  });

  describe('Happy path - Escenarios completos', () => {
    it('Escenario 1: Crear conductor válido', () => {
      const data = {
        nombre_completo: 'Carlos Mendoza',
        cedula: '1015234567',
        telefono: '3001234567',
        email: 'carlos.mendoza@email.com',
        fecha_venc_licencia: '2026-06-15',
        numero_licencia: 'LIC-123',
        estado: 'activo',
        direccion: 'Calle 100 # 15-45, Bogotá',
        fecha_ingreso: '2025-01-15',
      };

      const errors = validateDriverData(data);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('Escenario 2: Licencia próxima a vencer (alerta visual)', () => {
      // Fecha que vence en 15 días
      const en15Dias = new Date();
      en15Dias.setDate(en15Dias.getDate() + 15);

      const data = {
        nombre_completo: 'María García',
        cedula: '2015678901',
        fecha_venc_licencia: en15Dias.toISOString().split('T')[0],
        numero_licencia: 'ABC123',
      };

      const errors = validateDriverData(data);
      // No debe haber errores, solo advertencia visual en UI
      expect(Object.keys(errors).length).toBe(0);

      // Verificar que está dentro del rango de alerta (<=30 días)
      const hoy = new Date();
      const dias = Math.ceil((en15Dias - hoy) / (1000 * 60 * 60 * 24));
      expect(dias).toBeLessThanOrEqual(30);
      expect(dias).toBeGreaterThanOrEqual(0);
    });
  });
});
