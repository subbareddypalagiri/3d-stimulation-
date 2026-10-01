import React from "react"

/**
 * Obsidian Stealth Aerospace UI Component Library
 * Inspired by Starlink / Linear command deck design.
 * Features precision 1.5px vector SVG icons, animated tactical radar, and smoked obsidian glass.
 */

// 1. Vector SVG Icons matching Obsidian Stealth Image
export function IconRocket({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
      <path d="M15 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
    </svg>
  )
}

export function IconRadar({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
      <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
      <circle cx="12" cy="12" r="2" fill={color} />
      <path d="M16.24 16.24a6 6 0 0 1-8.48 0" />
      <path d="M19.07 19.07a10 10 0 0 1-14.14 0" />
    </svg>
  )
}

export function IconBolt({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" />
    </svg>
  )
}

export function IconDatabase({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
    </svg>
  )
}

export function IconAnalytics({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="1.2" />
    </svg>
  )
}

export function IconGear({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function IconCelestial({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
      <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.3" />
    </svg>
  )
}

export function IconBlackHole({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill={color} />
      <path d="M12 3a9 9 0 0 1 9 9" strokeWidth="2" />
      <path d="M12 21a9 9 0 0 1-9-9" strokeWidth="2" />
    </svg>
  )
}

export function IconMonument({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 8 8h8l-4-6z" fill={color} fillOpacity="0.25" />
      <path d="M7 8v11h10V8" />
      <path d="M5 19h14v3H5v-3z" />
      <circle cx="12" cy="13" r="1.5" fill={color} />
    </svg>
  )
}

export function IconSkills({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="4" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <line x1="12" y1="6" x2="5" y2="16" />
      <line x1="12" y1="6" x2="19" y2="16" />
      <line x1="5" y1="18" x2="19" y2="18" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  )
}

export function IconProjects({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="5" fill={color} fillOpacity="0.2" />
      <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-25 12 12)" strokeWidth="1.4" />
    </svg>
  )
}

export function IconCompass({ size = 16, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" strokeWidth="1.4" />
      <polygon points="12,6 15,12 12,18 9,12" fill={color} />
    </svg>
  )
}

export function IconClose({ size = 14, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function IconExternalLink({ size = 15, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export function IconTarget({ size = 15, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  )
}

export function IconSatellite({ size = 15, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 7 9 3 5 7l4 4" />
      <path d="m17 11 4 4-4 4-4-4" />
      <path d="m8 12 4 4" />
      <path d="m16 8-4-4" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  )
}

export function IconGlobe({ size = 15, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

export function IconEye({ size = 15, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconCheck({ size = 14, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function IconTrophy({ size = 15, color = "currentColor", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v3h10v-3c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" fill={color} fillOpacity="0.15" />
    </svg>
  )
}



// 2. Animated Miniature Tactical Radar Widget (Exact match to Style 2 mockup top-left radar)
export function MiniTacticalRadar({ size = 46, pingColor = "#f5b032" }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: "block" }}>
        {/* Radar concentric range rings */}
        <circle cx="30" cy="30" r="28" fill="none" stroke={pingColor} strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="30" cy="30" r="19" fill="none" stroke={pingColor} strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="2 2" />
        <circle cx="30" cy="30" r="10" fill="none" stroke={pingColor} strokeWidth="0.8" strokeOpacity="0.3" />

        {/* Crosshair axes */}
        <line x1="30" y1="2" x2="30" y2="58" stroke={pingColor} strokeWidth="0.7" strokeOpacity="0.25" />
        <line x1="2" y1="30" x2="58" y2="30" stroke={pingColor} strokeWidth="0.7" strokeOpacity="0.25" />

        {/* Center radar emitter dot */}
        <circle cx="30" cy="30" r="2" fill={pingColor} />

        {/* Rotating sweep cone with radial gradient */}
        <defs>
          <linearGradient id="stealthRadarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={pingColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={pingColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "30px 30px", animation: "stealthRadarRotate 4s linear infinite" }}>
          <path d="M30 30 L30 2 A28 28 0 0 1 58 30 Z" fill="url(#stealthRadarSweep)" />
          <line x1="30" y1="30" x2="58" y2="30" stroke={pingColor} strokeWidth="1.2" strokeOpacity="0.8" />
        </g>

        {/* Blip Target Dot */}
        <circle cx="42" cy="18" r="1.8" fill="#10b981">
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <style>{`
        @keyframes stealthRadarRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// 3. Common Design Tokens for Obsidian Stealth UI
export const OBSIDIAN_TOKENS = {
  glassBg: "rgba(10, 12, 18, 0.90)",
  glassBorder: "1px solid rgba(245, 180, 50, 0.28)",
  glassShadow: "0 14px 35px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 18px rgba(245, 180, 50, 0.08)",
  accentGold: "#f5b032",
  accentAmber: "#f59e0b",
  accentMuted: "rgba(245, 180, 50, 0.55)",
  textDim: "#94a3b8",
  fontMono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
}
