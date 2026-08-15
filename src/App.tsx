import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import { BottomNav } from './components/BottomNav'
import { PlateSpinner } from './components/PlateSpinner'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { RoutinesPage } from './pages/RoutinesPage'
import { RoutineEditorPage } from './pages/RoutineEditorPage'
import { WorkoutSessionPage } from './pages/WorkoutSessionPage'
import { HistoryPage } from './pages/HistoryPage'

function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}

function AppShell() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <PlateSpinner className="h-8 w-8 text-plate-yellow" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-ink text-chalk">
        <div className="grain" />
        <AuthPage />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-hidden bg-ink text-chalk pb-20">
        <div className="grain" />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/routines/:id" element={<RoutineEditorPage />} />
            <Route path="/sessions/:id" element={<WorkoutSessionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
