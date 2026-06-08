// Animated stick-figure that demonstrates the movement pattern. No external
// assets — pure SVG + CSS so it works offline. Each pattern has its own motion.
import { useMemo } from 'react'

const ANIM = {
  squat:     'fc-squat 2.4s ease-in-out infinite',
  hinge:     'fc-hinge 2.6s ease-in-out infinite',
  lunge:     'fc-lunge 2.4s ease-in-out infinite',
  push:      'fc-push 1.8s ease-in-out infinite',
  pull:      'fc-pull 1.8s ease-in-out infinite',
  curl:      'fc-curl 1.6s ease-in-out infinite',
  extension: 'fc-curl 1.6s ease-in-out infinite reverse',
  raise:     'fc-raise 1.8s ease-in-out infinite',
  calf:      'fc-calf 1.2s ease-in-out infinite',
  core:      'fc-core 2.2s ease-in-out infinite',
  carry:     'fc-carry 1.4s ease-in-out infinite',
  explosive: 'fc-explode 1.0s ease-in-out infinite',
}

export default function ExerciseFigure({ pattern = 'squat', size = 120 }) {
  const anim = ANIM[pattern] || ANIM.squat
  const css = useMemo(() => FIGURE_CSS, [])
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <style>{css}</style>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-label={`${pattern} animation`}>
        <g className={`fig fig-${pattern}`} style={{ animation: anim, transformOrigin: '50px 70px' }}
           fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round">
          <circle className="head" cx="50" cy="22" r="7" fill="var(--accent)" stroke="none" />
          <line className="torso" x1="50" y1="29" x2="50" y2="55" />
          <line className="armL" x1="50" y1="36" x2="36" y2="48" />
          <line className="armR" x1="50" y1="36" x2="64" y2="48" />
          <line className="legL" x1="50" y1="55" x2="40" y2="80" />
          <line className="legR" x1="50" y1="55" x2="60" y2="80" />
        </g>
      </svg>
    </div>
  )
}

const FIGURE_CSS = `
@keyframes fc-squat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px) scaleY(.82)} }
@keyframes fc-hinge   { 0%,100%{transform:rotate(0)} 50%{transform:rotate(38deg)} }
@keyframes fc-lunge   { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(10px) rotate(-6deg)} }
@keyframes fc-push    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
@keyframes fc-pull    { 0%,100%{transform:translateY(8px)} 50%{transform:translateY(-6px)} }
@keyframes fc-raise   { 0%,100%{transform:rotate(0)} 50%{transform:rotate(0)} }
@keyframes fc-curl    { 0%,100%{transform:rotate(0)} 50%{transform:rotate(0)} }
@keyframes fc-calf    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes fc-core    { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-10deg)} }
@keyframes fc-carry   { 0%,100%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
@keyframes fc-explode { 0%,60%{transform:translateY(0) scaleY(1)} 75%{transform:translateY(-12px) scaleY(1.05)} 100%{transform:translateY(0)} }
/* limb-level motion for upper-body patterns */
.fig-push .armL,.fig-push .armR{animation:fc-elbow 1.8s ease-in-out infinite;transform-origin:50px 36px}
.fig-pull .armL,.fig-pull .armR{animation:fc-elbow 1.8s ease-in-out infinite reverse;transform-origin:50px 36px}
.fig-curl .armL,.fig-curl .armR{animation:fc-elbow 1.6s ease-in-out infinite;transform-origin:50px 36px}
.fig-raise .armL{animation:fc-raiseL 1.8s ease-in-out infinite;transform-origin:50px 36px}
.fig-raise .armR{animation:fc-raiseR 1.8s ease-in-out infinite;transform-origin:50px 36px}
@keyframes fc-elbow {0%,100%{transform:rotate(0)}50%{transform:rotate(22deg)}}
@keyframes fc-raiseL{0%,100%{transform:rotate(0)}50%{transform:rotate(70deg)}}
@keyframes fc-raiseR{0%,100%{transform:rotate(0)}50%{transform:rotate(-70deg)}}
@media (prefers-reduced-motion: reduce){ .fig,.fig *{animation:none!important} }
`
