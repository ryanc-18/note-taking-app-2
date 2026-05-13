'use client'

import { useImperativeHandle, forwardRef, useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Annotation } from '@/types'

type Props = {
  annotation: Annotation | null
  contentLoadKey: number
  onTextChange: (id: string, text: string) => void
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

const MIN_WIDTH = 220
const MAX_WIDTH = 640
const DEFAULT_WIDTH = 320

const AnnotationPanel = forwardRef<AnnotationPanelHandle, Props>(function AnnotationPanel(
  { annotation, contentLoadKey, onTextChange, onClose }, ref
) {
  const annotationRef = useRef(annotation)
  annotationRef.current = annotation

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

  // Track active formatting states — only re-render when they actually change
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

  // Load content when explicitly navigating to an annotation (not on ID swaps)
  useEffect(() => {
    if (!editor || !annotation) return
    editor.commands.setContent(annotation.text || '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentLoadKey])

  useImperativeHandle(ref, () => ({
    focusTextarea: () => editor?.commands.focus('end'),
  }))

  return (
    <div
      style={{
        width: annotation ? `${panelWidth}px` : '0px',
        minWidth: annotation ? `${panelWidth}px` : '0px',
        transition: isDraggingRef.current ? 'none' : 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        borderLeft: '1px solid var(--border-strong)',
        background: 'var(--paper-elevated)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {annotation && (
        <>
          {/* Drag handle */}
          <div
            onMouseDown={handleDragMouseDown}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              cursor: 'ew-resize',
              zIndex: 20,
            }}
          />
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-ui)' }}>
                  {annotation.number}
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                Annotation {annotation.number}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1, fontSize: '16px',
              }}
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '4px 10px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <ToolbarButton
              title="Bold (Cmd+B)"
              active={activeStates.bold}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              title="Italic (Cmd+I)"
              active={activeStates.italic}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <em>I</em>
            </ToolbarButton>
            <div style={{ width: '1px', height: '14px', background: 'var(--border-strong)', margin: '0 4px' }} />
            <ToolbarButton
              title="Bullet list"
              active={activeStates.bulletList}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              • List
            </ToolbarButton>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <EditorContent editor={editor} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} />
          </div>
        </>
      )}
    </div>
  )
})

export default AnnotationPanel
