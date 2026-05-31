'use client'

type Props = {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onCancel}
    >
      <div
        className="bg-[var(--paper-elevated)] border border-[var(--border-strong)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-6 w-[320px] flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <p
          className="text-[13.5px] text-[var(--text-primary)] leading-relaxed"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-strong)] cursor-pointer transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-white bg-red-500 border-none cursor-pointer transition-colors duration-100 hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
