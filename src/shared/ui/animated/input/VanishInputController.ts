import { Controller } from '@react-spring/core';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  gentleSpring,
  VANISH_IDLE,
  VANISH_TYPING,
  VANISH_ANIMATING,
  VANISH_AFTER,
  CANVAS_SIZE,
  PARTICLE_FONT_SCALE,
  TEXT_OFFSET_X,
  TEXT_OFFSET_Y,
  SWEEP_SPEED,
  PARTICLE_DECAY_RATE,
  PLACEHOLDER_INTERVAL,
  REFOCUS_DELAY,
  ANIMATION_END_DELAY,
  type VanishInputState,
} from './vanish-input.config';

// ============================================================================
// Types
// ============================================================================

interface PixelData {
  x: number;
  y: number;
  color: string;
  r: number;
  vx: number;
  vy: number;
}

// ============================================================================
// VanishInput Controller (with MobX state)
// ============================================================================

export class VanishInputController {
  // ─────────────────────────────────────────────────────────────────────────
  // MobX Observable State
  // ─────────────────────────────────────────────────────────────────────────

  value = '';
  animating = false;
  currentPlaceholder = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Internal State (not observable)
  // ─────────────────────────────────────────────────────────────────────────

  private ctrl: Controller<VanishInputState>;
  private pixels: PixelData[] = [];
  private rafId: number | undefined;
  private placeholderInterval: ReturnType<typeof setInterval> | undefined;
  private placeholders: string[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // Refs (set from component)
  // ─────────────────────────────────────────────────────────────────────────

  inputElement: HTMLInputElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;

  constructor(placeholders: string[] = ['Type something...']) {
    this.placeholders = placeholders;

    this.ctrl = new Controller({
      ...VANISH_IDLE,
      config: gentleSpring,
    });

    // Make observable, excluding private/internal properties
    makeAutoObservable<this, 'ctrl' | 'pixels' | 'rafId' | 'placeholderInterval' | 'placeholders'>(
      this,
      {
        ctrl: false,
        pixels: false,
        rafId: false,
        placeholderInterval: false,
        placeholders: false,
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

  get placeholderOpacity() {
    return this.ctrl.springs.placeholderOpacity;
  }

  get placeholderTransform() {
    return this.ctrl.springs.placeholderY.to((y) => `translateY(${y}px)`);
  }

  get arrowDashoffset() {
    return this.ctrl.springs.arrowDashoffset.to((v) => (v / 50) * 14);
  }

  get canvasOpacity() {
    return this.ctrl.springs.canvasOpacity;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  setValue(value: string) {
    this.value = value;
    this.updatePlaceholderAnimation();
  }

  clear() {
    this.value = '';
    this.ctrl.start({
      ...VANISH_IDLE,
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
  // Placeholder Rotation
  // ─────────────────────────────────────────────────────────────────────────

  startPlaceholderRotation() {
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
  // Animation Methods
  // ─────────────────────────────────────────────────────────────────────────

  private updatePlaceholderAnimation() {
    if (this.hasValue) {
      this.ctrl.start({
        ...VANISH_TYPING,
        config: gentleSpring,
      });
    } else {
      this.ctrl.start({
        ...VANISH_IDLE,
        config: gentleSpring,
      });
    }
  }

  async submit(onSubmit?: (value: string) => void, particleColor?: string): Promise<void> {
    if (!this.canSubmit) return;

    runInAction(() => {
      this.animating = true;
    });

    // 1. Extract pixels (at 2x size for better visibility)
    this.extractPixels(particleColor);

    // 2. Instant switch: text becomes transparent via CSS, show canvas
    this.ctrl.set({
      ...VANISH_ANIMATING,
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
      ...VANISH_AFTER,
    });

    onSubmit?.(submittedValue);

    // Refocus after short delay
    setTimeout(() => this.focus(), REFOCUS_DELAY);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Particle Effect
  // ─────────────────────────────────────────────────────────────────────────

  private extractPixels(particleColor?: string) {
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

    // 2x font size for better particle visibility (like Inspira UI)
    ctx.font = `${fontSize * PARTICLE_FONT_SCALE}px ${styles.fontFamily}`;
    ctx.fillStyle = particleColor || '#fff';
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
            color: particleColor || `rgba(${r}, ${g}, ${b}, ${imageData.data[e + 3]})`,
            vx: 0,
            vy: 0,
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

        // Clear from sweep position to the right
        ctx.clearRect(start, 0, CANVAS_SIZE, CANVAS_SIZE);

        const newPixels: PixelData[] = [];

        for (const pixel of this.pixels) {
          if (pixel.x < start) {
            // Not yet swept - keep as is
            newPixels.push(pixel);
          } else {
            // Being swept - animate and shrink
            if (pixel.r <= 0) continue;

            pixel.x += Math.random() > 0.5 ? 1 : -1;
            pixel.y += Math.random() > 0.5 ? 1 : -1;
            pixel.r -= PARTICLE_DECAY_RATE * Math.random();
            newPixels.push(pixel);
          }
        }

        this.pixels = newPixels;

        // Draw all pixels
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
    this.ctrl.stop();
  }
}
