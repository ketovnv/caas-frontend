import {
  forwardRef,
  useRef,
  useCallback,
  useImperativeHandle,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// Custom spring configs for organic feel
const springConfigs = {
  // Snappy with nice overshoot
  magnetic: { tension: 400, friction: 28, mass: 1 },
  // Bouncy return
  bounce: { tension: 500, friction: 15, mass: 0.8 },
  // Smooth scale
  scale: { tension: 350, friction: 26 },
  // Soft glow
  glow: { tension: 200, friction: 20 },
};

// ============================================================================
// Types
// ============================================================================

export interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Magnetic pull strength (0-1) */
  strength?: number;
  /** Enable 3D tilt effect */
  tilt?: boolean;
  /** Tilt intensity in degrees */
  tiltIntensity?: number;
  /** Scale on hover */
  hoverScale?: number;
  /** Enable glow effect */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
}

export interface MagneticButtonRef {
  /** Trigger magnetic pulse animation */
  pulse: () => Promise<void>;
  /** Reset position */
  reset: () => void;
}

// ============================================================================
// Component - Full Imperative React Spring
// ============================================================================

export const MagneticButton = forwardRef<MagneticButtonRef, MagneticButtonProps>(
  (
    {
      children,
      className,
      strength = 0.4,
      tilt = true,
      tiltIntensity = 15,
      hoverScale = 1.08,
      glow = false,
      glowColor = 'rgba(59, 130, 246, 0.6)',
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const bounds = useRef({ width: 0, height: 0, left: 0, top: 0 });

    // 🎯 Single spring for all transform values - proper reactive interpolation
    const [springs, api] = useSpring(() => ({
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      contentX: 0,
      contentY: 0,
      glowOpacity: 0,
      glowBlur: 0,
      config: springConfigs.magnetic,
    }));

    // 🎭 Expose imperative methods
    useImperativeHandle(ref, () => ({
      pulse: async () => {
        await api.start({
          scale: 1.2,
          config: springConfigs.bounce
        });
        await api.start({
          scale: 1,
          config: springConfigs.bounce
        });
      },
      reset: () => {
        api.start({
          x: 0, y: 0, rotateX: 0, rotateY: 0,
          scale: 1, contentX: 0, contentY: 0,
          glowOpacity: 0, glowBlur: 0,
          config: springConfigs.bounce,
        });
      },
    }));

    const updateBounds = useCallback(() => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      bounds.current = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      };
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const { width, height, left, top } = bounds.current;
        if (width === 0) return;

        // Normalized position (-1 to 1)
        const mouseX = (e.clientX - left - width / 2) / (width / 2);
        const mouseY = (e.clientY - top - height / 2) / (height / 2);

        // Clamp for stability
        const clampedX = Math.max(-1, Math.min(1, mouseX));
        const clampedY = Math.max(-1, Math.min(1, mouseY));

        // Magnetic pull with easing
        const pullX = clampedX * width * strength * 0.35;
        const pullY = clampedY * height * strength * 0.35;

        api.start({
          x: pullX,
          y: pullY,
          // Content moves opposite for parallax depth
          contentX: -pullX * 0.25,
          contentY: -pullY * 0.25,
          // 3D tilt
          rotateX: tilt ? -clampedY * tiltIntensity : 0,
          rotateY: tilt ? clampedX * tiltIntensity : 0,
          // Glow
          glowOpacity: glow ? 0.9 : 0,
          glowBlur: glow ? 25 : 0,
          config: springConfigs.magnetic,
        });

        onMouseMove?.(e);
      },
      [strength, tilt, tiltIntensity, glow, api, onMouseMove]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        updateBounds();

        api.start({
          scale: hoverScale,
          glowOpacity: glow ? 0.7 : 0,
          glowBlur: glow ? 18 : 0,
          config: springConfigs.scale,
        });

        onMouseEnter?.(e);
      },
      [updateBounds, api, hoverScale, glow, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Bouncy return to origin
        api.start({
          x: 0, y: 0, rotateX: 0, rotateY: 0,
          scale: 1, contentX: 0, contentY: 0,
          glowOpacity: 0, glowBlur: 0,
          config: springConfigs.bounce,
        });

        onMouseLeave?.(e);
      },
      [api, onMouseLeave]
    );

    // Proper reactive transform interpolation using `to`
    const transform = to(
      [springs.x, springs.y, springs.rotateX, springs.rotateY, springs.scale],
      (x, y, rx, ry, s) =>
        `perspective(1000px) translateX(${x}px) translateY(${y}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
    );

    const contentTransform = to(
      [springs.contentX, springs.contentY],
      (cx, cy) => `translateX(${cx}px) translateY(${cy}px) translateZ(20px)`
    );

    return (
      <animated.button
        ref={buttonRef}
        className={cn(
          'relative inline-flex items-center justify-center',
          'px-6 py-3 rounded-xl font-medium',
          'bg-gradient-to-br from-blue-600 to-purple-600 text-white',
          'shadow-lg shadow-blue-500/25',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        style={{
          transform,
          transformStyle: 'preserve-3d',
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
            className="absolute inset-0 rounded-xl pointer-events-none -z-10"
            style={{
              background: glowColor,
              opacity: springs.glowOpacity,
              filter: springs.glowBlur.to((b) => `blur(${b}px)`),
              transform: 'translateZ(-10px) scale(1.1)',
            }}
          />
        )}

        {/* Content with parallax offset */}
        <animated.span
          className="relative z-10 flex items-center gap-2"
          style={{ transform: contentTransform }}
        >
          {children}
        </animated.span>

        {/* Shine overlay */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
          style={{ transform: 'translateZ(5px)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
        </div>
      </animated.button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';
