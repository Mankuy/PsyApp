import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../stores/onboardingStore'
import { useLangStore } from '../stores/langStore'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'
import {
  Building2,
  Clock,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Brain,
} from 'lucide-react'

const DAYS = [
  { value: 1, labelEs: 'Lunes', labelEn: 'Monday' },
  { value: 2, labelEs: 'Martes', labelEn: 'Tuesday' },
  { value: 3, labelEs: 'Miércoles', labelEn: 'Wednesday' },
  { value: 4, labelEs: 'Jueves', labelEn: 'Thursday' },
  { value: 5, labelEs: 'Viernes', labelEn: 'Friday' },
  { value: 6, labelEs: 'Sábado', labelEn: 'Saturday' },
  { value: 0, labelEs: 'Domingo', labelEn: 'Sunday' },
]

const DURATIONS = [30, 45, 50, 60, 90]

export default function Onboarding() {
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const {
    practiceName,
    setPracticeName,
    defaultSessionDuration,
    setDefaultSessionDuration,
    availabilityRules,
    setAvailabilityRules,
    addAvailabilityRule,
    removeAvailabilityRule,
    complete,
  } = useOnboardingStore()

  const t = {
    title: lang === 'es' ? 'Configurá tu consultorio' : 'Set up your practice',
    subtitle: lang === 'es'
      ? 'Unos pasos rápidos para personalizar PsyApp a tu manera.'
      : 'A few quick steps to personalize PsyApp your way.',
    step1Title: lang === 'es' ? '¿Cómo se llama tu consultorio?' : 'What is your practice called?',
    step1Placeholder: lang === 'es' ? 'Ej: Consultorio Dr. García' : 'E.g.: Dr. García Practice',
    step2Title: lang === 'es' ? '¿Cuándo atendés?' : 'When do you see patients?',
    step2Subtitle: lang === 'es' ? 'Marcá los días y horarios de atención.' : 'Select your available days and hours.',
    step3Title: lang === 'es' ? '¿Cuánto dura cada sesión?' : 'How long is each session?',
    step3Subtitle: lang === 'es' ? 'Podés cambiarlo luego para cada cita en particular.' : 'You can change it later for individual appointments.',
    next: lang === 'es' ? 'Siguiente' : 'Next',
    back: lang === 'es' ? 'Atrás' : 'Back',
    finish: lang === 'es' ? 'Finalizar y entrar' : 'Finish and enter',
    addSlot: lang === 'es' ? 'Agregar horario' : 'Add time slot',
    from: lang === 'es' ? 'Desde' : 'From',
    to: lang === 'es' ? 'Hasta' : 'To',
    minutes: lang === 'es' ? 'minutos' : 'minutes',
    welcome: lang === 'es' ? '¡Listo, ' : 'All set, ',
    welcome2: lang === 'es' ? '! Tu consultorio está configurado.' : '! Your practice is configured.',
  }

  const updateRule = (index: number, field: string, value: string | number) => {
    const updated = [...availabilityRules]
    updated[index] = { ...updated[index], [field]: value }
    setAvailabilityRules(updated)
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Save each availability rule to backend
      for (const rule of availabilityRules) {
        await api.post('/availability/rules', rule)
      }
    } catch (err) {
      console.error('Failed to save rules:', err)
    }
    complete()
    setSaving(false)
    navigate('/')
  }

  const progress = ((step - 1) / 3) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4">
            <Brain size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{lang === 'es' ? 'Consultorio' : 'Practice'}</span>
            <span>{lang === 'es' ? 'Horarios' : 'Schedule'}</span>
            <span>{lang === 'es' ? 'Sesiones' : 'Sessions'}</span>
            <span>{lang === 'es' ? 'Listo' : 'Done'}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          {/* Step 1: Practice Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.step1Title}</h2>
                </div>
              </div>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                placeholder={t.step1Placeholder}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                onClick={() => setStep(2)}
                disabled={!practiceName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {t.next}
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Availability — redesigned */}
          {step === 2 && (
            <AvailabilityStep
              lang={lang}
              availabilityRules={availabilityRules}
              setAvailabilityRules={setAvailabilityRules}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {/* Step 3: Session Duration */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <Clock size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.step3Title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.step3Subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {DURATIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => setDefaultSessionDuration(min)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      defaultSessionDuration === min
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {min} {t.minutes}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                  {t.back}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {t.next}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.welcome}{user?.name}{t.welcome2}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {lang === 'es'
                    ? `Atendés de ${availabilityRules.length} días con sesiones de ${defaultSessionDuration} minutos. Podés modificar todo desde Configuración.`
                    : `You see patients ${availabilityRules.length} days a week with ${defaultSessionDuration}-minute sessions. You can change everything in Settings.`}
                </p>
              </div>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {t.finish}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Availability Step Component ---

const DAYS_SHORT = [
  { value: 1, labelEs: 'Lun', labelEn: 'Mon' },
  { value: 2, labelEs: 'Mar', labelEn: 'Tue' },
  { value: 3, labelEs: 'Mié', labelEn: 'Wed' },
  { value: 4, labelEs: 'Jue', labelEn: 'Thu' },
  { value: 5, labelEs: 'Vie', labelEn: 'Fri' },
  { value: 6, labelEs: 'Sáb', labelEn: 'Sat' },
  { value: 0, labelEs: 'Dom', labelEn: 'Sun' },
]

function AvailabilityStep({
  lang,
  availabilityRules,
  setAvailabilityRules,
  onNext,
  onBack,
}: {
  lang: 'es' | 'en'
  availabilityRules: { dayOfWeek: number; startTime: string; endTime: string; slotDuration: number }[]
  setAvailabilityRules: (rules: typeof availabilityRules) => void
  onNext: () => void
  onBack: () => void
}) {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    new Set(availabilityRules.map((r) => r.dayOfWeek))
  )
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')

  const t = {
    title: lang === 'es' ? '¿Cuándo atendés?' : 'When do you see patients?',
    subtitle: lang === 'es' ? 'Tocá los días que trabajás y elegí el horario.' : 'Tap the days you work and pick your hours.',
    weekdays: lang === 'es' ? 'Lunes a Viernes' : 'Monday to Friday',
    mornings: lang === 'es' ? 'Solo mañanas' : 'Mornings only',
    custom: lang === 'es' ? 'Personalizado' : 'Custom',
    from: lang === 'es' ? 'Desde' : 'From',
    to: lang === 'es' ? 'Hasta' : 'To',
    next: lang === 'es' ? 'Siguiente' : 'Next',
    back: lang === 'es' ? 'Atrás' : 'Back',
  }

  const toggleDay = (day: number) => {
    const next = new Set(selectedDays)
    if (next.has(day)) next.delete(day)
    else next.add(day)
    setSelectedDays(next)
  }

  const applyPreset = (type: 'weekdays' | 'mornings') => {
    if (type === 'weekdays') {
      setSelectedDays(new Set([1, 2, 3, 4, 5]))
      setStartTime('09:00')
      setEndTime('18:00')
    } else {
      setSelectedDays(new Set([1, 2, 3, 4, 5]))
      setStartTime('08:00')
      setEndTime('12:00')
    }
  }

  const handleNext = () => {
    const rules = Array.from(selectedDays).map((day) => ({
      dayOfWeek: day,
      startTime,
      endTime,
      slotDuration: 60,
    }))
    setAvailabilityRules(rules)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <CalendarDays size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.subtitle}</p>
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-2">
        <button
          onClick={() => applyPreset('weekdays')}
          className="flex-1 py-2 px-3 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {t.weekdays}
        </button>
        <button
          onClick={() => applyPreset('mornings')}
          className="flex-1 py-2 px-3 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {t.mornings}
        </button>
      </div>

      {/* Day toggles */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS_SHORT.map((d) => {
          const active = selectedDays.has(d.value)
          return (
            <button
              key={d.value}
              onClick={() => toggleDay(d.value)}
              className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                active
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {lang === 'es' ? d.labelEs : d.labelEn}
            </button>
          )
        })}
      </div>

      {/* Time range */}
      {selectedDays.size > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t.from}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
              />
            </div>
            <div className="text-gray-400 pt-5">—</div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t.to}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {selectedDays.size} {lang === 'es' ? 'días seleccionados' : 'days selected'}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={16} />
          {t.back}
        </button>
        <button
          onClick={handleNext}
          disabled={selectedDays.size === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {t.next}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
