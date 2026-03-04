import { useEffect, useRef, useState } from 'react'
import { useButtonLayoutStore } from '@/stores/buttonLayoutStore'
import { Button } from '@/components/ui/button'

export function ButtonLayoutEditor() {
  const { buttons, loading, load, moveButton, toggleButton, resetToDefaults } =
    useButtonLayoutStore()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    load()
  }, [load])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnter = (index: number) => {
    dragCounter.current++
    setOverIndex(index)
  }

  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current === 0) setOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== toIndex) {
      moveButton(dragIndex, toIndex)
    }
    setDragIndex(null)
    setOverIndex(null)
    dragCounter.current = 0
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setOverIndex(null)
    dragCounter.current = 0
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Arrastrá para reordenar y usá el toggle para mostrar u ocultar botones.
      </p>

      <div className="space-y-1.5 max-w-md">
        {buttons.map((btn, index) => (
          <div
            key={btn.id}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2.5
              bg-secondary select-none transition-all duration-150
              ${dragIndex === index ? 'opacity-40' : ''}
              ${overIndex === index && dragIndex !== index ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
            `}
          >
            {/* Grip handle */}
            <span className="cursor-grab active:cursor-grabbing text-muted-foreground shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="13" r="1.5" />
                <circle cx="11" cy="13" r="1.5" />
              </svg>
            </span>

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
