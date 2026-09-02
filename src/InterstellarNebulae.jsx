import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// 6 Massive Ethereal Interstellar Nebulae Clouds in the Gaps Between Stars
const NEBULAE_DATA = [
  { pos: [380, -40, -180], color: "#00d8ff", radius: 240, label: "Centauri Interstellar Veil" },
  { pos: [1100, 180, -750], color: "#ff44aa", radius: 320, label: "Sirius Emission Cloud" },
  { pos: [-1400, -220, 900], color: "#9944ff", radius: 290, label: "Eridani Molecular Rift" },
  { pos: [-2800, 240, -2100], color: "#00ffaa", radius: 380, label: "Vega Stellar Nursery" },
  { pos: [2200, -380, 1600], color: "#ffaa22", radius: 340, label: "Procyon Amber Filament" },
  { pos: [4500, 310, 3200], color: "#ff2266", radius: 460, label: "Arcturus Crimson Cloud" }
]

const nebulaVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const nebulaFrag = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float dist = length(p);
    if (dist > 1.0) discard;

    // Organic gaseous density
    float density = exp(-pow(dist * 2.2, 2.0));
    float pulse = 0.85 + 0.15 * sin(uTime * 0.4 + dist * 4.0);
    float alpha = clamp(density * 0.45 * pulse, 0.0, 1.0);

    vec3 col = mix(uColor, vec3(1.0, 1.0, 1.0), density * 0.35);
    gl_FragColor = vec4(col * 1.5, alpha);
  }
`

export default function InterstellarNebulae() {
  const groupRef = useRef()

  const uniformsList = useMemo(() => {
    return NEBULAE_DATA.map(n => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(n.color) }
    }))
  }, [])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    uniformsList.forEach(u => {
      u.uTime.value = t
    })

    if (groupRef.current) {
      const camDist = camera.position.length()
      groupRef.current.visible = camDist < 75000
    }
  })

  return (
    <group ref={groupRef}>
      {NEBULAE_DATA.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.radius, 24, 24]} />
          <shaderMaterial
            vertexShader={nebulaVert}
            fragmentShader={nebulaFrag}
            uniforms={uniformsList[i]}
            transparent
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
