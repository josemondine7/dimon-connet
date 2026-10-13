// auth.js — Registro, inicio de sesión y recuperación de contraseña
import { supabase } from '../api/supabase.js';
import { Validador } from '../utils/validacion.js';

let modoRegistro = true; // true = registrar, false = iniciar sesión

export function iniciarAuth() {
  const modal = document.getElementById('modal-auth');
  const cerrar = document.getElementById('auth-cerrar');
  const form = document.getElementById('auth-formulario');
  const cambiar = document.getElementById('auth-cambiar-boton');
  const cambiarTexto = document.getElementById('auth-cambiar-texto');
  const titulo = document.getElementById('auth-titulo');
  const boton = document.getElementById('auth-boton');

  // Abrir modal cuando el usuario toca "mi perfil" sin sesión
  document.getElementById('mi-perfil')?.addEventListener('click', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.hash = '#perfil';
    } else {
      modal?.classList.remove('oculta');
    }
  });

  cerrar?.addEventListener('click', () => modal?.classList.add('oculta'));

  // Cambiar entre registro y login
  cambiar?.addEventListener('click', e => {
    e.preventDefault();
    modoRegistro = !modoRegistro;
    if (titulo) titulo.textContent = modoRegistro ? 'Crear cuenta' : 'Iniciar sesión';
    if (boton) boton.textContent = modoRegistro ? 'Crear cuenta' : 'Entrar';
    if (cambiarTexto) cambiarTexto.textContent = modoRegistro ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?';
    if (cambiar) cambiar.textContent = modoRegistro ? 'Iniciar sesión' : 'Crear cuenta';
    // Ocultar campos extra en modo login
    ['auth-usuario', 'auth-pais', 'auth-departamento', 'auth-ciudad'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = modoRegistro ? 'block' : 'none';
    });
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const errorEl = document.getElementById('auth-error');
    errorEl?.classList.add('oculta');

    const correo = document.getElementById('auth-correo')?.value.trim();
    const clave = document.getElementById('auth-clave')?.value;

    if (!Validador.validarCorreo(correo)) {
      mostrarError('Escribí un correo válido');
      return;
    }
    if (!clave || clave.length < 8) {
      mostrarError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (modoRegistro) {
      await registrar(correo, clave);
    } else {
      await iniciarSesion(correo, clave);
    }
  });

  function mostrarError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('oculta');
    }
  }
}

async function registrar(correo, clave) {
  const usuario = document.getElementById('auth-usuario')?.value.trim();
  const pais = document.getElementById('auth-pais')?.value.trim();
  const departamento = document.getElementById('auth-departamento')?.value.trim();
  const ciudad = document.getElementById('auth-ciudad')?.value.trim();

  if (!usuario || usuario.length < 3) {
    return mostrarAuthError('El nombre de usuario debe tener al menos 3 caracteres');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: clave,
      options: { data: { nombre_usuario: usuario } }
    });
    if (error) throw error;

    // Guardar datos extra en la tabla usuarios
    if (data.user) {
      await supabase.from('usuarios').insert({
        id: data.user.id,
        usuario, correo, pais, departamento, ciudad,
        creado_el: new Date().toISOString()
      });
    }

    cerrarModal();
    alert('¡Cuenta creada! Revisá tu correo para confirmarla.');
  } catch (error) {
    mostrarAuthError(error.message);
  }
}

async function iniciarSesion(correo, clave) {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
    if (error) throw error;
    cerrarModal();
    window.location.reload();
  } catch (error) {
    mostrarAuthError('Correo o contraseña incorrectos');
  }
}

function mostrarAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.classList.remove('oculta'); }
}

function cerrarModal() {
  document.getElementById('modal-auth')?.classList.add('oculta');
}
