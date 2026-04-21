import { useState, useCallback, useEffect } from 'react'
import type { Note, Folder } from '@/types'
import {
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  createNote,
  renameNote,
  deleteNote,
  moveNote,
  uploadPdf,
} from '@/lib/api'

export function useWorkspace() {
  const [notes, setNotes] = useState<Record<string, Note>>({})
  const [folders, setFolders] = useState<Folder[]>([])
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('')

  // Derived value — the note currently being viewed
  const activeNote = notes[activeTab]

  // ── Load data from the database on mount ───────────────────────────────────
  useEffect(() => {
    async function loadData() {
      const dbFolders = await getFolders()
      const notesMap: Record<string, Note> = {}
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
      setFolders(folderList)
    }

    loadData()
  }, [])

  // ── Tabs ───────────────────────────────────────────────────────────────────

  const openNote = useCallback((noteId: string) => {
    setOpenTabs(prev => prev.includes(noteId) ? prev : [...prev, noteId])
    setActiveTab(noteId)
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

  // Called by the component when the user picks a file from the OS picker
  const onFileSelected = useCallback(async (file: File, folderId: string) => {
    if (!folderId) return

    // Show a temp entry immediately so the UI doesn't feel frozen
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

    try {
      const saved = await uploadPdf(file, folderId)
      const savedDoc: Note = {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        folder: saved.folderId,
        updatedAt: 'Just now',
        type: 'document',
        pdfUrl: saved.pdfUrl,
      }
      // Swap the temp entry out for the real saved one
      setNotes(prev => { const { [tempId]: _, ...rest } = prev; return { ...rest, [saved.id]: savedDoc } })
      setFolders(prev => prev.map(f =>
        f.id === folderId ? { ...f, noteIds: f.noteIds.map(id => id === tempId ? saved.id : id) } : f
      ))
      setOpenTabs(prev => prev.map(id => id === tempId ? saved.id : id))
      setActiveTab(saved.id)
    } catch {
      // Upload failed — remove the temp entry
      setNotes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== tempId)))
      setFolders(prev => prev.map(f => ({ ...f, noteIds: f.noteIds.filter(n => n !== tempId) })))
      setOpenTabs(prev => prev.filter(t => t !== tempId))
    }
  }, [folders])

  // value is passed in from the component (it owns the rename input state)
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
  }, [notes, folders])

  const pasteNote = useCallback(async (sourceNote: Note, action: 'copy' | 'cut', folderId: string) => {
    const saved = await createNote(sourceNote.title, sourceNote.content, folderId)
    const newNote: Note = { id: saved.id, title: saved.title, content: saved.content, folder: saved.folderId, updatedAt: 'Just now', type: 'note' }
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
    setOpenTabs(prev => prev.filter(t => t !== id))
    setActiveTab(prev => prev === id ? '' : prev)
  }, [])

  // ── Folders ────────────────────────────────────────────────────────────────

  const toggleFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, expanded: !f.expanded } : f))
  }, [])

  const addFolder = useCallback(async () => {
    const folder = await createFolder('New Folder')
    setFolders(prev => [...prev, { id: folder.id, name: folder.name, noteIds: [], expanded: true }])
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
    // State
    notes,
    folders,
    openTabs,
    activeTab,
    activeNote,
    // Tab operations
    openNote,
    closeTab,
    // Note operations
    onFileSelected,
    commitRename,
    duplicateNote,
    pasteNote,
    removeNote,
    moveNoteToFolder,
    // Folder operations
    toggleFolder,
    addFolder,
    removeFolder,
  }
}
