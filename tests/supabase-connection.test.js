import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Prueba simple de conectividad real a Supabase usando variables Vite (VITE_*)
describe('Supabase connectivity', () => {
  it('should reach the project and query a table head', async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

    expect(url, 'VITE_SUPABASE_URL debe estar definida').toBeTruthy();
    expect(anon, 'VITE_SUPABASE_ANON_KEY debe estar definida').toBeTruthy();

    const supabase = createClient(url, anon);

    // Intentamos una consulta HEAD segura sobre la tabla `conductor` (schema legacy)
    const { error } = await supabase
      .from('conductor')
      .select('id_conductor', { count: 'exact', head: true })
      .limit(1);

    // Si la tabla no existe en ese proyecto, esto falla, pero la conectividad está probada.
    if (error) {
      // Consideramos conectividad válida salvo que sea error de red / auth
      const lower = (error.message || '').toLowerCase();
      const networkish =
        lower.includes('fetch') ||
        lower.includes('network') ||
        lower.includes('dns') ||
        lower.includes('unauthorized');
      expect(networkish ? error.message : 'ok').toBe('ok');
    } else {
      expect(true).toBe(true);
    }
  }, 20000);
});
