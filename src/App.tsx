import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { PwaUpdatePrompt } from '@/components/PwaUpdatePrompt'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import TeamsPage from '@/pages/TeamsPage'
import LiveMatchPage from '@/pages/LiveMatchPage'
import MatchReviewPage from '@/pages/MatchReviewPage'
import ProfilePage from '@/pages/ProfilePage'
import ButtonConfigPage from '@/pages/ButtonConfigPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'

export default function App() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/equipos" element={<TeamsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/botones" element={<ButtonConfigPage />} />
        </Route>
        <Route
          path="/partido/:id"
          element={
            <ProtectedRoute>
              <LiveMatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partido/:id/revision"
          element={
            <ProtectedRoute>
              <MatchReviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
      <PwaUpdatePrompt />
    </BrowserRouter>
  )
}
