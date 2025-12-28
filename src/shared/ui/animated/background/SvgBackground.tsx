import { type ReactNode, memo } from 'react';
import { cn } from 'shared/lib';

// ============================================================================
// Texture Presets — Static SVG Data URIs (generated once, cached forever)
// ============================================================================

const TEXTURES = {
    // Асфальт — мелкозернистый шум с линиями
    asphalt: {
        noise: `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E`,
        grain: `data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E`,
        noiseSize: 200,
        grainSize: 100,
        noiseOpacity: 1,
        grainOpacity: 0.4,
    },

    // Бетон — крупнее зерно, более грубая текстура
    concrete: {
        noise: `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E`,
        grain: `data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.06'/%3E%3C/svg%3E`,
        noiseSize: 256,
        grainSize: 150,
        noiseOpacity: 1,
        grainOpacity: 0.5,
    },

    // Металл — тонкие горизонтальные линии + лёгкий шум
    metal: {
        noise: `data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E`,
        grain: `data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.03'/%3E%3C/svg%3E`,
        noiseSize: 100,
        grainSize: 60,
        noiseOpacity: 1,
        grainOpacity: 0.3,
    },

    // Гранит — крупные пятна + мелкое зерно
    granite: {
        noise: `data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.3' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E`,
        grain: `data:image/svg+xml,%3Csvg viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E`,
        noiseSize: 300,
        grainSize: 80,
        noiseOpacity: 1,
        grainOpacity: 0.45,
    },

    // Песок — очень мелкий, тёплый шум
    sand: {
        noise: `data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E`,
        grain: `data:image/svg+xml,%3Csvg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='1.5' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E`,
        noiseSize: 150,
        grainSize: 50,
        noiseOpacity: 0.8,
        grainOpacity: 0.35,
    },

    // Ткань — диагональное плетение
    fabric: {
        noise: `data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6 0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E`,
        grain: `data:image/svg+xml,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='4' height='4' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 0L4 4M4 0L0 4' stroke='%23000' stroke-width='0.3' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23p)'/%3E%3C/svg%3E`,
        noiseSize: 120,
        grainSize: 40,
        noiseOpacity: 1,
        grainOpacity: 0.6,
    },
} as const;

// ============================================================================
// Color Schemes
// ============================================================================

const COLOR_SCHEMES = {
    // Dark schemes
    dark: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
    charcoal: 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950',
    midnight: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
    obsidian: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950',

    // Light schemes
    light: 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200',
    cloud: 'bg-gradient-to-br from-gray-100 via-white to-gray-100',
    pearl: 'bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200',

    // Colored schemes
    steel: 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700',
    copper: 'bg-gradient-to-br from-orange-950 via-orange-900 to-orange-950',
    bronze: 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950',
    ocean: 'bg-gradient-to-br from-cyan-950 via-cyan-900 to-cyan-950',
    forest: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950',
    wine: 'bg-gradient-to-br from-rose-950 via-rose-900 to-rose-950',
} as const;

// ============================================================================
// Types
// ============================================================================

export type TextureType = keyof typeof TEXTURES;
export type ColorScheme = keyof typeof COLOR_SCHEMES;

