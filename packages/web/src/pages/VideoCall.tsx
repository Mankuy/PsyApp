import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLangStore } from '../stores/langStore'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default function VideoCall() {
  const { roomName } = useParams()
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`

  const t = {
    es: { back: 'Volver', open: 'Abrir en pestaña nueva' },
    en: { back: 'Back', open: 'Open in new tab' },
  }[lang]

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
          <ArrowLeft size={18} /> {t.back}
        </button>
        <span className="text-sm text-gray-400">PsyApp · Video</span>
        <a href={jitsiUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300">
          <ExternalLink size={14} /> {t.open}
        </a>
      </div>
      <iframe
        ref={iframeRef}
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture"
        className="flex-1 w-full border-0"
      />
    </div>
  )
}
