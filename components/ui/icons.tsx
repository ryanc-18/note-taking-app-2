export const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" /><path d="M14 14l-3-3" />
  </svg>
)

export const FolderIcon = ({ open }: { open?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 4a1 1 0 011-1h4l1.5 2H14a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" opacity={open ? 0.85 : 0.6} />
  </svg>
)

export const NoteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="1" width="10" height="13" rx="1.5" /><path d="M6 5h4M6 8h4M6 11h2" />
  </svg>
)

export const ChevronIcon = ({ down }: { down?: boolean }) => (
  <svg
    width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    style={{ transform: down ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
  >
    <path d="M3 2l4 3-4 3" />
  </svg>
)

export const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 2v8M2 6h8" />
  </svg>
)

export const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 2l6 6M8 2l-6 6" />
  </svg>
)

export const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="2" y="1" width="10" height="13" rx="1.5" />
    <path d="M5 5h6M5 8h6M5 11h3" />
    <path d="M10 1v4h4" strokeLinejoin="round" />
  </svg>
)

export const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7l6-5 6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" /><path d="M6 15V9h4v6" />
  </svg>
)

export const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
  </svg>
)
