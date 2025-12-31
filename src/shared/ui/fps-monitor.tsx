import {observer} from 'mobx-react-lite';
import {core} from 'shared/model/core';
import {settingsStore} from 'shared/model/settings.store';
import {useRef} from 'react';
import {useResize, animated} from '@react-spring/web'
import {themeStore} from "@/shared";
import {NetworkBadge} from './network-badge';

export const FPSMonitor = observer(() => {
    const fpsContainerRef = useRef<HTMLDivElement>(null);
    const {width} = useResize({
        container: fpsContainerRef,
        config: {
            tension: 200,
            friction: 25,
            mass: 1.5,
        },
    });

    // Use CSS to hide instead of early return (hooks must be called unconditionally)
    const isVisible = settingsStore.showFpsMonitor;

    return (
        <div
            style={{
                position: "fixed",
                top: 15,
                left: 15,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}
        >
            {/* FPS Counter */}
            <animated.div
                style={{
                    color: core.fps.to((value) => `oklch(0.7 0.3 ${(value+1.5).toFixed(2)})`),
                    minWidth: width ?? '50px',
                    paddingLeft: width.to((w) => `${w / 10}px`),
                    width: width.to((w) => `${w + w/5}px`),
                    height: 'auto',
                    overflow: 'hidden',
                    display: isVisible ? 'inline-block' : 'none',
                    whiteSpace: 'nowrap',
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

            {/* Network Badge */}
            <NetworkBadge />
        </div>
    );
});