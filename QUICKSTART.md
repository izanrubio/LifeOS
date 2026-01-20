# Inicio Rápido - LifeOS

## 🚀 5 pasos para empezar

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd LifeOS
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click "New Project"
3. Rellena el nombre y contraseña
4. Espera que se cree (~2 minutos)

### 3. Ejecutar SQL

1. En Supabase, ve a **SQL Editor**
2. Click **New Query**
3. Copia y pega el contenido de `supabase/schema.sql`
4. Click **Run** (Ctrl/Cmd + Enter)

### 4. Configurar variables de entorno

1. En Supabase, ve a **Settings > API**
2. Copia:
   - **Project URL**
   - **anon public key**

3. Crea archivo `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 5. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## ✅ Verificación

1. Regístrate con un email
2. Marca tu energía del día
3. Añade una tarea
4. Complétala
5. Escribe una nota

Si todo funciona, ¡estás listo!

---

## 📖 Más información

- **Problemas?** → Ver `CHECKLIST.md`
- **Detalles de Supabase?** → Ver `SUPABASE_SETUP.md`
- **Desplegar?** → Ver `DEPLOYMENT.md`
- **Arquitectura?** → Ver `ARCHITECTURE.md`

---

## 💡 Tips

- Las variables de entorno solo se necesitan en **runtime**, no en build
- Si cambias el schema SQL, vuelve a ejecutar el query
- Google OAuth es opcional, solo email/password es suficiente
- El middleware protege automáticamente `/today` y `/history`

---

**¿Listo para organizar tu día?** 🎯
