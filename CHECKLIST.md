# Checklist de Configuración - LifeOS

Usa esta lista para verificar que todo está configurado correctamente.

## ✅ Pre-requisitos

- [ ] Node.js 18+ instalado
- [ ] npm o yarn instalado
- [ ] Cuenta en Supabase creada
- [ ] Git configurado (para deploy)

---

## ✅ Instalación Local

- [ ] `npm install` ejecutado sin errores
- [ ] Archivo `.env.local` creado
- [ ] Variables de entorno configuradas:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Configuración de Supabase

### Base de datos

- [ ] Proyecto creado en Supabase
- [ ] SQL ejecutado desde `supabase/schema.sql`
- [ ] Tablas creadas:
  - [ ] `daily_entries`
  - [ ] `tasks`
- [ ] RLS (Row Level Security) activado en ambas tablas
- [ ] Políticas RLS creadas (4 por tabla)

### Autenticación

- [ ] Email provider habilitado
- [ ] Google OAuth configurado (opcional)
- [ ] Redirect URLs configuradas

---

## ✅ Desarrollo Local

- [ ] `npm run dev` ejecuta sin errores
- [ ] App abre en `http://localhost:3000`
- [ ] Redirect automático a `/auth/login` funciona
- [ ] Puedes registrarte con email/password
- [ ] Puedes hacer login
- [ ] Redirect a `/today` después de login

---

## ✅ Funcionalidad /today

- [ ] Selector de energía funciona
- [ ] Energy level se guarda
- [ ] Puedes añadir una tarea
- [ ] Puedes completar una tarea
- [ ] Tarea se tacha al completar
- [ ] Puedes eliminar una tarea
- [ ] Límite de 12 tareas funciona
- [ ] Mensaje aparece cuando hay 12 tareas
- [ ] Nota se puede escribir
- [ ] Nota se guarda automáticamente
- [ ] Botón "Salir" funciona

---

## ✅ Funcionalidad /history

- [ ] Puedes acceder a `/history`
- [ ] Aparece mensaje si no hay días anteriores
- [ ] Días anteriores se muestran correctamente
- [ ] Fecha está en español
- [ ] Contador de tareas completadas es correcto
- [ ] Energy level se muestra (si existe)
- [ ] Nota se muestra (si existe)
- [ ] Botón "Volver" funciona

---

## ✅ Seguridad

- [ ] No puedes acceder a `/today` sin login
- [ ] No puedes acceder a `/history` sin login
- [ ] Middleware redirect funciona
- [ ] Solo ves tus propios datos
- [ ] RLS bloquea datos de otros usuarios

---

## ✅ UI/UX

- [ ] Dark mode activo por defecto
- [ ] Colores correctos (background oscuro)
- [ ] Tipografía legible
- [ ] Botones tienen hover states
- [ ] Focus states visibles (accesibilidad)
- [ ] Responsive en mobile
- [ ] No hay scroll horizontal

---

## ✅ Pre-Deploy

- [ ] `npm run build` ejecuta sin errores
- [ ] No hay errores de TypeScript
- [ ] No hay warnings críticos de ESLint
- [ ] `.env.local` está en `.gitignore`
- [ ] Código pusheado a GitHub

---

## ✅ Deploy (Vercel/Netlify)

- [ ] Proyecto importado correctamente
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] URL de producción funciona
- [ ] Autenticación funciona en producción
- [ ] Supabase URL actualizada en Authentication settings

---

## ✅ Post-Deploy

- [ ] Registro de usuario real funciona
- [ ] Login funciona
- [ ] Crear tarea funciona
- [ ] Datos persisten al cerrar y abrir
- [ ] Historial se carga correctamente

---

## 🐛 Troubleshooting Común

### "Invalid API key"
**Solución**: Verifica que usas `anon` key, no `service_role`

### "relation does not exist"
**Solución**: Re-ejecuta `schema.sql` en Supabase

### No puedo hacer login
**Solución**: Verifica RLS policies en Supabase

### Google OAuth no funciona
**Solución**: Verifica Redirect URIs en Google Cloud Console

### Datos no se guardan
**Solución**: Abre la consola del navegador, busca errores de RLS

### Build falla en Vercel
**Solución**: Verifica que variables de entorno están configuradas

---

## 📝 Notas Finales

- Este checklist asume configuración estándar
- Si modificaste algo del código, ajusta según necesites
- En caso de duda, consulta `ARCHITECTURE.md` o `SUPABASE_SETUP.md`

---

## ✨ Todo listo

Si todos los checkboxes están marcados, ¡LifeOS está listo para usar!

Recuerda: el objetivo es organizar **solo el día actual** en **menos de 2 minutos**.
