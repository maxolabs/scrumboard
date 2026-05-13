import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface DeleteTeamDialogProps {
  teamId: string
  teamName: string
  onDeleted?: () => void
  trigger: React.ReactNode
}

export function DeleteTeamDialog({ teamId, teamName, onDeleted, trigger }: DeleteTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('teams').delete().eq('id', teamId)
    setDeleting(false)
    if (error) {
      toast.error('Error al eliminar equipo')
      return
    }
    toast.success('Equipo eliminado')
    setOpen(false)
    onDeleted?.()
  }

  return (
    <Dialog open={open} onOpenChange={v => !deleting && setOpen(v)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Eliminar equipo?</DialogTitle>
          <DialogDescription>
            Se eliminará «{teamName}». Los partidos vinculados podrían perder la referencia al equipo.
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
