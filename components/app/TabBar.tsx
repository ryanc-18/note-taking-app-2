import type { Note } from '@/types'
import { DocIcon, NoteIcon, CloseIcon } from './icons'

type Props = {
  openTabs: string[]
  notes: Record<string, Note>
  activeTab: string
  onSelect: (id: string) => void
  onClose: (id: string, e: React.MouseEvent) => void
}

export default function TabBar({ openTabs, notes, activeTab, onSelect, onClose }: Props) {
  if (openTabs.length === 0) return null

  return (
    <div className="tab-bar flex items-end bg-[var(--tab-bg)] border-b border-[var(--border-strong)] pl-px overflow-x-auto shrink-0 h-9">
      {openTabs.map(tabId => {
        const note = notes[tabId]
        if (!note) return null
        const isActive = activeTab === tabId
        return (
          <div
            key={tabId}
            className={`tab flex items-center gap-[5px] pl-3 pr-2.5 h-[34px] cursor-pointer whitespace-nowrap text-[12.5px] border-r border-[var(--border)] rounded-t-[6px] mt-0.5 transition-colors duration-100 select-none relative ${
              isActive
                ? 'active bg-[var(--tab-active-bg)] text-[var(--text-primary)] font-medium -mb-px z-[1] border-b border-[var(--tab-active-bg)]'
                : 'bg-[var(--tab-bg)] text-[var(--text-muted)] hover:bg-[#e8e2d8] hover:text-[var(--text-secondary)]'
            }`}
            onClick={() => onSelect(tabId)}
          >
            {note.type === 'document' ? <DocIcon /> : <NoteIcon />}
            <span>{note.title}</span>
            <button
              className="tab-close flex items-center justify-center w-4 h-4 rounded-[3px] border-none bg-transparent text-[var(--text-muted)] cursor-pointer opacity-0 transition-opacity duration-100 ml-0.5 hover:bg-black/[0.08] hover:text-[var(--text-primary)]"
              onClick={(e) => onClose(tabId, e)}
              title="Close tab"
            >
              <CloseIcon />
            </button>
          </div>
        )
      })}
    </div>
  )
}
