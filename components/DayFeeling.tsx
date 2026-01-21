'use client'

interface DayFeelingProps {
  value: number | null
  onChange: (value: number | null) => void
  readOnly?: boolean
}

export default function DayFeeling({ value, onChange, readOnly = false }: DayFeelingProps) {
  const handleClick = (clickedValue: number) => {
    if (readOnly) return
    
    // Si se hace click en el mismo valor, se desmarca
    if (value === clickedValue) {
      onChange(null)
    } else {
      onChange(clickedValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, point: number) => {
    if (readOnly) return
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(point)
    }
  }

  return (
    <div className="bg-emerald-900/30 backdrop-blur border border-emerald-800/30 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-white font-medium text-sm mb-1">Sensación del día</h2>
        <p className="text-emerald-400/40 text-xs">Percepción general del día</p>
      </div>

      {/* Selector de 10 puntos */}
      <div className="flex items-center justify-between gap-2 mb-2" role="group" aria-label="Selector de sensación del día">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((point) => (
          <button
            key={point}
            onClick={() => handleClick(point)}
            onKeyDown={(e) => handleKeyDown(e, point)}
            disabled={readOnly}
            aria-label={`Sensación ${point} de 10`}
            aria-pressed={value === point}
            tabIndex={readOnly ? -1 : 0}
            className={`w-3 h-3 rounded-full transition-all ${
              value === point
                ? 'bg-emerald-500/50 ring-1 ring-emerald-500/30'
                : 'bg-emerald-800/30 hover:bg-emerald-700/40'
            } ${
              readOnly 
                ? 'cursor-default' 
                : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40'
            }`}
          />
        ))}
      </div>

      {/* Texto opcional */}
      {!readOnly && (
        <div className="text-center mt-3">
          <span className="text-emerald-400/30 text-xs">Opcional</span>
        </div>
      )}
    </div>
  )
}
