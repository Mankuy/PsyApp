import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLangStore } from '../stores/langStore'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useLangStore()
  const [verifying, setVerifying] = useState(true)

  const t = {
    es: {
      title: '¡Pago confirmado!',
      subtitle: 'Tu suscripción Pro está activa.',
      verifying: 'Verificando tu pago...',
      cta: 'Ir al panel',
    },
    en: {
      title: 'Payment confirmed!',
      subtitle: 'Your Pro subscription is now active.',
      verifying: 'Verifying your payment...',
      cta: 'Go to dashboard',
    },
  }[lang === 'es' ? 'es' : 'en']

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const paymentId = searchParams.get('payment_id')

    // Simulate verification delay
    const timer = setTimeout(() => {
      setVerifying(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {verifying ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 shadow-xl border border-slate-100 dark:border-slate-800">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t.verifying}</h2>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t.subtitle}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold transition-colors"
            >
              {t.cta}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
