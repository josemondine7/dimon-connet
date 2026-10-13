-- =====================================================
-- DIMON CONNET — Esquema completo de base de datos
-- Ejecutar esto en: Supabase → SQL Editor → Run
-- =====================================================

-- ===== TABLA: USUARIOS =====
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  usuario TEXT UNIQUE NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  pais TEXT,
  departamento TEXT,
  ciudad TEXT,
  foto_perfil TEXT,
  es_administrador BOOLEAN DEFAULT false,
  creado_el TIMESTAMPTZ DEFAULT now()
);

-- ===== TABLA: PUBLICACIONES =====
CREATE TABLE IF NOT EXISTS publicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  autor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT CHECK (tipo IN ('ofrezco', 'busco')) DEFAULT 'ofrezco',
  categoria TEXT,
  ciudad TEXT,
  departamento TEXT,
  precio_sugerido TEXT,
  imagen_url TEXT,
  video_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_el TIMESTAMPTZ DEFAULT now()
);

-- ===== TABLA: CONVERSACIONES (chat entre usuarios) =====
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_a UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  usuario_b UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  publicacion_id UUID REFERENCES publicaciones(id) ON DELETE SET NULL,
  trato_cerrado BOOLEAN DEFAULT false,
  creado_el TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_a, usuario_b, publicacion_id)
);

-- ===== TABLA: MENSAJES =====
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE NOT NULL,
  remitente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  creado_el TIMESTAMPTZ DEFAULT now()
);

-- ===== TABLA: TRANSACCIONES (comisiones) =====
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversacion_id UUID REFERENCES conversaciones(id),
  solicitante_id UUID REFERENCES usuarios(id) NOT NULL,
  proveedor_id UUID REFERENCES usuarios(id) NOT NULL,
  valor_servicio NUMERIC NOT NULL,
  comision_solicitante NUMERIC NOT NULL,
  comision_proveedor NUMERIC NOT NULL,
  metodo_pago TEXT,
  estado TEXT DEFAULT 'pendiente',
  creado_el TIMESTAMPTZ DEFAULT now()
);

-- ===== TABLA: REPORTES (contenido inapropiado) =====
CREATE TABLE IF NOT EXISTS reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reportado_por UUID REFERENCES usuarios(id) NOT NULL,
  publicacion_id UUID REFERENCES publicaciones(id),
  mensaje_id UUID REFERENCES mensajes(id),
  motivo TEXT,
  revisado BOOLEAN DEFAULT false,
  creado_el TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) — Seguridad de datos
-- =====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

-- USUARIOS: cada uno ve/edita su perfil; todos ven datos básicos de los demás
CREATE POLICY "Perfiles publicos" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Editar perfil propio" ON usuarios FOR ALL USING (auth.uid() = id);

-- PUBLICACIONES: cualquiera ve las activas; solo el autor edita
CREATE POLICY "Publicaciones visibles" ON publicaciones FOR SELECT USING (activo = true);
CREATE POLICY "Autor gestiona sus publicaciones" ON publicaciones FOR ALL USING (auth.uid() = autor_id);

-- CONVERSACIONES: solo los participantes
CREATE POLICY "Ver mis conversaciones" ON conversaciones FOR SELECT 
  USING (auth.uid() = usuario_a OR auth.uid() = usuario_b);
CREATE POLICY "Crear conversacion" ON conversaciones FOR INSERT 
  WITH CHECK (auth.uid() = usuario_a OR auth.uid() = usuario_b);

-- MENSAJES: solo los participantes de la conversación
CREATE POLICY "Ver mensajes de mi chat" ON mensajes FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversaciones c WHERE c.id = conversacion_id 
    AND (c.usuario_a = auth.uid() OR c.usuario_b = auth.uid()))
);
CREATE POLICY "Enviar mensajes en mi chat" ON mensajes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversaciones c WHERE c.id = conversacion_id 
    AND (c.usuario_a = auth.uid() OR c.usuario_b = auth.uid()))
  AND remitente_id = auth.uid()
);

-- TRANSACCIONES: solo los involucrados
CREATE POLICY "Ver mis transacciones" ON transacciones FOR SELECT 
  USING (auth.uid() = solicitante_id OR auth.uid() = proveedor_id);
CREATE POLICY "Crear transaccion" ON transacciones FOR INSERT 
  WITH CHECK (auth.uid() = solicitante_id OR auth.uid() = proveedor_id);

-- REPORTES: cualquier usuario logueado puede reportar
CREATE POLICY "Crear reporte" ON reportes FOR INSERT WITH CHECK (auth.uid() = reportado_por);

-- =====================================================
-- ÍNDICES para que las búsquedas sean rápidas
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_publicaciones_ciudad ON publicaciones(ciudad);
CREATE INDEX IF NOT EXISTS idx_publicaciones_autor ON publicaciones(autor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_usuarios ON conversaciones(usuario_a, usuario_b);
