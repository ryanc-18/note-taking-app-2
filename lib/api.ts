// ─── API Service Layer ────────────────────────────────────────────────────────
//
// Every function here talks to one API route and returns the result.
// Components import these functions instead of writing fetch() calls directly.
//

// ── Folders ───────────────────────────────────────────────────────────────────

export async function getFolders() {
  const res = await fetch('/api/folders')
  if (!res.ok) throw new Error('Failed to load folders')
  return res.json()
}

export async function createFolder(name: string) {
  const res = await fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create folder')
  return res.json()
}

export async function renameFolder(id: string, name: string) {
  const res = await fetch(`/api/folders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to rename folder')
  return res.json()
}

export async function deleteFolder(id: string) {
  const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete folder')
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function createNote(title: string, content: string, folderId: string, pdfUrl?: string) {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, folderId, pdfUrl }),
  })
  if (!res.ok) throw new Error('Failed to create note')
  return res.json()
}

export async function renameNote(id: string, title: string) {
  const res = await fetch(`/api/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to rename note')
  return res.json()
}

export async function deleteNote(id: string) {
  const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete note')
}

// ── File Upload ───────────────────────────────────────────────────────────────

export async function uploadPdf(file: File, folderId: string) {
  const form = new FormData()
  form.append('file', file)
  form.append('folderId', folderId)

  const res = await fetch('/api/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}
