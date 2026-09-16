import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

export default function RelativisticBlackHoleGateway({
  position = [-620000, 190000, 540000],
  scale = 250,
  onOpenSimulation,
  flyTo
}) {
  const groupRef = useRef()
  const ringRef = useRef()
  const ring2Ref = useRef()
  const textRef = useRef()

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (ringRef.current) ringRef.current.rotation.z = t * 0.15
    if (ring2Ref.current) ring2Ref.current.rotation.y = t * 0.08

    // Visibility: Only visible after crossing Milky Way (dist > 350,000 AU)
    const camDist = camera.position.length()
    if (groupRef.current) {
      groupRef.current.visible = camDist >= 350000 && camDist <= 12000000
    }
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Central Event Horizon Sphere */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Relativistic Accretion Ring 1 */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2.3, 0, 0]} raycast={() => null}>
        <ringGeometry args={[22, 95, 64]} />
        <meshBasicMaterial
          color="#ff7700"
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Vertical Einstein Light Arc Ring 2 */}
      <mesh ref={ring2Ref} rotation={[0, Math.PI / 4, 0]} raycast={() => null}>
        <ringGeometry args={[20, 80, 48]} />
        <meshBasicMaterial
          color="#ffbb44"
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Gravitational Glow */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[110, 24, 24]} />
        <meshBasicMaterial
          color="#ff3300"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Interactive 3D Holographic Marker past the Milky Way */}
      <Html
        position={[0, 110, 0]}
        center
        distanceFactor={90000}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (onOpenSimulation) onOpenSimulation()
          }}
          style={{
            background: "rgba(5, 10, 25, 0.85)",
            border: "1px solid #ff9922",
            boxShadow: "0 0 25px rgba(255, 120, 20, 0.6)",
            padding: "8px 16px",
            borderRadius: 12,
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "center",
            transform: "scale(1)",
            transition: "transform 0.2s ease, border-color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)"
            e.currentTarget.style.borderColor = "#ffcc44"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.borderColor = "#ff9922"
          }}
          title="Click to interact with WebGPU Raymarched Black Hole"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff7700",
              boxShadow: "0 0 8px #ff7700"
            }} />
            <b style={{ color: "#ffaa44", letterSpacing: 1 }}>
              M87: RELATIVISTIC BLACK HOLE
            </b>
          </div>
          <div style={{ fontSize: 10, color: "#8899aa", marginTop: 2 }}>
            Past Milky Way (Virgo Sector) • Click to Orbit
          </div>
        </div>
      </Html>
    </group>
  )
}
