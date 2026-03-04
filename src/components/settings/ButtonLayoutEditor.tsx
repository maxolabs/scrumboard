import { useEffect } from 'react'
import { useButtonLayoutStore } from '@/stores/buttonLayoutStore'
import { Button } from '@/components/ui/button'

export function ButtonLayoutEditor() {
  const { buttons, loading, load, moveButton, toggleButton, resetToDefaults } =
    useButtonLayoutStore()

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Reordená con las flechas y usá el toggle para mostrar u ocultar botones.
      </p>

      <div className="space-y-1.5 max-w-md">
        {buttons.map((btn, index) => (
          <div
            key={btn.id}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-secondary"
          >
            {/* Up/Down arrows */}
            <div className="flex flex-col shrink-0">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveButton(index, index - 1)}
                className="text-muted-foreground disabled:opacity-20 p-0.5 active:text-foreground"
                aria-label="Mover arriba"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 2.5 L2.5 7.5 M7 2.5 L11.5 7.5 M7 2.5 V12" />
                </svg>
              </button>
              <button
                type="button"
                disabled={index === buttons.length - 1}
                onClick={() => moveButton(index, index + 1)}
                className="text-muted-foreground disabled:opacity-20 p-0.5 active:text-foreground"
                aria-label="Mover abajo"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 11.5 L2.5 6.5 M7 11.5 L11.5 6.5 M7 11.5 V2" />
                </svg>
              </button>
            </div>

            {/* Label */}
            <span className={`flex-1 text-sm font-medium ${btn.visible === false ? 'text-muted-foreground line-through' : ''}`}>
              {btn.label}
            </span>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={btn.visible !== false}
              onClick={() => toggleButton(btn.id)}
              className={`
                relative inline-flex h-6 w-10 shrink-0 rounded-full
                transition-colors duration-200 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-ring
                ${btn.visible !== false ? 'bg-primary' : 'bg-muted'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 rounded-full
                  bg-background shadow-sm transition-transform duration-200
                  translate-y-0.5
                  ${btn.visible !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}
                `}
              />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={resetToDefaults}>
        Restablecer
      </Button>
    </div>
  )
}
