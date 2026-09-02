import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'

export default function Planet({ 
  position, 
  radius, 
  rotationSpeed, 
  orbitSpeed, 
  textures = {}, 
  color = '#ffffff',
  onClick, 
  hasClouds = false,
  ring = null
}) {
  const planetRef = useRef()
  const groupRef = useRef()

  // Safely load textures only if they are provided
  const texturePaths = [
    textures.color || null,
    textures.normal || null,
    textures.specular || null,
    textures.clouds || null
  ]

  // Use map to load valid textures, ignore nulls
  const loadedTextures = useLoader(TextureLoader, texturePaths.filter(Boolean))
  
  // Re-map back to variables based on what was passed
  let texIndex = 0;
  const colorMap = textures.color ? loadedTextures[texIndex++] : null;
  const normalMap = textures.normal ? loadedTextures[texIndex++] : null;
  const specularMap = textures.specular ? loadedTextures[texIndex++] : null;
  const cloudsMap = textures.clouds ? loadedTextures[texIndex++] : null;

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * orbitSpeed
    if (planetRef.current) planetRef.current.rotation.y += delta * rotationSpeed
  })

  return (
    <group ref={groupRef}>
      {/* Subtle Orbital Line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[position[0] - 0.06, position[0] + 0.06, 64]} />
        <meshBasicMaterial color="#335577" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group 
        position={position} 
        onClick={(e) => {
          e.stopPropagation()
          if (onClick) onClick(position, radius)
        }}
        onPointerOver={(e) => document.body.style.cursor = 'pointer'}
        onPointerOut={(e) => document.body.style.cursor = 'auto'}
      >
        <mesh ref={planetRef} castShadow receiveShadow>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshPhysicalMaterial
            map={colorMap}
            color={!colorMap ? color : '#ffffff'}
            normalMap={normalMap}
            roughnessMap={specularMap}
            clearcoat={specularMap ? 0.5 : 0.0} 
            clearcoatRoughness={0.1}
            metalness={specularMap ? 0.1 : 0.0}
            roughness={specularMap ? 0.8 : (colorMap ? 0.6 : 0.8)}
          />
        </mesh>

        {hasClouds && cloudsMap && (
          <mesh>
            <sphereGeometry args={[radius * 1.01, 128, 128]} />
            <meshStandardMaterial
              map={cloudsMap}
              transparent={true}
              opacity={0.8}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Cinematic Rings (Saturn/Uranus) */}
        {ring && (
          <mesh rotation={[Math.PI / 2 + 0.2, 0, 0]} castShadow receiveShadow>
            <ringGeometry args={[ring.innerRadius, ring.outerRadius, 128]} />
            <meshPhysicalMaterial 
              color={ring.color}
              transparent 
              opacity={0.9} 
              side={THREE.DoubleSide} 
              roughness={0.8}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}
