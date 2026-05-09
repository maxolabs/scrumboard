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

interface DeleteMatchDialogProps {
  matchId: string
  matchLabel: string
  onDeleted?: () => void
  trigger: React.ReactNode
}

export function DeleteMatchDialog({ matchId, matchLabel, onDeleted, trigger }: DeleteMatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('matches').delete().eq('id', matchId)
    setDeleting(false)
    if (error) {
      toast.error('Error al eliminar partido')
      return
    }
    toast.success('Partido eliminado')
    setOpen(false)
    onDeleted?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Eliminar partido?</DialogTitle>
          <DialogDescription>
            Se eliminará «{matchLabel}» junto con todos sus eventos. Esta acción no se puede deshacer.
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
