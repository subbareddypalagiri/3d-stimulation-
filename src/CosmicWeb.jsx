import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// ============================================================
// 1. GALAXY SHADER (1000 Spiral Galaxies Cluster)
// ============================================================
const galaxyVert = `
  attribute float instanceSeed;
  varying vec2 vUv;
  varying float vSeed;
  void main() {
    vUv = uv; vSeed = instanceSeed;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
  }
`
const galaxyFrag = `
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  varying float vSeed;
  float hash2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise2(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f); return mix(mix(hash2(i),hash2(i+vec2(1,0)),u.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),u.x),u.y); }
  float fbm2(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*noise2(p);p*=2.0;a*=0.5;} return v; }
  void main() {
    vec2 c=vUv-0.5; c.x*=2.0;
    float r=length(c),angle=atan(c.y,c.x),t=uTime*(0.3+vSeed*0.4)+vSeed*100.0;
    float twist=r*5.0-t*0.6;
    vec2 tw=vec2(r*cos(angle-twist),r*sin(angle-twist));
    float dust=fbm2(tw*6.0+t*0.08)*0.65+fbm2(tw*14.0-t*0.12)*0.35;
    float core=exp(-r*14.0),disc=exp(-r*3.2);
    float energy=pow((dust*disc*1.8)+core,1.5);
    vec3 c1=vec3(0.05+vSeed*0.1,0.15+vSeed*0.2,0.9-vSeed*0.3);
    vec3 c2=vec3(0.9,0.4+vSeed*0.3,0.1),c3=vec3(1.0,0.95,0.85);
    vec3 color=mix(c1,c2,smoothstep(0.1,0.55,energy));
    color=mix(color,c3,core*1.8); color*=energy*2.2;
    float alpha=smoothstep(0.5,0.05,r)*uOpacity*clamp(energy*3.5,0.0,1.0);
    gl_FragColor=vec4(color,alpha);
  }
`

// ============================================================
// 2. COSMIC WEB SHADER (80 Filament Shells)
// ============================================================
const webVert = `
  attribute float instanceSeed;
  varying vec3 vPos;
  varying float vSeed;
  void main() {
    vPos=position; vSeed=instanceSeed;
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*instanceMatrix*vec4(position,1.0);
  }
`
const webFrag = `
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vPos;
  varying float vSeed;
  float h3(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
  float n3(vec3 p){
    vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm3(vec3 p){ float v=0.0,a=0.6; for(int i=0;i<4;i++){v+=a*n3(p);p*=2.1;a*=0.5;} return v; }
  void main() {
    vec3 n=normalize(vPos); float t=uTime*0.04+vSeed*80.0;
    float energy=pow(fbm3(n*3.5+t)*0.6+fbm3(n*8.0-t*1.3)*0.4,2.8);
    vec3 c1=vec3(0.05,0.15,0.7+vSeed*0.25),c2=vec3(0.7-vSeed*0.3,0.15,0.6+vSeed*0.3);
    vec3 color=mix(c1,c2,smoothstep(0.2,0.6,energy));
    color=mix(color,vec3(1.0,0.9,1.0),smoothstep(0.75,1.0,energy));
    color*=energy*2.5;
    gl_FragColor=vec4(color,uOpacity*clamp(energy*3.0,0.0,1.0));
  }
`

// ============================================================
// 3. MASTERPIECE NASA BUBBLE MULTIVERSE SHADER
// 100% Omnidirectional 3D Spherical - NEVER cuts off from any camera angle!
// ============================================================
const bubbleVert = `
  attribute float instanceSeed;
  #ifndef USE_INSTANCING
    attribute mat4 instanceMatrix;
  #endif
  varying vec3 vLocalPos;
  varying vec3 vViewNormal;
  varying vec3 vViewDir;
  varying float vSeed;

  void main() {
    vLocalPos = position;
    vSeed = instanceSeed;
    mat4 instModel = modelMatrix * instanceMatrix;
    vec4 mvPos = viewMatrix * instModel * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    mat3 normMat = mat3(viewMatrix * instModel);
    vViewNormal = normalize(normMat * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`

