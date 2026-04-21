import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, folderId } = await request.json()

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(folderId !== undefined && { folderId }),
    },
  })

  return NextResponse.json(note)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await prisma.note.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
