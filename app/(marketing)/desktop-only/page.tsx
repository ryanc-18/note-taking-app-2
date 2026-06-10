import Link from 'next/link'
import { PinnoteLogo } from '@/app/(marketing)/page'

export default function DesktopOnlyPage() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center"
      style={{ background: '#161616', fontFamily: 'Inter, sans-serif' }}
    >
      <PinnoteLogo size={40} className="mb-8 opacity-80" />

      <h1
        className="font-bold mb-4"
        style={{
          fontSize: 'clamp(26px, 6vw, 36px)',
          letterSpacing: '-0.03em',
          lineHeight: '1.15',
          color: '#F0F0F0',
        }}
      >
        Pinnote is a desktop app
      </h1>

      <p
        className="mb-10 mx-auto"
        style={{
          fontSize: '16px',
          lineHeight: '1.75',
          maxWidth: '320px',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        For the full experience, open Pinnote on your laptop or desktop computer.
      </p>

      <Link
        href="/"
        className="text-[14px] font-medium"
        style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
      >
        Back to home
      </Link>
    </div>
  )
}
