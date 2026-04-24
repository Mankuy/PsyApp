import { useState, useEffect, useRef, useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'
import { FileText, Plus, Trash2, CheckCircle2, Loader2, X, Printer, User } from 'lucide-react'

const CONSENT_TEMPLATES = [
  {
    key: 'adulto',
    titleEs: 'Consentimiento Informado — Adultos',
    titleEn: 'Informed Consent — Adults',
    body: (psychName: string, patientName: string, date: string) =>
      `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO PSICOLÓGICO

Psicólog@: ${psychName}
Paciente: ${patientName}
Fecha: ${date}

1. OBJETO DEL CONSENTIMIENTO
El presente documento tiene por objeto informar al paciente sobre las características del tratamiento psicológico, sus beneficios, riesgos y alternativas, de modo que pueda tomar una decisión libre y voluntaria.

2. NATURALEZA DEL SERVICIO
El tratamiento psicológico consiste en sesiones terapéuticas individuales orientadas a la evaluación, diagnóstico y tratamiento de problemáticas emocionales, conductuales o de salud mental.

3. CONFIDENCIALIDAD
La información proporcionada por el paciente será tratada con estricta confidencialidad, salvo en los casos previstos por la ley (riesgo inminente de daño a sí mismo o terceros, situaciones de abuso a menores).

4. DURACIÓN Y FRECUENCIA
La duración de cada sesión será de aproximadamente 50-60 minutos. La frecuencia será acordada entre el profesional y el paciente.

5. HONORARIOS
El paciente se compromete a abonar el valor de cada sesión acordado. En caso de inasistencia sin previo aviso de al menos 24 horas, se podrá facturar la sesión.

6. DERECHOS DEL PACIENTE
El paciente tiene derecho a:
- Recibir información clara sobre el tratamiento.
- Retirar el consentimiento en cualquier momento.
- Solicitar una segunda opinión.
- Ser tratado con respeto y dignidad.

DECLARACIÓN DEL PACIENTE
He leído y comprendido la información proporcionada. Acepto voluntariamente iniciar el tratamiento psicológico con ${psychName}.

_________________________________
Firma del paciente

_________________________________
Firma del profesional`,
  },
  {
    key: 'telemedicina',
    titleEs: 'Consentimiento — Telemedicina',
    titleEn: 'Consent — Telemedicine',
    body: (psychName: string, patientName: string, date: string) =>
      `CONSENTIMIENTO INFORMADO PARA ATENCIÓN PSICOLÓGICA A DISTANCIA (TELEPSICOLOGÍA)

Psicólog@: ${psychName}
Paciente: ${patientName}
Fecha: ${date}

1. DESCRIPCIÓN DEL SERVICIO
Las sesiones se realizarán mediante videollamada a través de una plataforma segura. El paciente debe contar con un espacio privado, conexión estable y dispositivo con cámara y micrófono.

2. LIMITACIONES
La telepsicología puede no ser adecuada para todas las condiciones. El profesional evaluará la conveniencia de este formato en cada caso.

3. CONFIDENCIALIDAD Y SEGURIDAD
Se utilizarán plataformas con cifrado de extremo a extremo. El paciente se compromete a no grabar ni capturar las sesiones sin autorización.

4. PROTOCOLO DE EMERGENCIA
En caso de crisis, el paciente contactará al 0800-1920 (Uruguay) o al servicio de emergencias más cercano.

_________________________________
Firma del paciente

_________________________________
Firma del profesional`,
  },
  {
    key: 'ninyas',
    titleEs: 'Consentimiento — Niñ@s y Adolescentes',
    titleEn: 'Consent — Children & Teens',
    body: (psychName: string, patientName: string, date: string) =>
      `CONSENTIMIENTO INFORMADO PARA TRATAMIENTO PSICOLÓGICO DE MENORES

Psicólog@: ${psychName}
Paciente: ${patientName}
Fecha: ${date}

1. REPRESENTANTE LEGAL
El presente consentimiento es otorgado por el representante legal del menor, quien autoriza el tratamiento psicológico.

2. INFORMACIÓN AL MENOR
Se informará al menor, en lenguaje adecuado a su edad, sobre la naturaleza del tratamiento.

3. CONFIDENCIALIDAD
La información del menor será confidencial, aunque el profesional podrá compartir con los representantes legales información general sobre el progreso, salvo que ello perjudique al menor.

4. DERECHOS
El representante legal y el menor tienen derecho a:
- Ser informados sobre el tratamiento.
- Retirar el consentimiento en cualquier momento.
- Acceder a la información de la historia clínica.

_________________________________
Firma del representante legal

_________________________________
Firma del profesional`,
  },
]

export default function Documents() {
  const { lang } = useLangStore()
  const { user } = useAuthStore()
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [patientName, setPatientName] = useState('')
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const t = {
    title: lang === 'es' ? 'Consentimientos' : 'Consent forms',
    subtitle: lang === 'es' ? 'Generá y gestioná consentimientos informados.' : 'Generate and manage informed consents.',
    add: lang === 'es' ? 'Nuevo consentimiento' : 'New consent',
    patient: lang === 'es' ? 'Nombre del paciente' : 'Patient name',
    selectType: lang === 'es' ? 'Seleccioná el tipo' : 'Select type',
    preview: lang === 'es' ? 'Vista previa' : 'Preview',
    print: lang === 'es' ? 'Imprimir / Guardar' : 'Print / Save',
    sign: lang === 'es' ? 'Marcar como firmado' : 'Mark as signed',
    signed: lang === 'es' ? 'Firmado' : 'Signed',
    pending: lang === 'es' ? 'Pendiente' : 'Pending',
    noResults: lang === 'es' ? 'Sin documentos.' : 'No documents.',
    close: lang === 'es' ? 'Cerrar' : 'Close',
    create: lang === 'es' ? 'Crear' : 'Create',
  }

  const fetchDocs = async () => {
    try { const res = await api.get('/documents'); setDocs(res.data.data) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [])

  const handleCreate = async () => {
    const tpl = CONSENT_TEMPLATES.find((t) => t.key === selectedTemplate)
    if (!tpl || !patientName.trim() || !user?.name) return
    try {
      await api.post('/documents', { title: lang === 'es' ? tpl.titleEs : tpl.titleEn, patientName })
      await fetchDocs()
      setShowForm(false)
      setSelectedTemplate('')
      setPatientName('')
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'es' ? '¿Eliminar?' : 'Delete?')) return
    try { await api.delete(`/documents/${id}`); setDocs((p) => p.filter((d) => d.id !== id)) }
    catch {}
  }

  const handleSign = async (id: string) => {
    try {
      const res = await api.patch(`/documents/${id}/sign`)
      setDocs((prev) => prev.map((d) => d.id === id ? { ...d, signedAt: res.data.data.signedAt } : d))
    } catch {}
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Consentimiento</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 700px; margin: 0 auto; }
          h1 { font-size: 18px; margin-bottom: 20px; }
          p { margin-bottom: 12px; }
          .signature { margin-top: 40px; border-top: 1px solid #333; padding-top: 10px; width: 300px; }
        </style></head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const previewContent = useMemo(() => {
    if (!previewDoc || !user?.name) return ''
    const tpl = CONSENT_TEMPLATES.find((t) => t.key === previewDoc)
    if (!tpl) return ''
    return tpl.body(user.name, 'Nombre del paciente', new Date().toLocaleDateString())
  }, [previewDoc, user])

  if (previewDoc) {
    const tpl = CONSENT_TEMPLATES.find((t) => t.key === previewDoc)
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lang === 'es' ? tpl?.titleEs : tpl?.titleEn}</h1>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
              <Printer size={16} />
              {t.print}
            </button>
            <button onClick={() => setPreviewDoc(null)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={16} />
              {t.close}
            </button>
          </div>
        </div>
        <div ref={printRef} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm max-w-3xl mx-auto whitespace-pre-line font-serif text-gray-900 dark:text-gray-100 leading-relaxed">
          {previewContent}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">{t.add}</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.patient}</label>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Ej: María González"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.selectType}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONSENT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.key}
                    onClick={() => setSelectedTemplate(tpl.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedTemplate === tpl.key
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{lang === 'es' ? tpl.titleEs : tpl.titleEn}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700">
                {t.close}
              </button>
              <button onClick={() => selectedTemplate && setPreviewDoc(selectedTemplate)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700">
                {t.preview}
              </button>
              <button onClick={handleCreate} disabled={!selectedTemplate || !patientName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors">
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <FileText size={20} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doc.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {doc.patient?.name || (lang === 'es' ? 'Sin paciente' : 'No patient')} · {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                doc.signedAt ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
              }`}>
                {doc.signedAt ? t.signed : t.pending}
              </span>
              {!doc.signedAt && (
                <button onClick={() => handleSign(doc.id)}
                  className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors dark:hover:bg-emerald-900/20"
                  title={t.sign}>
                  <CheckCircle2 size={16} />
                </button>
              )}
              <button onClick={() => handleDelete(doc.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors dark:hover:bg-red-900/20">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {docs.length === 0 && <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">{t.noResults}</div>}
        </div>
      )}
    </div>
  )
}
