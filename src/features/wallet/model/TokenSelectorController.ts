import { Controller, type SpringConfig } from '@react-spring/web';
import {
  ACTIVE_STATE,
  INACTIVE_STATE,
  TOKEN_BUTTON_CONFIG,
  type TokenButtonState,
} from '../config/token-selector.config.ts';

// ============================================================================
// Token Button Controller - Animation for individual token button
// ============================================================================

export class TokenButtonController {
  private ctrl: Controller<TokenButtonState>;

  constructor(isActive: boolean, config?: SpringConfig) {
    const initial = isActive ? ACTIVE_STATE : INACTIVE_STATE;
    this.ctrl = new Controller({
      ...initial,
      config: config ?? TOKEN_BUTTON_CONFIG,
    });
  }

  // ─────────────────────────────────────────────────────────
  // Getters for animated values
  // ─────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  get transform() {
    return this.ctrl.springs.scale.to((s) => `scale(${s})`);
  }

  get opacity() {
    return this.ctrl.springs.opacity;
  }

  // ─────────────────────────────────────────────────────────
  // Animation methods
  // ─────────────────────────────────────────────────────────

  setActive(config?: SpringConfig) {
    return this.ctrl.start({
      ...ACTIVE_STATE,
      config: config ?? TOKEN_BUTTON_CONFIG,
    });
  }

  setInactive(config?: SpringConfig) {
    return this.ctrl.start({
      ...INACTIVE_STATE,
      config: config ?? TOKEN_BUTTON_CONFIG,
    });
  }

  animateTo(isActive: boolean, config?: SpringConfig) {
    return isActive ? this.setActive(config) : this.setInactive(config);
  }

  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────

  dispose() {
    this.ctrl.stop();
  }
}
