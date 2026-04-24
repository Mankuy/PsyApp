import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientAuthStore } from '../stores/patientAuthStore'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import { Calendar, Clock, Video, User, LogOut, Loader2 } from 'lucide-react'

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  type: string
  videoLink?: string
  psychologist?: { name: string }
}

export default function PatientDashboard() {
  const { user, isAuthenticated, isLoading, logout, fetchMe } = usePatientAuthStore()
  const { lang } = useLangStore()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMe() }, [])
  useEffect(() => {
    if (!isLoading && !isAuthenticated) { navigate('/patient/login'); return }
    if (isAuthenticated) loadAppointments()
  }, [isAuthenticated, isLoading])

  const loadAppointments = async () => {
    try {
      const res = await api.get('/patients/me/appointments')
      setAppointments(res.data.data || [])
    } catch { /* empty */ }
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const t = {
    es: { welcome: 'Hola', myAppointments: 'Mis Citas', noAppointments: 'No tenés citas agendadas', book: 'Agendar nueva cita', joinCall: 'Unirse a videollamada', professional: 'Profesional', date: 'Fecha', time: 'Hora', logout: 'Salir' },
    en: { welcome: 'Hello', myAppointments: 'My Appointments', noAppointments: 'No appointments scheduled', book: 'Book new appointment', joinCall: 'Join video call', professional: 'Professional', date: 'Date', time: 'Time', logout: 'Logout' },
  }[lang]

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
  }

  const upcoming = appointments.filter((a: Appointment) => new Date(a.endTime) > new Date() && a.status !== 'cancelled')
  const past = appointments.filter((a: Appointment) => new Date(a.endTime) <= new Date() || a.status === 'cancelled')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">PsyApp Paciente</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.welcome}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 dark:text-gray-400">{upcoming.length} {lang === 'es' ? 'citas próximas' : 'upcoming appointments'}</p>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
            <Calendar className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400">{t.noAppointments}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a: Appointment) => (
              <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} />
                      {new Date(a.startTime).toLocaleDateString(lang === 'es' ? 'es-UY' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Clock size={14} />
                      {new Date(a.startTime).toLocaleTimeString(lang === 'es' ? 'es-UY' : 'en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(a.endTime).toLocaleTimeString(lang === 'es' ? 'es-UY' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {a.psychologist && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <User size={14} />
                        {t.professional}: {a.psychologist.name}
                      </div>
                    )}
                  </div>
                  {a.videoLink && (
                    <a href={a.videoLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Video size={14} /> {t.joinCall}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">{lang === 'es' ? '¿Necesitás una nueva cita?' : 'Need a new appointment?'}</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-3">{lang === 'es' ? 'Contactá a tu profesional para agendar.' : 'Contact your professional to schedule.'}</p>
        </div>
      </main>
    </div>
  )
}
