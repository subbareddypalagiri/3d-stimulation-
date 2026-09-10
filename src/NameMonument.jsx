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

// Builds 3D voxel word meshes with genuine extruded box geometry
function WordVoxels({ word, cellSize = 1.0, colorA, colorB, yOffset = 0 }) {
  const voxelGeo = useMemo(
    () => new THREE.BoxGeometry(cellSize * 0.86, cellSize * 0.86, cellSize * 0.55),
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
        emissiveIntensity: 0.75,
        roughness: 0.28,
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

export default function NameMonument({ position = [0, 62, -15] }) {
  const groupRef = useRef()

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    // Gentle float and yaw sway
    groupRef.current.position.y = position[1] + Math.sin(t * 0.35) * 1.2
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.25

    // Proximity LOD: Visible in stellar neighborhood & local space (dist < 25,000 AU)
    const dist = camera.position.length()
    groupRef.current.visible = dist < 25000
  })

  return (
    <group ref={groupRef} position={position}>
      {/* 3-Point Colored Key Lights to illuminate the monument */}
      <pointLight color="#8b5cf6" intensity={2.8} distance={60} position={[15, 12, 18]} />
      <pointLight color="#5eead4" intensity={2.2} distance={60} position={[-18, -8, 16]} />
      <pointLight color="#f5c542" intensity={1.6} distance={50} position={[0, -14, -8]} />

      {/* LINE 1: SUBBAREDDY (Electric Cyan -> Royal Purple) */}
      <WordVoxels
        word="SUBBAREDDY"
        cellSize={0.9}
        colorA={0x5eead4}
        colorB={0x8b5cf6}
        yOffset={4.8}
      />

      {/* LINE 2: PALAGIRI (Solar Gold -> Coral Pink) */}
      <WordVoxels
        word="PALAGIRI"
        cellSize={0.9}
        colorA={0xf5c542}
        colorB={0xff5470}
        yOffset={-4.8}
      />
    </group>
  )
}
