import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbUser } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await getDbUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const folderId = formData.get('folderId') as string | null

  if (!file || !folderId) {
    return NextResponse.json({ error: 'Missing file or folderId' }, { status: 400 })
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true })

  // Save note record with the permanent blob URL
  const note = await prisma.note.create({
    data: {
      title: file.name.replace(/\.pdf$/i, ''),
      content: '',
      pdfUrl: blob.url,
      userId: user.id,
      folderId,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
