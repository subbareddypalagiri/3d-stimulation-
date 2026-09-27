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
import EmuInTheSky from "./EmuInTheSky"
import AlienNebulaRealm from "./AlienNebulaRealm"
import RelativisticBlackHoleGateway from "./RelativisticBlackHoleGateway"
import RelativisticBlackHole from "./RelativisticBlackHole"
import PlanesAndSatellitesHubs, { SATELLITE_HUBS } from "./PlanesAndSatellitesHubs"
import CosmicSkillWeb from "./CosmicSkillWeb"
import { SOL_PLANETS } from "./SolarSystem"
import CosmicFlightNavigator from "./CosmicFlightNavigator"
import PrimeRealmProjectsOrbit, { PRIME_PROJECTS } from "./PrimeRealmProjectsOrbit"

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
      desc = "75 Eternal Inflation Bubble Universes (Hyperspace Void Spacing)"
      color = "#ff44aa"
      progress = 5
    } else if (dist > 60000000 && dist <= 220000000) {
      level = "LEVEL 6: THE OMNIVERSE BULK"
      desc = "20 Bold Inflaton Mega-Domains (Each with Unique Colors)"
      color = "#ffd700"
      progress = 6
    } else if (dist > 220000000 && dist <= 3500000000) {
      level = "LEVEL 7: PRIME COSMIC REALM"
      desc = "Milky Way Sky Panorama enclosing the Omniverse"
      color = "#00ffff"
      progress = 7
    } else if (dist > 3500000000 && dist <= 22000000000) {
      level = "LEVEL 8: 10 COSMIC REALMS"
      desc = "All 10 Colossal Multiverse Realm Spheres in Deep Void"
      color = "#ff44cc"
      progress = 8
    } else if (dist > 22000000000) {
      level = "LEVEL 9: THE COSMIC SINGULARITY"
      desc = "Pulsating White Singularity Dot at the Horizon of Infinity"
      color = "#ffffff"
      progress = 9
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
  const [isBlackHoleModalOpen, setIsBlackHoleModalOpen] = useState(false)
  const [isPIPClosed, setIsPIPClosed] = useState(false)
  const [blackHoleTarget, setBlackHoleTarget] = useState({
    title: "M87: Post-Milky Way Relativistic Black Hole",
    subtitle: "Virgo Supercluster • 550,000 AU Beyond Milky Way • Raymarched Null Geodesics"
  })
  const [showMonument, setShowMonument] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false)
  const [mouseSensitivity, setMouseSensitivity] = useState(() => {
    try {
      const saved = localStorage.getItem("cosmic_mouse_sensitivity")
      return saved ? JSON.parse(saved) : { scroll: 0.6, rotate: 0.6 }
    } catch {
      return { scroll: 0.6, rotate: 0.6 }
    }
  })

  const updateSensitivity = (newSens) => {
    setMouseSensitivity(newSens)
    try {
      localStorage.setItem("cosmic_mouse_sensitivity", JSON.stringify(newSens))
    } catch (e) {
      console.warn(e)
    }
  }

  const [primeLayoutMode, setPrimeLayoutMode] = useState("rows")
  const [activePrimePlanet, setActivePrimePlanet] = useState(null)
  const [telemetry, setTelemetry] = useState({
    level: "LEVEL 1: STELLAR NEIGHBORHOOD",
    desc: "Sol & 24 Neighboring Star Systems",
    color: "#ffaa33",
    progress: 1,
    dist: 150
  })

  const flyToPrimeRealm = () => {
    if (cameraControlRef.current) {
      const monumentCenter = new THREE.Vector3(0, 180000000 + 4 * 650000, 680000000)
      // Exact front-facing perspective from Claude HTML: radius=85, theta=0.5, phi=1.25
      const offset = new THREE.Vector3(
        38.673 * 650000,
        26.802 * 650000,
        70.793 * 650000
      )
      const camPos = monumentCenter.clone().add(offset)
      setGalaxyCenter([0, 180000000, 680000000])
      cameraControlRef.current.setLookAt(
        camPos.x, camPos.y, camPos.z,
        monumentCenter.x, monumentCenter.y, monumentCenter.z,
        true
      )
    }
  }

  const flyToNameMonument = () => {
    setShowMonument(true)
    if (cameraControlRef.current) {
      setGalaxyCenter([0, 22, 0])
      cameraControlRef.current.setLookAt(
        0, 22.8, 14,
        0, 22, 0,
        true
      )
    }
  }

  const flyToSkillWeb = () => {
    if (cameraControlRef.current) {
      setGalaxyCenter([110000, 32000, -180000])
      cameraControlRef.current.setLookAt(
        110000, 32000 + 3200, -180000 + 24000,
        110000, 32000 + 1200, -180000,
        true
      )
    }
  }

  const flyTo = (absPosition, radius, distanceMultiplier = 1.0) => {
    if (cameraControlRef.current) {
      // If targeting Prime Cosmic Realm, use exact front-facing Claude perspective
      if (absPosition[0] === 0 && absPosition[1] === 180000000 && absPosition[2] === 680000000) {
        flyToPrimeRealm()
        return
      }

      const target = new THREE.Vector3(...absPosition)
      const offsetDist = Math.max(radius * 1.5 * distanceMultiplier, 3.5)
      const offset = new THREE.Vector3(offsetDist * 0.7, offsetDist * 0.35, offsetDist * 0.8)
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
          <NameMonument position={[0, 22, 0]} visible={showMonument} onFocus={flyToNameMonument} />

          {/* Level 2: Ancient Milky Way Constellation: Emu in the Sky */}
          <EmuInTheSky position={[-35000, 3200, 32000]} scale={65} />

          {/* Level 8: 8K Self-Illuminating Alien Space Nebula Realm */}
          <AlienNebulaRealm position={[-8200000000, -1100000000, 3900000000]} scale={130000} />

          {/* Level 3: Relativistic Raymarched Black Hole Gateway (Past Milky Way) */}
          <RelativisticBlackHoleGateway
            position={[150000, 60000, -520000]}
            radius={18000}
            onOpenSimulation={() => {
              setBlackHoleTarget({
                title: "M87: Post-Milky Way Relativistic Black Hole",
                subtitle: "Virgo Supercluster • 550,000 AU Beyond Milky Way • Raymarched Null Geodesics"
              })
              setIsBlackHoleModalOpen(true)
            }}
            flyTo={flyTo}
          />

          {/* 10 Planetary Satellite & Plane Networks Across Diverse Cosmic Sectors */}
          <PlanesAndSatellitesHubs flyTo={flyTo} />

          {/* Level 3: Subbareddy 3D Cosmic Skill Web (Placed outside Milky Way) */}
          <CosmicSkillWeb
            position={[110000, 32000, -180000]}
            scale={50}
            flyTo={flyTo}
          />

          {/* Level 7: Prime Cosmic Realm - 3D Projects Orbit Showcase */}
          <PrimeRealmProjectsOrbit
            position={[0, 180000000, 680000000]}
            scale={650000}
            flyTo={flyTo}
            layoutMode={primeLayoutMode}
            onSelectPlanet={(planet) => setActivePrimePlanet(planet)}
            activePlanet={activePrimePlanet}
          />
        </Suspense>

        {/* Deep cosmic starfield */}
        <group raycast={() => null}>
          <Stars radius={15000} depth={500} count={3000} factor={8} saturation={1} fade speed={0.5} />
        </group>
        
        {/* Responsive, Smooth & Natural 3D Planetarium Camera Controls with User Sensitivity */}
        <CameraControls 
          ref={cameraControlRef} 
          makeDefault 
          maxDistance={65000000000} 
          minDistance={0.5}
          smoothTime={0.25}
          azimuthRotateSpeed={mouseSensitivity.rotate}
          polarRotateSpeed={mouseSensitivity.rotate}
          truckSpeed={mouseSensitivity.rotate}
          dollySpeed={0}
          dollyToCursor={false}
          infinityDolly={true}
        />

        {/* Real-time Interstellar Flight Engine (Traverse gaps between solar systems) */}
        <InterstellarNavigator cameraControlRef={cameraControlRef} flyTo={flyTo} />

        {/* 360° Free of Motion Scroll Navigator with Dynamic User Speed */}
        <CosmicFlightNavigator 
          cameraControlRef={cameraControlRef} 
          scrollSpeed={mouseSensitivity.scroll} 
        />

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
          <span>Scale: Level {telemetry.progress} of 9</span>
          <span>Distance: {telemetry.dist.toLocaleString()} AU/units</span>
        </div>

        {/* 9-Level Progress Bar */}
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ 
            width: `${(telemetry.progress / 9) * 100}%`, 
            height: "100%", 
            background: telemetry.color,
            transition: "width 0.4s ease, background 0.4s ease"
          }} />
        </div>
      </div>

      {/* Top Right Header Controls & Direct Black Hole Warp Button */}
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 10, zIndex: 100 }}>
        <button
          onClick={() => {
            flyTo([150000, 60000, -520000], 65000)
            setBlackHoleTarget({
              title: "M87: Post-Milky Way Relativistic Singularity",
              subtitle: "Virgo Sector • 550,000 AU Beyond Milky Way • Raymarched Null Geodesics"
            })
          }}
          style={{
            background: "linear-gradient(135deg, rgba(255, 110, 0, 0.45), rgba(255, 0, 80, 0.45))",
            backdropFilter: "blur(16px)",
            border: "1.5px solid #ff7700",
            color: "#ffcc66",
            padding: "8px 16px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.03em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 0 20px rgba(255, 110, 0, 0.6)",
            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)"
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 120, 20, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 110, 0, 0.6)"
          }}
          title="Fly directly to the WebGPU Relativistic Black Hole past the Milky Way"
        >
          <span style={{ fontSize: 16 }}>🌀</span>
          <span>Post-Milky Way Black Hole</span>
        </button>

        <button
          onClick={() => {
            flyToNameMonument()
          }}
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.45), rgba(94, 234, 212, 0.45))",
            backdropFilter: "blur(16px)",
            border: "1.5px solid #a78bfa",
            color: "#e0e7ff",
            padding: "8px 16px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.03em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 0 20px rgba(167, 139, 250, 0.6)",
            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)"
            e.currentTarget.style.boxShadow = "0 0 30px rgba(167, 139, 250, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(167, 139, 250, 0.6)"
          }}
          title="Fly directly to 3D Subbareddy Palagiri Celestial Monument"
        >
          <span style={{ fontSize: 16 }}>👑</span>
          <span>Name Monument</span>
        </button>

        <button
          onClick={() => {
            flyToSkillWeb()
          }}
          style={{
            background: "linear-gradient(135deg, rgba(0, 240, 255, 0.4), rgba(180, 50, 255, 0.4))",
            backdropFilter: "blur(16px)",
            border: "1.5px solid #00f0ff",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.03em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.6)",
            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)"
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 240, 255, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.6)"
          }}
          title="Fly directly to Subbareddy 3D Cosmic Skill Web outside the Milky Way"
        >
          <span style={{ fontSize: 16 }}>🕸️</span>
          <span>Cosmic Skill Web</span>
        </button>

        <button
          onClick={() => {
            flyToPrimeRealm()
          }}
          style={{
            background: "linear-gradient(135deg, rgba(255, 183, 3, 0.4), rgba(255, 45, 85, 0.4))",
            backdropFilter: "blur(16px)",
            border: "1.5px solid #ffb703",
            color: "#ffe066",
            padding: "8px 16px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.03em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 0 20px rgba(255, 183, 3, 0.6)",
            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)"
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 183, 3, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 183, 3, 0.6)"
          }}
          title="Fly directly to 13 Projects Orbit in the Prime Cosmic Realm"
        >
          <span style={{ fontSize: 16 }}>🪐</span>
          <span>Prime Realm Projects</span>
        </button>

        <button
          onClick={() => setIsSpeedModalOpen(!isSpeedModalOpen)}
          style={{
            background: isSpeedModalOpen
              ? "linear-gradient(135deg, rgba(0, 216, 255, 0.35), rgba(56, 189, 248, 0.35))"
              : "rgba(5, 10, 25, 0.82)",
            backdropFilter: "blur(16px)",
            border: `1.5px solid ${isSpeedModalOpen ? "#38bdf8" : "rgba(56, 189, 248, 0.5)"}`,
            color: isSpeedModalOpen ? "#ffffff" : "#38bdf8",
            padding: "8px 14px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: isSpeedModalOpen
              ? "0 0 25px rgba(56, 189, 248, 0.7)"
              : "0 4px 15px rgba(0, 216, 255, 0.2)",
            transition: "all 0.25s ease"
          }}
          title="Adjust Mouse Scroll & Look Flight Speed"
        >
          <span style={{ fontSize: 14 }}>🖱️</span>
          <span>Speed: {mouseSensitivity.scroll.toFixed(1)}x ▾</span>
        </button>

        {!isMenuOpen && (
          <button
            onClick={() => setIsMenuOpen(true)}
            style={{
              background: "rgba(5, 10, 25, 0.82)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0, 216, 255, 0.5)",
              color: "#00d8ff",
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
              transition: "all 0.25s ease"
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
        )}
      </div>

      {/* Quick Mouse Sensitivity Adjustment Popover */}
      {isSpeedModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 72,
            right: isMenuOpen ? 410 : 20,
            width: 320,
            background: "rgba(5, 10, 25, 0.95)",
            border: "1.5px solid #38bdf8",
            borderRadius: 16,
            padding: "16px 18px",
            backdropFilter: "blur(24px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.85), 0 0 30px rgba(56, 189, 248, 0.35)",
            color: "#e2e8f0",
            fontFamily: "system-ui, -apple-system, sans-serif",
            zIndex: 110,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🖱️</span>
              <b style={{ color: "#38bdf8", fontSize: 13 }}>Mouse & Flight Speed</b>
            </div>
            <button
              onClick={() => setIsSpeedModalOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: "#94a3b8",
                padding: "2px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 11
              }}
            >
              ✕ Done
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6, fontWeight: 700, letterSpacing: "0.04em" }}>
              SPEED PRESETS:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {[
                { label: "🐢 Smooth", scroll: 0.35, rotate: 0.4 },
                { label: "👌 Balanced", scroll: 0.6, rotate: 0.6 },
                { label: "⚡ Fast", scroll: 1.2, rotate: 1.0 }
              ].map((p) => {
                const isSelected = Math.abs(mouseSensitivity.scroll - p.scroll) < 0.05
                return (
                  <button
                    key={p.label}
                    onClick={() => updateSensitivity({ scroll: p.scroll, rotate: p.rotate })}
                    style={{
                      background: isSelected ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.06)",
                      border: `1px solid ${isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.15)"}`,
                      color: isSelected ? "#38bdf8" : "#cbd5e1",
                      padding: "5px 6px",
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slider 1: Scroll Flight Speed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span>🚀 Scroll Flight Speed:</span>
              <b style={{ color: "#38bdf8" }}>{mouseSensitivity.scroll.toFixed(2)}x</b>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.05"
              value={mouseSensitivity.scroll}
              onChange={(e) => {
                updateSensitivity({ ...mouseSensitivity, scroll: parseFloat(e.target.value) })
              }}
              style={{
                width: "100%",
                accentColor: "#38bdf8",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748b" }}>
              <span>0.1x (Fine)</span>
              <span>1.0x (Standard)</span>
              <span>2.5x (Speed)</span>
            </div>
          </div>

          {/* Slider 2: Mouse Look / Drag Rotation Speed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span>🔄 Look & Drag Speed:</span>
              <b style={{ color: "#38bdf8" }}>{mouseSensitivity.rotate.toFixed(2)}x</b>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={mouseSensitivity.rotate}
              onChange={(e) => {
                updateSensitivity({ ...mouseSensitivity, rotate: parseFloat(e.target.value) })
              }}
              style={{
                width: "100%",
                accentColor: "#38bdf8",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748b" }}>
              <span>0.1x (Gentle)</span>
              <span>1.0x (Standard)</span>
              <span>2.0x (Swift)</span>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
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

          {/* Mouse & Flight Sensitivity Controls inside Menu */}
          <div style={{
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <b style={{ color: "#38bdf8", fontSize: 10, letterSpacing: "0.04em" }}>🖱️ MOUSE & FLIGHT SPEED ADJUST:</b>
              <span style={{ fontSize: 9, color: "#94a3b8" }}>{mouseSensitivity.scroll.toFixed(2)}x</span>
            </div>

            {/* Presets */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
              {[
                { label: "🐢 Smooth (0.35x)", scroll: 0.35, rotate: 0.4 },
                { label: "👌 Balanced (0.6x)", scroll: 0.6, rotate: 0.6 },
                { label: "⚡ Fast (1.2x)", scroll: 1.2, rotate: 1.0 }
              ].map((p) => {
                const isSelected = Math.abs(mouseSensitivity.scroll - p.scroll) < 0.05
                return (
                  <button
                    key={p.label}
                    onClick={() => updateSensitivity({ scroll: p.scroll, rotate: p.rotate })}
                    style={{
                      background: isSelected ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.06)",
                      border: `1px solid ${isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.15)"}`,
                      color: isSelected ? "#38bdf8" : "#cbd5e1",
                      padding: "4px 4px",
                      borderRadius: 6,
                      fontSize: 8.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Scroll speed slider */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "#cbd5e1", marginBottom: 2 }}>
                <span>🚀 Scroll Flight Speed:</span>
                <b style={{ color: "#38bdf8" }}>{mouseSensitivity.scroll.toFixed(2)}x</b>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={mouseSensitivity.scroll}
                onChange={(e) => {
                  updateSensitivity({ ...mouseSensitivity, scroll: parseFloat(e.target.value) })
                }}
                style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer", height: 4 }}
              />
            </div>

            {/* Rotation speed slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "#cbd5e1", marginBottom: 2 }}>
                <span>🔄 Look & Drag Speed:</span>
                <b style={{ color: "#38bdf8" }}>{mouseSensitivity.rotate.toFixed(2)}x</b>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={mouseSensitivity.rotate}
                onChange={(e) => {
                  updateSensitivity({ ...mouseSensitivity, rotate: parseFloat(e.target.value) })
                }}
                style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer", height: 4 }}
              />
            </div>
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
                flyToNameMonument()
              }}
              style={{
                background: "linear-gradient(135deg, rgba(94, 234, 212, 0.35), rgba(139, 92, 246, 0.35))",
                border: "1px solid #5eead4",
                color: "#5eead4",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(94, 234, 212, 0.4)",
                transition: "all 0.2s ease"
              }}
              title="Fly directly to 3D Subbareddy Palagiri Monument"
            >
              👑 Name Monument
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
              onClick={() => flyTo([0, 9000000, 26000000], 26000000)}
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
              onClick={() => flyTo([-35000, 4200, 48000], 18000)}
              style={{
                background: "linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(255, 136, 204, 0.25))",
                border: "1px solid #00e5ff",
                color: "#00e5ff",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0, 229, 255, 0.3)",
                transition: "all 0.2s ease"
              }}
              title="Warp to Emu in the Sky 3D Constellation"
            >
              🦤 Emu in Sky
            </button>
            <button
              onClick={() => {
                flyTo([-620000, 190000, 540000], 40 * 250)
                setBlackHoleTarget({
                  title: "M87: Post-Milky Way Relativistic Black Hole",
                  subtitle: "Virgo Supercluster • 620,000 AU Beyond Milky Way • Raymarched Null Geodesics"
                })
              }}
              style={{
                background: "linear-gradient(135deg, rgba(255, 119, 0, 0.3), rgba(255, 40, 0, 0.2))",
                border: "1px solid #ff8800",
                color: "#ffaa44",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(255, 120, 20, 0.35)",
                transition: "all 0.2s ease"
              }}
              title="Warp directly to M87 Relativistic Black Hole past Milky Way"
            >
              🌀 M87 Black Hole
            </button>
            <button
              onClick={() => setIsPortalOpen(true)}
              style={{
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
            <button
              onClick={() => flyTo([110000, 32000, -180000], 12000, 0.45)}
              style={{
                background: "linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(180, 50, 255, 0.3))",
                border: "1px solid #00f0ff",
                color: "#ffffff",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0, 240, 255, 0.4)",
                transition: "all 0.2s ease"
              }}
              title="Warp directly to Subbareddy 3D Cosmic Skill Web outside the Milky Way"
            >
              🕸️ Skill Web
            </button>
          </div>

          {/* 9 Planets Quick Warp List */}
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <b style={{ color: "#38bdf8", fontSize: 10, letterSpacing: "0.06em" }}>WARP CLOSE-UP TO 9 PLANETS (SOL SYSTEM):</b>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, maxHeight: 110, overflowY: "auto" }}>
              {SOL_PLANETS.map((planet) => (
                <button
                  key={planet.name}
                  onClick={() => {
                    flyTo(planet.pos, Math.max(planet.radius * 2.2, 1.6), 0.6)
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${planet.color}77`,
                    color: planet.color,
                    padding: "4px 5px",
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "all 0.2s ease"
                  }}
                  title={`Fly directly up-close to ${planet.name}`}
                >
                  {planet.symbol} {planet.name}
                </button>
              ))}
            </div>
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
            <button
              onClick={() => {
                if (cameraControlRef.current) {
                  cameraControlRef.current.setLookAt(
                    -8200000000, -1100000000 + 400000000, 3900000000 + 800000000,
                    -8200000000, -1100000000, 3900000000,
                    true
                  )
                }
              }}
              style={{
                width: "100%",
                marginTop: 5,
                marginBottom: 6,
                background: "linear-gradient(90deg, rgba(255, 0, 170, 0.3), rgba(0, 255, 255, 0.3))",
                border: "1px solid #ff00aa",
                color: "#ff88dd",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 0 10px rgba(255, 0, 170, 0.3)",
                transition: "all 0.2s ease"
              }}
              title="Warp directly inside the 8K Alien Space Nebula Realm"
            >
              🌌 Warp Inside 8K Alien Space Nebula Realm
            </button>
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

          {/* 10 Satellite & Plane Orbital Networks Warp List */}
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <b style={{ color: "#38bdf8", fontSize: 10, letterSpacing: "0.06em" }}>WARP TO 10 SATELLITE & PLANE NETWORKS:</b>
            <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 110, overflowY: "auto" }}>
              {SATELLITE_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => flyTo(hub.pos, hub.scale * 12)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${hub.colors.routes}66`,
                    color: hub.colors.routes,
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
                  title={`${hub.name} (${hub.sector})`}
                >
                  🛰️ {hub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Level 7: 13 Project Planets Orbit in Prime Cosmic Realm */}
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <b style={{ color: "#ffe066", fontSize: 10, letterSpacing: "0.06em" }}>🪐 PRIME REALM: 13 PROJECT PLANETS ORBIT:</b>
              <span style={{ fontSize: 9, color: "#94a3b8" }}>Level 7</span>
            </div>

            <button
              onClick={() => {
                flyToPrimeRealm()
              }}
              style={{
                width: "100%",
                marginBottom: 6,
                background: "linear-gradient(135deg, rgba(255, 183, 3, 0.3), rgba(255, 45, 85, 0.3))",
                border: "1px solid #ffb703",
                color: "#ffe066",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 0 12px rgba(255, 183, 3, 0.4)",
                transition: "all 0.2s ease"
              }}
              title="Warp directly to 13 Projects Orbit with 3D Voxel Monument"
            >
              🪐 Warp to All 13 Projects Orbit
            </button>

            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 130, overflowY: "auto" }}>
              {PRIME_PROJECTS.map((p, idx) => {
                const isTopRow = idx < 7
                const rowIndex = isTopRow ? idx : idx - 7
                const rowCount = isTopRow ? 7 : PRIME_PROJECTS.length - 7
                const x = (rowIndex - (rowCount - 1) / 2) * 22.0
                const baseY = isTopRow ? 22.0 / 2 : -22.0 / 2
                const worldPos = [x * 650000, 180000000 + baseY * 650000, 680000000]
                const glowHex = "#" + new THREE.Color(p.colorC).getHexString()

                return (
                  <button
                    key={p.name}
                    onClick={() => {
                      setActivePrimePlanet(p)
                      flyTo(worldPos, 4.0 * 650000 * 2.8, 0.45)
                    }}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${glowHex}77`,
                      color: glowHex,
                      padding: "5px 6px",
                      borderRadius: 6,
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 5
                    }}
                    title={`Fly to ${p.name} (${p.style})`}
                  >
                    <span style={{ fontSize: 10 }}>🪐</span>
                    <span>{p.name}</span>
                  </button>
                )
              })}
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

      {/* Live Floating Observation Window When Past the Milky Way (Level 3+) */}
      {telemetry.progress >= 3 && !isBlackHoleModalOpen && !isPortalOpen && !isPIPClosed && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 380,
            height: 280,
            background: "rgba(5, 10, 25, 0.92)",
            border: "1.5px solid #ff7700",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8), 0 0 30px rgba(255, 110, 20, 0.5)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 90,
            transition: "all 0.3s ease"
          }}
        >
          {/* Header Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "rgba(20, 10, 5, 0.85)",
            borderBottom: "1px solid rgba(255, 120, 20, 0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ff7700",
                boxShadow: "0 0 8px #ff7700"
              }} />
              <b style={{ color: "#ffaa44", fontSize: 11, letterSpacing: "0.5px" }}>
                LIVE: POST-MILKY WAY BLACK HOLE
              </b>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => {
                  flyTo([150000, 60000, -520000], 120000)
                }}
                style={{
                  background: "rgba(0, 229, 255, 0.2)",
                  border: "1px solid rgba(0, 229, 255, 0.6)",
                  color: "#00e5ff",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 10,
                  cursor: "pointer",
                  fontWeight: 700
                }}
                title="Warp camera directly in front of this black hole in 3D"
              >
                🛸 Warp
              </button>
              <button
                onClick={() => setIsBlackHoleModalOpen(true)}
                style={{
                  background: "rgba(255, 140, 40, 0.25)",
                  border: "1px solid rgba(255, 140, 40, 0.6)",
                  color: "#ffcc66",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 10,
                  cursor: "pointer",
                  fontWeight: 700
                }}
                title="Open full-screen WebGPU simulation"
              >
                ⛶ Expand
              </button>
              <button
                onClick={() => setIsPIPClosed(true)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#aaa",
                  padding: "2px 6px",
                  borderRadius: 6,
                  fontSize: 10,
                  cursor: "pointer"
                }}
                title="Minimize window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Live WebGPU Canvas */}
          <div style={{ flex: 1, position: "relative" }}>
            <RelativisticBlackHole
              title="M87: Post-Milky Way Singularity"
              subtitle="Drag to orbit • Relativistic Doppler beaming"
              isFullscreen={false}
            />
          </div>
        </div>
      )}

      {/* Floating Reopen Badge if minimized */}
      {telemetry.progress >= 3 && !isBlackHoleModalOpen && isPIPClosed && (
        <button
          onClick={() => setIsPIPClosed(false)}
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            background: "rgba(10, 15, 30, 0.9)",
            border: "1.5px solid #ff7700",
            color: "#ffaa44",
            padding: "10px 16px",
            borderRadius: 24,
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 20px rgba(255, 110, 20, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 800,
            zIndex: 90
          }}
        >
          <span>🌀</span>
          <span>Open Black Hole Monitor</span>
        </button>
      )}

      {/* Full-Screen / Modal Interactive WebGPU Relativistic Black Hole Viewer */}
      {isBlackHoleModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(24px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{ width: "94vw", height: "90vh", maxWidth: "1400px", maxHeight: "900px" }}>
            <RelativisticBlackHole
              title={blackHoleTarget.title}
              subtitle={blackHoleTarget.subtitle}
              isFullscreen={false}
              onClose={() => setIsBlackHoleModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Prime Cosmic Realm (Level 7) - 6 Layout Modes Switcher */}
      {!isMenuOpen && (telemetry.progress === 7 || activePrimePlanet !== null) && (
        <div
          style={{
            position: "fixed",
            top: 75,
            right: 22,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            zIndex: 95
          }}
        >
          <div style={{
            color: "#ffb703",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textAlign: "right",
            marginBottom: 2,
            textShadow: "0 0 10px rgba(255, 183, 3, 0.6)"
          }}>
            🪐 13 PROJECTS ORBIT
          </div>
          {[
            { mode: "rows", label: "1 · ROWS" },
            { mode: "solar", label: "2 · SOLAR" },
            { mode: "shuffle", label: "3 · SHUFFLE" },
            { mode: "spiral", label: "4 · SPIRAL" },
            { mode: "rings", label: "5 · RINGS" },
            { mode: "vn", label: "6 · V/N" }
          ].map(({ mode, label }) => {
            const isActive = primeLayoutMode === mode
            return (
              <button
                key={mode}
                onClick={() => setPrimeLayoutMode(mode)}
                style={{
                  background: isActive ? "rgba(255,183,3,0.22)" : "rgba(10,12,20,0.85)",
                  border: `1.5px solid ${isActive ? "#ffb703" : "rgba(124,136,166,0.35)"}`,
                  color: isActive ? "#ffb703" : "#9aa5c4",
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: "0.05em",
                  padding: "7px 14px",
                  borderRadius: 7,
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                  transition: "all .2s ease",
                  textAlign: "right",
                  fontFamily: "inherit",
                  boxShadow: isActive ? "0 0 15px rgba(255,183,3,0.4)" : "none"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#ffe066"
                    e.currentTarget.style.borderColor = "rgba(255,183,3,0.5)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#9aa5c4"
                    e.currentTarget.style.borderColor = "rgba(124,136,166,0.35)"
                  }
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* Active Prime Planet Project Card HUD */}
      {activePrimePlanet && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(5, 10, 25, 0.94)",
            border: "1.5px solid #ffb703",
            borderRadius: 16,
            padding: "16px 22px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.85), 0 0 30px rgba(255, 183, 3, 0.35)",
            backdropFilter: "blur(20px)",
            color: "#e2e8f0",
            fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            zIndex: 96,
            minWidth: 320,
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🪐</span>
              <b style={{ fontSize: 14, color: "#ffe066", letterSpacing: "0.06em" }}>
                {activePrimePlanet.name}
              </b>
            </div>
            <button
              onClick={() => setActivePrimePlanet(null)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#94a3b8",
                padding: "2px 8px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.5 }}>
            <b>Classification:</b> {activePrimePlanet.style.toUpperCase()} PLANETARY BODY<br />
            <b>Atmosphere:</b> Procedural resonance & volumetric glow<br />
            <b>Rings:</b> {activePrimePlanet.ring ? "Active planetary accretion disk" : "None"}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {activePrimePlanet.url && activePrimePlanet.url !== "#" ? (
              <a
                href={activePrimePlanet.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #ffb703, #ff6a00)",
                  color: "#050506",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "none",
                  textAlign: "center",
                  boxShadow: "0 0 15px rgba(255, 183, 3, 0.6)",
                  transition: "all 0.2s ease"
                }}
              >
                🚀 Open Project ↗
              </a>
            ) : (
              <a
                href="https://github.com/subbareddypalagiri"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #ffb703, #ff6a00)",
                  color: "#050506",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "none",
                  textAlign: "center",
                  boxShadow: "0 0 15px rgba(255, 183, 3, 0.6)",
                  transition: "all 0.2s ease"
                }}
              >
                🐙 View on GitHub ↗
              </a>
            )}

            <button
              onClick={() => {
                const idx = PRIME_PROJECTS.findIndex(p => p.name === activePrimePlanet.name)
                if (idx !== -1) {
                  const isTopRow = idx < 7
                  const rowIndex = isTopRow ? idx : idx - 7
                  const rowCount = isTopRow ? 7 : PRIME_PROJECTS.length - 7
                  const x = (rowIndex - (rowCount - 1) / 2) * 22.0
                  const baseY = isTopRow ? 22.0 / 2 : -22.0 / 2
                  const worldPos = [x * 650000, 180000000 + baseY * 650000, 680000000]
                  flyTo(worldPos, 4.0 * 650000 * 2.8, 0.45)
                }
              }}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#e2e8f0",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              🔭 Focus
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
