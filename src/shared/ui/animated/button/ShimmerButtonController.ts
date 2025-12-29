import { Controller } from '@react-spring/core';
import { to } from '@react-spring/web';
import { makeAutoObservable } from 'mobx';
import { core } from 'shared/model';
import {
  shimmerSpring,
  pressSpring,
  pressDownSpring,
  releaseSpring,
  SHIMMER_START,
  PRESS_IDLE,
  PRESS_HOVERED,
  PRESS_DOWN,
  PRESS_UP,
  DEFAULT_SHIMMER_DURATION,
  getSteppedRotation,
  createShimmerGradient,
  createHighlightGradient,
  type ShimmerAnimState,
  type PressAnimState,
} from './shimmer-button.config';

// ============================================================================
// ShimmerButton Controller
// ============================================================================

export interface ShimmerButtonControllerOptions {
  shimmerColor?: string;
  shimmerSpread?: number;
  shimmerDuration?: number;
}

export class ShimmerButtonController {
  // ─────────────────────────────────────────────────────────────────────────
  // MobX Observable State
  // ─────────────────────────────────────────────────────────────────────────

  isDisabled = false;

  // ─────────────────────────────────────────────────────────────────────────
  // Internal State (not observable)
  // ─────────────────────────────────────────────────────────────────────────

  private shimmerCtrl: Controller<ShimmerAnimState>;
  private pressCtrl: Controller<PressAnimState>;

  private shimmerDuration: number;

  // Animation state
  private slideDirection = 1;
  private isMounted = true;

  // Cached interpolations (typed as any for React Spring compatibility)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _buttonTransform: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _innerShadow: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _shimmerSlideTransform: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _shimmerRotation: any = null;
  private _shimmerGradient: string;
  private _highlightGradient: string;

  constructor(options: ShimmerButtonControllerOptions = {}) {
    const {
      shimmerColor = '#ffffff',
      shimmerSpread = 90,
      shimmerDuration = DEFAULT_SHIMMER_DURATION,
    } = options;

    this.shimmerDuration = shimmerDuration;

    // Pre-compute gradients
    this._shimmerGradient = createShimmerGradient(shimmerColor, shimmerSpread);
    this._highlightGradient = createHighlightGradient(shimmerColor, shimmerSpread);

    // Initialize controllers
    this.shimmerCtrl = new Controller({
      ...SHIMMER_START,
      config: { ...shimmerSpring, mass: shimmerDuration * 10 },
    });

    this.pressCtrl = new Controller({
      ...PRESS_IDLE,
      config: pressSpring,
    });

    makeAutoObservable<
      this,
      | 'shimmerCtrl'
      | 'pressCtrl'
      | 'shimmerDuration'
      | 'slideDirection'
      | 'isMounted'
      | '_buttonTransform'
      | '_innerShadow'
      | '_shimmerSlideTransform'
      | '_shimmerRotation'
      | '_shimmerGradient'
      | '_highlightGradient'
    >(this, {
      shimmerCtrl: false,
      pressCtrl: false,
      shimmerDuration: false,
      slideDirection: false,
      isMounted: false,
      _buttonTransform: false,
      _innerShadow: false,
      _shimmerSlideTransform: false,
      _shimmerRotation: false,
      _shimmerGradient: false,
      _highlightGradient: false,
    }, { autoBind: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed Animated Values (cached)
  // ─────────────────────────────────────────────────────────────────────────

  /** Button transform (y + scale) */
  get buttonTransform() {
    if (!this._buttonTransform) {
      this._buttonTransform = to(
        [this.pressCtrl.springs.y, this.pressCtrl.springs.scale],
        (y, s) => `translateY(${y}px) scale(${s})`
      );
    }
    return this._buttonTransform;
  }

  /** Inner shadow style */
  get innerShadow() {
    if (!this._innerShadow) {
      this._innerShadow = to(
        [
          this.pressCtrl.springs.innerShadowY,
          this.pressCtrl.springs.innerShadowBlur,
          this.pressCtrl.springs.innerShadowOpacity,
        ],
        (y, blur, opacity) => `inset 0 -${y}px ${blur}px rgba(255, 255, 255, ${opacity})`
      );
    }
    return this._innerShadow;
  }

  /** Shimmer slide transform */
  get shimmerSlideTransform() {
    if (!this._shimmerSlideTransform) {
      this._shimmerSlideTransform = this.shimmerCtrl.springs.slide.to(
        (p) => `translate(calc(${p * 100}cqw - ${p * 100}%), 0)`
      );
    }
    return this._shimmerSlideTransform;
  }

  /** Shimmer rotation transform */
  get shimmerRotation() {
    if (!this._shimmerRotation) {
      this._shimmerRotation = this.shimmerCtrl.springs.spin.to(
        (p) => `rotate(${getSteppedRotation(p)}deg)`
      );
    }
    return this._shimmerRotation;
  }

  /** Shimmer conic gradient */
  get shimmerGradient(): string {
    return this._shimmerGradient;
  }

  /** Highlight conic gradient */
  get highlightGradient(): string {
    return this._highlightGradient;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions - Press Events
  // ─────────────────────────────────────────────────────────────────────────

  onMouseEnter() {
    if (this.isDisabled) return;
    this.pressCtrl.start({
      ...PRESS_HOVERED,
      config: pressSpring,
    });
  }

  onMouseLeave() {
    this.pressCtrl.start({
      ...PRESS_UP,
      ...PRESS_IDLE,
      config: pressSpring,
    });
  }

  onMouseDown() {
    if (this.isDisabled) return;
    this.pressCtrl.start({
      ...PRESS_DOWN,
      config: pressDownSpring,
    });
  }

  onMouseUp() {
    this.pressCtrl.start({
      ...PRESS_UP,
      config: releaseSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Loops
  // ─────────────────────────────────────────────────────────────────────────

  /** Start shimmer animations */
  startAnimations() {
    this.isMounted = true;
    this.runSlideAnimation();
    this.runSpinAnimation();
  }

  /** Stop all animations */
  stopAnimations() {
    this.isMounted = false;
    this.shimmerCtrl.stop();
    this.pressCtrl.stop();
  }

  private runSlideAnimation() {
    if (!this.isMounted) return;

    const slideMs = this.shimmerDuration * 1000;

    this.shimmerCtrl.start({
      slide: this.slideDirection,
      config: { duration: slideMs },
      onRest: () => {
        if (this.isMounted) {
          this.slideDirection = this.slideDirection === 1 ? 0 : 1;
          // Schedule next iteration via CoreStore
          core.scheduleWrite(() => this.runSlideAnimation());
        }
      },
    });
  }

  private runSpinAnimation() {
    if (!this.isMounted) return;

    const spinMs = this.shimmerDuration * 2 * 1000;

    this.shimmerCtrl.set({ spin: 0 });
    this.shimmerCtrl.start({
      spin: 1,
      config: { duration: spinMs },
      onRest: () => {
        if (this.isMounted) {
          // Schedule next iteration via CoreStore
          core.scheduleWrite(() => this.runSpinAnimation());
        }
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State Management
  // ─────────────────────────────────────────────────────────────────────────

  setDisabled(disabled: boolean) {
    this.isDisabled = disabled;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  dispose() {
    this.stopAnimations();
  }
}
