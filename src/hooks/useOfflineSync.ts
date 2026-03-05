import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useOnlineStatus } from './useOnlineStatus'
import { syncQueue } from '@/lib/offlineQueue'

export function useOfflineSync() {
  const online = useOnlineStatus()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      return
    }
    if (!wasOffline.current) return
    wasOffline.current = false

    syncQueue().then((count) => {
      if (count > 0) {
        toast.success(`${count} evento${count > 1 ? 's' : ''} sincronizado${count > 1 ? 's' : ''}`)
      }
    })
  }, [online])
}
