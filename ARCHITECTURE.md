# Arquitectura de LifeOS

## Visión General

LifeOS es una aplicación minimalista que sigue estrictamente el principio de **"menos es más"**.

### Principios Arquitectónicos

1. **Simplicidad sobre funcionalidad**
2. **Un día a la vez**
3. **Cero fricción mental**
4. **Dark mode first**

---

## Stack Tecnológico

### Frontend
- **Next.js 15**: App Router para routing moderno
- **React 19**: Componentes client-side
- **TypeScript**: Type safety estricto
- **TailwindCSS**: Utilidades CSS dark mode

### Backend
- **Supabase Auth**: Autenticación segura
- **PostgreSQL**: Base de datos relacional
- **RLS (Row Level Security)**: Seguridad a nivel de fila

---

## Estructura del Proyecto

```
lifeos/
├── app/                    # Next.js App Router
│   ├── auth/
│   │   └── login/         # Autenticación
│   │       └── page.tsx   # Vista de login/registro
│   ├── today/             # Vista principal
│   │   └── page.tsx       # Gestión del día actual
│   ├── history/           # Historial
│   │   └── page.tsx       # Días anteriores
│   ├── layout.tsx         # Layout raíz (dark mode)
│   ├── page.tsx           # Redirect a /today
│   └── globals.css        # Estilos globales
│
├── lib/
│   └── supabase.ts        # Cliente + tipos TypeScript
│
├── supabase/
│   └── schema.sql         # DDL + RLS policies
│
├── middleware.ts          # Protección de rutas
├── tailwind.config.ts     # Colores dark mode
└── tsconfig.json          # Config TypeScript strict
```

---

## Modelo de Datos

### Tabla: `daily_entries`

Representa **un día** para un usuario.

```sql
id           uuid      PK
user_id      uuid      FK → auth.users
date         date      UNIQUE con user_id
energy_level enum      low | medium | high | null
note         text      null
created_at   timestamp
```

**Constraints:**
- Un usuario solo puede tener una entrada por día
- La fecha NO se puede modificar (es inmutable)

### Tabla: `tasks`

Representa tareas asociadas a un día específico.

```sql
id         uuid      PK
user_id    uuid      FK → auth.users
date       date      
title      text      NOT NULL
completed  boolean   DEFAULT false
created_at timestamp
```

**Constraints:**
- Máximo 12 tareas por día (validado en UI)
- Sin duración, sin prioridades, sin categorías

### Políticas RLS

Todas las tablas tienen 4 políticas:
- **SELECT**: Users can view their own entries
- **INSERT**: Users can insert their own entries
- **UPDATE**: Users can update their own entries
- **DELETE**: Users can delete their own entries

Cada política verifica: `auth.uid() = user_id`

---

## Flujo de Datos

### Autenticación

```
Usuario → /auth/login → Supabase Auth
                      ↓
                  Session creada
                      ↓
                  Cookie guardada
                      ↓
               Redirect a /today
```

### Carga de datos del día

```
/today → checkUser() → loadTodayData()
                           ↓
            ¿Existe daily_entry para hoy?
                  /              \
               SÍ                 NO
               ↓                  ↓
          Cargar entrada      Crear entrada
                  \              /
                   \            /
                    ↓          ↓
              Cargar tareas del día
                        ↓
                Renderizar UI
```

### Guardar cambios

**Energía**: Update inmediato al click

**Tareas**: 
- Añadir: Enter → Insert
- Completar: Checkbox → Update
- Eliminar: Click X → Delete

**Nota**: Autosave en cada onChange (debounce opcional)

---

## Componentes UI

### `/auth/login`
**Responsabilidad**: Autenticación

**Estado:**
- `isLogin`: boolean (toggle login/registro)
- `email`: string
- `password`: string
- `loading`: boolean
- `error`: string | null

**Acciones:**
- `handleSubmit()`: Email/password auth
- `handleGoogleLogin()`: OAuth Google
- Toggle entre login/registro

---

### `/today`
**Responsabilidad**: Vista principal del día

**Estado:**
- `user`: User | null
- `dailyEntry`: DailyEntry | null
- `tasks`: Task[]
- `newTaskTitle`: string
- `note`: string

**Acciones:**
- `updateEnergyLevel(level)`: Update energy
- `updateNote(value)`: Autosave note
- `addTask()`: Insert nueva tarea
- `toggleTask(task)`: Toggle completed
- `deleteTask(id)`: Borrar tarea
- `handleLogout()`: Sign out

**Validaciones:**
- Máximo 12 tareas
- Mensaje suave si se alcanza el límite

---

### `/history`
**Responsabilidad**: Mostrar días anteriores

