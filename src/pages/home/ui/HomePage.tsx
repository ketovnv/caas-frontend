import {LoginButton} from 'features/auth';
import {AnimatedText} from 'shared/ui';
import {animated} from '@react-spring/web';
import {themeStore} from '@/shared';

export const HomePage = (() => {
    return (
        <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-8 w-full max-w-4xl mx-auto min-h-0">
            <animated.h1
                style={{color: themeStore.goldColor.value}}
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-center"
            >
                CaaS Platform
            </animated.h1>
            <AnimatedText
                text="Crypto as a Service"
                className="font-extrabold text-lg sm:text-xl md:text-2xl"
            />
            <AnimatedText
                text="React Spring Imperative Animations + FSD Architecture"
                staggerDelay={7}
                lightColors={[[0.45, 0.2, 145], [0.35, 0.25, 180]]}
                darkColors={[[0.75, 0.25, 320], [0.65, 0.3, 280]]}
                className="text-xs sm:text-sm md:text-base text-center"
            />
            <div className="mt-6 sm:mt-8">
                <LoginButton/>
            </div>
        </div>
    );
})
