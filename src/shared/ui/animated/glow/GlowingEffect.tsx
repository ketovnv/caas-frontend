import { memo, useRef, useEffect, useCallback } from 'react';
import { animate } from 'motion/react';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface GlowingEffectProps {
  /** Blur amount for glow */
  blur?: number;
  /** Inactive zone in center (0-1) */
  inactiveZone?: number;
  /** Proximity range to activate */
  proximity?: number;
  /** Spread of the glow cone */
  spread?: number;
  /** Visual variant */
  variant?: 'default' | 'white';
  /** Show static glow */
  glow?: boolean;
  /** Container className */
  className?: string;
  /** Animation duration for angle movement */
  movementDuration?: number;
  /** Border width */
  borderWidth?: number;
  /** Disable the effect */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const GlowingEffect = memo(function GlowingEffect({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  variant = 'default',
  glow = false,
  className,
  movementDuration = 2,
  borderWidth = 1,
  disabled = false,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback(
    (e?: { x: number; y: number }) => {
      if (!containerRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const element = containerRef.current;
        if (!element) return;

        const { left, top, width, height } = element.getBoundingClientRect();
        const mouseX = e?.x ?? lastPosition.current.x;
        const mouseY = e?.y ?? lastPosition.current.y;

        if (e) {
          lastPosition.current = { x: mouseX, y: mouseY };
        }

        const center = [left + width * 0.5, top + height * 0.5];
        const distanceFromCenter = Math.hypot(
          mouseX - center[0]!,
          mouseY - center[1]!
        );
        const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

        if (distanceFromCenter < inactiveRadius) {
          element.style.setProperty('--active', '0');
          return;
        }

        const isActive =
          mouseX > left - proximity &&
          mouseX < left + width + proximity &&
          mouseY > top - proximity &&
          mouseY < top + height + proximity;

        element.style.setProperty('--active', isActive ? '1' : '0');

        if (!isActive) return;

        const currentAngle =
          parseFloat(element.style.getPropertyValue('--start')) || 0;
        let targetAngle =
          (180 * Math.atan2(mouseY - center[1]!, mouseX - center[0]!)) /
            Math.PI +
          90;

        const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
        const newAngle = currentAngle + angleDiff;

        animate(currentAngle, newAngle, {
          duration: movementDuration,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (value) => {
            element.style.setProperty('--start', String(value));
          },
        });
      });
    },
    [inactiveZone, proximity, movementDuration]
  );

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => handleMove();
    const handlePointerMove = (e: PointerEvent) =>
      handleMove({ x: e.clientX, y: e.clientY });

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.body.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handleMove, disabled]);

  return (
    <>
      {/* Static border when disabled */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity',
          glow && 'opacity-100',
          variant === 'white' && 'border-white',
          disabled && '!block'
        )}
      />
      {/* Animated glow container */}
      <div
        ref={containerRef}
        style={
          {
            '--blur': `${blur}px`,
            '--spread': spread,
            '--start': '0',
            '--active': '0',
            '--glowingeffect-border-width': `${borderWidth}px`,
            '--repeating-conic-gradient-times': '5',
            '--gradient':
              variant === 'white'
                ? `repeating-conic-gradient(
                    from 236.84deg at 50% 50%,
                    var(--black),
                    var(--black) calc(25% / var(--repeating-conic-gradient-times))
                  )`
                : `radial-gradient(circle, #ff8ad8 12%, #ff8ad800 22%),
                   radial-gradient(circle at 40% 40%, #ffb833 8%, #ffb83300 18%),
                   radial-gradient(circle at 60% 60%, #7cd94e 12%, #7cd94e00 22%),
                   radial-gradient(circle at 40% 60%, #5ca8d4 12%, #5ca8d400 22%),
                   repeating-conic-gradient(
                     from 236.84deg at 50% 50%,
                     #ff8ad8 0%,
                     #ffb833 calc(25% / var(--repeating-conic-gradient-times)),
                     #7cd94e calc(50% / var(--repeating-conic-gradient-times)),
                     #5ca8d4 calc(75% / var(--repeating-conic-gradient-times)),
                     #ff8ad8 calc(100% / var(--repeating-conic-gradient-times))
                   )`,
          } as React.CSSProperties
        }
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
          glow && 'opacity-100',
          blur > 0 && 'blur-[var(--blur)]',
          className,
          disabled && '!hidden'
        )}
      >
        <div
          className={cn(
            'glow',
            'rounded-[inherit]',
            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
            'after:[border:var(--glowingeffect-border-width)_solid_transparent]',
            'after:[background:var(--gradient)] after:[background-attachment:fixed]',
            'after:opacity-[var(--active)] after:transition-opacity after:duration-300',
            'after:[mask-clip:padding-box,border-box]',
            'after:[mask-composite:intersect]',
            'after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]'
          )}
        />
      </div>
    </>
  );
});

GlowingEffect.displayName = 'GlowingEffect';
