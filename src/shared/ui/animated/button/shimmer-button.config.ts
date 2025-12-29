import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Configs
// ============================================================================

/** Shimmer animation spring - slow, smooth movement */
export const shimmerSpring: SpringConfig = {
  tension: 100,
  friction: 50,
};

/** Press spring - snappy feedback */
export const pressSpring: SpringConfig = {
  tension: 300,
  friction: 20,
};

/** Press down spring - quicker response */
export const pressDownSpring: SpringConfig = {
  tension: 600,
  friction: 25,
};

/** Release spring - smooth return */
export const releaseSpring: SpringConfig = {
  tension: 400,
  friction: 20,
};

// ============================================================================
// Animation State Types
// ============================================================================

export interface ShimmerAnimState {
  slide: number;
  spin: number;
}

export interface PressAnimState {
  y: number;
  scale: number;
  innerShadowY: number;
  innerShadowBlur: number;
  innerShadowOpacity: number;
}

// ============================================================================
// Animation States
// ============================================================================

export const SHIMMER_START: ShimmerAnimState = {
  slide: 0,
  spin: 0,
};

export const SHIMMER_SLIDE_END: Partial<ShimmerAnimState> = {
  slide: 1,
};

export const SHIMMER_SPIN_END: Partial<ShimmerAnimState> = {
  spin: 1,
};

export const PRESS_IDLE: PressAnimState = {
  y: 0,
  scale: 1,
  innerShadowY: 8,
  innerShadowBlur: 10,
  innerShadowOpacity: 0.12,
};

export const PRESS_HOVERED: Partial<PressAnimState> = {
  innerShadowY: 6,
  innerShadowOpacity: 0.24,
};

export const PRESS_DOWN: Partial<PressAnimState> = {
  y: 1,
  scale: 0.98,
  innerShadowY: 10,
  innerShadowOpacity: 0.24,
};

export const PRESS_UP: Partial<PressAnimState> = {
  y: 0,
  scale: 1,
};

// ============================================================================
// Default Values
// ============================================================================

/** Default shimmer color */
export const DEFAULT_SHIMMER_COLOR = '#ffffff';

/** Default shimmer spread angle (degrees) */
export const DEFAULT_SHIMMER_SPREAD = 90;

/** Default shimmer border size */
export const DEFAULT_SHIMMER_SIZE = '0.1em';

/** Default border radius */
export const DEFAULT_BORDER_RADIUS = '100px';

/** Default animation duration (seconds) */
export const DEFAULT_SHIMMER_DURATION = 5;

/** Default background */
export const DEFAULT_BACKGROUND = 'rgba(0, 0, 0, 1)';

/** Default blur for shimmer glow */
export const DEFAULT_SHIMMER_BLUR = 8;

// ============================================================================
// Rotation Keyframes
// ============================================================================

/**
 * Convert linear progress (0-1) to stepped rotation matching CSS keyframes:
 * 0% -> 0deg, 15% -> 90deg, 35% -> 90deg (hold),
 * 65% -> 270deg, 85% -> 270deg (hold), 100% -> 360deg
 */
export function getSteppedRotation(progress: number): number {
  if (progress < 0.15) {
    // 0% to 15%: 0deg → 90deg
    return (progress / 0.15) * 90;
  } else if (progress < 0.35) {
    // 15% to 35%: hold at 90deg
    return 90;
  } else if (progress < 0.65) {
    // 35% to 65%: 90deg → 270deg
    return 90 + ((progress - 0.35) / 0.30) * 180;
  } else if (progress < 0.85) {
    // 65% to 85%: hold at 270deg
    return 270;
  } else {
    // 85% to 100%: 270deg → 360deg
    return 270 + ((progress - 0.85) / 0.15) * 90;
  }
}

/**
 * Create shimmer conic gradient string
 */
export function createShimmerGradient(color: string, spread: number): string {
  const halfSpread = spread * 0.5;
  return `conic-gradient(from ${270 - halfSpread}deg, transparent 0deg, ${color} ${spread}deg, transparent ${spread}deg)`;
}

/**
 * Create highlight conic gradient string (tighter)
 */
export function createHighlightGradient(color: string, spread: number): string {
  const halfSpread = spread * 0.5;
  const tightSpread = spread * 0.5;
  return `conic-gradient(from ${270 - halfSpread * 0.5}deg, transparent 0deg, ${color} ${tightSpread}deg, transparent ${tightSpread}deg)`;
}
