// stores/ThemeStore.ts
import { action, makeAutoObservable, reaction } from 'mobx';
import {
  gradient,
  createController,
  type ControllerAPI,
  type OklchTuple,
  lerpOklchArrays,
  oklchToString,
} from 'shared/lib';

const DARK = 0;
const LIGHT = 1;

const ultraSpringTheme = {
    tension: 50,
    friction: 175,
    mass: 15,
    precision: 0.1,
};

// ThemeToggle animation configs
const toggleAnimationConfig = {
  path: { tension: 280, friction: 60, mass: 0.8 },
  switch: { tension: 300, friction: 30 },
  background: { tension: 200, friction: 25 },
  glow: { tension: 200, friction: 25 },
};

export class ThemeStore {
  colorScheme = DARK;
  disposers: Array<() => void> = [];
  isDisposed = false;

  // Main theme progress controller (0 = dark, 1 = light)
  progressController: ControllerAPI | null = null;

  // Precomputed spread colors for animation (128 colors each)
  darkBackgroundSpread: OklchTuple[] = [];
  lightBackgroundSpread: OklchTuple[] = [];
  darkButtonSpread: OklchTuple[] = [];
  lightButtonSpread: OklchTuple[] = [];

  // Precomputed single colors
  darkColor: OklchTuple = [0, 0, 0];
  lightColor: OklchTuple = [0, 0, 0];
  darkAccent: OklchTuple = [0, 0, 0];
  lightAccent: OklchTuple = [0, 0, 0];

  // ThemeToggle controllers
  pathController: ControllerAPI | null = null;
  switchController: ControllerAPI | null = null;
  backgroundController: ControllerAPI | null = null;
  glowController: ControllerAPI | null = null;

  constructor(initialState?: { colorScheme?: number }) {
    makeAutoObservable(this, {
      toggleColorScheme: action,
      animateThemeTransition: action,
      updateToggleAnimations: action,
    });

    this.colorScheme = initialState?.colorScheme ?? DARK;

    // Precompute spread colors at initialization
    this.precomputeSpreads();
    this.precomputeColors();

    this.setProgressController();
    this.setToggleControllers();
    this.setupReactions();
  }

  /**
   * Precompute 128-color spreads for both themes.
   * Called ONCE at startup - no chroma calls during animation.
   */
  precomputeSpreads = () => {
    const darkSpread = gradient.getThemeSpread(true, 128);
    const lightSpread = gradient.getThemeSpread(false, 128);

    this.darkBackgroundSpread = darkSpread.background;
    this.lightBackgroundSpread = lightSpread.background;
    this.darkButtonSpread = darkSpread.button;
    this.lightButtonSpread = lightSpread.button;

    console.log('🎨 Precomputed 128-color spreads for theme animation');
  };

  /**
   * Precompute single colors for text/accent animation
   */
  precomputeColors = () => {
    const darkConfig = gradient.getThemeConfig(true);
    const lightConfig = gradient.getThemeConfig(false);

    this.darkColor = darkConfig.color;
    this.lightColor = lightConfig.color;
    this.darkAccent = darkConfig.accentColor;
    this.lightAccent = lightConfig.accentColor;
  };

  // ============================================================================
  // Theme Progress (main animation driver)
  // ============================================================================

  /**
   * Get springs for use in animated components.
   * Usage: <animated.div style={{ background: springs.progress.to(t => store.getBackgroundAtProgress(t)) }}>
   */
  get springs() {
    return this.progressController?.springs ?? { progress: this.themeIsDark ? 0 : 1 };
  }

  get themeIsDark() {
    return this.colorScheme === DARK;
  }

  setProgressController = () => {
    try {
      this.progressController = createController(
        'themeProgress',
        { progress: this.themeIsDark ? 0 : 1 },
        { config: ultraSpringTheme }
      );
      console.log('🎨 Theme progress controller initialized');
    } catch (error) {
      console.error('Failed to create progress controller:', error);
    }
  };

  /**
   * Animate theme transition
   */
  animateThemeTransition = () => {
    const targetProgress = this.themeIsDark ? 0 : 1;
    this.progressController?.to({ progress: targetProgress });
  };

  // ============================================================================
  // Interpolation helpers (for use in components)
  // ============================================================================

  /**
   * Get interpolated background gradient at progress t
   */
  getBackgroundAtProgress(t: number): string {
    const colors = lerpOklchArrays(
      this.darkBackgroundSpread,
      this.lightBackgroundSpread,
      t
    );
    return this.buildGradientCSS(colors, -30, -15);
  }

  /**
   * Get interpolated button gradient at progress t
   */
  getButtonBackgroundAtProgress(t: number): string {
    const colors = lerpOklchArrays(
      this.darkButtonSpread,
      this.lightButtonSpread,
      t
    );
    return this.buildGradientCSS(colors, 100, 50);
  }

  /**
   * Get interpolated text color at progress t
   */
  getColorAtProgress(t: number): string {
    const color = this.lerpColor(this.darkColor, this.lightColor, t);
    return oklchToString(color);
  }

