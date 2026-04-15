'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import CanvasView from './CanvasView'
import { getFolders, createFolder, renameFolder, deleteFolder, createNote, renameNote, deleteNote, uploadPdf } from '@/lib/api'
import type { Note, Folder } from '@/types'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const INITIAL_NOTES_EXTRA: Record<string, Note> = {
  'd1': {
    id: 'd1',
    title: 'Test Document',
    content: '',
    folder: 'f1',
    updatedAt: 'Today',
    type: 'document',
    pdfUrl: '/test-document.pdf',
  },
}


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

const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="2" y="1" width="10" height="13" rx="1.5" />
    <path d="M5 5h6M5 8h6M5 11h3" />
    <path d="M10 1v4h4" strokeLinejoin="round" />
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

// ─── Context Menu Item ────────────────────────────────────────────────────────

function ContextMenuItem({ label, onClick, disabled, danger }: {
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
          ? 'text-red-500 hover:bg-red-50'
          : 'text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoteApp() {
  const [notes, setNotes] = useState<Record<string, Note>>(INITIAL_NOTES_EXTRA)
  const [folders, setFolders] = useState<Folder[]>([])
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; type: 'folder' | 'note' } | null>(null)
  const [clipboard, setClipboard] = useState<{ note: Note; action: 'copy' | 'cut' } | null>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // ── Load folders + notes from the database on mount ──────────────────────
  useEffect(() => {
    async function loadData() {
      const dbFolders = await getFolders()

      const notesMap: Record<string, Note> = { ...INITIAL_NOTES_EXTRA }
      const folderList: Folder[] = []

      for (const folder of dbFolders) {
        const noteIds: string[] = []
        for (const note of folder.notes) {
          notesMap[note.id] = {
            id: note.id,
            title: note.title,
            content: note.content,
            folder: note.folderId,
            updatedAt: new Date(note.updatedAt).toLocaleDateString(),
            type: note.pdfUrl ? 'document' : 'note',
            pdfUrl: note.pdfUrl ?? undefined,
          }
          noteIds.push(note.id)
        }
        folderList.push({ id: folder.id, name: folder.name, noteIds, expanded: true })
      }

      setNotes(notesMap)
      // Inject the test document into the first folder so it appears in the sidebar
      if (folderList.length > 0) {
        folderList[0].noteIds.push('d1')
      }
      setFolders(folderList)
    }

    loadData()
  }, [])

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

  const addNote = useCallback(() => {
    // Open the OS file picker — the rest is handled by onFileSelected
    setAddMenuOpen(false)
    fileInputRef.current?.click()
  }, [])

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const folderId = folders[0]?.id ?? ''

    // Show a placeholder immediately so the user gets instant feedback
    const tempId = `uploading-${Date.now()}`
    const tempDoc: Note = {
      id: tempId,
      title: file.name.replace(/\.pdf$/i, ''),
      content: '',
      folder: folderId,
      updatedAt: 'Uploading…',
      type: 'document',
      pdfUrl: URL.createObjectURL(file),
    }
    setNotes(prev => ({ ...prev, [tempId]: tempDoc }))
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, expanded: true, noteIds: [...f.noteIds, tempId] } : f
    ))
    setOpenTabs(prev => [...prev, tempId])
    setActiveTab(tempId)

    // Upload to Vercel Blob via our API route
    try {
      const saved = await uploadPdf(file, folderId)
      // Replace the temp entry with the persisted one
      const savedDoc: Note = {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        folder: saved.folderId,
        updatedAt: 'Just now',
        type: 'document',
        pdfUrl: saved.pdfUrl,
      }
      setNotes(prev => {
        const { [tempId]: _removed, ...rest } = prev
        return { ...rest, [saved.id]: savedDoc }
      })
      setFolders(prev => prev.map(f =>
        f.id === folderId
          ? { ...f, noteIds: f.noteIds.map(id => id === tempId ? saved.id : id) }
          : f
      ))
      setOpenTabs(prev => prev.map(id => id === tempId ? saved.id : id))
      setActiveTab(saved.id)
    } catch {
      // Upload failed — remove the temp entry
      setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== tempId)))
      setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== tempId) })))
      setOpenTabs(prev => prev.filter(t => t !== tempId))
    }

    e.target.value = ''
  }, [folders])

  const startRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id)
    setRenameValue(currentName)
    setTimeout(() => renameInputRef.current?.select(), 0)
  }, [])

  const commitRename = useCallback(async (id: string, type: 'folder' | 'note') => {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }

    if (type === 'folder') {
      await renameFolder(id, trimmed)
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: trimmed } : f))
    } else {
      await renameNote(id, trimmed)
      setNotes(prev => ({ ...prev, [id]: { ...prev[id], title: trimmed } }))
    }

    setRenamingId(null)
  }, [renameValue])

  const openContextMenu = useCallback((e: React.MouseEvent, id: string, type: 'folder' | 'note') => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, id, type })
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const deleteItem = useCallback(async (id: string, type: 'folder' | 'note') => {
    closeContextMenu()
    if (type === 'folder') {
      await deleteFolder(id)
      const folder = folders.find(f => f.id === id)
      if (folder) {
        setNotes(prev => {
          const next = { ...prev }
          folder.noteIds.forEach(nid => { const { [nid]: _, ...rest } = next; Object.assign(next, rest) })
          return Object.fromEntries(Object.entries(next).filter(([k]) => !folder.noteIds.includes(k)))
        })
        setOpenTabs(prev => prev.filter(t => !folder.noteIds.includes(t)))
        setFolders(prev => prev.filter(f => f.id !== id))
      }
    } else {
      await deleteNote(id)
      setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id)))
      setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== id) })))
      setOpenTabs(prev => prev.filter(t => t !== id))
      if (activeTab === id) setActiveTab('')
    }
  }, [folders, activeTab, closeContextMenu])

  const duplicateNote = useCallback(async (id: string) => {
    const note = notes[id]
    if (!note) return

    // Ensure we use a folderId that actually exists in the DB
    const validFolderIds = new Set(folders.map(f => f.id))
    const folderId = validFolderIds.has(note.folder) ? note.folder : folders[0]?.id
    if (!folderId) return

    const saved = await createNote(`${note.title} (copy)`, note.content, folderId, note.pdfUrl)
    const newNote: Note = {
      id: saved.id, title: saved.title, content: saved.content,
      folder: saved.folderId, updatedAt: 'Just now',
      type: note.pdfUrl ? 'document' : 'note',
      pdfUrl: note.pdfUrl,
    }
    setNotes(prev => ({ ...prev, [saved.id]: newNote }))
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, noteIds: [...f.noteIds, saved.id] } : f))
    closeContextMenu()
  }, [notes, folders, closeContextMenu])

  const addFolder = useCallback(async () => {
    const folder = await createFolder('New Folder')
    setFolders(prev => [...prev, { id: folder.id, name: folder.name, noteIds: [], expanded: true }])
    setAddMenuOpen(false)
  }, [])


  // Close add menu when clicking outside
  useEffect(() => {
    if (!addMenuOpen) return
    function handleClick(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [addMenuOpen])

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

      {/* Context menu backdrop + menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={closeContextMenu} />
          <div
            className="fixed z-[9999] w-44 bg-[var(--paper-elevated)] border border-[var(--border-strong)] rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <ContextMenuItem label="Rename" onClick={() => {
              const currentName = contextMenu.type === 'folder'
                ? (folders.find(f => f.id === contextMenu.id)?.name ?? '')
                : (notes[contextMenu.id]?.title ?? '')
              closeContextMenu()
              startRename(contextMenu.id, currentName)
            }} />
            <div className="h-px bg-[var(--border-strong)] mx-1 my-0.5" />
            <ContextMenuItem label="Copy" disabled={contextMenu.type === 'folder'} onClick={() => {
              setClipboard({ note: notes[contextMenu.id], action: 'copy' })
              closeContextMenu()
            }} />
            <ContextMenuItem label="Cut" disabled={contextMenu.type === 'folder'} onClick={() => {
              setClipboard({ note: notes[contextMenu.id], action: 'cut' })
              closeContextMenu()
            }} />
            <ContextMenuItem label="Paste" disabled={!clipboard} onClick={async () => {
              if (!clipboard) return
              const folderId = contextMenu.type === 'folder' ? contextMenu.id : notes[contextMenu.id]?.folder
              if (!folderId) return
              closeContextMenu()
              const saved = await createNote(clipboard.note.title, clipboard.note.content, folderId)
              const newNote: Note = { id: saved.id, title: saved.title, content: saved.content, folder: saved.folderId, updatedAt: 'Just now', type: 'note' }
              setNotes(prev => ({ ...prev, [saved.id]: newNote }))
              setFolders(prev => prev.map(f => f.id === folderId ? { ...f, noteIds: [...f.noteIds, saved.id] } : f))
              if (clipboard.action === 'cut') {
                const cutId = clipboard.note.id
                await deleteNote(cutId)
                setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== cutId)))
                setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== cutId) })))
                setOpenTabs(prev => prev.filter(t => t !== cutId))
                setClipboard(null)
              }
            }} />
            <ContextMenuItem label="Duplicate" disabled={contextMenu.type === 'folder'} onClick={() => {
              duplicateNote(contextMenu.id)
            }} />
            <div className="h-px bg-[var(--border-strong)] mx-1 my-0.5" />
            <ContextMenuItem label="Delete" danger onClick={() => deleteItem(contextMenu.id, contextMenu.type)} />
          </div>
        </>
      )}

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
              <div className="absolute top-[calc(100%+4px)] left-1.5 right-1.5 bg-[var(--paper-elevated)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden z-[100] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className="px-2.5 py-2 cursor-pointer border-b border-[var(--sidebar-border)] last:border-b-0 transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
                    onMouseDown={() => openNote(note.id)}
                  >
                    <div className="text-[12.5px] font-medium text-[var(--text-primary)]">{note.title}</div>
                    <div className="text-[11.5px] mt-0.5 truncate text-[var(--text-muted)]">
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
              <div className="relative" ref={addMenuRef}>
                <button
                  className="flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border-none bg-transparent text-[var(--sidebar-text-muted)] cursor-pointer transition-colors duration-100 hover:bg-[var(--sidebar-active)] hover:text-[var(--sidebar-text-active)]"
                  title="Add"
                  onClick={() => setAddMenuOpen(prev => !prev)}
                >
                  <PlusIcon />
                </button>

                {addMenuOpen && (
                  <div className="absolute top-[calc(100%+4px)] right-0 w-40 bg-[var(--paper-elevated)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden z-[100] shadow-[0_4px_16px_rgba(0,0,0,0.1)] normal-case tracking-normal">
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-left transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
                      onClick={addNote}
                    >
                      <NoteIcon />
                      <span>New File</span>
                    </button>
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-left transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
                      onClick={addFolder}
                    >
                      <FolderIcon />
                      <span>New Folder</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {folders.map(folder => {
              const folderNotes = folder.noteIds.map(id => notes[id]).filter(Boolean)
              return (
                <div key={folder.id}>
                  <div
                    className="flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[12.5px] font-medium text-[var(--sidebar-text)] cursor-pointer select-none transition-colors duration-100 hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)]"
                    onClick={() => toggleFolder(folder.id)}
                    onDoubleClick={(e) => { e.stopPropagation(); startRename(folder.id, folder.name) }}
                    onContextMenu={(e) => openContextMenu(e, folder.id, 'folder')}
                  >
                    <span className="flex text-[var(--sidebar-text-muted)] -mr-0.5"><ChevronIcon down={folder.expanded} /></span>
                    <FolderIcon open={folder.expanded} />
                    {renamingId === folder.id ? (
                      <input
                        ref={renameInputRef}
                        className="flex-1 bg-[var(--paper-elevated)] border border-[var(--accent)] rounded px-1 py-0 text-[12.5px] text-[var(--text-primary)] outline-none"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(folder.id, 'folder')}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitRename(folder.id, 'folder')
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onClick={e => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1">{folder.name}</span>
                    )}
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
                      onDoubleClick={(e) => { e.stopPropagation(); startRename(note.id, note.title) }}
                      onContextMenu={(e) => openContextMenu(e, note.id, 'note')}
                    >
                      <span className="shrink-0 flex"><NoteIcon /></span>
                      {renamingId === note.id ? (
                        <input
                          ref={renameInputRef}
                          className="flex-1 bg-[var(--paper-elevated)] border border-[var(--accent)] rounded px-1 py-0 text-[12.5px] text-[var(--text-primary)] outline-none"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(note.id, 'note')}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRename(note.id, 'note')
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span className="truncate">{note.title}</span>
                      )}
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

          {/* Hidden file input — triggered by clicking "New File" */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onFileSelected}
            suppressHydrationWarning
          />
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
                    {note.type === 'document' ? <DocIcon /> : <NoteIcon />}
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

          {/* Editor / Canvas */}
          {activeNote?.type === 'document' ? (
            <CanvasView pdfUrl={activeNote.pdfUrl!} />
          ) : activeNote ? (
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
