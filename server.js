// server.js — Servidor Express para Render
// Sirve la página web y protege la clave de Groq (no se expone al navegador)

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Servir archivos estáticos generados por Vite
app.use(express.static(path.join(__dirname, 'dist')));

// ===== Endpoint: Dimon IA (protege la clave de Groq) =====
app.post('/api/dimon', async (req, res) => {
  try {
    const { mensaje, idioma = 'es' } = req.body;

    if (!mensaje || !process.env.GROQ_API_KEY) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Sos Dimon, el asistente de Dimon Connet, plataforma de servicios autónomos.
Reglas:
- Respondés en el idioma del usuario (detectalo automáticamente).
- Explicás todo en lenguaje simple, sin jerga técnica.
- NUNCA pedís contraseñas, claves ni información privada.
- Explicás que la comisión es 15% de cada parte, independiente del valor del servicio.
- Aclarás que los datos de contacto solo se comparten cuando ambas partes acuerdan.
- Si no sabés algo, decilo honestamente y ofrecés ayuda con lo que sí sabés.
- No procesás pagos ni das asesoramiento legal vinculante.`
          },
          { role: 'user', content: mensaje }
        ],
        max_tokens: 600,
        temperature: 0.6
      })
    });

    const datos = await respuesta.json();
    const texto = datos.choices?.[0]?.message?.content || 'No entendí bien, ¿podrías repetirlo?';

    res.json({ respuesta: texto });
  } catch (error) {
    console.error('Error en Dimon:', error.message);
    res.status(500).json({ error: 'Error interno', respuesta: 'Estoy teniendo problemas para responder. Intentá de nuevo en un momento.' });
  }
});

// Cualquier otra ruta → servir la app (para que funcione el SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Dimon Connet funcionando en el puerto ${PORT}`);
});
