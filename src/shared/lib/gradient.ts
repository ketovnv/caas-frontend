import chroma from "chroma-js";

import {
    ThemeConfig,
    redGradientDark,
    redGradientLight,
    STANDART_DARK,
    STANDART_LIGHT,
    RAINBOWGRADIENT,
    RAINBOWGRADIENT2,
    HEXCOLORSGRADIENT,
    SPECTRALGRADIENTOKLCH,
} from "shared/config";

export type OklchColor = [number, number, number];
export interface Theme {
    color: string
    accentColor: string
    background: string
    buttonBackground: string
    boxShadow: string
    navBarButtonBackground: string
    buttonStartColor: string
    buttonStopColor: string
    buttonTextColors: Array<String>
    buttonActiveTextColors: Array<String>
    navBarButtonTextColors: Array<String>
    navBarButtonActiveTextColors: Array<String>
    redGradientColors: Array<String>
}

class gradient {
    private static gradientCache = new Map<string, string>();
    private static parsedColorCache = new Map<string, OklchColor[]>();

    static getStandartTheme(isDark: boolean): Theme {
        const theme: ThemeConfig = isDark ? STANDART_DARK : STANDART_LIGHT;

        const themeBackground = this.circleGradient(
            theme.backgroundColorsAngles[0],
            theme.backgroundColorsAngles[1],
            theme.backgroundColorsAngles[2],
            theme.backgroundColorsAngles[3]
        );

        const buttonBackground = this.circleGradient(
            theme.buttonColorsAngles[0],
            theme.buttonColorsAngles[1],
            theme.buttonColorsAngles[2],
            theme.buttonColorsAngles[3]
        );

        return {
            color: theme.color,
            background: themeBackground,
            buttonBackground,
            accentColor: theme.accentColor,
            boxShadow: theme.boxShadow,

            // background: "transparent",
            navBarButtonBackground: theme.navBarButtonBackground,
            buttonStartColor: theme.buttonColorsAngles[0][0],
            buttonStopColor: theme.buttonColorsAngles[0][3],
            buttonTextColors: theme.buttonTextColors,
            buttonActiveTextColors: theme.buttonActiveTextColors,
            navBarButtonTextColors: theme.navBarButtonTextColors,
            navBarButtonActiveTextColors: theme.navBarButtonActiveTextColors,
            redGradientColors: isDark ? redGradientDark : redGradientLight,
        };
    }

    // Оптимизированная интерполяция с правильной обработкой hue и chroma
    static interpolate(
        color1: OklchColor,
        color2: OklchColor,
        t: number,
    ): OklchColor {
        const l = color1.l + (color2.l - color1.l) * t;

        // 🎨 УМНАЯ ИНТЕРПОЛЯЦИЯ CHROMA:
        // Для ахроматических переходов (серый↔чёрный↔белый) используем
        // агрессивное подавление chroma, чтобы избежать коричневых оттенков
        const maxChroma = Math.max(color1.c, color2.c);
        const isNearGray = maxChroma < 0.08; // Повышенный порог для лучшего определения

        let c;
        if (isNearGray) {
            // Для ахроматических переходов: используем квадратичное затухание
            // Это даёт ОЧЕНЬ быстрое падение насыщенности в начале анимации
            const easedT = 1 - Math.pow(1 - t, 4); // quartic ease-out
            c = Math.min(color1.c, color2.c) * (1 - easedT);
            // Дополнительно: ограничиваем максимальный chroma на 0.01
            c = Math.min(c, 0.01);
        } else {
            // Для цветных переходов: обычная линейная интерполяция
            c = color1.c + (color2.c - color1.c) * t;
        }

        // Оптимизация: избегаем лишних проверок hue
        let h = color1.h;
        if (Math.abs(color1.h - color2.h) > 0.01) {
            let diff = color2.h - color1.h;
            // Кратчайший путь по цветовому кругу
            if (diff > 180) {
                diff -= 360;
            } else if (diff < -180) {
                diff += 360;
            }
            h = (color1.h + diff * t + 360) % 360; // Нормализуем в 0-360
        }

        return {l, c, h};
    }

