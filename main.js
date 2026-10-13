// main.js — Punto de entrada de la aplicación
import './style.css';
import { iniciarSplash } from './components/splash.js';
import { iniciarFeed } from './components/feed.js';
import { iniciarDimon } from './components/dimon-chat.js';
import { iniciarAuth } from './auth/auth.js';
import { iniciarPerfil } from './components/perfil.js';

// Cuando la página carga → mostrar splash, luego el feed
document.addEventListener('DOMContentLoaded', () => {
  iniciarSplash(() => {
    // Después del splash, arrancar todo
    iniciarFeed();
    iniciarDimon();
    iniciarAuth();
    iniciarPerfil();
  });
});
