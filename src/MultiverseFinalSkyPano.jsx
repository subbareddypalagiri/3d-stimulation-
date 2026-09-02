import React, { useRef, useMemo } from "react"
import { useLoader, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// 10 Colossal Cosmic Realm Spheres at Level 7 with distinct light-mixing palettes
export const TEN_COSMIC_SPHERES = [
  { id: 0, name: "Prime Realm (Home)", pos: [0, 0, 0], scale: 1.0, c1: "#99ccff", c2: "#ffffff" },
  { id: 1, name: "Aetheria", pos: [3900000000, 500000000, -1400000000], scale: 0.95, c1: "#00f0ff", c2: "#0033cc" },
  { id: 2, name: "Nyx Domain", pos: [-3800000000, -400000000, 1800000000], scale: 1.05, c1: "#cc00ff", c2: "#330088" },
  { id: 3, name: "Solaria Prime", pos: [1400000000, 700000000, 4100000000], scale: 1.1, c1: "#ffaa00", c2: "#ff3300" },
  { id: 4, name: "Elysium Realm", pos: [-1600000000, -600000000, -4000000000], scale: 0.9, c1: "#00ff88", c2: "#005522" },
  { id: 5, name: "Tartarus Core", pos: [3100000000, -700000000, 2900000000], scale: 1.0, c1: "#ff1144", c2: "#770011" },
  { id: 6, name: "Chronos Astral", pos: [-3000000000, 800000000, -3100000000], scale: 0.95, c1: "#ff44cc", c2: "#8800ff" },
  { id: 7, name: "Celestia Crown", pos: [3400000000, -500000000, -3300000000], scale: 1.05, c1: "#00e5ff", c2: "#1de9b6" },
  { id: 8, name: "Hyperion Zenith", pos: [-3500000000, 600000000, 3000000000], scale: 1.0, c1: "#ffdd00", c2: "#ff0066" },
  { id: 9, name: "Nexus Omnis", pos: [0, 3800000000, -500000000], scale: 1.15, c1: "#ffffff", c2: "#4fc3f7" }
]

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

function SingleCosmicSphere({ sphere, texture, onSelect }) {
  const meshRef = useRef()
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uColor1: { value: new THREE.Color(sphere.c1) },
    uColor2: { value: new THREE.Color(sphere.c2) },
    uTime: { value: 0 },
    uOpacity: { value: 1.0 }
  }), [texture, sphere])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime + sphere.id * 1.5
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.0015 * (sphere.id % 2 === 0 ? 1 : -1)
    }
  })

  // Base radius: 1,200,000,000 AU
  const radius = 1200000000 * sphere.scale

  return (
    <group position={sphere.pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          if (onSelect) onSelect(sphere.pos, radius)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = "auto"
        }}
      >
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
  )
}

export default function MultiverseFinalSkyPano({ activeCenter = [0, 0, 0], flyTo }) {
  const groupRef = useRef()
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

  // Visible strictly when entering Level 7 (dist > 150,000,000 AU)
  useFrame(({ camera }) => {
    if (!groupRef.current) return
    const dist = camera.position.length()
    groupRef.current.visible = dist > 140000000
  })

  return (
    <group ref={groupRef}>
      {TEN_COSMIC_SPHERES.map((sphere) => (
        <SingleCosmicSphere
          key={sphere.id}
          sphere={sphere}
          texture={texture}
          onSelect={(pos, radius) => {
            if (flyTo) flyTo(pos, radius * 1.5)
          }}
        />
      ))}
    </group>
  )
}
