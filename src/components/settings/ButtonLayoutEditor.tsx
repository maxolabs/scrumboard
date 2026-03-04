import { DEFAULT_BUTTONS } from '@/lib/constants'

export function ButtonLayoutEditor() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vista previa del panel de botones. La personalización avanzada estará disponible próximamente.
      </p>
      <div className="grid grid-cols-2 gap-2.5 max-w-md">
        {DEFAULT_BUTTONS.map(btn => (
          <div
            key={btn.id}
            className="bg-secondary rounded-xl p-4 text-sm font-semibold text-center"
          >
            {btn.label}
          </div>
        ))}
      </div>
    </div>
  )
}
