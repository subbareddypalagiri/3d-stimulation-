import { useRef } from 'react'
import { useFrame, extend, useLoader } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 1. Define the FAANG-quality Shader Logic for the Sun Surface
const SunMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: null,
    uColorDark: new THREE.Color('#220000'),
    uColorRed: new THREE.Color('#cc1100'),
    uColorOrange: new THREE.Color('#ff6600'),
    uColorWhite: new THREE.Color('#ffeeaa'),
  },
  // VERTEX SHADER
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // FRAGMENT SHADER
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec3 uColorDark;
    uniform vec3 uColorRed;
    uniform vec3 uColorOrange;
    uniform vec3 uColorWhite;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // Simplex Noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    float fbmLiquid(vec3 p) {
      float f = 0.0;
      float amp = 0.5;
      for(int i = 0; i < 6; i++) {
        f += amp * abs(snoise(p)); 
        p *= 2.0;
        amp *= 0.5;
      }
      return f;
    }

    void main() {
      // Flowmap logic
      vec3 flowPos = vPosition * 1.5;
      flowPos.x += uTime * 0.15;
      flowPos.y += snoise(vPosition + uTime * 0.1) * 0.5;
      
      float noise1 = fbmLiquid(flowPos);
      float noise2 = fbmLiquid(vPosition * 3.0 - uTime * 0.2);
      
      float n = (noise1 * 0.6 + noise2 * 0.4);
      n = 1.0 - n;

      // Sample the real lava/sun texture, but distort its UVs using the fluid noise!
      vec2 distortedUV = vUv + vec2(noise1 * 0.1, noise2 * 0.1);
      vec4 texColor = texture2D(uTexture, distortedUV * 2.0); // Tile it
      
      vec3 color = mix(uColorDark, uColorRed, smoothstep(0.0, 0.35, n));
      color = mix(color, uColorOrange, smoothstep(0.35, 0.7, n));
      
      // Blend the real photorealistic texture into our math shader for maximum details
      color = mix(color, texColor.rgb * 1.5, 0.5); 
      color = mix(color, uColorWhite, smoothstep(0.7, 1.0, n));
      
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = dot(viewDir, vNormal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 3.0);
      
      color += uColorOrange * fresnel * 2.0;

      gl_FragColor = vec4(color * 1.5, 1.0);
    }
  `
)

// 2. Define the Fire Layer Shader (Solar Flares/Prominences)
const FireMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: null,
    uColorRed: new THREE.Color('#cc1100'),
    uColorOrange: new THREE.Color('#ff6600'),
  },
  // VERTEX SHADER (Vertex Displacement for Fire Spikes)
  `
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform float uTime;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vPosition = position;
      vUv = uv;
      float noise = snoise(position * 1.2 - uTime * 0.4);
      float disp = max(0.0, noise) * 1.5; 
      vec3 newPos = position + normal * disp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // FRAGMENT SHADER (Alpha Masking for Wispy Flames + Texture Detail)
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec3 uColorRed;
    uniform vec3 uColorOrange;
    varying vec3 vPosition;
    varying vec2 vUv;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      float fireNoise = snoise(vPosition * 2.5 - uTime * 0.8);
      float alpha = smoothstep(0.2, 0.6, fireNoise);
      
      vec4 texColor = texture2D(uTexture, vUv * 3.0 + vec2(uTime * 0.1));
      
      vec3 color = mix(uColorRed, uColorOrange, alpha);
      
      color = mix(color, texColor.rgb * 2.0, 0.3); // Mix in texture for gritty real details

      gl_FragColor = vec4(color * 2.5, alpha * 0.8);
    }
  `
)

extend({ SunMaterial, FireMaterial })

export default function Sun({ 
  position = [0, 0, 0], 
  colorDark = '#220000',
  colorRed = '#cc1100',
  colorOrange = '#ff6600',
  colorWhite = '#ffeeaa',
  ...props 
}) {
  const sunMatRef = useRef()
  const fireMatRef = useRef()
  const groupRef = useRef()
  
  const sunTexture = useLoader(THREE.TextureLoader, '/textures/sun.jpg')
  sunTexture.wrapS = sunTexture.wrapT = THREE.RepeatWrapping;

  // Sync props to uniforms
  useFrame((state, delta) => {
    if (sunMatRef.current) {
      sunMatRef.current.uTime += delta * 0.15 
      sunMatRef.current.uColorDark.set(colorDark)
      sunMatRef.current.uColorRed.set(colorRed)
      sunMatRef.current.uColorOrange.set(colorOrange)
      sunMatRef.current.uColorWhite.set(colorWhite)
    }
    if (fireMatRef.current) {
      fireMatRef.current.uTime += delta * 0.2 
      fireMatRef.current.uColorRed.set(colorRed)
      fireMatRef.current.uColorOrange.set(colorOrange)
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02 
    }
  })

  return (
    <group ref={groupRef} position={position} {...props}>
      <mesh>
        <sphereGeometry args={[3, 48, 48]} />
        <sunMaterial ref={sunMatRef} uTexture={sunTexture} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[3.05, 48, 48]} />
        <fireMaterial ref={fireMatRef} uTexture={sunTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
