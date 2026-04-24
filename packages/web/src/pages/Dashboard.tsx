import { useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import { useAuthStore } from '../stores/authStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import { usePaymentStore } from '../stores/paymentStore'
import { Users, CalendarDays, CreditCard, TrendingUp, Clock } from 'lucide-react'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'

function StatCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
}: {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">{label}</h3>
        <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/30">
          <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className={`text-sm font-semibold mt-1 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{change}</div>
    </div>
  )
}

function ActivityRow({
  icon: Icon,
  title,
  subtitle,
  time,
  color,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  time: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-700">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{time}</div>
    </div>
  )
}

export default function Dashboard() {
  const { lang } = useLangStore()
  const { user } = useAuthStore()
  const { appointments } = useAppointmentStore()
  const { payments } = usePaymentStore()

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const stats = useMemo(() => {
    const uniquePatients = new Set(appointments.map((a) => a.patientName)).size
    const todayAppts = appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled').length
    const pendingAmount = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
    const monthlyIncome = payments.filter((p) => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0)

    return {
      uniquePatients,
      todayAppts,
      pendingAmount,
      monthlyIncome,
    }
  }, [appointments, payments, todayStr])

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'scheduled' && (a.date === todayStr || a.date > todayStr))
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
      .slice(0, 4)
  }, [appointments, todayStr])

  const recentActivity = useMemo(() => {
    const apptEvents = appointments.slice(0, 6).map((a) => ({
      type: 'appt' as const,
      title: a.status === 'completed'
        ? `${lang === 'es' ? 'Cita completada' : 'Appointment completed'}`
        : a.status === 'cancelled'
        ? `${lang === 'es' ? 'Cita cancelada' : 'Appointment cancelled'}`
        : `${lang === 'es' ? 'Cita programada' : 'Appointment scheduled'}`,
      subtitle: `${a.patientName} — ${a.time}`,
      date: a.date,
      color: a.status === 'completed'
        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        : a.status === 'cancelled'
        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    }))

    const paymentEvents = payments.slice(0, 4).map((p) => ({
      type: 'payment' as const,
      title: p.status === 'succeeded'
        ? `${lang === 'es' ? 'Pago recibido' : 'Payment received'}`
        : p.status === 'failed'
        ? `${lang === 'es' ? 'Pago fallido' : 'Payment failed'}`
        : `${lang === 'es' ? 'Pago pendiente' : 'Payment pending'}`,
      subtitle: `${p.patientName} — $${p.amount.toLocaleString()}`,
      date: p.date,
      color: p.status === 'succeeded'
        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        : p.status === 'failed'
        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    }))

    return [...paymentEvents, ...apptEvents].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [appointments, payments, lang])

  const t = {
    title: lang === 'es' ? 'Panel' : 'Dashboard',
    totalPatients: lang === 'es' ? 'Total de Pacientes' : 'Total Patients',
    appointmentsToday: lang === 'es' ? 'Citas Hoy' : 'Appointments Today',
    pendingInvoices: lang === 'es' ? 'Facturas Pendientes' : 'Pending Invoices',
    monthlyIncome: lang === 'es' ? 'Ingresos Totales' : 'Total Income',
    upcomingAppointments: lang === 'es' ? 'Próximas Citas' : 'Upcoming Appointments',
    recentActivity: lang === 'es' ? 'Actividad Reciente' : 'Recent Activity',
    preview: lang === 'es' ? 'Vista Previa de PsyApp — Construido con fines de demostración.' : 'PsyApp Preview — Built for demonstration purposes.',
  }

  const formatDateLabel = (dateStr: string) => {
    if (isToday(parseISO(dateStr))) return lang === 'es' ? 'Hoy' : 'Today'
    if (isTomorrow(parseISO(dateStr))) return lang === 'es' ? 'Mañana' : 'Tomorrow'
    return format(parseISO(dateStr), 'MMM dd')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.title}{user ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label={t.totalPatients}
          value={String(stats.uniquePatients)}
          change={lang === 'es' ? `${stats.uniquePatients > 0 ? '+' : ''}${stats.uniquePatients} activos` : `${stats.uniquePatients} active`}
          positive
          icon={Users}
        />
        <StatCard
          label={t.appointmentsToday}
          value={String(stats.todayAppts)}
          change={stats.todayAppts > 0 ? (lang === 'es' ? `${stats.todayAppts} hoy` : `${stats.todayAppts} today`) : (lang === 'es' ? 'Sin citas hoy' : 'No appointments today')}
          positive={stats.todayAppts > 0}
          icon={CalendarDays}
        />
        <StatCard
          label={t.pendingInvoices}
          value={`$${stats.pendingAmount.toLocaleString()}`}
          change={lang === 'es' ? 'UYU pendientes' : 'UYU pending'}
          positive={stats.pendingAmount === 0}
          icon={CreditCard}
        />
        <StatCard
          label={t.monthlyIncome}
          value={`$${stats.monthlyIncome.toLocaleString()}`}
          change={lang === 'es' ? 'UYU recaudados' : 'UYU collected'}
          positive
          icon={TrendingUp}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 mb-3 dark:text-gray-100">{t.upcomingAppointments}</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">{lang === 'es' ? 'No hay citas programadas.' : 'No upcoming appointments.'}</p>
          ) : (
            upcomingAppointments.map((a) => (
              <ActivityRow
                key={a.id}
                icon={CalendarDays}
                title={a.patientName}
                subtitle={`${user?.name || ''} — ${a.time}`}
                time={formatDateLabel(a.date)}
                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              />
            ))
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 mb-3 dark:text-gray-100">{t.recentActivity}</h2>
          {recentActivity.map((item, i) => (
            <ActivityRow
              key={i}
              icon={item.type === 'payment' ? CreditCard : CalendarDays}
              title={item.title}
              subtitle={item.subtitle}
              time={formatDateLabel(item.date)}
              color={item.color}
            />
          ))}
        </div>
      </section>

      <div className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">{t.preview}</div>
    </div>
  )
}
