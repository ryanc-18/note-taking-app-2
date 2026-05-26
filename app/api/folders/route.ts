import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbUser } from '@/lib/auth'

export async function GET() {
  const user = await getDbUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const folders = await prisma.folder.findMany({
    where: { userId: user.id },
    include: { notes: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(folders)
}

export async function POST(request: Request) {
  const user = await getDbUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, parentId } = await request.json()

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
