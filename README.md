# Estacionamientos El Roble - Sistema de Gestión de Estacionamiento

Sistema profesional de gestión de estacionamiento con interfaz móvil para trabajadores y panel administrativo de escritorio.

## 🚀 Características

### Interfaz Móvil (Trabajadores)
- Búsqueda por RUT para verificar autorización
- Tarjeta de credencial vertical con:
  - Foto (icono por defecto)
  - Nombre completo
  - Cargo
  - RUT
  - Lista de vehículos (PPU)
  - Estado de autorización (visual)

### Panel Administrativo (Escritorio)
- Protegido con contraseña: `Zulu2025`
- Registro de personal nuevo
- Gestión de vehículos por persona
- Toggle de estado: Autorizado / No Autorizado
- Eliminación de personal y vehículos
- Interfaz profesional y moderna

## 📋 Requisitos

- Cuenta de Supabase (gratuita)
- Navegador web moderno
- Servidor web local o hosting estático

## ⚙️ Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice

### 2. Crear Tablas en Supabase

En el SQL Editor de Supabase, ejecuta el siguiente script:

```sql
-- Tabla de Personal
CREATE TABLE personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    cargo TEXT NOT NULL,
    photo_url TEXT,
    estado TEXT NOT NULL CHECK (estado IN ('Autorizado', 'No Autorizado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Vehículos
CREATE TABLE vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    ppu TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_personnel_rut ON personnel(rut);
CREATE INDEX idx_vehicles_personnel ON vehicles(personnel_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para aplicación estática)
CREATE POLICY "Enable read access for all users" ON personnel
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON personnel
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON personnel
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON personnel
    FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON vehicles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON vehicles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON vehicles
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON vehicles
    FOR DELETE USING (true);
```

### 3. Configurar Credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL**
   - **anon/public key**

3. Edita el archivo `config.js` y reemplaza:

```javascript
const SUPABASE_CONFIG = {
  url: 'TU_URL_DE_SUPABASE_AQUI',
  anonKey: 'TU_ANON_KEY_AQUI'
};
```

### 4. Ejecutar la Aplicación

#### Opción 1: Servidor Local Simple

```bash
# Con Python 3
python3 -m http.server 8000

# Con Node.js (instala http-server primero)
npx http-server -p 8000
```

Luego abre: `http://localhost:8000`

#### Opción 2: Hosting Estático

Sube los archivos a:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## 📱 Uso

### Trabajadores (Móvil)

1. Abre la aplicación en tu móvil
2. Ingresa tu RUT (formato: 12345678-9)
3. Presiona "Buscar"
4. Verifica tu estado de autorización

### Administradores (PC)

1. Abre la aplicación en un navegador de escritorio
2. Ingresa la contraseña: `Zulu2025`
3. Registra nuevo personal con sus datos
4. Gestiona vehículos por cada persona
5. Cambia estados de autorización según necesidad

## 🎨 Diseño

- **Mobile-First**: Optimizado para dispositivos móviles
- **Responsive**: Se adapta a cualquier tamaño de pantalla
- **Profesional**: Diseño corporativo moderno
- **Accesible**: Colores claros y contrastantes
- **Animaciones**: Transiciones suaves y micro-interacciones

## 🔒 Seguridad

> **⚠️ IMPORTANTE**: Esta aplicación usa autenticación del lado del cliente para simplicidad. Para producción, considera:
> - Implementar autenticación real con Supabase Auth
> - Configurar RLS más restrictivo
> - Usar variables de entorno para credenciales
> - Implementar rate limiting

## 📄 Estructura de Archivos

```
ESTACIONA/
├── index.html      # Estructura HTML principal
├── styles.css      # Estilos profesionales
├── app.js          # Lógica de la aplicación
├── config.js       # Configuración de Supabase
└── README.md       # Esta documentación
```

## 🆘 Solución de Problemas

### "Base de datos no configurada"
- Verifica que hayas actualizado `config.js` con tus credenciales
- Asegúrate de que la URL y la key sean correctas

### "Error al registrar personal"
- Verifica que las tablas estén creadas en Supabase
- Revisa que las políticas RLS estén habilitadas
- Comprueba la consola del navegador para más detalles

### No se muestran los datos
- Verifica la conexión a internet
- Revisa la consola del navegador (F12)
- Asegúrate de que Supabase esté activo

## 📞 Soporte

Para problemas o preguntas, revisa:
- [Documentación de Supabase](https://supabase.com/docs)
- Consola del navegador (F12) para errores
- SQL Editor en Supabase para verificar datos

---

**Estacionamientos El Roble** - Sistema de Gestión Profesional
