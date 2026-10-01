import { Canvas, useFrame } from "@react-three/fiber"
import { Stars, CameraControls, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { Suspense, useRef, useState, useEffect } from "react"
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
import CelestialRealmPortal from "./CelestialRealmPortal"
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
import {
  IconRocket,
  IconRadar,
  IconBolt,
  IconDatabase,
  IconAnalytics,
  IconGear,
  IconCelestial,
  IconBlackHole,
  IconMonument,
  IconSkills,
  IconProjects,
  IconCompass,
  IconClose,
  IconExternalLink,
  IconTarget,
  IconSatellite,
  IconGlobe,
  IconEye,
  IconCheck,
  MiniTacticalRadar,
  OBSIDIAN_TOKENS
} from "./ObsidianStealthUI"


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
  const [isCelestialPortalOpen, setIsCelestialPortalOpen] = useState(false)
  const [celestialInitialPart, setCelestialInitialPart] = useState("hands")
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

  // Natural scroll into Celestial Realm at Level 9 Horizon of Infinity
  useEffect(() => {
    const handleGlobalWheel = (e) => {
      if (telemetry.progress === 9 && !isCelestialPortalOpen && !isPortalOpen && !isBlackHoleModalOpen) {
        if (e.deltaY > 60) {
          setCelestialInitialPart("hands")
          setIsCelestialPortalOpen(true)
        }
      }
    }
    window.addEventListener("wheel", handleGlobalWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleGlobalWheel)
  }, [telemetry.progress, isCelestialPortalOpen, isPortalOpen, isBlackHoleModalOpen])

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
      
      {/* Top Left: Obsidian Stealth Tactical Telemetry HUD */}
      <div style={{ 
        position: "absolute", 
        top: 20, 
        left: 20, 
        color: "#f8fafc", 
        fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace", 
        background: "rgba(10, 12, 18, 0.90)", 
        padding: "12px 18px", 
        borderRadius: 14, 
        backdropFilter: "blur(20px)", 
        border: "1px solid rgba(245, 180, 50, 0.32)",
        boxShadow: "0 14px 35px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px rgba(245, 180, 50, 0.12)",
        maxWidth: 340,
        pointerEvents: "none",
        transition: "all 0.3s ease",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 14
      }}>
        {/* Animated Tactical Radar Scanner */}
        <MiniTacticalRadar size={46} pingColor="#f5b032" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", color: "#f5b032" }}>
              TACTICAL TELEMETRY
            </span>
            <span style={{ fontSize: 8.5, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              LOCK
            </span>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            LVL {telemetry.progress} · {telemetry.level.replace(/LEVEL \d+:\s*/, "")}
          </div>

          <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
            <span>RANGE:</span>
            <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{telemetry.dist.toLocaleString()} AU</span>
          </div>

          {/* Sleek 2px Golden-Amber Progress Bar */}
          <div style={{ width: "100%", height: 2.5, background: "rgba(255,255,255,0.12)", borderRadius: 2, marginTop: 7, overflow: "hidden" }}>
            <div style={{ 
              width: `${(telemetry.progress / 9) * 100}%`, 
              height: "100%", 
              background: "linear-gradient(90deg, #f5b032, #ff8400)",
              boxShadow: "0 0 8px #f5b032",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>
      </div>

      {/* Top Right: Obsidian Stealth Aerospace Navigation Dock */}
      <div style={{ 
        position: "absolute", 
        top: 20, 
        right: 20, 
        display: "flex", 
        alignItems: "center", 
        gap: 6, 
        zIndex: 100,
        background: "rgba(10, 12, 18, 0.90)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(245, 180, 50, 0.32)",
        borderRadius: 30,
        padding: "4px 8px",
        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 18px rgba(245, 180, 50, 0.12)",
        fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
      }}>
        {/* 1. Celestial Realm (Active Highlighted Gold Pill) */}
        <button
          onClick={() => {
            setCelestialInitialPart("hands")
            setIsCelestialPortalOpen(true)
          }}
          style={{
            background: "rgba(245, 176, 50, 0.18)",
            border: "1px solid rgba(245, 176, 50, 0.5)",
            color: "#f5b032",
            padding: "6px 12px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.04em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 0 12px rgba(245, 176, 50, 0.25)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)"
            e.currentTarget.style.boxShadow = "0 0 18px rgba(245, 176, 50, 0.5)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 0 12px rgba(245, 176, 50, 0.25)"
          }}
          title="Open Celestial Realm (Helping Hands, UNIX-1, UNIX COMMANDERS)"
        >
          <IconCelestial size={15} color="#f5b032" />
          <span>CELESTIAL</span>
        </button>

        {/* 2. M87 Black Hole */}
        <button
          onClick={() => {
            flyTo([150000, 60000, -520000], 65000)
            setBlackHoleTarget({
              title: "M87: Post-Milky Way Relativistic Singularity",
              subtitle: "Virgo Sector • 550,000 AU Beyond Milky Way • Raymarched Null Geodesics"
            })
          }}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e2e8f0",
            padding: "6px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(251, 146, 60, 0.15)"
            e.currentTarget.style.borderColor = "rgba(251, 146, 60, 0.5)"
            e.currentTarget.style.color = "#fb923c"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
            e.currentTarget.style.color = "#e2e8f0"
            e.currentTarget.style.transform = "translateY(0)"
          }}
          title="Fly to M87 Relativistic Black Hole"
        >
          <IconBlackHole size={15} />
          <span>M87</span>
        </button>

        {/* 3. Name Monument */}
        <button
          onClick={flyToNameMonument}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e2e8f0",
            padding: "6px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(45, 212, 191, 0.15)"
            e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)"
            e.currentTarget.style.color = "#2dd4bf"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
            e.currentTarget.style.color = "#e2e8f0"
            e.currentTarget.style.transform = "translateY(0)"
          }}
          title="Fly to 3D Subbareddy Palagiri Monument"
        >
          <IconMonument size={15} />
          <span>SUBBAREDDY</span>
        </button>

        {/* 4. Cosmic Skill Web */}
        <button
          onClick={flyToSkillWeb}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e2e8f0",
            padding: "6px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56, 189, 248, 0.15)"
            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.5)"
            e.currentTarget.style.color = "#38bdf8"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
            e.currentTarget.style.color = "#e2e8f0"
            e.currentTarget.style.transform = "translateY(0)"
          }}
          title="Fly to 3D Cosmic Skill Web"
        >
          <IconSkills size={15} />
          <span>SKILLS</span>
        </button>

        {/* 5. Prime Realm Projects */}
        <button
          onClick={flyToPrimeRealm}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e2e8f0",
            padding: "6px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)"
            e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.5)"
            e.currentTarget.style.color = "#fbbf24"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
            e.currentTarget.style.color = "#e2e8f0"
            e.currentTarget.style.transform = "translateY(0)"
          }}
          title="Fly to 13 Projects Orbit"
        >
          <IconProjects size={15} />
          <span>PROJECTS</span>
        </button>

        {/* 6. Flight Speed Selector */}
        <button
          onClick={() => setIsSpeedModalOpen(!isSpeedModalOpen)}
          style={{
            background: isSpeedModalOpen ? "rgba(245, 176, 50, 0.2)" : "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${isSpeedModalOpen ? "rgba(245, 176, 50, 0.6)" : "rgba(255, 255, 255, 0.12)"}`,
            color: isSpeedModalOpen ? "#f5b032" : "#94a3b8",
            padding: "6px 9px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease"
          }}
          title="Adjust Flight Speed"
        >
          <IconRocket size={14} />
          <span>{mouseSensitivity.scroll.toFixed(1)}x</span>
        </button>

        {/* 7. Tactical Cosmic Warp Drawer */}
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{
            background: isMenuOpen ? "rgba(245, 176, 50, 0.25)" : "rgba(245, 176, 50, 0.12)",
            border: "1px solid rgba(245, 176, 50, 0.4)",
            color: "#f5b032",
            padding: "6px 12px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245, 176, 50, 0.25)"
            e.currentTarget.style.boxShadow = "0 0 15px rgba(245, 176, 50, 0.4)"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isMenuOpen ? "rgba(245, 176, 50, 0.25)" : "rgba(245, 176, 50, 0.12)"
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.transform = "translateY(0)"
          }}
          title="Open Tactical Flight Controls & Cosmic Warps"
        >
          <IconCompass size={15} color="#f5b032" />
          <span>WARP ▾</span>
        </button>
      </div>

      {/* Quick Mouse Sensitivity Adjustment Popover - Obsidian Stealth Theme */}
      {isSpeedModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 72,
            right: isMenuOpen ? 410 : 20,
            width: 320,
            background: "rgba(10, 12, 18, 0.94)",
            border: "1px solid rgba(245, 180, 50, 0.32)",
            borderRadius: 14,
            padding: "16px 18px",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 20px rgba(245, 180, 50, 0.1)",
            color: "#e2e8f0",
            fontFamily: OBSIDIAN_TOKENS.fontMono,
            zIndex: 110,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IconGear size={15} color="#f5b032" />
              <b style={{ color: "#ffffff", fontSize: 11, letterSpacing: "0.06em" }}>VELOCITY CALIBRATION</b>
            </div>
            <button
              onClick={() => setIsSpeedModalOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#94a3b8",
                padding: "3px 8px",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f5b032"
                e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
              }}
            >
              <IconClose size={10} />
              <span>DONE</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: 9.5, color: "rgba(245, 180, 50, 0.8)", marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em" }}>
              PRESET PROFILES:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {[
                { label: "SMOOTH", scroll: 0.35, rotate: 0.4, icon: <IconCompass size={11} /> },
                { label: "BALANCED", scroll: 0.6, rotate: 0.6, icon: <IconRocket size={11} /> },
                { label: "WARP", scroll: 1.2, rotate: 1.0, icon: <IconBolt size={11} /> }
              ].map((p) => {
                const isSelected = Math.abs(mouseSensitivity.scroll - p.scroll) < 0.05
                return (
                  <button
                    key={p.label}
                    onClick={() => updateSensitivity({ scroll: p.scroll, rotate: p.rotate })}
                    style={{
                      background: isSelected ? "rgba(245, 180, 50, 0.22)" : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${isSelected ? "#f5b032" : "rgba(255, 255, 255, 0.1)"}`,
                      color: isSelected ? "#f5b032" : "#cbd5e1",
                      padding: "6px 6px",
                      borderRadius: 8,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      boxShadow: isSelected ? "0 0 10px rgba(245, 180, 50, 0.3)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slider 1: Scroll Flight Speed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: "#cbd5e1" }}>FLIGHT CRUISE VELOCITY:</span>
              <b style={{ color: "#f5b032" }}>{mouseSensitivity.scroll.toFixed(2)}x</b>
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
                accentColor: "#f5b032",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8.5, color: "#64748b" }}>
              <span>0.1x (FINE)</span>
              <span>1.0x (STD)</span>
              <span>2.5x (HYPER)</span>
            </div>
          </div>

          {/* Slider 2: Mouse Look / Drag Rotation Speed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: "#cbd5e1" }}>ATTITUDE / LOOK SLEW:</span>
              <b style={{ color: "#f5b032" }}>{mouseSensitivity.rotate.toFixed(2)}x</b>
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
                accentColor: "#f5b032",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8.5, color: "#64748b" }}>
              <span>0.1x (GENTLE)</span>
              <span>1.0x (STD)</span>
              <span>2.0x (FAST)</span>
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
          color: "#cbd5e1",
          fontFamily: OBSIDIAN_TOKENS.fontMono,
          background: "rgba(10, 12, 18, 0.94)",
          padding: "16px 18px",
          borderRadius: 14,
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(245, 180, 50, 0.32)",
          fontSize: 11,
          lineHeight: 1.5,
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 24px rgba(245, 180, 50, 0.1)",
          zIndex: 100
        }}>
          {/* Header with Close / Minimize Button */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: "1px solid rgba(245, 180, 50, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <IconCompass size={16} color="#f5b032" />
              <b style={{ color: "#ffffff", fontSize: 11, letterSpacing: "0.06em" }}>WARP MATRIX // FLIGHT COMPUTER</b>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#94a3b8",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f5b032"
                e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
              }}
              title="Close menu"
            >
              <IconClose size={10} />
              <span>CLOSE</span>
            </button>
          </div>

          <div style={{ fontSize: 9.5, color: "#94a3b8", marginBottom: 10, lineHeight: 1.5, background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            • <b style={{ color: "#f5b032" }}>Scroll:</b> Continuous zoom & fly past systems<br />
            • <b style={{ color: "#f5b032" }}>W/S/A/D:</b> Cruise void gaps | <b style={{ color: "#f5b032" }}>Shift:</b> Warp boost<br />
            • <b style={{ color: "#f5b032" }}>Drag:</b> 360° Attitude Look | <b style={{ color: "#f5b032" }}>Click:</b> Target fly to system
          </div>

          {/* Mouse & Flight Sensitivity Controls inside Menu */}
          <div style={{
            background: "rgba(245, 180, 50, 0.05)",
            border: "1px solid rgba(245, 180, 50, 0.2)",
            borderRadius: 8,
            padding: "8px 10px",
            marginBottom: 10
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <IconGear size={12} color="#f5b032" />
                <b style={{ color: "#f5b032", fontSize: 9.5, letterSpacing: "0.06em" }}>VELOCITY SENSITIVITY:</b>
              </div>
              <span style={{ fontSize: 9, color: "#f5b032", fontWeight: 700 }}>{mouseSensitivity.scroll.toFixed(2)}x</span>
            </div>

            {/* Presets */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
              {[
                { label: "SMOOTH (0.35x)", scroll: 0.35, rotate: 0.4 },
                { label: "BALANCED (0.6x)", scroll: 0.6, rotate: 0.6 },
                { label: "WARP (1.2x)", scroll: 1.2, rotate: 1.0 }
              ].map((p) => {
                const isSelected = Math.abs(mouseSensitivity.scroll - p.scroll) < 0.05
                return (
                  <button
                    key={p.label}
                    onClick={() => updateSensitivity({ scroll: p.scroll, rotate: p.rotate })}
                    style={{
                      background: isSelected ? "rgba(245, 180, 50, 0.22)" : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${isSelected ? "#f5b032" : "rgba(255, 255, 255, 0.1)"}`,
                      color: isSelected ? "#f5b032" : "#cbd5e1",
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
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#cbd5e1", marginBottom: 2 }}>
                <span>SCROLL VELOCITY:</span>
                <b style={{ color: "#f5b032" }}>{mouseSensitivity.scroll.toFixed(2)}x</b>
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
                style={{ width: "100%", accentColor: "#f5b032", cursor: "pointer", height: 4 }}
              />
            </div>

            {/* Rotation speed slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#cbd5e1", marginBottom: 2 }}>
                <span>ATTITUDE SLEW:</span>
                <b style={{ color: "#f5b032" }}>{mouseSensitivity.rotate.toFixed(2)}x</b>
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
                style={{ width: "100%", accentColor: "#f5b032", cursor: "pointer", height: 4 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            <button
              onClick={() => flyTo([0, 20, 45], 25)}
              style={{
                background: "rgba(245, 180, 50, 0.12)",
                border: "1px solid rgba(245, 180, 50, 0.45)",
                color: "#f5b032",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s ease"
              }}
            >
              <IconRocket size={12} color="#f5b032" />
              <span>RETURN TO SOL (R)</span>
            </button>
            <button
              onClick={() => {
                flyToNameMonument()
              }}
              style={{
                background: "linear-gradient(135deg, rgba(94, 234, 212, 0.25), rgba(139, 92, 246, 0.25))",
                border: "1px solid #5eead4",
                color: "#5eead4",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 0 10px rgba(94, 234, 212, 0.25)",
                transition: "all 0.2s ease"
              }}
              title="Fly directly to 3D Subbareddy Palagiri Monument"
            >
              <IconMonument size={12} color="#5eead4" />
              <span>NAME MONUMENT</span>
            </button>
            <button
              onClick={() => flyTo([0, 25000, 140000], 140000)}
              style={{
                background: "rgba(170, 102, 255, 0.14)",
                border: "1px solid rgba(170, 102, 255, 0.5)",
                color: "#aa66ff",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s ease"
              }}
            >
              <IconGlobe size={12} color="#aa66ff" />
              <span>GALAXY VIEW</span>
            </button>
            <button
              onClick={() => flyTo([0, 9000000, 26000000], 26000000)}
              style={{
                background: "rgba(255, 68, 170, 0.14)",
                border: "1px solid rgba(255, 68, 170, 0.5)",
                color: "#ff44aa",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s ease"
              }}
            >
              <IconCelestial size={12} color="#ff44aa" />
              <span>MULTIVERSE</span>
            </button>
            <button
              onClick={() => {
                if (cameraControlRef.current) {
                  cameraControlRef.current.setLookAt(0, 9500000000, 26000000000, 0, 0, 0, true)
                }
              }}
              style={{
                background: "rgba(0, 255, 255, 0.14)",
                border: "1px solid rgba(0, 255, 255, 0.5)",
                color: "#00ffff",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s ease"
              }}
            >
              <IconRadar size={12} color="#00ffff" />
              <span>10 SPHERES</span>
            </button>
            <button
              onClick={() => {
                if (cameraControlRef.current) {
                  cameraControlRef.current.setLookAt(0, 11000000000, 32000000000, 0, 0, 0, true)
                }
              }}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                color: "#ffffff",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 0 10px rgba(255,255,255,0.25)"
              }}
            >
              <IconTarget size={12} color="#ffffff" />
              <span>SINGULARITY DOT</span>
            </button>
            <button
              onClick={() => flyTo([-35000, 4200, 48000], 18000)}
              style={{
                background: "linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(255, 136, 204, 0.2))",
                border: "1px solid #00e5ff",
                color: "#00e5ff",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 0 10px rgba(0, 229, 255, 0.2)",
                transition: "all 0.2s ease"
              }}
              title="Warp to Emu in the Sky 3D Constellation"
            >
              <IconEye size={12} color="#00e5ff" />
              <span>EMU IN SKY</span>
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
                background: "linear-gradient(135deg, rgba(255, 119, 0, 0.25), rgba(255, 40, 0, 0.15))",
                border: "1px solid #ff8800",
                color: "#ffaa44",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 0 10px rgba(255, 120, 20, 0.25)",
                transition: "all 0.2s ease"
              }}
              title="Warp directly to M87 Relativistic Black Hole past Milky Way"
            >
              <IconBlackHole size={12} color="#ffaa44" />
              <span>M87 BLACK HOLE</span>
            </button>
            <button
              onClick={() => setIsPortalOpen(true)}
              style={{
                background: "linear-gradient(90deg, rgba(0, 216, 255, 0.25), rgba(255, 0, 234, 0.25))",
                border: "1px solid #00d8ff",
                color: "#00ffff",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 0 10px rgba(0, 216, 255, 0.3)"
              }}
            >
              <IconExternalLink size={12} color="#00ffff" />
              <span>VIDEO PORTAL</span>
            </button>
            <button
              onClick={() => flyTo([110000, 32000, -180000], 12000, 0.45)}
              style={{
                background: "linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(180, 50, 255, 0.25))",
                border: "1px solid #00f0ff",
                color: "#ffffff",
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: 9.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 0 10px rgba(0, 240, 255, 0.3)",
                transition: "all 0.2s ease"
              }}
              title="Warp directly to Subbareddy 3D Cosmic Skill Web outside the Milky Way"
            >
              <IconSkills size={12} color="#ffffff" />
              <span>SKILL WEB</span>
            </button>
          </div>

          {/* 9 Planets Quick Warp List */}
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(245,180,50,0.15)" }}>
            <b style={{ color: "rgba(245,180,50,0.85)", fontSize: 9.5, letterSpacing: "0.08em" }}>SOL SYSTEM PLANETS:</b>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, maxHeight: 110, overflowY: "auto" }}>
              {SOL_PLANETS.map((planet) => (
                <button
                  key={planet.name}
                  onClick={() => {
                    flyTo(planet.pos, Math.max(planet.radius * 2.2, 1.6), 0.6)
                  }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${planet.color}66`,
                    color: planet.color,
                    padding: "4px 6px",
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4
                  }}
                  title={`Fly directly up-close to ${planet.name}`}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: planet.color, display: "inline-block", flexShrink: 0 }} />
                  <span>{planet.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Black Holes Warp List */}
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(245,180,50,0.15)" }}>
            <b style={{ color: "rgba(245,180,50,0.85)", fontSize: 9.5, letterSpacing: "0.08em" }}>RELATIVISTIC BLACK HOLES (10):</b>
            <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 110, overflowY: "auto" }}>
              {BLACK_HOLE_DATA.map((bh) => (
                <button
                  key={bh.id}
                  onClick={() => flyTo(bh.pos, 40 * bh.scale)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${bh.color}45`,
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
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                  title={`${bh.name} (${bh.level})`}
                >
                  <IconBlackHole size={11} color={bh.color} />
                  <span>{bh.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Realms Warp List */}
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(245,180,50,0.15)" }}>
            <b style={{ color: "rgba(245,180,50,0.85)", fontSize: 9.5, letterSpacing: "0.08em" }}>COSMIC REALMS (10 GLB SPHERES):</b>
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
                background: "linear-gradient(90deg, rgba(255, 0, 170, 0.22), rgba(0, 255, 255, 0.22))",
                border: "1px solid #ff00aa",
                color: "#ff88dd",
                padding: "5px 8px",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 0 10px rgba(255, 0, 170, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                transition: "all 0.2s ease"
              }}
              title="Warp directly inside the 8K Alien Space Nebula Realm"
            >
              <IconCelestial size={12} color="#ff88dd" />
              <span>WARP INSIDE 8K ALIEN NEBULA REALM</span>
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
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${realm.c1}66`,
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
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                  title={realm.name}
                >
                  <IconCelestial size={11} color={realm.c1} />
                  <span>{realm.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 10 Satellite & Plane Orbital Networks Warp List */}
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(245,180,50,0.15)" }}>
            <b style={{ color: "rgba(245,180,50,0.85)", fontSize: 9.5, letterSpacing: "0.08em" }}>ORBITAL SATELLITE NETWORKS (10):</b>
            <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, maxHeight: 110, overflowY: "auto" }}>
              {SATELLITE_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => flyTo(hub.pos, hub.scale * 12)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${hub.colors.routes}55`,
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
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                  title={`${hub.name} (${hub.sector})`}
                >
                  <IconSatellite size={11} color={hub.colors.routes} />
                  <span>{hub.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Level 7: 13 Project Planets Orbit in Prime Cosmic Realm */}
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(245,180,50,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <b style={{ color: "#f5b032", fontSize: 9.5, letterSpacing: "0.08em" }}>PRIME REALM // 13 PROJECT PLANETS:</b>
              <span style={{ fontSize: 8.5, color: "#94a3b8", fontWeight: 700 }}>LEVEL 7</span>
            </div>

            <button
              onClick={() => {
                flyToPrimeRealm()
              }}
              style={{
                width: "100%",
                marginBottom: 6,
                background: "linear-gradient(135deg, rgba(245, 180, 50, 0.22), rgba(255, 45, 85, 0.22))",
                border: "1px solid #f5b032",
                color: "#f5b032",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 9.5,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 0 12px rgba(245, 180, 50, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                transition: "all 0.2s ease"
              }}
              title="Warp directly to 13 Projects Orbit with 3D Voxel Monument"
            >
              <IconProjects size={12} color="#f5b032" />
              <span>WARP TO ALL 13 PROJECTS ORBIT</span>
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
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${glowHex}66`,
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
                    <IconProjects size={11} color={glowHex} />
                    <span>{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ultimate Destination: Celestial Realm (Level 9 / Beyond Infinity) */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(245,180,50,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <b style={{ color: "#c084fc", fontSize: 9.5, letterSpacing: "0.08em" }}>CELESTIAL REALM // FINAL HORIZON:</b>
              <span style={{ fontSize: 8.5, color: "#f5b032", fontWeight: 700 }}>LEVEL 9</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr", gap: 5 }}>
              <button
                onClick={() => {
                  setCelestialInitialPart("hands")
                  setIsCelestialPortalOpen(true)
                  setIsMenuOpen(false)
                }}
                style={{
                  background: "rgba(0, 216, 255, 0.15)",
                  border: "1px solid #00d8ff",
                  color: "#ffffff",
                  padding: "6px 4px",
                  borderRadius: 6,
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4
                }}
                title="Helping Hands"
              >
                <IconCelestial size={11} color="#00d8ff" />
                <span>HANDS</span>
              </button>
              <button
                onClick={() => {
                  setCelestialInitialPart("unix-1")
                  setIsCelestialPortalOpen(true)
                  setIsMenuOpen(false)
                }}
                style={{
                  background: "rgba(255, 0, 85, 0.15)",
                  border: "1px solid #ff0055",
                  color: "#ffffff",
                  padding: "6px 4px",
                  borderRadius: 6,
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.2s ease"
                }}
                title="UNIX-1"
              >
                <IconBolt size={11} color="#ff0055" />
                <span>UNIX-1</span>
              </button>
              <button
                onClick={() => {
                  setCelestialInitialPart("commanders")
                  setIsCelestialPortalOpen(true)
                  setIsMenuOpen(false)
                }}
                style={{
                  background: "rgba(168, 85, 247, 0.15)",
                  border: "1px solid #a855f7",
                  color: "#ffffff",
                  padding: "6px 4px",
                  borderRadius: 6,
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.2s ease"
                }}
                title="UNIX COMMANDERS"
              >
                <IconMonument size={11} color="#a855f7" />
                <span>COMMAND</span>
              </button>
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

      {/* Interactive Celestial Realm Portal (Helping Hands, UNIX-1, UNIX COMMANDERS) */}
      <CelestialRealmPortal
        isOpen={isCelestialPortalOpen}
        initialPart={celestialInitialPart}
        onClose={() => setIsCelestialPortalOpen(false)}
      />

      {/* Natural Space Scroll Prompt at Final Horizon: Level 9 Cosmic Singularity */}
      {telemetry.progress === 9 && !isCelestialPortalOpen && (
        <button
          type="button"
          onClick={() => {
            setCelestialInitialPart("hands")
            setIsCelestialPortalOpen(true)
          }}
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10, 12, 18, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(245, 180, 50, 0.45)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 25px rgba(245, 180, 50, 0.25)",
            borderRadius: 30,
            padding: "10px 24px",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 100,
            outline: "none",
            fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1.04)"
            e.currentTarget.style.boxShadow = "0 18px 45px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 180, 50, 0.5)"
            e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.8)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1)"
            e.currentTarget.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 25px rgba(245, 180, 50, 0.25)"
            e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.45)"
          }}
          title="Descend into Celestial Realm: Helping Hands -> UNIX-1 -> UNIX COMMANDERS"
        >
          <IconCelestial size={20} color="#f5b032" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#f5b032" }}>
              THE HORIZON OF INFINITY • CELESTIAL REALM
            </div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              Final Horizon of the Cosmos • Descend into Helping Hands
            </div>
          </div>
          <span style={{ fontSize: 10, background: "rgba(245, 180, 50, 0.15)", border: "1px solid rgba(245, 180, 50, 0.4)", padding: "4px 10px", borderRadius: 14, fontWeight: 800, color: "#f5b032" }}>
            ENTER ▾
          </span>
        </button>
      )}

      {/* Live Floating Observation Window When Past the Milky Way (Level 3+) */}
      {telemetry.progress >= 3 && !isBlackHoleModalOpen && !isPortalOpen && !isCelestialPortalOpen && !isPIPClosed && (
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
                  background: isActive ? "rgba(245, 180, 50, 0.22)" : "rgba(10, 12, 18, 0.88)",
                  border: `1px solid ${isActive ? "#f5b032" : "rgba(245, 180, 50, 0.2)"}`,
                  color: isActive ? "#f5b032" : "#94a3b8",
                  fontSize: 10,
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: "0.08em",
                  padding: "6px 12px",
                  borderRadius: 20,
                  cursor: "pointer",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  transition: "all .2s ease",
                  textAlign: "right",
                  fontFamily: OBSIDIAN_TOKENS.fontMono,
                  boxShadow: isActive ? "0 0 15px rgba(245, 180, 50, 0.35)" : "none"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#f5b032"
                    e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.45)"
                    e.currentTarget.style.background = "rgba(245, 180, 50, 0.1)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#94a3b8"
                    e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.2)"
                    e.currentTarget.style.background = "rgba(10, 12, 18, 0.88)"
                  }
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* Active Prime Planet Project Card HUD - Obsidian Stealth Command Deck */}
      {activePrimePlanet && (
        <div
          style={{
            position: "fixed",
            bottom: 26,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10, 12, 18, 0.92)",
            border: "1px solid rgba(245, 180, 50, 0.32)",
            borderRadius: 14,
            padding: "16px 20px",
            boxShadow: "0 20px 45px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 24px rgba(245, 180, 50, 0.12)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            color: "#e2e8f0",
            fontFamily: OBSIDIAN_TOKENS.fontMono,
            zIndex: 96,
            minWidth: 380,
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          {/* Header Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "rgba(245, 180, 50, 0.14)",
                  border: "1px solid rgba(245, 180, 50, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f5b032"
                }}
              >
                <IconProjects size={14} color="#f5b032" />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 9, color: "rgba(245, 180, 50, 0.75)", letterSpacing: "0.1em", fontWeight: 700 }}>
                  PROJECT STATUS
                </span>
                <b style={{ fontSize: 13, color: "#ffffff", letterSpacing: "0.06em", fontWeight: 800 }}>
                  {activePrimePlanet.name.toUpperCase()}
                </b>
              </div>
            </div>

            {/* Indicator dots & Close */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5b032", boxShadow: "0 0 6px #f5b032" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              </div>
              <button
                onClick={() => setActivePrimePlanet(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f5b032"
                  e.currentTarget.style.borderColor = "rgba(245, 180, 50, 0.4)"
                  e.currentTarget.style.background = "rgba(245, 180, 50, 0.15)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94a3b8"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)"
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                }}
                title="Dismiss Card"
              >
                <IconClose size={12} />
              </button>
            </div>
          </div>

          {/* Thin Glowing Golden Line */}
          <div
            style={{
              height: 2,
              width: "100%",
              background: "linear-gradient(90deg, #f5b032, #f59e0b 60%, rgba(245, 180, 50, 0.15))",
              borderRadius: 2,
              boxShadow: "0 0 8px rgba(245, 180, 50, 0.35)"
            }}
          />

          {/* Monospace Specs Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 12px",
              fontSize: 10,
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: 8,
              padding: "8px 12px"
            }}
          >
            <div>
              <span style={{ color: "rgba(245, 180, 50, 0.7)", letterSpacing: "0.06em" }}>CLASS: </span>
              <b style={{ color: "#ffffff" }}>{activePrimePlanet.style.toUpperCase()} PLANET</b>
            </div>
            <div>
              <span style={{ color: "rgba(245, 180, 50, 0.7)", letterSpacing: "0.06em" }}>ATMOSPHERE: </span>
              <b style={{ color: "#ffffff" }}>{activePrimePlanet.ring ? "ACCRETION RING" : "VOLUMETRIC"}</b>
            </div>
            <div>
              <span style={{ color: "rgba(245, 180, 50, 0.7)", letterSpacing: "0.06em" }}>ORBIT LOCK: </span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>● ACTIVE 100%</span>
            </div>
            <div>
              <span style={{ color: "rgba(245, 180, 50, 0.7)", letterSpacing: "0.06em" }}>SECTOR: </span>
              <span style={{ color: "#94a3b8" }}>PRIME REALM-07</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            {activePrimePlanet.url && activePrimePlanet.url !== "#" ? (
              <a
                href={activePrimePlanet.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1.4,
                  background: "linear-gradient(135deg, rgba(245, 180, 50, 0.22), rgba(245, 180, 50, 0.08))",
                  border: "1px solid rgba(245, 180, 50, 0.55)",
                  color: "#f5b032",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 0 14px rgba(245, 180, 50, 0.25)",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245, 180, 50, 0.32)"
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(245, 180, 50, 0.5)"
                  e.currentTarget.style.color = "#ffffff"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(245, 180, 50, 0.22), rgba(245, 180, 50, 0.08))"
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(245, 180, 50, 0.25)"
                  e.currentTarget.style.color = "#f5b032"
                }}
              >
                <IconExternalLink size={13} color="currentColor" />
                <span>LAUNCH PROJECT ↗</span>
              </a>
            ) : (
              <a
                href="https://github.com/subbareddypalagiri"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1.4,
                  background: "linear-gradient(135deg, rgba(245, 180, 50, 0.22), rgba(245, 180, 50, 0.08))",
                  border: "1px solid rgba(245, 180, 50, 0.55)",
                  color: "#f5b032",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 0 14px rgba(245, 180, 50, 0.25)",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245, 180, 50, 0.32)"
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(245, 180, 50, 0.5)"
                  e.currentTarget.style.color = "#ffffff"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(245, 180, 50, 0.22), rgba(245, 180, 50, 0.08))"
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(245, 180, 50, 0.25)"
                  e.currentTarget.style.color = "#f5b032"
                }}
              >
                <IconExternalLink size={13} color="currentColor" />
                <span>VIEW ON GITHUB ↗</span>
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
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#cbd5e1",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"
                e.currentTarget.style.color = "#ffffff"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                e.currentTarget.style.color = "#cbd5e1"
              }}
            >
              <IconTarget size={13} color="currentColor" />
              <span>FOCUS TARGET</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
