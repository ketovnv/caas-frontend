import chroma from 'chroma-js';
import {
  type ThemeConfig,
  type OklchTuple,
  type GradientConfig,
  oklchToString,
  STANDART_DARK,
  STANDART_LIGHT,
  RED_GRADIENT_DARK,
  RED_GRADIENT_LIGHT,
  SPECTRAL_GRADIENT,
  RAINBOW_GRADIENT,
} from 'shared/config';

// ============================================================================
// Re-export types
// ============================================================================

export type { OklchTuple, GradientConfig, ThemeConfig };
export { oklchToString };

// ============================================================================
// Theme interface (rendered CSS strings)
// ============================================================================

export interface Theme {
  color: string;
  accentColor: string;
  background: string;
  buttonBackground: string;
  boxShadow: string;
  navBarButtonBackground: string;
  buttonStartColor: string;
  buttonStopColor: string;
  buttonTextColors: string[];
  buttonActiveTextColors: string[];
  navBarButtonTextColors: string[];
  navBarButtonActiveTextColors: string[];
  redGradientColors: string[];
}

// ============================================================================
// OKLCH Math Utilities
// ============================================================================

/**
 * Interpolate hue on the shortest path around the color wheel
 */
export function lerpHue(h1: number, h2: number, t: number): number {
  let diff = h2 - h1;

  // Shortest path around the wheel
  if (diff > 180) diff -= 360;
  else if (diff < -180) diff += 360;

  return ((h1 + diff * t) % 360 + 360) % 360;
}

/**
 * Interpolate between two OKLCH colors
 */
export function lerpOklch(c1: OklchTuple, c2: OklchTuple, t: number): OklchTuple {
  return [
    c1[0] + (c2[0] - c1[0]) * t,  // L - linear
    c1[1] + (c2[1] - c1[1]) * t,  // C - linear
    lerpHue(c1[2], c2[2], t),      // H - shortest path
  ];
}

/**
 * Interpolate between two arrays of OKLCH colors
 */
export function lerpOklchArrays(
  from: OklchTuple[],
  to: OklchTuple[],
  t: number
): OklchTuple[] {
  const length = Math.max(from.length, to.length);
  const result: OklchTuple[] = [];

  for (let i = 0; i < length; i++) {
    const c1 = from[i] || from[from.length - 1] || [0, 0, 0];
    const c2 = to[i] || to[to.length - 1] || [0, 0, 0];
    result.push(lerpOklch(c1 as OklchTuple, c2 as OklchTuple, t));
  }

  return result;
}

// ============================================================================
// Gradient Utilities Class
// ============================================================================

class GradientUtils {
  private gradientCache = new Map<string, string>();
  private spreadCache = new Map<string, OklchTuple[]>();

  // ---------------------------------------------------------------------------
  // Spread: expand colors to N steps (pure math, no chroma during animation)
  // ---------------------------------------------------------------------------

  /**
   * Spread colors to N steps using linear interpolation in OKLCH space.
   * This is the key function - call it ONCE to precompute, then animate between results.
   */
  spread(colors: OklchTuple[], steps: number = 128): OklchTuple[] {
    if (colors.length === 0) return [];
    if (colors.length === 1) return Array(steps).fill(colors[0]);

    const cacheKey = `spread_${JSON.stringify(colors)}_${steps}`;
    const cached = this.spreadCache.get(cacheKey);
    if (cached) return cached;

    const result: OklchTuple[] = [];
    const segments = colors.length - 1;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const segmentFloat = t * segments;
      const segmentIndex = Math.min(Math.floor(segmentFloat), segments - 1);
      const segmentT = segmentFloat - segmentIndex;

      const c1 = colors[segmentIndex]!;
      const c2 = colors[segmentIndex + 1]!;

      result.push(lerpOklch(c1, c2, segmentT));
    }

