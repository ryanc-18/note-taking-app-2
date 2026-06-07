'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, ReactNode } from 'react'
import { SVGProps } from 'react'
import { MacbookScroll } from '@/components/ui/macbook-scroll'

// ── Brand ─────────────────────────────────────────────────────────────────────
const BLUE = '#2D3E9E'
const NAVY = '#101640'

// ── Dark theme tokens ─────────────────────────────────────────────────────────
const BG = '#161616'
const SURFACE = '#1F1F1F'
const ELEVATED = '#272727'
const TEXT = '#F0F0F0'
const TEXT_MUTED = 'rgba(255,255,255,0.4)'
const BORDER = 'rgba(255,255,255,0.08)'

// ── Logo SVG ──────────────────────────────────────────────────────────────────
type MarkProps = SVGProps<SVGSVGElement> & { title?: string; size?: number }

function Stem() {
  return <rect x={12} y={6} width={8} height={36} rx={4} fill={BLUE} />
}

export function PinnoteLogo({ title, size = 48, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title}
      width={size}
      height={size}
      {...props}
    >
      <Stem />
      <g transform="rotate(34 26 15)">
        <path
          d="M26 5.5C20.5 5.5 16 10 16 15.5 16 23.1 26 32.5 26 32.5S36 23.1 36 15.5C36 10 31.5 5.5 26 5.5Z M30 15.5A4 4 0 1 0 22 15.5A4 4 0 1 0 30 15.5Z"
          fill="#8090D8"
          fillRule="evenodd"
        />
      </g>
    </svg>
  )
}

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true)
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left focus-visible:outline-none"
      >
        <span
          className="text-[15px] font-medium"
          style={{ color: TEXT, transition: 'color 0.15s ease' }}
        >
          {q}
        </span>
        <span
          className="ml-6 flex-shrink-0 text-2xl font-light leading-none"
          style={{
            color: TEXT_MUTED,
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? '300px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <p
          className="text-[15px] pb-6"
          style={{ color: TEXT_MUTED, lineHeight: '1.75' }}
        >
          {a}
        </p>
      </div>
    </div>
  )
}

