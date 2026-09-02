import React from "react"
import BlackHoleSingularity from "./BlackHoleSingularity"

export const BLACK_HOLE_DATA = [
  // LEVEL 1: SOLAR SYSTEM (1 Black Hole)
  { id: 1, name: "Gargantua", level: "L1: Solar System", pos: [320, 45, 180], color: "#ffaa11", scale: 1.2 },

  // LEVEL 2: THE MILKY WAY GALAXY (2 Black Holes)
  { id: 2, name: "Sagittarius A*", level: "L2: Galactic Core", pos: [0, 1500, 0], color: "#aa33ff", scale: 450 },
  { id: 3, name: "Cygnus X-1", level: "L2: Spiral Arm", pos: [32000, 1200, -25000], color: "#00e5ff", scale: 380 },

  // LEVEL 3: VIRGO SUPERCLUSTER (2 Black Holes)
  { id: 4, name: "Messier 87", level: "L3: Galaxy Cluster", pos: [-340000, 95000, 260000], color: "#ffffff", scale: 2600 },
  { id: 5, name: "Centaurus A", level: "L3: Galaxy Cluster", pos: [390000, -85000, -320000], color: "#ff1a44", scale: 2800 },

  // LEVEL 4: THE GREAT COSMIC WEB (2 Black Holes)
  { id: 6, name: "TON 618", level: "L4: Cosmic Filament", pos: [1850000, 550000, -1650000], color: "#00ff88", scale: 14000 },
  { id: 7, name: "Void Reaper", level: "L4: Dark Void", pos: [-2100000, -750000, 1850000], color: "#ff00aa", scale: 15000 },

  // LEVEL 5: THE NASA MULTIVERSE (2 Black Holes)
  { id: 8, name: "Multiverse Nexus", level: "L5: Bubble Horizon", pos: [9500000, 3100000, -8500000], color: "#33bbff", scale: 85000 },
  { id: 9, name: "Inflation Rift", level: "L5: Bubble Boundary", pos: [-11500000, -4200000, 10500000], color: "#ff6600", scale: 95000 },

  // LEVEL 6: THE OMNIVERSE BULK (1 Black Hole)
  { id: 10, name: "Omni Titan", level: "L6: Omniverse Horizon", pos: [0, 52000000, -88000000], color: "#ffd700", scale: 550000 }
]

export default function TenBlackHoles({ flyTo }) {
  return (
    <group>
      {BLACK_HOLE_DATA.map((bh) => (
        <BlackHoleSingularity
          key={bh.id}
          position={bh.pos}
          color={bh.color}
          scale={bh.scale}
          flyTo={flyTo}
        />
      ))}
    </group>
  )
}
