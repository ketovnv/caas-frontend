import { useTrail, animated, useSpringRef, easings } from "@react-spring/web";
import { useState, useEffect, useRef, useCallback } from "react";

interface AnimatedTextProps {
    text: string;
    colors?: string[];
    startColor?: string;
    duration?: number;
}

const defaultColors = [
    "rgb(131, 179, 32)",
    "rgb(47, 195, 106)",
    "rgb(42, 169, 210)",
    "rgb(4, 112, 202)",
    "rgb(107, 10, 255)",
    "rgb(183, 0, 218)",
    "rgb(218, 0, 171)",
    "rgb(230, 64, 92)",
    "rgb(232, 98, 63)",
    "rgb(249, 129, 47)",
];

export function AnimatedText({
                                 text,
                                 colors = defaultColors,
                                 startColor = "rgb(255,255,255)",
                                 duration = 500,
                             }: AnimatedTextProps) {
    const chars = text.split("");
    const [currentColors, setCurrentColors] = useState(colors);
    const [toggle, setToggle] = useState(false);
    const lastHiddenRef = useRef(0);
    const api = useSpringRef();

    const trail = useTrail(chars.length, {
        ref: api,
        from: {
            y: 0,
            opacity: 0.2,
            scale: 1,
            filter: "blur(5px)",
        },
        to: async (next, index) => {
            const color = currentColors[index % currentColors.length];
            // Фаза 1: появление
            await next({
                y: -3,
                opacity: 1,
                scale: 1.01,
                filter: "blur(0px)",
                color,
            });
            // Фаза 2: возврат
            await next({
                y: 0,
                opacity: 0.8,
                scale: 1,
                filter: "blur(0px)",
                color,
            });
            // Фаза 3: финал
            await next({
                opacity: 1,
                filter: "blur(0px)",
            });
        },
        config: {
            duration,
            easing: easings.easeOutCubic,
        },
        trail: 50, // задержка между символами (мс)
        reset: toggle,
    });

    const triggerAnimation = useCallback(() => {
        if (document.visibilityState === "visible") {
            if (Date.now() - lastHiddenRef.current > 500) {
                const shuffled = [...colors].sort(() => 0.5 - Math.random());
                setCurrentColors(shuffled);
                setToggle((t) => !t);
            }
        } else {
            lastHiddenRef.current = Date.now();
        }
    }, [colors]);

    // Первый запуск
    useEffect(() => {
        api.start();
    }, [api]);

    // Перезапуск при toggle
    useEffect(() => {
        api.start();
    }, [toggle, api]);

    // Интервал перезапуска
    useEffect(() => {
        const intervalId = setInterval(triggerAnimation, 5000);
        return () => clearInterval(intervalId);
    }, [triggerAnimation]);

    return (
        <div>
            {trail.map((style, index) => (
                <animated.span
                    key={index}
                    style={{
                        display: "inline-block",
                        color: startColor,
                        ...style,
                    }}
                >
                    {chars[index] === " " ? "\u00A0" : chars[index]}
                </animated.span>
            ))}
        </div>
    );
}