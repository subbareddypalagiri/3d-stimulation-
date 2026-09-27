import React, { useMemo, useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ---------------------------------------------------------------------
   5x7 PIXEL FONT — for pixel labels and 3D voxel text
   --------------------------------------------------------------------- */
const FONT_5x7 = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "00110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"]
}

function makeLabelTexture(text, glowHex) {
  const cell = 18, cols = 5, rows = 7, gap = 6
  const canvas = document.createElement("canvas")
  const pad = 30
  canvas.width = (text.length * gap - 1) * cell + pad * 2
  canvas.height = rows * cell + pad * 2
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "#050506"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.shadowColor = glowHex
  ctx.shadowBlur = 12
  ctx.fillStyle = glowHex

  ;[...text].forEach((ch, li) => {
    const glyph = FONT_5x7[ch.toUpperCase()] || FONT_5x7[" "]
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (glyph[r][c] === "1") {
          ctx.fillRect(pad + (li * gap + c) * cell, pad + r * cell, cell * 0.82, cell * 0.82)
        }
      }
    }
  })
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

/* ---------------------------------------------------------------------
   PROCEDURAL PLANET NOISE TEXTURE GENERATOR
   --------------------------------------------------------------------- */
function makeNoise2D(seed) {
  let s = seed
  function rnd() {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const grid = 32, table = []
  for (let i = 0; i <= grid; i++) {
    table.push([])
    for (let j = 0; j <= grid; j++) table[i].push(rnd())
  }
  const mod = (n, m) => ((n % m) + m) % m
  return function (x, y) {
    const gx = x * grid, gy = y * grid
    const x0 = mod(Math.floor(gx), grid), y0 = mod(Math.floor(gy), grid)
    const x1 = mod(x0 + 1, grid), y1 = mod(y0 + 1, grid)
    const fx = gx - Math.floor(gx), fy = gy - Math.floor(gy)
    const lerp = (a, b, t) => a + (b - a) * t
    const top = lerp(table[x0][y0], table[x1][y0], fx)
    const bot = lerp(table[x0][y1], table[x1][y1], fx)
    return lerp(top, bot, fy)
  }
}

function makePlanetTexture(style, colorA, colorB, colorC, seed) {
  const W = 256, H = 128
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  const cA = new THREE.Color(colorA), cB = new THREE.Color(colorB), cC = new THREE.Color(colorC)
  const noise1 = makeNoise2D(seed)
  const noise2 = makeNoise2D(seed + 999)
  const noise3 = makeNoise2D(seed + 4242)

  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H
      let n
      if (style === "rocky") {
        n = noise1(u * 3, v * 3) * 0.6 + noise2(u * 8, v * 8) * 0.3 + noise3(u * 16, v * 16) * 0.1
        n = Math.pow(n, 1.15)
      } else if (style === "bands") {
        const wobble = (noise2(u * 4, v * 1.3) - 0.5) * 0.15
        const band = Math.sin((v + wobble) * Math.PI * 10) * 0.5 + 0.5
        n = band * 0.65 + noise1(u * 5, v * 5) * 0.35
      } else if (style === "swirl") {
        const wx = u + Math.sin(v * Math.PI * 4 + seed) * 0.08
        const wy = v + Math.cos(u * Math.PI * 4 + seed) * 0.08
        n = noise1(wx * 4, wy * 4) * 0.55 + noise2(wx * 9, wy * 9) * 0.45
      } else if (style === "mineral") {
        n = noise1(u * 5, v * 5) * 0.5 + Math.abs(noise2(u * 10, v * 10) - 0.5) * 0.7
      } else if (style === "ocean") {
        n = noise1(u * 4, v * 4) * 0.7 + noise2(u * 9, v * 9) * 0.3
        n = n > 0.55 ? n : n * 0.4
      } else if (style === "lava") {
        n = Math.abs(noise1(u * 6, v * 6) - 0.5) * 1.4 + noise2(u * 14, v * 14) * 0.25
      } else if (style === "toxic") {
        const wx = u + Math.sin(v * Math.PI * 6) * 0.05
        n = noise1(wx * 3, v * 3) * 0.5 + Math.pow(noise2(u * 7, v * 7), 2) * 0.6
      } else if (style === "nebula") {
        n = noise1(u * 3, v * 2) * 0.5 + noise2(u * 6, v * 4) * 0.35 + noise3(u * 12, v * 9) * 0.15
        n = 0.3 + n * 0.5
      } else if (style === "crystal") {
        n = Math.pow(Math.abs(noise1(u * 7, v * 7) - 0.5) * 2, 0.6) * 0.8 + noise2(u * 3, v * 3) * 0.2
      } else if (style === "storm") {
        const band = Math.sin(v * Math.PI * 8 + noise2(u * 3, v * 3) * 2) * 0.5 + 0.5
        const spotDx = u - 0.3, spotDy = v - 0.5
        const spot = Math.max(0, 1 - Math.hypot(spotDx * 3, spotDy * 6))
        n = band * 0.6 + noise1(u * 6, v * 6) * 0.25 + spot * 0.5
      } else if (style === "desert") {
        n = (Math.sin(u * Math.PI * 20 + noise1(u * 2, v * 2) * 3) * 0.5 + 0.5) * 0.5 + noise2(u * 5, v * 5) * 0.5
      } else if (style === "glacier") {
        n = 1 - Math.abs(noise1(u * 8, v * 8) - 0.5) * 2
        n = Math.pow(n, 3) * 0.7 + noise2(u * 4, v * 4) * 0.3
      } else {
        n = noise1(u * 4, v * 4) * 0.4 + Math.pow(noise2(u * 9, v * 9), 1.6) * 0.6
      }
      n = Math.max(0, Math.min(1, n))
      const col = new THREE.Color().copy(cA).lerp(cB, n)
      if (n > 0.72) col.lerp(cC, ((n - 0.72) / 0.28) * 0.8)
      const idx = (y * W + x) * 4
      img.data[idx] = col.r * 255
      img.data[idx + 1] = col.g * 255
      img.data[idx + 2] = col.b * 255
      img.data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

/* ---------------------------------------------------------------------
   13 REAL SUBBAREDDY PROJECTS & PLANETS
   --------------------------------------------------------------------- */
export const PRIME_PROJECTS = [
  { name: "HAAPPY", url: "https://www.haappy.live/", style: "rocky", colorA: 0x3a0a06, colorB: 0xd7263d, colorC: 0xffb703, ring: false, seed: 11 },
  { name: "YAMA", url: "https://yama-ai.vercel.app/", style: "bands", colorA: 0x4a1500, colorB: 0xff6a00, colorC: 0xffe066, ring: true, seed: 47 },
  { name: "SARA", url: "https://github.com/subbareddypalagiri/SARA-01", style: "swirl", colorA: 0x330012, colorB: 0xff2d55, colorC: 0xff8c42, ring: false, seed: 83 },
  { name: "PLAN-B", url: "https://github.com/subbareddypalagiri/Syn-nex/tree/master/man%20power", style: "mineral", colorA: 0x241200, colorB: 0xffb703, colorC: 0xfff4d6, ring: true, seed: 129 },
  { name: "AI PORTFOLIO", url: "https://github.com/subbareddypalagiri", style: "ocean", colorA: 0x001a2e, colorB: 0x0a6ea8, colorC: 0x7fe8ff, ring: false, seed: 171 },
  { name: "LAVA ENGINE", url: "#", style: "lava", colorA: 0x140000, colorB: 0xb3160a, colorC: 0xffcc33, ring: false, seed: 205 },
  { name: "BIO-SYNTH", url: "#", style: "toxic", colorA: 0x0e2400, colorB: 0x4a9b1c, colorC: 0xd4ff4d, ring: true, seed: 239 },
  { name: "NEBULA LAB", url: "#", style: "nebula", colorA: 0x1a0033, colorB: 0x8b3fd6, colorC: 0xff8cf0, ring: false, seed: 271 },
  { name: "CRYSTAL API", url: "#", style: "crystal", colorA: 0x001414, colorB: 0x0fb8b8, colorC: 0xdcffff, ring: true, seed: 307 },
  { name: "STORM CORE", url: "#", style: "storm", colorA: 0x2a1300, colorB: 0xd97b1f, colorC: 0xfff0c2, ring: true, seed: 349 },
  { name: "DUNE RUNNER", url: "#", style: "desert", colorA: 0x2e1a00, colorB: 0xc78f3a, colorC: 0xffe1a8, ring: false, seed: 383 },
  { name: "GLACIER NET", url: "#", style: "glacier", colorA: 0x061622, colorB: 0x4fa9d1, colorC: 0xffffff, ring: false, seed: 419 },
  { name: "VERDANT AI", url: "#", style: "forest", colorA: 0x081a08, colorB: 0x2e8b3a, colorC: 0xb6ff9e, ring: false, seed: 457 }
]

const planetSize = 4.0
const spacingX = 13
const rowGapY = 15
const rowTopCount = 7

function buildVoxelTitle() {
  const group = new THREE.Group()
  const voxelGeo = new THREE.BoxGeometry(0.85 * 0.86, 0.85 * 0.86, 0.85 * 0.55)

  function addWord(word, startY, colorA, colorB, shinyIndices = []) {
    const cols = 5, rows = 7, colGap = 6
    const totalCols = word.length * colGap - 1
    const startX = -((totalCols - 1) * 0.85) / 2
    ;[...word].forEach((ch, li) => {
      const glyph = FONT_5x7[ch.toUpperCase()] || FONT_5x7[" "]
      const t = li / Math.max(1, word.length - 1)
      const color = new THREE.Color(colorA).lerp(new THREE.Color(colorB), t)
      const isShiny = shinyIndices.includes(li)
      const mat = isShiny
        ? new THREE.MeshStandardMaterial({
            color: 0xfff4d6,
            emissive: 0xffcf6b,
            emissiveIntensity: 0.85,
            roughness: 0.08,
            metalness: 0.9
          })
        : new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.5,
            roughness: 0.24,
            metalness: 0.35
          })

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (glyph[r][c] === "1") {
            const vox = new THREE.Mesh(voxelGeo, mat)
            vox.position.set(startX + (li * colGap + c) * 0.85, startY + (rows / 2 - r) * 0.85, 0)
            group.add(vox)
          }
        }
      }
    })
  }

  addWord("PROJECTS WITH", 38.0, 0xd7263d, 0xffb703, [7, 8, 9, 10, 11, 12])
  addWord("PASSION", 31.2, 0xff6a00, 0xffe066)
  return group
}

