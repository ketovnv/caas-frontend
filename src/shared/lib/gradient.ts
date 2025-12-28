import { Controller, type SpringConfig, to, type Interpolation } from '@react-spring/core';


// Types


/** OKLCH color tuple: [Lightness 0-1, Chroma 0-0.4, Hue 0-360] */
export type OklchTuple = readonly [l: number, c: number, h: number];

/** Re-export SpringConfig for external use */
export type { SpringConfig };

/** Promise that resolves when animation completes */
export type SpringResult = Promise<void>;

/** Convert any promise to Promise<void> */
const asVoid = <T>(p: Promise<T>): SpringResult => p.then(() => {});

// Utils

const normalizeHue = (h: number) => ((h % 360) + 360) % 360;

const shortestHuePath = (from: number, to: number): number => {
  const diff = normalizeHue(to) - normalizeHue(from);
  if (diff > 180) return to - 360;
  if (diff < -180) return to + 360;
  return to;
};

export const DEFAULT_SPRING_CONFIG: SpringConfig = { tension: 120, friction: 14 };

// ColorSpring — один OKLCH цвет

export class ColorSpring {
  private ctrl: Controller<{ l: number; c: number; h: number }>;
  readonly value: Interpolation<string>;

  constructor(initial: OklchTuple, config: SpringConfig = DEFAULT_SPRING_CONFIG) {
    this.ctrl = new Controller({
      l: initial[0],
      c: initial[1],
      h: initial[2],
      config,
    });

    const springs = this.ctrl.springs;
    this.value = to(
        [springs.l, springs.c, springs.h],
        (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`
    );
  }

  animateTo(target: OklchTuple, config?: SpringConfig): SpringResult {
    const currentH = this.ctrl.springs.h.get();
    return asVoid(this.ctrl.start({
      l: target[0],
      c: target[1],
      h: shortestHuePath(currentH, target[2]),
      config,
    }));
  }

  set(target: OklchTuple) {
    this.ctrl.set({ l: target[0], c: target[1], h: target[2] });
  }

  stop() {
    this.ctrl.stop();
  }

  /** Get current OKLCH values */
  get current(): OklchTuple {
    const s = this.ctrl.springs;
    return [s.l.get(), s.c.get(), s.h.get()];
  }
}

// GradientSpring — 4 OKLCH цвета → radial/linear/conic gradient

type GradientType = 'radial' | 'linear' | 'conic';

interface GradientOptions {
  type?: GradientType;
  x?: number;
  y?: number;
  angle?: number;
}

interface FlatColors {
  l0: number; c0: number; h0: number;
  l1: number; c1: number; h1: number;
  l2: number; c2: number; h2: number;
  l3: number; c3: number; h3: number;
}

export class GradientSpring {
  private ctrl: Controller<FlatColors>;
  private options: Required<GradientOptions>;
  readonly value: Interpolation<string>;

  constructor(
      initial: OklchTuple[],
      options: GradientOptions = {},
      config: SpringConfig = DEFAULT_SPRING_CONFIG
  ) {
    this.options = {
      type: options.type ?? 'radial',
      x: options.x ?? 50,
      y: options.y ?? 50,
      angle: options.angle ?? 180,
    };

    this.ctrl = new Controller({
      ...this.flatten(initial),
      config,
    });

    const s = this.ctrl.springs;
    this.value = to(
        [s.l0, s.c0, s.h0, s.l1, s.c1, s.h1, s.l2, s.c2, s.h2, s.l3, s.c3, s.h3],
        (l0, c0, h0, l1, c1, h1, l2, c2, h2, l3, c3, h3) => {
          const fmt = (l: number, c: number, h: number) =>
              `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`;

          const colors = [fmt(l0, c0, h0), fmt(l1, c1, h1), fmt(l2, c2, h2), fmt(l3, c3, h3)].join(', ');
          const { type, x, y, angle } = this.options;

          switch (type) {
            case 'linear': return `linear-gradient(${angle}deg, ${colors})`;
            case 'conic': return `conic-gradient(from ${angle}deg at ${x}% ${y}%, ${colors})`;
            default: return `radial-gradient(circle at ${x}% ${y}%, ${colors})`;
          }
        }
    );
  }

  animateTo(target: OklchTuple[], config?: SpringConfig): SpringResult {
    const s = this.ctrl.springs;
    const flat = this.flatten(target);

    return asVoid(this.ctrl.start({
      ...flat,
      h0: shortestHuePath(s.h0.get(), flat.h0),
      h1: shortestHuePath(s.h1.get(), flat.h1),
      h2: shortestHuePath(s.h2.get(), flat.h2),
      h3: shortestHuePath(s.h3.get(), flat.h3),
      config,
    }));
  }

  set(target: OklchTuple[]) {
    this.ctrl.set(this.flatten(target));
  }

  stop() {
    this.ctrl.stop();
  }

  setPosition(x: number, y: number) {
    this.options.x = x;
    this.options.y = y;
  }

  private flatten(colors: OklchTuple[]): FlatColors {
    return {
      l0: colors[0]![0], c0: colors[0]![1], h0: colors[0]![2],
      l1: colors[1]![0], c1: colors[1]![1], h1: colors[1]![2],
      l2: colors[2]![0], c2: colors[2]![1], h2: colors[2]![2],
      l3: colors[3]![0], c3: colors[3]![1], h3: colors[3]![2],
    };
  }
}


// ColorArraySpring — массив из 4 независимых OKLCH цветов (для buttonText и т.д.)
// Возвращает массив из 4 интерполяций


export class ColorArraySpring {
  private ctrls: Controller<{ l: number; c: number; h: number }>[];
  readonly values: Interpolation<string>[];

  constructor(initial: OklchTuple[], config: SpringConfig = DEFAULT_SPRING_CONFIG) {
    this.ctrls = initial.map(color => new Controller({
      l: color[0],
      c: color[1],
      h: color[2],
      config,
    }));

    this.values = this.ctrls.map(ctrl => {
      const s = ctrl.springs;
      return to(
          [s.l, s.c, s.h],
          (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`
      );
    });
  }

  animateTo(target: OklchTuple[], config?: SpringConfig): SpringResult {
    return asVoid(Promise.all(
        this.ctrls.map((ctrl, i) => {
          const currentH = ctrl.springs.h.get();
          return ctrl.start({
            l: target[i]![0],
            c: target[i]![1],
            h: shortestHuePath(currentH, target[i]![2]),
            config,
          });
        })
    ));
  }

  set(target: OklchTuple[]) {
    this.ctrls.forEach((ctrl, i) => {
      ctrl.set({ l: target[i]![0], c: target[i]![1], h: target[i]![2] });
    });
  }

  stop() {
    this.ctrls.forEach(ctrl => ctrl.stop());
  }

  /** Get interpolation for specific color index */
  get(index: number): Interpolation<string> {
    return this.values[index]!;
  }
}


