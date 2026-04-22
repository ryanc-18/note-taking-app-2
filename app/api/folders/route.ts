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
  const { name, parentId } = await request.json()

  const user = await prisma.user.findUnique({ where: { email: DEV_USER_EMAIL } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  let folder
  try {
    folder = await prisma.folder.create({
      data: { name, userId: user.id, parentId: parentId ?? null },
      include: { notes: true },
    })
  } catch (e) {
    console.error('Prisma error creating folder:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  return NextResponse.json(folder, { status: 201 })
}
