import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

const UPDATE_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
const TOAST_ID = 'pwa-update-available'

export function PwaUpdatePrompt() {
  const updateIntervalRef = useRef<number | null>(null)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      if (updateIntervalRef.current !== null) {
        window.clearInterval(updateIntervalRef.current)
      }
      updateIntervalRef.current = window.setInterval(() => {
        void registration.update()
      }, UPDATE_INTERVAL_MS)
    },
  })

  useEffect(() => {
    return () => {
      if (updateIntervalRef.current !== null) {
        window.clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!needRefresh) return
    toast('Nueva versión disponible', {
      id: TOAST_ID,
      duration: Infinity,
      action: {
        label: 'Actualizar',
        onClick: () => void updateServiceWorker(true),
      },
    })
    return () => {
      toast.dismiss(TOAST_ID)
    }
  }, [needRefresh, updateServiceWorker])

  return null
}
