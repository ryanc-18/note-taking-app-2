import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbUser } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await getDbUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, folderId, pdfUrl } = await request.json()

  const note = await prisma.note.create({
    data: {
      title,
      content: content ?? '',
      pdfUrl: pdfUrl ?? null,
      userId: user.id,
      folderId,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
