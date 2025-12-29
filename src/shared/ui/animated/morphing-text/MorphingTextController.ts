import { Controller } from '@react-spring/core';
import { makeAutoObservable, runInAction } from 'mobx';
import { core } from 'shared/model';
import {
  morphingSpring,
  MORPH_IDLE,
  MORPH_ACTIVE,
  DEFAULT_MORPH_TIME,
  DEFAULT_COOLDOWN_TIME,
  CYCLING_INTERVAL,
  type MorphingTextState,
} from './morphing-text.config';

// ============================================================================
// MorphingText Controller
// ============================================================================

export class MorphingTextController {
  // ─────────────────────────────────────────────────────────────────────────
  // MobX Observable State
  // ─────────────────────────────────────────────────────────────────────────

  currentText = '';
  prevText = '';
  isMorphing = false;

  // ─────────────────────────────────────────────────────────────────────────
  // Internal State (not observable)
  // ─────────────────────────────────────────────────────────────────────────

  private ctrl: Controller<MorphingTextState>;
  private morphTime: number;
  private coolDownTime: number;

  // Animation frame state
  private unsubscribe: (() => void) | null = null;
  private lastTime = 0;
  private morphProgress = 0;
  private coolDown = 0;

  // Cycling mode
  private cyclingInterval: ReturnType<typeof setInterval> | undefined;
  private texts: string[] = [];
  private textIndex = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Refs (set from component)
  // ─────────────────────────────────────────────────────────────────────────

  text1Element: HTMLSpanElement | null = null;
  text2Element: HTMLSpanElement | null = null;

  constructor(
    initialText = '',
    morphTime = DEFAULT_MORPH_TIME,
    coolDownTime = DEFAULT_COOLDOWN_TIME
  ) {
    this.currentText = initialText;
    this.prevText = initialText;
    this.morphTime = morphTime;
    this.coolDownTime = coolDownTime;

    this.ctrl = new Controller({
      ...MORPH_IDLE,
      config: morphingSpring,
    });

    makeAutoObservable<this, 'ctrl' | 'unsubscribe' | 'lastTime' | 'morphProgress' | 'coolDown' | 'cyclingInterval' | 'texts' | 'textIndex' | 'morphTime' | 'coolDownTime'>(
      this,
      {
        ctrl: false,
        unsubscribe: false,
        lastTime: false,
        morphProgress: false,
        coolDown: false,
        cyclingInterval: false,
        texts: false,
        textIndex: false,
        morphTime: false,
        coolDownTime: false,
        text1Element: false,
        text2Element: false,
      },
      { autoBind: true }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────

  get showMorphEffect() {
    return this.texts.length > 0 || this.isMorphing;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Values (React Spring)
  // ─────────────────────────────────────────────────────────────────────────

  get springs() {
    return this.ctrl.springs;
  }

  /** Filter style with animated blur */
  get filterStyle() {
    return this.ctrl.springs.blur.to(b =>
      b > 0.01 ? `url(#morphing-threshold) blur(${b}px)` : 'none'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  /** Set single text (triggers morph if different) */
  setText(text: string) {
    if (text === this.currentText) return;

    runInAction(() => {
      this.prevText = this.currentText;
      this.currentText = text;
      this.isMorphing = true;
    });

    // Start blur animation
    this.ctrl.start({
      ...MORPH_ACTIVE,
      config: morphingSpring,
    });

    // Reset morph progress
    this.coolDown = 0;
    this.morphProgress = 0;
  }

  /** Start cycling mode with array of texts */
  startCycling(texts: string[]) {
    if (texts.length === 0) return;

    this.texts = texts;
    this.textIndex = 0;

    runInAction(() => {
      this.currentText = texts[0] ?? '';
      this.prevText = texts[0] ?? '';
    });

    // Keep blur active during cycling
    this.ctrl.start({
      ...MORPH_ACTIVE,
      config: morphingSpring,
    });

    this.cyclingInterval = setInterval(() => {
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      runInAction(() => {
        this.prevText = this.currentText;
        this.currentText = this.texts[this.textIndex] ?? '';
      });
      this.coolDown = 0;
      this.morphProgress = 0;
    }, CYCLING_INTERVAL);
  }

  /** Stop cycling mode */
  stopCycling() {
    if (this.cyclingInterval) {
      clearInterval(this.cyclingInterval);
      this.cyclingInterval = undefined;
    }
    this.texts = [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Morphing Animation (synced with CoreStore loop)
  // ─────────────────────────────────────────────────────────────────────────

  /** Start the animation loop */
  startAnimation() {
    if (this.unsubscribe) return; // Already running

    this.lastTime = core.currentTime;
    this.unsubscribe = core.onFrame(this.animate);
  }

  /** Stop the animation loop */
  stopAnimation() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private animate = () => {
    const now = core.currentTime;
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.coolDown -= dt;

    const shouldAnimate = this.texts.length > 0 || this.prevText !== this.currentText;

    if (shouldAnimate) {
      if (this.coolDown <= 0) {
        this.doMorph();
      } else {
        this.doCoolDown();
      }
    } else {
      this.showStatic();
    }
  };

  private doMorph() {
    this.morphProgress -= this.coolDown;
    this.coolDown = 0;

    let fraction = this.morphProgress / this.morphTime;

    if (fraction > 1) {
      this.coolDown = this.coolDownTime;
      fraction = 1;
    }

    this.setTextStyles(fraction);

    if (fraction === 1) {
      // For single text mode: morph complete
      if (this.texts.length === 0) {
        runInAction(() => {
          this.prevText = this.currentText;
          this.isMorphing = false;
        });

        // Fade out blur
        this.ctrl.start({
          ...MORPH_IDLE,
          config: morphingSpring,
        });
      }
    }
  }

  private doCoolDown() {
    this.morphProgress = 0;

    const el1 = this.text1Element;
    const el2 = this.text2Element;
    if (!el1 || !el2) return;

    el2.style.filter = 'none';
    el2.style.opacity = '100%';
    el1.style.filter = 'none';
    el1.style.opacity = '0%';
  }

  private showStatic() {
    const el1 = this.text1Element;
    const el2 = this.text2Element;
    if (!el1 || !el2) return;

    el1.style.opacity = '0%';
    el1.style.filter = 'none';
    el2.style.opacity = '100%';
    el2.style.filter = 'none';
    el2.textContent = this.currentText;
  }

  private setTextStyles(fraction: number) {
    const el1 = this.text1Element;
    const el2 = this.text2Element;
    if (!el1 || !el2) return;

    // Text2 fading in
    el2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    el2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    // Text1 fading out
    const invertedFraction = 1 - fraction;
    el1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
    el1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

    // Set text content
    el1.textContent = this.prevText;
    el2.textContent = this.currentText;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  dispose() {
    this.stopCycling();
    this.stopAnimation();
    this.ctrl.stop();
  }
}