export interface TexturedBackgroundProps {
    children?: ReactNode;
    className?: string;
    /** Texture type */
    texture?: TextureType;
    /** Color scheme */
    scheme?: ColorScheme;
    /** Custom gradient (overrides scheme) */
    gradient?: string;
    /** Enable vignette effect */
    vignette?: boolean;
    /** Vignette intensity 0-1 */
    vignetteIntensity?: number;
    /** Enable subtle inner shadow */
    innerShadow?: boolean;
    /** Fixed to viewport (for app-level backgrounds) vs contained (for cards) */
    fixed?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const TexturedBackground = memo(function TexturedBackground({
                                                                       children,
                                                                       className,
                                                                       texture = 'asphalt',
                                                                       scheme = 'dark',
                                                                       gradient,
                                                                       vignette = false,
                                                                       vignetteIntensity = 0.25,
                                                                       innerShadow = false,
                                                                       fixed = false,
                                                                   }: TexturedBackgroundProps) {
    const tex = TEXTURES[texture];
    const isDark = ['dark', 'charcoal', 'midnight', 'obsidian', 'steel', 'copper', 'bronze', 'ocean', 'forest', 'wine'].includes(scheme);

    // Position class: fixed for app backgrounds, absolute for cards
    const posClass = fixed ? 'fixed inset-0' : 'absolute inset-0';
    const containerClass = fixed ? 'relative min-h-screen w-full' : 'relative overflow-hidden';

    return (
        <div className={cn(containerClass, className)}>
            {/* Base gradient */}
            <div className={cn(posClass, gradient ?? COLOR_SCHEMES[scheme])} />

            {/* Primary noise texture */}
            <div
                className={cn(posClass, 'mix-blend-multiply pointer-events-none')}
                style={{
                    backgroundImage: `url("${tex.noise}")`,
                    backgroundSize: `${tex.noiseSize}px ${tex.noiseSize}px`,
                    opacity: tex.noiseOpacity,
                }}
            />

            {/* Secondary grain layer */}
            <div
                className={cn(posClass, 'pointer-events-none', isDark ? 'mix-blend-overlay' : 'mix-blend-multiply')}
                style={{
                    backgroundImage: `url("${tex.grain}")`,
                    backgroundSize: `${tex.grainSize}px ${tex.grainSize}px`,
                    opacity: tex.grainOpacity,
                }}
            />

            {/* Vignette */}
            {vignette && (
                <div
                    className={cn(posClass, 'pointer-events-none')}
                    style={{
                        background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
                    }}
                />
            )}

            {/* Inner shadow (optional depth effect) */}
            {innerShadow && (
                <div
                    className={cn(posClass, 'pointer-events-none')}
                    style={{
                        boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.3), inset 0 -2px 20px rgba(0,0,0,0.2)',
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
});

// ============================================================================
// Convenience Presets
// ============================================================================

type PresetProps = Omit<TexturedBackgroundProps, 'texture'>;

/** Тёмный асфальт — как в оригинале */
export const SvgAsphaltBackground = memo(function AsphaltBackground({
                                                                     children,
                                                                     className,
                                                                     scheme,
                                                                     gradient,
                                                                     vignette,
                                                                     vignetteIntensity,
                                                                     innerShadow,
                                                                     fixed,
                                                                 }: PresetProps) {
    return (
        <TexturedBackground
            texture="asphalt"
            className={className}
            scheme={scheme}
            gradient={gradient}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            fixed={fixed}
        >
            {children}
        </TexturedBackground>
    );
});

/** Бетонная стена */
export const ConcreteBackground = memo(function ConcreteBackground({
                                                                       children,
                                                                       className,
                                                                       scheme,
                                                                       gradient,
                                                                       vignette,
                                                                       vignetteIntensity,
                                                                       innerShadow,
                                                                       fixed,
                                                                   }: PresetProps) {
    return (
        <TexturedBackground
            texture="concrete"
            className={className}
            scheme={scheme}
            gradient={gradient}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            fixed={fixed}
        >
            {children}
        </TexturedBackground>
    );
});

/** Матовый металл */
export const MetalBackground = memo(function MetalBackground({
                                                                 children,
                                                                 className,
                                                                 scheme = 'steel',
                                                                 gradient,
                                                                 vignette,
                                                                 vignetteIntensity,
                                                                 innerShadow,
                                                                 fixed,
                                                             }: PresetProps) {
    return (
        <TexturedBackground
            texture="metal"
            className={className}
            scheme={scheme}
            gradient={gradient}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            fixed={fixed}
        >
            {children}
        </TexturedBackground>
    );
});

/** Полированный гранит */
export const GraniteBackground = memo(function GraniteBackground({
                                                                     children,
                                                                     className,
                                                                     scheme,
                                                                     gradient,
                                                                     vignette,
                                                                     vignetteIntensity,
                                                                     innerShadow,
                                                                     fixed,
                                                                 }: PresetProps) {
    return (
        <TexturedBackground
            texture="granite"
            className={className}
            scheme={scheme}
            gradient={gradient}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            fixed={fixed}
        >
            {children}
        </TexturedBackground>
    );
});

/** Пляжный песок */
export const SandBackground = memo(function SandBackground({
                                                               children,
                                                               className,
                                                               scheme = 'bronze',
                                                               gradient,
                                                               vignette,
                                                               vignetteIntensity,
                                                               innerShadow,
                                                               fixed,
                                                           }: PresetProps) {
    return (
        <TexturedBackground
            texture="sand"
            className={className}
            scheme={scheme}
            gradient={gradient}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            fixed={fixed}
        >
            {children}
        </TexturedBackground>
    );
});

/** Тканевая текстура */
export const FabricBackground = memo(function FabricBackground({
                                                                   children,
                                                                   className,
                                                                   scheme,
                                                                   gradient,
                                                                   vignette,
                                                                   vignetteIntensity,
                                                                   innerShadow,
                                                                   fixed,
                                                               }: PresetProps) {
    return (
        <TexturedBackground
            texture="fabric"
            className={className}
            scheme={scheme}
            gradient={gradient}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            fixed={fixed}
        >
            {children}
        </TexturedBackground>
    );
});

// ============================================================================
// CSS-only Alternative (zero SVG, maximum performance)
// ============================================================================

export interface PureNoiseBackgroundProps {
    children?: ReactNode;
    className?: string;
    scheme?: ColorScheme;
    intensity?: 'subtle' | 'medium' | 'strong';
    /** Fixed to viewport (for app-level backgrounds) vs contained (for cards) */
    fixed?: boolean;
}

/**
 * Ultra-lightweight noise using only CSS gradients.
 * No SVG filters, pure GPU acceleration.
 * Less realistic but ~0ms paint time.
 */
export const PureNoiseBackground = memo(function PureNoiseBackground({
                                                                         children,
                                                                         className,
                                                                         scheme = 'dark',
                                                                         intensity = 'medium',
                                                                         fixed = false,
                                                                     }: PureNoiseBackgroundProps) {
    const opacityMap = { subtle: 0.15, medium: 0.25, strong: 0.4 };
    const posClass = fixed ? 'fixed inset-0' : 'absolute inset-0';
    const containerClass = fixed ? 'relative min-h-screen w-full' : 'relative overflow-hidden';

    return (
        <div className={cn(containerClass, className)}>
            {/* Base */}
            <div className={cn(posClass, COLOR_SCHEMES[scheme])} />

            {/* Pseudo-noise via repeating gradients */}
            <div
                className={cn(posClass, 'pointer-events-none')}
                style={{
                    opacity: opacityMap[intensity],
                    backgroundImage: `
            repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0,0,0,0.03) 0.5deg, transparent 1deg),
            repeating-linear-gradient(0deg, transparent, rgba(0,0,0,0.02) 1px, transparent 2px),
            repeating-linear-gradient(90deg, transparent, rgba(255,255,255,0.01) 1px, transparent 2px)
          `,
                    backgroundSize: '4px 4px, 3px 3px, 5px 5px',
                }}
            />

            {/* Vignette */}
            <div className={cn(posClass, 'bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)] pointer-events-none')} />

            <div className="relative z-10">{children}</div>
        </div>
    );
});
