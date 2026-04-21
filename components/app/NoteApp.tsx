'use client'

import { useState, useCallback, useRef } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import type { Note } from '@/types'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import NoteEditor from './NoteEditor'
import ContextMenu from './ContextMenu'

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

const appStyles = `
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
  const {
    notes, folders, openTabs, activeTab, activeNote,
    openNote, closeTab,
    onFileSelected, commitRename, duplicateNote, pasteNote, removeNote, moveNoteToFolder,
    toggleFolder, addFolder, removeFolder,
  } = useWorkspace()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; type: 'folder' | 'note' } | null>(null)
  const [clipboard, setClipboard] = useState<{ note: Note; action: 'copy' | 'cut' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const folderId = selectedFolderId ?? folders[0]?.id ?? ''
    await onFileSelected(file, folderId)
    e.target.value = ''
  }, [onFileSelected, selectedFolderId, folders])

  const startRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id)
    setRenameValue(currentName)
  }, [])

  const handleCommitRename = useCallback(async (id: string, type: 'folder' | 'note') => {
    await commitRename(id, type, renameValue)
    setRenamingId(null)
  }, [commitRename, renameValue])

  const openContextMenu = useCallback((e: React.MouseEvent, id: string, type: 'folder' | 'note') => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, id, type })
  }, [])

  const filteredNotes = searchQuery
    ? Object.values(notes).filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <>
      <style>{appStyles}</style>
      <div className="grain-overlay fixed inset-0 pointer-events-none z-[9999] opacity-40" aria-hidden="true" />

      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          notes={notes}
          folders={folders}
          clipboard={clipboard}
          onClose={() => setContextMenu(null)}
          onRename={startRename}
          onCopy={(note) => setClipboard({ note, action: 'copy' })}
          onCut={(note) => setClipboard({ note, action: 'cut' })}
          onPaste={async (folderId) => {
            if (!clipboard) return
            await pasteNote(clipboard.note, clipboard.action, folderId)
            setClipboard(null)
          }}
          onDuplicate={duplicateNote}
          onDelete={async (id, type) => {
            setContextMenu(null)
            if (type === 'folder') await removeFolder(id)
            else await removeNote(id)
          }}
        />
      )}

      <div
        className="flex h-screen w-screen overflow-hidden text-[13px] bg-[var(--paper-bg)] text-[var(--text-primary)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        <Sidebar
          notes={notes}
          folders={folders}
          activeTab={activeTab}
          renamingId={renamingId}
          renameValue={renameValue}
          onRenameValueChange={setRenameValue}
          onCommitRename={handleCommitRename}
          onCancelRename={() => setRenamingId(null)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredNotes={filteredNotes}
          onOpenNote={openNote}
          onToggleFolder={toggleFolder}
          onAddNote={() => fileInputRef.current?.click()}
          onAddFolder={addFolder}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onContextMenu={openContextMenu}
          onStartRename={startRename}
          onMoveNote={moveNoteToFolder}
          fileInputRef={fileInputRef}
          onFileSelected={handleFileSelected}
        />

        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--paper-surface)]">
          <TabBar
            openTabs={openTabs}
            notes={notes}
            activeTab={activeTab}
            onSelect={openNote}
            onClose={closeTab}
          />
          <NoteEditor activeNote={activeNote} />
        </div>
      </div>
    </>
  )
}
