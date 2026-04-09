import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEV_USER_EMAIL = 'dev@local.com'

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { email: DEV_USER_EMAIL },
    include: {
      folders: {
        include: { notes: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user.folders)
}

export async function POST(request: Request) {
  const { name } = await request.json()

  const user = await prisma.user.findUnique({ where: { email: DEV_USER_EMAIL } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const folder = await prisma.folder.create({
    data: { name, userId: user.id },
    include: { notes: true },
  })

  return NextResponse.json(folder, { status: 201 })
}
