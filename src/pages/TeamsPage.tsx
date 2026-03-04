import { TeamManager } from '@/components/dashboard/TeamManager'

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Equipos</h1>
      <TeamManager />
    </div>
  )
}
