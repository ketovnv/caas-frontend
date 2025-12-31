import {observer} from 'mobx-react-lite';
import {core} from 'shared/model/core';
import {useRef} from 'react';
import {useResize, animated} from '@react-spring/web'
import {themeStore} from "@/shared";

export const FPSMonitor = observer(() => {
    const fpsContainerRef = useRef<HTMLDivElement>(null);
    const {width} = useResize({
        container: fpsContainerRef,
        // Опционально: настроим анимацию под свои нужды
        config: {
            tension: 200,
            friction: 25,
            mass: 1.5,
        },
    });


    return (
        <animated.div
            style={{
                color: core.fps.to((value) => `oklch(0.7 0.3 ${(value+1.5).toFixed(2)})`),
                position: "fixed",
                minWidth: width ?? '50px',
                paddingLeft:width.to((w) => `${w / 10}px`),
                width:  width.to((w) => `${w + w/5}px`),
                height: 'auto',
                overflow: 'hidden',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                top: 15,
                left: 25,
                zIndex: 9999,
                background: themeStore.backgroundGradient.value,
                borderRadius: "8px",
                pointerEvents: "none",
                backdropFilter: "blur(7px)"
            }}
        >
            <animated.span
                ref={fpsContainerRef}
                style={{display: 'inline-block', fontWeight: 'bold'}}
            >
                {core.fps.to((value) => '🎞️'+value.toFixed(0))}
            </animated.span>

        </animated.div>
    );
});