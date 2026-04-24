import { useState, useEffect, useMemo } from 'react'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import { useTemplateStore } from '../stores/templateStore'
import {
  FileText, Plus, Search, Pencil, Trash2, Save, X, ChevronLeft,
  User, Stethoscope, HeartPulse, BrainCircuit, Loader2, Sparkles,
  Wand2, MessageSquare, LayoutList
} from 'lucide-react'

interface Note {
  id: string
  content: string
  summary: string | null
  patientId: string
  patient: { name: string }
  appointmentId: string | null
  appointment: { startTime: string } | null
  createdAt: string
  updatedAt: string
}

const BUILTIN_TEMPLATES = {
  soap: {
    labelEs: 'SOAP', labelEn: 'SOAP', icon: Stethoscope,
    bodyEs: `**Subjetivo:**\nEl paciente refiere...\n\n**Objetivo:**\nSe observa...\n\n**Evaluación:**\nSe considera...\n\n**Plan:**\nSe propone...`,
    bodyEn: `**Subjective:**\nPatient reports...\n\n**Objective:**\nObserved...\n\n**Assessment:**\nConsidered...\n\n**Plan:**\nProposed...`,
  },
  eva: {
    labelEs: 'EVA', labelEn: 'VAS', icon: HeartPulse,
    bodyEs: `**Evento:**\n\n**Valoración:**\n\n**Actitud:**\n`,
    bodyEn: `**Event:**\n\n**Valuation:**\n\n**Attitude:**\n`,
  },
  automatic: {
    labelEs: 'Pensamiento automático', labelEn: 'Automatic thoughts', icon: BrainCircuit,
    bodyEs: `**Situación:**\n\n**Pensamiento automático:**\n\n**Emoción:**\n\n**Comportamiento:**\n\n**Pensamiento alternativo:**\n`,
    bodyEn: `**Situation:**\n\n**Automatic thought:**\n\n**Emotion:**\n\n**Behavior:**\n\n**Alternative thought:**\n`,
  },
  free: {
    labelEs: 'Nota libre', labelEn: 'Free note', icon: FileText,
    bodyEs: ``, bodyEn: ``,
  },
}

