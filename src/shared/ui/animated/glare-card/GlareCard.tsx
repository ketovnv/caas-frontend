import { forwardRef, useRef, useCallback, type ReactNode, type HTMLAttributes } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Spring configs
// ============================================================================

const glareConfigs = {
  tilt: { tension: 400, friction: 30, mass: 0.5 },
  glare: { tension: 300, friction: 25 },
  hover: { tension: 350, friction: 26 },
};

// ============================================================================
// Types
// ============================================================================

export interface GlareCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Glare color */
  glareColor?: string;
  /** Glare intensity (0-1) */
  glareIntensity?: number;
  /** Tilt intensity (0-1) */
  tiltIntensity?: number;
  /** Border gradient colors */
  borderColors?: string[];
  /** Disable glare effect */
  disableGlare?: boolean;
  /** Disable tilt effect */
  disableTilt?: boolean;
}

export interface GlareCardRef {
  pulse: () => void;
  reset: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const GlareCard = forwardRef<GlareCardRef, GlareCardProps>(
  (
    {
      children,
      className,
      glareColor = 'rgba(255, 255, 255, 0.4)',
      glareIntensity = 0.5,
      tiltIntensity = 0.15,
      borderColors = ['#3b82f6', '#8b5cf6', '#ec4899'],
      disableGlare = false,
      disableTilt = false,
      ...props
    },
    _ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const bounds = useRef({ width: 0, height: 0, left: 0, top: 0 });

    // Combined spring for all animations
    const [springs, api] = useSpring(() => ({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
      borderOpacity: 0.3,
      shadowBlur: 20,
      config: glareConfigs.tilt,
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

        // Mouse position relative to card center (-1 to 1)
        const mouseX = (e.clientX - left) / width;
        const mouseY = (e.clientY - top) / height;
        const centerX = mouseX - 0.5;
        const centerY = mouseY - 0.5;

        const updates: Record<string, number> = {
          glareX: mouseX * 100,
          glareY: mouseY * 100,
        };

        if (!disableTilt) {
          updates.rotateX = -centerY * tiltIntensity * 30;
          updates.rotateY = centerX * tiltIntensity * 30;
        }

        api.start({
          ...updates,
          config: glareConfigs.tilt,
        });
      },
      [disableTilt, tiltIntensity, api]
    );

    const handleMouseEnter = useCallback(() => {
      updateBounds();
      api.start({
        scale: 1.02,
        glareOpacity: disableGlare ? 0 : glareIntensity,
        borderOpacity: 0.8,
        shadowBlur: 40,
        config: glareConfigs.hover,
      });
    }, [updateBounds, disableGlare, glareIntensity, api]);

    const handleMouseLeave = useCallback(() => {
      api.start({
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        glareX: 50,
        glareY: 50,
        glareOpacity: 0,
        borderOpacity: 0.3,
        shadowBlur: 20,
        config: glareConfigs.hover,
      });
    }, [api]);

    // Build the border gradient
    const borderGradient = `linear-gradient(135deg, ${borderColors.join(', ')})`;

    return (
      <animated.div
        ref={cardRef}
        className={cn(
          'relative rounded-2xl cursor-pointer',
          'bg-zinc-900/90 backdrop-blur-sm',
          className
        )}
        style={{
          transform: to(
            [springs.rotateX, springs.rotateY, springs.scale],
            (rx, ry, s) =>
              `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
          ),
          boxShadow: springs.shadowBlur.to(
            (blur) => `0 ${blur / 2}px ${blur}px rgba(0,0,0,0.3)`
          ),
          willChange: 'transform',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Animated border */}
        <animated.div
          className="absolute inset-0 rounded-2xl -z-10"
          style={{
            background: borderGradient,
            opacity: springs.borderOpacity,
            padding: 1,
          }}
        >
          <div className="w-full h-full rounded-2xl bg-zinc-900" />
        </animated.div>

        {/* Border glow */}
        <animated.div
          className="absolute inset-0 rounded-2xl -z-20 blur-xl"
          style={{
            background: borderGradient,
            opacity: springs.borderOpacity.to((o) => o * 0.5),
          }}
        />

        {/* Glare overlay */}
        {!disableGlare && (
          <animated.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            style={{ opacity: springs.glareOpacity }}
          >
            <animated.div
              className="absolute w-[200%] h-[200%]"
              style={{
                background: `radial-gradient(circle at center, ${glareColor} 0%, transparent 50%)`,
                left: springs.glareX.to((x) => `${x - 100}%`),
                top: springs.glareY.to((y) => `${y - 100}%`),
              }}
            />
          </animated.div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </animated.div>
    );
  }
);

GlareCard.displayName = 'GlareCard';
