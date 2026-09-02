import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Earth({ orbitRadius = 15, orbitSpeed = 0.005, rotationSpeed = 0.02, startAngle = 0 }) {
  const groupRef = useRef()
  const earthRef = useRef()
  const cloudsRef = useRef()
  
  // Load high-quality textures
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    '/textures/earth_color.jpg',
    '/textures/earth_normal.png',
    '/textures/earth_water.png',
    '/textures/earth_clouds.png'
  ])

  colorMap.colorSpace = THREE.SRGBColorSpace

  useFrame((state, delta) => {
    // Revolve around sun
    if (groupRef.current) {
      groupRef.current.rotation.y += orbitSpeed * delta
    }
    // Rotate on axis
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * delta
    }
    // Clouds rotate slightly faster
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += (rotationSpeed * 1.2) * delta
    }
  })

  return (
    <group ref={groupRef} rotation={[0, startAngle, 0]}>
      <group position={[orbitRadius, 0, 0]}>
        
        {/* Earth Surface */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhysicalMaterial 
            map={colorMap} 
            normalMap={normalMap}
            roughnessMap={specularMap} 
            roughness={0.7} // Inverted specular for roughness
            metalness={0.1}
          />
        </mesh>

        {/* Cloud Layer (Slightly larger sphere) */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.02, 64, 64]} />
          <meshPhysicalMaterial 
            map={cloudsMap}
            transparent={true}
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Atmosphere Glow (Fresnel Shader) */}
        <mesh>
          <sphereGeometry args={[1.05, 64, 64]} />
          <meshBasicMaterial 
            color="#44aaff"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

      </group>
    </group>
  )
}