export default function Notes() {
  const { lang } = useLangStore()
  const { customTemplates, addTemplate, removeTemplate } = useTemplateStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('free')
  const [content, setContent] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateBody, setNewTemplateBody] = useState('')

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    try { const res = await api.get('/notes'); setNotes(res.data.data) }
    catch {} finally { setLoading(false) }
  }

  const allTemplates = useMemo(() => {
    const custom = customTemplates.map((t) => ({
      key: `custom-${t.id}`,
      labelEs: t.name,
      labelEn: t.nameEn,
      icon: FileText,
      bodyEs: t.bodyEs,
      bodyEn: t.bodyEn,
      isCustom: true,
      customId: t.id,
    }))
    const builtin = Object.entries(BUILTIN_TEMPLATES).map(([key, t]) => ({
      key, labelEs: t.labelEs, labelEn: t.labelEn, icon: t.icon,
      bodyEs: t.bodyEs, bodyEn: t.bodyEn, isCustom: false,
    }))
    return [...builtin, ...custom]
  }, [customTemplates])

  const handleTemplateSelect = (key: string) => {
    setSelectedTemplate(key)
    const tpl = allTemplates.find((t) => t.key === key)
    if (tpl) setContent(lang === 'es' ? tpl.bodyEs : tpl.bodyEn)
  }

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setError('')
    try {
      const res = await api.post('/ai/assist', { prompt: aiPrompt })
      if (res.data.success) {
        setContent((prev) => prev + (prev ? '\n\n' : '') + res.data.content)
        setAiPrompt('')
      } else {
        setError(res.data.error || 'Error del asistente')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error de conexión con el asistente')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiOrganize = async () => {
    if (!content.trim()) {
      setError(lang === 'es' ? 'Escribí algo en la nota primero' : 'Write something in the note first')
      return
    }
    setAiLoading(true)
    setError('')
    try {
      const res = await api.post('/ai/organize', { text: content })
      if (res.data.success) {
        setContent(res.data.content)
      } else {
        setError(res.data.error || 'Error del asistente')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error de conexión')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPatient || !content.trim()) return
    setSaving(true)
    try {
      if (editing) await api.patch(`/notes/${editing.id}`, { content })
      else await api.post('/notes', { patientId: selectedPatient, content, template: selectedTemplate })
      await fetchNotes()
      resetForm()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'es' ? '¿Eliminar nota?' : 'Delete note?')) return
    try { await api.delete(`/notes/${id}`); setNotes((prev) => prev.filter((n) => n.id !== id)) }
    catch {}
  }

  const handleEdit = (note: Note) => {
    setEditing(note)
    setSelectedPatient(note.patientId)
    setContent(note.content || '')
    setSelectedTemplate('free')
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null)
    setSelectedPatient('')
    setSelectedTemplate('free')
    setContent('')
    setShowForm(false)
    setShowAiPanel(false)
    setShowTemplateForm(false)
    setError('')
  }

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateBody.trim()) return
    addTemplate({
      name: newTemplateName,
      nameEn: newTemplateName,
      bodyEs: newTemplateBody,
      bodyEn: newTemplateBody,
    })
    setNewTemplateName('')
    setNewTemplateBody('')
    setShowTemplateForm(false)
  }

  const t = {
    title: lang === 'es' ? 'Notas clínicas' : 'Clinical notes',
    search: lang === 'es' ? 'Buscar notas...' : 'Search notes...',
    add: lang === 'es' ? 'Nueva nota' : 'New note',
    edit: lang === 'es' ? 'Editar nota' : 'Edit note',
    save: lang === 'es' ? 'Guardar' : 'Save',
    cancel: lang === 'es' ? 'Cancelar' : 'Cancel',
    patient: lang === 'es' ? 'Paciente' : 'Patient',
    template: lang === 'es' ? 'Plantilla' : 'Template',
    content: lang === 'es' ? 'Contenido' : 'Content',
    noResults: lang === 'es' ? 'Sin resultados' : 'No results',
    aiAssist: lang === 'es' ? 'Asistencia IA' : 'AI Assist',
    aiPlaceholder: lang === 'es' ? 'Describí lo que el paciente refirió...' : 'Describe what the patient reported...',
    aiGenerate: lang === 'es' ? 'Generar nota' : 'Generate note',
    aiGenerating: lang === 'es' ? 'Generando nota...' : 'Generating note...',
    aiOrganize: lang === 'es' ? 'Organizar mi nota' : 'Organize my note',
    aiOrganizing: lang === 'es' ? 'Organizando nota...' : 'Organizing note...',
    newTemplate: lang === 'es' ? 'Nueva plantilla' : 'New template',
    templateName: lang === 'es' ? 'Nombre de plantilla' : 'Template name',
    templateBody: lang === 'es' ? 'Contenido de plantilla' : 'Template content',
    createTemplate: lang === 'es' ? 'Crear plantilla' : 'Create template',
  }

  const patients = [
    { id: '1', firstName: 'John', lastName: 'Doe' },
    { id: '2', firstName: 'Alice', lastName: 'Smith' },
    { id: '3', firstName: 'Michael', lastName: 'Brown' },
    { id: '4', firstName: 'Sarah', lastName: 'Johnson' },
  ]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return notes.filter((n) =>
      n.patient?.name?.toLowerCase().includes(q) ||
      n.summary?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q)
    )
  }, [notes, search])

  if (showForm) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={resetForm} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{editing ? t.edit : t.add}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.patient}</label>
              <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="">{lang === 'es' ? 'Seleccionar paciente' : 'Select patient'}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.template}</label>
                <button onClick={() => setShowTemplateForm(!showTemplateForm)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t.newTemplate}
                </button>
              </div>

              {showTemplateForm && (
                <div className="mb-4 space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder={t.templateName}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-gray-100" />
                  <textarea value={newTemplateBody} onChange={(e) => setNewTemplateBody(e.target.value)} placeholder={t.templateBody} rows={3}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-gray-100" />
                  <button onClick={handleCreateTemplate}
                    className="w-full py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    {t.createTemplate}
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {allTemplates.map((tpl) => (
                  <div key={tpl.key} className="flex items-center gap-2">
                    <button
                      onClick={() => handleTemplateSelect(tpl.key)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTemplate === tpl.key
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      <tpl.icon size={16} />
                      {lang === 'es' ? tpl.labelEs : tpl.labelEn}
                    </button>
                    {tpl.isCustom && (
                      <button onClick={() => removeTemplate(tpl.customId!)}
                        className="p-1 text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assist toggle */}
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                showAiPanel
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <Sparkles size={16} />
              {t.aiAssist}
            </button>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2 space-y-5">
            {showAiPanel && (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-3 relative">
                {aiLoading && (
                  <div className="absolute inset-0 bg-indigo-50/90 dark:bg-indigo-950/90 rounded-xl flex flex-col items-center justify-center z-10">
                    <Loader2 size={40} className="animate-spin text-indigo-600 mb-3" />
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 text-center px-4">
                      {lang === 'es' ? 'Procesando con IA...\nEsto puede tardar 20-40 segundos' : 'Processing with AI...\nThis may take 20-40 seconds'}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  <Wand2 size={16} />
                  {t.aiAssist}
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={t.aiPlaceholder}
                  rows={3}
                  disabled={aiLoading}
                  className="w-full px-3 py-2 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                />
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleAiAssist}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors">
                  {aiLoading && <Loader2 size={14} className="animate-spin" />}
                  <MessageSquare size={14} />
                  {aiLoading ? t.aiGenerating : t.aiGenerate}
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.content}</label>
                <button
                  onClick={handleAiOrganize}
                  disabled={aiLoading || !content.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                  title={lang === 'es' ? 'Organizar y corregir esta nota con IA' : 'Organize and fix this note with AI'}
                >
                  <LayoutList size={14} />
                  {aiLoading ? t.aiOrganizing : t.aiOrganize}
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder={lang === 'es' ? 'Escribí tu nota clínica aquí...' : 'Write your clinical note here...'}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={saving || !selectedPatient || !content.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors">
                {saving && <Loader2 size={16} className="animate-spin" />}
                <Save size={16} />
                {t.save}
              </button>
              <button onClick={resetForm}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <X size={16} />
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search}
          className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <div key={note.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{note.patient?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString(lang === 'es' ? 'es-UY' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {note.summary || note.content?.slice(0, 200)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(note)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors dark:hover:bg-indigo-900/20">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors dark:hover:bg-red-900/20">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">{t.noResults}</div>
          )}
        </div>
      )}
    </div>
  )
}
