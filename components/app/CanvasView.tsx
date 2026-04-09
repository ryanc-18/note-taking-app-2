'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

const BASE_RENDER_SCALE = 2
const PAGE_GAP = 16

type PageDimension = { width: number; height: number }

export default function CanvasView({ pdfUrl }: { pdfUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const pdfRef = useRef<PDFDocumentProxy | null>(null)

  const [pageDims, setPageDims] = useState<PageDimension[]>([])
  const [zoom, setZoom] = useState<number | null>(null)
  const [minZoom, setMinZoom] = useState(0.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Step 1: load PDF and collect page dimensions ───────────────────────────
  // Does NOT render yet — just gets dims so React can mount the canvases
  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        // Worker served from public/ — avoids import.meta.url issues in Turbopack
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        if (cancelled) return

        pdfRef.current = pdf

        const dims: PageDimension[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const vp = page.getViewport({ scale: BASE_RENDER_SCALE })
          dims.push({ width: vp.width, height: vp.height })
        }

        if (!cancelled) setPageDims(dims)
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }

    loadPdf()
    return () => { cancelled = true }
  }, [pdfUrl])

  // ── Step 2: render pages onto canvases once they are mounted ───────────────
  // pageDims changing means canvases are now in the DOM
  useEffect(() => {
    if (pageDims.length === 0 || !pdfRef.current) return
    let cancelled = false

    async function renderPages() {
      const pdf = pdfRef.current!
      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) return
        const canvas = canvasRefs.current[i - 1]
        if (!canvas) continue

        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale: BASE_RENDER_SCALE })

        canvas.width = vp.width
        canvas.height = vp.height

        await page.render({
          canvasContext: canvas.getContext('2d')!,
          canvas,
          viewport: vp,
        }).promise
      }

      if (!cancelled) setLoading(false)
    }

    renderPages()
    return () => { cancelled = true }
  }, [pageDims])

  // ── Compute min zoom from container height and total doc height ────────────
  useEffect(() => {
    if (pageDims.length === 0) return

    function computeMin() {
      const container = containerRef.current
      if (!container) return
      const viewportH = container.clientHeight
      const totalDocH =
        pageDims.reduce((sum, d) => sum + d.height / BASE_RENDER_SCALE, 0) +
        PAGE_GAP * (pageDims.length - 1)
      const min = viewportH / totalDocH
      setMinZoom(min)
      setZoom(prev => (prev === null ? min : prev))
    }

    computeMin()
    const ro = new ResizeObserver(computeMin)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [pageDims])

  // ── Zoom via scroll wheel ──────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // ctrlKey is true for pinch gestures on trackpads — use those for zoom.
      // Regular scroll events (ctrlKey false) are left alone so the page scrolls normally.
      if (!e.ctrlKey) return
      e.preventDefault()
      const SPEED = 0.005
      setZoom(prev => {
        if (prev === null) return prev
        return Math.min(3, Math.max(minZoom, prev - e.deltaY * SPEED))
      })
    },
    [minZoom]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ── Derived values ─────────────────────────────────────────────────────────
  const effectiveZoom = zoom ?? minZoom
  const naturalPages = pageDims.map(d => ({
    width: d.width / BASE_RENDER_SCALE,
    height: d.height / BASE_RENDER_SCALE,
  }))
  const scaledPageWidth = (naturalPages[0]?.width ?? 0) * effectiveZoom
  const scaledTotalHeight =
    naturalPages.reduce((sum, p) => sum + p.height * effectiveZoom, 0) +
    PAGE_GAP * (pageDims.length - 1) * effectiveZoom
  const containerH = containerRef.current?.clientHeight ?? 0
  const fitsVertically = scaledTotalHeight <= containerH

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex-1 overflow-auto relative" style={{ background: 'var(--paper-surface)', overscrollBehavior: 'none' }}>

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-ui)' }}>
            Loading document…
          </span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] text-red-400" style={{ fontFamily: 'var(--font-ui)' }}>
            Failed to load document.
          </span>
        </div>
      )}

      {/* Zoom indicator — always visible once dims are known */}
      {pageDims.length > 0 && (
        <div
          className="fixed bottom-5 right-6 z-50 text-[11px] tabular-nums px-2.5 py-1 rounded-md"
          style={{
            background: 'rgba(0,0,0,0.06)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--border)',
          }}
        >
          {Math.round(effectiveZoom * 100)}%
        </div>
      )}

      {/* Page layout — rendered immediately once dims are known so canvases mount */}
      {pageDims.length > 0 && (
        <div
          style={{
            minHeight: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: fitsVertically ? 'center' : 'flex-start',
            padding: fitsVertically ? '0 40px' : '32px 40px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${PAGE_GAP * effectiveZoom}px`,
              width: `${scaledPageWidth}px`,
            }}
          >
            {naturalPages.map((page, i) => (
              <div
                key={i}
                style={{
                  width: `${page.width * effectiveZoom}px`,
                  height: `${page.height * effectiveZoom}px`,
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <canvas
                  ref={el => { canvasRefs.current[i] = el }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
