import { AnimatedText } from 'shared/ui';
import { RAINBOWGRADIENT, themeStore } from '@/shared';
import { router } from 'app/router';
import { animated } from '@react-spring/web';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-8 w-full max-w-2xl mx-auto min-h-0">
      <animated.h1
        style={{color: themeStore.goldColor.value}}
        className="text-6xl sm:text-7xl md:text-8xl font-bold mb-2"
      >
        404
      </animated.h1>
      <AnimatedText
        text="Page not found"
        colors={RAINBOWGRADIENT}
        className="text-lg sm:text-xl"
      />
      <p className="mt-4 sm:mt-6 text-white/50 text-center max-w-md text-sm sm:text-base px-4">
        The page you're looking for doesn't exist or has been moved
      </p>
      <button
        onClick={() => router.navigate('home')}
        className="mt-6 sm:mt-8 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm sm:text-base"
      >
        Back to Home
      </button>
    </div>
  );
}
