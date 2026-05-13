import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const TIMEOUT_MS = 15000

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session) navigate('/', { replace: true })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') navigate('/', { replace: true })
    })

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setTimedOut(true)
    }, TIMEOUT_MS)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      window.clearTimeout(timeoutId)
    }
  }, [navigate])

  if (timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm text-muted-foreground">
            No pudimos confirmar tu cuenta. El enlace puede haber expirado o ser inválido.
          </p>
          <Link to="/login">
            <Button>Volver al inicio de sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Confirmando cuenta...</p>
      </div>
    </div>
  )
}
