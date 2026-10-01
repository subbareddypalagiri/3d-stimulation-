import { useRef, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Structured metadata for each of the 6 Top Achievements
export const ACHIEVEMENTS_DATA = [
  {
    id: "cgpa",
    title: "9.0 CGPA",
    badge: "ACADEMICS",
    role: "Computer Science & Engineering",
    desc: "Maintained stellar 9.0 CGPA throughout academic tenure with deep mastery of core computing, distributed systems, and algorithmic theory.",
    highlight: "Top 2% Department Ranking • Excellence in Computer Science Foundations",
    metrics: [
      { label: "CGPA SCORE", val: "9.0 / 10.0" },
      { label: "DISCIPLINE", val: "Computer Science" },
      { label: "FOCUS", val: "Systems & Algorithms" },
      { label: "STANDING", val: "Distinction Honors" }
    ],
    color: "#ffb84d"
  },
  {
    id: "opensource",
    title: "479K★ Repo — PR Merged",
    badge: "OPEN SOURCE",
    role: "Core Contributor",
    desc: "Significant architectural pull request reviewed and merged into a world-renowned open-source repository boasting 479,000+ stars on GitHub.",
    highlight: "High-impact codebase contribution merged into globally deployed developer tooling",
    metrics: [
      { label: "REPO STARS", val: "479,000+ ★" },
      { label: "STATUS", val: "MERGED TO MAIN" },
      { label: "CODE REVIEW", val: "Passed Global CI" },
      { label: "IMPACT", val: "Global Developers" }
    ],
    url: "https://github.com/subbareddypalagiri",
    color: "#ff6fae"
  },
  {
    id: "leetcode",
    title: "LeetCode 100 Days",
    badge: "ALGORITHMS",
    role: "Problem Solver",
    desc: "100+ days consistent daily streak tackling complex algorithmic challenges across dynamic programming, graph theory, trees, and system design.",
    highlight: "100+ Consecutive Days Streak • Advanced Algorithmic Patterns Mastery",
    metrics: [
      { label: "STREAK", val: "100+ DAYS" },
      { label: "TOPICS", val: "DP, Graphs, Trees" },
      { label: "SPEED", val: "Optimized O(N)" },
      { label: "CONSISTENCY", val: "100% Verified" }
    ],
    color: "#8fd3ff"
  },
  {
    id: "haappy",
    title: "Haappy — Live Platform",
    badge: "PRODUCTION",
    role: "Lead Full-Stack Engineer",
    desc: "Designed, engineered, and deployed the Haappy web ecosystem into active production, handling authentic user workflows with real-time reactivity.",
    highlight: "Zero-Downtime Deployment • Full-Stack Cloud Architecture",
    metrics: [
      { label: "STATUS", val: "LIVE PRODUCTION" },
      { label: "STACK", val: "React / Node / Cloud" },
      { label: "USERS", val: "Active Community" },
      { label: "UPTIME", val: "99.9% Cloud SLA" }
    ],
    color: "#ffe08a"
  },
  {
    id: "yama",
    title: "Yama AI — LLM Assistant",
    badge: "AI / ML",
    role: "AI Systems Engineer",
    desc: "Engineered context-aware multi-modal LLM conversational intelligence platform with vector retrieval embeddings and responsive streaming latency.",
    highlight: "Contextual RAG Retrieval • Real-time Token Streaming Architecture",
    metrics: [
      { label: "DOMAIN", val: "Multi-Modal AI" },
      { label: "INFERENCE", val: "Streaming Latency" },
      { label: "TECH", val: "Vector Embeddings" },
      { label: "ACCURACY", val: "High Precision" }
    ],
    color: "#ff8a65"
  },
  {
    id: "sara",
    title: "SARA — AI Writing Tool",
    badge: "AI / NLP",
    role: "Creator & Architect",
    desc: "Autonomous AI-powered writing, composition, and editorial assistant built for high-coherence prose, technical drafting, and semantic refinement.",
    highlight: "Autonomous Style Refinement • Semantic Analysis Engine",
    metrics: [
      { label: "FOCUS", val: "Prose & Technical Copy" },
      { label: "ENGINE", val: "NLP Synthesis" },
      { label: "LATENCY", val: "<120ms Synthesis" },
      { label: "QUALITY", val: "Editorial Grade" }
    ],
    color: "#c3a6ff"
  }
]

// Procedural 3D noise helpers
function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123
  return s - Math.floor(s)
}

