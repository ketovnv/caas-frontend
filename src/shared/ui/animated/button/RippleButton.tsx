import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTransition, animated } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}

export interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Ripple color */
  rippleColor?: string;
  /** Ripple animation duration in ms */
  duration?: number;
  /** Variant style */
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
}

// ============================================================================
// Component
// ============================================================================

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      children,
      className,
      rippleColor = '#ADD8E6',
      duration = 600,
      variant = 'default',
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<Ripple[]>([]);

    // Animate ripples with useTransition
    const transitions = useTransition(ripples, {
      keys: (item) => item.key,
      from: { scale: 0, opacity: 0.35 },
      enter: { scale: 2, opacity: 0 },
      config: { duration },
      onRest: (_result, _ctrl, item) => {
        if (item) {
          setRipples((prev) => prev.filter((r) => r.key !== item.key));
        }
      },
    });

    const createRipple = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple: Ripple = {
          key: Date.now(),
          x,
          y,
          size,
        };

        setRipples((prev) => [...prev, newRipple]);
        onClick?.(e);
      },
      [onClick]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => setRipples([]);
    }, []);

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
          'relative flex cursor-pointer items-center justify-center overflow-hidden',
          'px-6 py-3 rounded-xl font-medium',
          'transition-all duration-200',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          className
        )}
        onClick={createRipple}
        {...props}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Ripple container */}
        <span className="pointer-events-none absolute inset-0">
          {transitions((style, item) => (
            <animated.span
              key={item.key}
              className="absolute rounded-full"
              style={{
                width: item.size,
                height: item.size,
                top: item.y,
                left: item.x,
                backgroundColor: rippleColor,
                transform: style.scale.to((s) => `scale(${s})`),
                opacity: style.opacity,
              }}
            />
          ))}
        </span>
      </button>
    );
  }
);

RippleButton.displayName = 'RippleButton';
