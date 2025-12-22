import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  type InputHTMLAttributes,
} from 'react';
import { useSpring, useSpringValue, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface SpotlightInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Container className */
  containerClass?: string;
  /** Spotlight color (CSS color) */
  spotlightColor?: string;
  /** Spotlight radius in pixels */
  spotlightRadius?: number;
  /** Enable pulse effect on focus */
  pulse?: boolean;
}

// ============================================================================
// Component - Imperative React Spring approach
// ============================================================================

export const SpotlightInput = forwardRef<HTMLInputElement, SpotlightInputProps>(
  (
    {
      className,
      containerClass,
      spotlightColor = 'rgba(59, 130, 246, 0.5)',
      spotlightRadius = 120,
      pulse = true,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // 🎯 Imperative SpringValues for granular control
    const radius = useSpringValue(0, { config: { tension: 280, friction: 25 } });
    const opacity = useSpringValue(0, { config: { tension: 280, friction: 25 } });
    const pulseScale = useSpringValue(1, { config: config.wobbly });

    // 🎨 Border glow spring with imperative API
    const [borderSpring, borderApi] = useSpring(() => ({
      borderOpacity: 0,
      shadowSpread: 0,
      config: { tension: 300, friction: 20 },
    }));

    // 🔄 Pulse animation loop (imperative)
    useEffect(() => {
      if (!pulse || !isFocused) {
        pulseScale.start(1);
        return;
      }

      let active = true;
      const animate = async () => {
        while (active && isFocused) {
          await pulseScale.start(1.02);
          if (!active) break;
          await pulseScale.start(0.98);
        }
      };
      animate();

      return () => {
        active = false;
      };
    }, [pulse, isFocused, pulseScale]);

    // 🎯 Spotlight visibility control (imperative)
    useEffect(() => {
      if (isHovered) {
        radius.start(spotlightRadius);
        opacity.start(1);
      } else {
        radius.start(0);
        opacity.start(0);
      }
    }, [isHovered, spotlightRadius, radius, opacity]);

    // ✨ Border glow on focus (imperative)
    useEffect(() => {
      if (isFocused) {
        borderApi.start({
          borderOpacity: 1,
          shadowSpread: 8,
        });
      } else {
        borderApi.start({
          borderOpacity: 0.3,
          shadowSpread: 0,
        });
      }
    }, [isFocused, borderApi]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const { left, top } = containerRef.current.getBoundingClientRect();
      setMouse({ x: e.clientX - left, y: e.clientY - top });
    }, []);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    return (
      <animated.div
        ref={containerRef}
        className={cn('group/input relative rounded-lg p-[2px]', containerClass)}
        style={{
          background: radius.to(
            (r) =>
              `radial-gradient(${r}px circle at ${mouse.x}px ${mouse.y}px, ${spotlightColor}, transparent 80%)`
          ),
          transform: pulseScale.to((s) => `scale(${s})`),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Focus glow ring */}
        <animated.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: borderSpring.shadowSpread.to(
              (spread) =>
                `0 0 ${spread}px ${spread / 2}px rgba(59, 130, 246, ${borderSpring.borderOpacity.get() * 0.3})`
            ),
          }}
        />

        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-md px-3 py-2 text-sm',
            'border-none bg-zinc-900 text-zinc-100',
            'placeholder:text-zinc-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-shadow duration-200',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </animated.div>
    );
  }
);

SpotlightInput.displayName = 'SpotlightInput';
