import React from "react"
import BlackHoleSingularity from "./BlackHoleSingularity"
import { BLACK_HOLE_DATA } from "./blackHolesData"

export default function TenBlackHoles({ flyTo }) {
  return (
    <group>
      {BLACK_HOLE_DATA.map((bh) => (
        <BlackHoleSingularity
          key={bh.id}
          position={bh.pos}
          color={bh.color}
          scale={bh.scale}
          minDist={bh.minDist}
          maxDist={bh.maxDist}
          flyTo={flyTo}
        />
      ))}
    </group>
  )
}
