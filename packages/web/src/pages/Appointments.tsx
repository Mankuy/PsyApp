import { useState, useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import { useAuthStore } from '../stores/authStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import { Plus, Search, Pencil, Trash2, CalendarDays, Clock, Video, CheckCircle2, XCircle } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, parseISO } from 'date-fns'

const AppointmentSchema = Yup.object().shape({
  patientName: Yup.string().required('Required'),
  date: Yup.string().required('Required'),
  time: Yup.string().required('Required'),
  duration: Yup.number().min(5).required('Required'),
})

export default function Appointments() {
  const { lang } = useLangStore()
  const { user } = useAuthStore()
  const { appointments, add, update: updateAppt, remove, complete, cancel } = useAppointmentStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.professional.toLowerCase().includes(q)
    )
  }, [appointments, search])

  const calendarEvents = useMemo(
    () =>
      appointments.map((a) => ({
        id: a.id,
        title: `${a.patientName}`,
        start: `${a.date}T${a.time}`,
        end: `${a.date}T${String(Number(a.time.split(':')[0]) + Math.floor(a.duration / 60)).padStart(2, '0')}:${String((Number(a.time.split(':')[1]) + (a.duration % 60)) % 60).padStart(2, '0')}`,
        backgroundColor:
          a.status === 'completed'
            ? '#10b981'
            : a.status === 'cancelled'
            ? '#ef4444'
            : '#6366f1',
        borderColor:
          a.status === 'completed'
            ? '#10b981'
            : a.status === 'cancelled'
            ? '#ef4444'
            : '#6366f1',
      })),
    [appointments]
  )

  const handleDelete = (id: string) => {
    if (confirm(lang === 'es' ? '\u00bfEliminar cita?' : 'Delete appointment?')) {
      remove(id)
    }
  }

  const handleSubmit = (values: any) => {
    const professionalName = user?.name || 'Dr.'
    if (editing) {
      updateAppt(editing.id, { ...values, professional: professionalName })
    } else {
      add({ ...values, professional: professionalName, notes: values.notes || '' })
    }
    setShowForm(false)
    setEditing(null)
  }

  const t = {
    title: lang === 'es' ? 'Citas' : 'Appointments',
    search: lang === 'es' ? 'Buscar citas...' : 'Search appointments...',
    add: lang === 'es' ? 'Nueva Cita' : 'New Appointment',
    edit: lang === 'es' ? 'Editar Cita' : 'Edit Appointment',
    save: lang === 'es' ? 'Guardar' : 'Save',
    cancel: lang === 'es' ? 'Cancelar' : 'Cancel',
    patient: lang === 'es' ? 'Paciente' : 'Patient',
    date: lang === 'es' ? 'Fecha' : 'Date',
    time: lang === 'es' ? 'Hora' : 'Time',
    duration: lang === 'es' ? 'Duraci\u00f3n (min)' : 'Duration (min)',
    notes: lang === 'es' ? 'Notas' : 'Notes',
    status: lang === 'es' ? 'Estado' : 'Status',
    scheduled: lang === 'es' ? 'Programada' : 'Scheduled',
    completed: lang === 'es' ? 'Completada' : 'Completed',
    cancelled: lang === 'es' ? 'Cancelada' : 'Cancelled',
    noResults: lang === 'es' ? 'Sin resultados' : 'No results',
    listView: lang === 'es' ? 'Lista' : 'List',
    calendarView: lang === 'es' ? 'Calendario' : 'Calendar',
    markCompleted: lang === 'es' ? 'Completar' : 'Complete',
    markCancelled: lang === 'es' ? 'Cancelar' : 'Cancel',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5 dark:bg-gray-800">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {t.listView}
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {t.calendarView}
            </button>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            {t.add}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
            {editing ? t.edit : t.add}
          </h2>
          <Formik
            initialValues={
              editing || {
                patientName: '',
                date: '',
                time: '',
                duration: 60,
                notes: '',
              }
            }
            validationSchema={AppointmentSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.patient}</label>
                  <Field name="patientName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="patientName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{lang === 'es' ? 'Profesional:' : 'Professional:'}</span>
                  {user?.name || '—'}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.date}</label>
                  <Field name="date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="date" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.time}</label>
                  <Field name="time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="time" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.duration}</label>
                  <Field name="duration" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="duration" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.notes}</label>
                  <Field name="notes" as="textarea" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                    {t.save}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                    {t.cancel}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {view === 'list' ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.patient}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.date}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.time}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.duration}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.status}</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{a.patientName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{a.professional}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <CalendarDays size={14} />
                        {format(parseISO(a.date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock size={14} />
                        {a.time}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.duration} min</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        a.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : a.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                        {a.status === 'scheduled' ? t.scheduled : a.status === 'completed' ? t.completed : t.cancelled}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => complete(a.id)}
                              title={t.markCompleted}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors dark:hover:bg-emerald-900/30"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => cancel(a.id)}
                              title={t.markCancelled}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors dark:hover:bg-red-900/30"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {a.videoLink && (
                          <button
                            onClick={() => window.open(a.videoLink, '_blank', 'noopener,noreferrer')}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors dark:hover:bg-emerald-900/30"
                            title={lang === 'es' ? 'Videollamada' : 'Video call'}
                          >
                            <Video size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditing(a); setShowForm(true) }}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors dark:hover:bg-indigo-900/30"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors dark:hover:bg-red-900/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      {t.noResults}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
          />
        </div>
      )}
    </div>
  )
}
