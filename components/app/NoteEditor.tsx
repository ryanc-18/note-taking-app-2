import type { Note } from '@/types'
import CanvasView from './CanvasView'

type Props = {
  activeNote: Note | undefined
}

export default function NoteEditor({ activeNote }: Props) {
  if (activeNote?.type === 'document') {
    return <CanvasView pdfUrl={activeNote.pdfUrl!} />
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-2 p-12 text-[15px] italic text-[var(--text-muted)]"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <span>No note open</span>
      <span
        className="text-[12px] not-italic text-[var(--text-muted)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        Select a note from the sidebar to begin
      </span>
    </div>
  )
}
