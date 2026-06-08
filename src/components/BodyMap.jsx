// Front + back body map that lights up the muscles a session targets.
// `active` is a map { muscleName: intensity } or an array of muscle names.
// Pure SVG, no assets — recognisable, clean, glowing.

const FRONT = {
  Shoulders: [<ellipse key="sl" cx="30" cy="48" rx="9" ry="7" />, <ellipse key="sr" cx="70" cy="48" rx="9" ry="7" />],
  Chest:     [<path key="c" d="M38 52 h24 a6 6 0 0 1 6 6 v10 a8 8 0 0 1-8 8 H40 a8 8 0 0 1-8-8 V58 a6 6 0 0 1 6-6 Z" />],
  Biceps:    [<rect key="bl" x="20" y="56" width="9" height="20" rx="4" />, <rect key="br" x="71" y="56" width="9" height="20" rx="4" />],
  Core:      [<rect key="co" x="40" y="80" width="20" height="26" rx="6" />],
  Quadriceps:[<rect key="ql" x="36" y="112" width="12" height="34" rx="6" />, <rect key="qr" x="52" y="112" width="12" height="34" rx="6" />],
  Calves:    [<rect key="cl" x="37" y="158" width="10" height="26" rx="5" />, <rect key="cr" x="53" y="158" width="10" height="26" rx="5" />],
}
const BACK = {
  Shoulders: [<ellipse key="sl" cx="30" cy="48" rx="9" ry="7" />, <ellipse key="sr" cx="70" cy="48" rx="9" ry="7" />],
  Back:      [<path key="b" d="M37 53 h26 v22 a8 8 0 0 1-8 8 H45 a8 8 0 0 1-8-8 Z" />],
  Triceps:   [<rect key="tl" x="20" y="56" width="9" height="20" rx="4" />, <rect key="tr" x="71" y="56" width="9" height="20" rx="4" />],
  Glutes:    [<path key="g" d="M39 104 h22 a7 7 0 0 1 7 7 a9 9 0 0 1-9 9 H41 a9 9 0 0 1-9-9 a7 7 0 0 1 7-7 Z" />],
  Hamstrings:[<rect key="hl" x="36" y="120" width="12" height="28" rx="6" />, <rect key="hr" x="52" y="120" width="12" height="28" rx="6" />],
  Calves:    [<rect key="cl" x="37" y="158" width="10" height="26" rx="5" />, <rect key="cr" x="53" y="158" width="10" height="26" rx="5" />],
}

const Silhouette = () => (
  <g fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.08)" strokeWidth="1">
    <circle cx="50" cy="28" r="11" />
    <rect x="33" y="44" width="34" height="66" rx="14" />
    <rect x="19" y="46" width="11" height="40" rx="5" />
    <rect x="70" y="46" width="11" height="40" rx="5" />
    <rect x="34" y="106" width="14" height="80" rx="7" />
    <rect x="52" y="106" width="14" height="80" rx="7" />
  </g>
)

function Figure({ regions, active, label }) {
  const max = Math.max(1, ...Object.values(active))
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 100 195" width="100%" height="210" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7ff5e" /><stop offset="0.6" stopColor="#19e3b1" /><stop offset="1" stopColor="#36c6ff" />
          </linearGradient>
          <filter id="bmglow"><feGaussianBlur stdDeviation="1.6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <Silhouette />
        {Object.entries(regions).map(([m, shapes]) => {
          const on = active[m] != null
          const op = on ? 0.45 + 0.55 * (active[m] / max) : 0
          return (
            <g key={m} fill="url(#bm)" opacity={op} filter={on ? 'url(#bmglow)' : undefined}
               style={{ transition: 'opacity .4s' }}>
              {shapes}
            </g>
          )
        })}
      </svg>
      <div className="faint" style={{ fontSize: '.72rem', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function BodyMap({ active = {} }) {
  // Normalise to { muscle: intensity }
  const map = Array.isArray(active)
    ? active.reduce((a, m) => ((a[m] = (a[m] || 0) + 1), a), {})
    : active
  // "Full body" lights up everything subtly.
  if (map['Full body']) {
    ['Chest','Back','Shoulders','Biceps','Triceps','Core','Quadriceps','Hamstrings','Glutes','Calves']
      .forEach((m) => { if (map[m] == null) map[m] = map['Full body'] })
  }
  return (
    <div className="row" style={{ gap: 0, alignItems: 'flex-start' }}>
      <div className="grow"><Figure regions={FRONT} active={map} label="Forside" /></div>
      <div className="grow"><Figure regions={BACK} active={map} label="Bagside" /></div>
    </div>
  )
}
