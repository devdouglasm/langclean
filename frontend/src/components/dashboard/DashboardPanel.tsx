import { SCAN_TREE, TOTAL_RECLAIMABLE_GB } from './data'
import { FolderList } from './FolderList'
import { Sunburst } from './Sunburst'
import './DashboardPanel.css'

export function DashboardPanel() {
  return (
    <main className="dashboard-panel" aria-label="Resultados do escaneamento">
      <section className="scan-card">
        <p className="scan-label">Escaneamento concluído</p>
        <p className="scan-total">
          <span className="scan-total-value">{TOTAL_RECLAIMABLE_GB.toFixed(2)} GB</span>
          <span className="scan-total-caption">de arquivos desnecessários encontrados</span>
        </p>

        <div className="scan-sunburst-wrap">
          <Sunburst tree={SCAN_TREE} />
        </div>

        <button className="scan-cta" type="button">
          Revisar e limpar
        </button>
      </section>

      <FolderList />
    </main>
  )
}
