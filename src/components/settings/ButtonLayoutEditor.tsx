import { useEffect, useState } from 'react'
import { useButtonLayoutStore } from '@/stores/buttonLayoutStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CUSTOM_BUTTON_COLOR_OPTIONS } from '@/lib/constants'
import { cn, getButtonToneClass } from '@/lib/utils'
import type { ButtonColor } from '@/lib/types'

export function ButtonLayoutEditor() {
  const {
    buttons,
    loading,
    load,
    moveButton,
    toggleButton,
    resetToDefaults,
    addCustomButton,
    updateCustomButtonColor,
    removeButton,
  } = useButtonLayoutStore()

  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<'custom_note' | 'custom_team'>('custom_note')
  const [newColor, setNewColor] = useState<ButtonColor>('default')

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>
  }

  const handleAdd = () => {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    addCustomButton(trimmed, newType, newColor)
    setNewLabel('')
    setNewColor('default')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Reordená con las flechas y usá el toggle para mostrar u ocultar botones. Los colores editables
          son solo para botones personalizados; el resto mantiene una semántica fija y suave.
        </p>

        {buttons.map((btn, index) => {
          const isCustom = btn.type === 'custom_note' || btn.type === 'custom_team'
          return (
            <div
              key={btn.id}
              className={cn('rounded-lg px-3 py-2.5', getButtonToneClass(btn))}
            >
              <div className="flex items-center gap-2">
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

                {/* Label + custom badge */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${btn.visible === false ? 'text-muted-foreground line-through' : ''}`}>
                    {btn.label}
                  </span>
                  {isCustom && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {btn.type === 'custom_note' ? 'nota' : 'equipo'}
                    </span>
                  )}
                </div>

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

                {/* Delete (custom only) */}
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => removeButton(btn.id)}
                    className="text-muted-foreground hover:text-destructive p-0.5 shrink-0"
                    aria-label="Eliminar botón"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M3.5 3.5l.667 8h5.666l.667-8" />
                    </svg>
                  </button>
                )}
              </div>

              {isCustom && (
                <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {CUSTOM_BUTTON_COLOR_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateCustomButtonColor(btn.id, option.value)}
                        className={cn(
                          'rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors',
                          btn.color === option.value
                            ? 'border-primary bg-primary/15 text-foreground'
                            : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Button variant="outline" size="sm" onClick={resetToDefaults}>
        Restablecer
      </Button>

      {/* Create custom button */}
      <div className="max-w-md space-y-3 pt-2 border-t">
        <p className="text-sm font-medium">Crear botón personalizado</p>

        <div className="space-y-1.5">
          <Label htmlFor="custom-label">Nombre</Label>
          <Input
            id="custom-label"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Ej: Contraataque"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewType('custom_note')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                newType === 'custom_note'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-foreground border-transparent hover:border-border'
              }`}
            >
              Con notas
            </button>
            <button
              type="button"
              onClick={() => setNewType('custom_team')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                newType === 'custom_team'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-foreground border-transparent hover:border-border'
              }`}
            >
              Nuestro / Rival
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {CUSTOM_BUTTON_COLOR_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setNewColor(option.value)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors',
                  newColor === option.value
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Button size="sm" onClick={handleAdd} disabled={!newLabel.trim()}>
          + Agregar
        </Button>
      </div>
    </div>
  )
}
