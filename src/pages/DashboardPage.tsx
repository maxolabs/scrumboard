import { MatchList } from '@/components/dashboard/MatchList'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Partidos</h1>
      <MatchList />
    </div>
  )
}
