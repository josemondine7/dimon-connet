// config.js — Configuración central del proyecto
// Detecta automáticamente si estamos en desarrollo o producción

const esProduccion = import.meta.env.PROD;

export const CONFIG = {
  MODO: esProduccion ? 'produccion' : 'desarrollo',
  DEBUG: !esProduccion,

  // Supabase (claves públicas — seguro exponerlas, RLS protege los datos)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_CLAVE: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // Endpoint de Dimon IA (va al servidor Express, que protege la clave de Groq)
  DIMON_ENDPOINT: '/api/dimon',

  // Límites
  LIMITE_PUBLICACIONES_POR_DIA: esProduccion ? 10 : 20,
  LIMITE_MENSAJES_POR_MINUTO: esProduccion ? 5 : 10,

  // Textos
  DURACION_SPLASH_MS: 2500,
  PUBLICACIONES_POR_CARGA: 10
};

// Avisar si faltan claves
if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_CLAVE) {
  console.warn('⚠️ Faltan variables de SUPABASE. Revisá tu archivo .env o la configuración en Render.');
}
