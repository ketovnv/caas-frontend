import { Controller } from '@react-spring/core';
import { makeAutoObservable } from 'mobx';
import {
  dragSpring,
  DRAG_IDLE,
  SWIPE_THRESHOLD,
  SWIPE_VELOCITY_THRESHOLD,
  RUBBER_BAND_FACTOR,
  MAX_DRAG_ROTATION,
  DRAG_ROTATION_FACTOR,
  DRAG_SCALE_FACTOR,
  MIN_DRAG_SCALE,
  type DragAnimState,
} from '../config/router-transition.config'

// SwipeController - Manages swipe gesture state for page navigation

export class SwipeController {

  // MobX Observable State

  isDragging = false;

    // Internal State (not observable)

  private ctrl: Controller<DragAnimState>;

  constructor() {
    this.ctrl = new Controller({
      ...DRAG_IDLE,
      config: dragSpring,
    });

    makeAutoObservable<this, 'ctrl'>(this, {
      ctrl: false,
    }, { autoBind: true });
  }

    // Animated Values (for component binding)

  get springs() {
    return this.ctrl.springs;
  }

  get dragX() {
    return this.ctrl.springs.dragX;
  }

  get dragScale() {
    return this.ctrl.springs.dragScale;
  }

  get dragRotateY() {
    return this.ctrl.springs.dragRotateY;
  }

    // Actions

  /**
   * Update drag position during active gesture
   * @param movement - horizontal movement in pixels
   * @param canGoLeft - whether navigation to previous route is possible
   * @param canGoRight - whether navigation to next route is possible
   */
  updateDrag(movement: number, canGoLeft: boolean, canGoRight: boolean) {
    this.isDragging = true;

    // Apply rubber band effect when dragging past allowed direction
    let effectiveMovement = movement;
    if (movement < 0 && !canGoRight) {
      effectiveMovement = movement * RUBBER_BAND_FACTOR;
    } else if (movement > 0 && !canGoLeft) {
      effectiveMovement = movement * RUBBER_BAND_FACTOR;
    }

    // Calculate rotation and scale based on drag distance
    const rotateY = effectiveMovement * -DRAG_ROTATION_FACTOR;
    const scale = 1 - Math.abs(effectiveMovement) * DRAG_SCALE_FACTOR;

    this.ctrl.start({
      dragX: effectiveMovement,
      dragScale: Math.max(MIN_DRAG_SCALE, scale),
      dragRotateY: Math.max(-MAX_DRAG_ROTATION, Math.min(MAX_DRAG_ROTATION, rotateY)),
      immediate: true, // No animation during drag - follow finger exactly
    });
  }

  /**
   * Check if gesture should trigger navigation
   * @param movement - final horizontal movement
   * @param velocity - swipe velocity
   * @param direction - swipe direction (-1 left, 1 right)
   * @param canGoLeft - whether previous route exists
   * @param canGoRight - whether next route exists
   * @returns 'left' | 'right' | null - direction to navigate or null
   */
  shouldNavigate(
    movement: number,
    velocity: number,
    direction: number,
    canGoLeft: boolean,
    canGoRight: boolean
  ): 'left' | 'right' | null {
    const meetsThreshold = Math.abs(movement) > SWIPE_THRESHOLD;
    const meetsVelocity = velocity > SWIPE_VELOCITY_THRESHOLD;

    if (!meetsThreshold && !meetsVelocity) {
      return null;
    }

    // Determine navigation direction
    // Swipe right (positive movement) = go to previous (left in nav)
    // Swipe left (negative movement) = go to next (right in nav)
    if (direction > 0 && canGoLeft) {
      return 'left';
    }
    if (direction < 0 && canGoRight) {
      return 'right';
    }

    return null;
  }

  /**
   * Reset drag state to idle
   */
  reset() {
    this.isDragging = false;
    this.ctrl.start({
      ...DRAG_IDLE,
      config: dragSpring,
    });
  }

  /**
   * Get current drag X value (for calculations)
   */
  getDragXValue(): number {
    return this.ctrl.springs.dragX.get();
  }

  /**
   * Get current drag scale value
   */
  getDragScaleValue(): number {
    return this.ctrl.springs.dragScale.get();
  }

  /**
   * Get current drag rotation value
   */
  getDragRotateYValue(): number {
    return this.ctrl.springs.dragRotateY.get();
  }

  // Lifecycle

  dispose() {
    this.ctrl.stop();
  }
}

// Singleton instance

export const swipeController = new SwipeController();
