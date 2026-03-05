import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'
import { useEffect } from 'react'

const UPDATE_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => {
        void registration.update()
      }, UPDATE_INTERVAL_MS)
    },
  })

  useEffect(() => {
    if (!needRefresh) return
    toast('Nueva version disponible', {
      duration: Infinity,
      action: {
        label: 'Actualizar',
        onClick: () => void updateServiceWorker(true),
      },
    })
  }, [needRefresh, updateServiceWorker])

  return null
}
