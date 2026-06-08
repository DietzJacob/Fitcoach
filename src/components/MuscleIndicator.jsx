// Compact body silhouette that highlights the muscle an exercise trains.
// Replaces the decorative stick figure with something functional: one glance
// tells you what the movement hits. Asset-free SVG, front or back view.

// muscle -> { side, shapes } on a 40x80 viewBox.
const FRONT = ['Chest', 'Shoulders', 'Biceps', 'Core', 'Quadriceps', 'Full body']
const ZONES = {
  Shoulders:  [<ellipse key="a" cx="11" cy="22" rx="4" ry="3" />, <ellipse key="b" cx="29" cy="22" rx="4" ry="3" />],
  Chest:      [<rect key="a" x="13" y="24" width="14" height="7" rx="3" />],
  Biceps:     [<rect key="a" x="6" y="25" width="4" height="9" rx="2" />, <rect key="b" x="30" y="25" width="4" height="9" rx="2" />],
  Core:       [<rect key="a" x="15" y="33" width="10" height="11" rx="3" />],
  Quadriceps: [<rect key="a" x="14" y="48" width="5" height="15" rx="2.5" />, <rect key="b" x="21" y="48" width="5" height="15" rx="2.5" />],
  Back:       [<rect key="a" x="14" y="24" width="12" height="14" rx="3" />],
  Triceps:    [<rect key="a" x="6" y="25" width="4" height="9" rx="2" />, <rect key="b" x="30" y="25" width="4" height="9" rx="2" />],
  Glutes:     [<rect key="a" x="14" y="44" width="12" height="7" rx="3" />],
  Hamstrings: [<rect key="a" x="14" y="51" width="5" height="13" rx="2.5" />, <rect key="b" x="21" y="51" width="5" height="13" rx="2.5" />],
  Calves:     [<rect key="a" x="14" y="64" width="5" height="11" rx="2.5" />, <rect key="b" x="21" y="64" width="5" height="11" rx="2.5" />],
}

export default function MuscleIndicator({ muscle = 'Full body', size = 46 }) {
  const front = FRONT.includes(muscle)
  const zones = muscle === 'Full body'
    ? [...(ZONES.Chest), ...(ZONES.Quadriceps), ...(ZONES.Shoulders)]
    : ZONES[muscle] || []
  return (
    <svg viewBox="0 0 40 80" width={size} height={size * 80 / 40} aria-label={muscle}>
      <defs>
        <linearGradient id="mi" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7ff5e" /><stop offset="0.6" stopColor="#19e3b1" /><stop offset="1" stopColor="#36c6ff" />
        </linearGradient>
      </defs>
      {/* silhouette */}
      <g fill="rgba(255,255,255,.10)">
        <circle cx="20" cy="9" r="6" />
        <rect x="12" y="18" width="16" height="30" rx="7" />
        <rect x="5" y="20" width="6" height="18" rx="3" />
        <rect x="29" y="20" width="6" height="18" rx="3" />
        <rect x="13" y="46" width="6.5" height="30" rx="3.2" />
        <rect x="20.5" y="46" width="6.5" height="30" rx="3.2" />
      </g>
      {/* highlight */}
      <g fill="url(#mi)" style={{ filter: 'drop-shadow(0 0 3px rgba(25,227,177,.6))' }}>{zones}</g>
    </svg>
  )
}
