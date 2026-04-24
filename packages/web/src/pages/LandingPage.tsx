import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../stores/themeStore'
import { useLangStore } from '../stores/langStore'
import { applyTheme } from '../utils/theme'
import { useEffect, useState } from 'react'
import {
  Brain, CalendarCheck, ShieldCheck, BarChart3, Bell, Video,
  FileText, Moon, Sun, Menu, X, ArrowRight, Star, CheckCircle2,
  Globe, Heart, Quote, Sparkles, TrendingUp, Lock, Zap,
} from 'lucide-react'

/* ────────────────────────────  PALETA PREMIUM  ──────────────────────────── */
const GRADIENT_HERO = 'bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950'
const ACCENT_GOLD = 'text-amber-400'

/* ────────────────────────────  NAVBAR  ──────────────────────────── */
function Navbar() {
  const navigate = useNavigate()
  const { isDark, toggle } = useThemeStore()
  const { lang, toggleLang } = useLangStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const t = {
    login: lang === 'es' ? 'Ingresar' : 'Sign In',
    register: lang === 'es' ? 'Registrate gratis' : 'Get started free',
    patient: lang === 'es' ? 'Soy paciente' : "I'm a patient",
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Brain size={22} strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Psy<span className="text-indigo-500">App</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['features', 'pricing', 'testimonials'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors tracking-wide"
              >
                {lang === 'es'
                  ? { features: 'Funciones', pricing: 'Precios', testimonials: 'Testimonios' }[id]
                  : { features: 'Features', pricing: 'Pricing', testimonials: 'Testimonials' }[id]
                }
              </a>
            ))}
            <button onClick={toggleLang} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/patient/login')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
              {t.patient}
            </button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              {t.login}
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full transition-all shadow-lg shadow-slate-900/10">
              {t.register}
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-400">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-6 py-6 space-y-4">
          {['features', 'pricing', 'testimonials'].map((id) => (
            <a key={id} href={`#${id}`} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-600 dark:text-slate-400">
              {lang === 'es'
                ? { features: 'Funciones', pricing: 'Precios', testimonials: 'Testimonios' }[id]
                : { features: 'Features', pricing: 'Pricing', testimonials: 'Testimonials' }[id]
              }
            </a>
          ))}
          <button onClick={() => { navigate('/patient/login'); setMobileOpen(false); }} className="block text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {t.patient}
          </button>
          <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t.login}
          </button>
          <button onClick={() => { navigate('/register'); setMobileOpen(false); }} className="block w-full px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-full text-center">
            {t.register}
          </button>
        </div>
      )}
    </nav>
  )
}

