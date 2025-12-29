import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Shimmer color (CSS color value) */
  shimmerColor?: string;
  /** Shimmer spread angle in degrees */
  shimmerSpread?: number;
  /** Border gap size for the shimmer */
  shimmerSize?: string;
  /** Border radius */
  borderRadius?: string;
  /** Animation duration in seconds */
  shimmerDuration?: number;
  /** Background color/gradient */
  background?: string;
  /** Blur amount for shimmer glow */
  shimmerBlur?: number;
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
      shimmerSpread = 90,
      shimmerSize = '0.1em',
      borderRadius = '100px',
      shimmerDuration = 5,
      background = 'rgba(0, 0, 0, 1)',
      shimmerBlur = 8,
      disabled,
      ...props
    },
    ref
  ) => {
    const isMounted = useRef(true);

    // Combined animation spring for both slide and spin
    const [animSpring, animApi] = useSpring(() => ({
      slide: 0,
      spin: 0,
      config: { tension:100, friction:50,mass: shimmerDuration * 10 },
    }));

    // Press/hover spring
    const [pressSpring, pressApi] = useSpring(() => ({
      y: 0,
      scale: 1,
      innerShadowY: 8,
      innerShadowBlur: 10,
      innerShadowOpacity: 0.15,
      config: { tension: 300, friction: 20 },
    }));

    // Animation loops using requestAnimationFrame for smoother performance
    useEffect(() => {
      isMounted.current = true;
      let slideDirection = 1;

      const slideMs = shimmerDuration * 1000;
      const spinMs = shimmerDuration * 2 * 1000;

      // Slide animation - ping-pong
      const runSlide = () => {
        if (!isMounted.current) return;

        animApi.start({
          slide: slideDirection,
          config: { duration: slideMs },
          onRest: () => {
            if (isMounted.current) {
              slideDirection = slideDirection === 1 ? 0 : 1;
              runSlide();
            }
          },
        });
      };

      // Spin animation - continuous loop
      const runSpin = () => {
        if (!isMounted.current) return;

        animApi.set({ spin: 0 });
        animApi.start({
          spin: 1,
          config: { duration: spinMs },
          onRest: () => {
            if (isMounted.current) {
              runSpin();
            }
          },
        });
      };

      runSlide();
      runSpin();

      return () => {
        isMounted.current = false;
        animApi.stop();
      };
    }, [shimmerDuration, animApi]);

    const handleMouseEnter = () => {
      if (!disabled) {
        pressApi.start({
          innerShadowY: 6,
          innerShadowOpacity: 0.24,
        });
      }
    };

    const handleMouseLeave = () => {
      pressApi.start({
        y: 0,
        scale: 1,
        innerShadowY: 8,
        innerShadowOpacity: 0.12,
      });
    };

    const handleMouseDown = () => {
      if (!disabled) {
        pressApi.start({
          y: 1,
          scale: 0.98,
          innerShadowY: 10,
          innerShadowOpacity: 0.24,
          config: { tension: 600, friction: 25 },
        });
      }
    };

    const handleMouseUp = () => {
      pressApi.start({
        y: 0,
        scale: 1,
        config: { tension: 400, friction: 20 },
      });
    };

    // Transform interpolation
    const buttonTransform = to(
      [pressSpring.y, pressSpring.scale],
      (y, s) => `translateY(${y}px) scale(${s})`
    );

    // Inner shadow interpolation
    const innerShadow = to(
      [pressSpring.innerShadowY, pressSpring.innerShadowBlur, pressSpring.innerShadowOpacity],
      (y, blur, opacity) => `inset 0 -${y}px ${blur}px rgba(255, 255, 255, ${opacity})`
    );

    // Shimmer slide transform - moves shimmer across button width
    const shimmerSlideTransform = animSpring.slide.to(
      (p) => `translate(calc(${p * 100}cqw - ${p * 100}%), 0)`
    );

    // Stepped rotation matching original CSS keyframes:
    // 0% -> 0deg, 15% -> 90deg, 35% -> 90deg (hold), 65% -> 270deg, 85% -> 270deg (hold), 100% -> 360deg
    const shimmerRotation = animSpring.spin.to((p) => {
      let degrees: number;
      if (p < 0.15) {
        // 0% to 15%: 0deg → 90deg
        degrees = (p / 0.15) * 90;
      } else if (p < 0.35) {
        // 15% to 35%: hold at 90deg
        degrees = 90;
      } else if (p < 0.65) {
        // 35% to 65%: 90deg → 270deg
        degrees = 90 + ((p - 0.35) / 0.30) * 180;
      } else if (p < 0.85) {
        // 65% to 85%: hold at 270deg
        degrees = 270;
      } else {
        // 85% to 100%: 270deg → 360deg
        degrees = 270 + ((p - 0.85) / 0.15) * 90;
      }
      return `rotate(${degrees}deg)`;
    });

    // Conic gradients for shimmer effect
    // Main shimmer - wedge-shaped highlight with sharp edges
    const halfSpread = shimmerSpread * 0.5;
    // Gradient: transparent → shimmerColor (over spread degrees) → instant cut to transparent
    const shimmerGradient = `conic-gradient(from ${270 - halfSpread}deg, transparent 0deg, ${shimmerColor} ${shimmerSpread}deg, transparent ${shimmerSpread}deg)`;
    // Tighter highlight for the bright center streak
    const highlightGradient = `conic-gradient(from ${270 - halfSpread * 0.5}deg, transparent 0deg, ${shimmerColor} ${shimmerSpread * 0.5}deg, transparent ${shimmerSpread * 0.5}deg)`;

    return (
      <animated.button
        ref={ref}
        disabled={disabled}
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden',
          'whitespace-nowrap border border-white/10 px-6 py-3 text-white',
          'transform-gpu transition-transform duration-300 ease-in-out',
          'active:translate-y-px',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        style={{
          background,
          borderRadius,
          transform: buttonTransform,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {/* Shimmer glow layer - blurred for ambient effect */}
        <div
          className="absolute -z-30 inset-0 overflow-visible pointer-events-none"
          style={{
            containerType: 'size',
            filter: `blur(${shimmerBlur}px)`,
          }}
        >
          <animated.div
            className="absolute inset-0"
            style={{
              height: '100cqh',
              aspectRatio: '1',
              transform: shimmerSlideTransform,
            }}
          >
            <animated.div
              className="absolute -inset-full w-auto"
              style={{
                background: shimmerGradient,
                transform: shimmerRotation,
              }}
            />
          </animated.div>
        </div>

        {/* Sharp shimmer highlight layer - minimal blur for defined streak */}
        <div
          className="absolute -z-30 inset-0 overflow-visible pointer-events-none"
          style={{
            containerType: 'size',
            filter: `blur(${Math.max(2, shimmerBlur * 0.25)}px)`,
          }}
        >
          <animated.div
            className="absolute inset-0"
            style={{
              height: '100cqh',
              aspectRatio: '1',
              transform: shimmerSlideTransform,
            }}
          >
            <animated.div
              className="absolute -inset-full w-auto"
              style={{
                background: highlightGradient,
                transform: shimmerRotation,
              }}
            />
          </animated.div>
        </div>

        {/* Inner shadow overlay for depth */}
        <animated.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            boxShadow: innerShadow,
          }}
        />

        {/* Inner background - creates the glowing border gap effect */}
        <div
          className="absolute -z-20"
          style={{
            background,
            borderRadius,
            inset: shimmerSize,
          }}
        />

        {/* Content */}
        <span className="relative z-10">{children}</span>
      </animated.button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
