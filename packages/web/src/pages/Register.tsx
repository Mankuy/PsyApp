import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Eye, EyeOff, Brain, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useLangStore } from '../stores/langStore'

const RegisterSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Mínimo 2 caracteres').required('Requerido'),
  email: Yup.string().email('Email inválido').required('Requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Requerido'),
})

export default function Register() {
  const navigate = useNavigate()
  const { register, error, clearError } = useAuthStore()
  const { lang } = useLangStore()
  const [showPassword, setShowPassword] = useState(false)

  const t = {
    title: lang === 'es' ? 'Crear Cuenta' : 'Create Account',
    subtitle: lang === 'es' ? 'Comenzá a gestionar tu consultorio con PsyApp' : 'Start managing your practice with PsyApp',
    name: lang === 'es' ? 'Nombre completo' : 'Full name',
    email: 'Email',
    password: lang === 'es' ? 'Contraseña' : 'Password',
    confirmPassword: lang === 'es' ? 'Confirmar contraseña' : 'Confirm password',
    submit: lang === 'es' ? 'Registrarme' : 'Sign Up',
    hasAccount: lang === 'es' ? '¿Ya tenés cuenta?' : 'Already have an account?',
    login: lang === 'es' ? 'Iniciar sesión' : 'Sign In',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-4">
            <Brain size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PsyApp</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t.title}</h2>

          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={RegisterSchema}
            onSubmit={async (values, { setSubmitting }) => {
              clearError()
              const ok = await register(values.name, values.email, values.password)
              if (ok) navigate('/')
              setSubmitting(false)
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
                  <Field
                    name="name"
                    autoComplete="name"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Dr. María González"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.email}</label>
                  <Field
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="tu@email.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.password}</label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.confirmPassword}</label>
                  <Field
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {t.submit}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t.hasAccount}{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              {t.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
