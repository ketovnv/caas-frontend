import { Controller, type SpringConfig, to, type Interpolation } from '@react-spring/core';
import { DEFAULT_SPRING_CONFIG, type OklchTuple } from './gradient';

// ============================================================================
// Types
// ============================================================================

export type { SpringConfig };

/** Icon animation state */
export interface IconState {
  // Transform
  scale: number;
  rotate: number;
  x: number;
  y: number;
  // Opacity
  opacity: number;
  // Primary fill color (OKLCH)
  fillL: number;
  fillC: number;
  fillH: number;
  // Secondary fill color (OKLCH)
  fill2L: number;
  fill2C: number;
  fill2H: number;
  // Stroke color (OKLCH)
  strokeL: number;
  strokeC: number;
  strokeH: number;
  // Stroke width
  strokeWidth: number;
}

/** Preset for icon state */
export interface IconPreset {
  scale?: number;
  rotate?: number;
  x?: number;
  y?: number;
  opacity?: number;
  fill?: OklchTuple;
  fill2?: OklchTuple;
  stroke?: OklchTuple;
  strokeWidth?: number;
}

/** Promise that resolves when animation completes */
type SpringResult = Promise<void>;

// ============================================================================
// Utils
// ============================================================================

const asVoid = <T>(p: Promise<T>): SpringResult => p.then(() => {});

const normalizeHue = (h: number) => ((h % 360) + 360) % 360;

const shortestHuePath = (from: number, to: number): number => {
  const diff = normalizeHue(to) - normalizeHue(from);
  if (diff > 180) return to - 360;
  if (diff < -180) return to + 360;
  return to;
};

const formatOklch = (l: number, c: number, h: number): string =>
  `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`;

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FILL: OklchTuple = [0.9, 0.01, 0];      // Near white
const DEFAULT_STROKE: OklchTuple = [0.3, 0.01, 0];    // Dark gray

export const ICON_IDLE: IconPreset = {
  scale: 1,
  rotate: 0,
  x: 0,
  y: 0,
  opacity: 1,
  fill: DEFAULT_FILL,
  fill2: DEFAULT_FILL,
  stroke: DEFAULT_STROKE,
  strokeWidth: 0,
};

export const ICON_HOVER: IconPreset = {
  scale: 1.1,
};

export const ICON_PRESSED: IconPreset = {
  scale: 0.95,
};

export const ICON_PULSE_CONFIG: SpringConfig = {
  tension: 300,
  friction: 10,
  mass: 1,
};

export const ICON_SMOOTH_CONFIG: SpringConfig = {
  tension: 170,
  friction: 26,
  mass: 1,
};

// ============================================================================
// IconSpring - Single icon animation controller
// ============================================================================

export class IconSpring {
  private ctrl: Controller<IconState>;
  private config: SpringConfig;

  // Cached interpolations
  readonly transform: Interpolation<string>;
  readonly fill: Interpolation<string>;
  readonly fill2: Interpolation<string>;
  readonly stroke: Interpolation<string>;
  readonly opacity: Interpolation<number>;
  readonly strokeWidth: Interpolation<number>;

