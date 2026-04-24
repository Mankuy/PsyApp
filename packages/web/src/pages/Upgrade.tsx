import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import {
  ArrowLeft, CreditCard, Loader2, CheckCircle2, Globe,
  Zap, ShieldCheck, Bell, BarChart3, FileText, CalendarCheck,
  X, PartyPopper,
} from 'lucide-react'

interface Country {
  code: string
  name: string
  currency: string
}

export default function Upgrade() {
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState('UY')
  const [provider, setProvider] = useState<'mercadopago' | 'stripe'>('mercadopago')
  const [showMockModal, setShowMockModal] = useState(false)
  const [mockProvider, setMockProvider] = useState('')

  useEffect(() => {
    api.get('/payments/countries').then((res) => {
      if (res.data.success) setCountries(res.data.data)
    }).catch(() => {
      setCountries([
        { code: 'UY', name: 'Uruguay', currency: 'UYU' },
        { code: 'AR', name: 'Argentina', currency: 'ARS' },
        { code: 'CL', name: 'Chile', currency: 'CLP' },
        { code: 'MX', name: 'México', currency: 'MXN' },
        { code: 'CO', name: 'Colombia', currency: 'COP' },
        { code: 'PE', name: 'Perú', currency: 'PEN' },
        { code: 'BR', name: 'Brasil', currency: 'BRL' },
      ])
    })
  }, [])

  const countryPrices: Record<string, number> = {
    UY: 1490, AR: 29900, CL: 24900, MX: 490, CO: 89000, PE: 49, BR: 79,
  }

  const price = countryPrices[selectedCountry] || 1490

  const t = {
    es: {
      title: 'Mejorá tu plan',
      subtitle: 'Accedé a funciones profesionales y hacé crecer tu consultorio.',
      currentPlan: 'Plan actual',
      proPlan: 'PsyApp Pro',
      priceLabel: 'por mes',
      featuresTitle: 'Incluye todo esto:',
      countryLabel: 'País',
      paymentMethod: 'Método de pago',
      mpLabel: 'MercadoPago',
      stripeLabel: 'Tarjeta de crédito / débito',
      payBtn: 'Pagar ahora',
      payBtnLoading: 'Procesando...',
      secure: 'Pago seguro encriptado',
      guarantee: 'Cancelá cuando quieras. Sin permanencia.',
      back: 'Volver',
      free: 'Gratis',
      upgradeCta: 'Upgrade a Pro',
      mockTitle: '¡Pago simulado exitoso!',
      mockDesc: 'En modo desarrollo el pago se simula. En producción, serías redirigido a',
      mockContinue: 'Continuar al panel',
    },
    en: {
      title: 'Upgrade your plan',
      subtitle: 'Access professional features and grow your practice.',
      currentPlan: 'Current plan',
      proPlan: 'PsyApp Pro',
      priceLabel: 'per month',
      featuresTitle: 'Includes all of this:',
      countryLabel: 'Country',
      paymentMethod: 'Payment method',
      mpLabel: 'MercadoPago',
      stripeLabel: 'Credit / debit card',
      payBtn: 'Pay now',
      payBtnLoading: 'Processing...',
      secure: 'Secure encrypted payment',
      guarantee: 'Cancel anytime. No commitment.',
      back: 'Back',
      free: 'Free',
      upgradeCta: 'Upgrade to Pro',
      mockTitle: 'Simulated payment successful!',
      mockDesc: 'In development mode payment is simulated. In production, you would be redirected to',
      mockContinue: 'Continue to dashboard',
    },
  }[lang === 'es' ? 'es' : 'en']

  const features = [
    { icon: CalendarCheck, text: lang === 'es' ? 'Pacientes ilimitados' : 'Unlimited patients' },
    { icon: Bell, text: lang === 'es' ? 'Recordatorios automáticos' : 'Automatic reminders' },
    { icon: BarChart3, text: lang === 'es' ? 'Reportes de ingresos' : 'Income reports' },
    { icon: FileText, text: lang === 'es' ? 'Notas con plantillas' : 'Note templates' },
    { icon: ShieldCheck, text: lang === 'es' ? 'Consentimientos digitales' : 'Digital consents' },
    { icon: Zap, text: lang === 'es' ? 'Soporte prioritario' : 'Priority support' },
  ]

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/payments/create', {
        plan: 'pro',
        provider,
        country: selectedCountry,
      })
      if (res.data.success) {
        // Stripe real
        if (res.data.provider === 'stripe' && res.data.session?.url && !res.data.session?.mock) {
          window.location.href = res.data.session.url
          return
        }
        // MercadoPago real
        if (res.data.preference?.init_point && !res.data.preference?.mock) {
          window.location.href = res.data.preference.init_point
          return
        }
        // Modo mock (desarrollo) — mostrar modal de éxito
        setMockProvider(provider === 'mercadopago' ? 'MercadoPago' : 'Stripe')
        setShowMockModal(true)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} /> {t.back}
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-amber-400" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white">{t.title}</h1>
            <p className="mt-2 text-sm text-slate-400">{t.subtitle}</p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t.currentPlan}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.free}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t.proPlan}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {countries.find(c => c.code === selectedCountry)?.currency || 'UYU'} {price.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">{t.priceLabel}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">{t.featuresTitle}</p>
              <div className="grid grid-cols-2 gap-3">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                <Globe size={12} className="inline mr-1" />
                {t.countryLabel}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                {t.paymentMethod}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProvider('mercadopago')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                    provider === 'mercadopago'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg font-bold">MP</span>
                  {t.mpLabel}
                </button>
                <button
                  onClick={() => setProvider('stripe')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                    provider === 'stripe'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <CreditCard size={24} />
                  {t.stripeLabel}
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-base font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
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

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={12} />
              {t.secure}
            </div>
            <p className="text-center text-xs text-slate-400 mt-1">
              {t.guarantee}
            </p>
          </div>
        </div>
      </div>

      {/* Mock Payment Success Modal */}
      {showMockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t.mockTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {t.mockDesc} <strong>{mockProvider}</strong>.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {lang === 'es'
                  ? 'En producción con las API keys configuradas, esto redirigiría al checkout real de pago.'
                  : 'In production with API keys configured, this would redirect to the real payment checkout.'}
              </p>
            </div>
            <button
              onClick={() => { setShowMockModal(false); navigate('/') }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {t.mockContinue}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
