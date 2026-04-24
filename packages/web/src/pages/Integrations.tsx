import { useLangStore } from '../stores/langStore'
import { useIntegrationStore } from '../stores/integrationStore'
import { MessageCircle, Mail, Calendar, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

export default function Integrations() {
  const { lang } = useLangStore()
  const { integrations, connect, disconnect } = useIntegrationStore()

  const t = {
    es: { title: 'Integraciones', connected: 'Conectado', connect: 'Conectar', disconnect: 'Desconectar', desc: 'Conectá PsyApp con tus herramientas favoritas.' },
    en: { title: 'Integrations', connected: 'Connected', connect: 'Connect', disconnect: 'Disconnect', desc: 'Connect PsyApp with your favorite tools.' },
  }[lang]

  const icons = { whatsapp: MessageCircle, email: Mail, calendar: Calendar }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t.desc}</p>
      <div className="space-y-4">
        {integrations.map((i) => {
          const Icon = icons[i.type]
          return (
            <div key={i.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover-lift">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i.connected ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{lang === 'es' ? i.nameEs : i.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm">
                    {i.connected ? (
                      <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{t.connected}</span></>
                    ) : (
                      <><XCircle size={14} className="text-gray-400" /><span className="text-gray-400">{lang === 'es' ? 'Desconectado' : 'Disconnected'}</span></>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => i.connected ? disconnect(i.id) : connect(i.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i.connected ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {i.connected ? t.disconnect : t.connect}
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          {lang === 'es' ? 'Para integraciones reales, contactá al soporte para configurar API keys.' : 'For real integrations, contact support to configure API keys.'}
        </p>
      </div>
    </div>
  )
}
