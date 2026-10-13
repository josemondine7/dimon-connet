// feed.js — Flujo deslizable vertical (tipo TikTok)
import { supabase } from '../api/supabase.js';
import { Validador } from '../utils/validacion.js';
import { CONFIG } from '../config/config.js';

let indiceActual = 0;
let publicaciones = [];
let toqueInicialY = 0;

export async function iniciarFeed() {
  await cargarPublicaciones();
  configurarGestos();
}

// Cargar publicaciones (primero de la BD, si falla → ejemplos)
async function cargarPublicaciones() {
  try {
    const { data, error } = await supabase
      .from('publicaciones')
      .select('id, titulo, ciudad, departamento, autor_id, activo, imagen_url')
      .eq('activo', true)
      .order('creado_el', { ascending: false })
      .limit(CONFIG.PUBLICACIONES_POR_CARGA);

    if (error || !data || data.length === 0) throw new Error('Sin datos');

    publicaciones = data;
  } catch (error) {
    console.log('ℹ️ Cargando publicaciones de ejemplo...');
    publicaciones = obtenerEjemplos();
  }
  mostrarPublicacion(indiceActual);
}

function obtenerEjemplos() {
  return [
    { id: 1, titulo: 'Cortar el pasto — zona Pocitos', ciudad: 'Montevideo', departamento: 'Montevideo', autor_nombre: 'juan_pasto', imagen_url: '' },
    { id: 2, titulo: 'Clases de guitarra para principiantes', ciudad: 'Ciudad de la Costa', departamento: 'Canelones', autor_nombre: 'ana_musica', imagen_url: '' },
    { id: 3, titulo: 'Arreglo de cañerías y fugas', ciudad: 'Pocitos', departamento: 'Montevideo', autor_nombre: 'carlos_fontanero', imagen_url: '' },
    { id: 4, titulo: 'Limpieza de casas — disponible ya', ciudad: 'Maldonado', departamento: 'Maldonado', autor_nombre: 'maria_limpieza', imagen_url: '' },
    { id: 5, titulo: 'Clases de matemáticas para primaria', ciudad: 'Salto', departamento: 'Salto', autor_nombre: 'profe_mate', imagen_url: '' }
  ];
}

// Mostrar una publicación con textContent (seguro contra XSS)
function mostrarPublicacion(indice) {
  const pub = publicaciones[indice];
  if (!pub) return;

  const titulo = document.getElementById('pub-titulo');
  const ciudad = document.getElementById('pub-ciudad');
  const autorNombre = document.getElementById('autor-nombre');
  const perfilAutor = document.getElementById('perfil-autor');

  if (titulo) titulo.textContent = Validador.limpiarTexto(pub.titulo || '');
  if (ciudad) ciudad.textContent = `📍 ${Validador.limpiarTexto(pub.ciudad || '')}, ${Validador.limpiarTexto(pub.departamento || '')}`;
  if (autorNombre) autorNombre.textContent = `@${Validador.limpiarTexto(pub.autor_nombre || 'usuario')}`;
  if (perfilAutor) perfilAutor.classList.remove('oculta');

  // Fondo
  const feed = document.getElementById('feed');
  if (feed) {
    feed.style.background = pub.imagen_url
      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('${pub.imagen_url}') center/cover`
      : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }
}

// Gestos: deslizar arriba → siguiente, abajo → anterior
function configurarGestos() {
  const feed = document.getElementById('feed');
  if (!feed) return;

  feed.addEventListener('touchstart', e => {
    toqueInicialY = e.touches[0].clientY;
  }, { passive: true });

  feed.addEventListener('touchmove', e => {
    const objetivo = e.target;
    // No bloquear si está sobre un input, textarea o ventana de chat
    if (objetivo.tagName === 'INPUT' || objetivo.tagName === 'TEXTAREA' || objetivo.closest('.chat-dimon') || objetivo.closest('.modal')) {
      return;
    }
    e.preventDefault();
  }, { passive: false });

  feed.addEventListener('touchend', e => {
    const toqueFinalY = e.changedTouches[0].clientY;
    const diferencia = toqueInicialY - toqueFinalY;
    if (Math.abs(diferencia) > 60) {
      if (diferencia > 0) siguiente();
      else anterior();
    }
  });

  // También con teclado (para pruebas en computadora)
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') siguiente();
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') anterior();
  });
}

function siguiente() {
  if (indiceActual < publicaciones.length - 1) {
    indiceActual++;
    mostrarPublicacion(indiceActual);
  }
}

function anterior() {
  if (indiceActual > 0) {
    indiceActual--;
    mostrarPublicacion(indiceActual);
  }
}
