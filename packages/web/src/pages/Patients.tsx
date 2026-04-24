import { useState, useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import { Plus, Search, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

type Patient = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  notes: string
  status: 'active' | 'inactive'
}

const initialPatients: Patient[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1 555-0101', dateOfBirth: '1985-03-15', notes: 'Anxiety treatment', status: 'active' },
  { id: '2', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', phone: '+1 555-0102', dateOfBirth: '1990-07-22', notes: 'Depression therapy', status: 'active' },
  { id: '3', firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', phone: '+1 555-0103', dateOfBirth: '1978-11-05', notes: 'Couples counseling', status: 'inactive' },
  { id: '4', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', phone: '+1 555-0104', dateOfBirth: '1995-01-30', notes: 'Stress management', status: 'active' },
]

const PatientSchema = Yup.object().shape({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Required'),
  dateOfBirth: Yup.string().required('Required'),
})

export default function Patients() {
  const { lang } = useLangStore()
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    )
  }, [patients, search])

  const handleDelete = (id: string) => {
    if (confirm(lang === 'es' ? '¿Eliminar paciente?' : 'Delete patient?')) {
      setPatients((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleSubmit = (values: Omit<Patient, 'id' | 'status'>) => {
    if (editing) {
      setPatients((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...values } : p))
      )
    } else {
      const newPatient: Patient = {
        id: Math.random().toString(36).slice(2),
        ...values,
        status: 'active',
      }
      setPatients((prev) => [...prev, newPatient])
    }
    setShowForm(false)
    setEditing(null)
  }

  const t = {
    title: lang === 'es' ? 'Pacientes' : 'Patients',
    search: lang === 'es' ? 'Buscar pacientes...' : 'Search patients...',
    add: lang === 'es' ? 'Nuevo Paciente' : 'New Patient',
    edit: lang === 'es' ? 'Editar Paciente' : 'Edit Patient',
    save: lang === 'es' ? 'Guardar' : 'Save',
    cancel: lang === 'es' ? 'Cancelar' : 'Cancel',
    firstName: lang === 'es' ? 'Nombre' : 'First Name',
    lastName: lang === 'es' ? 'Apellido' : 'Last Name',
    email: 'Email',
    phone: lang === 'es' ? 'Teléfono' : 'Phone',
    dob: lang === 'es' ? 'Fecha de Nacimiento' : 'Date of Birth',
    notes: lang === 'es' ? 'Notas' : 'Notes',
    status: lang === 'es' ? 'Estado' : 'Status',
    active: lang === 'es' ? 'Activo' : 'Active',
    inactive: lang === 'es' ? 'Inactivo' : 'Inactive',
    noResults: lang === 'es' ? 'Sin resultados' : 'No results',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t.add}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
            {editing ? t.edit : t.add}
          </h2>
          <Formik
            initialValues={
              editing || {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                notes: '',
              }
            }
            validationSchema={PatientSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.firstName}</label>
                  <Field name="firstName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.lastName}</label>
                  <Field name="lastName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.email}</label>
                  <Field name="email" type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                  <Field name="phone" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.dob}</label>
                  <Field name="dateOfBirth" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="dateOfBirth" component="div" className="text-red-500 text-xs mt-1" />
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
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.firstName}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.lastName}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.email}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.phone}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.status}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{p.firstName}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{p.lastName}</td>
                <td className="px-4 py-3">
                  <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
                    <Mail size={14} />
                    {p.email}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Phone size={14} />
                    {p.phone}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    p.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {p.status === 'active' ? t.active : t.inactive}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditing(p); setShowForm(true) }}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors dark:hover:bg-indigo-900/30"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
    </div>
  )
}
