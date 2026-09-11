import { Canvas, useFrame } from "@react-three/fiber"
import { Stars, CameraControls, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { Suspense, useRef, useState } from "react"
import * as THREE from "three"
import "./App.css"
import UniverseManager from "./UniverseManager"
import MilkyWay from "./MilkyWay"
import CosmicWeb from "./CosmicWeb"
import CosmicAudio from "./CosmicAudio"
import TenBlackHoles from "./TenBlackHoles"
import { BLACK_HOLE_DATA } from "./blackHolesData"
import InterstellarNavigator from "./InterstellarNavigator"
import InterstellarDust from "./InterstellarDust"
import MultiverseFinalSkyPano from "./MultiverseFinalSkyPano"
import { TEN_COSMIC_SPHERES } from "./cosmicSpheresData"
import CosmicSingularityDot from "./CosmicSingularityDot"
import ScrollVideoPortal from "./ScrollVideoPortal"
import NameMonument from "./NameMonument"

// Live tracker for the 6 Cosmic Scales (Throttled to eliminate GC garbage collection stutters)
function CosmicLevelTracker({ onLevelUpdate, activeCenter = [0, 0, 0] }) {
  const centerVec = useRef(new THREE.Vector3())
  const lastUpdate = useRef(0)
  const lastProgress = useRef(1)

  useFrame(({ camera, clock }) => {
    const now = clock.elapsedTime
    centerVec.current.set(...activeCenter)
    const dist = camera.position.distanceTo(centerVec.current)

    let level = "LEVEL 1: STELLAR NEIGHBORHOOD"
    let desc = "Sol & 24 Neighboring Star Systems"
    let color = "#ffaa33"
    let progress = 1

    // Expansive interstellar distance before reaching Milky Way
    if (dist > 80000 && dist <= 450000) {
      level = "LEVEL 2: THE MILKY WAY GALAXY"
      desc = "Spiral Arms & Galactic Core"
      color = "#00d8ff"
      progress = 2
    } else if (dist > 450000 && dist <= 2500000) {
      level = "LEVEL 3: VIRGO SUPERCLUSTER"
      desc = "1,000 Distant Galaxies"
      color = "#aa66ff"
      progress = 3
    } else if (dist > 2500000 && dist <= 12000000) {
      level = "LEVEL 4: THE GREAT COSMIC WEB"
      desc = "Dark Matter Filaments & Observable Universe"
      color = "#33ddaa"
      progress = 4
    } else if (dist > 12000000 && dist <= 60000000) {
      level = "LEVEL 5: THE NASA MULTIVERSE"
      desc = "100 Eternal Inflation Bubble Universes"
      color = "#ff44aa"
      progress = 5
    } else if (dist > 60000000 && dist <= 220000000) {
      level = "LEVEL 6: THE OMNIVERSE BULK"
      desc = "20 Bold Inflaton Mega-Domains (Each with Unique Colors)"
      color = "#ffd700"
      progress = 6
    } else if (dist > 220000000 && dist <= 1300000000) {
      level = "LEVEL 7: COSMIC REALMS SPHERE"
      desc = "Milky Way Sky Panorama enclosing the Omniverse"
      color = "#00ffff"
      progress = 7
    } else if (dist > 1300000000) {
      level = "LEVEL 8: DEEP VOID SINGULARITY"
      desc = "The Infinite Outer Horizon & Celestial Singularity"
      color = "#ffffff"
      progress = 8
    }

    // Only update React state when level changes, or at most 5 times per second (prevents GC frame drops!)
    if (progress !== lastProgress.current || now - lastUpdate.current > 0.2) {
      lastUpdate.current = now
      lastProgress.current = progress
      onLevelUpdate({ level, desc, color, progress, dist: Math.round(dist) })
    }
  })

  return null
}

function App() {
  const cameraControlRef = useRef()
  const [galaxyCenter, setGalaxyCenter] = useState([0, 0, 0])
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const [showMonument, setShowMonument] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [telemetry, setTelemetry] = useState({
    level: "LEVEL 1: STELLAR NEIGHBORHOOD",
    desc: "Sol & 24 Neighboring Star Systems",
    color: "#ffaa33",
    progress: 1,
    dist: 150
  })

  const flyTo = (absPosition, radius) => {
    if (cameraControlRef.current) {
      const target = new THREE.Vector3(...absPosition)
      const offset = new THREE.Vector3(radius * 3.5, radius * 2.0, radius * 3.5)
      const cameraPos = target.clone().add(offset)
      setGalaxyCenter(absPosition)
      cameraControlRef.current.setLookAt(
        cameraPos.x, cameraPos.y, cameraPos.z, 
        target.x, target.y, target.z, 
        true
      )
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>
      <Canvas 
        camera={{ position: [0, 50, 150], fov: 45, far: 80000000000, near: 1 }} 
        gl={{ logarithmicDepthBuffer: true, antialias: true }}
        shadows
      >
        <Environment preset="city" />
        <ambientLight intensity={0.08} />

        {/* Live cosmological telemetry tracker */}
        <CosmicLevelTracker 
          onLevelUpdate={setTelemetry} 
          activeCenter={galaxyCenter}
        />

        <Suspense fallback={null}>
          <UniverseManager 
            flyTo={flyTo} 
            onActiveSystemChange={(pos) => setGalaxyCenter(pos)}
          />
          <MilkyWay position={galaxyCenter} />
          <CosmicWeb activeCenter={galaxyCenter} />
          
          {/* 10 Relativistic 3D Black Holes Distributed Across All 6 Cosmic Scales */}
          <TenBlackHoles flyTo={flyTo} />

          {/* Luminous Interstellar Dust Streaming in the Deep Void Gaps */}
          <InterstellarDust count={2200} />

          {/* 10 Colossal Cosmic Realm Spheres (GLB Panorama with light-mixing colors) */}
          <MultiverseFinalSkyPano activeCenter={galaxyCenter} />

          {/* Level 8: The Mysterious Pulsating White Singularity Dot */}
          <CosmicSingularityDot flyTo={flyTo} />

          {/* 3D Celestial Voxel Monument: SUBBAREDDY PALAGIRI (On-demand toggleable) */}
          <NameMonument position={[0, 22, 0]} visible={showMonument} />
        </Suspense>

        {/* Deep cosmic starfield */}
        <group raycast={() => null}>
          <Stars radius={15000} depth={500} count={3000} factor={8} saturation={1} fade speed={0.5} />
        </group>
        
        {/* Ultra-Slow, Deep & Gradual Planetarium Camera Controls */}
        <CameraControls 
          ref={cameraControlRef} 
          makeDefault 
          maxDistance={4000000000} 
          minDistance={2}
          smoothTime={0.4}
          dollySpeed={0.035}
          truckSpeed={0.4}
          dollyToCursor={true}
          infinityDolly={false}
        />

        {/* Real-time Interstellar Flight Engine (Traverse gaps between solar systems) */}
        <InterstellarNavigator cameraControlRef={cameraControlRef} flyTo={flyTo} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.5} intensity={1.2} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {/* Interactive Ethereal Cosmic Soundscape (Web Audio Synthesizer) */}
      <CosmicAudio currentDistance={telemetry.dist} />
      
      {/* Top Left: Live Cosmic Scale Telemetry HUD */}
      <div style={{ 
        position: "absolute", 
        top: 20, 
        left: 20, 
        color: "white", 
        fontFamily: "system-ui, -apple-system, sans-serif", 
        background: "rgba(5, 10, 25, 0.8)", 
        padding: "16px 24px", 
        borderRadius: 14, 
        backdropFilter: "blur(20px)",
        border: `1px solid ${telemetry.color}55`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${telemetry.color}33`,
        maxWidth: 420,
        pointerEvents: "none",
        transition: "all 0.3s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ 
            display: "inline-block", 
            width: 10, 
            height: 10, 
            borderRadius: "50%", 
            background: telemetry.color,
            boxShadow: `0 0 10px ${telemetry.color}`
          }} />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "1px", color: telemetry.color }}>
            {telemetry.level}
          </span>
        </div>
        
        <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
          {telemetry.desc}
        </div>

        <div style={{ fontSize: 11, color: "#8899aa", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
          <span>Scale: Level {telemetry.progress} of 6</span>
          <span>Distance: {telemetry.dist.toLocaleString()} AU/units</span>
        </div>

        {/* 6-Level Progress Bar */}
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ 
            width: `${(telemetry.progress / 6) * 100}%`, 
            height: "100%", 
            background: telemetry.color,
            transition: "width 0.4s ease, background 0.4s ease"
          }} />
        </div>
      </div>

      {/* Top Right: Compact Toggle Button for Flight Controls & Warps HUD */}
      {!isMenuOpen ? (
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(5, 10, 25, 0.82)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0, 216, 255, 0.5)",
            color: "#00e5ff",
            padding: "8px 16px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.03em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0, 216, 255, 0.25)",
            transition: "all 0.25s ease",
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 216, 255, 0.2)"
            e.currentTarget.style.boxShadow = "0 0 25px rgba(0, 216, 255, 0.5)"
            e.currentTarget.style.transform = "scale(1.04)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(5, 10, 25, 0.82)"
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 216, 255, 0.25)"
            e.currentTarget.style.transform = "scale(1)"
          }}
          title="Open Flight Controls & Cosmic Warps"
        >
          <span style={{ fontSize: 14 }}>🛸</span>
          <span>Controls & Warps ▾</span>
        </button>
      ) : (
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 380,
          maxHeight: "88vh",
          overflowY: "auto",
          color: "#aabbcc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "rgba(5, 10, 25, 0.9)",
          padding: "14px 18px",
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 216, 255, 0.35)",
          fontSize: 11,
          lineHeight: 1.5,
          boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 0 25px rgba(0, 216, 255, 0.15)",
          zIndex: 100
        }}>
          {/* Header with Close / Minimize Button */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: "1px solid rgba(255,255,255,0.12)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🛸</span>
              <b style={{ color: "#ffffff", fontSize: 12, letterSpacing: "0.02em" }}>Flight Controls & Warps</b>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#e2e8f0",
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 75, 75, 0.3)"
                e.currentTarget.style.borderColor = "rgba(255, 75, 75, 0.6)"
                e.currentTarget.style.color = "#ffffff"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.color = "#e2e8f0"
              }}
              title="Close menu"
            >
              ✕ Close
            </button>
          </div>

          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8, lineHeight: 1.4 }}>
            • <b>Scroll:</b> Continuous zoom & fly past systems<br />
            • <b>W/S/A/D:</b> Cruise void gaps | <b>Shift:</b> Warp boost<br />
            • <b>Drag:</b> 360° Look | <b>Click Star:</b> Fly to system
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            <button
              onClick={() => flyTo([0, 20, 45], 25)}
              style={{
                background: "rgba(0, 216, 255, 0.18)",
                border: "1px solid rgba(0, 216, 255, 0.6)",
                color: "#00d8ff",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              🛸 Return to Sol (R)
            </button>
            <button
              onClick={() => {
                const next = !showMonument
                setShowMonument(next)
                if (next && cameraControlRef.current) {
                  cameraControlRef.current.setLookAt(0, 24, 30, 0, 22, 0, true)
                }
              }}
              style={{
                background: showMonument
                  ? "linear-gradient(135deg, rgba(94, 234, 212, 0.4), rgba(139, 92, 246, 0.4))"
                  : "rgba(255, 255, 255, 0.08)",
                border: `1px solid ${showMonument ? "#5eead4" : "rgba(255, 255, 255, 0.25)"}`,
                color: showMonument ? "#5eead4" : "#ffffff",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: showMonument ? "0 0 10px rgba(94, 234, 212, 0.4)" : "none",
                transition: "all 0.2s ease"
              }}
              title="Click to toggle Subbareddy Palagiri Monument"
            >
              👑 {showMonument ? "Hide Monument" : "Show Monument"}
            </button>
            <button
              onClick={() => flyTo([0, 25000, 140000], 140000)}
              style={{
                background: "rgba(170, 102, 255, 0.18)",
                border: "1px solid rgba(170, 102, 255, 0.6)",
                color: "#aa66ff",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              🌌 Galaxy View
            </button>
            <button
              onClick={() => flyTo([0, 35000000, 95000000], 95000000)}
              style={{
                background: "rgba(255, 68, 170, 0.18)",
                border: "1px solid rgba(255, 68, 170, 0.6)",
                color: "#ff44aa",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              🫧 Multiverse
            </button>
            <button
              onClick={() => {
                if (cameraControlRef.current) {
                  cameraControlRef.current.setLookAt(0, 9500000000, 26000000000, 0, 0, 0, true)
                }
              }}
              style={{
                background: "rgba(0, 255, 255, 0.18)",
                border: "1px solid rgba(0, 255, 255, 0.6)",
                color: "#00ffff",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              🌌 10 Spheres
            </button>
            <button
              onClick={() => {
                if (cameraControlRef.current) {
                  cameraControlRef.current.setLookAt(0, 11000000000, 32000000000, 0, 0, 0, true)
                }
              }}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                color: "#ffffff",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255,255,255,0.4)"
              }}
            >
              ⚪ Singularity Dot
            </button>
            <button
              onClick={() => setIsPortalOpen(true)}
              style={{
                gridColumn: "1 / -1",
                background: "linear-gradient(90deg, rgba(0, 216, 255, 0.3), rgba(255, 0, 234, 0.3))",
                border: "1px solid #00d8ff",
                color: "#00ffff",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0, 216, 255, 0.4)"
              }}
            >
              🎬 Video Portal
            </button>
          </div>

          {/* Black Holes Warp List */}
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <b style={{ color: "#00d8ff", fontSize: 10, letterSpacing: "0.06em" }}>WARP TO 10 COSMIC BLACK HOLES:</b>
            <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 110, overflowY: "auto" }}>
              {BLACK_HOLE_DATA.map((bh) => (
                <button
                  key={bh.id}
                  onClick={() => flyTo(bh.pos, 40 * bh.scale)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${bh.color}55`,
                    color: bh.color,
                    padding: "4px 6px",
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "all 0.2s ease"
                  }}
                  title={`${bh.name} (${bh.level})`}
                >
                  🕳️ {bh.name}
                </button>
              ))}
            </div>
          </div>

          {/* Realms Warp List */}
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <b style={{ color: "#ff44cc", fontSize: 10, letterSpacing: "0.06em" }}>WARP TO 10 COSMIC REALMS (GLB SPHERES):</b>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 110, overflowY: "auto" }}>
              {TEN_COSMIC_SPHERES.map((realm) => (
                <button
                  key={realm.id}
                  onClick={() => {
                    if (cameraControlRef.current) {
                      const r = 1100000000 * realm.scale
                      cameraControlRef.current.setLookAt(
                        realm.pos[0], realm.pos[1] + r * 1.5, realm.pos[2] + r * 2.8,
                        realm.pos[0], realm.pos[1], realm.pos[2],
                        true
                      )
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${realm.c1}77`,
                    color: realm.c1,
                    padding: "4px 6px",
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "all 0.2s ease"
                  }}
                  title={realm.name}
                >
                  🔮 {realm.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Apple-Grade Scroll Video Frame Scrubber Portal */}
      <ScrollVideoPortal 
        isOpen={isPortalOpen} 
        onClose={() => {
          setIsPortalOpen(false)
          if (cameraControlRef.current) {
            // Instantly place camera safely inside cosmic sphere at 680M AU
            cameraControlRef.current.setLookAt(0, 200000000, 650000000, 0, 0, 0, false)
          }
        }} 
      />
    </div>
  )
}

export default App
