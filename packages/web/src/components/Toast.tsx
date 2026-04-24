import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notify(message: string, type: Toast['type'] = 'success') {
  const toast = { id: Math.random().toString(36).slice(2), message, type }
  toasts = [...toasts, toast]
  toastListeners.forEach((l) => l(toasts))
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id)
    toastListeners.forEach((l) => l(toasts))
  }, 4000)
}

export const toast = { success: (m: string) => notify(m, 'success'), error: (m: string) => notify(m, 'error'), warning: (m: string) => notify(m, 'warning') }

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([])
  useEffect(() => {
    toastListeners.push(setItems)
    return () => { toastListeners = toastListeners.filter((l) => l !== setItems) }
  }, [])

  if (items.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map((t) => (
        <div key={t.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 toast-enter min-w-[280px]">
          {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
          {t.type === 'error' && <XCircle size={18} className="text-red-500 shrink-0" />}
          {t.type === 'warning' && <AlertCircle size={18} className="text-amber-500 shrink-0" />}
          <span className="text-sm text-gray-700 dark:text-gray-200 flex-1">{t.message}</span>
          <button onClick={() => { toasts = toasts.filter((x) => x.id !== t.id); toastListeners.forEach((l) => l(toasts)) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
