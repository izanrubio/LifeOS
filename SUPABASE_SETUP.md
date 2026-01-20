# Configuración de Supabase para LifeOS

## 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Rellena:
   - **Name**: LifeOS
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana a ti
5. Click en "Create new project"
6. Espera 1-2 minutos mientras se crea el proyecto

## 2. Configurar el esquema de base de datos

1. En el panel izquierdo, click en **SQL Editor**
2. Click en **New Query**
3. Copia y pega el contenido completo del archivo `supabase/schema.sql`
4. Click en **Run** (o presiona Ctrl/Cmd + Enter)
5. Deberías ver el mensaje "Success. No rows returned"

## 3. Configurar autenticación

### Email/Password (obligatorio)

1. Ve a **Authentication > Providers**
2. Asegúrate que **Email** está habilitado (por defecto lo está)

### Google OAuth (opcional)

1. Ve a **Authentication > Providers**
2. Scroll hasta encontrar **Google**
3. Click en **Enable**
4. Necesitarás configurar OAuth en Google Cloud Console:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea un proyecto nuevo
   - Ve a **APIs & Services > Credentials**
   - Crea un **OAuth 2.0 Client ID**
   - Añade `https://<tu-proyecto>.supabase.co/auth/v1/callback` como Redirect URI
   - Copia Client ID y Client Secret
5. Pega las credenciales en Supabase
6. Click en **Save**

## 4. Obtener las claves de API

1. Ve a **Project Settings** (icono de engranaje en el panel izquierdo)
2. Click en **API** en la navegación lateral
3. Copia:
   - **Project URL** (empieza con `https://`)
   - **anon public** key (la clave más larga)

## 5. Configurar variables de entorno

1. En tu proyecto, copia `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` y pega tus claves:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
   ```

## 6. Verificar configuración

1. Asegúrate que Row Level Security (RLS) está activado:
   - Ve a **Table Editor**
   - Verifica que `daily_entries` y `tasks` tienen un icono de candado (🔒)
   
2. Verifica las políticas RLS:
   - Click en una tabla
   - Ve a la pestaña **Policies**
   - Deberías ver 4 políticas por tabla (select, insert, update, delete)

## 7. ¡Listo!

Ahora puedes ejecutar:
```bash
npm run dev
```

Y abrir [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Error: "Invalid API key"
- Verifica que copiaste la clave `anon` (no la clave `service_role`)
- Asegúrate de no tener espacios al inicio o final

### Error: "relation does not exist"
- Ejecuta nuevamente el archivo `schema.sql`
- Verifica que no hubo errores en la consola SQL

### No puedo hacer login
- Verifica que RLS está activado
- Comprueba que las políticas están creadas
- Revisa la consola del navegador para ver errores específicos

### Google OAuth no funciona
- Verifica que agregaste el Redirect URI correcto
- Asegúrate que el proyecto está en Google Cloud Console
- Comprueba que copiaste Client ID y Secret correctamente
