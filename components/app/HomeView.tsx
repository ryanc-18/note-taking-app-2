'use client'

import type { Note, Folder } from '@/types'

type Props = {
  recentNoteIds: string[]
  notes: Record<string, Note>
  folders: Folder[]
  onOpenNote: (id: string) => void
}

export default function HomeView({ recentNoteIds, notes, folders, onOpenNote }: Props) {
  const recentNotes = recentNoteIds.map(id => notes[id]).filter(Boolean)

  const getFolderName = (note: Note) =>
    folders.find(f => f.id === note.folder)?.name ?? 'Unknown folder'

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--paper-surface)', padding: '48px 56px' }}
    >
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-ui)',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}
      >
        Home
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginBottom: '32px' }}>
        Recently opened
      </p>

      {recentNotes.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          No recently opened documents yet.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {recentNotes.map(note => (
            <button
              key={note.id}
              onClick={() => onOpenNote(note.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '16px',
                background: 'var(--paper-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ fontSize: '24px', lineHeight: 1 }}>📄</div>
              <div style={{ width: '100%' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '4px',
                }}>
                  {note.title}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                  {getFolderName(note)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
