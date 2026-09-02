import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// GPU Shader for Interstellar Dust Specks and Warp Speed Streaks
const dustVert = `
  uniform float uTime;
  uniform vec3 uVelocity;
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Size attenuation based on distance to camera
    float dist = length(mvPosition.xyz);
    gl_PointSize = aScale * (380.0 / dist);
    gl_PointSize = clamp(gl_PointSize, 1.5, 32.0);
    
    // Fade out particles that are too close or too far
    vAlpha = smoothstep(5000.0, 3000.0, dist) * smoothstep(10.0, 60.0, dist);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const dustFrag = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Smooth circular particle with soft glowing edge
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    float glow = exp(-dist * 6.0);
    float core = smoothstep(0.5, 0.05, dist);
    float alpha = (core * 0.8 + glow * 0.5) * vAlpha;
    
    gl_FragColor = vec4(vColor * (1.2 + glow * 1.5), alpha);
  }
`

export default function InterstellarDust({ count = 2200 }) {
  const pointsRef = useRef()
  const lastCamPos = useRef(new THREE.Vector3())
  const BOX_SIZE = 3500

  const { positions, scales, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sca = new Float32Array(count)
    const col = new Float32Array(count * 3)

    const palette = [
      new THREE.Color("#00d8ff"), // Interstellar Azure
      new THREE.Color("#ffffff"), // Pure Starlight
      new THREE.Color("#ffaa44"), // Cosmic Amber
      new THREE.Color("#bb66ff"), // Deep Violet
      new THREE.Color("#44ffbb")  // Aurora Emerald
    ]

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * BOX_SIZE
      pos[i * 3 + 1] = (Math.random() - 0.5) * BOX_SIZE
      pos[i * 3 + 2] = (Math.random() - 0.5) * BOX_SIZE

      sca[i] = 2.0 + Math.random() * 5.0

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3 + 0] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return { positions: pos, scales: sca, colors: col }
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uVelocity: { value: new THREE.Vector3() }
  }), [])

  useFrame(({ clock, camera }) => {
    if (!pointsRef.current) return
    const t = clock.elapsedTime
    uniforms.uTime.value = t

    // Wrap particles around current camera position so dust is infinite
    const cPos = camera.position
    const pAttr = pointsRef.current.geometry.attributes.position
    const arr = pAttr.array

    // Calculate camera displacement for warp motion feel
    const deltaMove = new THREE.Vector3().subVectors(cPos, lastCamPos.current)
    lastCamPos.current.copy(cPos)

    for (let i = 0; i < count; i++) {
      let x = arr[i * 3 + 0]
      let y = arr[i * 3 + 1]
      let z = arr[i * 3 + 2]

      const dx = x - cPos.x
      const dy = y - cPos.y
      const dz = z - cPos.z

      const half = BOX_SIZE / 2

      if (dx > half) arr[i * 3 + 0] -= BOX_SIZE
      else if (dx < -half) arr[i * 3 + 0] += BOX_SIZE

      if (dy > half) arr[i * 3 + 1] -= BOX_SIZE
      else if (dy < -half) arr[i * 3 + 1] += BOX_SIZE

      if (dz > half) arr[i * 3 + 2] -= BOX_SIZE
      else if (dz < -half) arr[i * 3 + 2] += BOX_SIZE
    }

    pAttr.needsUpdate = true

    // Interstellar dust visible when camera is in stellar neighborhood & local galaxy (dist < 80,000)
    const camDist = cPos.length()
    pointsRef.current.visible = camDist < 80000
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
