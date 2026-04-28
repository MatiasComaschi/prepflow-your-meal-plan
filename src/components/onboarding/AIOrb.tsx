import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

type Phase = 0 | 1 | 2 | 3 | 4;

const PHASE_TEXT = [
  "initializing",
  "learning your goals",
  "understanding your preferences",
  "calibrating your plan",
  "almost ready",
];

const PHASE_COLORS = [
  "#7dd3fc", // Phase 1 cyan
  "#a5f3fc", // Phase 2
  "#6ee7b7", // Phase 3 green-cyan
  "#34d399", // Phase 4
  "#c8f461", // Phase 5 accent
];

interface AIOrbProps {
  phase: Phase;
  pulseKey: number;
  completing?: boolean;
  captionOverride?: string;
}

// ---- Custom shader: fresnel + noise distortion ----
const orbVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uDistort;

  // 3D simplex-ish noise (cheap)
  vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float n = snoise(normal * 1.6 + uTime * 0.35);
    vec3 displaced = position + normal * n * uDistort;
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const orbFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uEmissive;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.5);

    vec3 base = uColor * 0.55;
    vec3 edge = uColor * (1.4 + 0.5 * sin(uTime * 0.8));
    vec3 col = mix(base, edge, fresnel);
    col += uColor * uEmissive * (0.5 + fresnel);

    float alpha = 0.85 + fresnel * 0.15;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Orb({
  phase,
  pulseKey,
  completing,
}: {
  phase: Phase;
  pulseKey: number;
  completing: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(PHASE_COLORS[phase]), [phase]);
  const currentColor = useRef(new THREE.Color(PHASE_COLORS[phase]));

  // Pulse animation state
  const pulseStart = useRef<number | null>(null);
  useEffect(() => {
    if (pulseKey === 0) return;
    pulseStart.current = performance.now();
  }, [pulseKey]);

  // Completion boost
  const completionStart = useRef<number | null>(null);
  useEffect(() => {
    if (completing) completionStart.current = performance.now();
    else completionStart.current = null;
  }, [completing]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistort: { value: 0.12 },
      uColor: { value: currentColor.current.clone() },
      uEmissive: { value: 0 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Slow Y rotation
    mesh.rotation.y += 0.002 * 60 * delta; // normalize per-frame target ~0.002/frame at 60fps

    // Color lerp
    currentColor.current.lerp(targetColor, Math.min(1, delta * 3));
    uniforms.uColor.value.copy(currentColor.current);

    // Time
    uniforms.uTime.value += delta;

    // Pulse scale (1.0 -> 1.15 -> 1.0 over 400ms)
    let scale = 1;
    if (pulseStart.current != null) {
      const t = (performance.now() - pulseStart.current) / 400;
      if (t >= 1) {
        pulseStart.current = null;
      } else {
        // smooth ease in/out, peak at 0.5
        const eased = Math.sin(t * Math.PI);
        scale = 1 + 0.15 * eased;
      }
    }

    // Emissive boost on pulse + completion
    let emissive = 0;
    if (pulseStart.current != null) {
      const t = (performance.now() - pulseStart.current) / 400;
      emissive = Math.max(0, Math.sin(t * Math.PI) * 0.6);
    }
    if (completionStart.current != null) {
      const t = (performance.now() - completionStart.current) / 2000;
      if (t < 1) {
        emissive = Math.max(emissive, 0.4 + 0.6 * Math.sin(t * Math.PI * 3));
        scale *= 1 + 0.08 * Math.sin(t * Math.PI * 3);
      }
    }

    mesh.scale.setScalar(scale);
    uniforms.uEmissive.value = emissive;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 4]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={orbVertex}
        fragmentShader={orbFragment}
        transparent
      />
    </mesh>
  );
}

function Particles({ phase }: { phase: Phase }) {
  const count = 200 + phase * 50;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, drift } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const drift = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random point in spherical shell
      const r = 1.6 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      drift[i * 3 + 0] = (Math.random() - 0.5) * 0.05;
      drift[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      drift[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    return { positions, drift };
  }, [count]);

  const color = useMemo(() => new THREE.Color(PHASE_COLORS[phase]), [phase]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.y += delta * 0.05;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] += drift[i * 3 + 0] * delta;
      arr[i * 3 + 1] += drift[i * 3 + 1] * delta;
      arr[i * 3 + 2] += drift[i * 3 + 2] * delta;
      // Pull back if drifted too far
      const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
      const d = Math.sqrt(x * x + y * y + z * z);
      if (d > 3.2 || d < 1.4) {
        drift[i * 3 + 0] *= -1;
        drift[i * 3 + 1] *= -1;
        drift[i * 3 + 2] *= -1;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={color}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function AIOrb({ phase, pulseKey, completing = false, captionOverride }: AIOrbProps) {
  const caption = captionOverride ?? PHASE_TEXT[phase];
  // Keep client-only to avoid SSR issues with WebGL
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="pointer-events-none relative flex w-full flex-col items-center">
      <div style={{ width: 280, height: 280 }}>
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} color="#7dd3fc" intensity={1.2} />
            <Orb phase={phase} pulseKey={pulseKey} completing={completing} />
            <Particles phase={phase} />
          </Canvas>
        )}
      </div>
      <div className="-mt-2 text-[11px] font-light lowercase tracking-[0.25em] text-muted-foreground/60">
        {caption}
      </div>
    </div>
  );
}
