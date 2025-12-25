import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useSprings, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Ripple color */
  rippleColor?: string;
  /** Max ripple duration ms */
  rippleDuration?: number;
  /** Max concurrent ripples */
  maxRipples?: number;
  /** Variant style */
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
}

// ============================================================================
// Component - Imperative useSprings for multiple ripples
// ============================================================================

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      children,
      className,
      rippleColor = 'rgba(255, 255, 255, 0.4)',
      rippleDuration = 600,
      maxRipples = 5,
      variant = 'default',
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const rippleIdRef = useRef(0);

    // 🎯 Imperative springs array for all ripples
    const [springs, api] = useSprings(
      maxRipples,
      () => ({
        scale: 0,
        opacity: 0,
        config: { ...config.gentle, duration: rippleDuration },
      }),
      [maxRipples, rippleDuration]
    );

    const createRipple = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = rippleIdRef.current++;
        const rippleIndex = id % maxRipples;

        // Add ripple to state
        setRipples((prev) => {
          const next = [...prev, { id, x, y }];
          // Keep only maxRipples
          return next.slice(-maxRipples);
        });

        // 🚀 Imperatively trigger ripple animation
        api.start((index) => {
          if (index !== rippleIndex) return;
          
          return {
            from: { scale: 0, opacity: 1 },
            to: async (next) => {
              await next({ scale: 4, opacity: 0 });
            },
            onRest: () => {
              setRipples((prev) => prev.filter((r) => r.id !== id));
            },
          };
        });

        onClick?.(e);
      },
      [maxRipples, api, onClick]
    );

    const variantStyles = {
      default: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25',
      outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10',
      ghost: 'text-blue-500 hover:bg-blue-500/10',
      gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg',
    };

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'relative inline-flex items-center justify-center',
          'px-6 py-3 rounded-xl font-medium overflow-hidden',
          'transition-all duration-200',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          className
        )}
        onClick={createRipple}
        {...props}
      >
        {/* Ripple container */}
        <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          {ripples.map((ripple) => {
            const springIndex = ripple.id % maxRipples;
            const spring = springs[springIndex];
            if (!spring) return null;

            return (
              <animated.span
                key={ripple.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: 100,
                  height: 100,
                  marginLeft: -50,
                  marginTop: -50,
                  background: rippleColor,
                  transform: spring.scale.to((s) => `scale(${s})`),
                  opacity: spring.opacity,
                }}
              />
            );
          })}
        </span>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

RippleButton.displayName = 'RippleButton';
