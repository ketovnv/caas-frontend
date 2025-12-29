import {makeAutoObservable, reaction} from 'mobx';
import {
    ColorSpring,
    GradientSpring,
    ColorArraySpring,
    MultiStopGradientSpring,
    DEFAULT_SPRING_CONFIG,
    type SpringConfig,
} from 'shared/lib/gradient.ts';

import {
    type ThemeConfig,
    type GradientConfig,
    STANDART_DARK,
    STANDART_LIGHT,
    SPECTRAL_GRADIENT,
    RAINBOWGRADIENT,
    RED_GRADIENT_DARK,
    RED_GRADIENT_LIGHT,
} from 'shared/config';

// ============================================================================
// Types
// ============================================================================

export type ColorScheme = 'light' | 'dark';

const THEMES: Record<ColorScheme, ThemeConfig> = {
    light: STANDART_LIGHT,
    dark: STANDART_DARK,
};

/** Get system preferred color scheme */
const getSystemColorScheme = (): ColorScheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// ============================================================================
// Theme Store
// ============================================================================

export class ThemeStore {
    // Observable state
    colorScheme: ColorScheme = 'dark';
    boxShadow: string = STANDART_LIGHT.boxShadow;

    // ─────────────────────────────────────────────────────────────────────────
    // Theme Springs
    // ─────────────────────────────────────────────────────────────────────────

    // Градиенты
    readonly backgroundGradient: GradientSpring;
    readonly buttonGradient: GradientSpring;

    // Одиночные цвета
    readonly color: ColorSpring;
    readonly accentColor: ColorSpring;
    readonly goldColor: ColorSpring;
    readonly greenColor: ColorSpring;
    readonly grayColor: ColorSpring;
    readonly redColor:ColorSpring;
    readonly navBarButtonBackground: ColorSpring;

    // Массивы цветов (4 шт каждый)
    readonly buttonTextColors: ColorArraySpring;
    readonly buttonActiveTextColors: ColorArraySpring;
    readonly navBarButtonTextColors: ColorArraySpring;
    readonly navBarButtonActiveTextColors: ColorArraySpring;

    // ─────────────────────────────────────────────────────────────────────────
    // Rainbow/Spectral градиенты
    // ─────────────────────────────────────────────────────────────────────────

    readonly spectralGradient: MultiStopGradientSpring;
    readonly rainbowGradient: MultiStopGradientSpring;
    readonly redGradient: GradientSpring;

    // ─────────────────────────────────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────────────────────────────────

    private disposers: (() => void)[] = [];
    readonly springConfig: SpringConfig;


    get colorStyle() {
        return {color: this.color.value};
    }

    get accentStyle() {
        return {color: this.accentColor.value};
    }


   get goldStyle() {
        return {color: this.goldColor.value};
    }
    get greenStyle() {
        return {color: this.greenColor.value};
    }
    get grayStyle() {
        return {color: this.grayColor.value};
    }
    get redStyle() {
        return {color: this.redColor.value};
    }
    get backgroundStyle() {
        return {background: this.backgroundGradient.value};
    }


    get navBackgroundStyle() {
        return {background: this.navBarButtonBackground.value};

    }

  get navBarBackgroundStyle() {
        return {background: this.navBarButtonTextColors.get(0)};
    }

// // Градиент для кнопок, карточек и т.д.
    get buttonGradientStyle() {
        return {background: this.navBarButtonTextColors.get(0)};
    }

//
// // Навбар кнопка фон
    get navBarButtonBgStyle() {
        return {backgroundColor: this.navBarButtonBackground.value};
    }

//
// // Стиль для обычной кнопки (градиент + текст из массива)
//   get buttonStyle() {
//     return {
//       backgroundImage: this.buttonGradient.value,
//       color: this.buttonTextColors.get(0), // первый цвет из массива 4
//       // можно добавить другие, если нужно
//     };
//   }

