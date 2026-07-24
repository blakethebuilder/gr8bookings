import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  leaving?: boolean
  onClose: () => void
}

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const stylesMap: Record<ToastType, { border: string; bg: string; icon: string }> = {
  success: { border: 'border-green-500/30', bg: 'bg-green-500/10', icon: 'text-green-400' },
  error: { border: 'border-red-500/30', bg: 'bg-red-500/10', icon: 'text-gr8-red' },
  info: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: 'text-blue-400' },
  warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', icon: 'text-gr8-gold' },
}

export default function Toast({ message, type, leaving, onClose }: ToastProps) {
  const Icon = iconMap[type]
  const s = stylesMap[type]

  return (
    <div
      className={`card-dark toast-enter pointer-events-auto flex items-start gap-3 transition-all duration-300 ${
        leaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      } ${s.border} ${s.bg}`}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${s.icon}`} />
      <p className="text-sm text-white flex-1">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-gray-500 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
