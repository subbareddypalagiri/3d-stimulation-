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

    if (dist > 40000 && dist <= 250000) {
      level = "LEVEL 2: THE MILKY WAY GALAXY"
      desc = "Spiral Arms & Galactic Core"
      color = "#00d8ff"
      progress = 2
    } else if (dist > 250000 && dist <= 1800000) {
      level = "LEVEL 3: VIRGO SUPERCLUSTER"
      desc = "1,000 Distant Galaxies"
      color = "#aa66ff"
      progress = 3
    } else if (dist > 1800000 && dist <= 8000000) {
      level = "LEVEL 4: THE GREAT COSMIC WEB"
      desc = "Dark Matter Filaments & Observable Universe"
      color = "#33ddaa"
      progress = 4
    } else if (dist > 8000000 && dist <= 45000000) {
      level = "LEVEL 5: THE NASA MULTIVERSE"
      desc = "100 Eternal Inflation Bubble Universes"
      color = "#ff44aa"
      progress = 5
    } else if (dist > 45000000 && dist <= 180000000) {
      level = "LEVEL 6: THE OMNIVERSE BULK"
      desc = "20 Bold Inflaton Mega-Domains (Each with Unique Colors)"
      color = "#ffd700"
      progress = 6
    } else if (dist > 180000000) {
      level = "LEVEL 7: ULTIMATE CELESTIAL HORIZON"
      desc = "Milky Way Sky Panorama enclosing the Omniverse"
      color = "#00ffff"
      progress = 7
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
        camera={{ position: [0, 50, 150], fov: 45, far: 10000000000, near: 1 }} 
        gl={{ logarithmicDepthBuffer: true, antialias: true }}
        shadows
      >
        <Environment preset="city" />
        <ambientLight intensity={0.08} />

        {/* Live cosmological telemetry tracker */}
        <CosmicLevelTracker onLevelUpdate={setTelemetry} activeCenter={galaxyCenter} />

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

          {/* Ultimate Multiverse Horizon Milky Way Sky Panorama GLB Model */}
          <MultiverseFinalSkyPano activeCenter={galaxyCenter} />
        </Suspense>

        {/* Deep cosmic starfield */}
        <Stars radius={15000} depth={500} count={3000} factor={8} saturation={1} fade speed={0.5} />
        
        {/* Ultra-Slow, Deep & Gradual Planetarium Camera Controls with Infinity Dolly */}
        <CameraControls 
          ref={cameraControlRef} 
          makeDefault 
          maxDistance={4000000000} 
          minDistance={2}
          smoothTime={0.4}
          dollySpeed={0.035}
          truckSpeed={0.4}
          dollyToCursor={true}
          infinityDolly={true}
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

      {/* Top Right: Free Flight Controls Guide & 4 Singularity Warps */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        color: "#aabbcc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "rgba(5, 10, 25, 0.75)",
        padding: "12px 18px",
        borderRadius: 12,
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        fontSize: 11,
        lineHeight: 1.5,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
      }}>
        <b style={{ color: "#ffffff" }}>🎮 Interstellar Flight Controls:</b><br />
        • <b>Scroll Wheel:</b> Continuous zoom & fly past systems<br />
        • <b>W / S / A / D or Arrows:</b> Cruise through interstellar gaps<br />
        • <b>Shift + W:</b> Light-speed interstellar warp boost<br />
        • <b>Left Drag:</b> 360° Look | <b>Click Star:</b> Fly to system<br />
        <div style={{ display: "flex", gap: 6, marginTop: 8, marginBottom: 8 }}>
          <button
            onClick={() => flyTo([0, 20, 45], 25)}
            style={{
              background: "rgba(0, 216, 255, 0.18)",
              border: "1px solid rgba(0, 216, 255, 0.6)",
              color: "#00d8ff",
              padding: "4px 8px",
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
            onClick={() => flyTo([0, 25000, 140000], 140000)}
            style={{
              background: "rgba(170, 102, 255, 0.18)",
              border: "1px solid rgba(170, 102, 255, 0.6)",
              color: "#aa66ff",
              padding: "4px 8px",
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
              padding: "4px 8px",
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
                cameraControlRef.current.setLookAt(0, 160000000, 480000000, 0, 0, 0, true)
              }
            }}
            style={{
              background: "rgba(0, 255, 255, 0.18)",
              border: "1px solid rgba(0, 255, 255, 0.6)",
              color: "#00ffff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🌌 Beyond Omniverse
          </button>
        </div>
        <div style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <b style={{ color: "#00d8ff", fontSize: 10, letterSpacing: "0.06em" }}>WARP TO 10 COSMIC BLACK HOLES:</b>
          <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 180, overflowY: "auto" }}>
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
      </div>
    </div>
  )
}

export default App