// MultiStopGradientSpring — градиент с произвольным числом цветов (для rainbow)

export class MultiStopGradientSpring {
  private ctrls: Controller<{ l: number; c: number; h: number }>[];
  readonly value: Interpolation<string>;
  private options: { type: 'linear' | 'radial' | 'conic'; angle: number; x: number; y: number };

  constructor(
      initial: OklchTuple[],
      options: { type?: 'linear' | 'radial' | 'conic'; angle?: number; x?: number; y?: number } = {},
      config: SpringConfig = DEFAULT_SPRING_CONFIG
  ) {
    this.options = {
      type: options.type ?? 'linear',
      angle: options.angle ?? 90,
      x: options.x ?? 50,
      y: options.y ?? 50,
    };

    this.ctrls = initial.map(color => new Controller({
      l: color[0],
      c: color[1],
      h: color[2],
      config,
    }));

    // Собираем все springs в один to()
    const allSprings = this.ctrls.flatMap(ctrl => [ctrl.springs.l, ctrl.springs.c, ctrl.springs.h]);

    this.value = to(allSprings, (...values) => {
      const colors: string[] = [];
      for (let i = 0; i < values.length; i += 3) {
        const l = values[i] as number;
        const c = values[i + 1] as number;
        const h = values[i + 2] as number;
        colors.push(`oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`);
      }

      const { type, angle, x, y } = this.options;
      switch (type) {
        case 'radial': return `radial-gradient(circle at ${x}% ${y}%, ${colors.join(', ')})`;
        case 'conic': return `conic-gradient(from ${angle}deg at ${x}% ${y}%, ${colors.join(', ')})`;
        default: return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
      }
    });
  }

