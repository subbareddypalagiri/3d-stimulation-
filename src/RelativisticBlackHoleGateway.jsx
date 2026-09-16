import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

const vertShader = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragShader = `
  uniform float uTime;
  uniform vec3 uCenter;
  uniform float uRadius;
  uniform vec3 uColor;

  varying vec3 vWorldPos;

  const float PI = 3.14159265359;
  const float HORIZON = 1.0;
  const float ISCO = 2.6;
  const float DISK_OUTER = 9.2;
  const float BOUND_RADIUS = 11.5;

  float hash21(vec2 p) {
    vec2 q = fract(p * vec2(123.34, 456.21));
    q += dot(q, q + 45.32);
    return fract(q.x * q.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
               mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p0) {
    vec2 p = p0;
    float val = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) {
      val += amp * noise(p);
      p = rot * p;
      amp *= 0.5;
    }
    return val;
  }

  vec3 geodesicAccel(vec3 pos, vec3 vel) {
    float r2 = dot(pos, pos);
    vec3 L = cross(pos, vel);
    float h2 = dot(L, L);
    return -1.5 * h2 * pos / (r2 * r2 * sqrt(r2));
  }

  vec4 sampleAccretion(vec3 p, vec3 vel, float time, vec3 baseColor) {
    float r = length(p.xz);
    float h = abs(p.y);
    if (r <= ISCO || r >= DISK_OUTER || h > 0.42) return vec4(0.0);

    float omega = 0.42 / pow(r, 1.5);
    float swirl = 2.2 * log(r);
    float ang = time * omega + swirl;
    float c = cos(ang);
    float s = sin(ang);
    vec2 rc = vec2(c * p.x - s * p.z, s * p.x + c * p.z);
    
    float broad = fbm(rc * 0.92 + vec2(0.0, time * 0.02));
    float detail = fbm(rc * 2.8 + broad * 1.5);
    float rings = 0.5 + 0.5 * sin(r * 9.0 + broad * 5.0);
    float clumps = smoothstep(0.24, 0.85, broad * 0.72 + detail * 0.46 + rings * 0.22);

    float thickness = mix(0.05, 0.25, smoothstep(ISCO, DISK_OUTER, r));
    float vertical = exp(-pow(h / thickness, 2.0) * 3.4);
    float innerFade = smoothstep(ISCO, ISCO + 0.45, r);
    float outerFade = 1.0 - smoothstep(DISK_OUTER - 2.4, DISK_OUTER, r);
    float radial = (DISK_OUTER - r) / (DISK_OUTER - ISCO);
    float density = vertical * innerFade * outerFade * pow(radial, 0.36) * clumps;

    float heat = pow(radial, 1.35);
    vec3 cold = baseColor * vec3(0.55, 0.14, 0.03);
    vec3 mid = baseColor * 1.3;
    vec3 hot = vec3(1.0, 0.95, 0.88);
    vec3 thermal = mix(cold, mid, smoothstep(0.05, 0.55, heat));
    thermal = mix(thermal, hot, pow(heat, 2.4));

    vec3 tangent = normalize(vec3(-p.z, 0.0, p.x));
    float orbitalSpeed = min(0.65, 0.94 / sqrt(max(r - HORIZON, 0.25)));
    float towardObs = dot(tangent, -normalize(vel));
    float doppler = pow(clamp(1.0 / (1.0 - orbitalSpeed * towardObs), 0.7, 1.58), 1.55);
    float redshift = sqrt(max(0.001, 1.0 - HORIZON / r));

    vec3 emission = thermal * density * doppler * redshift * 9.5;
    return vec4(emission, density * 2.1);
  }

  bool intersectSphere(vec3 ro, vec3 rd, float R, out float tNear, out float tFar) {
    float b = dot(ro, rd);
    float c = dot(ro, ro) - R * R;
    float d = b * b - c;
    if (d < 0.0) return false;
    float sd = sqrt(d);
    tNear = -b - sd;
    tFar = -b + sd;
    return true;
  }

  void main() {
    vec3 roWorld = cameraPosition;
    vec3 rdWorld = normalize(vWorldPos - cameraPosition);

    vec3 ro = (roWorld - uCenter) / uRadius;
    vec3 rd = rdWorld;

    float tNear, tFar;
    if (!intersectSphere(ro, rd, BOUND_RADIUS, tNear, tFar)) {
      discard;
    }

    if (tNear > 0.0) {
      ro += rd * tNear;
    }

    vec3 pos = ro;
    vec3 vel = rd;
    vec3 accumulated = vec3(0.0);
    float transmittance = 1.0;
    bool enteredHorizon = false;

    for (int step = 0; step < 72; step++) {
      float r = length(pos);
      if (r < HORIZON * 1.015) {
        enteredHorizon = true;
        break;
      }
      if (r > BOUND_RADIUS && step > 5 && dot(pos, vel) > 0.0) {
        break;
      }

      float stepSize = clamp((r - HORIZON) * 0.08, 0.018, 0.28);

      float rxz = length(pos.xz);
      if (rxz > ISCO - 0.6 && rxz < DISK_OUTER + 0.6) {
        float slab = mix(0.05, 0.25, smoothstep(ISCO, DISK_OUTER, rxz));
        float vy = max(abs(vel.y), 0.001);
        if (abs(pos.y) < slab * 2.5) {
          stepSize = min(stepSize, (slab * 0.42) / vy);
        }
        stepSize = max(stepSize, 0.005);
      }

      vec3 prevPos = pos;

      vec3 a0 = geodesicAccel(pos, vel);
      vel += a0 * (0.5 * stepSize);
      pos += vel * stepSize;
      vec3 a1 = geodesicAccel(pos, vel);
      vel += a1 * (0.5 * stepSize);
      vel = normalize(vel);

      vec3 sampleP = mix(prevPos, pos, 0.5);
      vec4 vol = sampleAccretion(sampleP, vel, uTime, uColor);
      if (vol.a > 0.0001 && transmittance > 0.008) {
        float optDepth = vol.a * stepSize;
        float absorbed = 1.0 - exp(-optDepth);
        accumulated += vol.rgb * transmittance * absorbed / max(vol.a, 0.001);
        transmittance *= exp(-optDepth);
      }
    }

    float rEnd = length(pos);
    if (rEnd >= HORIZON && rEnd <= HORIZON * 1.8) {
      float ring = exp(-pow((rEnd - HORIZON * 1.3) * 16.0, 2.0)) * 3.8;
      accumulated += vec3(1.0, 0.95, 0.85) * ring * transmittance;
    }

    float alpha = clamp(1.0 - transmittance, 0.0, 1.0);
    if (enteredHorizon) {
      alpha = 1.0;
      accumulated = vec3(0.0);
    }

    if (alpha < 0.005 && !enteredHorizon) discard;

    vec3 x = accumulated * 1.25;
    vec3 color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`

