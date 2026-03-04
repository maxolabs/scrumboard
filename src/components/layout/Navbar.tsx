import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Users, Settings, UserCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', label: 'Partidos', icon: LayoutDashboard },
  { to: '/equipos', label: 'Equipos', icon: Users },
  { to: '/botones', label: 'Botones', icon: Settings },
  { to: '/perfil', label: 'Perfil', icon: UserCircle },
]

export function Navbar() {
  const { signOut, profile } = useAuthStore()
  const location = useLocation()

  return (
    <nav className="border-b bg-card">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-lg">
          ScrumBoard
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={signOut} title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {profile?.club_name && (
        <div className="text-xs text-muted-foreground text-center pb-1">
          {profile.club_name}
        </div>
      )}
    </nav>
  )
}
