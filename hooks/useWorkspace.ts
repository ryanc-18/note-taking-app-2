import { useState, useCallback, useEffect } from 'react'
import type { Note, Folder } from '@/types'
import {
  getWorkspaceData,
  createFolder,
  renameFolder,
  deleteFolder,
  moveFolderToFolder,
  createNote,
  renameNote,
  deleteNote,
  moveNote,
  uploadPdf,
} from '@/lib/api'

export function useWorkspace() {
  const [notes, setNotes] = useState<Record<string, Note>>({})
  const [folders, setFolders] = useState<Folder[]>([])
  const [rootNoteIds, setRootNoteIds] = useState<string[]>([])
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('')

  const activeNote = notes[activeTab]

  // ── Load data from the database on mount ───────────────────────────────────
  useEffect(() => {
    async function loadData() {
      const { folders: dbFolders, rootNotes: dbRootNotes } = await getWorkspaceData()
      const notesMap: Record<string, Note> = {}
      const folderList: Folder[] = []

      for (const folder of dbFolders) {
        const noteIds: string[] = []
        for (const note of folder.notes) {
          notesMap[note.id] = {
            id: note.id,
            title: note.title,
            content: note.content,
            folder: note.folderId ?? null,
            updatedAt: new Date(note.updatedAt).toLocaleDateString(),
            type: note.pdfUrl ? 'document' : 'note',
            pdfUrl: note.pdfUrl ?? undefined,
          }
          noteIds.push(note.id)
        }
        folderList.push({ id: folder.id, name: folder.name, noteIds, expanded: true, parentId: folder.parentId ?? null })
      }

      const rootIds: string[] = []
      for (const note of dbRootNotes) {
        notesMap[note.id] = {
          id: note.id,
          title: note.title,
          content: note.content,
          folder: null,
          updatedAt: new Date(note.updatedAt).toLocaleDateString(),
          type: note.pdfUrl ? 'document' : 'note',
          pdfUrl: note.pdfUrl ?? undefined,
        }
        rootIds.push(note.id)
      }

      setNotes(notesMap)
      setFolders(folderList)
      setRootNoteIds(rootIds)
    }

    loadData()
  }, [])

  // ── Tabs ───────────────────────────────────────────────────────────────────

  const [recentNoteIds, setRecentNoteIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentNotes') ?? '[]') } catch { return [] }
  })

  const openNote = useCallback((noteId: string) => {
    setOpenTabs(prev => prev.includes(noteId) ? prev : [...prev, noteId])
    setActiveTab(noteId)
    setRecentNoteIds(prev => {
      const next = [noteId, ...prev.filter(id => id !== noteId)].slice(0, 10)
      localStorage.setItem('recentNotes', JSON.stringify(next))
      return next
    })
  }, [])

  const closeTab = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs(prev => {
      const idx = prev.indexOf(noteId)
      const next = prev.filter(id => id !== noteId)
      setActiveTab(current => current === noteId ? (next[Math.max(0, idx - 1)] ?? '') : current)
      return next
    })
  }, [])

  // ── Notes ──────────────────────────────────────────────────────────────────

  const onFileSelected = useCallback(async (file: File, folderId: string | null) => {
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
    if (folderId) {
      setFolders(prev => prev.map(f =>
        f.id === folderId ? { ...f, expanded: true, noteIds: [...f.noteIds, tempId] } : f
      ))
    } else {
      setRootNoteIds(prev => [...prev, tempId])
    }
    setOpenTabs(prev => [...prev, tempId])
    setActiveTab(tempId)

    try {
      const saved = await uploadPdf(file, folderId)
      const savedDoc: Note = {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        folder: saved.folderId ?? null,
        updatedAt: 'Just now',
        type: 'document',
        pdfUrl: saved.pdfUrl,
      }
      setNotes(prev => { const { [tempId]: _, ...rest } = prev; return { ...rest, [saved.id]: savedDoc } })
      if (folderId) {
        setFolders(prev => prev.map(f =>
          f.id === folderId ? { ...f, noteIds: f.noteIds.map(id => id === tempId ? saved.id : id) } : f
        ))
      } else {
        setRootNoteIds(prev => prev.map(id => id === tempId ? saved.id : id))
      }
      setOpenTabs(prev => prev.map(id => id === tempId ? saved.id : id))
      setActiveTab(saved.id)
    } catch {
      setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== tempId)))
      if (folderId) {
        setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== tempId) })))
      } else {
        setRootNoteIds(prev => prev.filter(id => id !== tempId))
      }
      setOpenTabs(prev => prev.filter(t => t !== tempId))
    }
  }, [])

  const commitRename = useCallback(async (id: string, type: 'folder' | 'note', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (type === 'folder') {
      await renameFolder(id, trimmed)
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: trimmed } : f))
    } else {
      await renameNote(id, trimmed)
      setNotes(prev => ({ ...prev, [id]: { ...prev[id], title: trimmed } }))
    }
  }, [])

  const duplicateNote = useCallback(async (id: string) => {
    const note = notes[id]
    if (!note) return
    const validFolderIds = new Set(folders.map(f => f.id))
    const folderId = (note.folder && validFolderIds.has(note.folder)) ? note.folder : folders[0]?.id
    if (!folderId) return
    const saved = await createNote(`${note.title} (copy)`, note.content, folderId, note.pdfUrl)
    const newNote: Note = {
      id: saved.id, title: saved.title, content: saved.content,
      folder: saved.folderId ?? null, updatedAt: 'Just now',
      type: note.pdfUrl ? 'document' : 'note',
      pdfUrl: note.pdfUrl,
    }
    setNotes(prev => ({ ...prev, [saved.id]: newNote }))
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, noteIds: [...f.noteIds, saved.id] } : f))
  }, [notes, folders])

  const pasteNote = useCallback(async (sourceNote: Note, action: 'copy' | 'cut', folderId: string) => {
    const saved = await createNote(sourceNote.title, sourceNote.content, folderId)
    const newNote: Note = { id: saved.id, title: saved.title, content: saved.content, folder: saved.folderId ?? null, updatedAt: 'Just now', type: 'note' }
    setNotes(prev => ({ ...prev, [saved.id]: newNote }))
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, noteIds: [...f.noteIds, saved.id] } : f))
    if (action === 'cut') {
      await deleteNote(sourceNote.id)
      setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== sourceNote.id)))
      setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== sourceNote.id) })))
      setOpenTabs(prev => prev.filter(t => t !== sourceNote.id))
    }
  }, [])

  const moveNoteToFolder = useCallback(async (noteId: string, targetFolderId: string) => {
    await moveNote(noteId, targetFolderId)
    setNotes(prev => ({ ...prev, [noteId]: { ...prev[noteId], folder: targetFolderId } }))
    setRootNoteIds(prev => prev.filter(id => id !== noteId))
    setFolders(prev => prev.map(f => {
      if (f.noteIds.includes(noteId)) return { ...f, noteIds: f.noteIds.filter(id => id !== noteId) }
      if (f.id === targetFolderId) return { ...f, noteIds: [...f.noteIds, noteId] }
      return f
    }))
  }, [])

  const removeNote = useCallback(async (id: string) => {
    await deleteNote(id)
    setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id)))
    setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== id) })))
    setRootNoteIds(prev => prev.filter(n => n !== id))
    setOpenTabs(prev => prev.filter(t => t !== id))
    setActiveTab(prev => prev === id ? '' : prev)
  }, [])

  // ── Folders ────────────────────────────────────────────────────────────────

  const toggleFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, expanded: !f.expanded } : f))
  }, [])

  const addFolder = useCallback(async (parentId?: string) => {
    const folder = await createFolder('New Folder', parentId)
    setFolders(prev => [...prev, { id: folder.id, name: folder.name, noteIds: [], expanded: true, parentId: parentId ?? null }])
  }, [])

  const moveFolderTo = useCallback(async (folderId: string, targetParentId: string | null, allFolders: Folder[]) => {
    function isDescendant(parentId: string, candidateId: string): boolean {
      const children = allFolders.filter(f => f.parentId === parentId)
      return children.some(c => c.id === candidateId || isDescendant(c.id, candidateId))
    }
    if (targetParentId && (targetParentId === folderId || isDescendant(folderId, targetParentId))) return

    await moveFolderToFolder(folderId, targetParentId)
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, parentId: targetParentId } : f))
  }, [])

  const removeFolder = useCallback(async (id: string) => {
    await deleteFolder(id)
    const folder = folders.find(f => f.id === id)
    if (folder) {
      setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => !folder.noteIds.includes(k))))
      setOpenTabs(prev => prev.filter(t => !folder.noteIds.includes(t)))
      setFolders(prev => prev.filter(f => f.id !== id))
    }
  }, [folders])

  return {
    notes,
    folders,
    rootNoteIds,
    openTabs,
    activeTab,
    activeNote,
    recentNoteIds,
    openNote,
    closeTab,
    onFileSelected,
    commitRename,
    duplicateNote,
    pasteNote,
    removeNote,
    moveNoteToFolder,
    toggleFolder,
    addFolder,
    removeFolder,
    moveFolderTo,
  }
}
