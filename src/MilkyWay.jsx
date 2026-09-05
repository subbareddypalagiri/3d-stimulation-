import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const livingVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// --- PHOTOREALISTIC WEBGL FBM SPIRAL GALAXY SHADER ---
const proceduralFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion (FBM) for realistic dust clouds
  float fbm (in vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  void main() {
    vec2 cUv = vUv - 0.5;
    cUv.x *= 2.0; // Correct 2:1 aspect ratio
    
    float radius = length(cUv);
    float angle = atan(cUv.y, cUv.x);
    
    // 1. Swirling Coordinate System (The Whirlpool)
    float spiralTwist = radius * 6.0 - uTime * 0.8;
    
    vec2 twistedUv = vec2(
        radius * cos(angle - spiralTwist),
        radius * sin(angle - spiralTwist)
    );
    
    // 2. Photorealistic Cosmic Dust
    float dustNoise = fbm(twistedUv * 8.0 + uTime * 0.1);
    
    // 3. Galactic Structure
    float core = exp(-radius * 15.0); // Bright center point
    float disc = exp(-radius * 3.5);  // The main glowing body
    
    // Multiply disc by dust to create dark lanes and glowing gas clouds
    float cosmicEnergy = (dustNoise * disc * 2.0) + core;
    cosmicEnergy = pow(cosmicEnergy, 1.4);
    
    // 4. NASA Colors: Warm golden core, vibrant inner arms, deep blue outer periphery
    vec3 coreColor = vec3(1.0, 0.95, 0.8);
    vec3 midColor = vec3(1.0, 0.4, 0.1);
    vec3 edgeColor = vec3(0.05, 0.1, 0.8);
    
    vec3 finalColor = mix(edgeColor, midColor, smoothstep(0.1, 0.5, cosmicEnergy));
    finalColor = mix(finalColor, coreColor, core * 1.5);
    finalColor *= cosmicEnergy * 2.5;
    
    // 5. Perfect Circular Fade Mask
    float mask = smoothstep(0.5, 0.1, radius);
    
    gl_FragColor = vec4(finalColor, mask * uOpacity * clamp(cosmicEnergy * 4.0, 0.0, 1.0));
  }
`

export default function MilkyWay({ position = [0, 0, 0] }) {
  const exteriorRef = useRef()
  const exteriorMaterialRef = useRef()

  const proceduralUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.0 }
  }), [])

  useFrame(({ clock, camera }) => {
    const time = clock.getElapsedTime()
    const dist = camera.position.distanceTo(new THREE.Vector3(...position))
    
    // --- EXTERIOR MILKY WAY SPIRAL GALAXY DISC ONLY ---
    // Smoothly reveals only as you leave the 25 stars stellar cluster (dist 60K to 100K)
    if (exteriorRef.current && exteriorMaterialRef.current) {
      exteriorMaterialRef.current.uniforms.uTime.value = time
      
      let exteriorOpacity = 0
      if (dist > 60000 && dist <= 110000) {
        exteriorOpacity = (dist - 60000) / 50000
      } else if (dist > 110000 && dist <= 420000) {
        exteriorOpacity = 1.0
      } else if (dist > 420000 && dist < 700000) {
        exteriorOpacity = 1.0 - ((dist - 420000) / 280000)
      }
      
      exteriorMaterialRef.current.uniforms.uOpacity.value = Math.max(0, exteriorOpacity)
      exteriorRef.current.visible = exteriorOpacity > 0
    }
  })

  return (
    <group position={position}>
      {/* THE EXTERIOR GRAND SPIRAL GALAXY DISC */}
      <mesh ref={exteriorRef} rotation={[-Math.PI / 6, 0, 0]}>
        <planeGeometry args={[450000, 225000]} />
        <shaderMaterial 
          ref={exteriorMaterialRef}
          vertexShader={livingVertexShader}
          fragmentShader={proceduralFragmentShader}
          uniforms={proceduralUniforms}
          transparent={true}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    </group>
  )
}
