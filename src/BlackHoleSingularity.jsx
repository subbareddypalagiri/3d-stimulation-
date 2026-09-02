import React, { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

// Custom Procedural Keplerian Accretion Disk Shader with Relativistic Doppler Beaming
const diskVert = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const diskFrag = `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simplex-like noise helper
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    
    // Event horizon hole cutoff and outer boundary
    if (r < 0.28 || r > 0.98) discard;

    // Keplerian rotation: inner edge rotates faster
    float angle = atan(p.y, p.x);
    float speed = 1.4 / pow(r, 0.75);
    float rotAngle = angle + uTime * speed * 0.45;

    // Swirling turbulent plasma bands
    float n1 = noise(vec2(rotAngle * 4.0, r * 16.0));
    float n2 = noise(vec2(rotAngle * 8.0 - uTime * 0.5, r * 32.0));
    float plasma = pow(n1 * 0.65 + n2 * 0.35, 1.4);

    // Relativistic Doppler Beaming: Approaching side is brighter and hotter
    float doppler = 0.5 + 0.5 * sin(angle);
    float temp = mix(0.7, 1.6, doppler);

    // Intense photon ring spike at event horizon edge
    float photonRing = exp(-pow((r - 0.30) * 22.0, 2.0)) * 2.4;

    // Radial gradient fade
    float radialFade = smoothstep(0.28, 0.38, r) * (1.0 - smoothstep(0.72, 0.98, r));

    // Blended thermal color: Electric Cyan / Burning Gold / Deep Blue
    vec3 hotColor = vec3(1.0, 0.9, 0.7);
    vec3 midColor = uColor;
    vec3 coldColor = vec3(0.9, 0.2, 0.05);

    vec3 finalColor = mix(coldColor, midColor, doppler);
    finalColor = mix(finalColor, hotColor, photonRing * 0.7 + plasma * 0.4);

    float alpha = (plasma * 1.5 + photonRing * 2.0) * radialFade * temp * uOpacity;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(finalColor * 2.5 * temp, alpha);
  }
`

export default function BlackHoleSingularity({
  position = [0, 0, 0],
  color = "#ffaa00",
  title = "PROJECT",
  subtitle = "Subsystem",
  badge = "FLAGSHIP",
  description = "Description text here.",
  techStack = ["React", "Node"],
  links = [],
  flyTo
}) {
  const groupRef = useRef()
  const diskRef = useRef()
  const verticalHaloRef = useRef()
  const [proximity, setProximity] = useState(0) // 0 (far) to 1 (close)
  const [isCloseEnough, setIsCloseEnough] = useState(false)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uColor: { value: new THREE.Color(color) }
  }), [color])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (diskRef.current) diskRef.current.material.uniforms.uTime.value = t
    if (verticalHaloRef.current) verticalHaloRef.current.material.uniforms.uTime.value = t

    // Distance to camera
    const pos = new THREE.Vector3(...position)
    const dist = camera.position.distanceTo(pos)

    // Calculate proximity: reveals when dist < 650, fully visible when dist < 320
    let prox = 0
    if (dist < 650) {
      prox = Math.min(1.0, (650 - dist) / 330)
    }
    setProximity(prox)
    setIsCloseEnough(dist < 750)

    // Subtle breathing animation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* 1. THE EVENT HORIZON (Pure Light-Absorbing Black Sphere) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          if (flyTo) flyTo(position, 35)
        }}
        style={{ cursor: "pointer" }}
      >
        <sphereGeometry args={[14, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. THE HORIZONTAL ACCRETION DISK (Keplerian Plasma) */}
      <mesh ref={diskRef} rotation={[-Math.PI / 2.3, 0, 0]}>
        <planeGeometry args={[95, 95]} />
        <shaderMaterial
          vertexShader={diskVert}
          fragmentShader={diskFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. THE RELATIVISTIC VERTICAL LENSING HALO (Gargantua Arc) */}
      <mesh ref={verticalHaloRef} rotation={[0, 0, Math.PI / 8]}>
        <planeGeometry args={[75, 75]} />
        <shaderMaterial
          vertexShader={diskVert}
          fragmentShader={diskFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. GRAVITATIONAL ENERGY CORE GLOW */}
      <pointLight color={color} intensity={2.5} distance={180} />

      {/* 5. 3D SPATIAL HOLOGRAPHIC DATA MANIFESTATION */}
      {isCloseEnough && (
        <Html
          position={[0, 24, 0]}
          center
          distanceFactor={180}
          zIndexRange={[100, 0]}
          transform
          sprite
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
              if (flyTo) flyTo(position, 35)
            }}
            style={{
              opacity: proximity,
              transform: `scale(${0.7 + proximity * 0.3})`,
              transition: "opacity 0.25s ease, transform 0.25s ease",
              pointerEvents: proximity > 0.3 ? "auto" : "none",
              userSelect: "none",
              cursor: "pointer",
              width: 380,
              background: "rgba(6, 10, 20, 0.82)",
              backdropFilter: "blur(24px) saturate(200%)",
              border: `1px solid ${color}88`,
              borderRadius: 14,
              padding: "20px 24px",
              boxShadow: `0 16px 48px rgba(0, 0, 0, 0.9), 0 0 32px ${color}33, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
              color: "#ffffff",
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}
          >
            {/* Header Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: color,
                background: `${color}22`,
                border: `1px solid ${color}55`,
                padding: "3px 8px",
                borderRadius: 4,
                textTransform: "uppercase"
              }}>
                ✦ {badge}
              </span>
              <span style={{ fontSize: 9, color: "#8899aa", letterSpacing: "0.05em" }}>
                3D SINGULARITY
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", color: "#ffffff" }}>
              {title}
            </h2>
            <div style={{ fontSize: 11, color: color, fontWeight: 700, marginBottom: 10, letterSpacing: "0.02em" }}>
              {subtitle}
            </div>

            {/* Description */}
            <p style={{ margin: "0 0 14px 0", fontSize: 11.5, lineHeight: 1.55, color: "#cbd5e1" }}>
              {description}
            </p>

            {/* Tech Stack Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#e2e8f0",
                    padding: "3px 8px",
                    borderRadius: 4
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Action Links */}
            {links.length > 0 && (
              <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 10 }}>
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: link.primary ? color : "rgba(255, 255, 255, 0.1)",
                      color: link.primary ? "#000000" : "#ffffff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "6px 12px",
                      borderRadius: 6,
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      border: link.primary ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <span>{link.icon || "🔗"}</span>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
