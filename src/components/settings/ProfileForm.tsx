import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export function ProfileForm() {
  const { profile, updateProfile } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [clubName, setClubName] = useState(profile?.club_name ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile({ full_name: fullName, club_name: clubName })
      toast.success('Perfil actualizado')
    } catch {
      toast.error('Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clubName">Club</Label>
            <Input id="clubName" value={clubName} onChange={e => setClubName(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