function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const lerp = (a, b, t) => a + (b - a) * t

  const v000 = hash3(xi, yi, zi), v100 = hash3(xi + 1, yi, zi)
  const v010 = hash3(xi, yi + 1, zi), v110 = hash3(xi + 1, yi + 1, zi)
  const v001 = hash3(xi, yi, zi + 1), v101 = hash3(xi + 1, yi, zi + 1)
  const v011 = hash3(xi, yi + 1, zi + 1), v111 = hash3(xi + 1, yi + 1, zi + 1)

  const x00 = lerp(v000, v100, xf), x10 = lerp(v010, v110, xf)
  const x01 = lerp(v001, v101, xf), x11 = lerp(v011, v111, xf)
  const y0 = lerp(x00, x10, yf), y1 = lerp(x01, x11, yf)
  return lerp(y0, y1, zf)
}

// Procedural cratered planet crust texture
function makePlanetTexture() {
  const c = document.createElement("canvas")
  c.width = 512
  c.height = 256
  const ctx = c.getContext("2d")
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, "#7a6a5c")
  g.addColorStop(1, "#3d332b")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 256)

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512, y = Math.random() * 256, r = 12 + Math.random() * 46
    ctx.fillStyle = Math.random() < 0.5 ? "rgba(95,66,48,0.35)" : "rgba(35,28,24,0.4)"
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 512, y = Math.random() * 256, r = 2 + Math.random() * 9
    ctx.fillStyle = "rgba(18,14,11,0.65)"
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "rgba(135,112,94,0.35)"
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// Procedural halo glow texture
function makeHaloTexture() {
  const c = document.createElement("canvas")
  c.width = 128
  c.height = 128
  const ctx = c.getContext("2d")
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, "rgba(255,150,60,0.6)")
  g.addColorStop(1, "rgba(255,80,20,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

// Procedural crisp high-DPI text sprite with Obsidian glow backing
function makeTextSprite(text, color) {
  const fontSize = 72
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`
  const textWidth = Math.ceil(ctx.measureText(text).width)
  const w = textWidth + 60
  const h = fontSize + 44
  canvas.width = w
  canvas.height = h

  const drawCtx = canvas.getContext("2d")
  drawCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`
  drawCtx.textBaseline = "middle"

  // Dark smoked glass pill backing with subtle gold border
  drawCtx.fillStyle = "rgba(6, 8, 14, 0.88)"
  drawCtx.beginPath()
  if (drawCtx.roundRect) {
    drawCtx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 20)
  } else {
    drawCtx.rect(4, 4, canvas.width - 8, canvas.height - 8)
  }
  drawCtx.fill()

  // Border ring
  drawCtx.strokeStyle = color
  drawCtx.lineWidth = 3
  drawCtx.stroke()

  // Text shadow glow
  drawCtx.shadowColor = color
  drawCtx.shadowBlur = 24
  drawCtx.fillStyle = color
  drawCtx.fillText(text, 30, canvas.height / 2)

  // Crisp foreground text
  drawCtx.shadowBlur = 0
  drawCtx.fillStyle = "#ffffff"
  drawCtx.fillText(text, 30, canvas.height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false
  })
  const sprite = new THREE.Sprite(mat)
  const spriteH = 26
  sprite.scale.set(spriteH * (canvas.width / canvas.height), spriteH, 1)
  sprite.renderOrder = 999
  return { sprite, texture: tex, material: mat }
}

