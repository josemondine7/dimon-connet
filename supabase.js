// supabase.js — Conexión con la base de datos
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config/config.js';

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_CLAVE);

// Probar conexión al iniciar
export async function probarConexion() {
  try {
    const { error } = await supabase.from('publicaciones').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Conexión con Supabase OK');
    return true;
  } catch (error) {
    console.warn('⚠️ No se pudo conectar con Supabase:', error.message);
    return false;
  }
}