const bubbleFrag = `
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vLocalPos;
  varying vec3 vViewNormal;
  varying vec3 vViewDir;
  varying float vSeed;

  vec3 spectralDispersion(float cosA, float seed) {
    float shift = cosA * 3.8 + seed * 6.28318;
    return vec3(sin(shift)*0.5+0.5, sin(shift+2.094)*0.5+0.5, sin(shift+4.188)*0.5+0.5);
  }

  float cosmicNoise(vec3 p, float t, float seed) {
    float v = 0.0, a = 0.55, f = 1.8;
    vec3 offset = vec3(seed * 23.7, seed * 47.1, seed * 89.3);
    for(int i = 0; i < 4; i++) {
      vec3 q = p * f + offset;
      float s1 = sin(q.x + t * 0.25) * cos(q.y - t * 0.3);
      float s2 = cos(q.y + t * 0.2) * sin(q.z + t * 0.35);
      float s3 = sin(q.z - t * 0.22) * cos(q.x + t * 0.18);
      v += a * (s1 + s2 + s3);
      f *= 1.85; a *= 0.5; t *= 1.2;
    }
    return (v + 1.5) / 3.0;
  }

  void main() {
    vec3 vn = normalize(vViewNormal);
    vec3 vd = normalize(vViewDir);
    vec3 lp = normalize(vLocalPos);

    // 100% 360-degree invariant: abs(dot) prevents any angle cut-off!
    float NdotV = clamp(abs(dot(vn, vd)), 0.0, 1.0);
    float rimGlow = pow(1.0 - NdotV, 2.8);
    float softRim = pow(1.0 - NdotV, 1.2);
    float centerView = pow(NdotV, 1.5);

    vec3 iridescence = spectralDispersion(1.0 - NdotV, vSeed);
    float t = uTime * 0.04;
    
    // Pure 3D spherical volumetric noise - looks identical and solid from every single angle!
    float cmbSurface = cosmicNoise(lp * 2.2, t * 0.6, vSeed);
    float innerGalaxies = cosmicNoise(lp * 3.8, t * 0.3, vSeed + 3.1);
    float coreSingularity = exp(-length(lp) * 1.8);
    float internalCosmosEnergy = pow(innerGalaxies * 0.65 + coreSingularity * 1.2, 1.6);

    vec3 deepVoid, gasColor, coreColor, rimHighlight;
    float pClass = floor(vSeed * 5.0);
    if (pClass < 1.0) {
      deepVoid     = vec3(0.01, 0.03, 0.12);
      gasColor     = vec3(0.1,  0.55, 0.95);
      coreColor    = vec3(0.6,  0.95, 1.4);
      rimHighlight = vec3(0.7,  0.9,  1.2);
    } else if (pClass < 2.0) {
      deepVoid     = vec3(0.06, 0.01, 0.08);
      gasColor     = vec3(0.85, 0.25, 0.75);
      coreColor    = vec3(1.3,  0.7,  1.2);
      rimHighlight = vec3(1.0,  0.8,  1.1);
    } else if (pClass < 3.0) {
      deepVoid     = vec3(0.08, 0.03, 0.01);
      gasColor     = vec3(1.0,  0.55, 0.1);
      coreColor    = vec3(1.4,  1.1,  0.4);
      rimHighlight = vec3(1.2,  1.0,  0.8);
    } else if (pClass < 4.0) {
      deepVoid     = vec3(0.01, 0.06, 0.05);
      gasColor     = vec3(0.05, 0.85, 0.65);
      coreColor    = vec3(0.7,  1.35, 1.1);
      rimHighlight = vec3(0.8,  1.2,  1.0);
    } else {
      deepVoid     = vec3(0.08, 0.01, 0.03);
      gasColor     = vec3(0.95, 0.2,  0.35);
      coreColor    = vec3(1.4,  0.9,  0.95);
      rimHighlight = vec3(1.2,  0.9,  1.0);
    }

    vec3 baseColor = mix(deepVoid, gasColor, smoothstep(0.2, 0.7, cmbSurface));
    vec3 finalColor = vec3(0.0);
    finalColor += baseColor * (rimGlow * 1.8 + softRim * 0.5);
    finalColor += iridescence * rimGlow * 1.4;
    finalColor += rimHighlight * pow(rimGlow, 3.5) * 2.2;
    finalColor += (coreColor * internalCosmosEnergy * 1.8 + gasColor * 0.4) * (centerView * 0.7 + 0.3);

    float edgeAlpha = rimGlow * 0.9 + softRim * 0.25;
    float innerAlpha = internalCosmosEnergy * 0.4 + cmbSurface * 0.12;
    float alpha = clamp((edgeAlpha + innerAlpha) * uOpacity, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`

