import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface RainbowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Animation speed in seconds */
  speed?: number;
}

// ============================================================================
// Component
// ============================================================================

export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  (
    {
      children,
      className,
      speed = 2,
      style,
      ...props
    },
    ref
  ) => {
    // Animate background position from 0% to 200%
    const { bgPos } = useSpring({
      from: { bgPos: 0 },
      to: { bgPos: 200 },
      config: { duration: speed * 1000 },
      loop: true,
    });

    return (
      <animated.button
        ref={ref}
        className={cn(
          // Base styles
          'group relative inline-flex h-11 cursor-pointer items-center justify-center',
          'rounded-xl px-8 py-2 font-medium',
          'transition-transform duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          // Rainbow button specific
          'border-0 text-white',
          '[background-clip:padding-box,border-box,border-box]',
          '[background-origin:border-box]',
          className
        )}
        style={{
          // CSS variables for rainbow colors
          '--color-1': 'hsl(0 100% 63%)',
          '--color-2': 'hsl(270 100% 63%)',
          '--color-3': 'hsl(210 100% 63%)',
          '--color-4': 'hsl(195 100% 63%)',
          '--color-5': 'hsl(90 100% 63%)',
          // Multi-layer background
          backgroundImage: `
            linear-gradient(#121213, #121213),
            linear-gradient(#121213 50%, rgba(18,18,19,0.6) 80%, rgba(18,18,19,0)),
            linear-gradient(90deg, var(--color-1), var(--color-5), var(--color-3), var(--color-4), var(--color-2))
          `,
          backgroundSize: '200% 100%',
          border: 'calc(0.08 * 1rem) solid transparent',
          backgroundPosition: bgPos.to(p => `${p}% 0%`),
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {/* Glow effect */}
        <animated.span
          className="pointer-events-none absolute bottom-[-20%] left-1/2 z-0 h-1/5 w-3/5 -translate-x-1/2"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--color-1), var(--color-5), var(--color-3), var(--color-4), var(--color-2))',
            backgroundSize: '200% 100%',
            filter: 'blur(calc(0.8 * 1rem))',
            backgroundPosition: bgPos.to(p => `${p}% 0%`),
          }}
        />

        {/* Content */}
        <span className="relative z-10">{children}</span>
      </animated.button>
    );
  }
);

RainbowButton.displayName = 'RainbowButton';
