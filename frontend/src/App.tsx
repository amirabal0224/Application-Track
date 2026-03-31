import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import ApplicationsListPage from './pages/ApplicationsList'
import ApplicationFormPage from './pages/ApplicationForm'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import RequireAuth from './pages/RequireAuth'

const ENABLE_REGISTER = ((import.meta as any).env?.VITE_ENABLE_REGISTER ?? 'false') === 'true'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applications" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {ENABLE_REGISTER ? (
          <Route path="/register" element={<RegisterPage />} />
        ) : (
          <Route path="/register" element={<Navigate to="/login" replace />} />
        )}

        <Route element={<RequireAuth />}>
          <Route path="/applications" element={<ApplicationsListPage />} />
          <Route path="/applications/new" element={<ApplicationFormPage mode="create" />} />
          <Route path="/applications/:id/edit" element={<ApplicationFormPage mode="edit" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
