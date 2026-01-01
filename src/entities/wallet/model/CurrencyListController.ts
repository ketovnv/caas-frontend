import { Controller, to, type SpringConfig, type Interpolation } from '@react-spring/core';

// Animation States (only for interactive effects, not entrance)

interface ItemInteractiveState {
  scale: number;
  glowOpacity: number;
}

const IDLE: ItemInteractiveState = {
  scale: 1,
  glowOpacity: 0,
};

const HOVER: ItemInteractiveState = {
  scale: 1.02,
  glowOpacity: 0.5,
};

const SELECTED: ItemInteractiveState = {
  scale: 1.03,
  glowOpacity: 1,
};

const SPRING_CONFIG: SpringConfig = {
  tension: 320,
  friction: 28,
  mass: 0.8,
};

// Currency Item Controller - Hover/Select effects only

export class CurrencyItemController {
  private ctrl: Controller<ItemInteractiveState>;
  private _isSelected = false;

  readonly glowOpacity: Interpolation<number>;
  readonly scaleTransform: Interpolation<string>;

  constructor(config: SpringConfig = SPRING_CONFIG) {
    this.ctrl = new Controller({ ...IDLE, config });
    this.glowOpacity = to([this.ctrl.springs.glowOpacity], (o) => o);
    this.scaleTransform = to([this.ctrl.springs.scale], (s) => `scale(${s})`);
  }

  get isSelected() {
    return this._isSelected;
  }

  select(): void {
    this._isSelected = true;
    this.ctrl.start(SELECTED);
  }

  deselect(): void {
    this._isSelected = false;
    this.ctrl.start(IDLE);
  }

  hover(): void {
    if (this._isSelected) return;
    this.ctrl.start(HOVER);
  }

  unhover(): void {
    if (this._isSelected) return;
    this.ctrl.start(IDLE);
  }

  async pulse(): Promise<void> {
    await this.ctrl.start({ scale: 1.05 });
    await this.ctrl.start({ scale: this._isSelected ? SELECTED.scale : IDLE.scale });
  }

  dispose(): void {
    this.ctrl.stop();
  }
}

// Currency List Controller - Manages item interactions

export class CurrencyListController {
  private items: CurrencyItemController[] = [];
  private config: SpringConfig;
  private _selectedIndex = -1;

  constructor(config: SpringConfig = SPRING_CONFIG) {
    this.config = config;
  }

  /** Get or create controller for index */
  get(index: number): CurrencyItemController {
    if (!this.items[index]) {
      this.items[index] = new CurrencyItemController(this.config);
    }
    return this.items[index];
  }

  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /** Update selection by index */
  select(index: number): void {
    // Deselect previous
    if (this._selectedIndex >= 0) {
      this.items[this._selectedIndex]?.deselect();
    }

    this._selectedIndex = index;

    // Select new
    if (index >= 0) {
      this.items[index]?.select();
    }
  }

  /** Update selection by item id */
  selectById(id: string | undefined, items: { id: string }[]): void {
    const index = id ? items.findIndex(item => item.id === id) : -1;
    this.select(index);
  }

  pulse(index: number): void {
    this.items[index]?.pulse();
  }

  dispose(): void {
    this.items.forEach(item => item.dispose());
    this.items = [];
    this._selectedIndex = -1;
  }
}
