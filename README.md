# 🚀 Dimon Connet — Servicios Autónomos

Plataforma web donde personas ofrecen y contratan servicios de todo tipo, sin certificados obligatorios, basada en la confianza mutua.

---

## 📋 LO QUE TENÉS QUE HACER (paso a paso)

### PASO 1 — Crear cuentas (gratis)
1. **Supabase** → https://supabase.com → creá un proyecto
2. **Groq** → https://console.groq.com → creá una API Key
3. **GitHub** → https://github.com → creá tu cuenta
4. **Render** → https://render.com → conectá con GitHub

### PASO 2 — Configurar la base de datos
1. Entrá a Supabase → tu proyecto → **SQL Editor**
2. Copiá todo el contenido de `sql/schema.sql` y pegalo → **Run**
3. Andá a **Project Settings → API** → copiá la `Project URL` y la `anon public` key

### PASO 3 — Subir el código a GitHub
1. Creá un repositorio nuevo en GitHub (ej: `dimon-connet`)
2. Subí todos estos archivos (menos `.env` y `node_modules`)

### PASO 4 — Publicar en Render
1. Render → **New → Web Service** → elegí tu repositorio de GitHub
2. Configuración:
   - **Name:** `dimon-connet-servicios-autonomos`
   - **Region:** `São Paulo` (la más cercana a Uruguay)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
3. En **Environment** agregá estas variables:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anon de Supabase
   - `GROQ_API_KEY` → tu clave de Groq
   - `NODE_ENV` → `production`
   - `PORT` → `3001`
4. Tocá **Create Web Service** → esperá 3-5 minutos
5. ✅ Tu plataforma está en internet: `https://dimon-connet-servicios-autonomos.onrender.com`

### PASO 5 (opcional) — Dominio propio
- Comprá un dominio (ej: dimonconnet.com)
- En Render → Settings → Custom Domains → agregalo
- En tu registrador de dominios, configurá el DNS apuntando a Render

---

## 🗂 ESTRUCTURA DEL PROYECTO

```
dimon-connet/
├── index.html              → Pantalla principal (splash + feed + Dimon)
├── server.js               → Servidor Express (protege clave de Groq)
├── package.json            → Dependencias del proyecto
├── vite.config.js          → Configuración de Vite
├── .env.example            → Modelo de variables de entorno
├── .gitignore              → Qué NO subir a GitHub
├── sql/schema.sql          → Base de datos + seguridad (ejecutar en Supabase)
├── legal/                  → Páginas legales (términos, privacidad, pagos)
├── public/                 → Íconos y archivos estáticos
└── src/
    ├── main.js             → Punto de entrada
    ├── style.css           → Todos los estilos
    ├── config/config.js    → Configuración central
    ├── api/supabase.js     → Conexión con base de datos
    ├── auth/auth.js        → Registro, login, recuperación de clave
    ├── utils/validacion.js → Seguridad (limpieza de datos)
    ├── utils/comisiones.js → Cálculo de comisiones 15%+15%
    └── components/
        ├── splash.js       → Pantalla de presentación
        ├── feed.js         → Flujo deslizable vertical
        ├── dimon-chat.js   → Chat con Dimon (texto + voz)
        └── perfil.js       → Perfil del usuario
```

---

## 💰 COMISIONES

- **15%** quien solicita el servicio
- **15%** quien brinda el servicio
- El valor del servicio va **completo** entre las partes (no pasa por la plataforma)
- No se paga nada por navegar, publicar o chatear — solo al cerrar un trato

---

## 🔒 SEGURIDAD

- Contraseñas encriptadas (Supabase Auth)
- Row Level Security: cada usuario ve solo lo que le corresponde
- Validación de datos antes de guardar (anti XSS)
- Clave de Groq protegida en el servidor (no visible en el navegador)
- `.env` nunca se sube a GitHub

---

## 📱 CÓMO PROBARLO EN TU CASA

```bash
npm install
npm run dev
```
Abrí `http://localhost:5173` en tu navegador.

---

## 📄 CORREO DE CONTACTO

dimon.connet@gmail.com *(configurar cuando tengas el dominio)*