export default function TopAchievementsRealm({
  position = [-140000, 35000, 120000],
  scale = 7.0,
  onSelectAchievement = null,
  activeAchievement = null,
  flyTo = null
}) {
  const groupRef = useRef()
  const contentRef = useRef()
  const animatedStateRef = useRef({
    spinners: [],
    planetPieces: [],
    achievementLabels: [],
    coreMesh: null,
    haloSprite: null,
    tempCamVec: new THREE.Vector3(),
    centerVec: new THREE.Vector3(...position)
  })

  // Build the complete 3D scene once
  useEffect(() => {
    if (!contentRef.current) return
    const container = contentRef.current

    // Clear previous children
    while (container.children.length > 0) {
      container.remove(container.children[0])
    }

    const state = animatedStateRef.current
    state.spinners = []
    state.planetPieces = []
    state.achievementLabels = []

    const disposables = []

    // 1. Rock materials for asteroid belt
    const rockMats = [
      new THREE.MeshStandardMaterial({ color: 0x8c8378, roughness: 0.95, metalness: 0.05, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x716a63, roughness: 0.90, metalness: 0.08, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x9c8a6e, roughness: 0.92, metalness: 0.04, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x5f5a57, roughness: 0.97, metalness: 0.03, flatShading: true })
    ]
    rockMats.forEach(m => disposables.push(m))

    // Helper to generate noisy icosahedron geometry
    function makeAsteroidGeometry(radius, roughAmt) {
      const geo = new THREE.IcosahedronGeometry(radius, 1)
      const pos = geo.attributes.position
      const seed = Math.random() * 100
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
        const len = Math.sqrt(x * x + y * y + z * z) || 1
        const nx = x / len, ny = y / len, nz = z / len
        const n = noise3(nx * 2.2 + seed, ny * 2.2 + seed, nz * 2.2 + seed)
        const n2 = noise3(nx * 5 + seed + 9, ny * 5 + seed + 9, nz * 5 + seed + 9)
        const disp = 1 + (n - 0.5) * roughAmt + (n2 - 0.5) * roughAmt * 0.4
        pos.setXYZ(i, x * disp, y * disp, z * disp)
      }
      geo.computeVertexNormals()
      disposables.push(geo)
      return geo
    }

    // 2. Build 4 Asteroid Belt rings
    function buildBelt(innerR, outerR, count, sizeBoost) {
      for (let i = 0; i < count; i++) {
        const rr = innerR + (outerR - innerR) * Math.pow(Math.random(), 1.3)
        const angle = Math.random() * Math.PI * 2
        const bandFrac = (rr - innerR) / (outerR - innerR)
        const yScatter = (Math.random() - 0.5) * 22 * (1 - bandFrac * 0.5)

        const sizeRoll = Math.random()
        const r = (sizeRoll > 0.97 ? (10 + Math.random() * 9)
                 : sizeRoll > 0.85 ? (5 + Math.random() * 5)
                 : (0.8 + Math.pow(Math.random(), 2) * 3.5)) * sizeBoost

        const detail = r > 6 ? 2 : (r > 2.5 ? 1 : 0)
        const geo = new THREE.IcosahedronGeometry(r, detail)
        disposables.push(geo)

        if (detail > 0) {
          const pos = geo.attributes.position
          const seed = Math.random() * 100
          for (let v = 0; v < pos.count; v++) {
            const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v)
            const len = Math.sqrt(x * x + y * y + z * z) || 1
            const nx = x / len, ny = y / len, nz = z / len
            const n = noise3(nx * 2.2 + seed, ny * 2.2 + seed, nz * 2.2 + seed)
            const n2 = noise3(nx * 5 + seed + 9, ny * 5 + seed + 9, nz * 5 + seed + 9)
            const disp = 1 + (n - 0.5) * 0.55 + (n2 - 0.5) * 0.22
            pos.setXYZ(v, x * disp, y * disp, z * disp)
          }
          geo.computeVertexNormals()
        }

        const mat = rockMats[Math.floor(Math.random() * rockMats.length)]
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(Math.cos(angle) * rr, yScatter, Math.sin(angle) * rr)
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        container.add(mesh)

        state.spinners.push({
          mesh,
          spin: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5),
          orbitRadius: rr,
          orbitAngle: angle,
          orbitHeight: yScatter,
          orbitSpeed: (0.006 + Math.random() * 0.01) * (Math.random() < 0.06 ? -1 : 1),
          r
        })
      }
    }

    // 4 Distinct Belt Divisions
    buildBelt(60, 100, 160, 0.7)    // Inner ring close to planet
    buildBelt(150, 300, 380, 1.0)   // Main vast belt
    buildBelt(345, 410, 220, 1.15)  // Third ring
    buildBelt(455, 540, 180, 1.3)   // Outer ring, chunky rocks

    // 3. Central Molten Broken Planet
    const planetR = 42
    const planetTex = makePlanetTexture()
    disposables.push(planetTex)

    // Molten Glowing Core
    const coreGeo = new THREE.IcosahedronGeometry(planetR * 0.8, 2)
    disposables.push(coreGeo)
    {
      const pos = coreGeo.attributes.position, seed = 3.1
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v)
        const len = Math.sqrt(x * x + y * y + z * z) || 1
        const disp = 1 + (noise3(x * 0.08 + seed, y * 0.08 + seed, z * 0.08 + seed) - 0.5) * 0.2
        pos.setXYZ(v, x * disp, y * disp, z * disp)
      }
      coreGeo.computeVertexNormals()
    }

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff5a1a,
      emissive: 0xff5a1a,
      emissiveIntensity: 1.8,
      roughness: 0.55,
      metalness: 0.0
    })
    disposables.push(coreMat)

    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    container.add(coreMesh)
    state.coreMesh = coreMesh

    // Core Point Light
    const coreLight = new THREE.PointLight(0xff7a2e, 2.8, 400, 1.8)
    container.add(coreLight)

    // Halo Glow Sprite
    const haloTex = makeHaloTexture()
    disposables.push(haloTex)
    const haloMat = new THREE.SpriteMaterial({
      map: haloTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    disposables.push(haloMat)
    const haloSprite = new THREE.Sprite(haloMat)
    haloSprite.scale.set(planetR * 4.6, planetR * 4.6, 1)
    container.add(haloSprite)
    state.haloSprite = haloSprite

    // Broken Crust Wedges pulled apart
    const wedgeMat = new THREE.MeshStandardMaterial({
      map: planetTex,
      roughness: 0.92,
      metalness: 0.04
    })
    disposables.push(wedgeMat)

    const phiSegs = 5, thetaSegs = 4
    for (let pi = 0; pi < phiSegs; pi++) {
      for (let ti = 0; ti < thetaSegs; ti++) {
        if (Math.random() < 0.15) continue // missing chunks create molten deep fissures
        const phiStart = (pi / phiSegs) * Math.PI * 2
        const phiLen = (Math.PI * 2 / phiSegs) * (0.72 + Math.random() * 0.14)
        const thetaStart = (ti / thetaSegs) * Math.PI
        const thetaLen = (Math.PI / thetaSegs) * (0.72 + Math.random() * 0.14)
        const wgeo = new THREE.SphereGeometry(planetR, 9, 7, phiStart, phiLen, thetaStart, thetaLen)
        disposables.push(wgeo)

        const wp = wgeo.attributes.position, wseed = Math.random() * 90
        for (let v = 0; v < wp.count; v++) {
          const x = wp.getX(v), y = wp.getY(v), z = wp.getZ(v)
          const len = Math.sqrt(x * x + y * y + z * z) || 1
          const nx = x / len, ny = y / len, nz = z / len
          const disp = 1 + (noise3(nx * 3 + wseed, ny * 3 + wseed, nz * 3 + wseed) - 0.5) * 0.14
          wp.setXYZ(v, x * disp, y * disp, z * disp)
        }
        wgeo.computeVertexNormals()

        const wedge = new THREE.Mesh(wgeo, wedgeMat)
        const midPhi = phiStart + phiLen / 2, midTheta = thetaStart + thetaLen / 2
        const ndir = new THREE.Vector3(
          Math.sin(midTheta) * Math.cos(midPhi),
          Math.cos(midTheta),
          Math.sin(midTheta) * Math.sin(midPhi)
        )
        const baseDist = 3 + Math.random() * 7
        wedge.position.copy(ndir).multiplyScalar(baseDist)
        wedge.rotation.set((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15)
        container.add(wedge)

        state.planetPieces.push({
          mesh: wedge,
          dir: ndir,
          baseDist,
          phase: Math.random() * Math.PI * 2
        })
      }
    }

    // 4. Detached molten fragments drifting around the planet
    const fragMat = new THREE.MeshStandardMaterial({
      color: 0x5a4d44,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true,
      emissive: 0xff6a24,
      emissiveIntensity: 0.6
    })
    disposables.push(fragMat)

    for (let i = 0; i < 6; i++) {
      const fr = 5 + Math.random() * 7
      const fgeo = new THREE.IcosahedronGeometry(fr, 1)
      disposables.push(fgeo)
      const fpos = fgeo.attributes.position, fseed = Math.random() * 50
      for (let v = 0; v < fpos.count; v++) {
        const x = fpos.getX(v), y = fpos.getY(v), z = fpos.getZ(v)
        const disp = 1 + (noise3(x * 0.3 + fseed, y * 0.3 + fseed, z * 0.3 + fseed) - 0.5) * 0.5
        fpos.setXYZ(v, x * disp, y * disp, z * disp)
      }
      fgeo.computeVertexNormals()

      const frag = new THREE.Mesh(fgeo, fragMat)
      const angle = (i / 6) * Math.PI * 2
      const dir = new THREE.Vector3(Math.cos(angle), (i % 2 === 0 ? 0.18 : -0.18), Math.sin(angle)).normalize()
      frag.position.copy(dir).multiplyScalar(planetR + 26)
      frag.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      container.add(frag)

      state.spinners.push({
        mesh: frag,
        spin: new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3),
        orbitRadius: -1
      })
    }

    // 5. 6 Achievement Sprites attached to the biggest orbital asteroids in the belt
    const achievementPicks = state.spinners
      .filter(s => s.orbitRadius >= 0)
      .sort((a, b) => b.r - a.r)
      .slice(0, ACHIEVEMENTS_DATA.length)

    achievementPicks.forEach((spinner, idx) => {
      const data = ACHIEVEMENTS_DATA[idx]
      const { sprite, texture, material } = makeTextSprite(data.title, data.color)
      disposables.push(texture, material)

      sprite.position.copy(spinner.mesh.position)
      sprite.position.y += spinner.r + 18
      container.add(sprite)

      // Make spinner mesh interactive
      spinner.mesh.userData = { achievement: data }
      sprite.userData = { achievement: data }

      state.achievementLabels.push({
        spinner,
        sprite,
        data,
        yOffset: spinner.r + 18
      })
    })

    // 6. Floating 3D Rock Letters: "TOP ACHIEVEMENTS"
    {
      const word = "TOP ACHIEVEMENTS"
      const cw = 1700, ch = 230
      const tcanvas = document.createElement("canvas")
      tcanvas.width = cw
      tcanvas.height = ch
      const tctx = tcanvas.getContext("2d")
      tctx.fillStyle = "#000"
      tctx.fillRect(0, 0, cw, ch)
      tctx.font = "900 150px Arial, sans-serif"
      tctx.textAlign = "center"
      tctx.textBaseline = "middle"
      tctx.fillStyle = "#fff"
      tctx.fillText(word, cw / 2, ch / 2 + 6)
      const img = tctx.getImageData(0, 0, cw, ch).data

      const samples = []
      const scaleX = 560 / cw, scaleY = scaleX
      for (let y = 0; y < ch; y += 6) {
        for (let x = 0; x < cw; x += 6) {
          if (img[(y * cw + x) * 4] > 128) {
            samples.push([(x - cw / 2) * scaleX, (ch / 2 - y) * scaleY + 260])
          }
        }
      }

      const rockGeo = new THREE.IcosahedronGeometry(1.6, 0)
      disposables.push(rockGeo)
      const wordRockMat = new THREE.MeshStandardMaterial({
        color: 0x8c8378,
        roughness: 0.92,
        metalness: 0.04,
        flatShading: true
      })
      disposables.push(wordRockMat)

      const wordMesh = new THREE.InstancedMesh(rockGeo, wordRockMat, samples.length)
      const dummy = new THREE.Object3D()
      for (let i = 0; i < samples.length; i++) {
        dummy.position.set(samples[i][0], samples[i][1] + (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 10)
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        const s = 1.1 + Math.random() * 1.5
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        wordMesh.setMatrixAt(i, dummy.matrix)
      }
      wordMesh.instanceMatrix.needsUpdate = true
      container.add(wordMesh)

      // Light illuminating the 3D rock letters
      const wordLight = new THREE.PointLight(0xfff1d6, 1.4, 600, 2)
      wordLight.position.set(0, 240, 200)
      container.add(wordLight)
    }

    // Direct Directional Sunlight for crisp shadows & rock highlights
    const realmSun = new THREE.DirectionalLight(0xfff1d6, 1.8)
    realmSun.position.set(220, 140, 180)
    container.add(realmSun)

    const realmRim = new THREE.DirectionalLight(0x5577ff, 0.45)
    realmRim.position.set(-200, -80, -160)
    container.add(realmRim)

    // Cleanup resources
    return () => {
      disposables.forEach(d => {
        if (d && typeof d.dispose === "function") {
          d.dispose()
        }
      })
      while (container.children.length > 0) {
        container.remove(container.children[0])
      }
    }
  }, [])

  // Zero-Allocation 2026 useFrame loop:
  // Culls when far away (> 450,000 AU), zero object allocations inside loop
  useFrame(({ camera, clock }, delta) => {
    if (!groupRef.current) return

    const state = animatedStateRef.current
    state.tempCamVec.copy(camera.position)
    const distToRealm = state.tempCamVec.distanceTo(state.centerVec)

    // Distance Culling: Skip animations if outside visual range
    if (distToRealm > 450000) {
      if (groupRef.current.visible) groupRef.current.visible = false
      return
    }

    if (!groupRef.current.visible) groupRef.current.visible = true

    const dt = Math.min(delta, 0.05)
    const time = clock.elapsedTime

    // 1. Broken planet pieces radial breathing displacement
    const pieces = state.planetPieces
    for (let i = 0; i < pieces.length; i++) {
      const pc = pieces[i]
      const d = pc.baseDist + Math.sin(time * 0.25 + pc.phase) * 1.8
      pc.mesh.position.x = pc.dir.x * d
      pc.mesh.position.y = pc.dir.y * d
      pc.mesh.position.z = pc.dir.z * d
    }

    // 2. Asteroids rotation & orbital movement
    const spinners = state.spinners
    for (let i = 0; i < spinners.length; i++) {
      const s = spinners[i]
      s.mesh.rotation.x += s.spin.x * dt
      s.mesh.rotation.y += s.spin.y * dt
      s.mesh.rotation.z += s.spin.z * dt

      if (s.orbitRadius >= 0) {
        s.orbitAngle += s.orbitSpeed * dt
        s.mesh.position.x = Math.cos(s.orbitAngle) * s.orbitRadius
        s.mesh.position.z = Math.sin(s.orbitAngle) * s.orbitRadius
        s.mesh.position.y = s.orbitHeight
      }
    }

    // 3. Achievement labels position synchronisation
    const labels = state.achievementLabels
    for (let i = 0; i < labels.length; i++) {
      const al = labels[i]
      const pos = al.spinner.mesh.position
      al.sprite.position.x = pos.x
      al.sprite.position.y = pos.y + al.yOffset
      al.sprite.position.z = pos.z
    }
  })

  // Raycasting click handler for achievement inspection
  const handlePointerDown = (e) => {
    e.stopPropagation()
    const targetObj = e.object
    if (targetObj && targetObj.userData && targetObj.userData.achievement) {
      if (onSelectAchievement) {
        onSelectAchievement(targetObj.userData.achievement)
      }
    }
  }

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={handlePointerDown}
      onPointerOver={(e) => {
        if (e.object?.userData?.achievement) {
          document.body.style.cursor = "pointer"
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto"
      }}
    >
      <group ref={contentRef} />
    </group>
  )
}
