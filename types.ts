export type Note = {
  id: string
  title: string
  content: string
  folder: string
  updatedAt: string
  type?: 'note' | 'document'
  pdfUrl?: string
}

export type Folder = {
  id: string
  name: string
  noteIds: string[]
  expanded: boolean
}
