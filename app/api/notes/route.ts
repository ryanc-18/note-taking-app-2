import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEV_USER_EMAIL = 'dev@local.com'

export async function POST(request: Request) {
  const { title, content, folderId } = await request.json()

  const user = await prisma.user.findUnique({ where: { email: DEV_USER_EMAIL } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const note = await prisma.note.create({
    data: {
      title,
      content: content ?? '',
      userId: user.id,
      folderId,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
