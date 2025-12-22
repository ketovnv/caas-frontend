import { forwardRef, useRef, useState, useCallback, useEffect, type ReactNode, type HTMLAttributes } from 'react';
import { useSpring, animated, to, type SpringValue } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Custom Spring Configs - Organic feel
// ============================================================================

const cardConfigs = {
  // Responsive tilt with subtle overshoot
  tilt: { tension: 450, friction: 30, mass: 1 },
  // Smooth hover with slight bounce
  hover: { tension: 380, friction: 26 },
  // Quick snap back
  snap: { tension: 500, friction: 28 },
  // Soft glow pulse
  glow: { tension: 200, friction: 18 },
  // Entry animation
  entry: { tension: 280, friction: 60, mass: 1.2 },
  // Morphing border
  morph: { tension: 350, friction: 20 },
};

// ============================================================================
// Types
// ============================================================================

type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient' | 'neon';
type AnimationPreset = 'fadeIn' | 'slideInUp' | 'zoomIn' | 'flipInY';

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
  /** Entry animation preset */
  animationPreset?: AnimationPreset;
  /** External spring values for imperative control */
  externalScale?: SpringValue<number>;
  externalX?: SpringValue<number>;
  externalY?: SpringValue<number>;
  externalRotateX?: SpringValue<number>;
  externalRotateY?: SpringValue<number>;
  externalOpacity?: SpringValue<number>;
}

// ============================================================================
// Animation Presets with spring physics
// ============================================================================

const presets: Record<AnimationPreset, { from: Record<string, number>; to: Record<string, number> }> = {
  fadeIn: {
    from: { opacity: 0, scale: 1, y: 0, rotateY: 0 },
    to: { opacity: 1, scale: 1, y: 0, rotateY: 0 },
  },
  slideInUp: {
    from: { opacity: 0, scale: 1, y: 30, rotateY: 0 },
    to: { opacity: 1, scale: 1, y: 0, rotateY: 0 },
  },
  zoomIn: {
    from: { opacity: 0, scale: 0.85, y: 0, rotateY: 0 },
    to: { opacity: 1, scale: 1, y: 0, rotateY: 0 },
  },
  flipInY: {
    from: { opacity: 0, scale: 1, y: 0, rotateY: 90 },
    to: { opacity: 1, scale: 1, y: 0, rotateY: 0 },
  },
};

// ============================================================================
// Variant Styles
// ============================================================================

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800',
  elevated: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xl',
  glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20',
  gradient: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
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
      animationPreset = 'fadeIn',
      externalScale,
      externalX,
      externalY,
      externalRotateX,
      externalRotateY,
      externalOpacity,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const bounds = useRef({ width: 0, height: 0, left: 0, top: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const preset = presets[animationPreset];

    // Main transform spring - all values in one for proper interpolation
    const [springs, api] = useSpring(() => ({
      // Base transform values
      opacity: preset.from.opacity ?? 1,
      scale: preset.from.scale ?? 1,
      x: 0,
      y: preset.from.y ?? 0,
      rotateX: 0,
      rotateY: preset.from.rotateY ?? 0,
      // Hover effects
      hoverScale: 1,
      shadowBlur: 8,
      shadowY: 4,
      glowOpacity: 0,
      glowBlur: 0,
      borderRadius: 12,
      config: cardConfigs.entry,
    }));

    // Entry animation - use useEffect to avoid state update during render
    const hasEnteredRef = useRef(false);
    useEffect(() => {
      if (hasEnteredRef.current) return;
      hasEnteredRef.current = true;

      api.start({
        opacity: preset.to.opacity ?? 1,
        scale: preset.to.scale ?? 1,
        y: preset.to.y ?? 0,
        rotateY: preset.to.rotateY ?? 0,
        config: cardConfigs.entry,
      });
    }, [api, preset.to]);

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

        // Normalized mouse position (-1 to 1)
        const mouseX = (e.clientX - left - width / 2) / (width / 2);
        const mouseY = (e.clientY - top - height / 2) / (height / 2);

        // Clamp values
        const clampedX = Math.max(-1, Math.min(1, mouseX));
        const clampedY = Math.max(-1, Math.min(1, mouseY));

        const updates: Record<string, number> = {
          rotateX: -clampedY * tiltIntensity * 20,
          rotateY: clampedX * tiltIntensity * 20,
        };

        if (magnetic) {
          updates.x = clampedX * 12;
          updates.y = clampedY * 12;
        }

        api.start({
          ...updates,
          config: cardConfigs.tilt,
        });
      },
      [hover, magnetic, tiltIntensity, api]
    );

    const handleMouseEnter = useCallback(() => {
      updateBounds();
      setIsHovered(true);

      const updates: Record<string, number> = {};

      if (hover) {
        updates.hoverScale = 1.03;
        updates.shadowBlur = 25;
        updates.shadowY = 12;
      }

      if (glow) {
        updates.glowOpacity = 0.85;
        updates.glowBlur = 25;
      }

      if (morphing) {
        updates.borderRadius = 24;
      }

      api.start({
        ...updates,
        config: cardConfigs.hover,
      });
    }, [updateBounds, hover, glow, morphing, api]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);

      api.start({
        x: 0,
        rotateX: 0,
        rotateY: 0,
        hoverScale: 1,
        shadowBlur: 8,
        shadowY: 4,
        glowOpacity: 0,
        glowBlur: 0,
        borderRadius: morphing ? 12 : 12,
        config: cardConfigs.snap,
      });
    }, [morphing, api]);

    // Use external springs if provided, otherwise use internal
    const finalScale = externalScale ?? springs.scale;
    const finalX = externalX ?? springs.x;
    const finalY = externalY ?? springs.y;
    const finalRotateX = externalRotateX ?? springs.rotateX;
    const finalRotateY = externalRotateY ?? springs.rotateY;
    const finalOpacity = externalOpacity ?? springs.opacity;

    // Proper reactive transform using `to()`
    const transform = to(
      [finalScale, finalX, finalY, finalRotateX, finalRotateY, springs.hoverScale],
      (scale, x, y, rx, ry, hs) =>
        `perspective(1000px) scale(${(scale as number) * (hs as number)}) translateX(${x}px) translateY(${y}px) rotateX(${rx}deg) rotateY(${ry}deg)`
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
          'relative overflow-hidden',
          variantStyles[variant],
          className
        )}
        style={{
          transform,
          opacity: finalOpacity,
          borderRadius: morphing ? springs.borderRadius.to((r) => `${r}px`) : '0.75rem',
          boxShadow: hover ? boxShadow : undefined,
          willChange: 'transform, opacity',
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
              filter: springs.glowBlur.to((b) => `blur(${b}px)`),
              transform: 'scale(1.1)',
            }}
          >
            <div
              className={cn(
                'absolute inset-0',
                variant === 'gradient' && 'bg-gradient-to-br from-purple-500 to-pink-500',
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
