'use client'

import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Note = {
  id: string
  title: string
  content: string
  folder: string
  updatedAt: string
}

type Folder = {
  id: string
  name: string
  noteIds: string[]
  expanded: boolean
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const INITIAL_NOTES: Record<string, Note> = {
  'n1': {
    id: 'n1',
    title: 'Getting Started',
    content: `# Getting Started

Welcome to your note-taking workspace. This is where your thoughts, ideas, and work come together.

## What you can do

- Write notes using **markdown** syntax
- Organise notes into folders
- Open multiple notes in tabs
- Search across everything

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| New note | ⌘ N |
| Search | ⌘ K |
| Close tab | ⌘ W |

Start writing, and your ideas will find their place.`,
    folder: 'f1',
    updatedAt: 'Today at 9:41 AM',
  },
  'n2': {
    id: 'n2',
    title: 'Meeting Notes — Q2 Planning',
    content: `# Meeting Notes — Q2 Planning

**Date:** April 2, 2026
**Attendees:** Ryan, Sarah, Marcus

---

## Agenda

1. Review Q1 outcomes
2. Set Q2 priorities
3. Resource allocation
4. Timeline review

## Discussion

Q1 was strong on the product side. The design system work shipped and the team is moving faster because of it.

For Q2, the focus shifts to growth. Ryan proposed a three-pronged approach: content marketing, partnerships, and a referral programme.

## Action items

- [ ] Ryan — draft partnership outreach templates by April 10
- [ ] Sarah — audit current content pipeline
- [ ] Marcus — run numbers on referral economics

## Next meeting

April 16, 2026 — same time.`,
    folder: 'f2',
    updatedAt: 'Yesterday at 3:12 PM',
  },
  'n3': {
    id: 'n3',
    title: 'Product Ideas',
    content: `# Product Ideas

A running list of ideas worth exploring.

---

## High priority

**Collaborative editing**
Real-time multiplayer within a workspace. The architecture is the hard part — need to think through operational transforms or CRDTs.

**AI summaries**
Auto-summarise long notes into a short digest at the top. Could use Claude for this.

## Interesting but later

- Offline mode with sync on reconnect
- Version history with diff view
- Custom templates per folder
- Embedded spreadsheets (lightweight)

## Probably not

- Kanban view — too much scope, Notion already owns this
- Native mobile app — web is good enough for now`,
    folder: 'f1',
    updatedAt: 'Apr 1 at 11:05 AM',
  },
  'n4': {
    id: 'n4',
    title: 'Writing is Telepathy',
    content: `# Writing is Telepathy

Ideas can travel through time and space without being uttered out loud. This is the quiet miracle of writing.

When you put words on a page, you are transmitting your mind — your specific configuration of neurons, your exact emotional weather at that moment — across any distance, across any span of time.

A reader in another century picks up your words and something happens. Something crosses over.

---

## On the practice

Write every day, even badly. The muscle needs to move. Bad writing is not the enemy; silence is.

The first draft is just you telling yourself the story.

> "The first draft of anything is shit." — Hemingway

Do not confuse editing with writing. They are different cognitive modes. Write first, edit later, with fresh eyes.

## What makes a sentence good?

- It says exactly what it means, no more
- It sounds like a human being wrote it
- It earns every word it uses`,
    folder: 'f3',
    updatedAt: 'Mar 30 at 8:22 PM',
  },
}

const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Personal', noteIds: ['n1', 'n3'], expanded: true },
  { id: 'f2', name: 'Work', noteIds: ['n2'], expanded: true },
  { id: 'f3', name: 'Writing', noteIds: ['n4'], expanded: false },
]

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim())
      if (cells.every((c: string) => /^-+$/.test(c))) return ''
      return '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>'
    })
    .replace(/^- \[ \] (.+)$/gm, '<li class="task"><span class="checkbox"></span>$1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="task done"><span class="checkbox checked"></span>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l|b|t|c|p])(.+)$/gm, (line) => line ? line : '')
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" /><path d="M14 14l-3-3" />
  </svg>
)

const FolderIcon = ({ open }: { open?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 4a1 1 0 011-1h4l1.5 2H14a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" opacity={open ? 0.85 : 0.6} />
  </svg>
)

const NoteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="1" width="10" height="13" rx="1.5" /><path d="M6 5h4M6 8h4M6 11h2" />
  </svg>
)

const ChevronIcon = ({ down }: { down?: boolean }) => (
  <svg
    width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    style={{ transform: down ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
  >
    <path d="M3 2l4 3-4 3" />
  </svg>
)

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 2v8M2 6h8" />
  </svg>
)

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 2l6 6M8 2l-6 6" />
  </svg>
)

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7l6-5 6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" /><path d="M6 15V9h4v6" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
  </svg>
)

// ─── CSS: only what Tailwind cannot express ───────────────────────────────────
//
//  - .grain-overlay          SVG data-URI background
//  - .sidebar-tree,
//    .tab-bar,
//    .editor-area            custom scrollbar pseudo-elements
//  - .editor-paper::before   left margin rule (pseudo-element)
//  - .editor-paper::after    ruled-line repeating gradient (pseudo-element)
//  - .tab:hover .tab-close   parent-hover opacity (no Tailwind equivalent)
//  - .md-content *           styles for dangerouslySetInnerHTML output

