import { Controller, to, type SpringConfig } from '@react-spring/core';
import { makeAutoObservable, reaction } from 'mobx';
import { themeStore } from 'shared/model';

// ============================================================================
// Star positions - scattered in dark mode, collapsed in light mode
// ============================================================================

const STAR_COUNT = 6;

// Dark mode: stars scattered across RIGHT side (where empty space is)
const STARS_DARK = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: 55 + (i % 3) * 12 + Math.sin(i * 1.5) * 5,  // 50-90% (right side)
  y: 15 + Math.floor(i / 3) * 35 + Math.cos(i * 2) * 10,
  scale: 0.5,
  opacity: 0.7 + (i % 2) * 0.3,
}));

// Light mode: stars collapsed to left side (where thumb will be)
const STARS_LIGHT = Array.from({ length: STAR_COUNT }, () => ({
  x: 20,
  y: 50,
  scale: 0,
  opacity: 0,
}));

// ============================================================================
// Animation States
// ============================================================================

const LIGHT = {
  thumbX: 1,
  thumbRotate: 360,
  thumbBg: '#ffffff',
  bg: 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
  glow: '0 0 20px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
  sunOpacity: 1,
  sunScale: 1,
  moonOpacity: 0,
  moonScale: 0.5,
  starsOpacity: 0,
  raysOpacity: 0.8,
  raysRotate: 45,
};

const DARK = {
  thumbX: 0,
  thumbRotate: 0,
  thumbBg: '#e2e8f0',  // slate-200 — slightly darker in dark mode
  bg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  glow: '0 0 15px rgba(100, 116, 139, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)',
  sunOpacity: 0,
  sunScale: 1,
  moonOpacity: 1,
  moonScale: 1,
  starsOpacity: 1,
  raysOpacity: 0,
  raysRotate: 0,
};

type ToggleState = typeof LIGHT;

interface StarState {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const DEBOUNCE_MS = 150;

// ============================================================================
// Toggle Controller
// ============================================================================

export class ToggleController {
  private ctrl: Controller<ToggleState>;
  private starCtrls: Controller<StarState>[];
  private _lastClickTime = 0;
  private _disposers: (() => void)[] = [];

  constructor( config?: SpringConfig) {
    const isDark = themeStore.themeIsDark;
    const initial = isDark ? DARK : LIGHT;
    const starInitial = isDark ? STARS_DARK : STARS_LIGHT;

    this.ctrl = new Controller({
      ...initial,
      config: config ?? themeStore.springConfig,
    });

    // Create controllers for each star
    this.starCtrls = starInitial.map(star => new Controller({
      ...star,
      config: config ?? themeStore.springConfig,
    }));

    makeAutoObservable<this, 'ctrl' | 'starCtrls' | '_lastClickTime' | '_disposers'>(this, {
      ctrl: false,
      starCtrls: false,
      _lastClickTime: false,
      _disposers: false,
    });

    this.setupReactions();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Reactions
  // ─────────────────────────────────────────────────────────────────────────

  private setupReactions() {
    const dispose = reaction(
      () => themeStore.themeIsDark,
      (isDark) => this.animateTo(isDark),
      { fireImmediately: false }
    );
    this._disposers.push(dispose);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────

  get isDark() {
    return themeStore.themeIsDark;
  }

  get ariaLabel() {
    return this.isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Values
  // ─────────────────────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  /** Thumb transform: translateX + rotate */
  get thumbTransform() {
    const s = this.ctrl.springs;
    return to([s.thumbX, s.thumbRotate], (x, r) =>
      `translateX(${x * 32}px) rotate(${r}deg)`
    );
  }

  get background() {
    return this.ctrl.springs.bg;
  }

  get boxShadow() {
    return this.ctrl.springs.glow;
  }

  get thumbBackground() {
    return this.ctrl.springs.thumbBg;
  }

  get sunStyle() {
    const s = this.ctrl.springs;
    return {
      opacity: s.sunOpacity,
      transform: s.sunScale.to(scale => `scale(${scale})`),
    };
  }

  get moonStyle() {
    const s = this.ctrl.springs;
    return {
      opacity: s.moonOpacity,
      transform: s.moonScale.to(scale => `scale(${scale})`),
    };
  }

  get starsOpacity() {
    return this.ctrl.springs.starsOpacity;
  }

  get raysStyle() {
    const s = this.ctrl.springs;
    return {
      opacity: s.raysOpacity,
      transform: s.raysRotate.to(r => `rotate(${r}deg)`),
    };
  }

  /** Get animated style for each star */
  getStarStyle(index: number) {
    const ctrl = this.starCtrls[index];
    if (!ctrl) return { opacity: 0, left: '0%', top: '0%', transform: 'scale(0)' };

    const s = ctrl.springs;
    return {
      opacity: s.opacity,
      left: s.x.to(x => `${x}%`),
      top: s.y.to(y => `${y}%`),
      transform: s.scale.to(sc => `scale(${sc})`),
    };
  }

  get starCount() {
    return STAR_COUNT;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  handleClick = () => {
    const now = Date.now();
    if (now - this._lastClickTime < DEBOUNCE_MS) return;
    this._lastClickTime = now;
    themeStore.toggleColorScheme();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Methods
  // ─────────────────────────────────────────────────────────────────────────

  toLight(config?: SpringConfig) {
    const springConfig = config ?? themeStore.springConfig;

    // Animate main controller
    this.ctrl.start({
      ...LIGHT,
      config: springConfig,
    });

    // Animate stars to collapsed state
    this.starCtrls.forEach((ctrl, i) => {
      ctrl.start({
        ...STARS_LIGHT[i],
        config: springConfig,
      });
    });
  }

  toDark(config?: SpringConfig) {
    const springConfig = config ?? themeStore.springConfig;

    // Animate main controller
    this.ctrl.start({
      ...DARK,
      config: springConfig,
    });

    // Animate stars to scattered state
    this.starCtrls.forEach((ctrl, i) => {
      ctrl.start({
        ...STARS_DARK[i],
        config: springConfig,
      });
    });
  }

  animateTo(isDark: boolean, config?: SpringConfig) {
    return isDark ? this.toDark(config) : this.toLight(config);
  }

  set(isDark: boolean) {
    this.ctrl.set(isDark ? DARK : LIGHT);
    const stars = isDark ? STARS_DARK : STARS_LIGHT;
    this.starCtrls.forEach((ctrl, i) => ctrl.set(stars[i]!));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  stop() {
    this.ctrl.stop();
    this.starCtrls.forEach(ctrl => ctrl.stop());
  }

  dispose() {
    this._disposers.forEach(d => d());
    this._disposers = [];
    this.ctrl.stop();
    this.starCtrls.forEach(ctrl => ctrl.stop());
  }
}

// ============================================================================
// Singleton
// ============================================================================

export const toggleController = new ToggleController();
