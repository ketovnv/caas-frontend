import { forwardRef } from 'react';
import { animated, type SpringValue } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Panel - Reusable card/panel component for desktop layouts
// ============================================================================

export interface PanelProps {
    children: React.ReactNode;
    className?: string;
    /** Optional title */
    title?: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Panel style variant */
    variant?: 'default' | 'glass' | 'solid';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Animation style for useTrail */
    style?: {
        opacity?: SpringValue<number>;
        y?: SpringValue<number>;
        scale?: SpringValue<number>;
    };
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
};

const variantClasses = {
    default: 'bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50',
    glass: 'bg-zinc-900/40 backdrop-blur-md border border-zinc-700/30',
    solid: 'bg-zinc-900 border border-zinc-800',
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
    {
        children,
        className,
        title,
        subtitle,
        variant = 'default',
        padding = 'md',
        style,
    },
    ref
) {
    const hasHeader = title || subtitle;

    // Build animated style
    const animatedStyle = style ? {
        opacity: style.opacity,
        transform: style.y?.to(y => `translateY(${y}px)`),
    } : undefined;

    const content = (
        <>
            {hasHeader && (
                <div className={cn('mb-4', padding === 'none' && 'px-4 pt-4')}>
                    {title && (
                        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
                    )}
                    {subtitle && (
                        <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
                    )}
                </div>
            )}
            {children}
        </>
    );

    const baseClasses = cn(
        'rounded-2xl',
        variantClasses[variant],
        paddingClasses[padding],
        className
    );

    if (style) {
        return (
            <animated.div ref={ref} style={animatedStyle} className={baseClasses}>
                {content}
            </animated.div>
        );
    }

    return (
        <div ref={ref} className={baseClasses}>
            {content}
        </div>
    );
});

export default Panel;
