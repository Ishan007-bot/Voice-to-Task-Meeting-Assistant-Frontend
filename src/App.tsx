import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MeetingPage from './pages/MeetingPage'
import NewMeetingPage from './pages/NewMeetingPage'
import TasksPage from './pages/TasksPage'
import IntegrationsPage from './pages/IntegrationsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="meetings/new" element={<NewMeetingPage />} />
        <Route path="meetings/:id" element={<MeetingPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
      </Route>
    </Routes>
  )
}

export default App
