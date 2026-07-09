import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/components/toast/ToastProvider'
import { AuthProvider } from '@/auth/AuthProvider'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import AdminRoute from '@/routes/AdminRoute'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import VerifyEmail from '@/pages/VerifyEmail'
import Dashboard from '@/pages/Dashboard'
import Discovery from '@/pages/Discovery'
import Library from '@/pages/Library'
import ArtistDetail from '@/pages/ArtistDetail'
import Admin from '@/pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Accessibles uniquement si NON connecté */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Confirmation d'email : accessible connecté ou non (lien reçu par email) */}
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Accessibles uniquement si connecté, dans le shell applicatif */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/library" element={<Library />} />
                <Route path="/library/:id" element={<ArtistDetail />} />

                {/* Réservé aux administrateurs */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
