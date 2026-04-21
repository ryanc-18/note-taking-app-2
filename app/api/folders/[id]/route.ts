import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name } = await request.json()

  const folder = await prisma.folder.update({
    where: { id },
    data: { name },
  })

  return NextResponse.json(folder)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await prisma.note.deleteMany({ where: { folderId: id } })
  await prisma.folder.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
