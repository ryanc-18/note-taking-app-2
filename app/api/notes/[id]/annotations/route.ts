import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notes/[id]/annotations — load all annotations for a note
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const annotations = await prisma.annotation.findMany({
    where: { noteId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(annotations)
}

// POST /api/notes/[id]/annotations — create a new annotation
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { page, x, y, number, text } = await req.json()
  const annotation = await prisma.annotation.create({
    data: { noteId: id, page, x, y, number, text: text ?? '' },
  })
  return NextResponse.json(annotation, { status: 201 })
}
