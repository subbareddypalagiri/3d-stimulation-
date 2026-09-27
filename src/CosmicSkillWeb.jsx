import React, { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Soft radial sprite texture generator (pure procedural canvas, zero external asset dependency)
function makeSprite(inner, outer) {
  const c = document.createElement("canvas")
  c.width = c.height = 128
  const ctx = c.getContext("2d")
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, inner)
  g.addColorStop(0.4, outer)
  g.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  return tex
}

function makeTextSprite(text, color, scaleFactor = 1) {
  const fontSize = 56
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  ctx.font = `bold ${fontSize}px -apple-system, Arial, sans-serif`
  const w = Math.ceil(ctx.measureText(text).width) + 48
  canvas.width = w
  canvas.height = fontSize + 44

  const ctx2 = canvas.getContext("2d")
  ctx2.font = `bold ${fontSize}px -apple-system, Arial, sans-serif`
  ctx2.textBaseline = "middle"
  ctx2.shadowColor = color
  ctx2.shadowBlur = 24
  ctx2.fillStyle = color
  ctx2.fillText(text, 24, canvas.height / 2)
  ctx2.shadowBlur = 0
  ctx2.fillStyle = "rgba(255,255,255,0.96)"
  ctx2.fillText(text, 24, canvas.height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: true
  })
  const sprite = new THREE.Sprite(mat)
  const h = 14 * scaleFactor
  sprite.scale.set(h * (canvas.width / canvas.height), h, 1)
  return sprite
}

// 3D value noise for organic cosmic filaments
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

