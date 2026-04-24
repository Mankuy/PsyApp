import { useState } from 'react'
import { useLangStore } from '../stores/langStore'
import { Shield, Copy, CheckCircle2 } from 'lucide-react'

export default function TwoFA() {
  const { lang } = useLangStore()
  const [enabled, setEnabled] = useState(false)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const secret = 'JBSWY3DPEHPK3PXP' // Demo secret

  const texts = {
    es: { title: 'Seguridad', subtitle: 'Autenticación de dos factores', desc: 'Agregá una capa extra de seguridad a tu cuenta.', secret: 'Clave secreta', copy: 'Copiar', copied: 'Copiado', enable: 'Activar 2FA', disable: 'Desactivar 2FA', verify: 'Verificar código' },
    en: { title: 'Security', subtitle: 'Two-factor authentication', desc: 'Add an extra layer of security to your account.', secret: 'Secret key', copy: 'Copy', copied: 'Copied', enable: 'Enable 2FA', disable: 'Disable 2FA', verify: 'Verify code' },
  }
  const t = (texts as any)[lang] || texts.es

  const handleCopy = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t.desc}</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
            <Shield className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{t.subtitle}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{enabled ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>

        {!enabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t.secret}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono">{secret}</code>
                <button onClick={handleCopy} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <button onClick={() => setEnabled(true)} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              {t.enable}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.verify}</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button onClick={() => setEnabled(false)} className="w-full py-2.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              {t.disable}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
