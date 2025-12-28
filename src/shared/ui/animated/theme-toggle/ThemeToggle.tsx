import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import { ToggleController } from './ToggleController';

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

export const ThemeToggle = observer(function ThemeToggle({
  className,
  size = 'md',
}: ThemeToggleProps) {
  const { wrapper, icon, thumb, translate } = sizeConfig[size];
  const lastClickRef = useRef(0);

  // ─────────────────────────────────────────────────────────────────────────
  // Controller (single instance)
  // ─────────────────────────────────────────────────────────────────────────

  const ctrlRef = useRef<ToggleController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new ToggleController(translate);
  }
  const ctrl = ctrlRef.current;

  // ─────────────────────────────────────────────────────────────────────────
  // React to theme changes
  // ─────────────────────────────────────────────────────────────────────────

  const isDark = themeStore.themeIsDark;
  const prevIsDarkRef = useRef(isDark);

  useEffect(() => {
    if (prevIsDarkRef.current === isDark) return;
    prevIsDarkRef.current = isDark;
    ctrl.animateTo(isDark);
  }, [isDark, ctrl]);

  // Cleanup
  useEffect(() => () => ctrl.stop(), [ctrl]);

  // ─────────────────────────────────────────────────────────────────────────
  // Click Handler
  // ─────────────────────────────────────────────────────────────────────────

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < DEBOUNCE_MS) return;
    lastClickRef.current = now;
    themeStore.toggleColorScheme();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

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
      style={{
        background: ctrl.background,
        boxShadow: ctrl.boxShadow,
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Stars background (dark mode) */}
      <animated.div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
        style={{ opacity: ctrl.starsOpacity }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-slate-300"
            style={{
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              top: `${15 + i * 15}%`,
              left: `${10 + i * 12}%`,
            }}
          />
        ))}
      </animated.div>

      {/* Sun rays background (light mode) */}
      <animated.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={ctrl.raysStyle}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-linear-to-t from-yellow-400/80 to-transparent rounded-full"
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
        style={{ transform: ctrl.thumbTransform }}
      >
        {/* Sun icon */}
        <animated.svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute"
          style={ctrl.sunStyle}
        >
          <circle cx="12" cy="12" r="5" fill="#fbbf24" />
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
          style={ctrl.moonStyle}
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="#64748b"
            stroke="#475569"
            strokeWidth="1"
          />
          <circle cx="10" cy="9" r="1.5" fill="#475569" opacity="0.4" />
          <circle cx="14" cy="14" r="1" fill="#475569" opacity="0.3" />
          <circle cx="9" cy="14" r="0.8" fill="#475569" opacity="0.3" />
        </animated.svg>
      </animated.div>
    </animated.button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
