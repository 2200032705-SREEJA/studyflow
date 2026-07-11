export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-transparent blur-3xl" />

      <svg viewBox="0 0 400 400" className="relative h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="130" fill="url(#glow)" />
        <circle cx="200" cy="200" r="150" stroke="url(#ringGrad)" strokeOpacity="0.35" strokeWidth="1" fill="none" />
        <circle cx="200" cy="200" r="110" stroke="url(#ringGrad)" strokeOpacity="0.5" strokeWidth="1" fill="none" strokeDasharray="4 8" />

        {/* Orbiting nodes */}
        <circle cx="200" cy="50" r="6" fill="#c084fc" />
        <circle cx="340" cy="200" r="5" fill="#818cf8" />
        <circle cx="90" cy="300" r="4" fill="#e879f9" />
        <circle cx="320" cy="310" r="5" fill="#a78bfa" />

        {/* Connecting lines */}
        <path d="M200 200 L200 50" stroke="#a855f7" strokeOpacity="0.4" strokeWidth="1" />
        <path d="M200 200 L340 200" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="1" />
        <path d="M200 200 L90 300" stroke="#e879f9" strokeOpacity="0.4" strokeWidth="1" />
        <path d="M200 200 L320 310" stroke="#a78bfa" strokeOpacity="0.4" strokeWidth="1" />

        {/* Core */}
        <circle cx="200" cy="200" r="46" fill="url(#coreGrad)" />
        <circle cx="200" cy="200" r="46" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
        {/* Sparkle mark inside core */}
        <path
          d="M200 178 L206 194 L222 200 L206 206 L200 222 L194 206 L178 200 L194 194 Z"
          fill="white"
          fillOpacity="0.9"
        />
      </svg>

      {/* Floating glass cards, positioned over the illustration */}
      <div className="absolute left-0 top-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md shadow-lg shadow-violet-950/40">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs">
          ✦
        </span>
        <span className="text-xs font-medium text-white/90">AI Explain</span>
      </div>

      <div className="absolute bottom-4 right-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md shadow-lg shadow-fuchsia-950/40">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs">
          ◷
        </span>
        <span className="text-xs font-medium text-white/90">Study Planner</span>
      </div>
    </div>
  );
}