    // Мемоизированный парсинг цветов
    static parsedColors(colors: string[]): OklchColor[] {
        const cacheKey = colors.join("|");

        const cached = this.parsedColorCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const parsed = colors.map((color) => {
            try {
                const [l, c, h] = chroma(color).oklch();
                return {
                    l: l || 0,
                    c: c || 0,
                    h: isNaN(h) ? 0 : h,
                };
            } catch (e) {
                console.warn(`Failed to parse color: ${color}`, e);
                return {l: 0, c: 0, h: 0};
            }
        });

        this.parsedColorCache.set(cacheKey, parsed);
        return parsed;
    }

    // Оптимизированная интерполяция массива
    static arrayInterpolate(colors: string[], steps: number): string[] {
        if (colors.length === 0) return [];
        if (colors.length === 1) return Array(steps).fill(colors[0]);

        const resultColors: string[] = [];
        const parsedColorsArray = this.parsedColors(colors);
        const segments = parsedColorsArray.length - 1;

        // Равномерное распределение шагов
        const stepsPerSegment = Math.max(1, Math.floor((steps - 1) / segments));
        const remainingSteps = (steps - 1) % segments;

        for (let i = 0; i < segments; i++) {
            const color1 = parsedColorsArray[i];
            const color2 = parsedColorsArray[i + 1];

            // Добавляем дополнительный шаг к первым сегментам для равномерности
            const segmentSteps = stepsPerSegment + (i < remainingSteps ? 1 : 0);

            for (let j = 0; j < segmentSteps; j++) {
                const t = j / segmentSteps;
                const interpolated = this.interpolate(color1, color2, t);
                resultColors.push(
                    `oklch(${interpolated.l.toFixed(3)} ${interpolated.c.toFixed(3)} ${interpolated.h.toFixed(1)})`,
                );
            }
        }

        // Добавляем последний цвет
        const lastColor = parsedColorsArray[parsedColorsArray.length - 1];
        resultColors.push(
            `oklch(${lastColor.l.toFixed(3)} ${lastColor.c.toFixed(3)} ${lastColor.h.toFixed(1)})`,
        );

        return resultColors;
    }

    static createOklchGradient(colors: string[], steps: number): string {
        const cacheKey = `gradient_${colors.join("|")}_${steps}`;

        const cached = this.gradientCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const resultColors = this.arrayInterpolate(colors, steps);

        // Корректируем количество цветов
        while (resultColors.length > steps) {
            resultColors.pop();
        }

        while (resultColors.length < steps && resultColors.length > 0) {
            resultColors.push(resultColors[resultColors.length - 1]);
        }

        const gradient = resultColors.join(", ");
        this.gradientCache.set(cacheKey, gradient);

        return gradient;
    }

    static blackWhiteGradient(isDark: boolean) {
        return this.linearAngleGradient(
            isDark
                ? ["oklch(1 0 0)", "oklch(0 0 0)"]
                : ["oklch(0 0 0)", "oklch(1 0 0)"],
            16,
            0,
        );
    }

    static circleGradient(
        colors: Array<String>,
        angle: number,
        angleTwo: number,
        number = 16,
    ): string {

        // logger.logRandomColors("to chroma", colors);
        return `radial-gradient(in oklch circle at ${angle}% ${angleTwo}%, ${this.createOklchGradient(colors, number)})`;
    }

    static linearAngleGradient(
        colors: Array<string>,
        angle: number,
        number = 32,
    ) {
        return `linear-gradient(${angle}deg in oklch, ${this.createOklchGradient(colors, number)})`;
    }

    static averageOklch(colors: Array<string>) {
        return chroma.average(colors, "oklch");
    }

    static averageHex(colors: Array<string>) {
        return chroma.average(colors, "hex");
    }

    static chromaSpectral() {
        return chroma.scale("Spectral").domain([1, 0]);
    }
}

export {
    gradient,
    redGradientDark,
    redGradientLight,
    STANDART_DARK,
    STANDART_LIGHT,
    RAINBOWGRADIENT,
    RAINBOWGRADIENT2,
    HEXCOLORSGRADIENT,
    SPECTRALGRADIENTOKLCH,
};
