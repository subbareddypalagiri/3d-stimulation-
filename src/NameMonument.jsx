import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const FONT_5x7 = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"]
}

function WordVoxels({ word, cellSize = 0.15, colorA, colorB, yOffset = 0 }) {
  const voxelGeo = useMemo(
    () => new THREE.BoxGeometry(cellSize * 0.88, cellSize * 0.88, cellSize * 0.6),
    [cellSize]
  )

  const voxels = useMemo(() => {
    const list = []
    const cols = 5
    const rows = 7
    const colGap = 6
    const totalCols = word.length * colGap - 1
    const startX = (-(totalCols - 1) * cellSize) / 2

    ;[...word].forEach((ch, li) => {
      const glyph = FONT_5x7[ch.toUpperCase()] || FONT_5x7[" "]
      const t = li / Math.max(1, word.length - 1)
      const color = new THREE.Color(colorA).lerp(new THREE.Color(colorB), t)
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.22,
        metalness: 0.35
      })

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (glyph[r][c] === "1") {
            list.push({
              key: `${li}-${r}-${c}`,
              pos: [
                startX + (li * colGap + c) * cellSize,
                (rows / 2 - r) * cellSize + yOffset,
                0
              ],
              mat
            })
          }
        }
      }
    })
    return list
  }, [word, cellSize, colorA, colorB, yOffset])

  return (
    <group>
      {voxels.map((v) => (
        <mesh
          key={v.key}
          geometry={voxelGeo}
          material={v.mat}
          position={v.pos}
          raycast={() => null}
        />
      ))}
    </group>
  )
}

import { useKineticTrackball } from "./useKineticTrackball"

export default function NameMonument({ position = [0, 22, 0], visible = false, onFocus }) {
  const floatGroupRef = useRef()
  const rotGroupRef = useRef()

  const { bindGrab } = useKineticTrackball({
    targetRef: rotGroupRef,
    enabled: visible,
    idleDriftY: 0.001,
    idleDriftX: 0,
    sensitivityX: 0.006,
    sensitivityY: 0.005,
    damping: 0.92,
    clampPitch: false,
    onClick: () => {
      if (onFocus) onFocus()
    }
  })

  useFrame(({ clock }) => {
    if (!floatGroupRef.current || !visible) return
    const t = clock.elapsedTime
    floatGroupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.3
  })

  if (!visible) return null

  return (
    <group ref={floatGroupRef} position={position}>
      {/* 360° Rotatable Monument Container */}
      <group ref={rotGroupRef}>
        {/* Subtle localized lights */}
        <pointLight color="#8b5cf6" intensity={0.5} distance={12} position={[4, 3, 5]} />
        <pointLight color="#5eead4" intensity={0.4} distance={12} position={[-4, -2, 4]} />
        <pointLight color="#f5c542" intensity={0.3} distance={10} position={[0, -3, -2]} />

        {/* LINE 1: SUBBAREDDY (Ultra-sleek ~8.8 AU wide) */}
        <WordVoxels
          word="SUBBAREDDY"
          cellSize={0.15}
          colorA={0x5eead4}
          colorB={0x8b5cf6}
          yOffset={0.8}
        />

        {/* LINE 2: PALAGIRI */}
        <WordVoxels
          word="PALAGIRI"
          cellSize={0.15}
          colorA={0xf5c542}
          colorB={0xff5470}
          yOffset={-0.8}
        />
      </group>

      {/* Invisible clickable/grabbable hitbox for 360° spin & focus click */}
      <mesh position={[0, 0, 0]} {...bindGrab}>
        <boxGeometry args={[12, 5, 4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
