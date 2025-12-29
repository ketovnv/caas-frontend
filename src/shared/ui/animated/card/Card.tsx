import { forwardRef, useRef, useState, useCallback, type ReactNode, type HTMLAttributes } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient' | 'neon';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Enable hover scale effect */
  hover?: boolean;
  /** Enable glow effect on hover */
  glow?: boolean;
  /** Enable magnetic cursor follow effect */
  magnetic?: boolean;
  /** 3D tilt intensity (0-1) */
  tiltIntensity?: number;
  /** Enable morphing border radius */
  morphing?: boolean;
  /** Card visual variant */
  variant?: CardVariant;
}

// ============================================================================
// Variant Styles
// ============================================================================

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800',
  elevated: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xl',
  glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20',
  gradient: 'bg-gradient-to-br from-slate-600 to-cyan-600 text-white',
  neon: 'bg-black border-2 border-cyan-500 text-cyan-400',
};

// ============================================================================
// Component
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      hover = true,
      glow = false,
      magnetic = false,
      tiltIntensity = 0.15,
      morphing = false,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const bounds = useRef({ width: 0, height: 0, left: 0, top: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Spring for hover/tilt effects only - NO opacity animation
    const [springs, api] = useSpring(() => ({
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      shadowBlur: 8,
      shadowY: 4,
      glowOpacity: 0,
      borderRadius: 12,
      config: { tension: 400, friction: 30 },
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
        if (!hover) return;
        const { width, height, left, top } = bounds.current;
        if (width === 0) return;

        const mouseX = (e.clientX - left - width / 2) / (width / 2);
        const mouseY = (e.clientY - top - height / 2) / (height / 2);

        const clampedX = Math.max(-1, Math.min(1, mouseX));
        const clampedY = Math.max(-1, Math.min(1, mouseY));

        api.start({
          rotateX: -clampedY * tiltIntensity * 20,
          rotateY: clampedX * tiltIntensity * 20,
          ...(magnetic && {
            x: clampedX * 12,
            y: clampedY * 12,
          }),
        });
      },
      [hover, magnetic, tiltIntensity, api]
    );

    const handleMouseEnter = useCallback(() => {
      updateBounds();
      setIsHovered(true);

      api.start({
        scale: hover ? 1.03 : 1,
        shadowBlur: 25,
        shadowY: 12,
        glowOpacity: glow ? 0.85 : 0,
        borderRadius: morphing ? 24 : 12,
      });
    }, [updateBounds, hover, glow, morphing, api]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);

      api.start({
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        shadowBlur: 8,
        shadowY: 4,
        glowOpacity: 0,
        borderRadius: 12,
      });
    }, [api]);

    const transform = to(
      [springs.x, springs.y, springs.rotateX, springs.rotateY, springs.scale],
      (x, y, rx, ry, s) =>
        `perspective(1000px) translateX(${x}px) translateY(${y}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
    );

    const boxShadow = to(
      [springs.shadowBlur, springs.shadowY],
      (blur, y) => `0 ${y}px ${blur}px rgba(0,0,0,0.15)`
    );

    return (
      <animated.div
        ref={(node) => {
          cardRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'relative overflow-hidden rounded-xl',
          variantStyles[variant],
          className
        )}
        style={{
          transform,
          borderRadius: morphing ? springs.borderRadius.to((r) => `${r}px`) : undefined,
          boxShadow: hover ? boxShadow : undefined,
          willChange: 'transform',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Glow effect */}
        {glow && (
          <animated.div
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              opacity: springs.glowOpacity,
              filter: 'blur(25px)',
              transform: 'scale(1.1)',
            }}
          >
            <div
              className={cn(
                'absolute inset-0',
                variant === 'gradient' && 'bg-gradient-to-br from-slate-600 to-cyan-600',
                variant === 'neon' && 'bg-cyan-500',
                variant !== 'gradient' && variant !== 'neon' && 'bg-blue-500'
              )}
            />
          </animated.div>
        )}

        {/* Glass overlay */}
        {variant === 'glass' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        )}

        {/* Neon glow */}
        {variant === 'neon' && isHovered && (
          <animated.div
            className="absolute inset-0 -z-10 rounded-xl"
            style={{
              opacity: springs.glowOpacity,
              boxShadow: '0 0 40px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.2)',
            }}
          />
        )}

        {children}
      </animated.div>
    );
  }
);

Card.displayName = 'Card';
