import { DEFAULT_BUTTONS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ButtonLayoutEditor() {
  // For now, show the default layout. Full drag-and-drop editing can be added later.
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vista previa del panel de botones. La personalización avanzada estará disponible próximamente.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layout actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {DEFAULT_BUTTONS.map(btn => (
              <div
                key={btn.id}
                className={`${btn.color} text-white rounded-lg p-3 text-sm font-medium text-center`}
              >
                {btn.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
