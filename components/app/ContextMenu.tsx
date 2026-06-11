import type { Note, Folder } from '@/types'

type ContextMenuState = {
  x: number
  y: number
  id: string
  type: 'folder' | 'note'
}

type Props = {
  contextMenu: ContextMenuState
  notes: Record<string, Note>
  folders: Folder[]
  clipboard: { note: Note; action: 'copy' | 'cut' } | null
  onClose: () => void
  onRename: (id: string, currentName: string) => void
  onCopy: (note: Note) => void
  onCut: (note: Note) => void
  onPaste: (folderId: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string, type: 'folder' | 'note') => void
}

function MenuItem({ label, onClick, disabled, danger }: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      disabled={disabled}
      className={`flex items-center w-full px-3 py-[7px] text-[12.5px] text-left bg-transparent border-none cursor-pointer transition-colors duration-100 disabled:opacity-35 disabled:cursor-default disabled:hover:bg-transparent ${
        danger
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default function ContextMenu({
  contextMenu, notes, folders, clipboard,
  onClose, onRename, onCopy, onCut, onPaste, onDuplicate, onDelete,
}: Props) {
  const isFolder = contextMenu.type === 'folder'
  const targetNote = notes[contextMenu.id]
  const folderId = isFolder ? contextMenu.id : targetNote?.folder

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] w-44 bg-[var(--paper-elevated)] border border-[var(--border-strong)] rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        <MenuItem label="Rename" onClick={() => {
          const currentName = isFolder
            ? (folders.find(f => f.id === contextMenu.id)?.name ?? '')
            : (targetNote?.title ?? '')
          onClose()
          onRename(contextMenu.id, currentName)
        }} />
        <div className="h-px bg-[var(--border-strong)] mx-1 my-0.5" />
        <MenuItem label="Copy" disabled={isFolder} onClick={() => {
          if (targetNote) onCopy(targetNote)
          onClose()
        }} />
        <MenuItem label="Cut" disabled={isFolder} onClick={() => {
          if (targetNote) onCut(targetNote)
          onClose()
        }} />
        <MenuItem label="Paste" disabled={!clipboard || !folderId} onClick={() => {
          if (folderId) onPaste(folderId)
          onClose()
        }} />
        <MenuItem label="Duplicate" disabled={isFolder} onClick={() => {
          onDuplicate(contextMenu.id)
          onClose()
        }} />
        <div className="h-px bg-[var(--border-strong)] mx-1 my-0.5" />
        <MenuItem label="Delete" danger onClick={() => {
          onDelete(contextMenu.id, contextMenu.type)
        }} />
      </div>
    </>
  )
}
