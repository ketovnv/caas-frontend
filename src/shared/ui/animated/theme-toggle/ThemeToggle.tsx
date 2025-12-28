import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated, useSpring } from '@react-spring/web';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';

const DEBOUNCE_MS = 150;

// ============================================================================
// Types
// ============================================================================

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Size configs
// ============================================================================

const sizeConfig = {
  sm: { wrapper: 'w-14 h-7', icon: 16, thumb: 'w-5 h-5', translate: 26 },
  md: { wrapper: 'w-16 h-8', icon: 18, thumb: 'w-6 h-6', translate: 30 },
  lg: { wrapper: 'w-20 h-10', icon: 22, thumb: 'w-8 h-8', translate: 38 },
};

// ============================================================================
// Component
// ============================================================================

// ============================================================================
// Animation States
// ============================================================================

const LIGHT_STATE = {
  thumb: { x: 1, rotate: 360 }, // x=1 means right side (x * translate)
  bg: { background: 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)' },
  glow: { boxShadow: '0 0 20px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)' },
  sun: { opacity: 1, scale: 1, rotate: 0, filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))' },
  moon: { opacity: 0, scale: 0.3, rotate: 180, filter: 'drop-shadow(0 0 0px rgba(148, 163, 184, 0))' },
  stars: { opacity: 0, scale: 0 },
  rays: { opacity: 0.8, scale: 1, rotate: 45 },
};

const DARK_STATE = {
  thumb: { x: 0, rotate: 0 }, // x=0 means left side
  bg: { background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)' },
  glow: { boxShadow: '0 0 15px rgba(100, 116, 139, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)' },
  sun: { opacity: 0, scale: 0.3, rotate: -180, filter: 'drop-shadow(0 0 0px rgba(251, 191, 36, 0))' },
  moon: { opacity: 1, scale: 1, rotate: 0, filter: 'drop-shadow(0 0 3px rgba(148, 163, 184, 0.5))' },
  stars: { opacity: 1, scale: 1 },
  rays: { opacity: 0, scale: 0.5, rotate: 0 },
};

export const ThemeToggle = observer(function ThemeToggle({
  className,
  size = 'md',
}: ThemeToggleProps) {
  const { wrapper, icon, thumb, translate } = sizeConfig[size];
  const lastClickRef = useRef(0);

  // Initial state
  const isDark = themeStore.themeIsDark;
  const initial = isDark ? DARK_STATE : LIGHT_STATE;

  // ─────────────────────────────────────────────────────────────────────────
  // Imperative Springs
  // ─────────────────────────────────────────────────────────────────────────

  const [thumbSpring, thumbApi] = useSpring(() => ({
    x: initial.thumb.x * translate,
    rotate: initial.thumb.rotate,
    config: themeStore.springConfig,
  }));

  const [bgSpring, bgApi] = useSpring(() => ({
    ...initial.bg,
    config: themeStore.springConfig,
  }));

  const [glowSpring, glowApi] = useSpring(() => ({
    ...initial.glow,
    config: themeStore.springConfig,
  }));

  const [sunSpring, sunApi] = useSpring(() => ({
    ...initial.sun,
    config: themeStore.springConfig,
  }));

  const [moonSpring, moonApi] = useSpring(() => ({
    ...initial.moon,
    config: themeStore.springConfig,
  }));

  const [starsSpring, starsApi] = useSpring(() => ({
    ...initial.stars,
    config: themeStore.springConfig,
  }));

  const [raysSpring, raysApi] = useSpring(() => ({
    ...initial.rays,
    config: themeStore.springConfig,
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // Animate on theme change (via observer re-render)
  // ─────────────────────────────────────────────────────────────────────────

  const prevIsDarkRef = useRef(isDark);

  useEffect(() => {
    // Skip initial render
    if (prevIsDarkRef.current === isDark) return;
    prevIsDarkRef.current = isDark;

    const state = isDark ? DARK_STATE : LIGHT_STATE;
    const cfg = { config: themeStore.springConfig };

    thumbApi.start({ x: state.thumb.x * translate, rotate: state.thumb.rotate, ...cfg });
    bgApi.start({ ...state.bg, ...cfg });
    glowApi.start({ ...state.glow, ...cfg });
    sunApi.start({ ...state.sun, ...cfg });
    moonApi.start({ ...state.moon, ...cfg });
    starsApi.start({ ...state.stars, ...cfg });
    raysApi.start({ ...state.rays, ...cfg });
  }, [isDark, translate, thumbApi, bgApi, glowApi, sunApi, moonApi, starsApi, raysApi]);

  // ─────────────────────────────────────────────────────────────────────────
  // Click Handler
  // ─────────────────────────────────────────────────────────────────────────

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < DEBOUNCE_MS) return;
    lastClickRef.current = now;

    themeStore.toggleColorScheme();
  };

  return (
    <animated.button
      onClick={handleClick}
      className={cn(
        'relative rounded-full p-1 cursor-pointer',
        'border border-white/10',
        'transition-transform hover:scale-105 active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        wrapper,
        className
      )}
      style={{ ...bgSpring, ...glowSpring }}
      aria-label={themeStore.themeIsDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Stars background (dark mode) */}
      <animated.div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
        style={{ opacity: starsSpring.opacity }}
      >
        {[...Array(5)].map((_, i) => (
          <animated.div
            key={i}
            className="absolute rounded-full bg-slate-300"
            style={{
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              top: `${15 + i * 15}%`,
              left: `${10 + i * 12}%`,
              scale: starsSpring.scale,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </animated.div>

      {/* Sun rays background (light mode) */}
      <animated.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: raysSpring.opacity,
          transform: raysSpring.rotate.to(r => `rotate(${r}deg)`),
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-gradient-to-t from-yellow-400/80 to-transparent rounded-full"
            style={{
              transform: `rotate(${i * 45}deg) translateY(-140%)`,
              transformOrigin: 'center center',
            }}
          />
        ))}
      </animated.div>

      {/* Thumb */}
      <animated.div
        className={cn(
          'relative rounded-full bg-white shadow-lg',
          'flex items-center justify-center',
          thumb
        )}
        style={{
          transform: thumbSpring.x.to(x => `translateX(${x}px)`),
        }}
      >
        {/* Sun icon */}
        <animated.svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute"
          style={{
            opacity: sunSpring.opacity,
            transform: sunSpring.scale.to((s) => `scale(${s})`),
            filter: sunSpring.filter,
          }}
        >
          {/* Sun center */}
          <circle cx="12" cy="12" r="5" fill="#fbbf24" />
          {/* Sun rays */}
          <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
          </g>
        </animated.svg>

        {/* Moon icon */}
        <animated.svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute"
          style={{
            opacity: moonSpring.opacity,
            transform: moonSpring.scale.to((s) => `scale(${s})`),
            filter: moonSpring.filter,
          }}
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="#64748b"
            stroke="#475569"
            strokeWidth="1"
          />
          {/* Moon craters */}
          <circle cx="10" cy="9" r="1.5" fill="#475569" opacity="0.4" />
          <circle cx="14" cy="14" r="1" fill="#475569" opacity="0.3" />
          <circle cx="9" cy="14" r="0.8" fill="#475569" opacity="0.3" />
        </animated.svg>
      </animated.div>
    </animated.button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
