import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div className="flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-400">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Sin conexion — los eventos se guardan localmente</span>
    </div>
  )
}
