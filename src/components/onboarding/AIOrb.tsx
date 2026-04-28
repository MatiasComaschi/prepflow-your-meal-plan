import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Phase = 0 | 1 | 2 | 3 | 4;

const PHASE_TEXT = [
  "initializing",
  "learning your goals",
  "understanding your preferences",
  "calibrating your plan",
  "almost ready",
];

const PHASE_COLORS: Array<{ core: string; glow: string; particle: string }> = [
  // Phase 1 — soft white-blue
  { core: "#cfe6ff", glow: "rgba(160,200,255,0.55)", particle: "rgba(200,225,255,0.7)" },
  // Phase 2 — green-cyan
  { core: "#bff5e2", glow: "rgba(120,220,200,0.55)", particle: "rgba(160,240,210,0.7)" },
  // Phase 3 — liquid mercury (silver-violet)
  { core: "#e2dffb", glow: "rgba(170,160,230,0.6)", particle: "rgba(210,205,245,0.75)" },
  // Phase 4 — bright structured
  { core: "#ffe7b8", glow: "rgba(255,200,120,0.65)", particle: "rgba(255,220,160,0.8)" },
  // Phase 5 — pre-finish shimmer
  { core: "#ffffff", glow: "rgba(255,255,255,0.75)", particle: "rgba(255,255,255,0.9)" },
];

interface AIOrbProps {
  phase: Phase;
  /** increments on each "Next" press to trigger absorb pulse */
  pulseKey: number;
  /** plays the 2s completion animation when true */
  completing?: boolean;
  /** override the caption (e.g., "your AI is ready") */
  captionOverride?: string;
}

export function AIOrb({ phase, pulseKey, completing = false, captionOverride }: AIOrbProps) {
  const colors = PHASE_COLORS[phase];
  const caption = captionOverride ?? PHASE_TEXT[phase];

  // Particle counts per phase
  const particleCount = useMemo(() => {
    if (phase === 0) return 0;
    if (phase === 1) return 5;
    if (phase === 2) return 9;
    if (phase === 3) return 12;
    return 14;
  }, [phase]);

  // Completion flash
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!completing) return;
    const t = setTimeout(() => setFlash(true), 1200);
    const t2 = setTimeout(() => setFlash(false), 1500);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [completing]);

  return (
    <div className="pointer-events-none relative flex w-full flex-col items-center">
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          animate={{
            backgroundColor: colors.glow,
            scale: completing ? [1, 1.15, 1.05, 1.25, 1] : [1, 1.06, 1],
            opacity: completing ? [0.7, 1, 0.85, 1, 0.7] : [0.55, 0.75, 0.55],
          }}
          transition={{
            duration: completing ? 2 : 3.2,
            repeat: completing ? 0 : Infinity,
            ease: "easeInOut",
          }}
          style={{ backgroundColor: colors.glow }}
        />

        {/* Absorb ripple on pulseKey change */}
        <AnimatePresence>
          <motion.div
            key={`ripple-${pulseKey}`}
            className="absolute h-20 w-20 rounded-full border"
            style={{ borderColor: colors.glow }}
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </AnimatePresence>

        {/* Core sphere */}
        <motion.div
          key={`core-${pulseKey}`}
          className="relative h-20 w-20 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${colors.core} 45%, ${colors.glow} 100%)`,
            boxShadow: `0 0 40px 4px ${colors.glow}`,
          }}
          initial={{ scale: 0.85 }}
          animate={
            completing
              ? { scale: [1, 1.15, 1, 1.25, 1, 1.4, 1] }
              : { scale: [1, 1.18, 1] }
          }
          transition={{
            duration: completing ? 2 : 0.55,
            ease: "easeOut",
            repeat: completing ? 0 : 0,
          }}
        >
          {/* Internal swirl (phase 3+) */}
          {phase >= 2 && (
            <motion.div
              className="absolute inset-1 rounded-full opacity-70 mix-blend-screen"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${colors.core}, transparent, ${colors.glow}, transparent)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          )}
          {/* Highlight */}
          <div
            className="absolute left-3 top-3 h-3 w-3 rounded-full bg-white/80 blur-[2px]"
            aria-hidden
          />
        </motion.div>

        {/* Completion flash overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              key="flash"
              className="absolute inset-0 rounded-full bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          )}
        </AnimatePresence>

        {/* Orbiting particles */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const angleOffset = (i / Math.max(particleCount, 1)) * 360;
          const radius = phase >= 3 ? 58 + (i % 2) * 10 : 48 + (i % 3) * 6;
          const duration = phase >= 3 ? 6 + (i % 3) : 9 + (i % 4);
          const reverse = phase >= 3 && i % 2 === 0;
          // Phase 5: spiral inward
          const spiralIn = phase === 4;
          return (
            <motion.div
              key={`p-${phase}-${i}`}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: colors.particle,
                boxShadow: `0 0 6px ${colors.particle}`,
                top: "50%",
                left: "50%",
                marginTop: -3,
                marginLeft: -3,
              }}
              initial={{ rotate: angleOffset, x: radius }}
              animate={
                spiralIn
                  ? {
                      rotate: angleOffset + 360,
                      x: [radius, radius * 0.4, radius],
                      opacity: [0.9, 0.3, 0.9],
                    }
                  : { rotate: angleOffset + (reverse ? -360 : 360) }
              }
              transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 text-[11px] font-light lowercase tracking-[0.25em] text-muted-foreground/60">
        {caption}
      </div>
    </div>
  );
}