const noteStyles = `
  .grain-overlay {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .sidebar-tree::-webkit-scrollbar { width: 4px; }
  .sidebar-tree::-webkit-scrollbar-track { background: transparent; }
  .sidebar-tree::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  .tab-bar::-webkit-scrollbar { display: none; }

  .editor-area::-webkit-scrollbar { width: 6px; }
  .editor-area::-webkit-scrollbar-track { background: transparent; }
  .editor-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

  .editor-paper::before {
    content: '';
    position: absolute;
    left: 56px; top: 0; bottom: 0;
    width: 1px;
    background: rgba(194,130,74,0.15);
  }

  .editor-paper::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      transparent,
      transparent 27px,
      rgba(0,0,0,0.025) 27px,
      rgba(0,0,0,0.025) 28px
    );
    border-radius: inherit;
    pointer-events: none;
  }

  .tab:hover .tab-close,
  .tab.active .tab-close { opacity: 1; }

  .md-content {
    font-family: var(--font-display);
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-primary);
    position: relative;
    z-index: 1;
  }
  .md-content h1 {
    font-size: 28px; font-weight: 600;
    letter-spacing: -0.03em; line-height: 1.25;
    margin-bottom: 20px;
  }
  .md-content h2 {
    font-size: 18px; font-weight: 600;
    letter-spacing: -0.02em;
    margin-top: 32px; margin-bottom: 12px;
  }
  .md-content h3 {
    font-family: var(--font-ui);
    font-size: 13.5px; font-weight: 600;
    letter-spacing: 0.02em; text-transform: uppercase;
    margin-top: 24px; margin-bottom: 8px;
    color: var(--text-secondary);
  }
  .md-content p { margin-bottom: 14px; }
  .md-content strong { font-weight: 600; }
  .md-content em { font-style: italic; }
  .md-content code {
    font-family: var(--font-mono);
    font-size: 12.5px;
    background: rgba(0,0,0,0.05);
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid rgba(0,0,0,0.07);
  }
  .md-content blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-secondary);
    font-style: italic;
  }
  .md-content hr {
    border: none;
    border-top: 1px solid var(--border-strong);
    margin: 28px 0;
  }
  .md-content ul, .md-content ol { padding-left: 20px; margin-bottom: 14px; }
  .md-content li { margin-bottom: 4px; }
  .md-content li.task {
    display: flex; align-items: flex-start; gap: 8px;
    list-style: none; margin-left: -20px;
  }
  .md-content .checkbox {
    width: 14px; height: 14px;
    border: 1.5px solid var(--border-strong);
    border-radius: 3px; flex-shrink: 0;
    margin-top: 3px; display: inline-block;
  }
  .md-content .checkbox.checked { background: var(--accent); border-color: var(--accent); }
  .md-content table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 13.5px; font-family: var(--font-ui); }
  .md-content td { padding: 7px 12px; border: 1px solid var(--border-strong); }
  .md-content tr:first-child td { background: rgba(0,0,0,0.02); font-weight: 500; }
`

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoteApp() {
  const [notes] = useState<Record<string, Note>>(INITIAL_NOTES)
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS)
  const [openTabs, setOpenTabs] = useState<string[]>(['n1', 'n2'])
  const [activeTab, setActiveTab] = useState<string>('n1')
  const [searchQuery, setSearchQuery] = useState('')

  const activeNote = notes[activeTab]

  const openNote = useCallback((noteId: string) => {
    if (!openTabs.includes(noteId)) {
      setOpenTabs(prev => [...prev, noteId])
    }
    setActiveTab(noteId)
  }, [openTabs])

  const closeTab = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const idx = openTabs.indexOf(noteId)
    const newTabs = openTabs.filter(id => id !== noteId)
    setOpenTabs(newTabs)
    if (activeTab === noteId && newTabs.length > 0) {
      setActiveTab(newTabs[Math.max(0, idx - 1)])
    }
  }, [openTabs, activeTab])

  const toggleFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, expanded: !f.expanded } : f))
  }, [])

  const allNotes = Object.values(notes)
  const filteredNotes = searchQuery
    ? allNotes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <>
      <style>{noteStyles}</style>

      {/* Grain texture overlay — SVG data URI, must stay in CSS */}
      <div className="grain-overlay fixed inset-0 pointer-events-none z-[9999] opacity-40" aria-hidden="true" />

      {/* App shell */}
      <div
        className="flex h-screen w-screen overflow-hidden text-[13px] bg-[var(--paper-bg)] text-[var(--text-primary)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-60 shrink-0 flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] overflow-hidden">

          {/* Workspace header */}
          <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2.5 border-b border-[var(--sidebar-border)]">
            <div
              className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-xs font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), #a06030)', fontFamily: 'var(--font-display)' }}
            >
              R
            </div>
            <span className="text-[13px] font-medium tracking-[-0.01em] truncate flex-1 text-[var(--sidebar-text-active)]">
              Ryan&apos;s Workspace
            </span>
          </div>

          {/* Top nav */}
          <nav className="p-1.5 border-b border-[var(--sidebar-border)]">
            {[
              { icon: <HomeIcon />, label: 'Home' },
              { icon: <SettingsIcon />, label: 'Settings' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[13px] text-[var(--sidebar-text)] bg-transparent border-none cursor-pointer select-none transition-colors duration-100 hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent)]"
              >
                {icon}<span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Search */}
          <div className="px-1.5 py-2 border-b border-[var(--sidebar-border)] relative">
            <div className="relative flex items-center">
              <span className="absolute left-2 flex pointer-events-none text-[var(--sidebar-text-muted)]">
                <SearchIcon />
              </span>
              <input
                className="w-full bg-white/5 border border-white/[0.08] rounded-md py-[5px] pl-7 pr-2 text-[12.5px] text-[var(--sidebar-text-active)] outline-none transition-colors duration-150 placeholder:text-[var(--sidebar-text-muted)] focus:border-[rgba(194,130,74,0.4)] focus:bg-white/[0.07]"
                style={{ fontFamily: 'var(--font-ui)' }}
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => setTimeout(() => setSearchQuery(''), 200)}
              />
            </div>

            {searchQuery && filteredNotes.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-1.5 right-1.5 bg-[#2d2822] border border-white/10 rounded-lg overflow-hidden z-[100] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className="px-2.5 py-2 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors duration-100 hover:bg-[var(--sidebar-active)]"
                    onMouseDown={() => openNote(note.id)}
                  >
                    <div className="text-[12.5px] font-medium text-[var(--sidebar-text-active)]">{note.title}</div>
                    <div className="text-[11.5px] mt-0.5 truncate text-[var(--sidebar-text-muted)]">
                      {note.content.slice(0, 80).replace(/[#*`]/g, '')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File tree */}
          <div className="sidebar-tree flex-1 overflow-y-auto p-1.5">
            <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--sidebar-text-muted)]">
              <span>Notes</span>
              <button
                className="flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-none bg-transparent text-[var(--sidebar-text-muted)] cursor-pointer transition-colors duration-100 hover:bg-white/[0.08] hover:text-[var(--sidebar-text)]"
                title="New note"
              >
                <PlusIcon />
              </button>
            </div>

            {folders.map(folder => {
              const folderNotes = folder.noteIds.map(id => notes[id]).filter(Boolean)
              return (
                <div key={folder.id}>
                  <div
                    className="flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[12.5px] font-medium text-[var(--sidebar-text)] cursor-pointer select-none transition-colors duration-100 hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)]"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    <span className="flex text-[var(--sidebar-text-muted)] -mr-0.5"><ChevronIcon down={folder.expanded} /></span>
                    <FolderIcon open={folder.expanded} />
                    <span className="flex-1">{folder.name}</span>
                    <span className="text-[11px] text-[var(--sidebar-text-muted)]">{folderNotes.length}</span>
                  </div>

                  {folder.expanded && folderNotes.map(note => (
                    <button
                      key={note.id}
                      className={`flex items-center gap-1.5 w-full py-1 px-2 pl-7 rounded-md text-[12.5px] text-left border-none cursor-pointer select-none truncate transition-colors duration-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent)] ${
                        activeTab === note.id
                          ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
                          : 'bg-transparent text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                      }`}
                      onClick={() => openNote(note.id)}
                    >
                      <span className="shrink-0 flex"><NoteIcon /></span>
                      <span className="truncate">{note.title}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-1.5 py-2 border-t border-[var(--sidebar-border)]">
            <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] text-[var(--sidebar-text-muted)] bg-transparent border-none cursor-pointer select-none transition-colors duration-100 hover:bg-[var(--sidebar-hover)]">
              <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-white/10 text-[11px] font-medium text-[var(--sidebar-text)] shrink-0">
                R
              </span>
              <span>Ryan Chin</span>
            </button>
          </div>
        </aside>

        {/* ── Main area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--paper-surface)]">

          {/* Tab bar */}
          {openTabs.length > 0 && (
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
                    onClick={() => setActiveTab(tabId)}
                  >
                    <NoteIcon />
                    <span>{note.title}</span>
                    <button
                      className="tab-close flex items-center justify-center w-4 h-4 rounded-[3px] border-none bg-transparent text-[var(--text-muted)] cursor-pointer opacity-0 transition-opacity duration-100 ml-0.5 hover:bg-black/[0.08] hover:text-[var(--text-primary)]"
                      onClick={(e) => closeTab(tabId, e)}
                      title="Close tab"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Editor */}
          {activeNote ? (
            <div className="editor-area flex-1 overflow-y-auto flex justify-center px-6 pt-12 pb-20">
              <div
                className="editor-paper w-full max-w-[720px] bg-[var(--paper-elevated)] rounded-sm px-[72px] py-14 border border-black/[0.06] relative min-h-[70vh] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
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
          ) : (
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
          )}
        </div>
      </div>
    </>
  )
}
