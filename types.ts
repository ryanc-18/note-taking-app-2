export type Note = {
  id: string
  title: string
  content: string
  folder: string
  updatedAt: string
  type?: 'note' | 'document'
  pdfUrl?: string
}

export type Annotation = {
  id: string
  page: number   // which page (0-indexed)
  x: number      // percentage across the page (0–100)
  y: number      // percentage down the page (0–100)
  number: number // the number shown in the marker dot
}

export type Folder = {
  id: string
  name: string
  noteIds: string[]
  expanded: boolean
  parentId: string | null
}
