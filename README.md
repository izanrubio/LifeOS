# LifeOS

> **¿Qué cabe hoy, de forma realista?**

Una aplicación web personal para organizar solo el día actual.  
No planifica semanas. No optimiza productividad. No motiva. No gamifica.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar
npm install

# 2. Configurar Supabase (ver SUPABASE_SETUP.md)
# - Crear proyecto en supabase.com
# - Ejecutar supabase/schema.sql
# - Copiar credenciales

# 3. Crear .env.local
cp .env.local.example .env.local
# (Editar con tus credenciales)

# 4. Ejecutar
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

📖 **[Guía completa de 5 pasos →](QUICKSTART.md)**

---

## 📁 Estructura del Proyecto

```
app/
  auth/login/    → Autenticación
  today/         → Vista principal (energía + tareas + nota)
  history/       → Días anteriores

lib/
  supabase.ts    → Cliente Supabase + tipos

supabase/
  schema.sql     → Base de datos + RLS
```

---

## 🎯 Características

### `/today` (Vista Principal)
- **Energía**: Selector de 3 niveles (low/medium/high)
- **Tareas**: Máximo 12 por día, completar con checkbox
- **Nota**: Autosave automático

### `/history`
- Lista de días anteriores
- Tareas completadas por día
- Sin gráficas ni estadísticas

### `/auth/login`
- Email + password
- Google OAuth (opcional)

---

## 🛠️ Stack Técnico

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Diseño**: Dark mode first, minimalista

---

## 📊 Base de Datos

### Tabla: `daily_entries`
- Un registro por día y usuario
- Campos: `energy_level`, `note`
- RLS activado

### Tabla: `tasks`
- Tareas asociadas a un día
- Máximo 12 tareas por día
- Campos: `title`, `completed`
- RLS activado

---

## 🎨 Principios de Diseño

1. **El día es la única unidad temporal**
2. **Menos opciones = menos fricción mental**
3. **UX silenciosa, sin juicios**
4. **Uso diario < 2 minutos**

---

## 🚫 Lo que NO es LifeOS

- ❌ Un planificador semanal
- ❌ Un optimizador de productividad
- ❌ Una app de hábitos
- ❌ Un sistema de gamificación
- ❌ Una herramienta colaborativa

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[INDEX.md](INDEX.md)** | Índice de toda la documentación |
| **[QUICKSTART.md](QUICKSTART.md)** | 5 pasos para empezar |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Detalles técnicos completos |
| **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Configuración de Supabase |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guías de despliegue |
| **[CHECKLIST.md](CHECKLIST.md)** | Lista de verificación |

---

## ⚙️ Comandos

```bash
npm run dev    # Desarrollo (http://localhost:3000)
npm run build  # Build de producción
npm start      # Ejecutar build
npm run lint   # Linting
```

---

## 🌐 Despliegue

**Recomendado**: [Vercel](https://vercel.com)

1. Push a GitHub
2. Importar en Vercel
3. Configurar variables de entorno
4. Deploy automático

📖 **[Guía completa de despliegue →](DEPLOYMENT.md)**

---

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- Middleware protege rutas automáticamente
- Session cookies HTTP-only
- Solo `anon` key expuesta al cliente

---

## ✅ Verificación

Después de configurar, verifica que:

- [ ] Puedes registrarte
- [ ] Puedes marcar energía
- [ ] Puedes añadir tareas
- [ ] Puedes completar tareas
- [ ] La nota se guarda automáticamente
- [ ] Puedes ver el historial

📖 **[Checklist completo →](CHECKLIST.md)**

---

## 🆘 Troubleshooting

### "Invalid API key"
→ Verifica que usas `anon` key, no `service_role`

### "relation does not exist"
→ Re-ejecuta `supabase/schema.sql`

### No puedo hacer login
→ Verifica políticas RLS en Supabase

📖 **[Más soluciones →](SUPABASE_SETUP.md#troubleshooting)**

---

## 📝 Filosofía

> LifeOS es honesto, usable y rápido de abrir cada mañana.

No intenta ser más de lo que es: una herramienta para responder **"¿Qué cabe hoy?"**

---

## 📄 Licencia

MIT

---

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vercel](https://vercel.com)

---

**¿Listo para empezar?** → [QUICKSTART.md](QUICKSTART.md)