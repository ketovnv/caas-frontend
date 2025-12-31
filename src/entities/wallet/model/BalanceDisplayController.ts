import { Controller, type SpringConfig } from '@react-spring/web';
import { makeAutoObservable, runInAction, reaction } from 'mobx';
import {
  HIDDEN_STATE,
  VISIBLE_STATE,
  TRAIL_HIDDEN,
  TRAIL_VISIBLE,
  TRAIL_CONFIG,
  COPY_FEEDBACK_DURATION,
  type BalanceDisplayState,
  type TrailItemState,
} from '../config/balance-display.config.ts';

// ============================================================================
// Balance Display Controller - Animation + MobX state
// ============================================================================

export class BalanceDisplayController {
  // MobX observable state
  copied = false;
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;
  private disposer: (() => void) | null = null;

  // Animation controllers
  private mainCtrl: Controller<BalanceDisplayState>;
  private trailCtrls: Controller<TrailItemState>[];

  /** Track if shown at least once */
  private hasShown = false;

  constructor(
    config?: SpringConfig,
    /** Observable function that returns true when balance is available */
    hasBalance?: () => boolean
  ) {
    const springConfig = config ?? TRAIL_CONFIG;

    // Main container animation
    this.mainCtrl = new Controller({
      ...HIDDEN_STATE,
      config: springConfig,
    });

    // Trail animations for 3 elements (label, balance, symbol)
    this.trailCtrls = [
      new Controller({ ...TRAIL_HIDDEN, config: springConfig }),
      new Controller({ ...TRAIL_HIDDEN, config: springConfig }),
      new Controller({ ...TRAIL_HIDDEN, config: springConfig }),
    ];

    // MobX: exclude non-observable fields
    makeAutoObservable<this, 'mainCtrl' | 'trailCtrls' | 'copyTimeout' | 'disposer' | 'hasShown'>(this, {
      mainCtrl: false,
      trailCtrls: false,
      copyTimeout: false,
      disposer: false,
      hasShown: false,
    });

    // Auto-show when balance becomes available
    if (hasBalance) {
      this.disposer = reaction(
        () => hasBalance(),
        (available) => {
          if (available && !this.hasShown) {
            this.hasShown = true;
            this.show();
          }
        },
        { fireImmediately: true }
      );
    }
  }

  // ─────────────────────────────────────────────────────────
  // Getters for animated values
  // ─────────────────────────────────────────────────────────

  get mainSprings() {
    return this.mainCtrl.springs;
  }

  get mainStyle() {
    return {
      opacity: this.mainCtrl.springs.opacity,
      transform: this.mainCtrl.springs.y.to((y) => `translateY(${y}px)`),
    };
  }

  getTrailStyle(index: number) {
    const ctrl = this.trailCtrls[index];
    if (!ctrl) return {};
    return {
      opacity: ctrl.springs.opacity,
      transform: ctrl.springs.y.to((y) => `translateY(${y}px)`),
    };
  }

  // ─────────────────────────────────────────────────────────
  // Animation methods
  // ─────────────────────────────────────────────────────────

  show(config?: SpringConfig) {
    const springConfig = config ?? TRAIL_CONFIG;

    // Animate main container
    this.mainCtrl.start({
      ...VISIBLE_STATE,
      config: springConfig,
    });

    // Animate trail with stagger
    this.trailCtrls.forEach((ctrl, i) => {
      setTimeout(() => {
        ctrl.start({
          ...TRAIL_VISIBLE,
          config: springConfig,
        });
      }, i * 50);
    });
  }

  hide(config?: SpringConfig) {
    const springConfig = config ?? TRAIL_CONFIG;

    this.mainCtrl.start({
      ...HIDDEN_STATE,
      config: springConfig,
    });

    this.trailCtrls.forEach((ctrl) => {
      ctrl.start({
        ...TRAIL_HIDDEN,
        config: springConfig,
      });
    });
  }

  /** Reset and replay animation (for chain change) */
  reset(config?: SpringConfig) {
    // Immediately hide
    this.mainCtrl.set(HIDDEN_STATE);
    this.trailCtrls.forEach((ctrl) => ctrl.set(TRAIL_HIDDEN));

    // Then animate in
    requestAnimationFrame(() => {
      this.show(config);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Copy to clipboard
  // ─────────────────────────────────────────────────────────

  async copyAddress(address: string) {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      runInAction(() => {
        this.copied = true;
      });

      // Clear previous timeout
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }

      // Reset after duration
      this.copyTimeout = setTimeout(() => {
        runInAction(() => {
          this.copied = false;
        });
      }, COPY_FEEDBACK_DURATION);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  resetCopied() {
    this.copied = false;
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────

  dispose() {
    this.disposer?.();
    this.disposer = null;
    this.mainCtrl.stop();
    this.trailCtrls.forEach((ctrl) => ctrl.stop());
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }
}

// ============================================================================
// Singleton Instance - lazy initialized
// ============================================================================

let _balanceDisplayController: BalanceDisplayController | null = null;

export function getBalanceDisplayController(hasBalance?: () => boolean): BalanceDisplayController {
  if (!_balanceDisplayController) {
    _balanceDisplayController = new BalanceDisplayController(undefined, hasBalance);
  }
  return _balanceDisplayController;
}
