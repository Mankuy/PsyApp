import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, CreditCard, BarChart3,
  Settings, LogOut, Loader2, FileText, Bell, MessageCircle, Shield,
  Zap, Building2,
} from 'lucide-react'
import { useAuthStore } from './stores/authStore'
import { usePatientAuthStore } from './stores/patientAuthStore'
import { useThemeStore } from './stores/themeStore'
import { useLangStore } from './stores/langStore'
import { applyTheme } from './utils/theme'
import { ToastContainer } from './components/Toast'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Billing from './pages/Billing'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import BookingPage from './pages/BookingPage'
import Notes from './pages/Notes'
import Reminders from './pages/Reminders'
import Documents from './pages/Documents'
import Integrations from './pages/Integrations'
import Organizations from './pages/Organizations'
import TwoFA from './pages/TwoFA'
import PatientLogin from './pages/PatientLogin'
import PatientDashboard from './pages/PatientDashboard'
import VideoCall from './pages/VideoCall'
import Checkout from './pages/Checkout'
import Upgrade from './pages/Upgrade'
import PaymentSuccess from './pages/PaymentSuccess'

import { useOnboardingStore } from './stores/onboardingStore'

function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { lang } = useLangStore()

  const linkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors'
  const inactive = 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400'
  const active = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'

  const items = [
    { to: '/', label: lang === 'es' ? 'Panel' : 'Dashboard', icon: LayoutDashboard },
    { to: '/appointments', label: lang === 'es' ? 'Citas' : 'Appointments', icon: CalendarDays },
    { to: '/reminders', label: lang === 'es' ? 'Recordatorios' : 'Reminders', icon: Bell },
    { to: '/patients', label: lang === 'es' ? 'Pacientes' : 'Patients', icon: Users },
    { to: '/notes', label: lang === 'es' ? 'Notas clínicas' : 'Clinical notes', icon: FileText },
    { to: '/billing', label: lang === 'es' ? 'Facturación' : 'Billing', icon: CreditCard },
    { to: '/reports', label: lang === 'es' ? 'Informes' : 'Reports', icon: BarChart3 },
    { to: '/documents', label: lang === 'es' ? 'Consentimientos' : 'Documents', icon: FileText },
    { to: '/integrations', label: lang === 'es' ? 'Conexiones' : 'Connections', icon: MessageCircle },
    { to: '/organizations', label: lang === 'es' ? 'Organización' : 'Organization', icon: Building2 },
    { to: '/2fa', label: lang === 'es' ? 'Seguridad' : 'Security', icon: Shield },
    { to: '/settings', label: lang === 'es' ? 'Configuración' : 'Settings', icon: Settings },
    { to: '/upgrade', label: lang === 'es' ? 'Upgrade a Pro' : 'Upgrade to Pro', icon: Zap, highlight: true },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col p-4 gap-1 dark:bg-gray-900 dark:border-gray-700">
      <div className="text-2xl font-bold text-indigo-600 mb-2 px-2">PsyApp</div>
      {user && (
        <div className="px-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
        </div>
      )}
      <nav className="flex-1 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => {
              const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors'
              if (item.highlight) {
                return isActive
                  ? `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300`
                  : `${base} bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30`
              }
              return isActive
                ? `${base} bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400`
                : `${base} text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400`
            }}
          >
            <item.icon size={18} />{item.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-auto">
        <LogOut size={18} />{lang === 'es' ? 'Cerrar sesión' : 'Log out'}
      </button>
    </aside>
  )
}

export default function App() {
  const { isDark } = useThemeStore()
  const { isAuthenticated: professionalAuth, isLoading: professionalLoading, fetchMe: fetchProfessional } = useAuthStore()
  const { isAuthenticated: patientAuth, isLoading: patientLoading, fetchMe: fetchPatient } = usePatientAuthStore()
  const { completed: onboardingCompleted } = useOnboardingStore()

  useEffect(() => { applyTheme(isDark) }, [isDark])
  useEffect(() => { fetchProfessional() }, [fetchProfessional])
  useEffect(() => { fetchPatient() }, [fetchPatient])

  // Safety timeout: never stay loading longer than 3s
  const [safetyReady, setSafetyReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSafetyReady(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if ((professionalLoading || patientLoading) && !safetyReady) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 size={32} className="animate-spin text-indigo-600" /></div>
        <ToastContainer />
      </>
    )
  }

  if (patientAuth) {
    return (
      <>
        <Routes>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="*" element={<PatientDashboard />} />
        </Routes>
        <ToastContainer />
      </>
    )
  }

  if (professionalAuth) {
    if (!onboardingCompleted) return <><Onboarding /><ToastContainer /></>
    return (
      <>
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/2fa" element={<TwoFA />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/book/:psychologistId" element={<BookingPage />} />
              <Route path="/video/:roomName" element={<VideoCall />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/book/:psychologistId" element={<BookingPage />} />
        <Route path="/video/:roomName" element={<VideoCall />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ToastContainer />
    </>
  )
}
