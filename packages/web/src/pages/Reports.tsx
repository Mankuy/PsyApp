import { useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const incomeData = [
  { month: 'Jan', income: 4200, expenses: 1800 },
  { month: 'Feb', income: 5100, expenses: 1900 },
  { month: 'Mar', income: 4800, expenses: 1700 },
  { month: 'Apr', income: 6200, expenses: 2100 },
  { month: 'May', income: 5900, expenses: 2000 },
  { month: 'Jun', income: 7100, expenses: 2200 },
  { month: 'Jul', income: 6800, expenses: 2100 },
  { month: 'Aug', income: 7500, expenses: 2300 },
  { month: 'Sep', income: 6900, expenses: 2000 },
  { month: 'Oct', income: 8200, expenses: 2400 },
  { month: 'Nov', income: 7800, expenses: 2200 },
  { month: 'Dec', income: 9100, expenses: 2600 },
]

const weeklyData = [
  { day: 'Mon', appointments: 8, income: 960 },
  { day: 'Tue', appointments: 10, income: 1200 },
  { day: 'Wed', appointments: 6, income: 720 },
  { day: 'Thu', appointments: 12, income: 1440 },
  { day: 'Fri', appointments: 9, income: 1080 },
  { day: 'Sat', appointments: 4, income: 480 },
  { day: 'Sun', appointments: 2, income: 240 },
]

const methodData = [
  { name: 'Card', value: 65 },
  { name: 'Cash', value: 20 },
  { name: 'Transfer', value: 15 },
]

const COLORS = ['#6366f1', '#10b981', '#f59e0b']

export default function Reports() {
  const { lang } = useLangStore()

  const totalIncome = useMemo(
    () => incomeData.reduce((sum, d) => sum + d.income, 0),
    []
  )
  const totalExpenses = useMemo(
    () => incomeData.reduce((sum, d) => sum + d.expenses, 0),
    []
  )
  const avgMonthly = useMemo(() => totalIncome / 12, [totalIncome])

  const t = {
    title: lang === 'es' ? 'Informes' : 'Reports',
    totalIncome: lang === 'es' ? 'Ingresos Totales' : 'Total Income',
    totalExpenses: lang === 'es' ? 'Gastos Totales' : 'Total Expenses',
    avgMonthly: lang === 'es' ? 'Promedio Mensual' : 'Avg Monthly',
    netProfit: lang === 'es' ? 'Ganancia Neta' : 'Net Profit',
    incomeTrend: lang === 'es' ? 'Tendencia de Ingresos' : 'Income Trend',
    weeklyOverview: lang === 'es' ? 'Resumen Semanal' : 'Weekly Overview',
    paymentMethods: lang === 'es' ? 'M\u00e9todos de Pago' : 'Payment Methods',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t.title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{t.totalIncome}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{t.totalExpenses}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalExpenses.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{t.avgMonthly}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${Math.round(avgMonthly).toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">{t.netProfit}</h3>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${(totalIncome - totalExpenses).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 mb-4 dark:text-gray-100">{t.incomeTrend}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Legend />
              <Bar dataKey="income" name={lang === 'es' ? 'Ingresos' : 'Income'} fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name={lang === 'es' ? 'Gastos' : 'Expenses'} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 mb-4 dark:text-gray-100">{t.weeklyOverview}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="appointments" name={lang === 'es' ? 'Citas' : 'Appointments'} stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="income" name={lang === 'es' ? 'Ingresos' : 'Income'} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-900 dark:border-gray-700 max-w-md">
        <h2 className="text-base font-semibold text-gray-900 mb-4 dark:text-gray-100">{t.paymentMethods}</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={methodData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {methodData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
