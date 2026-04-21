import type { Note } from '@/types'
import CanvasView from './CanvasView'
import { renderMarkdown } from '@/lib/markdown'

type Props = {
  activeNote: Note | undefined
}

export default function NoteEditor({ activeNote }: Props) {
  if (activeNote?.type === 'document') {
    return <CanvasView pdfUrl={activeNote.pdfUrl!} />
  }

  if (activeNote) {
    return (
      <div className="editor-area flex-1 overflow-y-auto flex justify-center px-6 pt-12 pb-20">
        <div className="editor-paper w-full max-w-[720px] bg-[var(--paper-elevated)] rounded-sm px-[72px] py-14 border border-black/[0.06] relative min-h-[70vh] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div
            className="text-[11px] text-[var(--text-muted)] tracking-[0.02em] mb-8 relative z-[1]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Last edited {activeNote.updatedAt}
          </div>
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }}
          />
        </div>
      </div>
    )
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
