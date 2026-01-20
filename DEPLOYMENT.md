# Despliegue de LifeOS

## Opción 1: Vercel (Recomendado)

Vercel es la plataforma oficial de Next.js y ofrece el mejor soporte.

### Pasos:

1. **Push tu código a GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Import Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar Variables de Entorno**
   - En el panel de configuración, ve a "Environment Variables"
   - Añade:
     ```
     NEXT_PUBLIC_SUPABASE_URL=tu-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
     ```

4. **Deploy**
   - Click en "Deploy"
   - Espera 1-2 minutos
   - ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

### Despliegues automáticos
- Cada push a `main` desplegará automáticamente
- Los pull requests crean previews automáticas

---

## Opción 2: Netlify

### Pasos:

1. **Push a GitHub** (igual que Vercel)

2. **Conectar con Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Click en "Add new site" > "Import an existing project"
   - Conecta con GitHub y selecciona tu repo

3. **Configurar Build**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Variables de Entorno**
   - En "Site settings" > "Environment variables"
   - Añade las mismas variables que en Vercel

5. **Deploy**

---

## Opción 3: Railway

### Pasos:

1. **Push a GitHub**

2. **Conectar con Railway**
   - Ve a [railway.app](https://railway.app)
   - Click en "New Project" > "Deploy from GitHub repo"

3. **Variables de Entorno**
   - Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy automático**

---

## Configuración Post-Despliegue en Supabase

Una vez desplegado, necesitas actualizar los URLs permitidos en Supabase:

1. Ve a tu proyecto en Supabase
2. **Authentication > URL Configuration**
3. Añade tu URL de producción a:
   - **Site URL**: `https://tu-app.vercel.app`
   - **Redirect URLs**: `https://tu-app.vercel.app/**`

Esto es necesario para que OAuth y redirects funcionen correctamente.

---

## Verificación

Después del despliegue:

1. Visita tu URL de producción
2. Regístrate con un email
3. Verifica que puedes:
   - Crear tareas
   - Marcar energía
   - Escribir notas
   - Ver historial

---

## Troubleshooting

### Error 500 al hacer login
- Verifica que las variables de entorno están configuradas
- Comprueba que añadiste la URL en Supabase

### "Failed to fetch"
- Verifica tu Supabase URL
- Comprueba que RLS está configurado correctamente

### Google OAuth no funciona
- Añade la URL de producción en Google Cloud Console
- Actualiza los Redirect URIs en Supabase

---

## Monitorización

En Vercel/Netlify podrás ver:
- Logs de errores
- Analytics de rendimiento
- Uso de bandwidth

En Supabase Dashboard:
- Número de usuarios
- Queries ejecutadas
- Storage usado

---

## Costos

- **Vercel**: Gratis para proyectos personales
- **Netlify**: Gratis para proyectos personales
- **Railway**: $5/mes (con créditos gratis iniciales)
- **Supabase**: Gratis hasta 500MB DB y 50k usuarios MAU

LifeOS debería estar cómodamente en el tier gratuito de todas las plataformas.
