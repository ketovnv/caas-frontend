import { Controller, to, type SpringConfig, type Interpolation } from '@react-spring/core';
import {
  ITEM_HIDDEN,
  ITEM_VISIBLE,
  ITEM_SELECTED,
  ITEM_HOVER,
  ITEM_SPRING_CONFIG,
  STAGGER_DELAY,
  type CurrencyItemState,
} from '../config/currency-list.config.ts';

// ============================================================================
// Currency Item Controller - Single list item
// ============================================================================

export class CurrencyItemController {
  private ctrl: Controller<CurrencyItemState>;
  private _isSelected = false;
  private _isHovered = false;

  // Cached interpolations
  readonly transform: Interpolation<string>;
  readonly opacity: Interpolation<number>;
  readonly background: Interpolation<string>;
  readonly glowOpacity: Interpolation<number>;

  constructor(config: SpringConfig = ITEM_SPRING_CONFIG) {
    this.ctrl = new Controller({
      ...ITEM_HIDDEN,
      config,
    });

    const s = this.ctrl.springs;

    // Transform: translateY + scale
    this.transform = to(
      [s.y, s.scale],
      (y, scale) => `translateY(${y}px) scale(${scale})`
    );

    this.opacity = to([s.opacity], (o) => o);

    // Background as OKLCH color
    this.background = to(
      [s.bgL, s.bgC, s.bgH],
      (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${((h % 360) + 360) % 360})`
    );

    this.glowOpacity = to([s.glowOpacity], (o) => o);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────

  get isSelected() {
    return this._isSelected;
  }

  get isHovered() {
    return this._isHovered;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Methods
  // ─────────────────────────────────────────────────────────────────────────

  /** Show item with entrance animation */
  show(config?: SpringConfig): Promise<void> {
    return this.ctrl.start({
      ...ITEM_VISIBLE,
      config,
    }).then(() => {});
  }

  /** Hide item */
  hide(config?: SpringConfig): Promise<void> {
    return this.ctrl.start({
      ...ITEM_HIDDEN,
      config,
    }).then(() => {});
  }

  /** Select this item */
  select(config?: SpringConfig): Promise<void> {
    this._isSelected = true;
    return this.ctrl.start({
      ...ITEM_VISIBLE,
      ...ITEM_SELECTED,
      config,
    }).then(() => {});
  }

  /** Deselect this item */
  deselect(config?: SpringConfig): Promise<void> {
    this._isSelected = false;
    return this.ctrl.start({
      ...ITEM_VISIBLE,
      config,
    }).then(() => {});
  }

  /** Hover state */
  hover(config?: SpringConfig): void {
    if (this._isSelected) return;
    this._isHovered = true;
    this.ctrl.start({
      ...ITEM_HOVER,
      config,
    });
  }

  /** Leave hover state */
  unhover(config?: SpringConfig): void {
    if (this._isSelected) return;
    this._isHovered = false;
    this.ctrl.start({
      ...ITEM_VISIBLE,
      config,
    });
  }

  /** Pulse animation (for balance update) */
  async pulse(): Promise<void> {
    await this.ctrl.start({ scale: 1.05 });
    await this.ctrl.start({ scale: this._isSelected ? 1.02 : 1 });
  }

  /** Set state instantly */
  set(state: Partial<CurrencyItemState>): void {
    this.ctrl.set(state);
  }

  stop(): void {
    this.ctrl.stop();
  }

  dispose(): void {
    this.ctrl.stop();
  }
}

// ============================================================================
// Currency List Controller - Manages all items
// ============================================================================

export class CurrencyListController {
  private items: CurrencyItemController[] = [];
  private config: SpringConfig;
  private _selectedIndex = -1;

  constructor(count: number = 0, config: SpringConfig = ITEM_SPRING_CONFIG) {
    this.config = config;
    this.resize(count);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Item Management
  // ─────────────────────────────────────────────────────────────────────────

  /** Get controller for specific index */
  get(index: number): CurrencyItemController {
    // Auto-expand if needed
    while (this.items.length <= index) {
      this.items.push(new CurrencyItemController(this.config));
    }
    return this.items[index]!;
  }

  /** Get all controllers */
  get all(): CurrencyItemController[] {
    return this.items;
  }

  /** Number of items */
  get length(): number {
    return this.items.length;
  }

  /** Currently selected index */
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /** Resize the controller array */
  resize(count: number): void {
    // Add new controllers if needed
    while (this.items.length < count) {
      this.items.push(new CurrencyItemController(this.config));
    }
    // Remove excess controllers
    while (this.items.length > count) {
      const removed = this.items.pop();
      removed?.dispose();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // List Animations
  // ─────────────────────────────────────────────────────────────────────────

  /** Animate all items in (staggered) */
  async animateIn(delay: number = STAGGER_DELAY): Promise<void> {
    const promises = this.items.map((item, index) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          item.show(this.config).then(resolve);
        }, index * delay);
      });
    });
    await Promise.all(promises);
  }

  /** Animate all items out (reverse stagger) */
  async animateOut(delay: number = STAGGER_DELAY): Promise<void> {
    const promises = this.items.map((item, index) => {
      const reverseIndex = this.items.length - 1 - index;
      return new Promise<void>(resolve => {
        setTimeout(() => {
          item.hide(this.config).then(resolve);
        }, reverseIndex * delay);
      });
    });
    await Promise.all(promises);
  }

  /** Select item at index */
  select(index: number): void {
    // Deselect previous
    if (this._selectedIndex >= 0 && this._selectedIndex < this.items.length) {
      this.items[this._selectedIndex]?.deselect(this.config);
    }
    // Select new
    this._selectedIndex = index;
    if (index >= 0 && index < this.items.length) {
      this.items[index]?.select(this.config);
    }
  }

  /** Clear selection */
  clearSelection(): void {
    if (this._selectedIndex >= 0 && this._selectedIndex < this.items.length) {
      this.items[this._selectedIndex]?.deselect(this.config);
    }
    this._selectedIndex = -1;
  }

  /** Pulse specific item (for updates) */
  pulse(index: number): void {
    this.items[index]?.pulse();
  }

  /** Pulse all items */
  pulseAll(): void {
    this.items.forEach(item => item.pulse());
  }

  /** Reset all to hidden */
  reset(): void {
    this.items.forEach(item => item.set(ITEM_HIDDEN));
    this._selectedIndex = -1;
  }

  stop(): void {
    this.items.forEach(item => item.stop());
  }

  dispose(): void {
    this.items.forEach(item => item.dispose());
    this.items = [];
    this._selectedIndex = -1;
  }
}
