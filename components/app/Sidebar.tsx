import React, { useRef, useEffect, useState } from 'react'
import type { Note, Folder } from '@/types'
import {
  SearchIcon, FolderIcon, NoteIcon, ChevronIcon,
  PlusIcon, HomeIcon, SettingsIcon,
} from '@/components/ui/icons'

type Props = {
  notes: Record<string, Note>
  folders: Folder[]
  activeTab: string
  renamingId: string | null
  renameValue: string
  onRenameValueChange: (value: string) => void
  onCommitRename: (id: string, type: 'folder' | 'note') => void
  onCancelRename: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  filteredNotes: Note[]
  onOpenNote: (id: string) => void
  onToggleFolder: (id: string) => void
  onAddNote: () => void
  onAddFolder: () => void
  selectedFolderId: string | null
  onSelectFolder: (id: string) => void
  onContextMenu: (e: React.MouseEvent, id: string, type: 'folder' | 'note') => void
  onStartRename: (id: string, currentName: string) => void
  onMoveNote: (noteId: string, targetFolderId: string) => void
  onMoveFolder: (folderId: string, targetParentId: string | null) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Sidebar({
  notes, folders, activeTab,
  renamingId, renameValue, onRenameValueChange, onCommitRename, onCancelRename,
  searchQuery, onSearchChange, filteredNotes,
  onOpenNote, onToggleFolder, onAddNote, onAddFolder,
  selectedFolderId, onSelectFolder,
  onContextMenu, onStartRename, onMoveNote, onMoveFolder,
  fileInputRef, onFileSelected,
}: Props) {
  const addMenuRef = useRef<HTMLDivElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (renamingId) setTimeout(() => renameInputRef.current?.select(), 0)
  }, [renamingId])

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

  return (
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
            onChange={e => onSearchChange(e.target.value)}
            onBlur={() => setTimeout(() => onSearchChange(''), 200)}
          />
        </div>
        {searchQuery && filteredNotes.length > 0 && (
          <div className="absolute top-[calc(100%+4px)] left-1.5 right-1.5 bg-[var(--paper-elevated)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden z-[100] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="px-2.5 py-2 cursor-pointer border-b border-[var(--sidebar-border)] last:border-b-0 transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
                onMouseDown={() => onOpenNote(note.id)}
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
              onClick={() => setAddMenuOpen((prev: boolean) => !prev)}
            >
              <PlusIcon />
            </button>
            {addMenuOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-40 bg-[var(--paper-elevated)] border border-[var(--sidebar-border)] rounded-lg overflow-hidden z-[100] shadow-[0_4px_16px_rgba(0,0,0,0.1)] normal-case tracking-normal">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-left transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
                  onClick={() => { onAddNote(); setAddMenuOpen(false) }}
                >
                  <NoteIcon /><span>New File</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-left transition-colors duration-100 hover:bg-[var(--sidebar-hover)]"
                  onClick={() => { onAddFolder(); setAddMenuOpen(false) }}
                >
                  <FolderIcon /><span>New Folder</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {(() => {
          function renderFolder(folder: Folder, depth: number): React.ReactNode {
            const folderNotes = folder.noteIds.map(id => notes[id]).filter(Boolean)
            const childFolders = folders.filter(f => f.parentId === folder.id)
            const indent = depth * 12

            return (
              <div key={folder.id}>
                <div
                  className={`flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[12.5px] font-medium cursor-pointer select-none transition-colors duration-100 hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)] ${
                    dragOverFolderId === folder.id ? 'bg-[var(--sidebar-active)] ring-1 ring-[var(--accent)]' :
                    selectedFolderId === folder.id ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]' :
                    'text-[var(--sidebar-text)]'
                  }`}
                  style={{ paddingLeft: `${8 + indent}px` }}
                  draggable
                  onClick={() => { onToggleFolder(folder.id); onSelectFolder(folder.id) }}
                  onDoubleClick={(e) => { e.stopPropagation(); onStartRename(folder.id, folder.name) }}
                  onContextMenu={(e) => onContextMenu(e, folder.id, 'folder')}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('folderId', folder.id)
                    e.dataTransfer.effectAllowed = 'move'
                    e.stopPropagation()
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverFolderId(folder.id) }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const noteId = e.dataTransfer.getData('noteId')
                    const draggedFolderId = e.dataTransfer.getData('folderId')
                    if (noteId) onMoveNote(noteId, folder.id)
                    else if (draggedFolderId && draggedFolderId !== folder.id) onMoveFolder(draggedFolderId, folder.id)
                    setDragOverFolderId(null)
                  }}
                >
                  <span className="flex text-[var(--sidebar-text-muted)] -mr-0.5"><ChevronIcon down={folder.expanded} /></span>
                  <FolderIcon open={folder.expanded} />
                  {renamingId === folder.id ? (
                    <input
                      ref={renameInputRef}
                      className="flex-1 bg-[var(--paper-elevated)] border border-[var(--accent)] rounded px-1 py-0 text-[12.5px] text-[var(--text-primary)] outline-none"
                      value={renameValue}
                      onChange={e => onRenameValueChange(e.target.value)}
                      onBlur={() => onCommitRename(folder.id, 'folder')}
                      onKeyDown={e => {
                        if (e.key === 'Enter') onCommitRename(folder.id, 'folder')
                        if (e.key === 'Escape') onCancelRename()
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1">{folder.name}</span>
                  )}
                  <span className="text-[11px] text-[var(--sidebar-text-muted)]">{folderNotes.length}</span>
                </div>

                {folder.expanded && (
                  <>
                    {folderNotes.map(note => (
                      <button
                        key={note.id}
                        className={`flex items-center gap-1.5 w-full py-1 px-2 rounded-md text-[12.5px] text-left border-none cursor-pointer select-none truncate transition-colors duration-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent)] ${
                          activeTab === note.id
                            ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
                            : 'bg-transparent text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]'
                        }`}
                        style={{ paddingLeft: `${28 + indent}px` }}
                        onClick={() => onOpenNote(note.id)}
                        onDoubleClick={(e) => { e.stopPropagation(); onStartRename(note.id, note.title) }}
                        onContextMenu={(e) => onContextMenu(e, note.id, 'note')}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('noteId', note.id)
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                      >
                        <span className="shrink-0 flex"><NoteIcon /></span>
                        {renamingId === note.id ? (
                          <input
                            ref={renameInputRef}
                            className="flex-1 bg-[var(--paper-elevated)] border border-[var(--accent)] rounded px-1 py-0 text-[12.5px] text-[var(--text-primary)] outline-none"
                            value={renameValue}
                            onChange={e => onRenameValueChange(e.target.value)}
                            onBlur={() => onCommitRename(note.id, 'note')}
                            onKeyDown={e => {
                              if (e.key === 'Enter') onCommitRename(note.id, 'note')
                              if (e.key === 'Escape') onCancelRename()
                            }}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <span className="truncate">{note.title}</span>
                        )}
                      </button>
                    ))}
                    {childFolders.map(child => renderFolder(child, depth + 1))}
                  </>
                )}
              </div>
            )
          }

          return folders.filter(f => f.parentId === null).map(f => renderFolder(f, 0))
        })()}
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onFileSelected}
        suppressHydrationWarning
      />
    </aside>
  )
}
