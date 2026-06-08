// Reusable circular progress ring with the brand gradient.
export default function ProgressRing({ value = 0, size = 64, stroke = 7, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="pr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7ff5e" /><stop offset="0.6" stopColor="#19e3b1" /><stop offset="1" stopColor="#36c6ff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#pr)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .6s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  )
}
