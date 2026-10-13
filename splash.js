// splash.js — Pantalla de presentación que se desvanece
import { CONFIG } from '../config/config.js';

export function iniciarSplash(callback) {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');

  if (!splash || !app) {
    callback?.();
    return;
  }

  setTimeout(() => {
    splash.classList.add('desvaneciendo');
    setTimeout(() => {
      splash.classList.remove('activa', 'desvaneciendo');
      splash.classList.add('oculta');
      app.classList.remove('oculta');
      app.classList.add('visible');
      callback?.();
    }, 500);
  }, CONFIG.DURACION_SPLASH_MS);
}