export default function RelativisticBlackHoleGateway({
  position = [150000, 60000, -520000],
  radius = 18000,
  onOpenSimulation,
  flyTo
}) {
  const groupRef = useRef()
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3(...position) },
    uRadius: { value: radius },
    uColor: { value: new THREE.Color("#ff8822") }
  }), [position, radius])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
    }

    const camDist = camera.position.length()
    if (groupRef.current) {
      groupRef.current.visible = camDist >= 260000 && camDist <= 35000000
    }
  })

  // Bounding sphere size is 12.0 * horizon radius
  const boundSize = radius * 12.0

  return (
    <group ref={groupRef} position={position}>
      {/* Photorealistic Raymarched Relativistic Geodesic Bounding Sphere */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[boundSize, 32, 32]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertShader}
          fragmentShader={fragShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* Holographic 3D Tag */}
      <Html
        position={[0, radius * 10.0, 0]}
        center
        distanceFactor={700000}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (onOpenSimulation) onOpenSimulation()
          }}
          style={{
            background: "rgba(5, 10, 30, 0.9)",
            border: "2px solid #ff7700",
            boxShadow: "0 0 35px rgba(255, 120, 20, 0.8), inset 0 0 20px rgba(255, 100, 0, 0.3)",
            padding: "12px 22px",
            borderRadius: 14,
            backdropFilter: "blur(16px)",
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "center",
            transform: "scale(1)",
            transition: "transform 0.2s ease, border-color 0.2s ease",
            userSelect: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)"
            e.currentTarget.style.borderColor = "#ffcc44"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.borderColor = "#ff7700"
          }}
          title="Click to interact with WebGPU Raymarched Relativistic Black Hole"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ff7700",
              boxShadow: "0 0 12px #ff7700"
            }} />
            <b style={{ color: "#ffaa44", letterSpacing: 1.2, fontSize: 14 }}>
              🌀 M87: RELATIVISTIC RAYMARCHED BLACK HOLE
            </b>
          </div>
          <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>
            Past Milky Way • Einstein Null Geodesic Raymarching
          </div>
          <div style={{
            marginTop: 6,
            display: "inline-block",
            background: "rgba(255, 120, 20, 0.25)",
            border: "1px solid rgba(255, 120, 20, 0.6)",
            color: "#ffcc66",
            padding: "3px 10px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 800
          }}>
            [ ✦ ENTER WEBGPU SIMULATION ✦ ]
          </div>
        </div>
      </Html>
    </group>
  )
}
