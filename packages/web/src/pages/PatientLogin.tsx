import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientAuthStore } from '../stores/patientAuthStore'
import { useLangStore } from '../stores/langStore'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'

export default function PatientLogin() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const { login, isLoading, error } = usePatientAuthStore()
  const { lang } = useLangStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email)
    if (ok) navigate('/patient/dashboard')
  }

  const t = {
    es: { title: 'Acceso Paciente', subtitle: 'Ingresá tu email para ver tus citas', email: 'Email', placeholder: 'tu@email.com', login: 'Ingresar', back: 'Volver' },
    en: { title: 'Patient Access', subtitle: 'Enter your email to see your appointments', email: 'Email', placeholder: 'you@email.com', login: 'Sign In', back: 'Back' },
  }[lang]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-sm w-full">
        <button onClick={() => navigate('/')} className="mb-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1">
          <ArrowLeft size={16} /> {t.back}
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder={t.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : t.login}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
