import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import {
  CalendarDays,
  Clock,
  User,
  Mail,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function BookingPage() {
  const { psychologistId } = useParams<{ psychologistId: string }>()
  const { lang } = useLangStore()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const t = {
    title: lang === 'es' ? 'Reservar turno' : 'Book appointment',
    subtitle: lang === 'es' ? 'Seleccioná una fecha y horario que te convenga.' : 'Select a date and time that works for you.',
    selectDate: lang === 'es' ? '1. Elegí una fecha' : '1. Choose a date',
    selectTime: lang === 'es' ? '2. Elegí un horario' : '2. Choose a time',
    yourData: lang === 'es' ? '3. Tus datos' : '3. Your info',
    name: lang === 'es' ? 'Nombre completo' : 'Full name',
    email: 'Email',
    phone: lang === 'es' ? 'Teléfono' : 'Phone',
    notes: lang === 'es' ? 'Notas (opcional)' : 'Notes (optional)',
    notesPlaceholder: lang === 'es' ? 'Motivo de consulta, etc.' : 'Reason for visit, etc.',
    confirm: lang === 'es' ? 'Confirmar reserva' : 'Confirm booking',
    successTitle: lang === 'es' ? '¡Reserva confirmada!' : 'Booking confirmed!',
    successText: lang === 'es' ? 'Te enviamos un email con los detalles.' : 'We sent you an email with the details.',
    noSlots: lang === 'es' ? 'No hay horarios disponibles este día.' : 'No available slots this day.',
    loading: lang === 'es' ? 'Cargando...' : 'Loading...',
    back: lang === 'es' ? 'Volver' : 'Back',
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: { date: Date; disabled: boolean }[] = []

    // Previous month padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: new Date(year, month, -i), disabled: true })
    }
    days.reverse()

    // Current month
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i)
      days.push({ date: d, disabled: d < today })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), disabled: true })
    }

    return days
  }, [selectedDate])

  // Fetch slots when date changes
  useEffect(() => {
    if (!psychologistId) return
    const fetchSlots = async () => {
      setLoadingSlots(true)
      setSlots([])
      setSelectedSlot(null)
      try {
        const from = new Date(selectedDate)
        from.setHours(0, 0, 0, 0)
        const to = new Date(selectedDate)
        to.setHours(23, 59, 59, 999)
        const res = await api.get(
          `/availability/${psychologistId}/slots?from=${from.toISOString()}&to=${to.toISOString()}`
        )
        setSlots(res.data.data)
      } catch {
        setSlots([])
      }
      setLoadingSlots(false)
    }
    fetchSlots()
  }, [psychologistId, selectedDate])

  const handleSubmit = async () => {
    if (!selectedSlot || !psychologistId) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/availability/${psychologistId}/book-public`, {
        start: selectedSlot.start,
        end: selectedSlot.end,
        name,
        email,
        phone,
        notes,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reservar')
    }
    setSubmitting(false)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString(lang === 'es' ? 'es-UY' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const monthName = lang === 'es' ? MONTHS_ES[selectedDate.getMonth()] : MONTHS_EN[selectedDate.getMonth()]
  const dayNames = lang === 'es' ? DAYS_ES : DAYS_EN

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.successTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t.successText}</p>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays size={16} className="text-indigo-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {selectedDate.toLocaleDateString(lang === 'es' ? 'es-UY' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-indigo-500" />
              <span className="text-gray-700 dark:text-gray-300">{selectedSlot ? `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}` : ''}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-indigo-500" />
              <span className="text-gray-700 dark:text-gray-300">{name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-indigo-500" />
              <span className="text-gray-700 dark:text-gray-300">{email}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4">
            <Brain size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-8">
          {/* Date picker */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-indigo-500" />
              {t.selectDate}
            </h2>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{monthName} {selectedDate.getFullYear()}</span>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isSelected = day.date.toDateString() === selectedDate.toDateString()
                return (
                  <button
                    key={i}
                    onClick={() => !day.disabled && setSelectedDate(day.date)}
                    disabled={day.disabled}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : day.disabled
                        ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {day.date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              {t.selectTime}
            </h2>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                {t.loading}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.noSlots}</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedSlot?.start === slot.start
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Patient info form */}
          {selectedSlot && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                {t.yourData}
              </h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !name.trim() || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {t.confirm}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