export default function CosmicSkillWeb({ position = [110000, 32000, -180000], scale = 45, flyTo }) {
  const groupRef = useRef()
  const fireRef = useRef()
  const titleGroupRef = useRef()

  // Generate all 3D geometries, particle clouds, and skill nodes
  const webData = useMemo(() => {
    const texGlow = makeSprite("rgba(255,255,255,1)", "rgba(255,180,80,0.6)")
    const texBlue = makeSprite("rgba(190,200,255,1)", "rgba(90,70,220,0.5)")
    const texRed = makeSprite("rgba(255,200,120,1)", "rgba(255,45,10,0.55)")
    const texHalo = makeSprite("rgba(255,140,60,0.5)", "rgba(200,40,20,0.18)")
    const texCoreHalo = makeSprite("rgba(255,240,200,0.7)", "rgba(255,150,60,0.15)")

    const RADIUS = 260
    const NODES = 60
    const nodes = [new THREE.Vector3(0, 0, 0)] // central bright nexus

    for (let i = 0; i < NODES; i++) {
      const u = Math.random(), v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = RADIUS * (0.35 + 0.65 * Math.random())
      const p = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi)
      )
      nodes.push(p)
    }

    // Connect nodes to nearest neighbors -> cosmic web filament network
    const edges = []
    const seenEdges = {}
    for (let a = 0; a < nodes.length; a++) {
      const dists = []
      for (let b = 0; b < nodes.length; b++) {
        if (a === b) continue
        dists.push([nodes[a].distanceTo(nodes[b]), b])
      }
      dists.sort((x, y) => x[0] - y[0])
      const connections = a === 0 ? 10 : (4 + Math.floor(Math.random() * 3))
      for (let k = 0; k < connections && k < dists.length; k++) {
        const bIdx = dists[k][1]
        const key = a < bIdx ? `${a}_${bIdx}` : `${bIdx}_${a}`
        if (seenEdges[key]) continue
        seenEdges[key] = true
        edges.push([a, bIdx])
      }
    }

    // Extra long-range cross links
    for (let x = 0; x < NODES * 2.2; x++) {
      const a2 = 1 + Math.floor(Math.random() * (nodes.length - 1))
      const b2 = 1 + Math.floor(Math.random() * (nodes.length - 1))
      if (a2 === b2) continue
      const key2 = a2 < b2 ? `${a2}_${b2}` : `${b2}_${a2}`
      if (seenEdges[key2]) continue
      seenEdges[key2] = true
      edges.push([a2, b2])
    }

    // Build organic filament curves using 3D noise
    const filPositions = []
    const filColors = []
    const colBlueA = new THREE.Color(0x8fa4ff)
    const colBlueB = new THREE.Color(0x201a5e)

    edges.forEach((e) => {
      const p0 = nodes[e[0]], p1 = nodes[e[1]]
      const segs = 36 + Math.floor(Math.random() * 24)
      const jitterScale = p0.distanceTo(p1) * 0.15
      for (let s = 0; s <= segs; s++) {
        const t = s / segs
        const base = p0.clone().lerp(p1, t)
        const n1 = noise3(base.x * 0.02, base.y * 0.02, base.z * 0.02) - 0.5
        const n2 = noise3(base.y * 0.02 + 9, base.z * 0.02 + 9, base.x * 0.02 + 9) - 0.5
        const n3 = noise3(base.z * 0.02 + 21, base.x * 0.02 + 21, base.y * 0.02 + 21) - 0.5
        const wobble = Math.sin(t * Math.PI) * jitterScale
        base.x += n1 * wobble
        base.y += n2 * wobble * 0.6
        base.z += n3 * wobble
        filPositions.push(base.x, base.y, base.z)
        const c = colBlueB.clone().lerp(colBlueA, 0.3 + 0.7 * Math.random())
        filColors.push(c.r, c.g, c.b)
      }
    })

    const filGeo = new THREE.BufferGeometry()
    filGeo.setAttribute("position", new THREE.Float32BufferAttribute(filPositions, 3))
    filGeo.setAttribute("color", new THREE.Float32BufferAttribute(filColors, 3))
    const filMat = new THREE.PointsMaterial({
      size: 2.2,
      map: texBlue,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // Gas cluster particles around each node (red/orange diffuse blobs)
    const gasPositions = [], gasColors = []
    const colOrange = new THREE.Color(0xff5f14)
    const colRedDeep = new THREE.Color(0x5c0a04)
    nodes.forEach((node, idx) => {
      if (idx === 0) return
      const count = 120 + Math.floor(Math.random() * 80)
      const spread = 20 + Math.random() * 30
      for (let i = 0; i < count; i++) {
        const dir = new THREE.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.7, Math.random() - 0.5).normalize()
        const rr = spread * Math.pow(Math.random(), 1.6)
        const p = node.clone().addScaledVector(dir, rr)
        gasPositions.push(p.x, p.y, p.z)
        const c = colRedDeep.clone().lerp(colOrange, Math.random())
        if (Math.random() < 0.06) c.lerp(new THREE.Color(0xfff2c0), 0.8)
        gasColors.push(c.r, c.g, c.b)
      }
    })
    const gasGeo = new THREE.BufferGeometry()
    gasGeo.setAttribute("position", new THREE.Float32BufferAttribute(gasPositions, 3))
    gasGeo.setAttribute("color", new THREE.Float32BufferAttribute(gasColors, 3))
    const gasMat = new THREE.PointsMaterial({
      size: 7.5,
      map: texRed,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // Halo volumetric layer
    const haloPositions = [], haloColors = []
    nodes.forEach((node, idx) => {
      if (idx === 0) return
      const count = 16 + Math.floor(Math.random() * 12)
      const spread = 22 + Math.random() * 20
      for (let i = 0; i < count; i++) {
        const dir = new THREE.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.6, Math.random() - 0.5).normalize()
        const rr = spread * Math.pow(Math.random(), 1.2)
        const p = node.clone().addScaledVector(dir, rr)
        haloPositions.push(p.x, p.y, p.z)
        haloColors.push(1, 0.55, 0.25)
      }
    })
    const haloGeo = new THREE.BufferGeometry()
    haloGeo.setAttribute("position", new THREE.Float32BufferAttribute(haloPositions, 3))
    haloGeo.setAttribute("color", new THREE.Float32BufferAttribute(haloColors, 3))
    const haloMat = new THREE.PointsMaterial({
      size: 32,
      map: texHalo,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // Bright central luminous core
    const corePositions = [], coreColors = []
    const colYellow = new THREE.Color(0xffcf70)
    const colWhite = new THREE.Color(0xffffff)
    for (let i = 0; i < 700; i++) {
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
      const rr = 55 * Math.pow(Math.random(), 2.2)
      const p = dir.multiplyScalar(rr)
      corePositions.push(p.x, p.y, p.z)
      const c = colYellow.clone().lerp(colWhite, Math.random())
      coreColors.push(c.r, c.g, c.b)
    }
    const coreGeo = new THREE.BufferGeometry()
    coreGeo.setAttribute("position", new THREE.Float32BufferAttribute(corePositions, 3))
    coreGeo.setAttribute("color", new THREE.Float32BufferAttribute(coreColors, 3))
    const coreMat = new THREE.PointsMaterial({
      size: 6.5,
      map: texGlow,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // Stardust on filaments
    const dustPositions = [], dustColors = []
    const colPink = new THREE.Color(0xff7fc0)
    for (let i = 0; i < 2800; i++) {
      const idx3 = Math.floor(Math.random() * (filPositions.length / 3)) * 3
      const jitter = 2.5
      dustPositions.push(
        filPositions[idx3] + (Math.random() - 0.5) * jitter,
        filPositions[idx3 + 1] + (Math.random() - 0.5) * jitter,
        filPositions[idx3 + 2] + (Math.random() - 0.5) * jitter
      )
      const c = colWhite.clone().lerp(colPink, 0.3 + Math.random() * 0.7)
      dustColors.push(c.r, c.g, c.b)
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute("position", new THREE.Float32BufferAttribute(dustPositions, 3))
    dustGeo.setAttribute("color", new THREE.Float32BufferAttribute(dustColors, 3))
    const dustMat = new THREE.PointsMaterial({
      size: 2.8,
      map: texGlow,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // 25 Skill Labels on nodes
    const skillList = [
      "Python", "JavaScript", "Java", "React.js", "Next.js", "HTML5", "CSS3", "Tailwind CSS",
      "Node.js", "Express.js", "REST APIs", "MongoDB", "PostgreSQL",
      "NLP", "LLM APIs", "RAG", "Prompt Engineering",
      "Git", "GitHub", "GitHub Actions", "Chrome Ext. API", "Vercel",
      "Team Workflows", "Repo Management", "LeetCode 100 Days"
    ]
    const skillColors = ["#ffb84d", "#ff6fae", "#8fd3ff", "#ffe08a", "#ff8a65", "#c3a6ff"]
    const skillSprites = []
    for (let si = 0; si < skillList.length && si < nodes.length - 1; si++) {
      const node = nodes[si + 1]
      const label = makeTextSprite(skillList[si], skillColors[si % skillColors.length], 1.0)
      const dir = node.clone().normalize()
      label.position.copy(node).addScaledVector(dir, 12)
      label.position.y += 12
      skillSprites.push({ sprite: label, name: skillList[si] })
    }

    // "SKILLS" rendered as 3D stardust letters floating above web
    const word = "SKILLS"
    const cw = 900, ch = 260
    const tcanvas = document.createElement("canvas")
    tcanvas.width = cw
    tcanvas.height = ch
    const tctx = tcanvas.getContext("2d")
    tctx.fillStyle = "#000"
    tctx.fillRect(0, 0, cw, ch)
    tctx.font = "900 190px Arial, sans-serif"
    tctx.textAlign = "center"
    tctx.textBaseline = "middle"
    tctx.fillStyle = "#fff"
    tctx.fillText(word, cw / 2, ch / 2 + 10)
    const img = tctx.getImageData(0, 0, cw, ch).data

    const letterPositions = [], letterColors = []
    const colHot = new THREE.Color(0xfff2c0)
    const colFire = new THREE.Color(0xff7a2e)
    const colGlow = new THREE.Color(0xff5fae)
    const scaleX = 200 / cw, scaleY = scaleX

    for (let y = 0; y < ch; y += 2) {
      for (let x = 0; x < cw; x += 2) {
        if (img[(y * cw + x) * 4] > 128) {
          const px = (x - cw / 2) * scaleX
          const py = (ch / 2 - y) * scaleY
          const pz = (Math.random() - 0.5) * 14
          letterPositions.push(px, py + 205, pz)
          let c = colFire.clone().lerp(colHot, Math.random() * 0.7)
          if (Math.random() < 0.12) c = colGlow.clone()
          letterColors.push(c.r, c.g, c.b)
        }
      }
    }

    const lettersGeo = new THREE.BufferGeometry()
    lettersGeo.setAttribute("position", new THREE.Float32BufferAttribute(letterPositions, 3))
    lettersGeo.setAttribute("color", new THREE.Float32BufferAttribute(letterColors, 3))
    const lettersMat = new THREE.PointsMaterial({
      size: 3.5,
      map: texGlow,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // "SUBBAREDDY" Header Title in Stardust
    const subbaWord = "SUBBAREDDY PALAGIRI"
    const scw = 1100, sch = 200
    const scanvas = document.createElement("canvas")
    scanvas.width = scw
    scanvas.height = sch
    const sctx = scanvas.getContext("2d")
    sctx.fillStyle = "#000"
    sctx.fillRect(0, 0, scw, sch)
    sctx.font = "bold 90px Arial, sans-serif"
    sctx.textAlign = "center"
    sctx.textBaseline = "middle"
    sctx.fillStyle = "#fff"
    sctx.fillText(subbaWord, scw / 2, sch / 2)
    const simg = sctx.getImageData(0, 0, scw, sch).data

    const subbaPositions = [], subbaColors = []
    const colCyan = new THREE.Color(0x00f0ff)
    const sScaleX = 260 / scw, sScaleY = sScaleX
    for (let y = 0; y < sch; y += 2) {
      for (let x = 0; x < scw; x += 2) {
        if (simg[(y * scw + x) * 4] > 128) {
          const px = (x - scw / 2) * sScaleX
          const py = (sch / 2 - y) * sScaleY
          const pz = (Math.random() - 0.5) * 12
          subbaPositions.push(px, py + 265, pz)
          const c = colCyan.clone().lerp(colWhite, Math.random() * 0.6)
          subbaColors.push(c.r, c.g, c.b)
        }
      }
    }
    const subbaGeo = new THREE.BufferGeometry()
    subbaGeo.setAttribute("position", new THREE.Float32BufferAttribute(subbaPositions, 3))
    subbaGeo.setAttribute("color", new THREE.Float32BufferAttribute(subbaColors, 3))
    const subbaMat = new THREE.PointsMaterial({
      size: 3.2,
      map: texGlow,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    // Living fire particle system
    const fireCount = 750
    const totalLetterPts = letterPositions.length / 3
    const firePos = new Float32Array(fireCount * 3)
    const fireCol = new Float32Array(fireCount * 3)
    const fireBaseX = new Float32Array(fireCount)
    const fireBaseY = new Float32Array(fireCount)
    const fireBaseZ = new Float32Array(fireCount)
    const firePhase = new Float32Array(fireCount)
    const fireSpeed = new Float32Array(fireCount)
    const fireRise = new Float32Array(fireCount)
    const fireDriftFreq = new Float32Array(fireCount)
    const fireDriftAmp = new Float32Array(fireCount)
    const fireDriftPhase = new Float32Array(fireCount)

    for (let i = 0; i < fireCount; i++) {
      const li = Math.floor(Math.random() * totalLetterPts)
      fireBaseX[i] = letterPositions[li * 3]
      fireBaseY[i] = letterPositions[li * 3 + 1]
      fireBaseZ[i] = letterPositions[li * 3 + 2]
      firePhase[i] = Math.random()
      fireSpeed[i] = 0.3 + Math.random() * 0.55
      fireRise[i] = 12 + Math.random() * 28
      fireDriftFreq[i] = 1 + Math.random() * 2.2
      fireDriftAmp[i] = 1.2 + Math.random() * 2.8
      fireDriftPhase[i] = Math.random() * Math.PI * 2
    }

    const fireGeo = new THREE.BufferGeometry()
    fireGeo.setAttribute("position", new THREE.BufferAttribute(firePos, 3))
    fireGeo.setAttribute("color", new THREE.BufferAttribute(fireCol, 3))
    const fireMat = new THREE.PointsMaterial({
      size: 4.5,
      map: texGlow,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    return {
      filGeo, filMat,
      gasGeo, gasMat,
      haloGeo, haloMat,
      coreGeo, coreMat,
      dustGeo, dustMat,
      lettersGeo, lettersMat,
      subbaGeo, subbaMat,
      skillSprites,
      fireData: {
        geo: fireGeo,
        mat: fireMat,
        pos: firePos,
        col: fireCol,
        baseX: fireBaseX,
        baseY: fireBaseY,
        baseZ: fireBaseZ,
        phase: firePhase,
        speed: fireSpeed,
        rise: fireRise,
        driftFreq: fireDriftFreq,
        driftAmp: fireDriftAmp,
        driftPhase: fireDriftPhase,
        count: fireCount,
        colHot,
        colFire,
        colDark: new THREE.Color(0x1a0400)
      }
    }
  }, [])

  // Animation frame loop: slow cosmic rotation, floating title bob, living fire rise
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.025
    }

    const bobY = Math.sin(t * 0.7) * 8
    if (titleGroupRef.current) {
      titleGroupRef.current.position.y = bobY
    }

    const fd = webData.fireData
    if (fd && fireRef.current) {
      fireRef.current.position.y = bobY
      for (let fi = 0; fi < fd.count; fi++) {
        const progress = (t * fd.speed[fi] + fd.phase[fi]) % 1
        const i3 = fi * 3
        const xOff = Math.sin(t * fd.driftFreq[fi] + fd.driftPhase[fi]) * fd.driftAmp[fi] * progress
        const zOff = Math.cos(t * fd.driftFreq[fi] * 0.8 + fd.driftPhase[fi]) * fd.driftAmp[fi] * 0.6 * progress
        fd.pos[i3] = fd.baseX[fi] + xOff
        fd.pos[i3 + 1] = fd.baseY[fi] + progress * fd.rise[fi]
        fd.pos[i3 + 2] = fd.baseZ[fi] + zOff
        const c = fd.colHot.clone().lerp(fd.colFire, Math.min(1, progress * 1.8))
        if (progress > 0.45) c.lerp(fd.colDark, (progress - 0.45) / 0.55)
        fd.col[i3] = c.r
        fd.col[i3 + 1] = c.g
        fd.col[i3 + 2] = c.b
      }
      fd.geo.attributes.position.needsUpdate = true
      fd.geo.attributes.color.needsUpdate = true
      fd.mat.opacity = 0.82 + Math.sin(t * 7) * 0.08
    }

    // Dynamic visibility check: visible from past Milky Way edge (dist > 35,000) up to supercluster view
    if (groupRef.current) {
      const dist = camera.position.distanceTo(new THREE.Vector3(...position))
      groupRef.current.visible = dist <= 1200000
    }
  })

  return (
    <group position={position} scale={[scale, scale, scale]} raycast={() => null}>
      {/* Root rotating Cosmic Skill Web */}
      <group ref={groupRef} raycast={() => null}>
        {/* Organic Cosmic Web Filaments */}
        <points geometry={webData.filGeo} material={webData.filMat} raycast={() => null} />

        {/* Diffuse Gas Cluster Blobs */}
        <points geometry={webData.gasGeo} material={webData.gasMat} raycast={() => null} />

        {/* Volumetric Glow Halos */}
        <points geometry={webData.haloGeo} material={webData.haloMat} raycast={() => null} />

        {/* Radiant Central Core */}
        <points geometry={webData.coreGeo} material={webData.coreMat} raycast={() => null} />

        {/* Stardust Dust Points along Filaments */}
        <points geometry={webData.dustGeo} material={webData.dustMat} raycast={() => null} />

        {/* 25 Skill Labels on Node Hubs */}
        {webData.skillSprites.map(({ sprite, name }, idx) => (
          <primitive key={idx} object={sprite} raycast={() => null} />
        ))}

        {/* Floating 3D Stardust Word Titles: "SUBBAREDDY PALAGIRI" & "SKILLS" */}
        <group ref={titleGroupRef} raycast={() => null}>
          <points geometry={webData.subbaGeo} material={webData.subbaMat} raycast={() => null} />
          <points geometry={webData.lettersGeo} material={webData.lettersMat} raycast={() => null} />
        </group>

        {/* Living Fire Particles rising from the title letters */}
        <points
          ref={fireRef}
          geometry={webData.fireData.geo}
          material={webData.fireData.mat}
          raycast={() => null}
        />
      </group>

      {/* Central Illuminating Star Light */}
      <pointLight color="#ff8833" intensity={scale * 16} distance={scale * 350} />
      <pointLight color="#00e5ff" intensity={scale * 10} distance={scale * 280} position={[0, 220, 0]} />
    </group>
  )
}
