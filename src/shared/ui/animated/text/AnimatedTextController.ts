import { makeAutoObservable, runInAction } from 'mobx';
import type { SpringRef } from '@react-spring/web';
import {
  DynamicColorArraySpring,
  themeStore,
  type OklchTuple,
  type SpringConfig,
} from '@/shared';
import {
  CHAR_HIDDEN,
  CHAR_VISIBLE,
  DEFAULT_COLORS,
  DEFAULT_STAGGER_DELAY,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_SPEED,
  type CharState,
} from './animated-text.config';

// ============================================================================
// AnimatedText Controller
// ============================================================================

export class AnimatedTextController {
  // ─────────────────────────────────────────────────────────────────────────
  // MobX Observable State
  // ─────────────────────────────────────────────────────────────────────────

  text = '';
  isAnimating = false;
  hasAnimated = false;

  // ─────────────────────────────────────────────────────────────────────────
  // Configuration (non-observable)
  // ─────────────────────────────────────────────────────────────────────────

  private _staggerDelay: number;
  private _gradientSpeed: number;
  private _gradientAngle: number;
  private _lightColors?: OklchTuple[];
  private _darkColors?: OklchTuple[];

  // Color spring for gradient animation
  private _colorSpring: DynamicColorArraySpring;

  // Trail API ref (set from component)
  private _trailApi: SpringRef<CharState> | null = null;

  // ─────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────

  constructor(options: {
    text?: string;
    colors?: OklchTuple[];
    lightColors?: OklchTuple[];
    darkColors?: OklchTuple[];
    staggerDelay?: number;
    gradientSpeed?: number;
    gradientAngle?: number;
    colorSpringConfig?: SpringConfig;
  } = {}) {
    this.text = options.text ?? '';
    this._staggerDelay = options.staggerDelay ?? DEFAULT_STAGGER_DELAY;
    this._gradientSpeed = options.gradientSpeed ?? DEFAULT_GRADIENT_SPEED;
    this._gradientAngle = options.gradientAngle ?? DEFAULT_GRADIENT_ANGLE;
    this._lightColors = options.lightColors;
    this._darkColors = options.darkColors;

    // Determine initial colors
    const initialColors = this.getInitialColors(options.colors);

    // Initialize color spring
    this._colorSpring = new DynamicColorArraySpring(
      initialColors,
      options.colorSpringConfig ?? themeStore.springConfig
    );

    makeAutoObservable<
      this,
      '_staggerDelay' | '_gradientSpeed' | '_gradientAngle' | '_lightColors' | '_darkColors' | '_colorSpring' | '_trailApi'
    >(this, {
      _staggerDelay: false,
      _gradientSpeed: false,
      _gradientAngle: false,
      _lightColors: false,
      _darkColors: false,
      _colorSpring: false,
      _trailApi: false,
    }, { autoBind: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────

  get chars(): string[] {
    return this.text.split('');
  }

  get isThemed(): boolean {
    return !!(this._lightColors && this._darkColors);
  }

  get staggerDelay(): number {
    return this._staggerDelay;
  }

  get gradientSpeed(): number {
    return this._gradientSpeed;
  }

  get gradientAngle(): number {
    return this._gradientAngle;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Color Spring Getters
  // ─────────────────────────────────────────────────────────────────────────

  get gradientString() {
    return this._colorSpring.gradientString(this._gradientAngle);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Trail API (set from component)
  // ─────────────────────────────────────────────────────────────────────────

  setTrailApi(api: SpringRef<CharState>) {
    this._trailApi = api;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Methods
  // ─────────────────────────────────────────────────────────────────────────

  async animateIn(): Promise<void> {
    if (!this._trailApi || this.chars.length === 0) return;

    runInAction(() => {
      this.isAnimating = true;
    });

    await this._trailApi.start((i) => ({
      to: CHAR_VISIBLE,
      delay: i * this._staggerDelay,
    }));

    runInAction(() => {
      this.isAnimating = false;
      this.hasAnimated = true;
    });
  }

  async animateOut(): Promise<void> {
    if (!this._trailApi) return;

    runInAction(() => {
      this.isAnimating = true;
    });

    await this._trailApi.start((i) => ({
      to: CHAR_HIDDEN,
      delay: (this.chars.length - 1 - i) * this._staggerDelay,
    }));

    runInAction(() => {
      this.isAnimating = false;
    });
  }

  reset(): void {
    this._trailApi?.set(CHAR_HIDDEN);
    runInAction(() => {
      this.hasAnimated = false;
    });
  }

  async replay(): Promise<void> {
    this.reset();
    await this.animateIn();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Text Change
  // ─────────────────────────────────────────────────────────────────────────

  /** Update text synchronously (component handles animation) */
  updateText(newText: string): void {
    if (newText === this.text) return;
    runInAction(() => {
      this.text = newText;
      this.hasAnimated = false;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Color Methods
  // ─────────────────────────────────────────────────────────────────────────

  async animateColors(colors: OklchTuple[]): Promise<void> {
    await this._colorSpring.animateTo(colors);
  }

  /** Animate to theme colors (for theme change reaction) */
  animateToThemeColors(): void {
    if (!this.isThemed) return;
    const targetColors = themeStore.isDark ? this._darkColors! : this._lightColors!;
    this._colorSpring.animateTo(targetColors);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private getInitialColors(staticColors?: OklchTuple[]): OklchTuple[] {
    if (this._lightColors && this._darkColors) {
      return themeStore.isDark ? this._darkColors : this._lightColors;
    }
    return staticColors ?? DEFAULT_COLORS;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  dispose(): void {
    this._colorSpring.stop();
  }
}
