import React, { useRef, useMemo, useState } from "react"
import { useLoader, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useKineticTrackball } from "./useKineticTrackball"

import { TEN_COSMIC_SPHERES } from "./cosmicSpheresData"

// Custom GLSL Shader for Dynamic Dual-Color Light Mixing on the Panorama Texture
const sphereVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const sphereFragmentShader = `
  uniform sampler2D uTexture;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

    // Dynamic wave light mixing between the two chosen colors
    float wave = sin(vUv.y * 4.0 + uTime * 0.3) * 0.5 + 0.5;
    vec3 mixedLight = mix(uColor1, uColor2, wave);

    // Fresnel rim glow
    float NdotV = clamp(abs(dot(vNormal, vViewDir)), 0.0, 1.0);
    float fresnel = pow(1.0 - NdotV, 2.0);

    // Composite: Texture stars and dust lanes tinted and highlighted by mixed light
    vec3 baseColor = tex.rgb * mixedLight * 1.6;
    vec3 starGlow = mixedLight * pow(lum, 1.8) * 1.2;
    vec3 rimAura = uColor1 * fresnel * 0.9;

    vec3 finalColor = baseColor + starGlow + rimAura;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`

function SingleCosmicSphere({ sphere, texture, onSelect, isVisible }) {
  const rotGroupRef = useRef()
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uColor1: { value: new THREE.Color(sphere.c1) },
    uColor2: { value: new THREE.Color(sphere.c2) },
    uTime: { value: 0 },
    uOpacity: { value: 1.0 }
  }), [texture, sphere])

  const driftDir = sphere.id % 2 === 0 ? 1 : -1
  const { bindGrab } = useKineticTrackball({
    targetRef: rotGroupRef,
    enabled: isVisible,
    idleDriftY: 0.0006 * driftDir,
    idleDriftX: 0,
    sensitivityX: 0.005,
    sensitivityY: 0.004,
    damping: 0.93,
    clampPitch: false
  })

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime + sphere.id * 1.5
    }
  })

  // Base radius: 1,100,000,000 AU (1.1 Billion AU)
  const radius = 1100000000 * sphere.scale

  return (
    <group position={sphere.pos}>
      {/* 360° Rotatable Cosmic Sphere */}
      <group ref={rotGroupRef}>
        <mesh raycast={() => null}>
          <sphereGeometry args={[radius, 48, 24]} />
          <shaderMaterial
            ref={matRef}
            vertexShader={sphereVertexShader}
            fragmentShader={sphereFragmentShader}
            uniforms={uniforms}
            side={THREE.DoubleSide}
            transparent={true}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Interactive 3D Grab Hit Sphere for 360° Rotation */}
      {isVisible && (
        <mesh {...bindGrab}>
          <sphereGeometry args={[radius * 1.02, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

export default function MultiverseFinalSkyPano({ activeCenter = [0, 0, 0] }) {
  const groupRef = useRef()
  const [isLevel7, setIsLevel7] = useState(false)
  const texture = useLoader(THREE.TextureLoader, "/textures/milkyway_pano.jpg")

  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.generateMipmaps = true
      texture.needsUpdate = true
    }
  }, [texture])

  // Visible strictly when entering Level 7 (dist > 140,000,000 AU)
  useFrame(({ camera }) => {
    if (!groupRef.current) return
    const dist = camera.position.length()
    const visible = dist > 140000000
    groupRef.current.visible = visible
    if (visible !== isLevel7) {
      setIsLevel7(visible)
    }
  })

  return (
    <group ref={groupRef}>
      {TEN_COSMIC_SPHERES.map((sphere) => (
        <SingleCosmicSphere
          key={sphere.id}
          sphere={sphere}
          texture={texture}
          isVisible={isLevel7}
        />
      ))}
    </group>
  )
}
