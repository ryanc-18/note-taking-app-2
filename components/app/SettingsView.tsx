'use client'

type Props = {
  name: string
  email: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-ui)',
        marginBottom: '12px',
      }}>
        {title}
      </h2>
      <div style={{
        background: 'var(--paper-elevated)',
        border: '1px solid var(--border-strong)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
    }}
    className="last-row"
    >
      <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
        {label}
      </span>
      {value && (
        <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          {value}
        </span>
      )}
      {children}
    </div>
  )
}

export default function SettingsView({ name, email }: Props) {
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--paper-surface)', padding: '48px 56px' }}
    >
      <h1 style={{
        fontSize: '22px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
        letterSpacing: '-0.02em',
        marginBottom: '32px',
      }}>
        Settings
      </h1>

      <div style={{ maxWidth: '520px' }}>
        <Section title="Profile">
          <Row label="Name" value={name} />
          <Row label="Email" value={email} />
        </Section>

        <Section title="Account">
          <div style={{ padding: '12px 16px' }}>
            <button
              disabled
              style={{
                padding: '7px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: '6px',
                cursor: 'not-allowed',
                opacity: 0.5,
              }}
            >
              Sign out
            </button>
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              Authentication not yet implemented.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}
