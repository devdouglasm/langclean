import type { ScanNode } from './data'

type ArcSegment = {
  id: string
  name: string
  path: string
  color: string
  opacity: number
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

function arcPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
) {
  const large = end - start > Math.PI ? 1 : 0
  const oStart = polar(cx, cy, outer, start)
  const oEnd = polar(cx, cy, outer, end)
  const iStart = polar(cx, cy, inner, end)
  const iEnd = polar(cx, cy, inner, start)

  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${iEnd.x} ${iEnd.y}`,
    'Z',
  ].join(' ')
}

function buildAlignedRings(
  parents: ScanNode[],
  total: number,
  cx: number,
  cy: number,
  size: number,
) {
  const start = -Math.PI / 2
  let angle = start
  const outerGap = 0.012
  const innerGap = 0.01
  const outer: ArcSegment[] = []
  const inner: ArcSegment[] = []

  for (const parent of parents) {
    const parentSweep = (parent.sizeBytes / total) * Math.PI * 2
    const a0 = angle + outerGap / 2
    const a1 = angle + parentSweep - outerGap / 2

    if (a1 > a0) {
      outer.push({
        id: parent.id,
        name: parent.name,
        path: arcPath(cx, cy, size * 0.34, size * 0.48, a0, a1),
        color: parent.color ?? '#60a5fa',
        opacity: 0.9,
      })
    }

    const kids = parent.children ?? []
    const kidsTotal = kids.reduce((sum, kid) => sum + kid.sizeBytes, 0) || 1
    let local = angle

    for (const kid of kids) {
      const sweep = (kid.sizeBytes / kidsTotal) * parentSweep
      const k0 = local + innerGap / 2
      const k1 = local + sweep - innerGap / 2
      if (k1 > k0) {
        inner.push({
          id: kid.id,
          name: kid.name,
          path: arcPath(cx, cy, size * 0.22, size * 0.33, k0, k1),
          color: kid.color ?? parent.color ?? '#93c5fd',
          opacity: 0.72,
        })
      }
      local += sweep
    }

    angle += parentSweep
  }

  return { outer, inner }
}

type SunburstProps = {
  tree: ScanNode
  size?: number
}

export function Sunburst({ tree, size = 220 }: SunburstProps) {
  const cx = size / 2
  const cy = size / 2
  const parents = tree.children ?? []
  const total = parents.reduce((sum, node) => sum + node.sizeBytes, 0) || 1
  const { outer, inner } = buildAlignedRings(parents, total, cx, cy, size)

  return (
    <svg
      className="sunburst"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Mapa de arquivos desnecessários"
    >
      <defs>
        <filter id="sunburst-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[...inner, ...outer].map((segment) => (
        <path
          key={segment.id}
          d={segment.path}
          fill={segment.color}
          fillOpacity={segment.opacity}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1"
          filter="url(#sunburst-glow)"
        >
          <title>{segment.name}</title>
        </path>
      ))}

      <circle cx={cx} cy={cy} r={size * 0.175} fill="rgba(255,255,255,0.96)" />
      <path
        d={`M ${cx - 10} ${cy + 1} l 7 7 l 14 -16`}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
