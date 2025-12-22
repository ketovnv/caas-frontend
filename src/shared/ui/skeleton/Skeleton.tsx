import { useRef, useEffect, forwardRef, useImperativeHandle, type HTMLAttributes } from 'react';
import { useSpringValue, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Enable shimmer animation */
  shimmer?: boolean;
  /** Shimmer speed (ms for one cycle) */
  shimmerSpeed?: number;
  /** Variant */
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  /** Pulse animation instead of shimmer */
  pulse?: boolean;
}

export interface SkeletonRef {
  /** Start animation */
  start: () => void;
  /** Stop animation */
  stop: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
}

// ============================================================================
// Component - Imperative shimmer animation
// ============================================================================

export const Skeleton = forwardRef<SkeletonRef, SkeletonProps>(
  (
    {
      width,
      height,
      radius = 'md',
      shimmer = true,
      shimmerSpeed = 1500,
      variant = 'default',
      pulse = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const isAnimating = useRef(true);

    // 🎯 Imperative shimmer position
    const shimmerX = useSpringValue(-100, {
      config: { duration: shimmerSpeed, easing: (t) => t },
    });

    // 🎯 Imperative pulse opacity
    const pulseOpacity = useSpringValue(1, { config: config.slow });

    // 🔄 Shimmer loop
    useEffect(() => {
      if (!shimmer || pulse) return;

      let active = true;

      const animate = async () => {
        while (active && isAnimating.current) {
          shimmerX.set(-100);
          await shimmerX.start(200);
        }
      };

      animate();

      return () => {
        active = false;
      };
    }, [shimmer, pulse, shimmerX]);

    // 🔄 Pulse loop
    useEffect(() => {
      if (!pulse) return;

      let active = true;

      const animate = async () => {
        while (active && isAnimating.current) {
          await pulseOpacity.start(0.5);
          await pulseOpacity.start(1);
        }
      };

      animate();

      return () => {
        active = false;
      };
    }, [pulse, pulseOpacity]);

    // 🎭 Expose imperative methods
    useImperativeHandle(ref, () => ({
      start: () => {
        isAnimating.current = true;
      },
      stop: () => {
        isAnimating.current = false;
      },
      setLoading: (loading: boolean) => {
        isAnimating.current = loading;
      },
    }));

    // Radius classes
    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    // Variant styles
    const variantStyles = {
      default: {},
      text: { height: height || '1em', width: width || '100%' },
      circular: {
        width: width || 40,
        height: height || 40,
        borderRadius: '50%',
      },
      rectangular: { width: width || '100%', height: height || 100 },
    };

    const finalStyle = {
      width,
      height,
      ...variantStyles[variant],
      ...style,
    };

    return (
      <animated.div
        className={cn(
          'relative overflow-hidden bg-zinc-800',
          radiusClasses[radius],
          variant === 'circular' && 'rounded-full',
          className
        )}
        style={{
          ...finalStyle,
          opacity: pulse ? pulseOpacity : 1,
        }}
        {...props}
      >
        {/* Shimmer overlay */}
        {shimmer && !pulse && (
          <animated.div
            className="absolute inset-0 -translate-x-full"
            style={{
              transform: shimmerX.to((x) => `translateX(${x}%)`),
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />
        )}
      </animated.div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// ============================================================================
// Compound Skeleton Components
// ============================================================================

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: { lines?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
          {...props}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4 rounded-xl bg-zinc-900', className)}>
      <Skeleton variant="rectangular" height={200} radius="lg" {...props} />
      <SkeletonText lines={2} {...props} />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} radius="full" {...props} />
        <Skeleton width={80} height={32} radius="full" {...props} />
      </div>
    </div>
  );
}

export function SkeletonAvatar({
  size = 40,
  ...props
}: { size?: number } & SkeletonProps) {
  return <Skeleton variant="circular" width={size} height={size} {...props} />;
}
