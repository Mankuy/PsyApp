import { useState, useEffect } from 'react'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import {
  Bell,
  Send,
  SendHorizonal,
  CheckCircle2,
  Clock,
  CalendarDays,
  User,
  Mail,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface Appointment {
  id: string
  startTime: string
  endTime: string
  patient: { name: string; email: string; phone: string | null }
  status: string
}

interface NotificationLog {
  id: string
  recipient: string
  recipientType: string
  template: string
  status: string
  createdAt: string
  body: string
}

export default function Reminders() {
  const { lang } = useLangStore()
  const [upcoming, setUpcoming] = useState<Appointment[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sendingAll, setSendingAll] = useState(false)
  const [result, setResult] = useState<string>('')

  const t = {
    title: lang === 'es' ? 'Recordatorios' : 'Reminders',
    subtitle: lang === 'es' ? 'Envía recordatorios automáticos 24h antes de cada cita.' : 'Send automatic reminders 24h before each appointment.',
    upcoming: lang === 'es' ? 'Citas en las próximas 24h' : 'Appointments in next 24h',
    noUpcoming: lang === 'es' ? 'No hay citas en las próximas 24 horas.' : 'No appointments in the next 24 hours.',
    send: lang === 'es' ? 'Enviar recordatorio' : 'Send reminder',
    sendAll: lang === 'es' ? 'Enviar todos' : 'Send all',
    sent: lang === 'es' ? 'Enviado' : 'Sent',
    logs: lang === 'es' ? 'Historial de envíos' : 'Send history',
    noLogs: lang === 'es' ? 'Sin envíos registrados.' : 'No sends recorded.',
    channels: lang === 'es' ? 'Canales' : 'Channels',
    date: lang === 'es' ? 'Fecha' : 'Date',
    patient: lang === 'es' ? 'Paciente' : 'Patient',
    status: lang === 'es' ? 'Estado' : 'Status',
    email: 'Email',
    whatsapp: 'WhatsApp',
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [upRes, logRes] = await Promise.all([
        api.get('/notifications/upcoming'),
        api.get('/notifications/logs'),
      ])
      setUpcoming(upRes.data.data)
      setLogs(logRes.data.data)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSend = async (id: string) => {
    setSendingId(id)
    setResult('')
    try {
      const res = await api.post(`/notifications/send/${id}`)
      const data = res.data.data
      setResult(
        data.sent
          ? lang === 'es'
            ? `Recordatorio enviado por ${data.channels.join(' + ')}`
            : `Reminder sent via ${data.channels.join(' + ')}`
          : lang === 'es'
          ? 'Ya se envió un recordatorio recientemente'
          : 'A reminder was already sent recently'
      )
      await fetchData()
    } catch (err: any) {
      setResult(err.response?.data?.message || 'Error')
    }
    setSendingId(null)
  }

  const handleSendAll = async () => {
    setSendingAll(true)
    setResult('')
    try {
      const res = await api.post('/notifications/send-all')
      const data = res.data.data
      const sentCount = data.results.filter((r: any) => r.sent).length
      setResult(
        lang === 'es'
          ? `${sentCount} de ${data.total} recordatorios enviados`
          : `${sentCount} of ${data.total} reminders sent`
      )
      await fetchData()
    } catch (err: any) {
      setResult(err.response?.data?.message || 'Error')
    }
    setSendingAll(false)
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString(lang === 'es' ? 'es-UY' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        {upcoming.length > 0 && (
          <button
            onClick={handleSendAll}
            disabled={sendingAll}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {sendingAll && <Loader2 size={16} className="animate-spin" />}
            <SendHorizonal size={16} />
            {t.sendAll}
          </button>
        )}
      </div>

      {result && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg flex items-center gap-2 ${
          result.includes('Error') || result.includes('ya se envió')
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
        }`}>
          {result.includes('Error') || result.includes('ya se envió') ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {result}
        </div>
      )}

      {/* Upcoming appointments */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-indigo-500" />
          {t.upcoming}
          <span className="ml-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
            {upcoming.length}
          </span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t.noUpcoming}
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {appt.patient.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CalendarDays size={14} />
                    {formatDateTime(appt.startTime)}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {appt.patient.email && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Mail size={12} />
                        {t.email}
                      </span>
                    )}
                    {appt.patient.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MessageCircle size={12} />
                        {t.whatsapp}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSend(appt.id)}
                  disabled={sendingId === appt.id}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shrink-0"
                >
                  {sendingId === appt.id && <Loader2 size={14} className="animate-spin" />}
                  <Send size={14} />
                  {t.send}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Logs */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell size={16} className="text-indigo-500" />
          {t.logs}
        </h2>

        {logs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t.noLogs}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.date}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.patient}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.channels}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString(lang === 'es' ? 'es-UY' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      <div className="truncate max-w-[200px]">{log.recipient}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        {log.recipientType.includes('email') && <Mail size={12} />}
                        {log.recipientType.includes('whatsapp') && <MessageCircle size={12} />}
                        {log.recipientType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        log.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {log.status === 'SENT' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
