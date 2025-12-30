import { Controller, to, type Interpolation } from '@react-spring/core';
import {
  wobbleSpring,
  ICON_BUTTON_IDLE,
  ICON_BUTTON_PRESSED,
  WOBBLE_TILT_ANGLE,
  PRESS_HOLD_DURATION,
  PERSPECTIVE,
  type IconButtonState,
} from '../config';

// ============================================================================
// Icon Button Controller
// ============================================================================

export class IconButtonController {
  private ctrl: Controller<IconButtonState>;
  private bounds = { width: 0, height: 0, left: 0, top: 0 };
  private _isPressed = false;
  private _transform: Interpolation<string>; // Cached once!

  constructor() {
    this.ctrl = new Controller({
      ...ICON_BUTTON_IDLE,
      config: wobbleSpring,
    });

    // Create interpolation ONCE in constructor - critical for React Spring to track
    const s = this.ctrl.springs;
    this._transform = to(
      [s.rotateX, s.rotateY, s.scale],
      (rx, ry, scale) =>
        `perspective(${PERSPECTIVE}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────

  get isPressed() {
    return this._isPressed;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Values
  // ─────────────────────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  /** Full transform for button - cached interpolation, reactive to all springs */
  get transform() {
    return this._transform;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /** Update bounds from element */
  updateBounds(rect: DOMRect) {
    this.bounds = {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };
  }

  /**
   * Handle mouse move - wobble эффект
   * Только наклон, без scale
   */
  onMouseMove(clientX: number, clientY: number) {
    if (this._isPressed) return;

    const { width, height, left, top } = this.bounds;
    if (width === 0) return;

    const mouseX = (clientX - left - width / 2) / (width / 2);
    const mouseY = (clientY - top - height / 2) / (height / 2);

    // Wobble: наклон в сторону курсора (как на WobbleCard)
    this.ctrl.start({
      rotateX: -mouseY * WOBBLE_TILT_ANGLE,
      rotateY: mouseX * WOBBLE_TILT_ANGLE,
      config: wobbleSpring,
    });
  }

  /** Handle mouse enter */
  onMouseEnter() {
    if (this._isPressed) return;
  }

  /** Handle mouse leave - плавно возвращается */
  onMouseLeave() {
    if (this._isPressed) return;
    this.ctrl.start({
      ...ICON_BUTTON_IDLE,
      config: wobbleSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Press Animation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Анимация нажатия с той же скоростью что и wobble
   */
  async press(): Promise<void> {
    if (this._isPressed) return;

    this._isPressed = true;

    // Вжимаем с той же мягкой пружиной
    await this.ctrl.start({
      ...ICON_BUTTON_PRESSED,
      config: wobbleSpring,
    });

    // Держим
    await new Promise(resolve => setTimeout(resolve, PRESS_HOLD_DURATION));

    // Возвращаем с той же пружиной
    await this.ctrl.start({
      ...ICON_BUTTON_IDLE,
      config: wobbleSpring,
    });

    this._isPressed = false;
  }

  /** Reset to idle */
  reset() {
    this._isPressed = false;
    this.ctrl.start({ ...ICON_BUTTON_IDLE, config: wobbleSpring });
  }

  /** Stop animations */
  stop() {
    this.ctrl.stop();
  }
}
