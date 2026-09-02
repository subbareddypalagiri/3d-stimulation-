import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// High-Definition Relativistic Keplerian Accretion Disk Shader
const diskVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const diskFrag = `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

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

    if (r < 0.28 || r > 0.98) discard;

    float angle = atan(p.y, p.x);
    float keplerSpeed = 2.2 / pow(r, 0.85);
    float rotAngle = angle + uTime * keplerSpeed * 0.35;

    vec2 polar = vec2(rotAngle * 5.0, r * 22.0);
    float plasma1 = fbm(polar);
    float plasma2 = noise(vec2(rotAngle * 10.0 - uTime * 0.8, r * 45.0));
    float plasma = pow(plasma1 * 0.7 + plasma2 * 0.3, 1.35);

    // Relativistic Doppler Beaming
    float doppler = 0.5 + 0.5 * sin(angle);
    float dopplerBoost = pow(doppler, 1.8) * 2.2;

    // Einstein Photon Ring
    float photonRing = exp(-pow((r - 0.29) * 28.0, 2.0)) * 3.5;

    float innerFade = smoothstep(0.28, 0.35, r);
    float outerFade = 1.0 - smoothstep(0.65, 0.98, r);
    float envelope = innerFade * outerFade;

    vec3 hotColor = vec3(1.0, 1.0, 1.0);
    vec3 midColor = uColor;
    vec3 coldColor = vec3(uColor.r * 0.35, uColor.g * 0.12, uColor.b * 0.04);

    vec3 col = mix(coldColor, midColor, doppler);
    col = mix(col, hotColor, photonRing * 0.85 + plasma * 0.5);

    float intensity = (plasma * 1.8 + photonRing * 2.8) * envelope * (0.4 + dopplerBoost);
    float finalAlpha = clamp(intensity * uOpacity, 0.0, 1.0);
    gl_FragColor = vec4(col * intensity * 2.4, finalAlpha);
  }
`

// Gravitational Lensing Spacetime Halo Shader (Interstellar Vertical Bent Light Arc)
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
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);

    if (r < 0.29 || r > 0.95) discard;

    float arc = smoothstep(0.95, 0.35, r) * smoothstep(0.29, 0.38, r);
    float shimmer = 0.85 + 0.15 * sin(uTime * 2.0 + p.x * 6.0);
    float ring = exp(-pow((r - 0.32) * 22.0, 2.0)) * 2.8;

    vec3 col = mix(uColor, vec3(1.0, 0.95, 0.9), ring * 0.7);
    float alpha = clamp((arc * 0.9 + ring * 1.8) * shimmer * uOpacity, 0.0, 1.0);

    gl_FragColor = vec4(col * alpha * 2.4, alpha);
  }
`

// Shared Geometries across all 10 Black Holes (Zero redundant GPU allocations)
const sharedHorizonGeo = new THREE.SphereGeometry(16, 32, 32)
const sharedDiskGeo = new THREE.PlaneGeometry(115, 115)
const sharedHaloGeo = new THREE.PlaneGeometry(95, 95)
const sharedBlackMat = new THREE.MeshBasicMaterial({ color: 0x000000 })

export default function BlackHoleSingularity({
  position = [0, 0, 0],
  color = "#ffaa00",
  scale = 1.0,
  minDist = 0,
  maxDist = 1500000000,
  flyTo
}) {
  const groupRef = useRef()
  const diskRef = useRef()
  const verticalHaloRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 1.0 },
    uColor: { value: new THREE.Color(color) }
  }), [color])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (diskRef.current) diskRef.current.material.uniforms.uTime.value = t
    if (verticalHaloRef.current) verticalHaloRef.current.material.uniforms.uTime.value = t

    // Distance culling: Only visible when camera is in this cosmic level!
    const camDist = camera.position.length()

    if (camDist < minDist || camDist > maxDist) {
      if (groupRef.current && groupRef.current.visible) groupRef.current.visible = false
      return
    }

    if (groupRef.current && !groupRef.current.visible) groupRef.current.visible = true

    // Smooth opacity fade at level boundaries
    let op = 1.0
    if (minDist > 0 && camDist < minDist * 1.5) {
      op = Math.min(1.0, (camDist - minDist) / (minDist * 0.5))
    } else if (camDist > maxDist * 0.75) {
      op = Math.max(0.0, 1.0 - (camDist - maxDist * 0.75) / (maxDist * 0.25))
    }

    if (diskRef.current) diskRef.current.material.uniforms.uOpacity.value = op
    if (verticalHaloRef.current) verticalHaloRef.current.material.uniforms.uOpacity.value = op

    // Slow majestic precession
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation()
        if (flyTo) flyTo(position, 40 * scale)
      }}
      style={{ cursor: "pointer" }}
    >
      {/* 1. THE EVENT HORIZON: Pure Light-Absorbing Black Sphere (Shared Geo) */}
      <mesh geometry={sharedHorizonGeo} material={sharedBlackMat} />

      {/* 2. THE MAIN ACCRETION DISK (Shared Geo & Emissive Additive Shader) */}
      <mesh ref={diskRef} geometry={sharedDiskGeo} rotation={[-Math.PI / 2.25, 0, 0]}>
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

      {/* 3. THE RELATIVISTIC VERTICAL LENSING HALO (Shared Geo) */}
      <mesh ref={verticalHaloRef} geometry={sharedHaloGeo} rotation={[0, 0, Math.PI / 6]}>
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
    </group>
  )
}
