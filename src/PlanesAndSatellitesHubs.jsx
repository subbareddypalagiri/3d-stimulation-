import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Html } from "@react-three/drei"
import * as THREE from "three"

export const SATELLITE_HUBS = [
  {
    id: 1,
    name: "Sol Prime Orbital Hub",
    sector: "Earth & Inner Solar System",
    pos: [22, 6, -28],
    scale: 0.85,
    colors: {
      earth: "#0a192f",
      routes: "#00f0ff",
      satellites: "#38bdf8",
      glow: "#00ffff"
    },
    minDist: 0,
    maxDist: 1500,
    rotSpeed: 0.18
  },
  {
    id: 2,
    name: "Kuiper Frontier Outpost",
    sector: "Outer Solar System (Pluto Horizon)",
    pos: [380, 45, -240],
    scale: 4.8,
    colors: {
      earth: "#18181b",
      routes: "#ffffff",
      satellites: "#e0f2fe",
      glow: "#38bdf8"
    },
    minDist: 150,
    maxDist: 6000,
    rotSpeed: 0.14
  },
  {
    id: 3,
    name: "Alpha Centauri Relay",
    sector: "Nearest Star System (0.95 Scale)",
    pos: [640, 95, -310],
    scale: 8.5,
    colors: {
      earth: "#052e16",
      routes: "#10b981",
      satellites: "#6ee7b7",
      glow: "#059669"
    },
    minDist: 300,
    maxDist: 9500,
    rotSpeed: 0.12
  },
  {
    id: 4,
    name: "Sirius Quantum Network",
    sector: "Sirius Stellar Cluster (Electric Blue)",
    pos: [1450, 320, -900],
    scale: 14.0,
    colors: {
      earth: "#2e1065",
      routes: "#c084fc",
      satellites: "#e879f9",
      glow: "#9333ea"
    },
    minDist: 600,
    maxDist: 20000,
    rotSpeed: 0.15
  },
  {
    id: 5,
    name: "Vega Celestial Gateway",
    sector: "Vega System (Blue-White Giant)",
    pos: [-3350, 420, -2420],
    scale: 24.0,
    colors: {
      earth: "#4c0519",
      routes: "#f43f5e",
      satellites: "#fda4af",
      glow: "#e11d48"
    },
    minDist: 1500,
    maxDist: 35000,
    rotSpeed: 0.11
  },
  {
    id: 6,
    name: "Betelgeuse Solar Grid",
    sector: "Red Supergiant Neighborhood",
    pos: [6800, -580, 4850],
    scale: 38.0,
    colors: {
      earth: "#451a03",
      routes: "#f59e0b",
      satellites: "#fef08a",
      glow: "#d97706"
    },
    minDist: 3000,
    maxDist: 55000,
    rotSpeed: 0.1
  },
  {
    id: 7,
    name: "Oort Cloud Deep Beacon",
    sector: "Interstellar Boundary Threshold",
    pos: [-12500, 1800, 14200],
    scale: 85.0,
    colors: {
      earth: "#450a0a",
      routes: "#ef4444",
      satellites: "#fca5a5",
      glow: "#dc2626"
    },
    minDist: 6000,
    maxDist: 110000,
    rotSpeed: 0.08
  },
  {
    id: 8,
    name: "Orion Arm Navigation Relay",
    sector: "Milky Way Spiral Arm Sector",
    pos: [38000, 2800, -42000],
    scale: 240.0,
    colors: {
      earth: "#431407",
      routes: "#fb923c",
      satellites: "#fed7aa",
      glow: "#ea580c"
    },
    minDist: 18000,
    maxDist: 320000,
    rotSpeed: 0.07
  },
  {
    id: 9,
    name: "Galactic Core Nexus",
    sector: "Sagittarius Galactic Core Outer Ring",
    pos: [-75000, 3800, 65000],
    scale: 480.0,
    colors: {
      earth: "#14532d",
      routes: "#84cc16",
      satellites: "#bef264",
      glow: "#65a30d"
    },
    minDist: 35000,
    maxDist: 550000,
    rotSpeed: 0.06
  },
  {
    id: 10,
    name: "Virgo Intergalactic Gateway",
    sector: "Virgo Supercluster Post-Milky Way",
    pos: [140000, 52000, -490000],
    scale: 1300.0,
    colors: {
      earth: "#0c4a6e",
      routes: "#38bdf8",
      satellites: "#bae6fd",
      glow: "#0284c7"
    },
    minDist: 80000,
    maxDist: 4000000,
    rotSpeed: 0.05
  }
]

