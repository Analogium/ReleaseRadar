import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/components/toast/ToastProvider'
import { AuthProvider } from '@/auth/AuthProvider'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import AdminRoute from '@/routes/AdminRoute'
import AppLayout from '@/components/layout/AppLayout'
import PageLoader from '@/components/PageLoader'
// La vitrine reste dans le bundle principal : c'est la 1re page publique (LCP/SEO),
// on évite un aller-retour réseau supplémentaire avant le premier rendu.
import Landing from '@/pages/Landing'

// Toutes les autres routes sont découpées (code-splitting) : chaque page charge
// son propre chunk à la demande, allégeant le bundle initial.
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Discovery = lazy(() => import('@/pages/Discovery'))
const Library = lazy(() => import('@/pages/Library'))
const ArtistDetail = lazy(() => import('@/pages/ArtistDetail'))
const Admin = lazy(() => import('@/pages/Admin'))
const Settings = lazy(() => import('@/pages/Settings'))
const Terms = lazy(() => import('@/pages/legal/Terms'))
const Privacy = lazy(() => import('@/pages/legal/Privacy'))
const LegalNotice = lazy(() => import('@/pages/legal/LegalNotice'))

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Accessibles uniquement si NON connecté */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Accueil public (vitrine) — accessible à tous, CTA adaptés selon la connexion */}
              <Route path="/" element={<Landing />} />

              {/* Confirmation d'email : accessible connecté ou non (lien reçu par email) */}
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Pages légales : publiques, hors shell applicatif */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/legal" element={<LegalNotice />} />

              {/* Accessibles uniquement si connecté, dans le shell applicatif */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/library/:id" element={<ArtistDetail />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Réservé aux administrateurs */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