  animateTo(target: OklchTuple[], config?: SpringConfig): SpringResult {
    return asVoid(Promise.all(
        this.ctrls.map((ctrl, i) => {
          const currentH = ctrl.springs.h.get();
          const t = target[i] ?? target[target.length - 1]!;
          return ctrl.start({
            l: t[0],
            c: t[1],
            h: shortestHuePath(currentH, t[2]),
            config,
          });
        })
    ));
  }

  set(target: OklchTuple[]) {
    this.ctrls.forEach((ctrl, i) => {
      const t = target[i] ?? target[target.length - 1]!;
      ctrl.set({ l: t[0], c: t[1], h: t[2] });
    });
  }

  stop() {
    this.ctrls.forEach(ctrl => ctrl.stop());
  }

  setAngle(angle: number) {
    this.options.angle = angle;
  }

  setPosition(x: number, y: number) {
    this.options.x = x;
    this.options.y = y;
  }
}


// DynamicColorArraySpring — массив произвольного числа OKLCH цветов
// Возвращает массив интерполяций + готовую строку для CSS gradient


export class DynamicColorArraySpring {
  private ctrls: Controller<{ l: number; c: number; h: number }>[];
  private config: SpringConfig;

  constructor(initial: OklchTuple[], config: SpringConfig = DEFAULT_SPRING_CONFIG) {
    this.config = config;
    this.ctrls = initial.map(color => new Controller({
      l: color[0],
      c: color[1],
      h: color[2],
      config,
    }));
  }

  /** Get array of animated color strings */
  get values(): Interpolation<string>[] {
    return this.ctrls.map(ctrl => {
      const s = ctrl.springs;
      return to(
        [s.l, s.c, s.h],
        (l, c, h) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`
      );
    });
  }

  /** Get combined gradient string (for CSS background) */
  gradientString(_angle: number = 90): Interpolation<string> {
    const allSprings = this.ctrls.flatMap(ctrl => [ctrl.springs.l, ctrl.springs.c, ctrl.springs.h]);

    return to(allSprings, (...vals) => {
      const colors: string[] = [];
      for (let i = 0; i < vals.length; i += 3) {
        const l = vals[i] as number;
        const c = vals[i + 1] as number;
        const h = vals[i + 2] as number;
        colors.push(`oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`);
      }
      return colors.join(', ');
    });
  }

  /** Number of colors */
  get length(): number {
    return this.ctrls.length;
  }

  /** Animate to new colors (resizes if needed) */
  animateTo(target: OklchTuple[], config?: SpringConfig): SpringResult {
    // Resize controllers if needed
    while (this.ctrls.length < target.length) {
      const lastColor = target[this.ctrls.length] ?? target[target.length - 1]!;
      this.ctrls.push(new Controller({
        l: lastColor[0],
        c: lastColor[1],
        h: lastColor[2],
        config: this.config,
      }));
    }

    // Animate all controllers
    return asVoid(Promise.all(
      this.ctrls.slice(0, target.length).map((ctrl, i) => {
        const currentH = ctrl.springs.h.get();
        const t = target[i]!;
        return ctrl.start({
          l: t[0],
          c: t[1],
          h: shortestHuePath(currentH, t[2]),
          config,
        });
      })
    ));
  }

  /** Set colors instantly */
  set(target: OklchTuple[]) {
    // Resize if needed
    while (this.ctrls.length < target.length) {
      const t = target[this.ctrls.length] ?? target[target.length - 1]!;
      this.ctrls.push(new Controller({
        l: t[0],
        c: t[1],
        h: t[2],
        config: this.config,
      }));
    }

    this.ctrls.slice(0, target.length).forEach((ctrl, i) => {
      const t = target[i]!;
      ctrl.set({ l: t[0], c: t[1], h: t[2] });
    });
  }

  stop() {
    this.ctrls.forEach(ctrl => ctrl.stop());
  }

  /** Get current OKLCH values */
  get current(): OklchTuple[] {
    return this.ctrls.map(ctrl => {
      const s = ctrl.springs;
      return [s.l.get(), s.c.get(), s.h.get()] as const;
    });
  }
}
