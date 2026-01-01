import type { SpringConfig } from '@react-spring/web';

// ============================================================================
// Spring Configs
// ============================================================================

/** Wobble spring - мягкий и пружинистый для кнопок */
export const wobbleSpring: SpringConfig = {
  tension: 300,
  friction: 50,
  mass: 5,
};

/** Panel spring - для появления/скрытия панелей */
export const panelSpring: SpringConfig = {
  tension: 180,
  friction: 12,
};

// ============================================================================
// Icon Button States
// ============================================================================

export interface IconButtonState {
  scale: number;
  rotateX: number;
  rotateY: number;
}

export const ICON_BUTTON_IDLE: IconButtonState = {
  scale: 1,
  rotateX: 0,
  rotateY: 0,
};

export const ICON_BUTTON_PRESSED: IconButtonState = {
  scale: 0.9,
  rotateX: 0,
  rotateY: 0,
};

// ============================================================================
// Input Panel States
// ============================================================================

export interface InputPanelState {
  opacity: number;
  y: number;
}

export const INPUT_PANEL_HIDDEN: InputPanelState = {
  opacity: 0,
  y: 20,
};

export const INPUT_PANEL_VISIBLE: InputPanelState = {
  opacity: 1,
  y: 0,
};

// Animation Settings

/** Угол наклона wobble эффекта (в градусах) */
export const WOBBLE_TILT_ANGLE = 10;

/** Время удержания кнопки при нажатии (ms) */
export const PRESS_HOLD_DURATION = 350;

/** Perspective для 3D трансформаций */
export const PERSPECTIVE = 600;
