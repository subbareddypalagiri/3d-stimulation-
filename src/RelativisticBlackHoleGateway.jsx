import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

// Procedural seamless toroidal noise texture generator (zero external asset dependency, instant load)
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
      const nx = Math.cos(s) * 1.6, ny = Math.sin(s) * 1.6
      const nz = Math.cos(t) * 1.6, nw = Math.sin(t) * 1.6

      let val = 0.5 + 0.32 * noise(nx + 15, ny + 15) + 0.18 * noise(nx * 2.2 + nz, ny * 2.2 + nw)
      val = Math.max(0, Math.min(1, val))
      const idx = (y * size + x) * 4
      data[idx] = Math.floor(val * 255)
      data[idx + 1] = Math.floor(Math.pow(val, 1.25) * 255)
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
  uniform float uRadius;
  uniform sampler2D uNoiseTex;

  varying vec3 vWorldPos;

  const float PI = 3.14159265359;
  const float HORIZON = 1.0;
  const float ISCO = 1.85;
  const float DISK_OUTER = 7.2;
  const float BOUND_RADIUS = 8.5;

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

  // Tilt disk slightly (14 degrees) for the iconic Interstellar perspective
  vec3 rotateDisk(vec3 p) {
    float angle = 0.244; // ~14 degrees
    float cosA = cos(angle);
    float sinA = sin(angle);
    return vec3(p.x, p.y * cosA - p.z * sinA, p.y * sinA + p.z * cosA);
  }

  void main() {
    vec3 roWorld = cameraPosition;
    vec3 rdWorld = normalize(vWorldPos - cameraPosition);

    vec3 ro = (roWorld - uCenter) / uRadius;
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

    // 44 Fast, hardware-accelerated geodesic ray steps with hardware noise sampling
    for (int step = 0; step < 44; step++) {
      float r = length(pos);
      if (r < HORIZON * 1.02) {
        enteredHorizon = true;
        break;
      }
      if (r > BOUND_RADIUS && step > 6 && dot(pos, vel) > 0.0) {
        break;
      }

      float stepSize = clamp((r - HORIZON) * 0.11, 0.04, 0.26);

      // Schwarzschild Light Geodesic Bending (Singularity Ray Steering ~ 1/r^2)
      vec3 rNorm = pos / max(r, 0.001);
      float steerMag = (0.32 / max(r * r, 0.08)) * stepSize;
      vel = normalize(vel - rNorm * steerMag);
      pos += vel * stepSize;

      // Accretion Disk in Tilted Coordinate Frame
      vec3 dp = rotateDisk(pos);
      float rDisk = length(dp.xz);
      float h = abs(dp.y);

      float diskThick = mix(0.04, 0.24, smoothstep(ISCO, DISK_OUTER, rDisk));
      if (rDisk > ISCO && rDisk < DISK_OUTER && h < diskThick * 3.2) {
        float phi = atan(dp.z, dp.x);
        
        // Singularity Hardware Texture Lookup (1 instruction vs 4-octave heavy math)
        vec2 diskUv = vec2(rDisk * 0.42 - uTime * 0.07, phi / (2.0 * PI) + rDisk * 0.16);
        vec4 noiseVal = texture2D(uNoiseTex, diskUv * 2.5);

        float vertical = exp(-pow(h / max(diskThick, 0.01), 2.0) * 3.5);
        float radialFade = smoothstep(ISCO, ISCO + 0.5, rDisk) * (1.0 - smoothstep(DISK_OUTER - 1.8, DISK_OUTER, rDisk));
        float density = vertical * radialFade * (0.35 + 0.65 * noiseVal.r);

        // Relativistic Doppler Beaming (approaching side is brighter & bluer, receding is dimmer & redder)
        vec3 vOrbit = normalize(vec3(-dp.z, 0.0, dp.x));
        vec3 dVel = rotateDisk(vel);
        float toward = dot(vOrbit, -dVel);
        float doppler = pow(clamp(1.0 + toward * 0.62, 0.35, 2.2), 1.6);
        float redshift = sqrt(max(0.01, 1.0 - HORIZON / r));

        // B-Spline Thermal Color Ramp (from blazing core white-gold -> fiery orange -> dark smoke)
        float heat = pow((DISK_OUTER - rDisk) / (DISK_OUTER - ISCO), 1.25);
        vec3 colHot = vec3(1.0, 0.96, 0.88);
        vec3 colMid = vec3(1.0, 0.45, 0.12);
        vec3 colDark = vec3(0.38, 0.06, 0.01);
        vec3 thermal = mix(colDark, colMid, smoothstep(0.05, 0.6, heat));
        thermal = mix(thermal, colHot, pow(heat, 2.5));

        vec3 emission = thermal * density * doppler * redshift * 7.5;
        float optDepth = density * 2.8 * stepSize;
        float absorbed = 1.0 - exp(-optDepth);
        accumulated += emission * transmittance * absorbed / max(density, 0.001);
        transmittance *= exp(-optDepth);
      }
    }

    // Brilliant Gravitational Photon Ring at Shadow Boundary (r ~ 1.5 Horizon)
    float rEnd = length(pos);
    if (!enteredHorizon && rEnd >= HORIZON && rEnd <= HORIZON * 1.85) {
      float photonRing = exp(-pow((rEnd - HORIZON * 1.35) * 18.0, 2.0)) * 4.2;
      accumulated += vec3(1.0, 0.95, 0.88) * photonRing * transmittance;
    }

    float alpha = clamp(1.0 - transmittance, 0.0, 1.0);
    if (enteredHorizon) {
      alpha = 1.0;
      accumulated = vec3(0.0); // Pitch-black event horizon
    }

    if (alpha < 0.005 && !enteredHorizon) discard;

    // ACES Filmic Tone Mapping for cinematic HDR bloom response
    vec3 x = accumulated * 1.3;
    vec3 finalColor = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export default function RelativisticBlackHoleGateway({
  position = [150000, 60000, -520000],
  radius = 18000,
  flyTo
}) {
  const groupRef = useRef()
  const matRef = useRef()
  const noiseTex = useMemo(() => makeTurbulentNoiseTexture(), [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3(...position) },
    uRadius: { value: radius },
    uNoiseTex: { value: noiseTex }
  }), [position, radius, noiseTex])

  // Smart LOD & Sleep Mode: completely hides and stops shader when far away (> 160,000 AU)
  useFrame(({ clock, camera }) => {
    const distToM87 = camera.position.distanceTo(uniforms.uCenter.value)
    const isNearby = distToM87 <= 160000

    if (groupRef.current) {
      if (groupRef.current.visible !== isNearby) {
        groupRef.current.visible = isNearby
      }
    }

    if (isNearby && matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  // Bounding sphere size (8.5x horizon radius)
  const boundSize = radius * 8.5

  const handleFlyTo = (e) => {
    if (e) e.stopPropagation()
    if (flyTo) {
      flyTo(position, radius * 2.2, 1.0)
    }
  }

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Photorealistic Raymarched Singularity Black Hole Mesh (Directly in 3D Space) */}
      <mesh
        onClick={handleFlyTo}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto"
        }}
      >
        <sphereGeometry args={[boundSize, 32, 32]} />
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

      {/* 2. Interactive Holographic 3D Tag floating right above Black Hole */}
      <Html
        position={[0, radius * 3.8, 0]}
        center
        distanceFactor={85000}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={handleFlyTo}
          style={{
            background: "rgba(6, 10, 24, 0.92)",
            border: "1.5px solid #ff7700",
            boxShadow: "0 0 25px rgba(255, 120, 20, 0.55), inset 0 0 12px rgba(255, 100, 0, 0.25)",
            padding: "8px 16px",
            borderRadius: 12,
            backdropFilter: "blur(14px)",
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 11,
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "center",
            transform: "scale(1)",
            transition: "all 0.2s ease",
            userSelect: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)"
            e.currentTarget.style.borderColor = "#ffcc44"
            e.currentTarget.style.boxShadow = "0 0 35px rgba(255, 180, 50, 0.8)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.borderColor = "#ff7700"
            e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 120, 20, 0.55)"
          }}
          title="Click to fly right in front of M87 in 3D space"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff7700",
              boxShadow: "0 0 10px #ff7700"
            }} />
            <b style={{ color: "#ffaa44", letterSpacing: 0.8, fontSize: 12 }}>
              🌀 M87: SUPERMASSIVE BLACK HOLE
            </b>
          </div>
          <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 2 }}>
            Virgo Sector • Schwarzschild Geodesics & Doppler Plasma
          </div>
          <div style={{
            marginTop: 5,
            display: "inline-block",
            background: "rgba(255, 120, 20, 0.22)",
            border: "1px solid rgba(255, 140, 40, 0.6)",
            color: "#ffcc66",
            padding: "2px 10px",
            borderRadius: 6,
            fontSize: 9,
            fontWeight: 800
          }}>
            ✦ CLICK TO FLY & ORBIT IN 3D ✦
          </div>
        </div>
      </Html>
    </group>
  )
}
