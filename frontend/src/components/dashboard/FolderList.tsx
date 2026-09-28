import { FOLDER_ROWS, TOTAL_CATEGORIES, type FolderRow } from './data'

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
      />
    </svg>
  )
}

type FolderListProps = {
  rows?: FolderRow[]
  totalCategories?: number
}

export function FolderList({
  rows = FOLDER_ROWS,
  totalCategories = TOTAL_CATEGORIES,
}: FolderListProps) {
  return (
    <section className="folder-card" aria-label="Principais arquivos encontrados">
      <h2 className="folder-title">Principais arquivos encontrados</h2>

      <ul className="folder-list">
        {rows.map((row) => (
          <li key={row.id} className="folder-row">
            <span className="folder-icon">
              <FolderIcon />
            </span>
            <span className="folder-name">{row.name}</span>
            <span className="folder-size">{row.sizeLabel}</span>
          </li>
        ))}
      </ul>

      <button className="folder-more" type="button">
        <span>Ver tudo ({totalCategories} categorias)</span>
        <span aria-hidden="true">›</span>
      </button>
    </section>
  )
}
