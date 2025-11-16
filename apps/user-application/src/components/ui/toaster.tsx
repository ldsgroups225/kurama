import { useToast } from './use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            rounded-lg border p-4 shadow-lg transition-all
            ${toast.variant === 'destructive'
          ? 'border-red-200 bg-red-50 text-red-900'
          : 'border-gray-200 bg-white text-gray-900'
        }
          `}
          onClick={() => dismiss(toast.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              dismiss(toast.id)
            }
          }}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          {toast.title && (
            <div className="font-medium">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}