function SingleSatelliteHub({ hub, originalScene, flyTo }) {
  const groupRef = useRef()
  const modelRef = useRef()

  // Clone scene and apply customized color theme per hub
  const clonedScene = useMemo(() => {
    const clone = originalScene.clone(true)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.raycast = () => null
        if (child.material) {
          const mat = child.material.clone()
          mat.side = THREE.DoubleSide
          mat.transparent = true
          mat.depthWrite = true

          const matName = (mat.name || "").toLowerCase()
          if (matName.includes("earth")) {
            mat.color = new THREE.Color(hub.colors.earth)
            mat.roughness = 0.6
            mat.metalness = 0.2
            if (mat.emissive) {
              mat.emissive = new THREE.Color(hub.colors.earth).multiplyScalar(0.2)
              mat.emissiveIntensity = 0.3
            }
          } else if (matName.includes("route")) {
            // Glowing airline routes
            mat.color = new THREE.Color(hub.colors.routes)
            mat.emissive = new THREE.Color(hub.colors.routes)
            mat.emissiveIntensity = 2.4
            mat.opacity = 0.95
          } else {
            // Satellites & orbit tracks
            mat.color = new THREE.Color(hub.colors.satellites)
            mat.emissive = new THREE.Color(hub.colors.glow)
            mat.emissiveIntensity = 2.8
            mat.opacity = 0.95
          }
          child.material = mat
        }
      }
    })
    return clone
  }, [originalScene, hub.colors])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (modelRef.current) {
      modelRef.current.rotation.y = t * hub.rotSpeed
    }

    if (groupRef.current) {
      const dist = camera.position.distanceTo(new THREE.Vector3(...hub.pos))
      const isVisible = dist >= hub.minDist && dist <= hub.maxDist
      groupRef.current.visible = isVisible
    }
  })

  return (
    <group ref={groupRef} position={hub.pos} scale={[hub.scale, hub.scale, hub.scale]} raycast={() => null}>
      <group ref={modelRef} rotation={[0.32, 0, 0.08]} raycast={() => null}>
        <primitive object={clonedScene} raycast={() => null} />
      </group>

      {/* Atmospheric planetary starlight point glow */}
      <pointLight
        color={hub.colors.glow}
        intensity={hub.scale * 12}
        distance={hub.scale * 45}
        position={[0, 0, 0]}
      />

      {/* Interactive 3D Holographic Label */}
      <Html
        position={[0, hub.scale * 2.2, 0]}
        center
        distanceFactor={hub.scale * 75}
        pointerEvents="none"
        style={{ pointerEvents: "none" }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (flyTo) flyTo(hub.pos, hub.scale * 12)
          }}
          style={{
            pointerEvents: "auto",
            background: "rgba(5, 12, 28, 0.88)",
            border: `1.5px solid ${hub.colors.routes}`,
            boxShadow: `0 0 20px ${hub.colors.glow}66`,
            padding: "6px 14px",
            borderRadius: 10,
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            fontSize: 11,
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "center",
            transform: "scale(1)",
            transition: "all 0.2s ease",
            userSelect: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)"
            e.currentTarget.style.boxShadow = `0 0 28px ${hub.colors.glow}aa`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = `0 0 20px ${hub.colors.glow}66`
          }}
          title={`Click to fly to ${hub.name}`}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: hub.colors.routes,
              boxShadow: `0 0 8px ${hub.colors.routes}`
            }} />
            <b style={{ color: hub.colors.routes, letterSpacing: 0.8 }}>
              {hub.name}
            </b>
          </div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>
            {hub.sector}
          </div>
        </div>
      </Html>
    </group>
  )
}

export default function PlanesAndSatellitesHubs({ flyTo }) {
  const { scene } = useGLTF("/of_planes_and_satellites.glb")

  return (
    <group raycast={() => null}>
      {SATELLITE_HUBS.map((hub) => (
        <SingleSatelliteHub
          key={hub.id}
          hub={hub}
          originalScene={scene}
          flyTo={flyTo}
        />
      ))}
    </group>
  )
}

useGLTF.preload("/of_planes_and_satellites.glb")
