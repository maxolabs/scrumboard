import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Team } from '@/lib/types'
import { TEAM_CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export function TeamManager() {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState<Team[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('M15')
  const [loading, setLoading] = useState(false)

  const fetchTeams = async () => {
    if (!user) return
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setTeams(data)
  }

  useEffect(() => {
    fetchTeams()
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase.from('teams').insert({
        user_id: user.id,
        name: name.trim(),
        category,
      })
      if (error) throw error
      setName('')
      toast.success('Equipo creado')
      fetchTeams()
    } catch {
      toast.error('Error al crear equipo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar equipo')
      return
    }
    toast.success('Equipo eliminado')
    fetchTeams()
  }

  return (
    <div className="space-y-4">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del equipo</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Club Atlético..." required />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEAM_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="gap-1">
              <Plus className="h-4 w-4" /> Crear equipo
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map(team => (
          <Card key={team.id}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-muted-foreground">{team.category}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {teams.length === 0 && (
          <p className="text-muted-foreground text-sm">No hay equipos aún.</p>
        )}
      </div>
    </div>
  )
}
