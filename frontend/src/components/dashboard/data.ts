export type ScanNode = {
  id: string
  name: string
  sizeBytes: number
  color?: string
  children?: ScanNode[]
}

export type FolderRow = {
  id: string
  name: string
  sizeLabel: string
}

export const TOTAL_RECLAIMABLE_GB = 5.24

export const SCAN_TREE: ScanNode = {
  id: 'root',
  name: 'junk',
  sizeBytes: 5.24 * 1024 ** 3,
  children: [
    {
      id: 'browser',
      name: 'Cache de navegadores',
      sizeBytes: 2.15 * 1024 ** 3,
      color: '#38bdf8',
      children: [
        { id: 'chrome', name: 'Chrome', sizeBytes: 1.2 * 1024 ** 3, color: '#0ea5e9' },
        { id: 'safari', name: 'Safari', sizeBytes: 0.6 * 1024 ** 3, color: '#7dd3fc' },
        { id: 'other-browser', name: 'Outros', sizeBytes: 0.35 * 1024 ** 3, color: '#bae6fd' },
      ],
    },
    {
      id: 'installers',
      name: 'Instaladores antigos',
      sizeBytes: 1.34 * 1024 ** 3,
      color: '#818cf8',
      children: [
        { id: 'dmg', name: 'DMG', sizeBytes: 0.8 * 1024 ** 3, color: '#6366f1' },
        { id: 'pkg', name: 'PKG', sizeBytes: 0.54 * 1024 ** 3, color: '#a5b4fc' },
      ],
    },
    {
      id: 'downloads',
      name: 'Downloads',
      sizeBytes: 0.98 * 1024 ** 3,
      color: '#c084fc',
      children: [
        { id: 'zip', name: 'Zips', sizeBytes: 0.55 * 1024 ** 3, color: '#a855f7' },
        { id: 'media', name: 'Mídia', sizeBytes: 0.43 * 1024 ** 3, color: '#e9d5ff' },
      ],
    },
    {
      id: 'logs',
      name: 'Logs do sistema',
      sizeBytes: 0.45 * 1024 ** 3,
      color: '#f472b6',
      children: [
        { id: 'sys', name: 'Sistema', sizeBytes: 0.28 * 1024 ** 3, color: '#ec4899' },
        { id: 'app-logs', name: 'Apps', sizeBytes: 0.17 * 1024 ** 3, color: '#f9a8d4' },
      ],
    },
    {
      id: 'dev',
      name: 'Caches de desenvolvimento',
      sizeBytes: 0.32 * 1024 ** 3,
      color: '#fb7185',
      children: [
        { id: 'npm', name: 'npm', sizeBytes: 0.2 * 1024 ** 3, color: '#f43f5e' },
        { id: 'other-dev', name: 'Outros', sizeBytes: 0.12 * 1024 ** 3, color: '#fda4af' },
      ],
    },
  ],
}

export const FOLDER_ROWS: FolderRow[] = [
  { id: 'browser', name: 'Cache de navegadores', sizeLabel: '2.15 GB' },
  { id: 'installers', name: 'Instaladores antigos', sizeLabel: '1.34 GB' },
  { id: 'downloads', name: 'Downloads', sizeLabel: '980 MB' },
  { id: 'logs', name: 'Logs do sistema', sizeLabel: '450 MB' },
  { id: 'dev', name: 'Caches de desenvolvimento', sizeLabel: '320 MB' },
]

export const TOTAL_CATEGORIES = 12
