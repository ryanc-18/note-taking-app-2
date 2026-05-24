'use client'

import { useImperativeHandle, forwardRef, useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Annotation } from '@/types'

type Props = {
  isOpen: boolean
  annotation: Annotation | null
  annotations: Annotation[]
  panelMode: 'single' | 'all'
  onPanelModeChange: (mode: 'single' | 'all') => void
  contentLoadKey: number
  onTextChange: (id: string, text: string) => void
  onSelectAnnotation: (annotation: Annotation) => void
  onHoverAnnotation: (id: string | null) => void
  hoveredAnnotationId: string | null
  onClose: () => void
}

export type AnnotationPanelHandle = {
  focusTextarea: () => void
}

function ToolbarButton({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        background: active ? 'var(--sidebar-active)' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '3px 6px',
        fontSize: '12px',
        fontWeight: 600,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-ui)',
        lineHeight: 1.4,
      }}
    >
      {children}
    </button>
  )
}

// Single marker icon
function SingleIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'var(--accent)' : 'none'} />
    </svg>
  )
}

// List icon
function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
      <circle cx="2.5" cy="3.5" r="1.5" fill="currentColor" />
      <line x1="5.5" y1="3.5" x2="12" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="2.5" cy="7" r="1.5" fill="currentColor" />
      <line x1="5.5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="2.5" cy="10.5" r="1.5" fill="currentColor" />
      <line x1="5.5" y1="10.5" x2="12" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const MIN_WIDTH = 220
const MAX_WIDTH = 640
const DEFAULT_WIDTH = 320

const AnnotationPanel = forwardRef<AnnotationPanelHandle, Props>(function AnnotationPanel(
  { isOpen, annotation, annotations, panelMode, onPanelModeChange, contentLoadKey, onTextChange, onSelectAnnotation, onHoverAnnotation, hoveredAnnotationId, onClose }, ref
) {
  const annotationRef = useRef(annotation)
  annotationRef.current = annotation

  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    if (hoveredAnnotationId && cardRefs.current[hoveredAnnotationId]) {
      cardRefs.current[hoveredAnnotationId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [hoveredAnnotationId])

  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const isDraggingRef = useRef(false)

  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = panelWidth
    isDraggingRef.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    function onMouseMove(e: MouseEvent) {
      const delta = startX - e.clientX
      setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta)))
    }

    function onMouseUp() {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const activeRef = useRef({ bold: false, italic: false, bulletList: false })
  const [activeStates, setActiveStates] = useState({ bold: false, italic: false, bulletList: false })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: annotation?.text ?? '',
    editorProps: {
      attributes: {
        style: [
          'flex: 1',
          'outline: none',
          'padding: 16px',
          'font-size: 13.5px',
          'line-height: 1.7',
          'color: var(--text-primary)',
          'font-family: var(--font-ui)',
          'overflow-y: auto',
          'min-height: 100%',
        ].join(';'),
      },
    },
    onTransaction: ({ editor }) => {
      const next = {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        bulletList: editor.isActive('bulletList'),
      }
      const prev = activeRef.current
      if (next.bold !== prev.bold || next.italic !== prev.italic || next.bulletList !== prev.bulletList) {
        activeRef.current = next
        setActiveStates(next)
      }
    },
    onUpdate: ({ editor }) => {
      const ann = annotationRef.current
      if (ann) onTextChange(ann.id, editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || !annotation) return
    editor.commands.setContent(annotation.text || '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentLoadKey])

  useImperativeHandle(ref, () => ({
    focusTextarea: () => editor?.commands.focus('end'),
  }))

  // Group annotations by page for list view
  const annotationsByPage = annotations.reduce<Record<number, Annotation[]>>((acc, a) => {
    if (!acc[a.page]) acc[a.page] = []
    acc[a.page].push(a)
    return acc
  }, {})
  const pageNumbers = Object.keys(annotationsByPage).map(Number).sort((a, b) => a - b)

  return (
    <div
      style={{
        width: isOpen ? `${panelWidth}px` : '0px',
        minWidth: isOpen ? `${panelWidth}px` : '0px',
        transition: isDraggingRef.current ? 'none' : 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        borderLeft: '1px solid var(--border-strong)',
        background: 'var(--paper-elevated)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {isOpen && (
        <>
          {/* Drag handle */}
          <div
            onMouseDown={handleDragMouseDown}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize', zIndex: 20 }}
          />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {panelMode === 'single' && annotation ? (
                <>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-ui)' }}>{annotation.number}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                    Annotation {annotation.number}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                  All Notes
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* View toggle */}
              <button
                onClick={() => onPanelModeChange('single')}
                title="Single annotation view"
                style={{ background: panelMode === 'single' ? 'var(--sidebar-active)' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}
              >
                <SingleIcon active={panelMode === 'single'} />
              </button>
              <button
                onClick={() => onPanelModeChange('all')}
                title="All notes view"
                style={{ background: panelMode === 'all' ? 'var(--sidebar-active)' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}
              >
                <ListIcon active={panelMode === 'all'} />
              </button>
              <div style={{ width: '1px', height: '14px', background: 'var(--border-strong)', margin: '0 2px' }} />
              <button
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontSize: '16px' }}
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Single mode: toolbar + editor */}
          {panelMode === 'single' && annotation && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <ToolbarButton title="Bold (Cmd+B)" active={activeStates.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>B</ToolbarButton>
                <ToolbarButton title="Italic (Cmd+I)" active={activeStates.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
                <div style={{ width: '1px', height: '14px', background: 'var(--border-strong)', margin: '0 4px' }} />
                <ToolbarButton title="Bullet list" active={activeStates.bulletList} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
              </div>
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <EditorContent editor={editor} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} />
              </div>
            </>
          )}

          {/* Single mode: no annotation selected */}
          {panelMode === 'single' && !annotation && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', textAlign: 'center' }}>
                Click a marker to view its note
              </p>
            </div>
          )}

          {/* All notes mode */}
          {panelMode === 'all' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {annotations.length === 0 ? (
                <div style={{ padding: '24px 16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>No annotations yet. Double-click on the document to add one.</p>
                </div>
              ) : (
                pageNumbers.map(pageNum => (
                  <div key={pageNum}>
                    <div style={{ padding: '8px 16px 4px', fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                      Page {pageNum + 1}
                    </div>
                    {annotationsByPage[pageNum].sort((a, b) => a.number - b.number).map(a => (
                      <button
                        key={a.id}
                        ref={el => { cardRefs.current[a.id] = el }}
                        onClick={() => onSelectAnnotation(a)}
                        style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', padding: '10px 16px', background: hoveredAnnotationId === a.id ? 'var(--sidebar-hover)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease' }}
                        onMouseEnter={() => onHoverAnnotation(a.id)}
                        onMouseLeave={() => onHoverAnnotation(null)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '8px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-ui)' }}>{a.number}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>Annotation {a.number}</span>
                        </div>
                        {a.text ? (
                          <div
                            style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', lineHeight: 1.6, paddingLeft: '26px' }}
                            dangerouslySetInnerHTML={{ __html: a.text }}
                          />
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', paddingLeft: '26px', fontStyle: 'italic' }}>No note written</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
})

export default AnnotationPanel
