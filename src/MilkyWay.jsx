import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

// The Living Texture Shader
// This shader takes the NASA image and makes the bright spots (stars/core) pulse with cosmic energy.
const livingVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const livingFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  void main() {
    // Exact NASA Image - No twisting, no circular masking, pure original photograph
    vec4 texColor = texture2D(tDiffuse, vUv);
    
    // Brightness calculation
    float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    
    // Flowing cosmic energy (pulses left to right across the image smoothly)
    float pulse = sin(uTime * 2.0 + (vUv.x * 15.0)) * 0.5 + 0.5;
    
    // Boost power on bright pixels (the core and stars)
    float powerMultiplier = 1.0 + (pulse * pow(luminance, 2.0) * 1.5); 
    
    // Apply power
    vec3 finalColor = texColor.rgb * powerMultiplier;
    
    // Output pure image with distance fading
    gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
  }
`

// --- PHOTOREALISTIC WEBGL FBM GALAXY SHADER ---
const proceduralFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  // 2D Random
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Noise
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
    // Twist the coordinates to create a spiral galaxy shape
    float spiralTwist = radius * 6.0 - uTime * 0.8;
    
    vec2 twistedUv = vec2(
        radius * cos(angle - spiralTwist),
        radius * sin(angle - spiralTwist)
    );
    
    // 2. Photorealistic Cosmic Dust
    float dustNoise = fbm(twistedUv * 8.0 + uTime * 0.1);
    
    // Add a second layer of finer dust for extreme detail
    // 3. Galactic Structure
    float core = exp(-radius * 15.0); // Blinding center point
    float disc = exp(-radius * 3.5);  // The main glowing body
    
    // Multiply disc by dust to create dark lanes and glowing gas clouds
    float cosmicEnergy = (dustNoise * disc * 2.0) + core;
    
    // Enhance contrast to make dust lanes look thick and realistic
    cosmicEnergy = pow(cosmicEnergy, 1.4);
    
    // 4. NASA Photorealistic Colors
    vec3 coreColor = vec3(1.0, 0.95, 0.8); // White/Yellow core
    vec3 midColor = vec3(1.0, 0.4, 0.1);   // Intense Orange inner gas
    vec3 edgeColor = vec3(0.05, 0.1, 0.8); // Deep Blue outer stars
    
    // Mix colors based on energy density
    vec3 finalColor = mix(edgeColor, midColor, smoothstep(0.1, 0.5, cosmicEnergy));
    finalColor = mix(finalColor, coreColor, core * 1.5);
    
    // Emit pure cosmic light
    finalColor *= cosmicEnergy * 2.5;
    
    // 5. Perfect Circular Fade Mask
    float mask = smoothstep(0.5, 0.1, radius);
    
    gl_FragColor = vec4(finalColor, mask * uOpacity * clamp(cosmicEnergy * 4.0, 0.0, 1.0));
  }
`

export default function MilkyWay({ position = [0, 0, 0] }) {
  const interiorRef = useRef()
  const exteriorRef = useRef()
  
  const interiorMaterialRef = useRef()
  const exteriorMaterialRef = useRef()
  
  // Load the massive 4K NASA Galaxy Texture
  const galaxyTexture = useLoader(THREE.TextureLoader, '/textures/galaxy.jpg')
  
  const uniforms = useMemo(() => ({
    tDiffuse: { value: galaxyTexture },
    uTime: { value: 0 },
    uOpacity: { value: 1.0 }
  }), [galaxyTexture])

  const proceduralUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 1.0 }
  }), [])

  useFrame(({ clock, camera }) => {
    const time = clock.getElapsedTime()
    const dist = camera.position.distanceTo(new THREE.Vector3(...position))
    
    // --- INTERIOR (SKYBOX) ---
    if (interiorRef.current && interiorMaterialRef.current) {
      interiorRef.current.rotation.y += 0.0005
      interiorMaterialRef.current.uniforms.uTime.value = time
      
      let interiorOpacity = 0
      if (dist > 800 && dist < 35000) {
        interiorOpacity = Math.min((dist - 800) / 2500, 1.0)
      } else if (dist >= 35000 && dist < 50000) {
        interiorOpacity = Math.max(1.0 - (dist - 35000) / 15000, 0.0)
      }
      
      interiorMaterialRef.current.uniforms.uOpacity.value = interiorOpacity
      interiorRef.current.visible = interiorOpacity > 0
    }
    
    // --- EXTERIOR MILKY WAY SPIRAL GALAXY ---
    if (exteriorRef.current && exteriorMaterialRef.current) {
      exteriorMaterialRef.current.uniforms.uTime.value = time
      
      let exteriorOpacity = 0
      // Fades in smoothly as you leave the 25 stars stellar cluster (dist 35K to 65K)
      if (dist > 35000 && dist <= 65000) {
        exteriorOpacity = (dist - 35000) / 30000
      } 
      // Fully visible grand Milky Way galaxy
      else if (dist > 65000 && dist <= 220000) {
        exteriorOpacity = 1.0
      }
      // Smoothly blends into the 1,000 galaxies cluster (ZERO dead gaps!)
      else if (dist > 220000 && dist < 360000) {
        exteriorOpacity = 1.0 - ((dist - 220000) / 140000)
      }
      
      exteriorMaterialRef.current.uniforms.uOpacity.value = Math.max(0, exteriorOpacity)
      exteriorRef.current.visible = exteriorOpacity > 0
    }
  })

  return (
    <group position={position}>
      {/* THE INTERIOR (SKYBOX) */}
      <mesh ref={interiorRef}>
        <sphereGeometry args={[45000, 64, 64]} />
        <shaderMaterial 
          ref={interiorMaterialRef}
          vertexShader={livingVertexShader}
          fragmentShader={livingFragmentShader}
          uniforms={THREE.UniformsUtils.clone(uniforms)}
          transparent={true}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      
      {/* THE EXTERIOR (GRAND SPIRAL GALAXY DISC) */}
      <mesh ref={exteriorRef}>
        <planeGeometry args={[260000, 130000]} />
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