// ============================================================
// 4. LEVEL 6: 20 BOLD, VIBRANT OMNIVERSE MEGA-DOMAINS SHADER
// High contrast, saturated colors, ZERO white-out blowout!
// ============================================================
const omniverseVert = `
  attribute vec3 aColor1;
  attribute vec3 aColor2;
  attribute vec3 aColor3;
  attribute float aSeed;

  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying vec3 vCol1;
  varying vec3 vCol2;
  varying vec3 vCol3;
  varying float vSeed;

  void main() {
    vCol1 = aColor1;
    vCol2 = aColor2;
    vCol3 = aColor3;
    vSeed = aSeed;
    vLocalPos = position;

    mat4 instModel = modelMatrix * instanceMatrix;
    vec4 mvPos = viewMatrix * instModel * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    
    mat3 normMat = mat3(viewMatrix * instModel);
    vWorldNormal = normalize(normMat * normal);

    gl_Position = projectionMatrix * mvPos;
  }
`

const omniverseFrag = `
  uniform float uOpacity;
  uniform float uTime;

  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying vec3 vCol1;
  varying vec3 vCol2;
  varying vec3 vCol3;
  varying float vSeed;

  float bulkWave(vec3 p, float t, float seed) {
    float v = 0.0, a = 0.55, f = 1.3;
    for (int i = 0; i < 4; i++) {
      v += a * sin(p.x * f + t * 0.4 + seed * 20.0 + sin(p.z * f * 0.6));
      v += a * cos(p.y * f - t * 0.35 + seed * 15.0 + cos(p.x * f * 0.7));
      v += a * sin(p.z * f + t * 0.3 - seed * 10.0 + sin(p.y * f * 0.5));
      f *= 1.85; a *= 0.5; t *= 1.2;
    }
    return (v + 1.8) / 3.6;
  }

  void main() {
    vec3 vn = normalize(vWorldNormal);
    vec3 vd = normalize(vViewDir);
    
    // Smooth 3D fresnel
    float NdotV = clamp(dot(vn, vd), 0.0, 1.0);
    float rim = pow(1.0 - NdotV, 2.6);
    float center = pow(NdotV, 1.8);

    float t = uTime * 0.035;
    float wave = bulkWave(normalize(vLocalPos) * 2.8, t, vSeed);
    
    // Bold, rich 3-Color Dynamic Blending (Never over-exposed!)
    vec3 col = mix(vCol1, vCol2, smoothstep(0.18, 0.68, wave));
    col = mix(col, vCol3, smoothstep(0.68, 0.95, wave));
    
    // Rich, saturated, cinematic surface without blinding white blow-out
    vec3 finalColor = col * (0.65 + wave * 0.65);
    finalColor += vCol3 * rim * 1.8; // Bold distinct neon rim
    finalColor += vCol2 * pow(rim, 3.5) * 1.5;

    float alpha = clamp((0.75 + rim * 0.25) * uOpacity, 0.0, 0.96);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// ============================================================
// 5. INTER-UNIVERSAL QUANTUM INFLATON FOAM PARTICLES
// ============================================================
const inflatonVert = `
  attribute float pSize;
  attribute vec3 pColor;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uOpacity;
  uniform float uTime;
  
  void main() {
    vColor = pColor;
    vec3 pos = position;
    pos.x += sin(pos.z * 0.000008 + uTime * 0.06) * 90000.0;
    pos.y += cos(pos.x * 0.000008 + uTime * 0.05) * 90000.0;
    
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = pSize * (12000000.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 1.5, 45.0);
    gl_Position = projectionMatrix * mvPos;
    vAlpha = uOpacity;
  }
`
const inflatonFrag = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float d = length(coord);
    if (d > 0.5) discard;
    float glow = exp(-d * 5.0);
    gl_FragColor = vec4(vColor * glow * 2.2, glow * vAlpha * 0.85);
  }
`

