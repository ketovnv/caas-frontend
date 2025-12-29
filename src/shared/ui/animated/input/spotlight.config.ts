import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Configs
// ============================================================================

/** Spotlight пружина - упругая для эффекта свечения */
export const spotlightSpring: SpringConfig = {
  tension: 280,
  friction: 25,
};

/** Pulse пружина - мягкая для эффекта пульсации */
export const pulseSpring: SpringConfig = {
  tension: 170,
  friction: 26,
  mass: 1,
};

// ============================================================================
// Spotlight State
// ============================================================================

export interface SpotlightState {
  radius: number;
  opacity: number;
  pulseScale: number;
  borderOpacity: number;
  shadowSpread: number;
}

export const SPOTLIGHT_IDLE: SpotlightState = {
  radius: 0,
  opacity: 0,
  pulseScale: 1,
  borderOpacity: 0.3,
  shadowSpread: 0,
};

export const SPOTLIGHT_HOVERED: Partial<SpotlightState> = {
  opacity: 1,
};

export const SPOTLIGHT_FOCUSED: Partial<SpotlightState> = {
  borderOpacity: 1,
  shadowSpread: 8,
};

export const SPOTLIGHT_BLURRED: Partial<SpotlightState> = {
  borderOpacity: 0.3,
  shadowSpread: 0,
};

export const SPOTLIGHT_UNHOVERED: Partial<SpotlightState> = {
  radius: 0,
  opacity: 0,
};

// ============================================================================
// Pulse Animation States
// ============================================================================

export const PULSE_UP: Partial<SpotlightState> = {
  pulseScale: 1.02,
};

export const PULSE_DOWN: Partial<SpotlightState> = {
  pulseScale: 0.98,
};

export const PULSE_RESET: Partial<SpotlightState> = {
  pulseScale: 1,
};

// ============================================================================
// Animation Settings
// ============================================================================

/** Радиус spotlight по умолчанию (px) */
export const DEFAULT_SPOTLIGHT_RADIUS = 120;

/** Цвет spotlight по умолчанию */
export const DEFAULT_SPOTLIGHT_COLOR = 'rgba(59, 130, 246, 0.5)';

/** Цвет тени при фокусе */
export const FOCUS_SHADOW_COLOR = 'rgba(59, 130, 246, 0.3)';

/** Начальная позиция мыши (%) */
export const DEFAULT_MOUSE_POSITION = 50;
