import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Icon on left side */
  leftIcon?: ReactNode;
  /** Icon on right side */
  rightIcon?: ReactNode;
  /** Enable floating label */
  floating?: boolean;
  /** Enable glow effect on focus */
  glow?: boolean;
  /** Enable magnetic cursor follow */
  magnetic?: boolean;
  /** Enable shimmer effect */
  shimmer?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      floating = false,
      glow = false,
      magnetic = false,
      shimmer = false,
      disabled,
      value,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Focus animation
    const focusSpring = useSpring({
      scale: isFocused ? 1.02 : 1,
      borderOpacity: isFocused ? 1 : 0.3,
      config: config.gentle,
    });

    // Glow animation
    const glowSpring = useSpring({
      opacity: glow && (isFocused || isHovered) ? 0.6 : 0,
      config: config.slow,
    });

    // Magnetic effect
    const magneticSpring = useSpring({
      x: magnetic && isHovered ? (mousePos.x - 50) * 0.1 : 0,
      y: magnetic && isHovered ? (mousePos.y - 25) * 0.1 : 0,
      config: config.wobbly,
    });

    // Shimmer animation
    const shimmerSpring = useSpring({
      x: shimmer ? 200 : -100,
      loop: shimmer,
      config: { duration: 2000 },
    });

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!magnetic) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    const hasValue = value && String(value).length > 0;

    return (
      <div className="relative">
        {/* Static label */}
        {label && !floating && (
          <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
        )}

        {/* Input container */}
        <animated.div
          style={{
            transform: focusSpring.scale.to((s) => `scale(${s})`),
            x: magneticSpring.x,
            y: magneticSpring.y,
          }}
          className={cn('relative', className)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Glow effect */}
          {glow && (
            <animated.div
              style={{ opacity: glowSpring.opacity }}
              className="absolute inset-0 rounded-lg -z-10 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 blur-lg"
            />
          )}

          {/* Main container */}
          <animated.div
            style={{
              borderColor: focusSpring.borderOpacity.to(
                (o) => `rgba(59, 130, 246, ${o * 0.8})`
              ),
            }}
            className={cn(
              'relative flex items-center w-full rounded-lg border p-3',
              'bg-zinc-900/80 backdrop-blur-sm',
              'transition-colors duration-300'
            )}
          >
            {/* Shimmer effect */}
            {shimmer && (
              <animated.div
                style={{ transform: shimmerSpring.x.to((x) => `translateX(${x}%)`) }}
                className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/3 h-full" />
              </animated.div>
            )}

            {/* Left icon */}
            {leftIcon && <div className="mr-3 text-zinc-400">{leftIcon}</div>}

            {/* Floating label */}
            {floating && label && (
              <animated.label
                style={{
                  transform: isFocused || hasValue
                    ? 'translateY(-24px) scale(0.85)'
                    : 'translateY(0) scale(1)',
                  color: isFocused ? '#3b82f6' : '#9ca3af',
                }}
                className="absolute left-3 transition-all duration-200 pointer-events-none origin-left bg-zinc-900 px-1"
              >
                {label}
              </animated.label>
            )}

            {/* Input */}
            <input
              ref={ref}
              type={type}
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                'bg-transparent flex-1 text-zinc-100 placeholder:text-zinc-500',
                'focus:outline-none',
                floating && 'pt-2',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              {...props}
            />

            {/* Right icon */}
            {rightIcon && <div className="ml-3 text-zinc-400">{rightIcon}</div>}
          </animated.div>
        </animated.div>

        {/* Error/Success message */}
        {(error || success) && (
          <p className={cn('mt-1.5 text-sm', error ? 'text-red-400' : 'text-green-400')}>
            {error || success}
          </p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';