**Estado:**
- `user`: User | null
- `days`: DayWithTasks[]

**Datos mostrados:**
- Fecha formateada (día completo en español)
- Nivel de energía (si existe)
- Tareas completadas / total
- Nota del día

**Restricciones:**
- Sin gráficas
- Sin estadísticas
- Sin comparativas
- Solo datos crudos

---

## Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS **activado**.

Las políticas garantizan que:
- Un usuario solo ve sus propios datos
- Un usuario no puede modificar datos de otros
- Las queries son automáticamente filtradas por Supabase

### Autenticación

- Middleware protege rutas automáticamente
- Session almacenada en cookies HTTP-only
- Tokens JWT manejados por Supabase

### Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL      # URL pública del proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY # Clave pública (anon)
```

**Nota**: La clave `service_role` NUNCA debe exponerse al cliente.

---

## Estilo Visual

### Paleta de Colores

```js
background: '#0a0a0a'     // Negro puro
card: '#1a1a1a'           // Gris muy oscuro
border: '#2a2a2a'         // Bordes sutiles
accent: '#4a7c59'         // Verde apagado
accent-hover: '#5a8c69'   // Verde hover
text: '#e5e5e5'           // Texto principal
text-muted: '#a0a0a0'     // Texto secundario
```

### Tipografía

- Sans-serif por defecto (system font)
- Jerarquía clara: h1 (2xl) → h2 (sm muted)
- Antialiased para mejor legibilidad

### Interacciones

- Transiciones suaves (transition-colors)
- Hover states sutiles
- Sin animaciones innecesarias
- Focus states claros (border-accent)

---

## Reglas Estrictas

### ❌ NO Implementar

- Planificación semanal/mensual
- Hábitos recurrentes
- Notificaciones push
- Gamificación (puntos, rachas, etc.)
- Colaboración multi-usuario
- Feed social
- IA generativa
- Analytics complejos
- Gráficas de productividad
- Optimizaciones automáticas

### ✅ Permitido

- Energía del día (low/medium/high)
- Tareas simples (máx 12)
- Nota libre del día
- Historial de días pasados
- Autenticación básica
- Dark mode

---

## Métricas (NO visibles en UI)

La **única métrica** que importa:

```
% de días con al menos 1 tarea completada
```

Esta métrica:
- NO se muestra al usuario
- Solo sirve para evaluar si el producto funciona
- Se calcula en backend/analytics

**Filosofía**: Si el usuario abre la app y completa al menos una tarea, el día fue exitoso.

---

## Flujo de Usuario Ideal

```
1. Abrir app (< 2 segundos de carga)
2. Marcar energía (1 click)
3. Ver tareas (scan rápido)
4. Completar al menos 1 tarea (1 click)
5. [Opcional] Añadir tarea nueva (Enter)
6. [Opcional] Escribir nota corta
7. Cerrar app

Tiempo total: < 2 minutos
```

---

## Testing (Mínimo)

### Casos críticos a verificar:

1. **Autenticación**
   - Login con email/password
   - Registro nuevo usuario
   - Logout
   - Redirect automático si no hay sesión

2. **CRUD de tareas**
   - Crear tarea
   - Completar tarea
   - Eliminar tarea
   - Límite de 12 tareas

3. **Persistencia**
   - Energy level se guarda
   - Nota se guarda (autosave)
   - Tareas persisten al recargar

4. **Historial**
   - Muestra días anteriores
   - No muestra día actual
   - Cuenta tareas correctamente

---

## Escalabilidad

### Límites esperados (tier gratuito)

- **Usuarios**: ~500 usuarios activos mensuales
- **DB**: 500MB (suficiente para años de datos)
- **Queries**: ~1M/mes (Supabase free tier)

### Optimizaciones innecesarias

LifeOS **intencionalmente** NO optimiza:
- Cache agresivo
- Lazy loading
- Code splitting avanzado
- Server-side rendering
- CDN para assets

**Por qué:** La app es tan simple que estas optimizaciones añaden complejidad sin beneficio real.

---

## Mantenimiento

### Actualizaciones esperadas

- Parches de seguridad de Next.js/React
- Actualizaciones de Supabase SDK
- Fixes de bugs críticos

### Actualizaciones NO esperadas

- Nuevas features
- Rediseños visuales
- Integraciones con terceros
- Exportación de datos complejos

**Filosofía**: LifeOS está "terminado" desde el día 1. No crece, solo se mantiene.

---

## Conclusión

LifeOS es deliberadamente limitado.

Cada decisión arquitectónica refuerza el principio central:

> "¿Qué cabe hoy, de forma realista?"

No es un sistema de productividad.
Es una herramienta honesta para organizar un solo día.
