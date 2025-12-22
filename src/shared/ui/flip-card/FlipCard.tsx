import {
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Custom spring configs for card flip
// ============================================================================

const flipConfigs = {
  // Satisfying flip with overshoot
  flip: { tension: 280, friction: 60, mass: 1 },
  // Bouncy hover
  hover: { tension: 400, friction: 25 },
  // Quick tap response
  tap: { tension: 500, friction: 30 },
};

// ============================================================================
// Types
// ============================================================================

type RotateAxis = 'x' | 'y';

export interface FlipCardProps {
  /** Front content */
  children?: ReactNode;
  /** Back content (default fallback provided) */
  back?: ReactNode;
  /** Rotation axis */
  rotate?: RotateAxis;
  /** Flip on hover (default) or click */
  trigger?: 'hover' | 'click';
  /** Additional container classes */
  className?: string;
  /** Front side classes */
  frontClassName?: string;
  /** Back side classes */
  backClassName?: string;
}

export interface FlipCardRef {
  /** Flip to front */
  flipToFront: () => void;
  /** Flip to back */
  flipToBack: () => void;
  /** Toggle flip */
  toggle: () => void;
  /** Get current state */
  isFlipped: () => boolean;
}

// ============================================================================
// Component - Full React Spring implementation
// ============================================================================

export const FlipCard = forwardRef<FlipCardRef, FlipCardProps>(
  (
    {
      children,
      back,
      rotate = 'y',
      trigger = 'hover',
      className,
      frontClassName,
      backClassName,
    },
    ref
  ) => {
    const [flipped, setFlipped] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Main flip spring with satisfying physics
    const [flipSpring, flipApi] = useSpring(() => ({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      config: flipConfigs.flip,
    }));

    // Subtle hover lift effect
    const [hoverSpring] = useSpring(() => ({
      y: isHovering ? -8 : 0,
      shadow: isHovering ? 25 : 10,
      config: flipConfigs.hover,
    }), [isHovering]);

    // Imperative methods
    useImperativeHandle(ref, () => ({
      flipToFront: () => {
        setFlipped(false);
        flipApi.start({
          rotateX: rotate === 'x' ? 0 : 0,
          rotateY: rotate === 'y' ? 0 : 0,
          config: flipConfigs.flip,
        });
      },
      flipToBack: () => {
        setFlipped(true);
        flipApi.start({
          rotateX: rotate === 'x' ? 180 : 0,
          rotateY: rotate === 'y' ? 180 : 0,
          config: flipConfigs.flip,
        });
      },
      toggle: () => {
        const newFlipped = !flipped;
        setFlipped(newFlipped);
        flipApi.start({
          rotateX: rotate === 'x' ? (newFlipped ? 180 : 0) : 0,
          rotateY: rotate === 'y' ? (newFlipped ? 180 : 0) : 0,
          config: flipConfigs.flip,
        });
      },
      isFlipped: () => flipped,
    }));

    const handleFlip = (shouldFlip: boolean) => {
      if (trigger === 'hover') {
        setFlipped(shouldFlip);
        flipApi.start({
          rotateX: rotate === 'x' ? (shouldFlip ? 180 : 0) : 0,
          rotateY: rotate === 'y' ? (shouldFlip ? 180 : 0) : 0,
          scale: shouldFlip ? 1.02 : 1,
          config: flipConfigs.flip,
        });
      }
      setIsHovering(shouldFlip);
    };

    const handleClick = () => {
      if (trigger === 'click') {
        const newFlipped = !flipped;
        setFlipped(newFlipped);
        flipApi.start({
          rotateX: rotate === 'x' ? (newFlipped ? 180 : 0) : 0,
          rotateY: rotate === 'y' ? (newFlipped ? 180 : 0) : 0,
          scale: 1,
          config: flipConfigs.flip,
        });
      }
    };

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
      <animated.div
        className={cn('h-72 w-56 cursor-pointer', className)}
        style={{
          perspective: 1200,
          translateY: hoverSpring.y,
        }}
        onMouseEnter={() => handleFlip(true)}
        onMouseLeave={() => handleFlip(false)}
        onClick={handleClick}
      >
        <animated.div
          className="relative h-full w-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: to(
              [flipSpring.rotateX, flipSpring.rotateY, flipSpring.scale],
              (rx, ry, s) =>
                rotate === 'x'
                  ? `rotateX(${rx}deg) scale(${s})`
                  : `rotateY(${ry}deg) scale(${s})`
            ),
          }}
        >
          {/* Front */}
          <animated.div
            className={cn(
              'absolute inset-0 overflow-hidden rounded-2xl',
              'border border-zinc-700 bg-zinc-900',
              'shadow-xl',
              frontClassName
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: hoverSpring.shadow.to(
                (s) => `0 ${s}px ${s * 2}px rgba(0,0,0,0.3)`
              ),
            }}
          >
            {children}
          </animated.div>

          {/* Back */}
          <animated.div
            className={cn(
              'absolute inset-0 overflow-hidden rounded-2xl',
              'border border-zinc-600 bg-zinc-800 p-4 text-zinc-100',
              backClassName
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: rotate === 'x' ? 'rotateX(180deg)' : 'rotateY(180deg)',
              boxShadow: hoverSpring.shadow.to(
                (s) => `0 ${s}px ${s * 2}px rgba(0,0,0,0.3)`
              ),
            }}
          >
            {backContent}
          </animated.div>
        </animated.div>
      </animated.div>
    );
  }
);

FlipCard.displayName = 'FlipCard';
