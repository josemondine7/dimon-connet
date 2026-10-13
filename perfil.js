// perfil.js — Perfil del usuario (accesible desde el botón abajo a la derecha)
import { supabase } from '../api/supabase.js';

export function iniciarPerfil() {
  // Por ahora, el botón de perfil abre el auth si no hay sesión.
  // Cuando haya sesión, mostraría: mis publicaciones, editar datos, cerrar sesión.
  // Esta estructura está lista para ampliarse.
  console.log('✅ Módulo de perfil listo');
}

export async function obtenerMiPerfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('usuarios')
    .select('usuario, ciudad, departamento, pais')
    .eq('id', user.id)
    .single();

  return data || null;
}