    constructor(
        initialScheme: ColorScheme = 'dark',
        springConfig: SpringConfig = DEFAULT_SPRING_CONFIG
    ) {
        this.springConfig = springConfig;
        const theme = THEMES[initialScheme];

        // Градиенты: GradientConfig = [colors[], x, y, steps]
        this.backgroundGradient = this.createGradientSpring(theme.backgroundGradient);
        this.buttonGradient = this.createGradientSpring(theme.buttonGradient);

        // Одиночные
        this.color = new ColorSpring(theme.color, this.springConfig);
        this.accentColor = new ColorSpring(theme.accentColor, this.springConfig);
        this.goldColor = new ColorSpring(theme.goldColor, this.springConfig);
        this.greenColor = new ColorSpring(theme.greenColor, this.springConfig);
        this.redColor = new ColorSpring(theme.redColor, this.springConfig);
        this.grayColor = new ColorSpring(theme.grayColor, this.springConfig);
        this.navBarButtonBackground = new ColorSpring(theme.navBarButtonBackground, this.springConfig);

        // Массивы
        this.buttonTextColors = new ColorArraySpring(theme.buttonTextColors, this.springConfig);
        this.buttonActiveTextColors = new ColorArraySpring(theme.buttonActiveTextColors, this.springConfig);
        this.navBarButtonTextColors = new ColorArraySpring(theme.navBarButtonTextColors, this.springConfig);
        this.navBarButtonActiveTextColors = new ColorArraySpring(theme.navBarButtonActiveTextColors, this.springConfig);

        // Rainbow/Spectral
        this.spectralGradient = new MultiStopGradientSpring(
            SPECTRAL_GRADIENT,
            {type: 'linear', angle: 90},
            this.springConfig
        );
        this.rainbowGradient = new MultiStopGradientSpring(
            RAINBOWGRADIENT,
            {type: 'linear', angle: 90},
            this.springConfig
        );
        this.redGradient = new GradientSpring(
            initialScheme === 'dark' ? RED_GRADIENT_DARK : RED_GRADIENT_LIGHT,
            {type: 'linear', angle: 45},
            this.springConfig
        );

        this.colorScheme = initialScheme;
        this.boxShadow = theme.boxShadow;

        makeAutoObservable<ThemeStore, 'disposers'>(this, {
            // Spring instances - not observable
            backgroundGradient: false,
            buttonGradient: false,
            color: false,
            accentColor: false,
            goldColor: false,
            greenColor: false,
            grayColor: false,
            redColor: false,
            navBarButtonBackground: false,
            buttonTextColors: false,
            buttonActiveTextColors: false,
            navBarButtonTextColors: false,
            navBarButtonActiveTextColors: false,
            spectralGradient: false,
            rainbowGradient: false,
            redGradient: false,
            springConfig: false,
            // Private fields
            disposers: false,
        });

        this.setupReactions();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private createGradientSpring(cfg: GradientConfig): GradientSpring {
        const [colors, x, y] = cfg;
        return new GradientSpring(colors, {type: 'radial', x, y}, this.springConfig);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reactions
    // ─────────────────────────────────────────────────────────────────────────

    private setupReactions() {
        const dispose = reaction(
            () => this.colorScheme,
            () => this.switchTheme(),
            {fireImmediately: false},
        );
        this.disposers.push(dispose);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Theme Switch
    // ─────────────────────────────────────────────────────────────────────────

    private switchTheme() {
        const theme = THEMES[this.colorScheme];
        const [bgColors, bgX, bgY] = theme.backgroundGradient;
        const [btnColors, btnX, btnY] = theme.buttonGradient;

        // Обновляем позиции
        this.backgroundGradient.setPosition(bgX, bgY);
        this.buttonGradient.setPosition(btnX, btnY);

        // Анимируем всё параллельно
        this.backgroundGradient.animateTo(bgColors);
        this.buttonGradient.animateTo(btnColors);

        this.color.animateTo(theme.color);
        this.accentColor.animateTo(theme.accentColor);
        this.greenColor.animateTo(theme.goldColor);
        this.greenColor.animateTo(theme.greenColor);
        this.redColor.animateTo(theme.redColor);
        this.navBarButtonBackground.animateTo(theme.navBarButtonBackground);

        this.buttonTextColors.animateTo(theme.buttonTextColors);
        this.buttonActiveTextColors.animateTo(theme.buttonActiveTextColors);
        this.navBarButtonTextColors.animateTo(theme.navBarButtonTextColors);
        this.navBarButtonActiveTextColors.animateTo(theme.navBarButtonActiveTextColors);

        // Red gradient зависит от темы
        this.redGradient.animateTo(this.colorScheme === 'dark' ? RED_GRADIENT_DARK : RED_GRADIENT_LIGHT);

        // boxShadow не анимируется
        this.boxShadow = theme.boxShadow;
    }

    async switchThemeAsync(): Promise<void> {
        const theme = THEMES[this.colorScheme];
        const [bgColors, bgX, bgY] = theme.backgroundGradient;
        const [btnColors, btnX, btnY] = theme.buttonGradient;

        this.backgroundGradient.setPosition(bgX, bgY);
        this.buttonGradient.setPosition(btnX, btnY);

        await Promise.all([
            this.backgroundGradient.animateTo(bgColors),
            this.buttonGradient.animateTo(btnColors),
            this.color.animateTo(theme.color),
            this.accentColor.animateTo(theme.accentColor),
            this.goldColor.animateTo(theme.goldColor),
            this.greenColor.animateTo(theme.greenColor),
            this.grayColor.animateTo(theme.grayColor),
            this.redColor.animateTo(theme.redColor),
            this.navBarButtonBackground.animateTo(theme.navBarButtonBackground),
            this.buttonTextColors.animateTo(theme.buttonTextColors),
            this.buttonActiveTextColors.animateTo(theme.buttonActiveTextColors),
            this.navBarButtonTextColors.animateTo(theme.navBarButtonTextColors),
            this.navBarButtonActiveTextColors.animateTo(theme.navBarButtonActiveTextColors),
            this.redGradient.animateTo(this.colorScheme === 'dark' ? RED_GRADIENT_DARK : RED_GRADIENT_LIGHT),
        ]);

        this.boxShadow = theme.boxShadow;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    setColorScheme(scheme: ColorScheme) {
        this.colorScheme = scheme;
    }

    toggle() {
        this.colorScheme = this.colorScheme === 'light' ? 'dark' : 'light';
    }

    /** Alias for toggle() */
    toggleColorScheme() {
        this.toggle();
    }

    get isDark() {
        return this.colorScheme === 'dark';
    }

    /** Alias for isDark */
    get themeIsDark() {
        return this.isDark;
    }

    setInstant(scheme: ColorScheme) {
        const theme = THEMES[scheme];
        const [bgColors, bgX, bgY] = theme.backgroundGradient;
        const [btnColors, btnX, btnY] = theme.buttonGradient;

        this.backgroundGradient.setPosition(bgX, bgY);
        this.buttonGradient.setPosition(btnX, btnY);

        this.backgroundGradient.set(bgColors);
        this.buttonGradient.set(btnColors);
        this.color.set(theme.color);
        this.accentColor.set(theme.accentColor);
        this.goldColor.set(theme.goldColor);
        this.greenColor.set(theme.greenColor);
        this.grayColor.set(theme.grayColor);
        this.redColor.set(theme.redColor);
        this.navBarButtonBackground.set(theme.navBarButtonBackground);
        this.buttonTextColors.set(theme.buttonTextColors);
        this.buttonActiveTextColors.set(theme.buttonActiveTextColors);
        this.navBarButtonTextColors.set(theme.navBarButtonTextColors);
        this.navBarButtonActiveTextColors.set(theme.navBarButtonActiveTextColors);
        this.redGradient.set(scheme === 'dark' ? RED_GRADIENT_DARK : RED_GRADIENT_LIGHT);

        this.boxShadow = theme.boxShadow;
        this.colorScheme = scheme;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Rainbow effects
    // ─────────────────────────────────────────────────────────────────────────

    setRainbowAngle(angle: number) {
        this.rainbowGradient.setAngle(angle);
    }

    setSpectralAngle(angle: number) {
        this.spectralGradient.setAngle(angle);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // System Theme Sync
    // ─────────────────────────────────────────────────────────────────────────

    /** Sync with system color scheme */
    syncWithSystem() {
        this.setColorScheme(getSystemColorScheme());
    }

    /** Watch for system theme changes */
    watchSystemTheme(): () => void {
        if (typeof window === 'undefined') return () => {
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            this.setColorScheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────────────────────────────────

    dispose() {
        this.disposers.forEach(d => d());
        this.disposers = [];
    }
}

// ============================================================================
// Singleton
// ============================================================================

export const themeStore = new ThemeStore();
