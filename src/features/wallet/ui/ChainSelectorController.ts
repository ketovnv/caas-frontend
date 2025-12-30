import { Controller, type SpringConfig } from '@react-spring/web';
import {
  ACTIVE_STATE,
  INACTIVE_STATE,
  CHAIN_BUTTON_CONFIG,
  type ChainButtonState,
} from './chain-selector.config';

// ============================================================================
// Chain Button Controller - Animation for individual chain button
// ============================================================================

export class ChainButtonController {
  private ctrl: Controller<ChainButtonState>;

  constructor(isActive: boolean, config?: SpringConfig) {
    const initial = isActive ? ACTIVE_STATE : INACTIVE_STATE;
    this.ctrl = new Controller({
      ...initial,
      config: config ?? CHAIN_BUTTON_CONFIG,
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

  get borderColor() {
    return this.ctrl.springs.borderOpacity.to(
      (o) => `rgba(139, 92, 246, ${o * 0.5})`
    );
  }

  // ─────────────────────────────────────────────────────────
  // Animation methods
  // ─────────────────────────────────────────────────────────

  setActive(config?: SpringConfig) {
    return this.ctrl.start({
      ...ACTIVE_STATE,
      config: config ?? CHAIN_BUTTON_CONFIG,
    });
  }

  setInactive(config?: SpringConfig) {
    return this.ctrl.start({
      ...INACTIVE_STATE,
      config: config ?? CHAIN_BUTTON_CONFIG,
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
