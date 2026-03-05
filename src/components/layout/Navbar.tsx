import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Users, UserCircle, SlidersHorizontal, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppLogo } from './AppLogo'

const navItems = [
  { to: '/', label: 'Partidos', icon: LayoutDashboard },
  { to: '/equipos', label: 'Equipos', icon: Users },
  { to: '/botones', label: 'Botones', icon: SlidersHorizontal },
  { to: '/perfil', label: 'Perfil', icon: UserCircle },
]

export function Navbar() {
  const { signOut } = useAuthStore()
  const location = useLocation()

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2.5">
          <AppLogo size={32} />
          <span className="font-bold text-base tracking-tight">
            Scrum<span className="text-primary">Board</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5 rounded-lg"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{item.label}</span>
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="icon" className="rounded-lg ml-1" onClick={signOut} title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
