import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

export default function RelativisticBlackHoleGateway({
  position = [150000, 60000, -520000],
  scale = 4200,
  onOpenSimulation,
  flyTo
}) {
  const groupRef = useRef()
  const ringRef = useRef()
  const verticalHaloRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (ringRef.current) ringRef.current.rotation.z = t * 0.12
    if (verticalHaloRef.current) verticalHaloRef.current.rotation.y = t * 0.06

    // Distance visibility: visible right as you leave the Milky Way (dist > 280,000 to 18,000,000 AU)
    const camDist = camera.position.length()
    if (groupRef.current) {
      const isVis = camDist >= 280000 && camDist <= 22000000
      groupRef.current.visible = isVis
    }
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 1. CENTRAL EVENT HORIZON: Pure light-absorbing singularity */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. SUPER-LUMINOUS RELATIVISTIC ACCRETION DISC */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2.3, 0, 0]} raycast={() => null}>
        <ringGeometry args={[22, 110, 64]} />
        <meshBasicMaterial
          color="#ff7700"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. VERTICAL EINSTEIN GRAVITATIONAL LENSING LIGHT ARC */}
      <mesh ref={verticalHaloRef} rotation={[0, Math.PI / 4, 0]} raycast={() => null}>
        <ringGeometry args={[20, 95, 64]} />
        <meshBasicMaterial
          color="#ffaa33"
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. COLOSSAL GRAVITATIONAL DISTORTION HALO */}
      <mesh ref={glowRef} raycast={() => null}>
        <sphereGeometry args={[140, 24, 24]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. INTERACTIVE 3D HOLOGRAPHIC GATEWAY TAG */}
      <Html
        position={[0, 130, 0]}
        center
        distanceFactor={600000}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (onOpenSimulation) onOpenSimulation()
          }}
          style={{
            background: "rgba(5, 10, 30, 0.9)",
            border: "2px solid #ff7700",
            boxShadow: "0 0 35px rgba(255, 120, 20, 0.8), inset 0 0 20px rgba(255, 100, 0, 0.3)",
            padding: "12px 22px",
            borderRadius: 14,
            backdropFilter: "blur(16px)",
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "center",
            transform: "scale(1)",
            transition: "transform 0.2s ease, border-color 0.2s ease",
            userSelect: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)"
            e.currentTarget.style.borderColor = "#ffcc44"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.borderColor = "#ff7700"
          }}
          title="Click to interact with WebGPU Raymarched Relativistic Black Hole"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ff7700",
              boxShadow: "0 0 12px #ff7700",
              animation: "pulse 1.5s infinite"
            }} />
            <b style={{ color: "#ffaa44", letterSpacing: 1.2, fontSize: 14 }}>
              🌀 M87: POST-MILKY WAY BLACK HOLE
            </b>
          </div>
          <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>
            Past Milky Way (Virgo Sector) • Click to Orbit Spacetime
          </div>
          <div style={{
            marginTop: 6,
            display: "inline-block",
            background: "rgba(255, 120, 20, 0.25)",
            border: "1px solid rgba(255, 120, 20, 0.6)",
            color: "#ffcc66",
            padding: "3px 10px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 800
          }}>
            [ ✦ ENTER WEBGPU SIMULATION ✦ ]
          </div>
        </div>
      </Html>
    </group>
  )
}