// 20 BOLD, DISTINCT 3-COLOR COMBINATIONS FOR THE OMNIVERSE MEGA-REALMS
const OMNIVERSE_PALETTES = [
  // 1: Solar Crimson & Blazing Amber
  { c1: [1.1, 0.05, 0.15],  c2: [1.4, 0.75, 0.05], c3: [1.5, 1.1, 0.4] },
  // 2: Cyber Violet & Neon Magenta
  { c1: [0.45, 0.02, 0.95], c2: [1.3, 0.15, 0.85], c3: [1.1, 0.7, 1.4] },
  // 3: Emerald Aurora & Electric Jade
  { c1: [0.02, 0.85, 0.35], c2: [0.1, 1.3, 0.85],  c3: [0.8, 1.5, 1.1] },
  // 4: Royal Midnight & Electric Cyan
  { c1: [0.05, 0.1, 0.8],   c2: [0.1, 0.95, 1.4],  c3: [0.9, 1.3, 1.6] },
  // 5: Rose Gold & Sunset Coral
  { c1: [0.95, 0.15, 0.4],  c2: [1.3, 0.6, 0.15],  c3: [1.4, 0.95, 0.7] },
  // 6: Deep Amethyst & Radiant Amber
  { c1: [0.55, 0.02, 0.7],  c2: [1.2, 0.7, 0.15],  c3: [1.2, 0.95, 0.5] },
  // 7: Hyper-Neon Aquamarine & Lime
  { c1: [0.05, 0.95, 0.7],  c2: [0.85, 1.3, 0.1],  c3: [1.2, 1.5, 0.7] },
  // 8: Blazing Magma & Obsidian Flame
  { c1: [0.85, 0.08, 0.02], c2: [1.4, 0.35, 0.05], c3: [1.4, 1.1, 0.25] },
  // 9: Celestial Opal & Prismatic Rainbow
  { c1: [0.2, 0.8, 1.1],    c2: [1.1, 0.35, 0.95], c3: [1.4, 1.3, 0.7] },
  // 10: Arctic Ice & Glacier Cyan
  { c1: [0.1, 0.55, 1.0],   c2: [0.25, 1.15, 1.3], c3: [1.0, 1.4, 1.6] },
  // 11: Lavender Singularity & Orchid Glow
  { c1: [0.65, 0.15, 0.9],  c2: [1.1, 0.45, 0.75], c3: [1.3, 0.95, 1.4] },
  // 12: Copper Sun & Amber Bronze
  { c1: [0.75, 0.3, 0.08],  c2: [1.35, 0.7, 0.15], c3: [1.5, 1.15, 0.5] },
  // 13: Deep Sea Abyss & Bioluminescent Teal
  { c1: [0.01, 0.2, 0.6],   c2: [0.05, 1.0, 0.85], c3: [0.7, 1.4, 1.3] },
  // 14: Ruby Laser & Hot Pink
  { c1: [1.0, 0.02, 0.25],  c2: [1.4, 0.2, 0.65],  c3: [1.5, 0.85, 1.1] },
  // 15: Golden Topaz & Sunfire
  { c1: [0.85, 0.5, 0.04],  c2: [1.35, 1.0, 0.18], c3: [1.5, 1.4, 0.8] },
  // 16: Malachite & Peacock Turquoise
  { c1: [0.05, 0.65, 0.35], c2: [0.1, 0.9, 1.0],   c3: [0.85, 1.4, 1.15] },
  // 17: Ultra-Violet & Plasma Blue
  { c1: [0.4, 0.05, 0.85],  c2: [0.2, 0.55, 1.35], c3: [0.95, 1.2, 1.6] },
  // 18: Coral Reef & Mandarin Orange
  { c1: [0.9, 0.15, 0.3],   c2: [1.25, 0.55, 0.1], c3: [1.45, 0.95, 0.45] },
  // 19: Pure Diamond Light & Starlight Pearl
  { c1: [0.6, 0.75, 1.2],   c2: [1.2, 1.0, 1.3],   c3: [1.6, 1.6, 1.6] },
  // 20: Cosmic Nebula & Stellar Dust
  { c1: [0.75, 0.1, 0.55],  c2: [0.2, 0.75, 1.2],  c3: [1.3, 1.05, 1.5] },
]

