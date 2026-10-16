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
    color: "#ff9500", // Deep Burning Amber Gold
    accent: "#ffcc44",
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
    accent: "#67e8f9",
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

// Hardware-accelerated seamless toroidal noise generator for turbulent plasma
function makeTurbulentNoiseTexture() {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  const imgData = ctx.createImageData(size, size)
  const data = imgData.data

  const perm = new Uint8Array(512)
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = perm[i]; perm[i] = perm[j]; perm[j] = t
  }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i]

  function grad(hash, x, y) {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  function noise(x, y) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const g00 = grad(perm[X + perm[Y]], xf, yf)
    const g10 = grad(perm[X + 1 + perm[Y]], xf - 1, yf)
    const g01 = grad(perm[X + perm[Y + 1]], xf, yf - 1)
    const g11 = grad(perm[X + 1 + perm[Y + 1]], xf - 1, yf - 1)
    const x1 = g00 + u * (g10 - g00)
    const x2 = g01 + u * (g11 - g01)
    return x1 + v * (x2 - x1)
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const s = (x / size) * Math.PI * 2
      const t = (y / size) * Math.PI * 2
      const nx = Math.cos(s) * 1.8, ny = Math.sin(s) * 1.8
      const nz = Math.cos(t) * 1.8, nw = Math.sin(t) * 1.8

      let val = 0.5 + 0.35 * noise(nx + 12, ny + 12) + 0.15 * noise(nx * 2.5 + nz, ny * 2.5 + nw)
      val = Math.max(0, Math.min(1, val))
      const idx = (y * size + x) * 4
      data[idx] = Math.floor(val * 255)
      data[idx + 1] = Math.floor(Math.pow(val, 1.3) * 255)
      data[idx + 2] = Math.floor(Math.pow(val, 1.8) * 255)
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

const vertShader = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragShader = `
  uniform float uTime;
  uniform vec3 uCenter;
  uniform float uScale;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform sampler2D uNoiseTex;

  varying vec3 vWorldPos;

  const float PI = 3.14159265359;
  const float HORIZON = 0.22;
  const float ISCO = 0.26;
  const float DISK_OUTER = 0.88;
  const float BOUND_RADIUS = 0.98;

  bool intersectSphere(vec3 ro, vec3 rd, float R, out float tNear, out float tFar) {
    float b = dot(ro, rd);
    float c = dot(ro, ro) - R * R;
    float d = b * b - c;
    if (d < 0.0) return false;
    float sd = sqrt(d);
    tNear = -b - sd;
    tFar = -b + sd;
    return true;
  }

  // Tilted coordinate frame (15.5 degrees) for the classic Interstellar warping look
  vec3 rotateDisk(vec3 p) {
    float angle = 0.27; // ~15.5 degrees
    float cosA = cos(angle);
    float sinA = sin(angle);
    return vec3(p.x, p.y * cosA - p.z * sinA, p.y * sinA + p.z * cosA);
  }

  void main() {
    vec3 roWorld = cameraPosition;
    vec3 rdWorld = normalize(vWorldPos - cameraPosition);

    // Normalize coordinates to unit sphere around black hole
    vec3 ro = (roWorld - uCenter) / uScale;
    vec3 rd = rdWorld;

    float tNear, tFar;
    if (!intersectSphere(ro, rd, BOUND_RADIUS, tNear, tFar)) {
      discard;
    }

    if (tNear > 0.0) {
      ro += rd * tNear;
    }

    vec3 pos = ro;
    vec3 vel = rd;
    vec3 accumulated = vec3(0.0);
    float transmittance = 1.0;
    bool enteredHorizon = false;

    // 48 High-Performance Raymarching Steps with Schwarzschild Light Geodesics
    for (int step = 0; step < 48; step++) {
      float r = length(pos);
      if (r < HORIZON * 1.01) {
        enteredHorizon = true;
        break;
      }
      if (r > BOUND_RADIUS && step > 6 && dot(pos, vel) > 0.0) {
        break;
      }

      float stepSize = clamp((r - HORIZON) * 0.12, 0.016, 0.08);

      // Schwarzschild Gravity Light Bending (~ 1/r^2 steering)
      vec3 rNorm = pos / max(r, 0.001);
      float steerMag = (0.34 / max(r * r, 0.018)) * stepSize;
      vel = normalize(vel - rNorm * steerMag);
      pos += vel * stepSize;

      // Accretion Disk in tilted frame
      vec3 dp = rotateDisk(pos);
      float rDisk = length(dp.xz);
      float h = abs(dp.y);

      float diskThick = mix(0.012, 0.048, smoothstep(ISCO, DISK_OUTER, rDisk));
      if (rDisk > ISCO && rDisk < DISK_OUTER && h < diskThick * 3.2) {
        float phi = atan(dp.z, dp.x);

        // Hardware-accelerated procedural noise lookup
        vec2 diskUv = vec2(rDisk * 1.4 - uTime * 0.08, phi / (2.0 * PI) + rDisk * 0.35);
        vec4 noiseVal = texture2D(uNoiseTex, diskUv * 2.2);

        float vertical = exp(-pow(h / max(diskThick, 0.001), 2.0) * 3.8);
        float radialFade = smoothstep(ISCO, ISCO + 0.06, rDisk) * (1.0 - smoothstep(DISK_OUTER - 0.16, DISK_OUTER, rDisk));
        float density = vertical * radialFade * (0.32 + 0.68 * noiseVal.r);

        // Relativistic Doppler Beaming
        vec3 vOrbit = normalize(vec3(-dp.z, 0.0, dp.x));
        vec3 dVel = rotateDisk(vel);
        float toward = dot(vOrbit, -dVel);
        float doppler = pow(clamp(1.0 + toward * 0.68, 0.3, 2.4), 1.6);
        float redshift = sqrt(max(0.01, 1.0 - HORIZON / r));

        // Color ramp customized by uBaseColor and uAccentColor
        float heat = pow((DISK_OUTER - rDisk) / (DISK_OUTER - ISCO), 1.3);
        vec3 colHot = vec3(1.0, 0.98, 0.92);
        vec3 colMid = uBaseColor;
        vec3 colDark = mix(vec3(0.05, 0.01, 0.01), uAccentColor * 0.25, 0.5);

        vec3 thermal = mix(colDark, colMid, smoothstep(0.05, 0.65, heat));
        thermal = mix(thermal, colHot, pow(heat, 2.6));

        vec3 emission = thermal * density * doppler * redshift * 7.8;
        float optDepth = density * 3.2 * stepSize;
        float absorbed = 1.0 - exp(-optDepth);
        accumulated += emission * transmittance * absorbed / max(density, 0.001);
        transmittance *= exp(-optDepth);
      }
    }

    // Brilliant Gravitational Photon Ring at Shadow Boundary
    float rEnd = length(pos);
    if (!enteredHorizon && rEnd >= HORIZON && rEnd <= HORIZON * 1.4) {
      float photonRing = exp(-pow((rEnd - HORIZON * 1.15) * 42.0, 2.0)) * 5.2;
      accumulated += vec3(1.0, 0.97, 0.92) * photonRing * transmittance;
    }

    float alpha = clamp(1.0 - transmittance, 0.0, 1.0);
    if (enteredHorizon) {
      alpha = 1.0;
      accumulated = vec3(0.0); // Pure pitch-black event horizon
    }

    if (alpha < 0.005 && !enteredHorizon) discard;

    // ACES Filmic Tone Mapping
    vec3 x = accumulated * 1.35;
    vec3 finalColor = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`

// Individual Singularity Black Hole Mesh + 3D Hologram Pin
function SingleSingularityBlackHole({ data, noiseTex, onFlyTo, isCurrentTarget }) {
  const groupRef = useRef()
  const matRef = useRef()
  const [hovered, setHovered] = useState(false)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3(...data.position) },
    uScale: { value: data.scale },
    uBaseColor: { value: new THREE.Color(data.color) },
    uAccentColor: { value: new THREE.Color(data.accent) },
    uNoiseTex: { value: noiseTex }
  }), [data, noiseTex])

  // Distance-based LOD Culling: runs full raymarch only when within visual range
  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return
    const camDist = camera.position.distanceTo(uniforms.uCenter.value)
    // Visible within generous range (80x scale)
    const isNearby = camDist <= data.scale * 80

    if (groupRef.current.visible !== isNearby) {
      groupRef.current.visible = isNearby
    }

    if (isNearby && matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  const handleClick = (e) => {
    if (e) e.stopPropagation()
    onFlyTo(data)
  }

  return (
    <group ref={groupRef} position={data.position}>
      {/* 1. Photorealistic Raymarched Mesh on Local Unit Sphere */}
      <mesh
        scale={[data.scale, data.scale, data.scale]}
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
        <sphereGeometry args={[1, 40, 40]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertShader}
          fragmentShader={fragShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* 2. Interactive 3D Holographic Marker */}
      <Html
        position={[0, data.scale * 1.15, 0]}
        center
        distanceFactor={data.scale * 18}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={handleClick}
          style={{
            background: isCurrentTarget ? "rgba(15, 23, 42, 0.96)" : "rgba(8, 12, 22, 0.88)",
            border: `1.5px solid ${isCurrentTarget ? "#38bdf8" : data.color}`,
            boxShadow: `0 0 24px ${isCurrentTarget ? "rgba(56, 189, 248, 0.7)" : data.color + "66"}, inset 0 0 10px rgba(0,0,0,0.4)`,
            padding: "8px 14px",
            borderRadius: 10,
            backdropFilter: "blur(14px)",
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 11,
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "center",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            userSelect: "none"
          }}
          title={`Click to fly and orbit ${data.name} in 360° 3D`}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: data.color,
              boxShadow: `0 0 8px ${data.color}`
            }} />
            <b style={{ color: data.accent, letterSpacing: 0.6, fontSize: 11.5 }}>
              🌀 {data.name}
            </b>
            {isCurrentTarget && (
              <span style={{
                background: "#0284c7",
                color: "#ffffff",
                padding: "1px 5px",
                borderRadius: 4,
                fontSize: 8.5,
                fontWeight: 800
              }}>
                ORBITING
              </span>
            )}
          </div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>
            {data.level} • {data.sector}
          </div>
          <div style={{
            marginTop: 4,
            display: "inline-block",
            background: "rgba(255, 255, 255, 0.08)",
            border: `1px solid ${data.color}88`,
            color: "#ffffff",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 8.5,
            fontWeight: 700
          }}>
            ✦ 360° 3D ORBIT ✦
          </div>
        </div>
      </Html>
    </group>
  )
}

// Master Component: Renders all 5 Black Holes
export default function FiveSingularityBlackHoles({ onFlyTo, currentTargetId }) {
  const noiseTex = useMemo(() => makeTurbulentNoiseTexture(), [])

  return (
    <group>
      {FIVE_BLACK_HOLES.map((bh) => (
        <SingleSingularityBlackHole
          key={bh.id}
          data={bh}
          noiseTex={noiseTex}
          onFlyTo={onFlyTo}
          isCurrentTarget={currentTargetId === bh.id}
        />
      ))}
    </group>
  )
}
