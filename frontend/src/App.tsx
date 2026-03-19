import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import ApplicationsListPage from './pages/ApplicationsList'
import ApplicationFormPage from './pages/ApplicationForm'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import RequireAuth from './pages/RequireAuth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applications" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/applications" element={<ApplicationsListPage />} />
          <Route path="/applications/new" element={<ApplicationFormPage mode="create" />} />
          <Route path="/applications/:id/edit" element={<ApplicationFormPage mode="edit" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
