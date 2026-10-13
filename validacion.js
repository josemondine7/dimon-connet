// validacion.js — Limpieza y validación de datos (seguridad)

export const Validador = {
  // Limpiar texto para evitar código malicioso (XSS)
  limpiarTexto(texto) {
    if (!texto) return '';
    return String(texto)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  },

  validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  },

  validarPublicacion(datos) {
    const errores = [];
    if (!datos.titulo || datos.titulo.length < 5) errores.push('El título debe tener al menos 5 caracteres');
    if (datos.titulo?.length > 100) errores.push('El título no puede superar los 100 caracteres');
    if (datos.descripcion?.length > 2000) errores.push('La descripción es muy larga');
    if (!datos.ciudad) errores.push('Falta la ciudad');
    return { valido: errores.length === 0, errores };
  },

  validarMensaje(texto) {
    if (!texto || texto.trim().length === 0) return { valido: false, mensaje: 'Mensaje vacío' };
    if (texto.length > 1000) return { valido: false, mensaje: 'Mensaje muy largo' };
    return { valido: true };
  },

  // Detectar contenido peligroso
  tieneContenidoPeligroso(texto) {
    const peligroso = ['<script', 'javascript:', 'eval(', 'document.cookie', 'window.location'];
    const t = String(texto).toLowerCase();
    return peligroso.some(p => t.includes(p));
  }
};
