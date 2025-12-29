import {observer} from 'mobx-react-lite';
import {core} from 'shared/model/core';
import {useRef} from 'react';
import {useResize, animated} from '@react-spring/web'

export const FPSMonitor = observer(() => {
    const fpsContainerRef = useRef<HTMLDivElement>(null);
    const {width} = useResize({
        container: fpsContainerRef,
        // Опционально: настроим анимацию под свои нужды
        config: {
            tension: 200,
            friction: 25,
            mass: 2,
        },
    });

    const fullWidth = width.to((w) => `${w + w/5}px`);
    const paddingLeft = width.to((w) => `${w / 10}px`);

    return (
        <animated.div
            style={{
                color: core.fps.to((value) => `oklch(70% 0.3 ${(value+1.5).toFixed(2)})`),
                position: "fixed",
                minWidth: width ?? '50px',
                paddingLeft,
                width: fullWidth,
                height: 'auto',
                overflow: 'hidden',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                top: 65,
                right: 25,
                zIndex: 9999,
                background: "oklch(0.5 0.013 264.05 /.1)",
                borderRadius: "8px",
                pointerEvents: "none",
                backdropFilter: "blur(4px)"
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