import React from 'react'
import Planet from './Planet'
import Earth from './Earth'

export default function SolarSystem() {
  // Artistic scale: Distances and sizes are NOT true to physics, 
  // they are balanced to look visually stunning on screen.
  
  return (
    <group>
      {/* Mercury */}
      <Planet 
        color="#8c8c8c"
        size={0.4} 
        orbitRadius={6} 
        orbitSpeed={0.8} 
        rotationSpeed={0.01} 
        startAngle={Math.random() * Math.PI * 2}
      />
      
      {/* Venus */}
      <Planet 
        color="#e3bb76"
        size={0.6} 
        orbitRadius={9} 
        orbitSpeed={0.6} 
        rotationSpeed={0.008} 
        startAngle={Math.random() * Math.PI * 2}
      />

      {/* Earth (Uses High-Res Textures and Custom Shaders) */}
      <Earth 
        orbitRadius={13} 
        orbitSpeed={0.5} 
        rotationSpeed={0.02} 
        startAngle={Math.random() * Math.PI * 2}
      />

      {/* Mars */}
      <Planet 
        color="#c1440e"
        size={0.5} 
        orbitRadius={17} 
        orbitSpeed={0.4} 
        rotationSpeed={0.018} 
        startAngle={Math.random() * Math.PI * 2}
      />

      {/* Jupiter */}
      <Planet 
        color="#c88b3a"
        size={2.5} 
        orbitRadius={25} 
        orbitSpeed={0.2} 
        rotationSpeed={0.04} 
        startAngle={Math.random() * Math.PI * 2}
      />

      {/* Saturn */}
      <Planet 
        color="#e3e0c0"
        size={2.0} 
        orbitRadius={34} 
        orbitSpeed={0.15} 
        rotationSpeed={0.038} 
        startAngle={Math.random() * Math.PI * 2}
        hasRings={true}
      />

      {/* Uranus */}
      <Planet 
        color="#4b70dd"
        size={1.2} 
        orbitRadius={42} 
        orbitSpeed={0.1} 
        rotationSpeed={0.03} 
        startAngle={Math.random() * Math.PI * 2}
      />

      {/* Neptune */}
      <Planet 
        color="#274687"
        size={1.1} 
        orbitRadius={50} 
        orbitSpeed={0.08} 
        rotationSpeed={0.032} 
        startAngle={Math.random() * Math.PI * 2}
      />
    </group>
  )
}
