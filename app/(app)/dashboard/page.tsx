'use client'

import dynamic from 'next/dynamic'

const NoteApp = dynamic(() => import('@/components/app/NoteApp'), { ssr: false })

export default function DashboardPage() {
  return <NoteApp />
}
