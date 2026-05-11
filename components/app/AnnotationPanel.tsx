'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import type { Annotation } from '@/types'

type Props = {
  annotation: Annotation | null
  onTextChange: (id: string, text: string) => void
  onClose: () => void
}

export type AnnotationPanelHandle = {
  focusTextarea: () => void
}

const AnnotationPanel = forwardRef<AnnotationPanelHandle, Props>(function AnnotationPanel(
  { annotation, onTextChange, onClose }, ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    focusTextarea: () => textareaRef.current?.focus(),
  }))
  return (
    <div
      style={{
        width: annotation ? '320px' : '0px',
        minWidth: annotation ? '320px' : '0px',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        borderLeft: '1px solid var(--border-strong)',
        background: 'var(--paper-elevated)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {annotation && (
        <>
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
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                Annotation {annotation.number}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                fontSize: '16px',
              }}
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Note textarea */}
          <textarea
            ref={textareaRef}
            value={annotation.text}
            onChange={e => onTextChange(annotation.id, e.target.value)}
            placeholder="Write your note here…"
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              outline: 'none',
              padding: '16px',
              fontSize: '13.5px',
              lineHeight: '1.7',
              color: 'var(--text-primary)',
              background: 'transparent',
              fontFamily: 'var(--font-display)',
            }}
          />
        </>
      )}
    </div>
  )
})

export default AnnotationPanel
