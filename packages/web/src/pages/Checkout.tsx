import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import { CheckCircle2, Loader2, ArrowLeft, CreditCard, ShieldCheck, Zap } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, user } = useAuthStore()
  const { lang } = useLangStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedPlan = searchParams.get('plan') || 'pro'

  const t = {
    es: {
      title: 'Elegí tu plan',
      subtitle: 'Accedé a todas las funciones profesionales. Cancelá cuando quieras.',
      proTitle: 'PsyApp Pro',
      proPrice: 'UYU 1.490',
      proPeriod: '/mes',
      proDesc: 'Para psicólog@s con consultorio activo.',
      proFeatures: [
        'Pacientes ilimitados',
        'Agenda + disponibilidad',
        'Notas con plantillas',
        'Recordatorios WhatsApp/email',
        'Telemedicina integrada',
        'Reportes de ingresos',
        'Soporte prioritario',
      ],
      payBtn: 'Pagar con MercadoPago',
      payBtnLoading: 'Procesando...',
      secure: 'Pago seguro encriptado',
      guarantee: 'Cancelá cuando quieras. Sin permanencia.',
      loginRequired: 'Necesitás iniciar sesión para contratar',
      loginBtn: 'Iniciar sesión',
      back: 'Volver',
      monthly: 'Mensual',
    },
    en: {
      title: 'Choose your plan',
      subtitle: 'Access all professional features. Cancel anytime.',
      proTitle: 'PsyApp Pro',
      proPrice: 'UYU 1.490',
      proPeriod: '/month',
      proDesc: 'For professionals with an active practice.',
      proFeatures: [
        'Unlimited patients',
        'Scheduling + availability',
        'Notes with templates',
        'WhatsApp/email reminders',
        'Integrated telemedicine',
        'Income reports',
        'Priority support',
      ],
      payBtn: 'Pay with MercadoPago',
      payBtnLoading: 'Processing...',
      secure: 'Secure encrypted payment',
      guarantee: 'Cancel anytime. No commitment.',
      loginRequired: 'You need to log in to subscribe',
      loginBtn: 'Log in',
      back: 'Back',
      monthly: 'Monthly',
    },
  }[lang === 'es' ? 'es' : 'en']

  const handlePay = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/payments/create', { plan: selectedPlan })
      if (res.data.success && res.data.preference?.init_point) {
        window.location.href = res.data.preference.init_point
      } else if (res.data.contact) {
        alert('Nos pondremos en contacto')
      } else {
        setError('Error al crear el pago')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> {t.back}
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="bg-indigo-600 px-6 py-8 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">{t.proTitle}</h1>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-white">{t.proPrice}</span>
              <span className="text-indigo-200 text-sm">{t.proPeriod}</span>
            </div>
            <p className="mt-1 text-sm text-indigo-100">{t.proDesc}</p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                {t.monthly}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {t.proFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">{t.loginRequired}</p>
                <button
                  onClick={() => navigate('/login?redirect=/checkout')}
                  className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-300 hover:underline"
                >
                  {t.loginBtn}
                </button>
              </div>
            )}

            {error && (
              <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-base font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.payBtnLoading}
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  {t.payBtn}
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} />
                {t.secure}
              </span>
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t.guarantee}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
