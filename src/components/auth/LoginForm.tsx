import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Activity, BarChart3, ShieldCheck, TimerReset } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AppLogo } from '@/components/layout/AppLogo'

const features = [
  {
    icon: TimerReset,
    title: 'Seguí el partido en vivo',
    description: 'Registrá jugadas, tiempos y momentos clave sin perder ritmo al costado de la cancha.',
  },
  {
    icon: Activity,
    title: 'Ordená eventos al instante',
    description: 'Capturá decisiones, acciones y secuencias del partido en una sola vista clara.',
  },
  {
    icon: BarChart3,
    title: 'Convertí observaciones en análisis',
    description: 'Terminá cada encuentro con datos listos para revisar y compartir con el equipo.',
  },
]

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(87,119,255,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.16),_transparent_30%)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.03),_transparent_18%),linear-gradient(to_right,_rgba(255,255,255,0.02)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:auto,72px_72px,72px_72px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-primary-foreground/80 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Seguimiento de partidos con foco en velocidad y claridad
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <AppLogo size={72} className="shadow-2xl shadow-primary/20" />
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                    Scrum<span className="text-primary">Board</span>
                  </h1>
                  <p className="mt-2 text-base text-primary-foreground/70 sm:text-lg">
                    Tu centro de control para capturar, organizar y revisar cada partido.
                  </p>
                </div>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-primary-foreground/78 sm:text-xl">
                Diseñado para staff, analistas y entrenadores que necesitan registrar lo importante en vivo,
                mantener el contexto ordenado y llegar al post-partido con información accionable.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-md shadow-[0_18px_60px_rgba(15,23,42,0.22)]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-primary/12 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/68">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-[0_25px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/80">
                  Iniciar sesión
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Volvé al tablero del partido
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Entrá para seguir registrando eventos, revisar métricas y mantener a tu equipo alineado.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-2xl border-white/10 bg-secondary/80 px-4"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-muted-foreground">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-2xl border-white/10 bg-secondary/80 px-4"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Entrar a ScrumBoard'}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-primary-foreground/72">
                <p className="font-medium text-white">Qué te llevás con ScrumBoard</p>
                <p className="mt-2 leading-6">
                  Un flujo simple para registrar el partido, mantener el contexto del equipo y llegar a la revisión con menos caos y mejores decisiones.
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿No tenés cuenta?{' '}
                <Link to="/registro" className="font-medium text-primary transition hover:text-primary/80">
                  Registrate
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
