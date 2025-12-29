import { Controller, to, SpringValue, Interpolation } from '@react-spring/core';
import { makeAutoObservable, runInAction } from 'mobx';
import { themeStore, core } from 'shared/model';
import {
  gentleSpring,
  spotlightSpring,
  INPUT_IDLE,
  INPUT_TYPING,
  INPUT_HOVERED,
  INPUT_UNHOVERED,
  INPUT_FOCUSED,
  INPUT_BLURRED,
  INPUT_VANISHING,
  INPUT_AFTER_VANISH,
  DEFAULT_SPOTLIGHT_RADIUS,
  DEFAULT_MOUSE_POSITION,
  CANVAS_SIZE,
  PARTICLE_FONT_SCALE,
  TEXT_OFFSET_X,
  TEXT_OFFSET_Y,
  SWEEP_SPEED,
  PARTICLE_DECAY_RATE,
  PLACEHOLDER_INTERVAL,
  REFOCUS_DELAY,
  ANIMATION_END_DELAY,
  type AnimatedInputState,
} from './animated-input.config';

// ============================================================================
// Types
// ============================================================================

interface PixelData {
  x: number;
  y: number;
  color: string;
  r: number;
}

// ============================================================================
// AnimatedInput Controller (Spotlight + Vanish + MobX)
// ============================================================================

export class AnimatedInputController {
  // ─────────────────────────────────────────────────────────────────────────
  // MobX Observable State
  // ─────────────────────────────────────────────────────────────────────────

  value = '';
  animating = false;
  currentPlaceholder = 0;
  isHovered = false;
  isFocused = false;

  // Non-observable - updated directly on DOM via CSS custom properties
  private _mouseX = DEFAULT_MOUSE_POSITION;
  private _mouseY = DEFAULT_MOUSE_POSITION;

  // ─────────────────────────────────────────────────────────────────────────
  // Internal State (not observable)
  // ─────────────────────────────────────────────────────────────────────────

  private ctrl: Controller<AnimatedInputState>;
  private pixels: PixelData[] = [];
  private rafId: number | undefined;
  private placeholderInterval: ReturnType<typeof setInterval> | undefined;
  private placeholders: string[] = [];
  private _spotlightRadius: number;
  private _spotlightColor: string;
  private _particleColor: string;

  // Numeric stepper options
  private _step: number;
  private _min: number;
  private _max: number;

  // Animated numeric value
  private _numericSpring: SpringValue<number>;

  // Cached interpolations (created once, not on every render)
  private _spotlightBackgroundInterpolation: Interpolation<number, string> | null = null;

  // Throttle for mouse move (RAF-based)
  private _mouseMoveScheduled = false;
  private _pendingMouseX = DEFAULT_MOUSE_POSITION;
  private _pendingMouseY = DEFAULT_MOUSE_POSITION;

  // ─────────────────────────────────────────────────────────────────────────
  // Refs (set from component)
  // ─────────────────────────────────────────────────────────────────────────

  containerElement: HTMLDivElement | null = null;
  inputElement: HTMLInputElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;

