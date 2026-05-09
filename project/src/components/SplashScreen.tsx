import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // phase: 'visible' → 'fading' → done (callback)
  const [phase, setPhase] = useState<'visible' | 'fading'>('visible');

  useEffect(() => {
    // After 2.2 s, start the fade-out transition (800 ms)
    const fadeTimer = setTimeout(() => setPhase('fading'), 2200);
    // After 3 s total, tell the parent we are done
    const doneTimer = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      aria-hidden="true"
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center
        bg-[#0d0d0d]
        transition-opacity duration-[800ms] ease-in-out
        ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Subtle radial glow behind the text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 55%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Paw / heart icon */}
      <span
        className="text-4xl mb-8 select-none"
        style={{ filter: 'grayscale(0.4) opacity(0.7)' }}
      >
        🐾
      </span>

      {/* Main tribute text */}
      <p
        className="
          text-center text-white/80 font-light tracking-widest uppercase
          text-sm md:text-base leading-relaxed px-8 max-w-xs
        "
        style={{ fontFamily: "'Georgia', serif", letterSpacing: '0.18em' }}
      >
        En memoria y homenaje a
        <br />
        <span className="font-semibold text-white/95">Dayson</span>,{' '}
        <span className="font-semibold text-white/95">Harry</span> y{' '}
        <span className="font-semibold text-white/95">Toby</span>.
        <br />
        <span className="italic text-white/60">Compañeros fieles. Siempre en nuestros corazones.</span>
      </p>

      {/* Thin divider line */}
      <div className="mt-10 w-16 h-px bg-white/20 rounded-full" />
    </div>
  );
}
