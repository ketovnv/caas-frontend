import { LoginButton } from 'features/auth';
import { AnimatedText } from 'shared/ui';
import { RAINBOWGRADIENT, themeStore } from '@/shared';
import { animated } from '@react-spring/web';

export function ExchangePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-8 w-full max-w-2xl mx-auto min-h-0">
      <animated.h1
        style={themeStore.goldStyle}
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-center"
      >
        Exchange
      </animated.h1>
      <AnimatedText
        text="Swap crypto instantly"
        colors={RAINBOWGRADIENT}
        className="text-sm sm:text-base"
      />
      <p className="mt-4 sm:mt-6 text-white/50 text-center max-w-md text-sm sm:text-base px-4">
        Connect your wallet to exchange between currencies with best rates
      </p>
      <div className="mt-6 sm:mt-8">
        <LoginButton />
      </div>
    </div>
  );
}