export default function PrimeRealmProjectsOrbit({
  position = [0, 180000000, 680000000],
  scale = 650000,
  flyTo,
  layoutMode: controlledLayoutMode,
  onSelectPlanet,
  activePlanet
}) {
  const rootRef = useRef()
  const titleRef = useRef()
  const [internalLayoutMode, setInternalLayoutMode] = useState("rows")
  const layoutMode = controlledLayoutMode || internalLayoutMode
  const planetMeshesRef = useRef([])

  // Prepare all textures, materials, and geometries
  const { planetData, voxelTitleGroup } = useMemo(() => {
    const list = PRIME_PROJECTS.map((p, i) => {
      const glowHex = "#" + new THREE.Color(p.colorC).getHexString()
      const labelTex = makeLabelTexture(p.name, glowHex)
      const planetTex = makePlanetTexture(p.style, p.colorA, p.colorB, p.colorC, p.seed)

      const isTopRow = i < rowTopCount
      const rowIndex = isTopRow ? i : i - rowTopCount
      const rowCount = isTopRow ? rowTopCount : PRIME_PROJECTS.length - rowTopCount
      const x = (rowIndex - (rowCount - 1) / 2) * spacingX
      const baseY = isTopRow ? rowGapY / 2 : -rowGapY / 2

      return {
        ...p,
        id: i,
        basePos: new THREE.Vector3(x, baseY, 0),
        baseY,
        planetTex,
        labelTex,
        spinSpeed: 0.2 + (i % 7) * 0.04,
        floatSeed: i * 1.7
      }
    })

    const titleMesh = buildVoxelTitle()
    return { planetData: list, voxelTitleGroup: titleMesh }
  }, [])

  // Precompute visual guides for spiral and shuffle modes
  const spiralPoints = useMemo(() => {
    const pts = []
    const n = 13
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * n
      const angle = t * 1.45
      const radius = 12 + t * 4.2
      pts.push(Math.cos(angle) * radius, (t - 6) * 1.2, Math.sin(angle) * radius)
    }
    return new Float32Array(pts)
  }, [])

  const shuffleLines = useMemo(() => {
    const cols = 4
    const pts = []
    for (let i = 0; i < 12; i++) {
      const r1 = Math.floor(i / cols), c1 = i % cols
      const x1 = (c1 - 1.5) * 18 + Math.sin(i * 3.2) * 3
      const y1 = (r1 - 1.5) * 16 + Math.cos(i * 2.1) * 3
      const z1 = Math.sin(i * 1.4) * 12

      const j = (i + 1) % 13
      const r2 = Math.floor(j / cols), c2 = j % cols
      const x2 = (c2 - 1.5) * 18 + Math.sin(j * 3.2) * 3
      const y2 = (r2 - 1.5) * 16 + Math.cos(j * 2.1) * 3
      const z2 = Math.sin(j * 1.4) * 12

      pts.push(x1, y1, z1, x2, y2, z2)
    }
    return new Float32Array(pts)
  }, [])

  // Calculate target positions for each layout mode
  const getTargetPos = (p, i, t) => {
    const out = new THREE.Vector3()
    if (layoutMode === "solar") {
      const isSun = i === 0
      if (isSun) return out.set(0, Math.sin(t * 0.3) * 0.8, 0)
      const orbitR = 14 + i * 5.5
      const angle = t * (0.16 - i * 0.007) + i * 0.85
      return out.set(Math.cos(angle) * orbitR, 0, Math.sin(angle) * orbitR)
    } else if (layoutMode === "shuffle") {
      const cols = 4
      const r = Math.floor(i / cols), c = i % cols
      const x = (c - 1.5) * 18 + Math.sin(i * 3.2) * 3
      const y = (r - 1.5) * 16 + Math.cos(i * 2.1) * 3
      const z = Math.sin(i * 1.4) * 12
      return out.set(x, y + Math.sin(t * 0.5 + p.floatSeed) * 0.4, z)
    } else if (layoutMode === "spiral") {
      const angle = i * 1.45 + t * 0.08
      const radius = 12 + i * 4.2
      return out.set(
        Math.cos(angle) * radius,
        (i - 6) * 1.2 + Math.sin(t * 0.5 + p.floatSeed) * 0.3,
        Math.sin(angle) * radius
      )
    } else if (layoutMode === "rings") {
      const ringNum = i % 3
      const ringR = 16 + ringNum * 14
      const ringSpeed = (ringNum % 2 === 0 ? 1 : -1) * (0.09 + ringNum * 0.02)
      const angle = i * 1.6 + t * ringSpeed
      const ringY = (ringNum - 1) * 10
      return out.set(Math.cos(angle) * ringR, ringY + Math.sin(t * 0.6 + p.floatSeed) * 0.35, Math.sin(angle) * ringR)
    } else if (layoutMode === "vn") {
      // V / N constellation layout
      const H = 34, W = 22
      let vx = 0, vy = 0
      if (i < 6) {
        // V shape
        const tV = i < 3 ? i / 2 : (i - 3) / 2
        vx = i < 3 ? -24 + tV * (W / 2) : -24 + W / 2 + tV * (W / 2)
        vy = i < 3 ? H / 2 - tV * H : -H / 2 + tV * H
      } else {
        // N shape
        const k = i - 6
        if (k < 3) { vx = 10; vy = -H / 2 + (k / 2) * H }
        else if (k === 3) { vx = 10 + W / 2; vy = 0 }
        else { vx = 10 + W; vy = -H / 2 + ((k - 4) / 2) * H }
      }
      return out.set(vx, vy - 4 + Math.sin(t * 0.5 + p.floatSeed) * 0.5, Math.sin(t * 0.4 + p.floatSeed) * 1.5)
    }
    // Default: rows
    return out.set(p.basePos.x, p.baseY + Math.sin(t * 0.6 + p.floatSeed) * 0.7, p.basePos.z)
  }

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    if (titleRef.current) {
      titleRef.current.position.y = Math.sin(t * 0.35) * 0.5
      titleRef.current.rotation.y = Math.sin(t * 0.18) * 0.15
    }

    // Smoothly animate planets to target positions
    planetMeshesRef.current.forEach((grp, idx) => {
      if (!grp) return
      const p = planetData[idx]
      const targetPos = getTargetPos(p, idx, t)
      grp.position.lerp(targetPos, Math.min(1, dt * 3.2))

      // Spin planet on axis
      const mesh = grp.getObjectByName(`planetMesh_${idx}`)
      if (mesh) {
        mesh.rotation.y += dt * p.spinSpeed
      }
    })
  })

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 3D Voxel Lettering Monument: PROJECTS WITH PASSION */}
      <group ref={titleRef}>
        <primitive object={voxelTitleGroup} />
      </group>

      {/* 13 Project Planets */}
      {planetData.map((p, idx) => {
        const glowHex = "#" + new THREE.Color(p.colorC).getHexString()
        const isActive = activePlanet && activePlanet.name === p.name

        return (
          <group
            key={p.name}
            ref={(el) => (planetMeshesRef.current[idx] = el)}
            position={p.basePos}
            onClick={(e) => {
              e.stopPropagation()
              if (onSelectPlanet) {
                onSelectPlanet(p)
              }
              if (flyTo) {
                const worldPos = new THREE.Vector3()
                e.object.getWorldPosition(worldPos)
                flyTo([worldPos.x, worldPos.y, worldPos.z], planetSize * scale * 2.8, 0.45)
              }
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = "pointer"
            }}
            onPointerOut={(e) => {
              document.body.style.cursor = "auto"
            }}
          >
            {/* Invisible expanded hit target for effortless 3D clicking */}
            <mesh>
              <sphereGeometry args={[planetSize * 2.8, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Textured Planet Sphere */}
            <mesh name={`planetMesh_${idx}`} castShadow receiveShadow scale={isActive ? [1.15, 1.15, 1.15] : [1, 1, 1]}>
              <sphereGeometry args={[planetSize, 48, 48]} />
              <meshStandardMaterial
                map={p.planetTex}
                roughness={0.82}
                metalness={0.1}
                emissive={p.colorB}
                emissiveMap={p.planetTex}
                emissiveIntensity={isActive ? 0.6 : 0.25}
              />
            </mesh>

            {/* Atmosphere Glow Aura */}
            <mesh>
              <sphereGeometry args={[planetSize * 1.08, 32, 32]} />
              <meshBasicMaterial color={p.colorC} transparent opacity={isActive ? 0.35 : 0.16} side={THREE.BackSide} depthWrite={false} />
            </mesh>

            {/* Active Selection Glow Ring */}
            {isActive && (
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <ringGeometry args={[planetSize * 1.5, planetSize * 1.7, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )}

            {/* Planetary Rings if ring is true */}
            {p.ring && (
              <mesh rotation={[Math.PI / 2.35, 0, 0]}>
                <ringGeometry args={[planetSize * 1.35, planetSize * 1.95, 64]} />
                <meshBasicMaterial color={p.colorC} transparent opacity={0.65} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )}

            {/* Point Light illuminating its own planet surface */}
            <pointLight color={p.colorC} intensity={isActive ? 24 : 12} distance={planetSize * 10} />

            {/* Glowing Pixel Label Sprite floating below */}
            <sprite position={[0, -planetSize * 1.55, 0]} scale={[14, 3.2, 1]}>
              <spriteMaterial map={p.labelTex} transparent opacity={0.95} depthWrite={false} />
            </sprite>
          </group>
        )
      })}

      {/* Central Radiance for Solar System Mode */}
      {layoutMode === "solar" && (
        <pointLight color="#ffb703" intensity={28} distance={150} />
      )}

      {/* Solar Orbit Guides when in solar mode */}
      {layoutMode === "solar" && (
        <group rotation={[Math.PI / 2, 0, 0]}>
          {[14, 19.5, 25, 30.5, 36, 41.5, 47, 52.5, 58, 63.5, 69, 74.5, 80].map((r, ri) => (
            <mesh key={ri}>
              <ringGeometry args={[r - 0.12, r + 0.12, 64]} />
              <meshBasicMaterial color="#ffb703" transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}

      {/* 3 Rings Guides when in rings mode */}
      {layoutMode === "rings" && (
        <group>
          {[0, 1, 2].map((ringNum) => {
            const ringR = 16 + ringNum * 14
            const ringY = (ringNum - 1) * 10
            const ringColor = ringNum === 0 ? "#4fd6ff" : ringNum === 1 ? "#ffb703" : "#ff6ad5"
            return (
              <mesh key={ringNum} position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[ringR - 0.15, ringR + 0.15, 64]} />
                <meshBasicMaterial color={ringColor} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Spiral Curve Guide when in spiral mode */}
      {layoutMode === "spiral" && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={spiralPoints.length / 3}
              array={spiralPoints}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffb703" transparent opacity={0.4} />
        </line>
      )}

      {/* Shuffle Constellation Guide Lines when in shuffle mode */}
      {layoutMode === "shuffle" && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={shuffleLines.length / 3}
              array={shuffleLines}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#7c88a6" transparent opacity={0.35} />
        </lineSegments>
      )}

      {/* Ambient Realm illumination */}
      <ambientLight intensity={0.4} />
    </group>
  )
}
