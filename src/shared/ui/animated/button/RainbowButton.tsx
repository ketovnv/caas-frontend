import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { cn } from 'shared/lib';

// Types

export interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Animation speed in seconds */
  speed?: number;
  /** Press depth in pixels (Z-axis) */
  pressDepth?: number;
}

// Component

export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  (
    {
      children,
      className,
      speed = 2,
      pressDepth = 12,
      style,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);

    // Rainbow gradient animation
    const { bgPos } = useSpring({
      from: { bgPos: 0 },
      to: { bgPos: 200 },
      config: { duration: speed * 1000 },
      loop: true,
    });

    // Press animation - Z-axis depth
    const pressSpring = useSpring({
      z: isPressed ? -pressDepth : 0,
      scale: isPressed ? 0.97 : 1,
      config: { tension: 400, friction: 25 },
    });

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onMouseUp?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onMouseLeave?.(e);
    };

    const rainbowGradient = 'linear-gradient(90deg, hsl(0 100% 63%), hsl(90 100% 63%), hsl(210 100% 63%), hsl(195 100% 63%), hsl(270 100% 63%))';

    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex cursor-pointer items-center justify-center',
          'rounded-xl p-[3px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        style={{
          perspective: '500px',
          ...style,
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Rainbow border layer - stays in place */}
        <animated.span
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundImage: rainbowGradient,
            backgroundSize: '200% 100%',
            backgroundPosition: bgPos.to(p => `${p}% 0%`),
          }}
        />

        {/* Rainbow glow effect below */}
        <animated.span
          className="pointer-events-none absolute -bottom-2 left-1/2 z-0 h-1/3 w-4/5 -translate-x-1/2"
          style={{
            backgroundImage: rainbowGradient,
            backgroundSize: '200% 100%',
            filter: 'blur(14px)',
            opacity: 0.6,
            backgroundPosition: bgPos.to(p => `${p}% 0%`),
          }}
        />

        {/* Inner button - sinks into Z on press */}
        <animated.span
          className={cn(
            'relative z-10 flex h-11 items-center justify-center',
            'rounded-[9px] px-8 py-2 font-medium',
            'bg-[#121213] text-white',
            'w-full'
          )}
          style={{
            transform: pressSpring.z.to(
              z => `translateZ(${z}px) scale(${isPressed ? 0.99 : 1})`
            ),
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </animated.span>
      </button>
    );
  }
);

RainbowButton.displayName = 'RainbowButton';
