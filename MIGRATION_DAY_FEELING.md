# Migración: Añadir campo day_feeling

Esta migración añade el campo `day_feeling` a la tabla `daily_entries` para soportar la feature "Sensación del día".

## SQL de migración

Ejecuta este comando en tu consola SQL de Supabase:

```sql
-- Añadir columna day_feeling a daily_entries
ALTER TABLE daily_entries 
ADD COLUMN day_feeling integer 
CHECK (day_feeling >= 1 AND day_feeling <= 10);
```

## Verificación

Para verificar que la migración se aplicó correctamente:

```sql
-- Ver la estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_entries';
```

Deberías ver una fila con:
- `column_name`: day_feeling
- `data_type`: integer
- `is_nullable`: YES

## Rollback (opcional)

Si necesitas revertir la migración:

```sql
ALTER TABLE daily_entries DROP COLUMN day_feeling;
```

## Notas

- El campo es nullable (puede ser NULL)
- Acepta valores entre 1 y 10
- No tiene valor por defecto
- No afecta a las entradas existentes (quedan con NULL)
