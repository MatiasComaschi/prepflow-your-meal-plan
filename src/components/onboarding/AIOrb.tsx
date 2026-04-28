import { useEffect, useId, useRef, useState } from "react";

type Phase = 0 | 1 | 2 | 3 | 4;

const PHASE_TEXT = [
  "initializing",
  "learning your goals",
  "understanding your preferences",
  "calibrating your plan",
  "almost ready",
];

interface AIOrbProps {
  phase: Phase;
  pulseKey: number;
  completing?: boolean;
  captionOverride?: string;
}

export function AIOrb({ phase, pulseKey, completing = false, captionOverride }: AIOrbProps) {
  const caption = captionOverride ?? PHASE_TEXT[phase];
  const noiseId = useId().replace(/:/g, "");
  const orbRef = useRef<HTMLDivElement>(null);
  const [pulse, setPulse] = useState(false);

  // Pulse trigger
  useEffect(() => {
    if (pulseKey === 0) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 700);
    return () => clearTimeout(t);
  }, [pulseKey]);

  // Pre-compute particle positions
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const r = 95 + (i % 3) * 12;
    return {
      left: 175 + Math.cos(angle) * r,
      top: 175 + Math.sin(angle) * r,
      dur: 7 + (i % 7),
      delay: -i * 0.8,
      dx: Math.cos(angle) * 14,
      dy: Math.sin(angle) * 14,
    };
  });

  return (
    <div className="pointer-events-none relative flex w-full flex-col items-center select-none">
      {/* Frame */}
      <div
        className={`relative overflow-hidden rounded-2xl ${completing ? "orb-completing" : ""}`}
        style={{
          width: 350,
          height: 350,
          background:
            "radial-gradient(circle at 50% 50%, rgba(200,244,97,0.06) 0%, #0c0d0a 35%, #040506 100%)",
        }}
      >
        {/* Top progress bars */}
        <div className="absolute left-0 right-0 top-3 z-30 flex justify-center gap-1.5 px-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[2px] flex-1 rounded-full transition-all duration-500"
              style={{
                background:
                  i <= phase
                    ? "linear-gradient(90deg, #c8f461, #6ee7b7)"
                    : "rgba(255,255,255,0.08)",
                boxShadow: i <= phase ? "0 0 6px rgba(200,244,97,0.5)" : "none",
                maxWidth: 38,
              }}
            />
          ))}
        </div>

        {/* Grain overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ mixBlendMode: "overlay", opacity: 0.12 }}
          aria-hidden
        >
          <filter id={`grain-${noiseId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${noiseId})`} />
        </svg>

        {/* Outer glow 400px */}
        <div
          className="absolute orb-glow-outer"
          style={{
            width: 400,
            height: 400,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(200,244,97,0.08) 0%, transparent 65%)",
            filter: "blur(20px)",
          }}
        />

        {/* Mid glow 240px */}
        <div
          className="absolute orb-glow-mid"
          style={{
            width: 240,
            height: 240,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(200,244,97,0.14) 0%, transparent 60%)",
            filter: "blur(16px)",
          }}
        />

        {/* Outer rotating ring 200px */}
        <div
          className="absolute orb-ring-outer"
          style={{
            width: 200,
            height: 200,
            left: "50%",
            top: "50%",
            marginLeft: -100,
            marginTop: -100,
            border: "1px solid rgba(200,244,97,0.12)",
            borderRadius: "50%",
          }}
        >
          <div
            className="absolute"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#c8f461",
              boxShadow: "0 0 12px #c8f461, 0 0 4px #c8f461",
              top: -3,
              left: "50%",
              marginLeft: -3,
            }}
          />
        </div>

        {/* Inner rotating ring 175px */}
        <div
          className="absolute orb-ring-inner"
          style={{
            width: 175,
            height: 175,
            left: "50%",
            top: "50%",
            marginLeft: -87.5,
            marginTop: -87.5,
            border: "1px solid rgba(110,231,183,0.12)",
            borderRadius: "50%",
          }}
        >
          <div
            className="absolute"
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#6ee7b7",
              boxShadow: "0 0 10px #6ee7b7",
              top: -2,
              left: "50%",
              marginLeft: -2,
            }}
          />
        </div>

        {/* The orb */}
        <div
          ref={orbRef}
          className={`absolute ${pulse ? "orb-pulse" : ""}`}
          style={{
            width: 150,
            height: 150,
            left: "50%",
            top: "50%",
            marginLeft: -75,
            marginTop: -75,
            borderRadius: "50%",
            overflow: "hidden",
            background: "radial-gradient(circle at 50% 55%, #1a1d14 0%, #050604 100%)",
            boxShadow:
              "0 0 60px rgba(200,244,97,0.25), inset 0 0 30px rgba(0,0,0,0.6)",
          }}
        >
          {/* Aurora 1 - lime */}
          <div
            className="absolute inset-0 orb-aurora-1"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 35% 40%, #c8f461 0%, transparent 55%), radial-gradient(ellipse 60% 70% at 65% 60%, #84cc16 0%, transparent 60%)",
              mixBlendMode: "screen",
              opacity: 0.85,
            }}
          />
          {/* Aurora 2 - mint */}
          <div
            className="absolute inset-0 orb-aurora-2"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 60% 35%, #6ee7b7 0%, transparent 55%), radial-gradient(ellipse 55% 65% at 30% 65%, #34d399 0%, transparent 60%)",
              mixBlendMode: "screen",
              opacity: 0.7,
            }}
          />
          {/* Aurora 3 - white highlight */}
          <div
            className="absolute inset-0 orb-aurora-3"
            style={{
              background:
                "radial-gradient(ellipse 35% 25% at 40% 30%, rgba(255,255,255,0.9) 0%, transparent 60%)",
              mixBlendMode: "screen",
              opacity: 0.6,
            }}
          />
          {/* Rim light top-left */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 35%)",
              borderRadius: "50%",
            }}
          />
          {/* Inner shadow edges */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 95%)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Ground shadow */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: 180,
            height: 30,
            left: "50%",
            top: "50%",
            marginLeft: -90,
            marginTop: 70,
            background:
              "radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />

        {/* Particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute orb-particle"
            style={
              {
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "#c8f461",
                boxShadow: "0 0 6px #c8f461, 0 0 2px #c8f461",
                left: p.left,
                top: p.top,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                ["--dx" as string]: `${p.dx}px`,
                ["--dy" as string]: `${p.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Bottom label */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
          <span
            className="orb-status-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#c8f461",
              boxShadow: "0 0 8px #c8f461",
              display: "inline-block",
            }}
          />
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 orb-label-glow"
              style={{
                color: "#c8f461",
                filter: "blur(6px)",
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "lowercase",
              }}
            >
              {caption}
            </div>
            <div
              className="relative"
              style={{
                color: "rgba(255,255,255,0.85)",
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "lowercase",
              }}
            >
              {caption}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orb-glow-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
        }
        @keyframes orb-glow-pulse-mid {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
          50% { transform: translate(-50%, -50%) scale(1.04); opacity: 1; }
        }
        .orb-glow-outer { animation: orb-glow-pulse 6s ease-in-out infinite; }
        .orb-glow-mid { animation: orb-glow-pulse-mid 5s ease-in-out infinite; }

        @keyframes orb-spin { to { transform: rotate(360deg); } }
        @keyframes orb-spin-rev { to { transform: rotate(-360deg); } }
        .orb-ring-outer { animation: orb-spin 30s linear infinite; }
        .orb-ring-inner { animation: orb-spin-rev 20s linear infinite; }

        @keyframes orb-aurora-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(8%, -6%) rotate(180deg) scale(1.1); }
        }
        @keyframes orb-aurora-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-6%, 8%) rotate(-160deg) scale(1.08); }
        }
        @keyframes orb-aurora-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.6; }
          50% { transform: translate(4%, 2%) rotate(40deg) scale(1.15); opacity: 0.85; }
        }
        .orb-aurora-1 { animation: orb-aurora-1 8s ease-in-out infinite; }
        .orb-aurora-2 { animation: orb-aurora-2 12s ease-in-out infinite; }
        .orb-aurora-3 { animation: orb-aurora-3 6s ease-in-out infinite; }

        @keyframes orb-particle-float {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(var(--dx), var(--dy)); opacity: 1; }
        }
        .orb-particle {
          animation-name: orb-particle-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes orb-status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .orb-status-dot { animation: orb-status-pulse 2s ease-in-out infinite; display: inline-block; }

        @keyframes orb-label-glow-anim {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        .orb-label-glow { animation: orb-label-glow-anim 3s ease-in-out infinite; }

        @keyframes orb-pulse-anim {
          0% { transform: scale(1); box-shadow: 0 0 60px rgba(200,244,97,0.25), inset 0 0 30px rgba(0,0,0,0.6); }
          50% { transform: scale(1.08); box-shadow: 0 0 90px rgba(200,244,97,0.6), inset 0 0 30px rgba(0,0,0,0.4); }
          100% { transform: scale(1); box-shadow: 0 0 60px rgba(200,244,97,0.25), inset 0 0 30px rgba(0,0,0,0.6); }
        }
        .orb-pulse { animation: orb-pulse-anim 0.7s ease-out; }

        @keyframes orb-completing-anim {
          0%, 100% { filter: brightness(1); }
          25% { filter: brightness(1.4); }
          50% { filter: brightness(2) saturate(1.3); }
          75% { filter: brightness(1.4); }
        }
        .orb-completing { animation: orb-completing-anim 2s ease-in-out; }
      `}</style>
    </div>
  );
}
