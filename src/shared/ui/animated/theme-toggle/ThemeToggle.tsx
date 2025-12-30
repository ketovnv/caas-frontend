import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { ToggleController } from './ToggleController';

// ============================================================================
// Types
// ============================================================================

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Size configs — thumb слегка больше контейнера (overflow ~4px)
// translate = wrapper_width - thumb_width
// ============================================================================

const sizeConfig = {
  sm: { wrapper: 'w-14 h-6', icon: 14, thumb: 28, translate: 28 },  // 56-28=28
  md: { wrapper: 'w-16 h-7', icon: 16, thumb: 32, translate: 32 },  // 64-32=32
  lg: { wrapper: 'w-20 h-9', icon: 20, thumb: 44, translate: 36 },  // 80-44=36
};

// ============================================================================
// Component — чистый view, вся логика в контроллере
// ============================================================================

export const ThemeToggle = observer(function ThemeToggle({
  className,
  size = 'md',
}: ThemeToggleProps) {
  const { wrapper, icon, thumb, translate } = sizeConfig[size];

  // Controller — единственный ref
  const ctrlRef = useRef<ToggleController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new ToggleController(translate);
  }
  const ctrl = ctrlRef.current;

  // Cleanup
  useEffect(() => () => ctrl.dispose(), [ctrl]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <animated.button
      onClick={ctrl.handleClick}
      className={cn(
        'relative rounded-full cursor-pointer overflow-visible',
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
      aria-label={ctrl.ariaLabel}
    >
      {/* Stars background (dark mode) — animated individually */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        {Array.from({ length: ctrl.starCount }, (_, i) => (
          <animated.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 3 + (i % 2) * 2,
              height: 3 + (i % 2) * 2,
              ...ctrl.getStarStyle(i),
            }}
          />
        ))}
      </div>

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

      {/* Thumb — слегка вылазит за границы */}
      <animated.div
        className="absolute rounded-full shadow-lg flex items-center justify-center"
        style={{
          width: thumb,
          height: thumb,
          top: '50%',
          left: 0,
          marginTop: -thumb / 2,
          transform: ctrl.thumbTransform,
          backgroundColor: ctrl.thumbBackground,
        }}
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
