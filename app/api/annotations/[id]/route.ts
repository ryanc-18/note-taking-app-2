import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/annotations/[id] — update annotation text
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { text } = await req.json()
  const annotation = await prisma.annotation.update({
    where: { id },
    data: { text },
  })
  return NextResponse.json(annotation)
}

// DELETE /api/annotations/[id] — delete an annotation
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.annotation.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
