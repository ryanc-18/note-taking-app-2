'use client'

import { useState } from 'react'
import type { Note, Folder } from '@/types'

type Props = {
  recentNoteIds: string[]
  notes: Record<string, Note>
  folders: Folder[]
  onOpenNote: (id: string) => void
}

export default function HomeView({ recentNoteIds, notes, folders, onOpenNote }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  const recentNotes = recentNoteIds.map(id => notes[id]).filter(Boolean)

  const searchResults = searchQuery.trim()
    ? Object.values(notes).filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

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
          marginBottom: '24px',
        }}
      >
        Home
      </h1>

      {/* Search bar */}
      <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 36px',
            fontSize: '13.5px',
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-primary)',
            background: 'var(--paper-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')}
        />
        <svg
          style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}
          width="14" height="14" viewBox="0 0 16 16" fill="none"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--paper-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 100,
          }}>
            {searchResults.map(note => (
              <button
                key={note.id}
                onMouseDown={() => { onOpenNote(note.id); setSearchQuery('') }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                  {note.title}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                  {getFolderName(note)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', marginBottom: '16px' }}>
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
