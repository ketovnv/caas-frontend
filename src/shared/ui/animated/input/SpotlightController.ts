import { Controller, to } from '@react-spring/core';
import { makeAutoObservable } from 'mobx';
import {
  spotlightSpring,
  pulseSpring,
  SPOTLIGHT_IDLE,
  SPOTLIGHT_FOCUSED,
  SPOTLIGHT_BLURRED,
  SPOTLIGHT_UNHOVERED,
  PULSE_UP,
  PULSE_DOWN,
  PULSE_RESET,
  DEFAULT_SPOTLIGHT_RADIUS,
  DEFAULT_SPOTLIGHT_COLOR,
  FOCUS_SHADOW_COLOR,
  DEFAULT_MOUSE_POSITION,
  type SpotlightState,
} from './spotlight.config';

// ============================================================================
// Spotlight Controller (with MobX state)
// ============================================================================

export class SpotlightController {
  // ─────────────────────────────────────────────────────────────────────────
  // MobX Observable State
  // ─────────────────────────────────────────────────────────────────────────

  isHovered = false;
  isFocused = false;
  mouseX = DEFAULT_MOUSE_POSITION;
  mouseY = DEFAULT_MOUSE_POSITION;

  // ─────────────────────────────────────────────────────────────────────────
  // Internal State
  // ─────────────────────────────────────────────────────────────────────────

  private ctrl: Controller<SpotlightState>;
  private _pulseActive = false;
  private _spotlightRadius: number;
  private _spotlightColor: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Refs (set from component)
  // ─────────────────────────────────────────────────────────────────────────

  containerElement: HTMLDivElement | null = null;
  inputElement: HTMLInputElement | null = null;

  constructor(
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    spotlightColor = DEFAULT_SPOTLIGHT_COLOR
  ) {
    this._spotlightRadius = spotlightRadius;
    this._spotlightColor = spotlightColor;

    this.ctrl = new Controller({
      ...SPOTLIGHT_IDLE,
      config: spotlightSpring,
    });

    makeAutoObservable<this, 'ctrl' | '_pulseActive' | '_spotlightRadius' | '_spotlightColor'>(
      this,
      {
        ctrl: false,
        _pulseActive: false,
        _spotlightRadius: false,
        _spotlightColor: false,
        containerElement: false,
        inputElement: false,
      },
      { autoBind: true }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Values
  // ─────────────────────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  /** Background gradient for spotlight effect */
  get background() {
    return this.ctrl.springs.radius.to(
      (r) => `radial-gradient(${r}px circle at ${this.mouseX}% ${this.mouseY}%, ${this._spotlightColor}, transparent 80%)`
    );
  }

  /** Transform with pulse scale */
  get transform() {
    return this.ctrl.springs.pulseScale.to((s) => `scale(${s})`);
  }

  /** Box shadow for focus glow */
  get boxShadow() {
    return to(
      [this.ctrl.springs.shadowSpread, this.ctrl.springs.borderOpacity],
      (spread, opacity) =>
        `0 0 ${spread}px ${spread / 2}px ${FOCUS_SHADOW_COLOR.replace('0.3', String(opacity * 0.3))}`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  focus() {
    this.inputElement?.focus();
  }

  blur() {
    this.inputElement?.blur();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event Handlers (call from component)
  // ─────────────────────────────────────────────────────────────────────────

  onMouseMove(clientX: number, clientY: number) {
    if (!this.containerElement) return;
    const { left, top, width, height } = this.containerElement.getBoundingClientRect();
    this.mouseX = ((clientX - left) / width) * 100;
    this.mouseY = ((clientY - top) / height) * 100;
  }

  onMouseEnter() {
    this.isHovered = true;
    this.ctrl.start({
      radius: this._spotlightRadius,
      opacity: 1,
      config: spotlightSpring,
    });
  }

  onMouseLeave() {
    this.isHovered = false;
    this.ctrl.start({
      ...SPOTLIGHT_UNHOVERED,
      config: spotlightSpring,
    });
  }

  onFocus(enablePulse = true) {
    this.isFocused = true;
    this.ctrl.start({
      ...SPOTLIGHT_FOCUSED,
      config: spotlightSpring,
    });
    if (enablePulse) this.startPulse();
  }

  onBlur() {
    this.isFocused = false;
    this.stopPulse();
    this.ctrl.start({
      ...SPOTLIGHT_BLURRED,
      config: spotlightSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Pulse Animation
  // ─────────────────────────────────────────────────────────────────────────

  private async startPulse() {
    if (this._pulseActive) return;
    this._pulseActive = true;

    while (this._pulseActive) {
      await this.ctrl.start({
        ...PULSE_UP,
        config: pulseSpring,
      });
      if (!this._pulseActive) break;

      await this.ctrl.start({
        ...PULSE_DOWN,
        config: pulseSpring,
      });
    }
  }

  private stopPulse() {
    this._pulseActive = false;
    this.ctrl.start({
      ...PULSE_RESET,
      config: spotlightSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  dispose() {
    this._pulseActive = false;
    this.ctrl.stop();
  }
}
