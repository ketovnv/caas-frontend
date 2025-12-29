import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Configs
// ============================================================================

/** Мягкая пружина - для плавных переходов */
export const gentleSpring: SpringConfig = {
  tension: 170,
  friction: 26,
};

/** Spotlight пружина - упругая для эффекта свечения */
export const spotlightSpring: SpringConfig = {
  tension: 280,
  friction: 25,
};

// ============================================================================
// Animated Input State
// ============================================================================

export interface AnimatedInputState {
  // Placeholder
  placeholderOpacity: number;
  placeholderY: number;
  // Arrow indicator
  arrowDashoffset: number;
  // Canvas (particles)
  canvasOpacity: number;
  // Spotlight
  spotlightRadius: number;
  spotlightOpacity: number;
  // Focus glow
  borderOpacity: number;
  shadowSpread: number;
}

export const INPUT_IDLE: AnimatedInputState = {
  placeholderOpacity: 1,
  placeholderY: 0,
  arrowDashoffset: 50,
  canvasOpacity: 0,
  spotlightRadius: 0,
  spotlightOpacity: 0,
  borderOpacity: 0.3,
  shadowSpread: 0,
};

export const INPUT_TYPING: Partial<AnimatedInputState> = {
  placeholderOpacity: 0,
  placeholderY: -16,
  arrowDashoffset: 0,
};

export const INPUT_HOVERED: Partial<AnimatedInputState> = {
  spotlightOpacity: 1,
};

export const INPUT_UNHOVERED: Partial<AnimatedInputState> = {
  spotlightRadius: 0,
  spotlightOpacity: 0,
};

export const INPUT_FOCUSED: Partial<AnimatedInputState> = {
  borderOpacity: 1,
  shadowSpread: 8,
};

export const INPUT_BLURRED: Partial<AnimatedInputState> = {
  borderOpacity: 0.3,
  shadowSpread: 0,
};

export const INPUT_VANISHING: Partial<AnimatedInputState> = {
  canvasOpacity: 1,
};

export const INPUT_AFTER_VANISH: Partial<AnimatedInputState> = {
  canvasOpacity: 0,
};

// ============================================================================
// Spotlight Settings
// ============================================================================

/** Радиус spotlight по умолчанию (px) */
export const DEFAULT_SPOTLIGHT_RADIUS = 120;

/** Цвет spotlight по умолчанию */
export const DEFAULT_SPOTLIGHT_COLOR = 'rgba(59, 130, 246, 0.5)';

/** Цвет тени при фокусе */
export const FOCUS_SHADOW_COLOR = 'rgba(59, 130, 246, 0.3)';

/** Начальная позиция мыши (%) */
export const DEFAULT_MOUSE_POSITION = 50;

// ============================================================================
// Particle Settings
// ============================================================================

/** Размер canvas для рендера частиц */
export const CANVAS_SIZE = 800;

/** Множитель размера шрифта для частиц */
export const PARTICLE_FONT_SCALE = 2;

/** Начальная позиция текста на canvas */
export const TEXT_OFFSET_X = 16;
export const TEXT_OFFSET_Y = 40;

/** Скорость sweep-эффекта (пикселей за кадр) */
export const SWEEP_SPEED = 8;

/** Скорость затухания частиц */
export const PARTICLE_DECAY_RATE = 0.05;

/** Цвет частиц по умолчанию */
export const DEFAULT_PARTICLE_COLOR = '#fff';

// ============================================================================
// Timing Settings
// ============================================================================

/** Интервал смены placeholder'а (ms) */
export const PLACEHOLDER_INTERVAL = 3000;

/** Задержка перед refocus после анимации (ms) */
export const REFOCUS_DELAY = 50;

/** Задержка после завершения частиц (ms) */
export const ANIMATION_END_DELAY = 100;
