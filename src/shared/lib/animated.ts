/**
 * React Spring re-exports with convenient aliases
 * @see https://www.react-spring.dev/docs/getting-started
 */

import {Controller, SpringValue} from '@react-spring/web';
import type {SpringConfig} from '@react-spring/web';

export interface ControllerAPI {
    controller: Controller;
    name: string;
    springs: Record<string, SpringValue<number | string>>;
    to: (values: any, config?: any) => any;
    start: (values: any, config?: any) => any;
    sequence: (steps: any[]) => Promise<boolean>;
    parallel: (animations: any[]) => Promise<boolean>;
    set: (values: any) => void;
    stop: () => void;
    dispose: () => void;
}


export function createControllerAPI<T extends Record<string, number | string>>(
    name: string,
    initial: T,
    options: { config?: SpringConfig } = {},
): ControllerAPI {
    const controller = new Controller({...initial, config: options.config});
    return {
        controller,
        name,
        springs: controller.springs,

        to: (values: any, cfg?: any) => {
            return controller.start({
                ...values,
                config: cfg?.config ?? options.config,
                onRest: () => {
                    cfg?.onComplete?.();
                },
            });
        },
        start: (values: any, cfg?: any) => {
            return controller.start({
                ...values,
                config: cfg?.config ?? options.config,
            });
        },
        sequence: async (steps: any[]) => {
            for (const step of steps) {
                if (step.delay) {
                    await new Promise((resolve) => setTimeout(resolve, step.delay));
                }
                await controller.start(step);
            }
            return true;
        },
        parallel: async (animations: any[]) => {
            await Promise.all(animations.map((anim) => controller.start(anim)));
            return true;
        },
        set: (values: any) => controller.set(values),
        stop: () => controller.stop(),
        dispose: () => {
            controller.stop();
        },
    };
}

// Alias for convenience
export const createController = createControllerAPI;

export {
    // Core hooks
    useSpring,
    useSprings,
    useTrail,
    useTransition,
    useChain,
    useSpringRef,
    useSpringValue,
    useInView,
    animated,
    config,
    to,
    easings,
    type SpringValue,
    type Controller,
    type SpringRef,
    type SpringConfig,
    type AnimatedProps,
} from '@react-spring/web';

