import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { useKineticTrackball } from './useKineticTrackball'

// Procedural high-resolution banded planetary ring texture (Cassini Division & ringlets)
function makeBandedRingTexture(baseColorHex = '#fbbf24') {
  const width = 1024
  const height = 64
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const baseCol = new THREE.Color(baseColorHex)
  const hsl = { h: 0, s: 0, l: 0 }
  baseCol.getHSL(hsl)

  for (let x = 0; x < width; x++) {
    const u = x / width // 0 = inner edge, 1 = outer edge

    let alpha = 0.0
    let lightAdj = 0.0

    // C Ring (Crepe Ring: translucent inner)
    if (u < 0.28) {
      alpha = THREE.MathUtils.smoothstep(u, 0.02, 0.25) * 0.45
      lightAdj = -0.1
    }
    // B Ring (Main dense, bright golden ring)
    else if (u >= 0.28 && u < 0.70) {
      alpha = 0.88 + Math.sin(u * 180.0) * 0.08
      lightAdj = 0.12
    }
    // Cassini Division (Dark gap in rings)
    else if (u >= 0.70 && u < 0.76) {
      alpha = 0.04
      lightAdj = -0.4
    }
    // A Ring (Outer ring with fine sub-bands)
    else if (u >= 0.76 && u < 0.96) {
      alpha = 0.72 + Math.sin(u * 240.0) * 0.12
      // Encke gap
      if (u > 0.89 && u < 0.91) {
        alpha = 0.08
      }
      lightAdj = 0.02
    }
    // F Ring & outer fade
    else {
      alpha = (1.0 - THREE.MathUtils.smoothstep(u, 0.96, 1.0)) * 0.5
      lightAdj = 0.05
    }

    // Micro-ringlet noise
    const noise = Math.sin(x * 1.8) * 0.06
    alpha = Math.max(0.0, Math.min(1.0, alpha + noise))

    const ringCol = new THREE.Color().setHSL(
      hsl.h + (Math.sin(x * 0.1) * 0.02),
      Math.max(0.2, hsl.s),
      Math.max(0.1, Math.min(0.9, hsl.l + lightAdj))
    )

    ctx.fillStyle = `rgba(${Math.floor(ringCol.r * 255)}, ${Math.floor(ringCol.g * 255)}, ${Math.floor(ringCol.b * 255)}, ${alpha})`
    ctx.fillRect(x, 0, 1, height)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// Atmospheric Limb Glow Shader (Rayleigh daylight scattering & Mie terminator sunset glow)
const atmoVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const atmoFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uSunsetColor;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    float rim = pow(max(0.0, 0.78 - dot(vNormal, vViewDir)), uPower);
    
    // Direction vector pointing to the central Star
    vec3 sunDir = normalize(-vWorldPos);
    float sunFacing = dot(vWorldNormal, sunDir);

    // Rayleigh daylight vs Mie sunset scatter along terminator line
    float sunsetMix = smoothstep(-0.25, 0.25, sunFacing) * (1.0 - smoothstep(0.2, 0.7, sunFacing));
    vec3 atmoCol = mix(uColor, uSunsetColor, sunsetMix * 0.75);

    // Illuminated daylight side vs dark space night side
    float dayFactor = smoothstep(-0.35, 0.45, sunFacing);
    float intensity = rim * (0.18 + 0.82 * dayFactor);
    intensity = clamp(intensity, 0.0, 1.0);

    gl_FragColor = vec4(atmoCol, intensity * 0.98);
  }
`

function AtmosphereHalo({ radius, color, power = 2.2 }) {
  const sunsetColor = useMemo(() => {
    const col = new THREE.Color(color)
    const hsl = { h: 0, s: 0, l: 0 }
    col.getHSL(hsl)
    return new THREE.Color().setHSL((hsl.h + 0.07) % 1.0, 0.95, 0.58)
  }, [color])

  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uSunsetColor: { value: sunsetColor },
    uPower: { value: power }
  }), [color, sunsetColor, power])

  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[radius * 1.045, 64, 64]} />
      <shaderMaterial
        vertexShader={atmoVertexShader}
        fragmentShader={atmoFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Planet({ 
  position, 
  radius, 
  rotationSpeed, 
  orbitSpeed, 
  textures = {}, 
  color = '#ffffff',
  atmosphere = null,
  atmoPower = 2.2,
  onClick, 
  hasClouds = false,
  ring = null
}) {
  const planetRef = useRef()
  const planetRotGroupRef = useRef()
  const cloudsRef = useRef()
  const groupRef = useRef()

  // Safely load textures only if they are provided
  const texturePaths = [
    textures.color || null,
    textures.normal || null,
    textures.specular || null,
    textures.clouds || null
  ]

  const loadedTextures = useLoader(TextureLoader, texturePaths.filter(Boolean))
  
  let texIndex = 0
  const colorMap = textures.color ? loadedTextures[texIndex++] : null
  const normalMap = textures.normal ? loadedTextures[texIndex++] : null
  const specularMap = textures.specular ? loadedTextures[texIndex++] : null
  const cloudsMap = textures.clouds ? loadedTextures[texIndex++] : null

  // Procedural banded ring texture with Cassini gap
  const ringTexture = useMemo(() => {
    if (!ring) return null
    return makeBandedRingTexture(ring.color || '#fbbf24')
  }, [ring])

  const handleClick = (e) => {
    if (onClick) {
      const worldPos = new THREE.Vector3()
      if (planetRef.current) {
        planetRef.current.getWorldPosition(worldPos)
      } else if (e?.object) {
        e.object.getWorldPosition(worldPos)
      }
      onClick([worldPos.x, worldPos.y, worldPos.z], radius)
    }
  }

  // 360° Free Kinetic Trackball for the planet
  const { bindGrab } = useKineticTrackball({
    targetRef: planetRotGroupRef,
    idleDriftY: rotationSpeed,
    idleDriftX: 0,
    sensitivityX: 0.007,
    sensitivityY: 0.006,
    damping: 0.92,
    clampPitch: false,
    onClick: handleClick
  })

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * orbitSpeed
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * (rotationSpeed * 0.45)
  })

  // Atmospheric color preset default
  const atmoColor = atmosphere || (hasClouds ? '#38bdf8' : null)

  return (
    <group ref={groupRef}>
      {/* Subtle Orbital Trail */}
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[position[0] - 0.08, position[0] + 0.08, 96]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group position={position}>
        {/* Invisible expanded hit target for 360° grab rotation & clicking */}
        <mesh {...bindGrab}>
          <sphereGeometry args={[Math.max(radius * 3.4, 4.2), 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Atmospheric Rayleigh Scattering Halo */}
        {atmoColor && (
          <AtmosphereHalo radius={radius} color={atmoColor} power={atmoPower} />
        )}

        {/* Rotatable Planet Body */}
        <group ref={planetRotGroupRef}>
          <mesh ref={planetRef} castShadow receiveShadow>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshPhysicalMaterial
              map={colorMap}
              color={!colorMap ? color : '#ffffff'}
              normalMap={normalMap}
              normalScale={new THREE.Vector2(0.85, 0.85)}
              clearcoat={specularMap ? 1.0 : 0.0}
              clearcoatMap={specularMap}
              clearcoatRoughness={0.12}
              metalness={0.02}
              roughness={specularMap ? 0.75 : (colorMap ? 0.6 : 0.75)}
            />
          </mesh>

          {/* Earth Multi-Layer Clouds with Transparency and Shadow Depth */}
          {hasClouds && cloudsMap && (
            <mesh ref={cloudsRef} raycast={() => null}>
              <sphereGeometry args={[radius * 1.018, 96, 96]} />
              <meshStandardMaterial
                map={cloudsMap}
                transparent
                opacity={0.88}
                depthWrite={false}
                blending={THREE.NormalBlending}
              />
            </mesh>
          )}

          {/* High-Resolution Banded Rings (Saturn / Uranus with Cassini Gap) */}
          {ring && ringTexture && (
            <mesh rotation={[Math.PI / 2 + 0.22, 0, 0]} castShadow receiveShadow>
              <ringGeometry args={[ring.innerRadius, ring.outerRadius, 128]} />
              <meshStandardMaterial 
                map={ringTexture}
                transparent 
                opacity={0.96} 
                side={THREE.DoubleSide} 
                roughness={0.7}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
}
