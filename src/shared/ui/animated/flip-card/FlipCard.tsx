import { forwardRef, useState, type ReactNode } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

type RotateAxis = 'x' | 'y';

export interface FlipCardProps {
  /** Front content */
  children?: ReactNode;
  /** Back content */
  back?: ReactNode;
  /** Rotation axis */
  rotate?: RotateAxis;
  /** Additional container classes */
  className?: string;
  /** Front side classes */
  frontClassName?: string;
  /** Back side classes */
  backClassName?: string;
}

// ============================================================================
// Component - React Spring with bouncy physics
// ============================================================================

export const FlipCard = forwardRef<HTMLDivElement, FlipCardProps>(
  (
    {
      children,
      back,
      rotate = 'y',
      className,
      frontClassName,
      backClassName,
    },
    ref
  ) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Bouncy spring config for satisfying flip
    const { rotation } = useSpring({
      rotation: isFlipped ? 180 : 0,
      config: {
        tension: 200,
        friction: 25,
        mass: 2
      },
    });

    // Default back content
    const backContent = back ?? (
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <span className="text-3xl mb-2 block">✨</span>
          <p className="text-zinc-400">Back side</p>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn('h-72 w-56 [perspective:1000px]', className)}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <animated.div
          className="relative h-full w-full rounded-2xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: rotation.to((r) =>
              rotate === 'y' ? `rotateY(${r}deg)` : `rotateX(${r}deg)`
            ),
          }}
        >
          {/* Front */}
          <div
            className={cn(
              'absolute size-full overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900',
              '[backface-visibility:hidden]',
              frontClassName
            )}
          >
            {children}
          </div>

          {/* Back */}
          <div
            className={cn(
              'absolute h-full w-full overflow-hidden rounded-2xl border border-zinc-600 bg-zinc-800 p-4 text-zinc-100',
              '[backface-visibility:hidden]',
              rotate === 'y' ? '[transform:rotateY(180deg)]' : '[transform:rotateX(180deg)]',
              backClassName
            )}
          >
            {backContent}
          </div>
        </animated.div>
      </div>
    );
  }
);

FlipCard.displayName = 'FlipCard';