  /**
   * Get interpolated accent color at progress t
   */
  getAccentAtProgress(t: number): string {
    const color = this.lerpColor(this.darkAccent, this.lightAccent, t);
    return oklchToString(color);
  }

  /**
   * Interpolate single color
   */
  private lerpColor(from: OklchTuple, to: OklchTuple, t: number): OklchTuple {
    const l = from[0] + (to[0] - from[0]) * t;
    const c = from[1] + (to[1] - from[1]) * t;
    // Hue: shortest path
    let h1 = from[2], h2 = to[2];
    let diff = h2 - h1;
    if (diff > 180) diff -= 360;
    else if (diff < -180) diff += 360;
    const h = ((h1 + diff * t) % 360 + 360) % 360;
    return [l, c, h];
  }

  /**
   * Build CSS gradient string from spread colors
   */
  buildGradientCSS(spread: OklchTuple[], x: number = 50, y: number = 50): string {
    const colors = spread.map(oklchToString).join(', ');
    return `radial-gradient(circle at ${x}% ${y}%, ${colors})`;
  }

  // ============================================================================
  // Legacy getters (for backwards compatibility)
  // ============================================================================

  get _getTheme() {
    return gradient.getStandardTheme(this.themeIsDark);
  }

  get animatedTheme() {
    return this._getTheme;
  }

  // ============================================================================
  // ThemeToggle Controllers
  // ============================================================================

  get toggleAnimations() {
    return {
      path: this.pathController?.springs ?? {},
      switch: this.switchController?.springs ?? {},
      background: this.backgroundController?.springs ?? {},
      glow: this.glowController?.springs ?? {},
    };
  }

  setToggleControllers = () => {
    try {
      this.pathController = createController(
        'themeTogglePath',
        {
          sunOpacity: this.themeIsDark ? 0 : 1,
          moonOpacity: this.themeIsDark ? 1 : 0,
          sunScale: this.themeIsDark ? 0.5 : 1,
          moonScale: this.themeIsDark ? 1 : 0.5,
          sunRotate: this.themeIsDark ? -180 : 0,
          moonRotate: this.themeIsDark ? 0 : 180,
        },
        { config: toggleAnimationConfig.path }
      );

      this.switchController = createController(
        'themeToggleSwitch',
        { x: this.themeIsDark ? 0 : 28 },
        { config: toggleAnimationConfig.switch }
      );

      this.backgroundController = createController(
        'themeToggleBackground',
        { backgroundColor: this.themeIsDark ? '#1e293b' : '#fbbf24' },
        { config: toggleAnimationConfig.background }
      );

      this.glowController = createController(
        'themeToggleGlow',
        { glowIntensity: this.themeIsDark ? 0.4 : 0.6 },
        { config: toggleAnimationConfig.glow }
      );

      console.log('✨ ThemeToggle controllers initialized');
    } catch (error) {
      console.error('Failed to create toggle controllers:', error);
    }
  };

  // ============================================================================
  // Actions
  // ============================================================================

  toggleColorScheme = () => {
    console.log(this.colorScheme === DARK ? '🌙 → ☀️' : '☀️ → 🌙');
    this.colorScheme = !this.themeIsDark ? DARK : LIGHT;
  };

  setupReactions() {
    const themeDispose = reaction(
      () => [this.colorScheme],
      () => {
        this.animateThemeTransition();
        this.updateToggleAnimations();
        gradient.clearCache();
      },
      { fireImmediately: true }
    );

    this.disposers.push(themeDispose);
  }

  updateToggleAnimations = () => {
    this.pathController?.to({
      sunOpacity: this.themeIsDark ? 0 : 1,
      moonOpacity: this.themeIsDark ? 1 : 0,
      sunScale: this.themeIsDark ? 0.5 : 1,
      moonScale: this.themeIsDark ? 1 : 0.5,
      sunRotate: this.themeIsDark ? -180 : 0,
      moonRotate: this.themeIsDark ? 0 : 180,
    });

    this.switchController?.to({
      x: this.themeIsDark ? 0 : 28,
    });

    this.backgroundController?.to({
      backgroundColor: this.themeIsDark ? '#1e293b' : '#fbbf24',
    });

    this.glowController?.to({
      glowIntensity: this.themeIsDark ? 0.4 : 0.6,
    });
  };

  setSwitchSize = (size: 'sm' | 'md' | 'lg') => {
    const offsets = { sm: 24, md: 28, lg: 32 };
    this.switchController?.to({
      x: this.themeIsDark ? 0 : offsets[size],
    });
  };

  dispose = () => {
    this.isDisposed = true;
    this.disposers.forEach((dispose) => dispose());
    this.progressController?.dispose();
    this.pathController?.dispose();
    this.switchController?.dispose();
    this.backgroundController?.dispose();
    this.glowController?.dispose();
  };
}

// Singleton instance
export const themeStore = new ThemeStore({ colorScheme: DARK });
