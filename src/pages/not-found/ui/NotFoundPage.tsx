import { AnimatedText } from 'shared/ui';
import { RAINBOWGRADIENT, themeStore } from '@/shared';
import { router } from 'app/router';
import { animated } from '@react-spring/web';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 min-h-[60vh]">
      <animated.h1 style={{color: themeStore.goldColor.value}} className="text-8xl font-bold mb-2">404</animated.h1>
      <AnimatedText
        text="Page not found"
        colors={RAINBOWGRADIENT}
      />
      <p className="mt-6 text-white/50 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved
      </p>
      <button
        onClick={() => router.navigate('home')}
        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
}
