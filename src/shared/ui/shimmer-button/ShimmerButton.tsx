import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Custom spring configs for shimmer
// ============================================================================

const shimmerConfigs = {
  // Smooth continuous motion
  shimmer: { tension: 40, friction: 20 },
  // Quick press response with bounce
  press: { tension: 600, friction: 25 },
  // Smooth hover
  hover: { tension: 400, friction: 30 },
};

// ============================================================================
// Types
// ============================================================================

export interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Shimmer color (CSS color value) */
  shimmerColor?: string;
  /** Border size for the shimmer gap */
  shimmerSize?: string;
  /** Border radius */
  borderRadius?: string;
  /** Shimmer animation speed (lower = faster) */
  shimmerSpeed?: number;
  /** Background color/gradient */
  background?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      className,
      children,
      shimmerColor = '#ffffff',
      shimmerSize = '2px',
      borderRadius = '9999px',
      shimmerSpeed = 2,
      background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      disabled,
      ...props
    },
    ref
  ) => {
    // Shimmer position spring with built-in loop
    const [shimmerSpring] = useSpring(() => ({
      from: { x: -100 },
      to: { x: 200 },
      loop: true,
      config: { duration: 2000 / shimmerSpeed },
    }), [shimmerSpeed]);

    // Rotation spring with built-in loop
    const [rotateSpring] = useSpring(() => ({
      from: { rotate: 0 },
      to: { rotate: 360 },
      loop: true,
      config: { duration: 3000 / shimmerSpeed },
    }), [shimmerSpeed]);

    // Press/hover spring with bouncy feel
    const [pressSpring, pressApi] = useSpring(() => ({
      y: 0,
      scale: 1,
      glow: 0,
      config: shimmerConfigs.press,
    }));

    const handleMouseEnter = () => {
      if (!disabled) {
        pressApi.start({
          scale: 1.02,
          glow: 1,
          config: shimmerConfigs.hover,
        });
      }
    };

    const handleMouseLeave = () => {
      pressApi.start({
        y: 0,
        scale: 1,
        glow: 0,
        config: shimmerConfigs.hover,
      });
    };

    const handleMouseDown = () => {
      if (!disabled) {
        pressApi.start({
          y: 3,
          scale: 0.97,
          config: shimmerConfigs.press,
        });
      }
    };

    const handleMouseUp = () => {
      pressApi.start({
        y: 0,
        scale: 1.02,
        config: shimmerConfigs.press,
      });
    };

    // Combine transforms properly
    const transform = to(
      [pressSpring.y, pressSpring.scale],
      (y, s) => `translateY(${y}px) scale(${s})`
    );

    const boxShadow = pressSpring.glow.to(
      (g) => `0 0 ${g * 20}px ${g * 8}px ${shimmerColor}33`
    );

    return (
      <animated.button
        ref={ref}
        disabled={disabled}
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden',
          'whitespace-nowrap px-6 py-3 text-white font-medium',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        style={{
          background,
          borderRadius,
          transform,
          boxShadow,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {/* Shimmer border effect */}
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <animated.div
            className="absolute inset-0 blur-[2px]"
            style={{
              transform: shimmerSpring.x.to((x) => `translateX(${x}%)`),
            }}
          >
            <animated.div
              className="absolute -inset-full aspect-square"
              style={{
                transform: rotateSpring.rotate.to((r) => `rotate(${r}deg)`),
                background: `conic-gradient(from 270deg, transparent 0deg, ${shimmerColor} 90deg, transparent 90deg)`,
              }}
            />
          </animated.div>
        </div>

        {/* Inner background (creates the gap/border effect) */}
        <div
          className="absolute z-[-1] rounded-[inherit]"
          style={{
            background,
            inset: shimmerSize,
          }}
        />

        {/* Highlight overlay */}
        <div
          className={cn(
            'absolute inset-0 rounded-[inherit]',
            'bg-gradient-to-b from-white/20 to-transparent opacity-0',
            'group-hover:opacity-100 transition-opacity duration-300'
          )}
        />

        {/* Shadow overlay */}
        <div
          className={cn(
            'absolute inset-0 rounded-[inherit]',
            'shadow-[inset_0_-8px_10px_rgba(255,255,255,0.1)]',
            'group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.15)]',
            'group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.2)]',
            'transition-shadow duration-200'
          )}
        />

        {/* Content */}
        <span className="relative z-10">{children}</span>
      </animated.button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
