import { Controller, type SpringConfig } from '@react-spring/core';
import { themeStore } from 'shared/model';

// ============================================================================
// Animation States
// ============================================================================

const LIGHT = {
  thumbX: 1,      // multiplied by translate
  thumbRotate: 360,
  bg: 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
  glow: '0 0 20px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
  sunOpacity: 1,
  sunScale: 1,
  moonOpacity: 0,
  moonScale: 0.3,
  starsOpacity: 0,
  raysOpacity: 0.8,
  raysRotate: 45,
};

const DARK = {
  thumbX: 0,
  thumbRotate: 0,
  bg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  glow: '0 0 15px rgba(100, 116, 139, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)',
  sunOpacity: 0,
  sunScale: 0.3,
  moonOpacity: 1,
  moonScale: 1,
  starsOpacity: 1,
  raysOpacity: 0,
  raysRotate: 0,
};

type ToggleState = typeof LIGHT;

// ============================================================================
// Toggle Controller
// ============================================================================

export class ToggleController {
  private ctrl: Controller<ToggleState>;
  private _translate: number;

  constructor(translate: number, config?: SpringConfig) {
    this._translate = translate;
    const initial = themeStore.themeIsDark ? DARK : LIGHT;

    this.ctrl = new Controller({
      ...initial,
      config: config ?? themeStore.springConfig,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Values (for use in style props)
  // ─────────────────────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  /** Thumb transform: translateX(Npx) */
  get thumbTransform() {
    return this.ctrl.springs.thumbX.to(x => `translateX(${x * this._translate}px)`);
  }

  /** Background gradient */
  get background() {
    return this.ctrl.springs.bg;
  }

  /** Box shadow for glow effect */
  get boxShadow() {
    return this.ctrl.springs.glow;
  }

  /** Sun icon styles */
  get sunStyle() {
    const s = this.ctrl.springs;
    return {
      opacity: s.sunOpacity,
      transform: s.sunScale.to(scale => `scale(${scale})`),
    };
  }

  /** Moon icon styles */
  get moonStyle() {
    const s = this.ctrl.springs;
    return {
      opacity: s.moonOpacity,
      transform: s.moonScale.to(scale => `scale(${scale})`),
    };
  }

  /** Stars opacity */
  get starsOpacity() {
    return this.ctrl.springs.starsOpacity;
  }

  /** Rays style */
  get raysStyle() {
    const s = this.ctrl.springs;
    return {
      opacity: s.raysOpacity,
      transform: s.raysRotate.to(r => `rotate(${r}deg)`),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Methods
  // ─────────────────────────────────────────────────────────────────────────

  /** Animate to light state */
  toLight(config?: SpringConfig) {
    return this.ctrl.start({
      ...LIGHT,
      config: config ?? themeStore.springConfig,
    });
  }

  /** Animate to dark state */
  toDark(config?: SpringConfig) {
    return this.ctrl.start({
      ...DARK,
      config: config ?? themeStore.springConfig,
    });
  }

  /** Animate based on isDark flag */
  animateTo(isDark: boolean, config?: SpringConfig) {
    return isDark ? this.toDark(config) : this.toLight(config);
  }

  /** Set state instantly (no animation) */
  set(isDark: boolean) {
    this.ctrl.set(isDark ? DARK : LIGHT);
  }

  /** Stop all animations */
  stop() {
    this.ctrl.stop();
  }

  /** Update translate value (for size changes) */
  setTranslate(translate: number) {
    this._translate = translate;
  }
}
