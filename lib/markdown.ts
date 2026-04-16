export function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim())
      if (cells.every((c: string) => /^-+$/.test(c))) return ''
      return '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>'
    })
    .replace(/^- \[ \] (.+)$/gm, '<li class="task"><span class="checkbox"></span>$1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="task done"><span class="checkbox checked"></span>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l|b|t|c|p])(.+)$/gm, (line) => line ? line : '')
}