  constructor(
    initial: IconPreset = ICON_IDLE,
    config: SpringConfig = DEFAULT_SPRING_CONFIG
  ) {
    this.config = config;

    const fill = initial.fill ?? DEFAULT_FILL;
    const fill2 = initial.fill2 ?? DEFAULT_FILL;
    const strokeColor = initial.stroke ?? DEFAULT_STROKE;

    this.ctrl = new Controller({
      scale: initial.scale ?? 1,
      rotate: initial.rotate ?? 0,
      x: initial.x ?? 0,
      y: initial.y ?? 0,
      opacity: initial.opacity ?? 1,
      fillL: fill[0],
      fillC: fill[1],
      fillH: fill[2],
      fill2L: fill2[0],
      fill2C: fill2[1],
      fill2H: fill2[2],
      strokeL: strokeColor[0],
      strokeC: strokeColor[1],
      strokeH: strokeColor[2],
      strokeWidth: initial.strokeWidth ?? 0,
      config,
    });

    const s = this.ctrl.springs;

    // Create cached interpolations
    this.transform = to(
      [s.scale, s.rotate, s.x, s.y],
      (scale, rotate, x, y) =>
        `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`
    );

    this.fill = to(
      [s.fillL, s.fillC, s.fillH],
      (l, c, h) => formatOklch(l, c, h)
    );

    this.fill2 = to(
      [s.fill2L, s.fill2C, s.fill2H],
      (l, c, h) => formatOklch(l, c, h)
    );

    this.stroke = to(
      [s.strokeL, s.strokeC, s.strokeH],
      (l, c, h) => formatOklch(l, c, h)
    );

    // Create interpolations for opacity and strokeWidth
    this.opacity = to([s.opacity], (o) => o);
    this.strokeWidth = to([s.strokeWidth], (sw) => sw);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Methods
  // ─────────────────────────────────────────────────────────────────────────

  /** Animate to a preset */
  animateTo(preset: IconPreset, config?: SpringConfig): SpringResult {
    const s = this.ctrl.springs;
    const updates: Partial<IconState> & { config?: SpringConfig } = {
      config: config ?? this.config,
    };

    if (preset.scale !== undefined) updates.scale = preset.scale;
    if (preset.rotate !== undefined) updates.rotate = preset.rotate;
    if (preset.x !== undefined) updates.x = preset.x;
    if (preset.y !== undefined) updates.y = preset.y;
    if (preset.opacity !== undefined) updates.opacity = preset.opacity;
    if (preset.strokeWidth !== undefined) updates.strokeWidth = preset.strokeWidth;

    if (preset.fill) {
      updates.fillL = preset.fill[0];
      updates.fillC = preset.fill[1];
      updates.fillH = shortestHuePath(s.fillH.get(), preset.fill[2]);
    }

    if (preset.fill2) {
      updates.fill2L = preset.fill2[0];
      updates.fill2C = preset.fill2[1];
      updates.fill2H = shortestHuePath(s.fill2H.get(), preset.fill2[2]);
    }

    if (preset.stroke) {
      updates.strokeL = preset.stroke[0];
      updates.strokeC = preset.stroke[1];
      updates.strokeH = shortestHuePath(s.strokeH.get(), preset.stroke[2]);
    }

    return asVoid(this.ctrl.start(updates));
  }

  /** Set state instantly (no animation) */
  set(preset: IconPreset): void {
    const updates: Partial<IconState> = {};

    if (preset.scale !== undefined) updates.scale = preset.scale;
    if (preset.rotate !== undefined) updates.rotate = preset.rotate;
    if (preset.x !== undefined) updates.x = preset.x;
    if (preset.y !== undefined) updates.y = preset.y;
    if (preset.opacity !== undefined) updates.opacity = preset.opacity;
    if (preset.strokeWidth !== undefined) updates.strokeWidth = preset.strokeWidth;

    if (preset.fill) {
      updates.fillL = preset.fill[0];
      updates.fillC = preset.fill[1];
      updates.fillH = preset.fill[2];
    }

    if (preset.fill2) {
      updates.fill2L = preset.fill2[0];
      updates.fill2C = preset.fill2[1];
      updates.fill2H = preset.fill2[2];
    }

    if (preset.stroke) {
      updates.strokeL = preset.stroke[0];
      updates.strokeC = preset.stroke[1];
      updates.strokeH = preset.stroke[2];
    }

    this.ctrl.set(updates);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Convenience Methods
  // ─────────────────────────────────────────────────────────────────────────

  /** Scale animation */
  scaleTo(scale: number, config?: SpringConfig): SpringResult {
    return this.animateTo({ scale }, config);
  }

  /** Rotate animation */
  rotateTo(rotate: number, config?: SpringConfig): SpringResult {
    return this.animateTo({ rotate }, config);
  }

  /** Move animation */
  moveTo(x: number, y: number, config?: SpringConfig): SpringResult {
    return this.animateTo({ x, y }, config);
  }

  /** Fade animation */
  fadeTo(opacity: number, config?: SpringConfig): SpringResult {
    return this.animateTo({ opacity }, config);
  }

  /** Fill color animation */
  fillTo(fill: OklchTuple, config?: SpringConfig): SpringResult {
    return this.animateTo({ fill }, config);
  }

  /** Stroke color animation */
  strokeTo(stroke: OklchTuple, config?: SpringConfig): SpringResult {
    return this.animateTo({ stroke }, config);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Preset Animations
  // ─────────────────────────────────────────────────────────────────────────

  /** Hover state */
  hover(config?: SpringConfig): SpringResult {
    return this.animateTo(ICON_HOVER, config ?? ICON_SMOOTH_CONFIG);
  }

  /** Pressed state */
  press(config?: SpringConfig): SpringResult {
    return this.animateTo(ICON_PRESSED, config ?? ICON_PULSE_CONFIG);
  }

  /** Reset to idle */
  reset(config?: SpringConfig): SpringResult {
    return this.animateTo(ICON_IDLE, config);
  }

  /** Pulse animation (scale up then back) */
  async pulse(config?: SpringConfig): Promise<void> {
    await this.animateTo({ scale: 1.2 }, config ?? ICON_PULSE_CONFIG);
    await this.animateTo({ scale: 1 }, config ?? ICON_PULSE_CONFIG);
  }

  /** Shake animation */
  async shake(config?: SpringConfig): Promise<void> {
    const shakeConfig = config ?? { tension: 400, friction: 10 };
    await this.animateTo({ rotate: 10 }, shakeConfig);
    await this.animateTo({ rotate: -10 }, shakeConfig);
    await this.animateTo({ rotate: 5 }, shakeConfig);
    await this.animateTo({ rotate: -5 }, shakeConfig);
    await this.animateTo({ rotate: 0 }, shakeConfig);
  }

  /** Spin animation (continuous) */
  spin(duration: number = 1000): void {
    this.ctrl.start({
      rotate: 360,
      config: { duration },
      loop: true,
      reset: true,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────────────────

  /** Get springs for direct access */
  get springs() {
    return this.ctrl.springs;
  }

  /** Get current scale value */
  get currentScale(): number {
    return this.ctrl.springs.scale.get();
  }

  /** Get current rotation value */
  get currentRotate(): number {
    return this.ctrl.springs.rotate.get();
  }

  /** Get style object for animated.svg */
  get style() {
    return {
      transform: this.transform,
      opacity: this.opacity,
    };
  }

  /** Get fill style for animated.path */
  get fillStyle() {
    return { fill: this.fill };
  }

  /** Get stroke style for animated.path */
  get strokeStyle() {
    return {
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  stop(): void {
    this.ctrl.stop();
  }

  dispose(): void {
    this.ctrl.stop();
  }
}

// ============================================================================
// MultiIconSpring - Multiple paths in one icon
// ============================================================================

export class MultiIconSpring {
  private icons: IconSpring[];

  constructor(
    count: number,
    initial: IconPreset = ICON_IDLE,
    config: SpringConfig = DEFAULT_SPRING_CONFIG
  ) {
    this.icons = Array.from({ length: count }, () => new IconSpring(initial, config));
  }

  /** Get icon by index */
  get(index: number): IconSpring {
    return this.icons[index]!;
  }

  /** Get all icons */
  get all(): IconSpring[] {
    return this.icons;
  }

  /** Number of icons */
  get length(): number {
    return this.icons.length;
  }

  /** Animate all to same preset */
  animateAll(preset: IconPreset, config?: SpringConfig): SpringResult {
    return Promise.all(
      this.icons.map(icon => icon.animateTo(preset, config))
    ).then(() => {});
  }

  /** Animate with stagger (trail effect) */
  async stagger(preset: IconPreset, delay: number = 50, config?: SpringConfig): Promise<void> {
    for (const icon of this.icons) {
      icon.animateTo(preset, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /** Set all instantly */
  setAll(preset: IconPreset): void {
    this.icons.forEach(icon => icon.set(preset));
  }

  /** Reset all to idle */
  resetAll(config?: SpringConfig): SpringResult {
    return this.animateAll(ICON_IDLE, config);
  }

  stop(): void {
    this.icons.forEach(icon => icon.stop());
  }

  dispose(): void {
    this.icons.forEach(icon => icon.dispose());
  }
}

// ============================================================================
// Preset Colors (OKLCH)
// ============================================================================

export const ICON_COLORS = {
  // Grayscale
  white: [0.99, 0.01, 0] as OklchTuple,
  lightGray: [0.8, 0.01, 0] as OklchTuple,
  gray: [0.6, 0.01, 0] as OklchTuple,
  darkGray: [0.4, 0.01, 0] as OklchTuple,
  black: [0.15, 0.01, 0] as OklchTuple,

  // Brand colors
  google: [0.63, 0.22, 264] as OklchTuple,      // Blue
  facebook: [0.51, 0.18, 264] as OklchTuple,    // Blue
  twitter: [0.9, 0.01, 0] as OklchTuple,        // White/Black
  discord: [0.58, 0.19, 284] as OklchTuple,     // Purple

  // Crypto colors
  ethereum: [0.65, 0.12, 265] as OklchTuple,    // Blue-purple
  tron: [0.55, 0.22, 25] as OklchTuple,         // Red
  bitcoin: [0.75, 0.18, 70] as OklchTuple,      // Orange
  usdt: [0.7, 0.18, 165] as OklchTuple,         // Green

  // UI colors
  violet: [0.6, 0.24, 290] as OklchTuple,
  emerald: [0.7, 0.18, 165] as OklchTuple,
  amber: [0.8, 0.16, 80] as OklchTuple,
  rose: [0.65, 0.22, 10] as OklchTuple,
  cyan: [0.75, 0.14, 200] as OklchTuple,
} as const;
