import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Custom Shader for the Pulsating Luminous Corona of the Singularity Dot
const coronaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    // Billboarding: Always faces camera with scale
    vec2 scale = vec2(length(vec3(modelMatrix[0].xyz)), length(vec3(modelMatrix[1].xyz)));
    mvPosition.xy += (uv - 0.5) * scale;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const coronaFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uPulse;

  void main() {
    vec2 center = vUv - vec2(0.5);
    float dist = length(center) * 2.0;
    if (dist > 1.0) discard;

    // Soft celestial gaussian glow
    float glow = exp(-dist * 4.0) * (0.8 + 0.2 * sin(uTime * 3.0));
    float core = smoothstep(0.18, 0.0, dist);

    vec3 color = mix(vec3(0.7, 0.9, 1.0), vec3(1.0, 1.0, 1.0), core);
    float alpha = clamp(glow + core * 1.5, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`

export default function CosmicSingularityDot({ onActivatePortal, flyTo }) {
  const groupRef = useRef()
  const coronaMatRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPulse: { value: 1.0 }
  }), [])

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return
    const dist = camera.position.length()

    // Appears at extreme cosmological distance (dist > 18,000,000,000 AU)
    const isVisible = dist > 15000000000
    groupRef.current.visible = isVisible

    if (isVisible && coronaMatRef.current) {
      coronaMatRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  // Size of the central singularity dot (visible at 20B - 50B AU)
  const dotSize = 250000000 // 250 Million AU radiant beacon

  return (
    <group ref={groupRef} position={[0, 0, 0]} raycast={() => null}>
      {/* Central Blinding White Core */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[dotSize * 0.4, 32, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Billboarding Pulsating Radiant Corona */}
      <mesh scale={[dotSize * 3.5, dotSize * 3.5, 1]} raycast={() => null}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={coronaMatRef}
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
          uniforms={uniforms}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
