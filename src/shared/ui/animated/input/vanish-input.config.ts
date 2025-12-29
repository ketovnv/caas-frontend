import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Configs
// ============================================================================

/** Мягкая пружина - для плавных переходов placeholder'а */
export const gentleSpring: SpringConfig = {
  tension: 170,
  friction: 26,
};

// ============================================================================
// Vanish Input State
// ============================================================================

export interface VanishInputState {
  placeholderOpacity: number;
  placeholderY: number;
  arrowDashoffset: number;
  canvasOpacity: number;
}

export const VANISH_IDLE: VanishInputState = {
  placeholderOpacity: 1,
  placeholderY: 0,
  arrowDashoffset: 50,
  canvasOpacity: 0,
};

export const VANISH_TYPING: Partial<VanishInputState> = {
  placeholderOpacity: 0,
  placeholderY: -16,
  arrowDashoffset: 0,
};

export const VANISH_ANIMATING: Partial<VanishInputState> = {
  canvasOpacity: 1,
};

export const VANISH_AFTER: Partial<VanishInputState> = {
  canvasOpacity: 0,
};

// ============================================================================
// Animation Settings
// ============================================================================

/** Размер canvas для рендера частиц */
export const CANVAS_SIZE = 800;

/** Множитель размера шрифта для частиц (2x = крупнее частицы) */
export const PARTICLE_FONT_SCALE = 2;

/** Начальная позиция текста на canvas */
export const TEXT_OFFSET_X = 16;
export const TEXT_OFFSET_Y = 40;

/** Скорость sweep-эффекта (пикселей за кадр) */
export const SWEEP_SPEED = 8;

/** Скорость затухания частиц */
export const PARTICLE_DECAY_RATE = 0.05;

/** Интервал смены placeholder'а (ms) */
export const PLACEHOLDER_INTERVAL = 3000;

/** Задержка перед refocus после анимации (ms) */
export const REFOCUS_DELAY = 50;

/** Задержка после завершения частиц (ms) */
export const ANIMATION_END_DELAY = 100;
