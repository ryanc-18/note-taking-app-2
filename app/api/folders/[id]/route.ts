import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const folder = await prisma.folder.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.parentId !== undefined && { parentId: body.parentId }),
    },
  })

  return NextResponse.json(folder)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  async function deleteFolderRecursive(folderId: string) {
    const children = await prisma.folder.findMany({ where: { parentId: folderId } })
    for (const child of children) {
      await deleteFolderRecursive(child.id)
    }
    await prisma.note.deleteMany({ where: { folderId } })
    await prisma.folder.delete({ where: { id: folderId } })
  }

  await deleteFolderRecursive(id)

  return new NextResponse(null, { status: 204 })
}
