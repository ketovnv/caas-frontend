import type { SpringConfig } from '@react-spring/web';
import { RAINBOWGRADIENT, type OklchTuple } from '@/shared';

// ============================================================================
// Spring Configs
// ============================================================================

/** Default spring for character animations */
export const charSpring: SpringConfig = {
  tension: 170,
  friction: 26,
};

/** Snappy spring for faster animations */
export const snappyCharSpring: SpringConfig = {
  tension: 280,
  friction: 24,
};

// ============================================================================
// Character Animation States
// ============================================================================

export interface CharState {
  opacity: number;
  y: number;
  scale: number;
  blur: number;
}

/** Hidden state (initial) */
export const CHAR_HIDDEN: CharState = {
  opacity: 0,
  y: 8,
  scale: 0.95,
  blur: 8,
};

/** Visible state (animated in) */
export const CHAR_VISIBLE: CharState = {
  opacity: 1,
  y: 0,
  scale: 1,
  blur: 0,
};

// ============================================================================
// Default Colors
// ============================================================================

/** Default gradient colors (rainbow) */
export const DEFAULT_COLORS: OklchTuple[] = RAINBOWGRADIENT as unknown as OklchTuple[];

// ============================================================================
// Timing Settings
// ============================================================================

/** Default animation duration in ms */
export const DEFAULT_DURATION = 400;

/** Default stagger delay between characters in ms */
export const DEFAULT_STAGGER_DELAY = 30;

/** Default gradient flow speed in seconds */
export const DEFAULT_GRADIENT_SPEED = 5;

/** Default gradient angle in degrees */
export const DEFAULT_GRADIENT_ANGLE = 75;

// ============================================================================
// Gradient Flow Keyframes (injected once)
// ============================================================================

export const GRADIENT_FLOW_KEYFRAMES = `
@keyframes gradientFlow {
  0% { background-position: var(--start-pos) 0%; }
  100% { background-position: var(--end-pos) 0%; }
}
`;

let styleInjected = false;

export function injectGradientFlowStyle(): void {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = GRADIENT_FLOW_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}
