import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { animated, useSpring, config } from '@react-spring/web';
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

export const ThemeToggle = observer(function ThemeToggle({
  className,
  size = 'md',
}: ThemeToggleProps) {
  const { wrapper, icon, thumb, translate } = sizeConfig[size];
  const isDark = themeStore.themeIsDark;
  const lastClickRef = useRef(0);

  // Thumb position animation
  const thumbSpring = useSpring({
    x: isDark ? 0 : translate,
    rotate: isDark ? 0 : 360,
    config: { tension: 300, friction: 20, mass: 1 },
  });

  // Background gradient animation
  const bgSpring = useSpring({
    background: isDark
      ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      : 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
    config: { tension: 200, friction: 25 },
  });

  // Glow effect with sequence animation
  const [glowSpring, glowApi] = useSpring(() => ({
    boxShadow: isDark
      ? '0 0 15px rgba(100, 116, 139, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)'
      : '0 0 20px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
    config: { tension: 200, friction: 25 },
    onRest: async (_result, ctrl) => {
      if (!isDark) {
        // Sun glow pulse sequence
        await ctrl.start({ boxShadow: '0 0 30px rgba(251, 191, 36, 0.8), inset 0 1px 2px rgba(255,255,255,0.3)' });
        await new Promise(r => setTimeout(r, 200));
        await ctrl.start({ boxShadow: '0 0 15px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)' });
        await new Promise(r => setTimeout(r, 300));
        await ctrl.start({ boxShadow: '0 0 25px rgba(251, 191, 36, 0.6), inset 0 1px 2px rgba(255,255,255,0.3)' });
      }
    },
  }));

  // Sun icon animation
  const sunSpring = useSpring({
    opacity: isDark ? 0 : 1,
    scale: isDark ? 0.3 : 1,
    rotate: isDark ? -180 : 0,
    filter: isDark
      ? 'drop-shadow(0 0 0px rgba(251, 191, 36, 0))'
      : 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))',
    config: { ...config.wobbly, tension: 280, friction: 20 },
  });

  // Moon icon animation
  const moonSpring = useSpring({
    opacity: isDark ? 1 : 0,
    scale: isDark ? 1 : 0.3,
    rotate: isDark ? 0 : 180,
    filter: isDark
      ? 'drop-shadow(0 0 3px rgba(148, 163, 184, 0.5))'
      : 'drop-shadow(0 0 0px rgba(148, 163, 184, 0))',
    config: { ...config.wobbly, tension: 280, friction: 20 },
  });

  // Stars animation (for dark mode)
  const starsSpring = useSpring({
    opacity: isDark ? 1 : 0,
    scale: isDark ? 1 : 0,
    config: { tension: 200, friction: 30 },
  });

  // Rays animation (for light mode)
  const raysSpring = useSpring({
    opacity: isDark ? 0 : 0.8,
    scale: isDark ? 0.5 : 1,
    rotate: isDark ? 0 : 45,
    config: { tension: 150, friction: 20 },
  });

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < DEBOUNCE_MS) return;
    lastClickRef.current = now;

    themeStore.toggleColorScheme();
    // Trigger glow animation
    glowApi.start({
      boxShadow: !isDark
        ? '0 0 15px rgba(100, 116, 139, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)'
        : '0 0 20px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
    });
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
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
