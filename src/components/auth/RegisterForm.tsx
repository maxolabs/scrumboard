import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ClipboardList, Sparkles, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AppLogo } from '@/components/layout/AppLogo'

const highlights = [
  {
    icon: Sparkles,
    label: 'Más claridad visual',
  },
  {
    icon: ClipboardList,
    label: 'Partidos mejor documentados',
  },
  {
    icon: Users,
    label: 'Equipo alineado más rápido',
  },
]

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      toast.success('Cuenta creada. Revisá tu email para confirmar.')
      navigate('/login')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(87,119,255,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.16),_transparent_30%)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.03),_transparent_18%),linear-gradient(to_right,_rgba(255,255,255,0.02)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:auto,72px_72px,72px_72px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10 lg:px-10">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <AppLogo size={64} className="shadow-2xl shadow-primary/20" />
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/80">Crear cuenta</p>
                <h1 className="text-4xl font-black tracking-tight text-white">Entrá al partido con todo ordenado</h1>
              </div>
            </div>

            <p className="max-w-xl text-lg leading-8 text-primary-foreground/76">
              Armá tu espacio en ScrumBoard para capturar eventos, seguir el ritmo del encuentro y revisar decisiones con una experiencia más limpia y moderna.
            </p>

            <div className="flex flex-col gap-3">
              {highlights.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-primary-foreground/80 backdrop-blur-md"
                >
                  <span className="inline-flex rounded-xl bg-primary/12 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/10 bg-card/80 p-6 shadow-[0_25px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Abrí tu cuenta</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Creá tu usuario para empezar a documentar partidos y dejar atrás el caos de notas sueltas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm text-muted-foreground">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="h-12 rounded-2xl border-white/10 bg-secondary/80 px-4"
                    placeholder="Juan Pérez"
                  />
                </div>
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
                    minLength={6}
                    className="h-12 rounded-2xl border-white/10 bg-secondary/80 px-4"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="font-medium text-primary transition hover:text-primary/80">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
