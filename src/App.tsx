import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainApp } from './pages/MainApp'
import { AccessRoute } from './pages/AccessRoute'
import { AccessInvalidPage } from './pages/AccessInvalidPage'
import { AdminLogin } from './components/admin/AdminLogin'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { PredictionsSection } from './components/admin/sections/PredictionsSection'
import { AccessLinksSection } from './components/admin/sections/AccessLinksSection'
import { AdminsSection } from './components/admin/sections/AdminsSection'
import { ModelSection } from './components/admin/sections/ModelSection'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main application */}
        <Route path="/" element={<MainApp />} />

        {/* Access gate — /access/invalid must precede /access/:token */}
        <Route path="/access/invalid" element={<AccessInvalidPage />} />
        <Route path="/access/:token" element={<AccessRoute />} />

        {/* Admin — login page */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin — protected dashboard with nested section routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Navigate to="predictions" replace />} />
          <Route path="predictions" element={<PredictionsSection />} />
          <Route path="links" element={<AccessLinksSection />} />
          <Route path="admins" element={<AdminsSection />} />
          <Route path="model" element={<ModelSection />} />
        </Route>

        {/* Legacy redirect for old /admin/dashboard bookmark */}
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
