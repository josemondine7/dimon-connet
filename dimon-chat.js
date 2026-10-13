// dimon-chat.js — Chat con el asistente Dimon (texto + voz)
import { CONFIG } from '../config/config.js';
import { Validador } from '../utils/validacion.js';

let reconocimiento = null;
let grabando = false;

export function iniciarDimon() {
  const boton = document.getElementById('boton-dimon');
  const chat = document.getElementById('chat-dimon');
  const cerrar = document.getElementById('cerrar-chat');
  const input = document.getElementById('chat-input');
  const enviar = document.getElementById('chat-enviar');
  const voz = document.getElementById('chat-voz');

  if (!boton || !chat) return;

  // 1 toque → abrir/cerrar chat
  boton.addEventListener('click', () => {
    chat.classList.toggle('oculta');
    if (!chat.classList.contains('oculta')) {
      agregarMensaje('Dimon', '¡Hola! Soy Dimon. ¿En qué te ayudo hoy? Podés escribirme o mantener apretado el micrófono para hablarme.');
    }
  });

  cerrar?.addEventListener('click', () => chat.classList.add('oculta'));
  enviar?.addEventListener('click', enviarMensaje);
  input?.addEventListener('keypress', e => { if (e.key === 'Enter') enviarMensaje(); });

  // Mantener apretado → voz; soltar → procesar
  if (voz) {
    voz.addEventListener('mousedown', iniciarGrabacion);
    voz.addEventListener('touchstart', e => { e.preventDefault(); iniciarGrabacion(); });
    voz.addEventListener('mouseup', detenerGrabacion);
    voz.addEventListener('touchend', e => { e.preventDefault(); detenerGrabacion(); });
  }
}

function agregarMensaje(quien, texto) {
  const contenedor = document.getElementById('chat-mensajes');
  if (!contenedor) return;

  const div = document.createElement('div');
  div.className = quien === 'Dimon' ? 'msg msg-dimon' : 'msg msg-usuario';

  const p = document.createElement('p');
  p.textContent = Validador.limpiarTexto(texto); // ✅ textContent, seguro
  div.appendChild(p);

  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}

async function enviarMensaje() {
  const input = document.getElementById('chat-input');
  const texto = input?.value.trim();
  if (!texto) return;
  input.value = '';
  await procesarMensaje(texto);
}

async function procesarMensaje(texto) {
  agregarMensaje('Tú', texto);

  // Respuesta local para cosas comunes (rápida, sin necesidad de IA)
  const respuestaRapida = responderLocal(texto.toLowerCase());
  if (respuestaRapida) {
    agregarMensaje('Dimon', respuestaRapida);
    return;
  }

  // Sino, ir a la IA
  try {
    agregarMensaje('Dimon', 'Pensando...');
    const res = await fetch(CONFIG.DIMON_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: texto })
    });
    const datos = await res.json();
    // Borrar el "Pensando..." y poner la respuesta real
    const mensajes = document.getElementById('chat-mensajes');
    if (mensajes?.lastElementChild) mensajes.lastElementChild.remove();
    agregarMensaje('Dimon', datos.respuesta || 'No pude responder en este momento.');
  } catch (error) {
    const mensajes = document.getElementById('chat-mensajes');
    if (mensajes?.lastElementChild) mensajes.lastElementChild.remove();
    agregarMensaje('Dimon', 'Entendí: "' + texto + '". ¿Querés que te ayude con eso?');
  }
}

// Respuestas rápidas sin IA (para las preguntas más comunes)
function responderLocal(texto) {
  if (texto.includes('comisión') || texto.includes('cuanto cuesta') || texto.includes('precio')) {
    return 'Cada parte paga el 15% del valor del servicio acordado. Ese valor se paga por separado — el dinero del servicio va completo entre las personas. No pagás nada por navegar, publicar o chatear.';
  }
  if (texto.includes('contacto') || texto.includes('telefono') || texto.includes('whatsapp')) {
    return 'Los datos de contacto solo se comparten cuando ambas partes acuerdan trabajar juntas. Primero hablan por el chat interno de la plataforma, y cuando cierran el trato, recién ahí pueden intercambiar sus datos.';
  }
  if (texto.includes('hola') || texto.includes('buenas') || texto.includes('buenos dias')) {
    return '¡Hola! Bienvenido a Dimon Connet. Deslizá para ver servicios, o decime qué necesitás y te ayudo.';
  }
  if (texto.includes('quien eres') || texto.includes('que eres') || texto.includes('que haces')) {
    return 'Soy Dimon, el asistente de esta plataforma. Te ayudo a publicar servicios, buscar lo que necesitás, entender los pagos y navegar por todo. ¿Por dónde empezamos?';
  }
  return null;
}

// ===== Reconocimiento de voz =====
function iniciarGrabacion() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    agregarMensaje('Dimon', 'Tu navegador no soporta voz. Podés escribirme sin problema.');
    return;
  }
  grabando = true;
  document.getElementById('chat-voz')?.classList.add('grabando');

  reconocimiento = new SpeechRecognition();
  reconocimiento.lang = 'es-UY';
  reconocimiento.continuous = false;
  reconocimiento.interimResults = false;
  reconocimiento.onresult = e => procesarMensaje(e.results[0][0].transcript);
  reconocimiento.onerror = () => agregarMensaje('Dimon', 'No entendí bien. ¿Podrías repetirlo?');
  reconocimiento.start();
}

function detenerGrabacion() {
  grabando = false;
  document.getElementById('chat-voz')?.classList.remove('grabando');
  reconocimiento?.stop();
}
