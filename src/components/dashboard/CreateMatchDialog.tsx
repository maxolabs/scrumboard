import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Team } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function CreateMatchDialog() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamId, setTeamId] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [isHome, setIsHome] = useState('true')
  const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || !open) return
    supabase
      .from('teams')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
      .then(({ data }) => {
        if (data) setTeams(data)
      })
  }, [user, open])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          team_id: teamId || null,
          opponent_name: opponentName.trim(),
          is_home: isHome === 'true',
          match_date: matchDate,
        })
        .select()
        .single()
      if (error) throw error
      setOpen(false)
      toast.success('Partido creado')
      navigate(`/partido/${data.id}`)
    } catch {
      toast.error('Error al crear partido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> Nuevo partido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear partido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Equipo</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
              <SelectContent>
                {teams.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rival</Label>
            <Input
              value={opponentName}
              onChange={e => setOpponentName(e.target.value)}
              placeholder="Nombre del rival"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Condición</Label>
            <Select value={isHome} onValueChange={setIsHome}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Local</SelectItem>
                <SelectItem value="false">Visitante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear partido'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
