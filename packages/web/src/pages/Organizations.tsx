import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLangStore } from '../stores/langStore'
import { api } from '../services/api'
import {
  Building2, Users, Plus, Trash2, Loader2, Crown, Shield, User,
  ChevronDown, ChevronUp, Mail, AlertCircle, X,
} from 'lucide-react'

interface Member {
  id: string
  role: 'OWNER' | 'ADMIN' | 'PROFESSIONAL'
  joinedAt: string
  psychologist: { id: string; name: string; email: string }
}

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  owner: { id: string; name: string; email: string }
  members: Member[]
  _count: { patients: number; members: number }
}

export default function Organizations() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { lang } = useLangStore()
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'PROFESSIONAL'>('PROFESSIONAL')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')

  const t = {
    es: {
      title: 'Organización',
      subtitle: 'Gestioná tu equipo de profesionales.',
      noOrg: 'No tenés una organización',
      noOrgDesc: 'Creá una organización para invitar a otros profesionales y gestionar pacientes en equipo.',
      createBtn: 'Crear organización',
      members: 'Miembros',
      patients: 'Pacientes',
      plan: 'Plan',
      inviteBtn: 'Invitar profesional',
      inviteTitle: 'Invitar profesional',
      inviteEmail: 'Email',
      inviteName: 'Nombre',
      inviteRole: 'Rol',
      roleAdmin: 'Admin',
      roleProfessional: 'Profesional',
      sendInvite: 'Enviar invitación',
      cancel: 'Cancelar',
      remove: 'Eliminar',
      changeRole: 'Cambiar rol',
      owner: 'Propietario',
      admin: 'Admin',
      professional: 'Profesional',
      joined: 'Se unió',
      loading: 'Cargando...',
      error: 'Error al cargar',
    },
    en: {
      title: 'Organization',
      subtitle: 'Manage your team of professionals.',
      noOrg: 'You don\'t have an organization',
      noOrgDesc: 'Create an organization to invite other professionals and manage patients as a team.',
      createBtn: 'Create organization',
      members: 'Members',
      patients: 'Patients',
      plan: 'Plan',
      inviteBtn: 'Invite professional',
      inviteTitle: 'Invite professional',
      inviteEmail: 'Email',
      inviteName: 'Name',
      inviteRole: 'Role',
      roleAdmin: 'Admin',
      roleProfessional: 'Professional',
      sendInvite: 'Send invitation',
      cancel: 'Cancel',
      remove: 'Remove',
      changeRole: 'Change role',
      owner: 'Owner',
      admin: 'Admin',
      professional: 'Professional',
      joined: 'Joined',
      loading: 'Loading...',
      error: 'Error loading',
    },
  }[lang === 'es' ? 'es' : 'en']

  const fetchOrg = async () => {
    setLoading(true)
    try {
      const res = await api.get('/organizations/me')
      setOrg(res.data.data)
    } catch {
      setOrg(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrg() }, [])

  const handleCreate = async () => {
    if (!createName.trim() || !createSlug.trim()) return
    try {
      await api.post('/organizations', { name: createName, slug: createSlug })
      setShowCreate(false)
      fetchOrg()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const handleInvite = async () => {
    if (!org || !inviteEmail.trim() || !inviteName.trim()) return
    setInviteLoading(true)
    try {
      await api.post(`/organizations/${org.id}/members`, {
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
      })
      setShowInvite(false)
      setInviteEmail('')
      setInviteName('')
      fetchOrg()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!org) return
    if (!confirm(lang === 'es' ? '¿Eliminar miembro?' : 'Remove member?')) return
    try {
      await api.delete(`/organizations/${org.id}/members/${memberId}`)
      fetchOrg()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const handleChangeRole = async (memberId: string, newRole: 'ADMIN' | 'PROFESSIONAL') => {
    if (!org) return
    try {
      await api.patch(`/organizations/${org.id}/members/${memberId}`, { role: newRole })
      fetchOrg()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  const roleIcon = (role: string) => {
    if (role === 'OWNER') return <Crown size={16} className="text-amber-500" />
    if (role === 'ADMIN') return <Shield size={16} className="text-indigo-500" />
    return <User size={16} className="text-slate-400" />
  }

  const roleLabel = (role: string) => {
    if (role === 'OWNER') return t.owner
    if (role === 'ADMIN') return t.admin
    return t.professional
  }

  const myRole = org?.members.find(m => m.psychologist.id === user?.id)?.role
  const canInvite = myRole === 'OWNER' || myRole === 'ADMIN'
  const canRemove = myRole === 'OWNER' || myRole === 'ADMIN'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{t.subtitle}</p>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t.noOrg}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">{t.noOrgDesc}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {t.createBtn}
          </button>
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t.createBtn}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === 'es' ? 'Nombre' : 'Name'}</label>
                  <input
                    value={createName}
                    onChange={(e) => { setCreateName(e.target.value); setCreateSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    placeholder="Ej: Centro de Psicología"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug</label>
                  <input
                    value={createSlug}
                    onChange={(e) => setCreateSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
                    placeholder="centro-psicologia"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    {t.cancel}
                  </button>
                  <button onClick={handleCreate} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold">
                    {t.createBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            {t.inviteBtn}
          </button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{org._count.members}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{t.members}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{org._count.patients}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{t.patients}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{org.plan.toLowerCase()}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{t.plan}</div>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.members}</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {org.members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-amber-400 flex items-center justify-center text-white text-sm font-bold">
                {member.psychologist.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {member.psychologist.name}
                  {member.psychologist.id === user?.id && (
                    <span className="ml-2 text-xs text-slate-400 font-normal">({lang === 'es' ? 'Vos' : 'You'})</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.psychologist.email}</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                {roleIcon(member.role)}
                {roleLabel(member.role)}
              </div>
              {canRemove && member.role !== 'OWNER' && member.psychologist.id !== user?.id && (
                <div className="flex items-center gap-2">
                  {myRole === 'OWNER' && (
                    <button
                      onClick={() => handleChangeRole(member.id, member.role === 'ADMIN' ? 'PROFESSIONAL' : 'ADMIN')}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                      title={t.changeRole}
                    >
                      <Shield size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title={t.remove}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.inviteTitle}</h3>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.inviteName}</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  placeholder="María González"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.inviteEmail}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  placeholder="maria@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.inviteRole}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInviteRole('PROFESSIONAL')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      inviteRole === 'PROFESSIONAL'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User size={18} className="mx-auto mb-1" />
                    {t.roleProfessional}
                  </button>
                  <button
                    onClick={() => setInviteRole('ADMIN')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      inviteRole === 'ADMIN'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Shield size={18} className="mx-auto mb-1" />
                    {t.roleAdmin}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleInvite}
                disabled={inviteLoading || !inviteEmail.trim() || !inviteName.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {inviteLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {t.sendInvite}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