export default function CosmicWeb({ activeCenter = [0,0,0] }) {
  const galaxyRef    = useRef()
  const galaxyMat    = useRef()
  const webRef       = useRef()
  const webMat       = useRef()
  const multRef      = useRef()
  const multMat      = useRef()
  const omniverseRef = useRef()
  const omniverseMat = useRef()
  const inflatonRef  = useRef()

  const GALAXY_COUNT    = 1000
  const WEB_COUNT       = 80
  const MULT_COUNT      = 100
  const UNIV_R          = 120000
  const INFLATON_COUNT  = 2500
  const OMNIVERSE_COUNT = 20 // 20 Distinct, non-overlapping Bold Mega-Realms
  
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 1. 1000 Galaxies
  const { gPos, gSeeds } = useMemo(() => {
    const pos = [], seeds = new Float32Array(GALAXY_COUNT)
    for (let i = 0; i < GALAXY_COUNT; i++) {
      const r = 90000 + 1100000 * Math.cbrt(Math.random())
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      pos.push(new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)))
      seeds[i] = Math.random()
    }
    return { gPos: pos, gSeeds: seeds }
  }, [])

  // 2. 80 Cosmic Web Shells
  const { wPos, wSeeds } = useMemo(() => {
    const pos = [], seeds = new Float32Array(WEB_COUNT)
    for (let i = 0; i < WEB_COUNT; i++) {
      const r = 800000 + 3200000 * Math.random()
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      pos.push(new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)))
      seeds[i] = Math.random()
    }
    return { wPos: pos, wSeeds: seeds }
  }, [])

  // 3. 100 NASA Bubble Universes
  const { mPos, mSeeds, mScales } = useMemo(() => {
    const pos = [], seeds = new Float32Array(MULT_COUNT), scales = []
    for (let i = 0; i < MULT_COUNT; i++) {
      const r = 2800000 + 15000000 * Math.pow(Math.random(), 0.8)
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      pos.push(new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)))
      seeds[i] = Math.random()
      scales.push(1100000 + Math.random() * 900000)
    }
    return { mPos: pos, mSeeds: seeds, mScales: scales }
  }, [])

  // 4. Inflaton Quantum Cosmic Particles
  const { inflatonPos, inflatonCols, inflatonSizes } = useMemo(() => {
    const pos = new Float32Array(INFLATON_COUNT * 3)
    const col = new Float32Array(INFLATON_COUNT * 3)
    const sz  = new Float32Array(INFLATON_COUNT)
    for(let i = 0; i < INFLATON_COUNT; i++) {
      const r = 2500000 + 25000000 * Math.random()
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      pos[i*3]   = r * Math.sin(ph) * Math.cos(th)
      pos[i*3+1] = r * Math.sin(ph) * Math.sin(th)
      pos[i*3+2] = r * Math.cos(ph)
      
      const ptype = Math.random()
      if (ptype < 0.35) {
        col[i*3] = 0.2; col[i*3+1] = 0.75; col[i*3+2] = 1.0
      } else if (ptype < 0.7) {
        col[i*3] = 1.0; col[i*3+1] = 0.6; col[i*3+2] = 0.25
      } else {
        col[i*3] = 0.9; col[i*3+1] = 0.35; col[i*3+2] = 0.85
      }
      sz[i] = 16.0 + Math.random() * 26.0
    }
    return { inflatonPos: pos, inflatonCols: col, inflatonSizes: sz }
  }, [])

  // 5. 20 BOLD OMNIVERSE MEGA-DOMAINS DATA (Spaced out comfortably with zero overlap!)
  const { oPos, oScales, oColor1, oColor2, oColor3, oSeeds } = useMemo(() => {
    const pos = []
    const scales = []
    const c1 = new Float32Array(OMNIVERSE_COUNT * 3)
    const c2 = new Float32Array(OMNIVERSE_COUNT * 3)
    const c3 = new Float32Array(OMNIVERSE_COUNT * 3)
    const seeds = new Float32Array(OMNIVERSE_COUNT)

    // 20 Neighboring Mega-Realms on a wide spherical shell (distance 160M to 220M, radii 22M to 28M)
    for (let i = 0; i < OMNIVERSE_COUNT; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / OMNIVERSE_COUNT)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const dist = 165000000 + (i % 4) * 18000000 // Nicely spaced between 165M and 220M

      const x = dist * Math.sin(phi) * Math.cos(theta)
      const y = dist * Math.sin(phi) * Math.sin(theta) * 0.8
      const z = dist * Math.cos(phi)

      pos.push(new THREE.Vector3(x, y, z))
      scales.push(23000000 + (i % 3) * 3000000) // radii ~23M to 29M (zero overlapping!)

      const pal = OMNIVERSE_PALETTES[i % OMNIVERSE_PALETTES.length]
      c1[i*3]   = pal.c1[0]; c1[i*3+1] = pal.c1[1]; c1[i*3+2] = pal.c1[2]
      c2[i*3]   = pal.c2[0]; c2[i*3+1] = pal.c2[1]; c2[i*3+2] = pal.c2[2]
      c3[i*3]   = pal.c3[0]; c3[i*3+1] = pal.c3[1]; c3[i*3+2] = pal.c3[2]
      seeds[i]  = i * 0.23
    }

    return { oPos: pos, oScales: scales, oColor1: c1, oColor2: c2, oColor3: c3, oSeeds: seeds }
  }, [])

  const gUni = useMemo(() => ({ uOpacity:{value:0}, uTime:{value:0} }), [])
  const wUni = useMemo(() => ({ uOpacity:{value:0}, uTime:{value:0} }), [])
  const mUni = useMemo(() => ({ uOpacity:{value:0}, uTime:{value:0} }), [])
  const oUni = useMemo(() => ({ uOpacity:{value:0}, uTime:{value:0} }), [])
  const iUni = useMemo(() => ({ uOpacity:{value:0}, uTime:{value:0} }), [])

  // Place Galaxies
  React.useLayoutEffect(() => {
    if (!galaxyRef.current) return
    gPos.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.rotation.set((Math.random() - 0.5) * Math.PI, Math.random() * Math.PI * 2, Math.random() * Math.PI)
      dummy.scale.setScalar(0.5 + Math.random() * 1.2)
      dummy.updateMatrix()
      galaxyRef.current.setMatrixAt(i, dummy.matrix)
    })
    galaxyRef.current.instanceMatrix.needsUpdate = true
  }, [gPos, dummy])

  // Place Cosmic Webs
  React.useLayoutEffect(() => {
    if (!webRef.current) return
    wPos.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      dummy.scale.setScalar(0.6 + Math.random() * 1.4)
      dummy.updateMatrix()
      webRef.current.setMatrixAt(i, dummy.matrix)
    })
    webRef.current.instanceMatrix.needsUpdate = true
  }, [wPos, dummy])

  // Place 100 NASA Bubble Universes
  React.useLayoutEffect(() => {
    if (!multRef.current) return
    mPos.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      dummy.scale.setScalar(mScales[i])
      dummy.updateMatrix()
      multRef.current.setMatrixAt(i, dummy.matrix)
    })
    multRef.current.instanceMatrix.needsUpdate = true
  }, [mPos, mScales, dummy])

  // Place 20 Bold Omniverse Mega-Domains
  React.useLayoutEffect(() => {
    if (!omniverseRef.current) return
    oPos.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.rotation.set(i * 0.4, i * 0.7, i * 0.2)
      dummy.scale.setScalar(oScales[i])
      dummy.updateMatrix()
      omniverseRef.current.setMatrixAt(i, dummy.matrix)
    })
    omniverseRef.current.instanceMatrix.needsUpdate = true
  }, [oPos, oScales, dummy])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    const center = new THREE.Vector3(...activeCenter)
    const dist = camera.position.distanceTo(center)

    // 1. 1000 Galaxies Cluster (220K -> 2.2M)
    if (galaxyRef.current && galaxyMat.current) {
      let op = 0
      if      (dist > 220000 && dist <= 380000) op = (dist - 220000) / 160000
      else if (dist > 380000 && dist <= 1400000) op = 1.0
      else if (dist > 1400000 && dist <= 2400000) op = 1.0 - (dist - 1400000) / 1000000
      galaxyMat.current.uniforms.uOpacity.value = Math.max(0, op)
      galaxyMat.current.uniforms.uTime.value = t
      galaxyRef.current.visible = op > 0.001
    }

    // 2. Cosmic Web (1.4M -> 8.5M)
    if (webRef.current && webMat.current) {
      let op = 0
      if      (dist > 1400000 && dist <= 2800000) op = (dist - 1400000) / 1400000
      else if (dist > 2800000 && dist <= 6000000) op = 1.0
      else if (dist > 6000000 && dist <= 9500000) op = 1.0 - (dist - 6000000) / 3500000
      webMat.current.uniforms.uOpacity.value = Math.max(0, op)
      webMat.current.uniforms.uTime.value = t
      webRef.current.visible = op > 0.001
    }

    // 3. 100 NASA Bubble Universes (7M -> 60M)
    if (multRef.current && multMat.current) {
      let op = 0
      if      (dist > 7000000 && dist <= 14000000) op = (dist - 7000000) / 7000000
      else if (dist > 14000000 && dist <= 42000000) op = 1.0
      else if (dist > 42000000 && dist <= 65000000) op = 1.0 - (dist - 42000000) / 23000000
      multMat.current.uniforms.uOpacity.value = Math.max(0, op)
      multMat.current.uniforms.uTime.value = t
      multRef.current.visible = op > 0.001
    }

    // 4. LEVEL 6: 20 BOLD OMNIVERSE MEGA-DOMAINS (45M -> 480M+)
    if (omniverseRef.current && omniverseMat.current) {
      const oOp = dist > 45000000 ? Math.min(1.0, (dist - 45000000) / 35000000) : 0
      omniverseMat.current.uniforms.uOpacity.value = oOp
      omniverseMat.current.uniforms.uTime.value = t
      omniverseRef.current.visible = oOp > 0.001
    }

    // 5. Inflaton Quantum Particle Field
    if (inflatonRef.current) {
      const iOp = dist > 6000000 ? Math.min(1.0, (dist - 6000000) / 6000000) : 0
      inflatonRef.current.material.uniforms.uOpacity.value = iOp
      inflatonRef.current.material.uniforms.uTime.value = t
      inflatonRef.current.visible = iOp > 0.001
    }
  })

  return (
    <group position={activeCenter}>
      {/* LEVEL 6: 20 BOLD OMNIVERSE MEGA-DOMAINS (NormalBlending = NO BLOWOUT!) */}
      <instancedMesh ref={omniverseRef} args={[null, null, OMNIVERSE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 48, 48]}>
          <instancedBufferAttribute attach="attributes-aColor1" args={[oColor1, 3]} />
          <instancedBufferAttribute attach="attributes-aColor2" args={[oColor2, 3]} />
          <instancedBufferAttribute attach="attributes-aColor3" args={[oColor3, 3]} />
          <instancedBufferAttribute attach="attributes-aSeed"   args={[oSeeds, 1]} />
        </sphereGeometry>
        <shaderMaterial
          ref={omniverseMat}
          vertexShader={omniverseVert}
          fragmentShader={omniverseFrag}
          uniforms={oUni}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          side={THREE.FrontSide}
        />
      </instancedMesh>

      {/* LEVEL 5: 100 NASA BUBBLE UNIVERSES (100% 3D Omnidirectional, DoubleSide = NEVER CUTS OFF!) */}
      <instancedMesh ref={multRef} args={[null, null, MULT_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 64, 64]}>
          <instancedBufferAttribute attach="attributes-instanceSeed" args={[mSeeds, 1]} />
        </sphereGeometry>
        <shaderMaterial 
          ref={multMat} 
          vertexShader={bubbleVert} 
          fragmentShader={bubbleFrag}
          uniforms={mUni} 
          transparent 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </instancedMesh>

      {/* INFLATON QUANTUM STARDUST PARTICLES */}
      <points ref={inflatonRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[inflatonPos, 3]} />
          <bufferAttribute attach="attributes-pColor" args={[inflatonCols, 3]} />
          <bufferAttribute attach="attributes-pSize" args={[inflatonSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial 
          vertexShader={inflatonVert} 
          fragmentShader={inflatonFrag} 
          uniforms={iUni} 
          transparent 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </points>

      {/* LEVEL 4: LOCAL COSMIC WEB SHELLS */}
      <instancedMesh ref={webRef} args={[null, null, WEB_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[UNIV_R, 48, 48]}>
          <instancedBufferAttribute attach="attributes-instanceSeed" args={[wSeeds, 1]} />
        </sphereGeometry>
        <shaderMaterial 
          ref={webMat} 
          vertexShader={webVert} 
          fragmentShader={webFrag}
          uniforms={wUni} 
          transparent 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </instancedMesh>

      {/* LEVEL 3: 1000 SPIRAL GALAXIES CLUSTER */}
      <instancedMesh ref={galaxyRef} args={[null, null, GALAXY_COUNT]} frustumCulled={false}>
        <planeGeometry args={[32000, 16000]}>
          <instancedBufferAttribute attach="attributes-instanceSeed" args={[gSeeds, 1]} />
        </planeGeometry>
        <shaderMaterial 
          ref={galaxyMat} 
          vertexShader={galaxyVert} 
          fragmentShader={galaxyFrag}
          uniforms={gUni} 
          transparent 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </instancedMesh>
    </group>
  )
}