// ── App mockup ────────────────────────────────────────────────────────────────
function AppMockup() {
  return (
    <div
      className="flex flex-col overflow-hidden w-full h-full"
    >
      {/* Traffic lights bar */}
      <div
        className="flex items-center gap-2 px-4 h-9"
        style={{
          background: '#E8E3DA',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: '#FF6058' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
      </div>

      {/* App body */}
      <div className="flex flex-1 min-h-0" style={{ background: '#FAF7F2' }}>
        {/* Sidebar */}
        <div
          className="flex-shrink-0 flex flex-col pt-3 pb-3 gap-0.5"
          style={{
            width: '136px',
            background: '#EEEBE3',
            borderRight: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#A09890' }}
          >
            Folders
          </div>
          {[
            { label: 'Research', active: true, nested: false },
            { label: 'Papers', active: false, nested: true },
            { label: 'Textbooks', active: false, nested: true },
            { label: 'Essays', active: false, nested: false },
          ].map(({ label, active, nested }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 mx-2 px-2 py-1 rounded-md text-[11px]"
              style={{
                paddingLeft: nested ? '20px' : '8px',
                background: active ? 'rgba(0,0,0,0.08)' : 'transparent',
                color: active ? '#1C1917' : '#78716C',
                fontWeight: active ? 600 : 400,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1.5 4h9v6H1.5V4zM1.5 4L3 2.5h3L7 4"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              {label}
            </div>
          ))}

          <div
            className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#A09890' }}
          >
            Documents
          </div>
          {['climate-study.pdf', 'ml-survey.pdf'].map((n) => (
            <div
              key={n}
              className="flex items-center gap-1.5 mx-2 px-2 py-1 rounded-md text-[11px]"
              style={{ color: '#78716C', paddingLeft: '16px' }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="1" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1" />
                <line x1="4" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="0.8" />
                <line x1="4" y1="6.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="0.8" />
              </svg>
              {n}
            </div>
          ))}
        </div>

        {/* PDF viewer */}
        <div className="flex-1 flex flex-col" style={{ background: '#FAF7F2' }}>
          {/* Tab bar */}
          <div
            className="flex items-center gap-1 px-3 h-8 flex-shrink-0"
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              background: '#F0ECE5',
            }}
          >
            <div
              className="flex items-center gap-1.5 px-2.5 h-5 rounded text-[10px] font-medium"
              style={{
                background: '#FAF7F2',
                color: '#57534E',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="1" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1" />
              </svg>
              climate-study.pdf
            </div>
          </div>

          {/* PDF page */}
          <div className="flex-1 flex items-start justify-center p-3 pt-4">
            <div
              className="bg-white rounded w-full relative p-4"
              style={{
                maxWidth: '240px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div className="space-y-2 mb-5">
                <div
                  className="h-3 rounded text-[10px] font-bold mb-3"
                  style={{ width: '65%', background: '#1C1917' }}
                />
                {[92, 78, 85, 72, 88, 65, 80, 75, 90, 60, 82, 70].map((w, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full"
                    style={{ width: `${w}%`, background: '#D6D3D1' }}
                  />
                ))}
              </div>

              <div
                className="absolute flex items-center justify-center text-white text-[10px] font-bold rounded-full w-5 h-5"
                style={{
                  background: BLUE,
                  top: '28%',
                  right: '14%',
                  boxShadow: `0 2px 6px rgba(0,0,0,0.4)`,
                  cursor: 'pointer',
                }}
              >
                1
              </div>

              <div
                className="absolute flex items-center justify-center text-white text-[10px] font-bold rounded-full w-5 h-5"
                style={{
                  background: BLUE,
                  top: '60%',
                  left: '42%',
                  boxShadow: `0 2px 6px rgba(0,0,0,0.4)`,
                  cursor: 'pointer',
                }}
              >
                2
              </div>
            </div>
          </div>
        </div>

        {/* Annotations panel */}
        <div
          className="flex-shrink-0 pt-3 pb-3 px-2.5 flex flex-col gap-1.5"
          style={{
            width: '158px',
            background: '#FFFDF8',
            borderLeft: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: '#A09890' }}
          >
            Annotations
          </div>
          {[
            {
              n: 1,
              label: 'Key finding',
              body: 'Temperature anomaly correlates with CO₂ — follow up with 2023 data.',
            },
            {
              n: 2,
              label: 'Methodology',
              body: 'Compare against Chen et al. — different sample size.',
            },
          ].map(({ n, label, body }) => (
            <div
              key={n}
              className="rounded-lg p-2.5"
              style={{
                background: '#EEF0FF',
                border: '1px solid rgba(51,89,244,0.12)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: BLUE, fontSize: '8px' }}
                >
                  {n}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: NAVY }}>
                  {label}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: '#78716C' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Arrow icon ────────────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const faqs = [
    {
      q: 'Is Pinnote free to use?',
      a: 'Yes — Pinnote is free to get started. Create an account and begin annotating PDFs immediately with no credit card required.',
    },
    {
      q: 'What types of files can I upload?',
      a: 'Pinnote supports PDF files. Upload any PDF — research papers, textbooks, contracts, or any document — and annotate with pins.',
    },
    {
      q: 'How do annotations work exactly?',
      a: 'Click anywhere on a PDF page to drop a numbered pin. A side panel opens where you write your note for that exact location. All annotations are automatically saved.',
    },
    {
      q: 'Can I organize my documents into folders?',
      a: 'Absolutely. Create nested folder structures to keep your documents organized exactly how you think. Drag and drop to move things around.',
    },
    {
      q: 'Can I access my notes from anywhere?',
      a: 'Yes. Pinnote is a web app — your annotated documents and notes are accessible from any modern browser on any device.',
    },
  ]

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        color: TEXT,
        background: BG,
      }}
    >
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled ? 'rgba(22,22,22,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
          transition: 'background 0.35s ease, border-color 0.35s ease',
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: '1100px', padding: '0 24px', height: '60px' }}
        >
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-none"
          >
            <PinnoteLogo size={30} />
            <span
              className="font-semibold text-[18px]"
              style={{ color: TEXT, letterSpacing: '-0.02em' }}
            >
              Pinnote
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {(['Features', 'FAQ'] as const).map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-[14px] focus-visible:outline-none"
                style={{ color: TEXT_MUTED, transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTED)}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden md:block text-[14px] px-3 py-2 focus-visible:outline-none"
              style={{ color: TEXT_MUTED, transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTED)}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center text-[13px] font-semibold text-white rounded-full focus-visible:outline-none"
              style={{
                background: BLUE,
                padding: '8px 18px',
                boxShadow: '0 2px 10px rgba(51,89,244,0.3)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2244DC'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(51,89,244,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = BLUE
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(51,89,244,0.3)'
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div
          className="relative mx-auto text-center"
          style={{ maxWidth: '800px', padding: '0 24px' }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full text-[13px] font-medium mb-8"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
              border: `1px solid ${BORDER}`,
              padding: '6px 14px',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
            PDF annotation, reimagined
          </div>

          {/* Headline */}
          <h1
            className="font-bold mb-6"
            style={{
              fontSize: 'clamp(46px, 7.5vw, 76px)',
              letterSpacing: '-0.04em',
              lineHeight: '1.05',
              color: TEXT,
            }}
          >
            Your PDFs,
            <br />
            finally understood
          </h1>

          {/* Subtitle */}
          <p
            className="mb-10 mx-auto"
            style={{
              fontSize: '18px',
              lineHeight: '1.75',
              maxWidth: '520px',
              color: TEXT_MUTED,
            }}
          >
            Drop pins anywhere on a PDF, write notes at that exact location, and
            keep every document organized — all in one clean workspace.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 font-semibold text-white rounded-full focus-visible:outline-none"
              style={{
                background: BLUE,
                fontSize: '15px',
                padding: '14px 28px',
                boxShadow: '0 4px 20px rgba(51,89,244,0.35)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2244DC'
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(51,89,244,0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = BLUE
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(51,89,244,0.35)'
              }}
            >
              Start for free
              <Arrow />
            </Link>
            <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
              No credit card required
            </span>
          </div>
        </div>

        {/* Mockup */}
        <MacbookScroll showGradient={false}>
          <AppMockup />
        </MacbookScroll>
      </section>

      {/* ── Features intro ─────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="mx-auto" style={{ maxWidth: '1040px' }}>
          <Reveal>
            <p
              className="text-center text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              How it works
            </p>
            <h2
              className="text-center font-bold mb-4"
              style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                letterSpacing: '-0.03em',
                color: TEXT,
              }}
            >
              Built for deep reading
            </h2>
            <p
              className="text-center mx-auto mb-16"
              style={{
                fontSize: '17px',
                lineHeight: '1.75',
                maxWidth: '480px',
                color: TEXT_MUTED,
              }}
            >
              Pinnote gives you the tools to engage with documents the way your
              brain actually works.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                    <text x="14" y="19" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="13" fontWeight="700">
                      1
                    </text>
                  </svg>
                ),
                title: 'Drop a pin',
                desc: 'Click any point on a PDF page to place a numbered annotation pin, anchored to that exact location forever.',
                delay: 0,
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="5" width="20" height="18" rx="2.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                    <line x1="8" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="8" y1="14" x2="17" y2="14" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="8" y1="18" x2="14" y2="18" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Write your note',
                desc: 'A side panel opens for each pin. Write as much or as little as you want — the note stays linked to its location.',
                delay: 100,
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M5 8h18v14H5V8z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M5 8l4-4h6l3 4" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Stay organized',
                desc: 'Group documents into nested folders. Everything you annotate lives in one searchable, structured workspace.',
                delay: 200,
              },
            ].map(({ icon, title, desc, delay }) => (
              <Reveal key={title} delay={delay}>
                <div
                  className="rounded-2xl p-7 h-full"
                  style={{
                    background: ELEVATED,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div className="mb-5">{icon}</div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontSize: '16px', color: TEXT }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[14px]"
                    style={{ color: TEXT_MUTED, lineHeight: '1.7' }}
                  >
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Callout band ───────────────────────────────────────────────────── */}
      <section>
        <div
          className="mx-auto py-24 px-6 text-center"
          style={{ maxWidth: '760px' }}
        >
          <Reveal>
            <h2
              className="font-bold mb-5"
              style={{
                fontSize: 'clamp(34px, 5vw, 58px)',
                letterSpacing: '-0.035em',
                lineHeight: '1.1',
                color: TEXT,
              }}
            >
              Read smarter.
              <br />
              <span style={{ color: TEXT }}>Remember more.</span>
            </h2>
            <p
              style={{
                color: TEXT_MUTED,
                fontSize: '17px',
                lineHeight: '1.75',
                maxWidth: '440px',
                margin: '0 auto',
              }}
            >
              Passive highlighting doesn&apos;t work. Active annotation — with a
              note tied to every mark — builds real understanding.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Feature detail rows ────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="mx-auto space-y-32" style={{ maxWidth: '1040px' }}>
          {/* Row 1: Annotation */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Annotation
              </p>
              <h2
                className="font-bold mb-4"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  letterSpacing: '-0.03em',
                  color: TEXT,
                  lineHeight: '1.15',
                }}
              >
                Pin your thoughts to the page
              </h2>
              <p
                className="mb-7"
                style={{ fontSize: '16px', lineHeight: '1.8', color: TEXT_MUTED }}
              >
                Stop writing notes on a separate sheet that you&apos;ll never
                connect back to the text. Drop a numbered pin exactly where your
                thought belongs.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 font-semibold text-[14px] focus-visible:outline-none"
                style={{ color: TEXT, transition: 'gap 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.gap = '10px')}
                onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
              >
                Try it free <Arrow />
              </Link>
            </Reveal>

            <Reveal delay={140}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: ELEVATED,
                  border: `1px solid ${BORDER}`,
                  boxShadow: `0 16px 48px rgba(0,0,0,0.25)`,
                }}
              >
                {/* Mini PDF page */}
                <div
                  className="bg-white rounded-xl p-5 relative mb-4"
                  style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="space-y-2 mb-2">
                    {[88, 72, 80, 65, 78, 60, 84].map((w, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full bg-gray-200"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  <div
                    className="absolute flex items-center justify-center text-white text-[11px] font-bold rounded-full w-6 h-6"
                    style={{
                      background: BLUE,
                      top: '30%',
                      right: '15%',
                      boxShadow: `0 2px 6px rgba(0,0,0,0.4)`,
                    }}
                  >
                    1
                  </div>
                </div>
                {/* Annotation card */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: BLUE, fontSize: '10px' }}
                    >
                      1
                    </div>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: TEXT }}
                    >
                      Your note here
                    </span>
                  </div>
                  <p className="text-[13px]" style={{ color: TEXT_MUTED, lineHeight: '1.6' }}>
                    Pinned to the exact paragraph. Always in context.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Row 2: Organization */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal delay={140} className="md:order-2">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Organization
              </p>
              <h2
                className="font-bold mb-4"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  letterSpacing: '-0.03em',
                  color: TEXT,
                  lineHeight: '1.15',
                }}
              >
                Every document in its place
              </h2>
              <p
                className="mb-7"
                style={{ fontSize: '16px', lineHeight: '1.8', color: TEXT_MUTED }}
              >
                Create nested folders — Research &rarr; Papers &rarr; 2024. Your
                workspace grows with you without ever becoming a mess.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 font-semibold text-[14px] focus-visible:outline-none"
                style={{ color: TEXT, transition: 'gap 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.gap = '10px')}
                onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
              >
                Start organizing <Arrow />
              </Link>
            </Reveal>

            <Reveal className="md:order-1">
              {/* Folder tree visual */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: ELEVATED,
                  border: `1px solid ${BORDER}`,
                  boxShadow: `0 16px 48px rgba(0,0,0,0.25)`,
                }}
              >
                {[
                  { depth: 0, icon: '📁', label: 'Research', highlight: true },
                  { depth: 1, icon: '📁', label: 'Papers', highlight: false },
                  { depth: 2, icon: '📄', label: 'climate-2024.pdf', highlight: false },
                  { depth: 2, icon: '📄', label: 'ml-survey.pdf', highlight: false },
                  { depth: 1, icon: '📁', label: 'Notes', highlight: false },
                  { depth: 0, icon: '📁', label: 'Essays', highlight: false },
                  { depth: 1, icon: '📄', label: 'draft-final.pdf', highlight: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5 rounded-lg"
                    style={{
                      paddingLeft: `${8 + item.depth * 18}px`,
                      paddingRight: '8px',
                      background: item.highlight
                        ? 'rgba(128,144,216,0.12)'
                        : 'transparent',
                      color: item.highlight ? TEXT : TEXT_MUTED,
                      fontWeight: item.highlight ? 600 : 400,
                      fontSize: '13px',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6">
        <div className="mx-auto" style={{ maxWidth: '680px' }}>
          <Reveal>
            <h2
              className="font-bold text-center mb-14"
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                letterSpacing: '-0.03em',
                color: TEXT,
              }}
            >
              Questions, answered
            </h2>
          </Reveal>
          <div>
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center">
        <div className="mx-auto" style={{ maxWidth: '560px' }}>
          <Reveal>
            <div className="flex justify-center mb-8">
              <PinnoteLogo size={52} />
            </div>
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: 'clamp(34px, 5vw, 54px)',
                letterSpacing: '-0.04em',
                lineHeight: '1.1',
                color: TEXT,
              }}
            >
              Start annotating today.
            </h2>
            <p
              className="mb-10"
              style={{ fontSize: '17px', lineHeight: '1.75', color: TEXT_MUTED }}
            >
              Join readers who finally understand what they read.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 font-semibold text-white rounded-full focus-visible:outline-none"
              style={{
                background: BLUE,
                fontSize: '15px',
                padding: '15px 32px',
                boxShadow: '0 4px 24px rgba(51,89,244,0.35)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2244DC'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = BLUE
              }}
            >
              Get started — it&apos;s free
              <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6"
        style={{ borderTop: `1px solid ${BORDER}` }}
      >
        <div
          className="mx-auto flex flex-col md:flex-row items-center justify-between gap-5"
          style={{ maxWidth: '1040px' }}
        >
          <div className="flex items-center gap-2">
            <PinnoteLogo size={18} />
            <span
              className="font-semibold text-[14px]"
              style={{ color: TEXT, letterSpacing: '-0.01em' }}
            >
              Pinnote
            </span>
          </div>

          <div className="flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'FAQ', href: '#faq' },
              { label: 'Sign in', href: '/sign-in' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] focus-visible:outline-none"
                style={{ color: TEXT_MUTED, transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUTED)}
              >
                {label}
              </a>
            ))}
          </div>

          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; 2026 Pinnote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
