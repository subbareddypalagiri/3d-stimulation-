import React, { useMemo } from 'react'
import * as THREE from 'three'
import Sun from './Sun'
import Planet from './Planet'

const AVAILABLE_TEXTURES = [
  { color: '/textures/mercury.jpg' },
  { color: '/textures/venus.jpg' },
  { color: '/textures/earth_color.jpg', normal: '/textures/earth_normal.png', specular: '/textures/earth_water.png', clouds: '/textures/earth_clouds.png' },
  { color: '/textures/mars.jpg' },
  { color: '/textures/jupiter.jpg' },
  { color: '/textures/saturn.jpg' },
  { color: '/textures/uranus.jpg' },
  { color: '/textures/neptune.jpg' }
]

export default function SolarSystem({ 
  id = 0,
  position = [0, 0, 0], 
  sunColors, 
  speedMultiplier = 1,
  scale = 1,
  planetCount = 8, 
  onSelectSystem 
}) {
  
  const planetsData = useMemo(() => {
    // HOME SYSTEM (ID = 0): THE REAL 9 PLANETS
    if (id === 0) {
      return [
        { name: 'Mercury', position: [15, 0, 0], radius: 0.38, orbitSpeed: 0.04, rotationSpeed: 0.01, textures: { color: '/textures/mercury.jpg' }, hasClouds: false, ring: null },
        { name: 'Venus', position: [22, 0, 0], radius: 0.95, orbitSpeed: 0.015, rotationSpeed: -0.002, textures: { color: '/textures/venus.jpg' }, hasClouds: false, ring: null },
        { name: 'Earth', position: [30, 0, 0], radius: 1, orbitSpeed: 0.01, rotationSpeed: 0.02, textures: { color: '/textures/earth_color.jpg', normal: '/textures/earth_normal.png', specular: '/textures/earth_water.png', clouds: '/textures/earth_clouds.png' }, hasClouds: true, ring: null },
        { name: 'Mars', position: [40, 0, 0], radius: 0.53, orbitSpeed: 0.008, rotationSpeed: 0.018, textures: { color: '/textures/mars.jpg' }, hasClouds: false, ring: null },
        { name: 'Jupiter', position: [65, 0, 0], radius: 4.2, orbitSpeed: 0.002, rotationSpeed: 0.04, textures: { color: '/textures/jupiter.jpg' }, hasClouds: false, ring: null },
        { name: 'Saturn', position: [95, 0, 0], radius: 3.5, orbitSpeed: 0.0009, rotationSpeed: 0.038, textures: { color: '/textures/saturn.jpg' }, hasClouds: false, ring: { innerRadius: 4.5, outerRadius: 7.5, color: '#eebb99' } },
        { name: 'Uranus', position: [130, 0, 0], radius: 1.5, orbitSpeed: 0.0004, rotationSpeed: -0.03, textures: { color: '/textures/uranus.jpg' }, hasClouds: false, ring: { innerRadius: 2.0, outerRadius: 2.5, color: '#99ccff' } },
        { name: 'Neptune', position: [160, 0, 0], radius: 1.4, orbitSpeed: 0.0001, rotationSpeed: 0.032, textures: { color: '/textures/neptune.jpg' }, hasClouds: false, ring: null },
        { name: 'Pluto', position: [180, 0, 0], radius: 0.18, orbitSpeed: 0.00005, rotationSpeed: 0.005, textures: { color: '/textures/mercury.jpg' }, hasClouds: false, ring: null }
      ]
    }

    // ALIEN SYSTEMS (ID > 0): PROCEDURAL RANDOM PLANETS
    const randomPlanets = []
    let currentOrbit = 8 
    
    for (let i = 0; i < planetCount; i++) {
      const tex = AVAILABLE_TEXTURES[Math.floor(Math.random() * AVAILABLE_TEXTURES.length)]
      
      const isGasGiant = Math.random() > 0.7
      const radius = isGasGiant ? 2.0 + Math.random() * 2.5 : 0.4 + Math.random() * 1.2
      
      const orbitSpeed = (0.5 / (currentOrbit * 0.1)) * (0.5 + Math.random() * 0.5)
      
      let ring = null
      if (isGasGiant && Math.random() > 0.5) {
        ring = {
          innerRadius: radius * 1.2,
          outerRadius: radius * (1.8 + Math.random()),
          color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5).getStyle()
        }
      }

      randomPlanets.push({
        name: `Planet-${i}`,
        position: [currentOrbit, 0, 0],
        radius,
        orbitSpeed,
        rotationSpeed: 0.1 + Math.random() * 1.5,
        textures: tex,
        hasClouds: !!tex.clouds,
        ring
      })
      
      currentOrbit += radius * 2 + 4 + Math.random() * 8
    }
    return randomPlanets
  }, [id, planetCount])

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <pointLight 
        intensity={(id === 0 ? 2500 : 1500) * scale} 
        color={sunColors.colorWhite || sunColors.wht} 
        distance={4000 * scale} 
        decay={2} 
        castShadow={id === 0} 
        shadow-mapSize={[1024, 1024]} 
      />
      
      {/* Interactive Sun with generous hit target */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          if (onSelectSystem) {
            onSelectSystem(position, scale)
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'auto'
        }}
      >
        <Sun 
          colorDark={sunColors.colorDark || sunColors.dark}
          colorRed={sunColors.colorRed || sunColors.red}
          colorOrange={sunColors.colorOrange || sunColors.org}
          colorWhite={sunColors.colorWhite || sunColors.wht}
        />
        {/* Generous invisible hit sphere (radius 35) for effortless clicking */}
        <mesh>
          <sphereGeometry args={[35, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {planetsData.map((planet, idx) => {
        return (
          <Planet 
            key={idx}
            {...planet}
            orbitSpeed={planet.orbitSpeed * speedMultiplier}
            rotationSpeed={planet.rotationSpeed * speedMultiplier}
          />
        )
      })}
    </group>
  )
}
