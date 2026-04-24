import { useState, useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import { Plus, Search, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

type Payment = {
  id: string
  patientName: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  method: 'card' | 'cash' | 'transfer'
  date: string
  description: string
}

const initialPayments: Payment[] = [
  { id: 'pi_1', patientName: 'John Doe', amount: 1500, currency: 'UYU', status: 'succeeded', method: 'cash', date: '2025-04-20', description: 'Sesión individual' },
  { id: 'pi_2', patientName: 'Alice Smith', amount: 1500, currency: 'UYU', status: 'pending', method: 'transfer', date: '2025-04-21', description: 'Sesión individual' },
  { id: 'pi_3', patientName: 'Michael Brown', amount: 2000, currency: 'UYU', status: 'failed', method: 'card', date: '2025-04-18', description: 'Sesión pareja' },
  { id: 'pi_4', patientName: 'Sarah Johnson', amount: 1500, currency: 'UYU', status: 'succeeded', method: 'cash', date: '2025-04-19', description: 'Sesión individual' },
]

const PaymentSchema = Yup.object().shape({
  patientName: Yup.string().required('Required'),
  amount: Yup.number().min(0.01).required('Required'),
  currency: Yup.string().required('Required'),
  method: Yup.string().oneOf(['card', 'cash', 'transfer']).required('Required'),
  description: Yup.string().required('Required'),
})

export default function Billing() {
  const { lang } = useLangStore()
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return payments.filter(
      (p) =>
        p.patientName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    )
  }, [payments, search])

  const totalSucceeded = useMemo(
    () => payments.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )
  const totalPending = useMemo(
    () => payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )

  const handleSubmit = (values: Omit<Payment, 'id' | 'status' | 'date'>) => {
    const newPayment: Payment = {
      id: `pi_${Math.random().toString(36).slice(2, 8)}`,
      ...values,
      status: values.method === 'card' ? 'pending' : 'succeeded',
      date: new Date().toISOString().split('T')[0],
    }
    setPayments((prev) => [newPayment, ...prev])
    setShowForm(false)
  }

  const t = {
    title: lang === 'es' ? 'Facturaci\u00f3n' : 'Billing',
    search: lang === 'es' ? 'Buscar pagos...' : 'Search payments...',
    add: lang === 'es' ? 'Nuevo Pago' : 'New Payment',
    createIntent: lang === 'es' ? 'Crear Intento de Pago' : 'Create Payment Intent',
    save: lang === 'es' ? 'Guardar' : 'Save',
    cancel: lang === 'es' ? 'Cancelar' : 'Cancel',
    patient: lang === 'es' ? 'Paciente' : 'Patient',
    amount: lang === 'es' ? 'Monto' : 'Amount',
    currency: lang === 'es' ? 'Moneda' : 'Currency',
    method: lang === 'es' ? 'M\u00e9todo' : 'Method',
    description: lang === 'es' ? 'Descripci\u00f3n' : 'Description',
    status: lang === 'es' ? 'Estado' : 'Status',
    succeeded: lang === 'es' ? 'Exitoso' : 'Succeeded',
    pending: lang === 'es' ? 'Pendiente' : 'Pending',
    failed: lang === 'es' ? 'Fallido' : 'Failed',
    date: lang === 'es' ? 'Fecha' : 'Date',
    noResults: lang === 'es' ? 'Sin resultados' : 'No results',
    totalSucceeded: lang === 'es' ? 'Total Exitoso' : 'Total Succeeded',
    totalPending: lang === 'es' ? 'Total Pendiente' : 'Total Pending',
    card: 'Card',
    cash: lang === 'es' ? 'Efectivo' : 'Cash',
    transfer: lang === 'es' ? 'Transferencia' : 'Transfer',
  }

  const statusIcon = (status: Payment['status']) => {
    if (status === 'succeeded') return <CheckCircle size={16} className="text-emerald-600" />
    if (status === 'failed') return <XCircle size={16} className="text-red-500" />
    return <Clock size={16} className="text-amber-500" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t.add}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{t.totalSucceeded}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalSucceeded.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{t.totalPending}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalPending.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{lang === 'es' ? 'Total Transacciones' : 'Total Transactions'}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{payments.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{lang === 'es' ? 'Tasa de \u00c9xito' : 'Success Rate'}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {payments.length
              ? `${Math.round((payments.filter((p) => p.status === 'succeeded').length / payments.length) * 100)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">{t.createIntent}</h2>
          <Formik
            initialValues={{
              patientName: '',
              amount: 0,
              currency: 'UYU',
              method: 'card' as const,
              description: 'Session fee',
            }}
            validationSchema={PaymentSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.patient}</label>
                  <Field name="patientName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="patientName" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.amount}</label>
                  <Field name="amount" type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="amount" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.currency}</label>
                  <Field name="currency" as="select" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    <option value="UYU">UYU ($)</option>
                    <option value="USD">USD ($)</option>
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.method}</label>
                  <Field name="method" as="select" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    <option value="card">{t.card}</option>
                    <option value="cash">{t.cash}</option>
                    <option value="transfer">{t.transfer}</option>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
                  <Field name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
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
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.patient}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.description}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.amount}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.method}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.status}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{t.date}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.id}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{p.patientName}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.description}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-1">
                    <CreditCard size={14} className="text-gray-400" />
                    {p.amount} {p.currency}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{p.method}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    p.status === 'succeeded'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : p.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {statusIcon(p.status)}
                    {p.status === 'succeeded' ? t.succeeded : p.status === 'pending' ? t.pending : t.failed}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
