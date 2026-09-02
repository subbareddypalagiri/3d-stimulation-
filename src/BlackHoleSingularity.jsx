import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// High-Definition Relativistic Keplerian Accretion Disk Shader
const diskVert = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const diskFrag = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // High precision pseudo-random noise
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
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);

    // Event Horizon cutoff: Pure black singularity inside
    if (r < 0.28 || r > 0.98) discard;

    // Keplerian angular velocity (relativistic differential rotation)
    float angle = atan(p.y, p.x);
    float keplerSpeed = 2.2 / pow(r, 0.85);
    float rotAngle = angle + uTime * keplerSpeed * 0.35;

    // Multi-scale turbulent plasma filaments
    vec2 polar = vec2(rotAngle * 5.0, r * 22.0);
    float plasma1 = fbm(polar);
    float plasma2 = noise(vec2(rotAngle * 10.0 - uTime * 0.8, r * 45.0));
    float plasma = pow(plasma1 * 0.7 + plasma2 * 0.3, 1.35);

    // Relativistic Doppler Beaming: Approaching gas is blue-shifted & blindingly bright
    float doppler = 0.5 + 0.5 * sin(angle);
    float dopplerBoost = pow(doppler, 1.8) * 2.2;

    // Einstein Photon Ring: Razor-sharp blinding light ring at event horizon boundary
    float photonRing = exp(-pow((r - 0.29) * 28.0, 2.0)) * 3.5;

    // Radial attenuation envelope
    float innerFade = smoothstep(0.28, 0.35, r);
    float outerFade = 1.0 - smoothstep(0.65, 0.98, r);
    float envelope = innerFade * outerFade;

    // Thermal color spectrum: Ultra-Hot White Core -> Saturated Mid Plasma -> Deep Reddish-Black Outer Rim
    vec3 hotColor = vec3(1.0, 1.0, 1.0);
    vec3 midColor = uColor;
    vec3 coldColor = vec3(uColor.r * 0.4, uColor.g * 0.15, uColor.b * 0.05);

    vec3 col = mix(coldColor, midColor, doppler);
    col = mix(col, hotColor, photonRing * 0.85 + plasma * 0.5);

    float intensity = (plasma * 1.8 + photonRing * 2.8) * envelope * (0.4 + dopplerBoost);
    gl_FragColor = vec4(col * intensity * 2.2, clamp(intensity, 0.0, 1.0));
  }
`

// Gravitational Lensing Spacetime Distortion Halo Shader (Interstellar Vertical Arc)
const haloVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const haloFrag = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);

    if (r < 0.29 || r > 0.95) discard;

    // Concentrated vertical gravitational lens arc
    float arc = smoothstep(0.95, 0.35, r) * smoothstep(0.29, 0.38, r);
    float shimmer = 0.85 + 0.15 * sin(uTime * 2.0 + p.x * 6.0);

    // Intense photon curve
    float ring = exp(-pow((r - 0.32) * 22.0, 2.0)) * 2.8;

    vec3 col = mix(uColor, vec3(1.0, 0.95, 0.9), ring * 0.7);
    float alpha = clamp((arc * 0.9 + ring * 1.8) * shimmer, 0.0, 1.0);

    gl_FragColor = vec4(col * alpha * 2.4, alpha);
  }
`

export default function BlackHoleSingularity({
  position = [0, 0, 0],
  color = "#ffaa00",
  scale = 1.0,
  flyTo
}) {
  const groupRef = useRef()
  const diskRef = useRef()
  const verticalHaloRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) }
  }), [color])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (diskRef.current) diskRef.current.material.uniforms.uTime.value = t
    if (verticalHaloRef.current) verticalHaloRef.current.material.uniforms.uTime.value = t

    // Slow majestic cosmic precession
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        if (flyTo) flyTo(position, 40)
      }}
      style={{ cursor: "pointer" }}
    >
      {/* 1. THE EVENT HORIZON: Pure Light-Absorbing Black Sphere */}
      <mesh>
        <sphereGeometry args={[16, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. THE MAIN HORIZONTAL ACCRETION DISK (Keplerian Relativistic Plasma) */}
      <mesh ref={diskRef} rotation={[-Math.PI / 2.25, 0, 0]}>
        <planeGeometry args={[115, 115, 1, 1]} />
        <shaderMaterial
          vertexShader={diskVert}
          fragmentShader={diskFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. THE RELATIVISTIC VERTICAL LENSING HALO (Interstellar Gargantua Bent Arc) */}
      <mesh ref={verticalHaloRef} rotation={[0, 0, Math.PI / 6]}>
        <planeGeometry args={[95, 95, 1, 1]} />
        <shaderMaterial
          vertexShader={haloVert}
          fragmentShader={haloFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. GRAVITATIONAL ILLUMINATION: Intense Accretion Light into Space */}
      <pointLight color={color} intensity={3.5} distance={320} decay={1.8} />
    </group>
  )
}