/* ────────────────────────────  HERO  ──────────────────────────── */
function Hero() {
  const navigate = useNavigate()
  const { lang } = useLangStore()

  const t = {
    badge: lang === 'es' ? 'Software de gestión clínica — Uruguay' : 'Practice management software — Uruguay',
    title1: lang === 'es' ? 'Tu consultorio,' : 'Your practice,',
    title2: lang === 'es' ? 'elevado al siguiente nivel' : 'elevated to the next level',
    subtitle: lang === 'es'
      ? 'La plataforma que usan los mejores psicólog@s de Latinoamérica para gestionar pacientes, citas, facturación y notas clínicas con excelencia.'
      : 'The platform top professionals across Latin America use to manage patients, appointments, billing and clinical notes with excellence.',
    ctaPrimary: lang === 'es' ? 'Empezar gratis' : 'Start free',
    ctaSecondary: lang === 'es' ? 'Ver funciones' : 'See features',
    ctaPatient: lang === 'es' ? 'Soy paciente — Acceder gratis' : "I'm a patient — Access free",
    stats1: lang === 'es' ? 'Psicólog@s activos' : 'Active professionals',
    stats2: lang === 'es' ? 'Citas gestionadas' : 'Appointments managed',
    stats3: lang === 'es' ? 'Satisfacción' : 'Satisfaction',
  }

  return (
    <section className={`relative min-h-screen flex items-center pt-20 ${GRADIENT_HERO} overflow-hidden`}>
      {/* Gradients decorativos */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-medium tracking-wide mb-8">
              <Sparkles size={12} className="text-amber-400" />
              {t.badge}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              {t.title1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-300">
                {t.title2}
              </span>
            </h1>

            <p className="mt-8 text-lg text-slate-400 leading-relaxed max-w-lg">
              {t.subtitle}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-full text-base font-semibold transition-all shadow-xl shadow-white/10"
              >
                {t.ctaPrimary}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-8 py-4 text-slate-300 hover:text-white rounded-full text-base font-medium border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                {t.ctaSecondary}
              </button>
            </div>

            <p className="mt-6 text-sm">
              <button onClick={() => navigate('/patient/login')} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                {t.ctaPatient} →
              </button>
            </p>
          </div>

          {/* Visual derecho - Stats cards flotantes */}
          <div className="hidden lg:block relative">
            <div className="relative z-10 space-y-4">
              {[{
                icon: TrendingUp,
                value: '500+',
                label: t.stats1,
                delay: '0',
              }, {
                icon: CalendarCheck,
                value: '50K+',
                label: t.stats2,
                delay: '100',
              }, {
                icon: Star,
                value: '99%',
                label: t.stats3,
                delay: '200',
              }].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-5 p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 hover:border-slate-600/40 transition-all duration-500 hover:translate-x-2"
                  style={{ animationDelay: `${stat.delay}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <stat.icon size={22} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Decoración */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────  FEATURES  ──────────────────────────── */
function Features() {
  const { lang } = useLangStore()

  const t = {
    eyebrow: lang === 'es' ? 'Diseñado para la excelencia clínica' : 'Designed for clinical excellence',
    title: lang === 'es' ? 'Todo lo que necesitás, nada que no' : 'Everything you need, nothing you don\'t',
    subtitle: lang === 'es'
      ? 'Cada función fue pensada con psicólog@s en consultorio. Sin features innecesarias, sin distracciones.'
      : 'Every feature was designed with practicing professionals in mind. No fluff, no distractions.',
  }

  const features = [
    {
      icon: CalendarCheck,
      title: lang === 'es' ? 'Agenda inteligente' : 'Smart scheduling',
      desc: lang === 'es' ? 'Vista diaria, semanal y mensual con drag & drop. Tus pacientes reservan directo.' : 'Daily, weekly and monthly views with drag & drop. Patients book directly.',
    },
    {
      icon: ShieldCheck,
      title: lang === 'es' ? 'Datos protegidos' : 'Secure data',
      desc: lang === 'es' ? 'Encriptación end-to-end. Cumplimiento LGPD y normativas locales.' : 'End-to-end encryption. LGPD and local regulations compliant.',
    },
    {
      icon: BarChart3,
      title: lang === 'es' ? 'Métricas claras' : 'Clear metrics',
      desc: lang === 'es' ? 'Ingresos, ocupación, inasistencias. Todo en dashboards simples.' : 'Revenue, occupancy, no-shows. All in simple dashboards.',
    },
    {
      icon: Bell,
      title: lang === 'es' ? 'Recordatorios automáticos' : 'Auto reminders',
      desc: lang === 'es' ? 'WhatsApp y email 24h antes. Reducí inasistencias un 40%.' : 'WhatsApp and email 24h prior. Reduce no-shows by 40%.',
    },
    {
      icon: Video,
      title: lang === 'es' ? 'Telemedicina nativa' : 'Native telemedicine',
      desc: lang === 'es' ? 'Links seguros por sesión. Sin apps externas, sin fricción.' : 'Secure per-session links. No external apps, no friction.',
    },
    {
      icon: FileText,
      title: lang === 'es' ? 'Notas con plantillas' : 'Template notes',
      desc: lang === 'es' ? 'SOAP, EVA, cognitivo-conductual. Documentá en minutos, no en horas.' : 'SOAP, EVA, CBT. Document in minutes, not hours.',
    },
  ]

  return (
    <section id="features" className="py-32 lg:py-40 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-20">
          <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-white dark:bg-slate-950 p-10 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-8 group-hover:border-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/5 transition-all duration-500">
                <f.icon size={24} className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────  PRICING  ──────────────────────────── */
function Pricing() {
  const navigate = useNavigate()
  const { lang } = useLangStore()

  const t = {
    eyebrow: lang === 'es' ? 'Precios transparentes' : 'Transparent pricing',
    title: lang === 'es' ? 'Empezá gratis, escalá cuando crezcas' : 'Start free, scale as you grow',
    free: lang === 'es' ? 'Gratis' : 'Free',
    pro: lang === 'es' ? 'Pro' : 'Pro',
    enterprise: lang === 'es' ? 'Equipo' : 'Team',
    month: lang === 'es' ? '/mes' : '/month',
    popular: lang === 'es' ? 'Más elegido' : 'Most popular',
    guarantee: lang === 'es' ? 'Cancelá cuando quieras. Sin permanencia.' : 'Cancel anytime. No commitment.',
  }

  const plans = [
    {
      name: t.free,
      price: 'UYU 0',
      desc: lang === 'es' ? 'Para quienes recién empiezan.' : 'For those just starting out.',
      features: [
        lang === 'es' ? 'Hasta 3 pacientes' : 'Up to 3 patients',
        lang === 'es' ? 'Agenda básica' : 'Basic scheduling',
        lang === 'es' ? 'Notas clínicas simples' : 'Simple clinical notes',
        lang === 'es' ? 'Soporte por email' : 'Email support',
      ],
      cta: lang === 'es' ? 'Crear cuenta gratis' : 'Create free account',
      highlighted: false,
    },
    {
      name: t.pro,
      price: 'UYU 1.490',
      desc: lang === 'es' ? 'Para consultorios en crecimiento.' : 'For growing practices.',
      features: [
        lang === 'es' ? 'Pacientes ilimitados' : 'Unlimited patients',
        lang === 'es' ? 'Agenda + disponibilidad pública' : 'Scheduling + public availability',
        lang === 'es' ? 'Notas con plantillas avanzadas' : 'Advanced note templates',
        lang === 'es' ? 'Recordatorios WhatsApp/email' : 'WhatsApp/email reminders',
        lang === 'es' ? 'Telemedicina integrada' : 'Integrated telemedicine',
        lang === 'es' ? 'Reportes de ingresos' : 'Income reports',
        lang === 'es' ? 'Soporte prioritario' : 'Priority support',
      ],
      cta: lang === 'es' ? 'Empezar prueba' : 'Start trial',
      highlighted: true,
    },
    {
      name: t.enterprise,
      price: lang === 'es' ? 'A medida' : 'Custom',
      desc: lang === 'es' ? 'Para centros y equipos.' : 'For centers and teams.',
      features: [
        lang === 'es' ? 'Todo lo de Pro' : 'Everything in Pro',
        lang === 'es' ? 'Múltiples profesionales' : 'Multiple professionals',
        lang === 'es' ? 'Roles y permisos' : 'Roles and permissions',
        lang === 'es' ? 'API y webhooks' : 'API and webhooks',
        lang === 'es' ? 'Onboarding personalizado' : 'Custom onboarding',
        lang === 'es' ? 'SLA garantizado' : 'Guaranteed SLA',
      ],
      cta: lang === 'es' ? 'Contactar' : 'Contact us',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-32 lg:py-40 bg-slate-50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-2xl shadow-indigo-500/10'
                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-500/30">
                  {t.popular}
                </div>
              )}

              <h3 className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.price}
                </span>
                {plan.price !== t.enterprise && (
                  <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {t.month}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {plan.desc}
              </p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feat, j) => (
                  <li key={j} className={`flex items-start gap-3 text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-indigo-400' : 'text-emerald-500'}`} />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.name === t.pro) navigate('/checkout?plan=pro')
                  else if (plan.name === t.enterprise) navigate('/register')
                  else navigate('/register')
                }}
                className={`mt-8 w-full py-3.5 rounded-full text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-white hover:bg-slate-100 text-slate-900 shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-400 dark:text-slate-500">
          {t.guarantee}
        </p>
      </div>
    </section>
  )
}

/* ────────────────────────────  TESTIMONIALS  ──────────────────────────── */
function Testimonials() {
  const { lang } = useLangStore()

  const t = {
    eyebrow: lang === 'es' ? 'Lo que dicen los que la usan' : 'What users say',
    title: lang === 'es' ? 'Confianza construida sesión a sesión' : 'Trust built session by session',
  }

  const testimonials = [
    {
      name: 'Dra. Laura Martínez',
      role: lang === 'es' ? 'Psicóloga clínica — Montevideo' : 'Clinical psychologist — Montevideo',
      text: lang === 'es'
        ? 'Pasé de perder 4 horas semanales en administración a tener todo resuelto en 20 minutos. La calidad del producto se nota en cada detalle.'
        : 'I went from losing 4 hours weekly on admin to having everything done in 20 minutes. The product quality shows in every detail.',
    },
    {
      name: 'Dr. Carlos Benítez',
      role: lang === 'es' ? 'Psicoprofesional — Buenos Aires' : 'Psychoprofessional — Buenos Aires',
      text: lang === 'es'
        ? 'Las plantillas de notas son de otro nivel. Documento lo que antes me llevaba media hora en menos de cinco minutos. Inversión que se paga sola.'
        : 'The note templates are next level. I document what used to take half an hour in under five minutes. An investment that pays for itself.',
    },
    {
      name: 'Dra. Ana López',
      role: lang === 'es' ? 'Psicóloga infantil — Santiago' : 'Child psychologist — Santiago',
      text: lang === 'es'
        ? 'Mis pacientes adoran poder reservar directo. Los recordatorios redujeron mis inasistencias a casi cero. El soporte responde en minutos, no en días.'
        : 'My patients love being able to book directly. Reminders reduced my no-shows to almost zero. Support replies in minutes, not days.',
    },
  ]

  return (
    <section id="testimonials" className="py-32 lg:py-40 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-20">
          <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <Quote size={32} className="text-indigo-200 dark:text-indigo-900 mb-6" />
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 text-[15px]">
                "{item.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-amber-400 flex items-center justify-center text-white text-sm font-bold">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────  PATIENT SECTION  ──────────────────────────── */
function PatientSection() {
  const navigate = useNavigate()
  const { lang } = useLangStore()

  const t = {
    eyebrow: lang === 'es' ? 'Para pacientes' : 'For patients',
    title: lang === 'es' ? 'Accedé a tu consultorio desde cualquier lugar' : 'Access your practice from anywhere',
    subtitle: lang === 'es'
      ? 'Sin costo. Sin complicaciones. Con tu email podés ver tus citas, recibir recordatorios y unirte a videollamadas.'
      : 'No cost. No complications. With your email you can see appointments, get reminders and join video calls.',
    cta: lang === 'es' ? 'Entrar como paciente' : 'Enter as patient',
    free: lang === 'es' ? 'Gratis para siempre' : 'Free forever',
    feat1: lang === 'es' ? 'Ver citas programadas' : 'See scheduled appointments',
    feat2: lang === 'es' ? 'Recordatorios automáticos' : 'Automatic reminders',
    feat3: lang === 'es' ? 'Videollamadas integradas' : 'Integrated video calls',
  }

  return (
    <section className="py-32 lg:py-40 bg-emerald-950/30 dark:bg-emerald-950/20 border-y border-emerald-900/10 dark:border-emerald-900/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-6">
            <Heart size={14} />
            {t.eyebrow}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.subtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/patient/login')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-base font-semibold transition-all shadow-xl shadow-emerald-500/20"
            >
              {t.cta}
            </button>
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {t.free}
            </span>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: CalendarCheck, text: t.feat1 },
              { icon: Bell, text: t.feat2 },
              { icon: Video, text: t.feat3 },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/20">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  <f.icon size={22} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────  CTA  ──────────────────────────── */
function CTA() {
  const navigate = useNavigate()
  const { lang } = useLangStore()

  const t = {
    title: lang === 'es' ? '¿Listo para transformar tu consultorio?' : 'Ready to transform your practice?',
    subtitle: lang === 'es'
      ? 'Unite a cientos de psicólog@s que ya eligieron excelencia. Empezá gratis hoy mismo.'
      : 'Join hundreds of professionals who chose excellence. Start free today.',
    cta: lang === 'es' ? 'Crear cuenta gratis' : 'Create free account',
  }

  return (
    <section className="py-32 lg:py-40 bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="relative rounded-[2.5rem] px-8 py-20 lg:px-16 lg:py-24 overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-amber-500/5" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {t.title}
            </h2>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="mt-10 px-10 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-full text-base font-semibold transition-all shadow-2xl shadow-white/10"
            >
              {t.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────  FOOTER  ──────────────────────────── */
function Footer() {
  const { lang } = useLangStore()

  const t = {
    tagline: lang === 'es' ? 'Hecho con cuidado en Uruguay' : 'Carefully crafted in Uruguay',
    copyright: '© 2026 PsyApp.',
    rights: lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.',
  }

  return (
    <footer className="py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Brain size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Psy<span className="text-indigo-500">App</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t.tagline}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t.copyright} {t.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ────────────────────────────  MAIN  ──────────────────────────── */
export default function LandingPage() {
  const { isDark } = useThemeStore()

  useEffect(() => {
    applyTheme(isDark)
  }, [isDark])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <PatientSection />
      <CTA />
      <Footer />
    </div>
  )
}
