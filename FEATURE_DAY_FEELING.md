# Feature: Sensación del día

## Descripción

La "Sensación del día" es una medida emocional opcional que permite al usuario registrar su percepción general del día de forma neutral y sin juicio.

## Principios de diseño

✅ **Calma**: Diseño minimalista con colores apagados  
✅ **Neutralidad**: Sin etiquetas de "bueno/malo"  
✅ **Libertad**: Completamente opcional, puede quedarse vacío  
✅ **Silencio**: Sin feedback automático ni comparativas  
✅ **Introspección**: Solo una marca subjetiva silenciosa  

## Características

### En Today (/today)
- Selector de 10 puntos discretos
- Sin números visibles
- Sin etiquetas evaluativas
- Click para seleccionar, click de nuevo para deseleccionar
- Ubicado después de "Daily Note"
- Marca visual sutil (verde apagado)
- Texto "Opcional" discreto

### En History (/history)
- Indicador muy sutil cuando existe
- Texto neutral: "Sensación registrada"
- Representación pasiva con puntos pequeños
- Solo lectura

### En Calendar (/calendar)
- **NO se utiliza** para colores ni visualización
- La sensación no influye en el calendario

## Implementación técnica

### Base de datos
```sql
day_feeling integer CHECK (day_feeling >= 1 AND day_feeling <= 10)
```
- Nullable (puede ser NULL)
- Rango: 1-10
- Sin valor por defecto

### Componente
- `components/DayFeeling.tsx`: Componente reutilizable
- Props: `value`, `onChange`, `readOnly`
- Accesible con teclado
- Estados de focus discretos

### Persistencia
- Actualización automática en tiempo real
- Sin validaciones visibles
- Sin mensajes de error

## Lo que NO es

❌ No es una puntuación  
❌ No es un rating  
❌ No es una nota  
❌ No es un objetivo a mejorar  
❌ No genera estadísticas  
❌ No muestra promedios  
❌ No compara días  
❌ No da feedback automático  

## Experiencia de usuario

El usuario debe sentir:
- "No tengo que medir mi día"
- "Solo puedo dejar una marca si quiero"
- Libertad total
- Cero presión
- Neutralidad absoluta

## Coherencia con LifeOS

Esta feature refuerza la identidad de LifeOS como:
- Diario consciente
- Herramienta de observación
- Espacio sin juicio
- NO un sistema de productividad
- NO una app de mejora personal
