import React from "react"
import BlackHoleSingularity from "./BlackHoleSingularity"

export default function FourSingularities({ flyTo }) {
  return (
    <group>
      {/* 1. GARGANTUA: Burning Golden Amber Singularity (Near Sol / Earth) */}
      <BlackHoleSingularity
        position={[320, 45, 180]}
        color="#ffaa22"
        scale={1.2}
        flyTo={flyTo}
      />

      {/* 2. CYGNUS X-1: Electric Cyan Singularity (Alpha Centauri Sector) */}
      <BlackHoleSingularity
        position={[920, 110, -520]}
        color="#00d8ff"
        scale={1.4}
        flyTo={flyTo}
      />

      {/* 3. SAGITTARIUS A*: Deep Cosmic Violet Singularity (Sirius Sector) */}
      <BlackHoleSingularity
        position={[1950, 260, -1280]}
        color="#c066ff"
        scale={1.6}
        flyTo={flyTo}
      />

      {/* 4. QUASAR HORIZON: Brilliant Emerald Singularity (Vega / Deep Space Sector) */}
      <BlackHoleSingularity
        position={[-4200, 380, -3100]}
        color="#00ffaa"
        scale={1.8}
        flyTo={flyTo}
      />
    </group>
  )
}
