import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainApp } from './pages/MainApp'
import { AccessRoute } from './pages/AccessRoute'
import { AdminLogin } from './components/admin/AdminLogin'
import { AdminDashboard } from './components/admin/AdminDashboard'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main application */}
        <Route path="/" element={<MainApp />} />
        <Route path="/access/:token" element={<AccessRoute />} />

        {/* Admin panel — completely isolated */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
