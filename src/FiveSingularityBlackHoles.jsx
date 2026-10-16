import React, { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

// 5 Curated Cosmic Singularity Black Holes across diverse scales
export const FIVE_BLACK_HOLES = [
  {
    id: "gargantua",
    name: "Gargantua",
    level: "Solar System Frontier",
    sector: "Kuiper Belt / Oort Cloud",
    position: [16000, 2200, -11000],
    scale: 2400,
    color: "#ff9922", // Deep Burning Amber Gold
    accent: "#ffdd66",
    mass: "100 Million Solar Masses",
    desc: "Interstellar Gateway • Gravitational Lensing & Time Dilation"
  },
  {
    id: "sgra",
    name: "Sagittarius A*",
    level: "Galactic Center",
    sector: "Milky Way Heart",
    position: [-85000, 4200, 72000],
    scale: 4800,
    color: "#a855f7", // Deep Galactic Violet
    accent: "#38bdf8",
    mass: "4.3 Million Solar Masses",
    desc: "Milky Way Supermassive Anchor • 4 Million Sun Gravity Well"
  },
  {
    id: "cygnus",
    name: "Cygnus X-1",
    level: "Orion-Cygnus Arm",
    sector: "Milky Way Spiral Arc",
    position: [98000, -5800, -88000],
    scale: 3600,
    color: "#06b6d4", // Electric Cyan & Ice Blue
    accent: "#a5f3fc",
    mass: "21 Solar Masses",
    desc: "High-Mass Microquasar • Relativistic Polar Plasma Jet"
  },
  {
    id: "m87",
    name: "Messier 87*",
    level: "Virgo Supercluster",
    sector: "Virgo Cluster Core",
    position: [-260000, 85000, 220000],
    scale: 11000,
    color: "#f59e0b", // Pure Hot Blazing Gold
    accent: "#fef08a",
    mass: "6.5 Billion Solar Masses",
    desc: "First Imaged Colossus • 5,000 Light-Year Relativistic Jet"
  },
  {
    id: "centaurus",
    name: "Centaurus A*",
    level: "Intergalactic Filament",
    sector: "Deep Cosmic Void",
    position: [350000, -80000, -290000],
    scale: 8500,
    color: "#ef4444", // Crimson Blood Ruby Flame
    accent: "#fca5a5",
    mass: "55 Million Solar Masses",
    desc: "Deep Void Singularity • Warped Space-Time Filament"
  }
]

// 1. High-Definition Relativistic Accretion Disk Shader
const diskVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const diskFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // High-performance procedural noise
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(cos(0.52), sin(0.52), -sin(0.52), cos(0.52));
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.15;
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);

    // Bounded between ISCO (0.28) and Outer Disk (0.98)
    if (r < 0.26 || r > 0.99) discard;

    float angle = atan(p.y, p.x);

    // Relativistic Keplerian differential speed (inner disk rotates much faster than outer disk)
    float keplerSpeed = 2.4 / pow(max(r, 0.2), 0.85);
    float rotAngle = angle + uTime * keplerSpeed * 0.4;

    // Multi-scale swirling plasma spirals
    vec2 polar = vec2(rotAngle * 6.0, r * 28.0);
    float plasma1 = fbm(polar);
    float plasma2 = noise(vec2(rotAngle * 12.0 - uTime * 1.2, r * 48.0));
    float plasma = pow(plasma1 * 0.72 + plasma2 * 0.28, 1.4);

    // Relativistic Doppler Beaming (approaching side is boosted, receding side is dimmer)
    float doppler = 0.5 + 0.5 * sin(angle);
    float dopplerBoost = pow(doppler, 1.9) * 2.5;

    // Brilliant inner Einstein photon ring spike
    float photonRing = exp(-pow((r - 0.28) * 32.0, 2.0)) * 4.2;

    // Smooth edge blending
    float innerFade = smoothstep(0.26, 0.33, r);
    float outerFade = 1.0 - smoothstep(0.72, 0.99, r);
    float envelope = innerFade * outerFade;

    // Thermal color ramp: Core White-Hot -> Base Color -> Dark Crimson
    vec3 colHot = vec3(1.0, 0.98, 0.94);
    vec3 colMid = uBaseColor;
    vec3 colDark = mix(vec3(0.08, 0.01, 0.01), uAccentColor * 0.25, 0.5);

    vec3 col = mix(colDark, colMid, doppler);
    col = mix(col, colHot, photonRing * 0.9 + plasma * 0.55);

    float intensity = (plasma * 2.2 + photonRing * 3.5) * envelope * (0.45 + dopplerBoost);
    intensity = clamp(intensity, 0.0, 5.0);

    // ACES Filmic Tone Mapping for vibrant bloom
    vec3 x = col * intensity * 1.8;
    vec3 finalColor = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);

    float alpha = clamp(envelope * (plasma * 1.2 + photonRing * 1.8) * 1.5, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// 2. Iconic Gravitational Lensing Arc Shader (Upper & Lower bent starlight arcs)
const lensArcVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const lensArcFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);

    if (r < 0.28 || r > 0.98) discard;

    // View-dependent relativistic Fresnel brightening
    float fresnel = 1.0 - abs(dot(vNormal, vViewDir));
    fresnel = pow(fresnel, 1.8);

    // Light arc warped over the top and bottom of the event horizon
    float angle = atan(p.y, p.x);
    float arcShape = pow(abs(cos(angle)), 1.2);

    float ring = exp(-pow((r - 0.38) * 18.0, 2.0)) * 3.8;
    float outerGlow = exp(-pow((r - 0.55) * 6.0, 2.0)) * 1.4;

    float intensity = (ring + outerGlow) * arcShape * (0.6 + fresnel * 1.8);

    vec3 colHot = vec3(1.0, 0.96, 0.88);
    vec3 col = mix(uBaseColor, colHot, ring * 0.75);

    vec3 x = col * intensity * 1.5;
    vec3 finalColor = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);

    float alpha = clamp(intensity * 0.85, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// Individual Singularity Black Hole Mesh System
function SingleSingularityBlackHole({ data, onFlyTo, isCurrentTarget }) {
  const groupRef = useRef()
  const diskRef = useRef()
  const arcTopRef = useRef()
  const arcSideRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [camDistance, setCamDistance] = useState(999999)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(data.color) },
    uAccentColor: { value: new THREE.Color(data.accent) }
  }), [data])

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return
    const dist = camera.position.distanceTo(groupRef.current.position)
    setCamDistance(dist)

    const isNearby = dist <= data.scale * 60
    if (groupRef.current.visible !== isNearby) {
      groupRef.current.visible = isNearby
    }

    if (isNearby) {
      const t = clock.elapsedTime
      uniforms.uTime.value = t

      // Slow dynamic spin of accretion disk
      if (diskRef.current) {
        diskRef.current.rotation.z = t * 0.12
      }
    }
  })

  const handleClick = (e) => {
    if (e) e.stopPropagation()
    onFlyTo(data)
  }

  const s = data.scale

  return (
    <group ref={groupRef} position={data.position}>
      {/* Invisible Interactive Click Box for smooth raycast picking */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
      >
        <sphereGeometry args={[s * 1.6, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 1. Pure Pitch-Black Event Horizon (The Absolute Shadow of Gravity) */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[s * 0.36, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Brilliant Razor-Thin Einstein Photon Ring */}
      <mesh raycast={() => null} rotation={[-Math.PI * 0.08, 0, 0]}>
        <ringGeometry args={[s * 0.37, s * 0.44, 96]} />
        <meshBasicMaterial
          color={data.accent}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Primary Relativistic Accretion Disk (Tilted at 14 degrees) */}
      <mesh
        ref={diskRef}
        rotation={[-Math.PI / 2.2, 0, 0]}
        raycast={() => null}
      >
        <ringGeometry args={[s * 0.38, s * 1.55, 128]} />
        <shaderMaterial
          vertexShader={diskVertexShader}
          fragmentShader={diskFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Iconic Einstein Gravitational Bent Light Arc (Vertical Upper/Lower Warped Ring) */}
      <mesh
        ref={arcTopRef}
        rotation={[0, Math.PI / 2.1, 0]}
        raycast={() => null}
      >
        <ringGeometry args={[s * 0.39, s * 1.35, 96]} />
        <shaderMaterial
          vertexShader={lensArcVertexShader}
          fragmentShader={lensArcFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Second Cross-Arc for 360-degree Gravitational Lensing Spherical Depth */}
      <mesh
        ref={arcSideRef}
        rotation={[Math.PI / 4, Math.PI / 4, 0]}
        raycast={() => null}
      >
        <ringGeometry args={[s * 0.40, s * 1.2, 80]} />
        <shaderMaterial
          vertexShader={lensArcVertexShader}
          fragmentShader={lensArcFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 6. Outer Spacetime Distortion Glow */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[s * 1.6, 24, 24]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 
        7. ULTRA-SUBTLE Cosmic Beacon Pin:
        - NEVER renders when the user is orbiting this black hole (prevents card from dominating!)
        - Only visible when viewed from distant space (camDistance > scale * 3.5)
        - Compact, non-intrusive 9px badge that doesn't block the screen
      */}
      {!isCurrentTarget && camDistance > s * 3.5 && camDistance < s * 45 && (
        <Html
          position={[0, s * 1.1, 0]}
          center
          distanceFactor={55000}
          style={{ pointerEvents: "auto" }}
        >
          <div
            onClick={handleClick}
            style={{
              background: "rgba(8, 12, 22, 0.85)",
              border: `1px solid ${data.color}99`,
              boxShadow: `0 0 16px ${data.color}44`,
              padding: "4px 10px",
              borderRadius: 20,
              backdropFilter: "blur(10px)",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 10,
              whiteSpace: "nowrap",
              cursor: "pointer",
              textAlign: "center",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.15s ease",
              userSelect: "none"
            }}
            title={`Click to orbit ${data.name} in 360° 3D`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: data.color,
                boxShadow: `0 0 6px ${data.color}`
              }} />
              <b style={{ color: data.accent, letterSpacing: 0.5, fontSize: 10 }}>
                {data.name}
              </b>
              <span style={{ color: "#94a3b8", fontSize: 8.5 }}>• ORBIT 360°</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Master Component: Renders all 5 Black Holes
export default function FiveSingularityBlackHoles({ onFlyTo, currentTargetId }) {
  return (
    <group>
      {FIVE_BLACK_HOLES.map((bh) => (
        <SingleSingularityBlackHole
          key={bh.id}
          data={bh}
          onFlyTo={onFlyTo}
          isCurrentTarget={currentTargetId === bh.id}
        />
      ))}
    </group>
  )
}