  constructor(options: {
    placeholders?: string[];
    spotlightRadius?: number;
    spotlightColor?: string;
    particleColor?: string;
    step?: number;
    min?: number;
    max?: number;
  } = {}) {
    this.placeholders = options.placeholders ?? ['Type something...'];
    this._spotlightRadius = options.spotlightRadius ?? DEFAULT_SPOTLIGHT_RADIUS;
    // Use themeStore accentColor as default for spotlight and particles
    this._spotlightColor = options.spotlightColor ?? themeStore.accentColor.currentValue;
    this._particleColor = options.particleColor ?? themeStore.accentColor.currentValue;
    this._step = options.step ?? 1;
    this._min = options.min ?? -Infinity;
    this._max = options.max ?? Infinity;

    // Initialize numeric spring for animated counter
    this._numericSpring = new SpringValue(0, {
      config: { tension: 300, friction: 30 },
    });

    this.ctrl = new Controller({
      ...INPUT_IDLE,
      config: gentleSpring,
    });

    makeAutoObservable<
      this,
      'ctrl' | 'pixels' | 'rafId' | 'placeholderInterval' | 'placeholders' | '_spotlightRadius' | '_spotlightColor' | '_particleColor' | '_step' | '_min' | '_max' | '_numericSpring' | '_mouseX' | '_mouseY' | '_spotlightBackgroundInterpolation' | '_mouseMoveScheduled' | '_pendingMouseX' | '_pendingMouseY'
    >(
      this,
      {
        ctrl: false,
        pixels: false,
        rafId: false,
        placeholderInterval: false,
        placeholders: false,
        _spotlightRadius: false,
        _spotlightColor: false,
        _particleColor: false,
        _step: false,
        _min: false,
        _max: false,
        _numericSpring: false,
        _mouseX: false,
        _mouseY: false,
        _spotlightBackgroundInterpolation: false,
        _mouseMoveScheduled: false,
        _pendingMouseX: false,
        _pendingMouseY: false,
        containerElement: false,
        inputElement: false,
        canvasElement: false,
      },
      { autoBind: true }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────

  get hasValue() {
    return this.value.length > 0;
  }

  get canSubmit() {
    return this.hasValue && !this.animating;
  }

  get currentPlaceholderText() {
    return this.placeholders[this.currentPlaceholder] ?? '';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Values (React Spring)
  // ─────────────────────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  // Placeholder
  get placeholderOpacity() {
    return this.ctrl.springs.placeholderOpacity;
  }

  get placeholderTransform() {
    return this.ctrl.springs.placeholderY.to((y) => `translateY(${y}px)`);
  }

  // Arrow
  get arrowDashoffset() {
    return this.ctrl.springs.arrowDashoffset.to((v) => (v / 50) * 14);
  }

  // Canvas
  get canvasOpacity() {
    return this.ctrl.springs.canvasOpacity;
  }

  // Spotlight - uses CSS custom properties for mouse position (no re-renders)
  // Cached interpolation to avoid creating new one on every render
  get spotlightBackground() {
    if (!this._spotlightBackgroundInterpolation) {
      this._spotlightBackgroundInterpolation = this.ctrl.springs.spotlightRadius.to(
        (r) => `radial-gradient(${r}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${this._spotlightColor}, transparent 80%)`
      );
    }
    return this._spotlightBackgroundInterpolation;
  }

  // Focus glow (uses accent color from theme)
  get focusBoxShadow() {
    return to(
      [this.ctrl.springs.shadowSpread, this.ctrl.springs.borderOpacity],
      (spread, opacity) =>
        `0 0 ${spread}px ${spread / 2}px color-mix(in oklch, ${themeStore.accentColor.currentValue} ${opacity * 30}%, transparent)`
    );
  }

  // Animated integer part only (for display) - uses Math.trunc to avoid rounding issues
  get animatedIntegerValue() {
    return this._numericSpring.to((v) => String(Math.trunc(v)));
  }

  // Static decimal part from actual value (e.g., ".45" from "123.45")
  get staticDecimalPart(): string {
    const dotIndex = this.value.indexOf('.');
    if (dotIndex === -1) return '';
    return this.value.slice(dotIndex);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  setValue(value: string, numeric = false) {
    if (numeric) {
      // Allow only digits, dot, and minus for numeric input
      const filtered = value.replace(/[^0-9.-]/g, '');
      // Prevent multiple dots or minuses
      const parts = filtered.split('.');
      const cleanValue = parts.length > 2
        ? parts[0] + '.' + parts.slice(1).join('')
        : filtered;
      this.value = cleanValue.replace(/(?!^)-/g, ''); // minus only at start

      // Update numeric spring for keyboard input
      const numValue = parseFloat(this.value) || 0;
      this._numericSpring.set(numValue); // instant update for typing
    } else {
      this.value = value;
    }
    this.updatePlaceholderAnimation();
  }

  clear() {
    this.value = '';
    this.ctrl.start({
      ...INPUT_IDLE,
      config: gentleSpring,
    });
  }

  focus() {
    this.inputElement?.focus();
  }

  blur() {
    this.inputElement?.blur();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Numeric Stepper
  // ─────────────────────────────────────────────────────────────────────────

  increment() {
    const current = parseFloat(this.value) || 0;
    const next = Math.min(current + this._step, this._max);
    this.setNumericValue(next);
  }

  decrement() {
    const current = parseFloat(this.value) || 0;
    const next = Math.max(current - this._step, this._min);
    this.setNumericValue(next);
  }

  add(amount: number) {
    const current = parseFloat(this.value) || 0;
    const next = amount > 0
      ? Math.min(current + amount, this._max)
      : Math.max(current + amount, this._min);
    this.setNumericValue(next);
  }

  private setNumericValue(num: number) {
    this.value = this.formatNumericValue(num);
    this._numericSpring.start(num);
    this.updatePlaceholderAnimation();
  }

  private formatNumericValue(num: number): string {
    // Remove trailing zeros for cleaner display
    return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mouse Events (Spotlight)
  // ─────────────────────────────────────────────────────────────────────────

  onMouseMove(clientX: number, clientY: number) {
    if (!this.containerElement) return;

    // Store pending values
    const { left, top, width, height } = this.containerElement.getBoundingClientRect();
    this._pendingMouseX = ((clientX - left) / width) * 100;
    this._pendingMouseY = ((clientY - top) / height) * 100;

    // Use CoreStore's central loop for synchronized updates
    if (this._mouseMoveScheduled) return;
    this._mouseMoveScheduled = true;

    core.scheduleWrite(() => {
      this._mouseX = this._pendingMouseX;
      this._mouseY = this._pendingMouseY;
      // Update CSS custom properties directly - no React re-render needed
      this.containerElement?.style.setProperty('--mouse-x', `${this._mouseX}%`);
      this.containerElement?.style.setProperty('--mouse-y', `${this._mouseY}%`);
      this._mouseMoveScheduled = false;
    });
  }

  onMouseEnter() {
    this.isHovered = true;
    this.ctrl.start({
      spotlightRadius: this._spotlightRadius,
      ...INPUT_HOVERED,
      config: spotlightSpring,
    });
  }

  onMouseLeave() {
    this.isHovered = false;
    this.ctrl.start({
      ...INPUT_UNHOVERED,
      config: spotlightSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Focus Events
  // ─────────────────────────────────────────────────────────────────────────

  onFocus() {
    this.isFocused = true;
    this.ctrl.start({
      ...INPUT_FOCUSED,
      config: spotlightSpring,
    });
  }

  onBlur() {
    this.isFocused = false;
    this.ctrl.start({
      ...INPUT_BLURRED,
      config: spotlightSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Placeholder Rotation
  // ─────────────────────────────────────────────────────────────────────────

  startPlaceholderRotation() {
    if (this.placeholders.length <= 1) return;
    this.placeholderInterval = setInterval(() => {
      runInAction(() => {
        this.currentPlaceholder = (this.currentPlaceholder + 1) % this.placeholders.length;
      });
    }, PLACEHOLDER_INTERVAL);
  }

  stopPlaceholderRotation() {
    if (this.placeholderInterval) {
      clearInterval(this.placeholderInterval);
      this.placeholderInterval = undefined;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Placeholder Animation
  // ─────────────────────────────────────────────────────────────────────────

  private updatePlaceholderAnimation() {
    if (this.hasValue) {
      this.ctrl.start({
        ...INPUT_TYPING,
        config: gentleSpring,
      });
    } else {
      this.ctrl.start({
        placeholderOpacity: INPUT_IDLE.placeholderOpacity,
        placeholderY: INPUT_IDLE.placeholderY,
        arrowDashoffset: INPUT_IDLE.arrowDashoffset,
        config: gentleSpring,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Submit with Vanish Effect
  // ─────────────────────────────────────────────────────────────────────────

  async submit(onSubmit?: (value: string) => void): Promise<void> {
    if (!this.canSubmit) return;

    runInAction(() => {
      this.animating = true;
    });

    // 1. Extract pixels
    this.extractPixels();

    // 2. Instant switch: text becomes transparent via CSS, show canvas
    this.ctrl.set({
      ...INPUT_VANISHING,
    });

    // 3. Run particle animation
    await this.runParticleAnimation();

    // Callback with value
    const submittedValue = this.value;

    runInAction(() => {
      this.animating = false;
      this.value = '';
    });

    // Reset springs
    this.ctrl.set({
      ...INPUT_AFTER_VANISH,
    });

    onSubmit?.(submittedValue);

    // Refocus after short delay
    setTimeout(() => this.focus(), REFOCUS_DELAY);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Particle Effect
  // ─────────────────────────────────────────────────────────────────────────

  private extractPixels() {
    const input = this.inputElement;
    const canvas = this.canvasElement;
    if (!input || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(input);
    const fontSize = parseFloat(styles.fontSize);

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.font = `${fontSize * PARTICLE_FONT_SCALE}px ${styles.fontFamily}`;
    ctx.fillStyle = this._particleColor;
    ctx.fillText(this.value, TEXT_OFFSET_X, TEXT_OFFSET_Y);

    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    this.pixels = [];

    for (let y = 0; y < CANVAS_SIZE; y++) {
      const i = 4 * y * CANVAS_SIZE;
      for (let x = 0; x < CANVAS_SIZE; x++) {
        const e = i + 4 * x;
        const r = imageData.data[e] ?? 0;
        const g = imageData.data[e + 1] ?? 0;
        const b = imageData.data[e + 2] ?? 0;
        if (r !== 0 && g !== 0 && b !== 0) {
          this.pixels.push({
            x,
            y,
            r: 1,
            color: `rgba(${r}, ${g}, ${b}, ${imageData.data[e + 3]})`,
          });
        }
      }
    }
  }

  private runParticleAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const maxX = Math.max(...this.pixels.map((p) => p.x), 0);
      let start = maxX;

      const animate = () => {
        const canvas = this.canvasElement;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) {
          resolve();
          return;
        }

        ctx.clearRect(start, 0, CANVAS_SIZE, CANVAS_SIZE);

        const newPixels: PixelData[] = [];

        for (const pixel of this.pixels) {
          if (pixel.x < start) {
            newPixels.push(pixel);
          } else {
            if (pixel.r <= 0) continue;
            pixel.x += Math.random() > 0.5 ? 1 : -1;
            pixel.y += Math.random() > 0.5 ? 1 : -1;
            pixel.r -= PARTICLE_DECAY_RATE * Math.random();
            newPixels.push(pixel);
          }
        }

        this.pixels = newPixels;

        for (const { x, y, r, color } of this.pixels) {
          if (x > start) {
            ctx.beginPath();
            ctx.rect(x, y, r, r);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        }

        if (this.pixels.length > 0) {
          start -= SWEEP_SPEED;
          this.rafId = requestAnimationFrame(animate);
        } else {
          setTimeout(resolve, ANIMATION_END_DELAY);
        }
      };

      this.rafId = requestAnimationFrame(animate);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  dispose() {
    this.stopPlaceholderRotation();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this._mouseMoveScheduled = false;
    this.ctrl.stop();
  }
}
