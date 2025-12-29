import { forwardRef, useRef, useCallback, type ReactNode, type HTMLAttributes } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Spring configs
// ============================================================================

const wobbleConfigs = {
  wobble: { tension: 200, friction: 15, mass: 0.8 },
  snap: { tension: 400, friction: 30 },
};

// ============================================================================
// Types
// ============================================================================

type WobbleVariant = 'default' | 'ocean' | 'blue' | 'slate' | 'gradient';

export interface WobbleCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Visual variant */
  variant?: WobbleVariant;
  /** Wobble intensity (0-1) */
  intensity?: number;
  /** Show noise texture */
  noise?: boolean;
}

export interface WobbleCardRef {
  wobble: () => void;
  reset: () => void;
}

// ============================================================================
// Variant styles
// ============================================================================

const variantStyles: Record<WobbleVariant, string> = {
  default: 'bg-zinc-800',
  ocean: 'bg-gradient-to-br from-cyan-600 to-teal-700',
  blue: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  slate: 'bg-gradient-to-br from-slate-600 to-slate-700',
  gradient: 'bg-gradient-to-br from-slate-600 via-cyan-600 to-teal-600',
};

// ============================================================================
// Component
// ============================================================================

export const WobbleCard = forwardRef<WobbleCardRef, WobbleCardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      intensity = 0.15,
      noise = true,
      ...props
    },
    _ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const bounds = useRef({ width: 0, height: 0, left: 0, top: 0 });

    const [springs, api] = useSpring(() => ({
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
      config: wobbleConfigs.wobble,
    }));

    const updateBounds = useCallback(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      bounds.current = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      };
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const { width, height, left, top } = bounds.current;
        if (width === 0) return;

        const mouseX = (e.clientX - left - width / 2) / (width / 2);
        const mouseY = (e.clientY - top - height / 2) / (height / 2);

        // Wobble effect - card slightly follows cursor with rotation
        api.start({
          rotateX: -mouseY * intensity * 8,
          rotateY: mouseX * intensity * 8,
          translateX: mouseX * intensity * 4,
          translateY: mouseY * intensity * 4,
          config: wobbleConfigs.wobble,
        });
      },
      [intensity, api]
    );

    const handleMouseEnter = useCallback(() => {
      updateBounds();
      api.start({
        scale: 1.01,
        config: wobbleConfigs.wobble,
      });
    }, [updateBounds, api]);

    const handleMouseLeave = useCallback(() => {
      api.start({
        rotateX: 0,
        rotateY: 0,
        translateX: 0,
        translateY: 0,
        scale: 1,
        config: wobbleConfigs.snap,
      });
    }, [api]);

    return (
      <animated.div
        ref={cardRef}
        className={cn(
          'relative rounded-2xl overflow-hidden',
          variantStyles[variant],
          className
        )}
        style={{
          transform: to(
            [springs.rotateX, springs.rotateY, springs.translateX, springs.translateY, springs.scale],
            (rx, ry, tx, ty, s) =>
              `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateX(${tx}px) translateY(${ty}px) scale(${s})`
          ),
          willChange: 'transform',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Noise texture */}
        {noise && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </animated.div>
    );
  }
);

WobbleCard.displayName = 'WobbleCard';
