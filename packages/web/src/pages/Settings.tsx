import { useLangStore } from '../stores/langStore'
import { useThemeStore } from '../stores/themeStore'
import { Sun, Moon } from 'lucide-react'

export default function Settings() {
  const { lang, toggleLang } = useLangStore()
  const { isDark, toggle } = useThemeStore()

  const t = {
    title: lang === 'es' ? 'Configuraci\u00f3n' : 'Settings',
    language: lang === 'es' ? 'Idioma' : 'Language',
    theme: lang === 'es' ? 'Tema' : 'Theme',
    darkMode: lang === 'es' ? 'Modo Oscuro' : 'Dark Mode',
    lightMode: lang === 'es' ? 'Modo Claro' : 'Light Mode',
    english: 'English',
    spanish: 'Espa\u00f1ol',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t.title}</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm dark:bg-gray-900 dark:border-gray-700 max-w-lg">
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.language}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {lang === 'es' ? 'Cambia el idioma de la interfaz.' : 'Change the interface language.'}
            </p>
          </div>
          <button
            onClick={toggleLang}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {lang === 'es' ? t.english : t.spanish}
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.theme}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isDark
                ? lang === 'es' ? 'Actualmente en modo oscuro.' : 'Currently in dark mode.'
                : lang === 'es' ? 'Actualmente en modo claro.' : 'Currently in light mode.'}
            </p>
          </div>
          <button
            onClick={toggle}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? t.lightMode : t.darkMode}
          </button>
        </div>
      </div>
    </div>
  )
}
