import { describe, it, expect } from 'vitest';
import { fallbackClassification } from '../server';

describe('fallbackClassification (clasificador heuristico)', () => {

  describe('UTIL (Conservar)', () => {
    it('clasifica correo de jefe como Conservar', () => {
      const correo = { remitente: 'jefe@empresa.com', asunto: 'Reunion', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Conservar');
    });

    it('clasifica correo bancario como Conservar', () => {
      const correo = { remitente: 'banco@santander.com', asunto: 'Token dinamica', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Conservar');
    });

    it('clasifica codigo de verificacion como Conservar', () => {
      const correo = { remitente: 'noreply@google.com', asunto: 'Codigo de verificacion', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Conservar');
    });

    it('clasifica correo de servicios esenciales (luz) como Conservar', () => {
      const correo = { remitente: 'edenor@edenor.com', asunto: 'Factura de luz', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Conservar');
    });
  });

  describe('ARCHIVABLE (Archivar)', () => {
    it('clasifica factura pagada como Archivar', () => {
      const correo = { remitente: 'tienda@tienda.com', asunto: 'Factura pagada', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Archivar');
    });

    it('clasifica confirmacion de reserva como Archivar', () => {
      const correo = { remitente: 'booking@booking.com', asunto: 'Confirmacion de reserva', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Archivar');
    });

    it('clasifica pedido confirmado como Archivar', () => {
      const correo = { remitente: 'pedidos@tienda.com', asunto: 'Pedido confirmado', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Archivar');
    });
  });

  describe('DESECHABLE (Eliminar)', () => {
    it('clasifica newsletter como Eliminar', () => {
      const correo = { remitente: 'newsletter@tech.com', asunto: 'Resumen semanal', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Eliminar');
    });

    it('clasifica promocion como Eliminar', () => {
      const correo = { remitente: 'ofertas@tienda.com', asunto: 'Mega descuento 70%', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Eliminar');
    });

    it('clasifica notificacion de LinkedIn como Eliminar', () => {
      const correo = { remitente: 'notifications@linkedin.com', asunto: 'Tienes una nueva conexion', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Eliminar');
    });

    it('clasifica correo desconocido como Eliminar (regla de oro)', () => {
      const correo = { remitente: 'desconocido@random.com', asunto: 'Hola', resumen: 'contenido generico' };
      expect(fallbackClassification(correo)).toBe('Eliminar');
    });
  });

  describe('Instrucciones personalizadas', () => {
    it('respeta "no elimines banco" sobre correo de banco', () => {
      const correo = { remitente: 'banco@bbva.com', asunto: 'Notificacion', resumen: '' };
      const instrucciones = 'No elimines correos del banco';
      expect(fallbackClassification(correo, instrucciones)).toBe('Conservar');
    });

    it('respeta "archiva factura" sobre correo de factura', () => {
      const correo = { remitente: 'facturacion@servicio.com', asunto: 'Factura', resumen: '' };
      const instrucciones = 'Archiva todas las facturas';
      expect(fallbackClassification(correo, instrucciones)).toBe('Archivar');
    });

    it('sin instrucciones, newsletter sigue siendo Eliminar', () => {
      const correo = { remitente: 'newsletter@tech.com', asunto: 'Resumen', resumen: '' };
      expect(fallbackClassification(correo)).toBe('Eliminar');
    });
  });

  describe('Regla de oro (default a Eliminar)', () => {
    it('correo sin match va a Eliminar', () => {
      const correo = { remitente: 'foo@bar.com', asunto: 'xyz', resumen: 'abc' };
      expect(fallbackClassification(correo)).toBe('Eliminar');
    });
  });
});