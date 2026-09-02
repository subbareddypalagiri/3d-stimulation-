import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Planet({ 
  textureUrl, 
  color = '#ffffff',
  size = 1, 
  orbitRadius = 10, 
  orbitSpeed = 0.01, 
  rotationSpeed = 0.01,
  startAngle = 0,
  hasRings = false
}) {
  const groupRef = useRef()
  const planetRef = useRef()
  
  // Conditionally load texture if provided, otherwise null
  let colorMap = null
  try {
    if (textureUrl) {
      colorMap = useTexture(textureUrl)
      colorMap.colorSpace = THREE.SRGBColorSpace
    }
  } catch (e) {
    console.warn("Could not load texture:", textureUrl)
  }

  useFrame((state, delta) => {
    // Revolve around sun
    if (groupRef.current) {
      groupRef.current.rotation.y += orbitSpeed * delta
    }
    // Rotate on axis
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed * delta
    }
  })

  return (
    <group ref={groupRef} rotation={[0, startAngle, 0]}>
      <group position={[orbitRadius, 0, 0]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshPhysicalMaterial 
            map={colorMap} 
            color={!colorMap ? color : '#ffffff'}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Simple Saturn Ring implementation if requested */}
        {hasRings && (
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[size * 1.5, size * 2.5, 64]} />
            <meshPhysicalMaterial 
              color="#ccaa88" 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}