    this.spreadCache.set(cacheKey, result);
    return result;
  }

  /**
   * Spread colors and return as CSS strings
   */
  spreadStrings(colors: OklchTuple[], steps: number = 128): string[] {
    return this.spread(colors, steps).map(oklchToString);
  }

  // ---------------------------------------------------------------------------
  // CSS Gradient Generation
  // ---------------------------------------------------------------------------

  /**
   * Create CSS radial gradient from OKLCH colors
   */
  radialGradient(
    colors: OklchTuple[],
    x: number = 50,
    y: number = 50,
    steps: number = 128
  ): string {
    const cacheKey = `radial_${JSON.stringify(colors)}_${x}_${y}_${steps}`;
    const cached = this.gradientCache.get(cacheKey);
    if (cached) return cached;

    const spread = this.spreadStrings(colors, steps);
    const result = `radial-gradient(circle at ${x}% ${y}%, ${spread.join(', ')})`;

    this.gradientCache.set(cacheKey, result);
    return result;
  }

  /**
   * Create CSS radial gradient from GradientConfig
   */
  radialGradientFromConfig(config: GradientConfig): string {
    const [colors, x, y, steps] = config;
    return this.radialGradient(colors, x, y, steps);
  }

  /**
   * Create CSS linear gradient from OKLCH colors
   */
  linearGradient(
    colors: OklchTuple[],
    angle: number = 0,
    steps: number = 128
  ): string {
    const cacheKey = `linear_${JSON.stringify(colors)}_${angle}_${steps}`;
    const cached = this.gradientCache.get(cacheKey);
    if (cached) return cached;

    const spread = this.spreadStrings(colors, steps);
    const result = `linear-gradient(${angle}deg, ${spread.join(', ')})`;

    this.gradientCache.set(cacheKey, result);
    return result;
  }

  /**
   * Create CSS conic gradient from OKLCH colors
   */
  conicGradient(
    colors: OklchTuple[],
    fromAngle: number = 0,
    x: number = 50,
    y: number = 50,
    steps: number = 128
  ): string {
    const spread = this.spreadStrings(colors, steps);
    return `conic-gradient(from ${fromAngle}deg at ${x}% ${y}%, ${spread.join(', ')})`;
  }

  // ---------------------------------------------------------------------------
  // Theme System
  // ---------------------------------------------------------------------------

  /**
   * Get rendered theme (CSS strings) from config
   */
  getTheme(config: ThemeConfig): Theme {
    const background = this.radialGradientFromConfig(config.backgroundGradient);
    const buttonBackground = this.radialGradientFromConfig(config.buttonGradient);

    return {
      color: oklchToString(config.color),
      accentColor: oklchToString(config.accentColor),
      background,
      buttonBackground,
      boxShadow: config.boxShadow,
      navBarButtonBackground: oklchToString(config.navBarButtonBackground),
      buttonStartColor: oklchToString(config.buttonGradient[0][0]!),
      buttonStopColor: oklchToString(config.buttonGradient[0][3] ?? config.buttonGradient[0][0]!),
      buttonTextColors: config.buttonTextColors.map(oklchToString),
      buttonActiveTextColors: config.buttonActiveTextColors.map(oklchToString),
      navBarButtonTextColors: config.navBarButtonTextColors.map(oklchToString),
      navBarButtonActiveTextColors: config.navBarButtonActiveTextColors.map(oklchToString),
      redGradientColors: (config === STANDART_DARK ? RED_GRADIENT_DARK : RED_GRADIENT_LIGHT).map(oklchToString),
    };
  }

  /**
   * Get standard theme by isDark flag
   */
  getStandardTheme(isDark: boolean): Theme {
    return this.getTheme(isDark ? STANDART_DARK : STANDART_LIGHT);
  }

  /**
   * Get raw theme config
   */
  getThemeConfig(isDark: boolean): ThemeConfig {
    return isDark ? STANDART_DARK : STANDART_LIGHT;
  }

  /**
   * Get precomputed spread colors for theme animation
   */
  getThemeSpread(isDark: boolean, steps: number = 128) {
    const config = this.getThemeConfig(isDark);
    return {
      background: this.spread(config.backgroundGradient[0], steps),
      button: this.spread(config.buttonGradient[0], steps),
    };
  }

  // ---------------------------------------------------------------------------
  // Color Conversion (uses chroma for parsing external colors)
  // ---------------------------------------------------------------------------

  /**
   * Parse any color string to OKLCH tuple
   */
  parseToOklch(color: string): OklchTuple {
    try {
      const [l, c, h] = chroma(color).oklch();
      return [l || 0, c || 0, isNaN(h) ? 0 : h];
    } catch {
      console.warn(`Failed to parse color: ${color}`);
      return [0, 0, 0];
    }
  }

  /**
   * Parse array of color strings to OKLCH tuples
   */
  parseArrayToOklch(colors: string[]): OklchTuple[] {
    return colors.map(c => this.parseToOklch(c));
  }

  /**
   * Convert OKLCH tuple to hex
   */
  toHex(color: OklchTuple): string {
    return chroma.oklch(...color).hex();
  }

  // ---------------------------------------------------------------------------
  // Cache Management
  // ---------------------------------------------------------------------------

  clearCache(): void {
    this.gradientCache.clear();
    this.spreadCache.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const gradient = new GradientUtils();

// ============================================================================
// Re-exports for convenience
// ============================================================================

export {
  STANDART_DARK,
  STANDART_LIGHT,
  RED_GRADIENT_DARK,
  RED_GRADIENT_LIGHT,
  SPECTRAL_GRADIENT,
  RAINBOW_GRADIENT,
};
