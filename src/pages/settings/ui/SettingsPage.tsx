import { LoginButton } from 'features/auth';
import { AnimatedText } from 'shared/ui';
import { RAINBOWGRADIENT, themeStore } from '@/shared';
import { animated } from '@react-spring/web';

export function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 min-h-[60vh]">
      <animated.h1 style={{color: themeStore.goldColor.value}} className="text-5xl font-bold mb-2">Settings</animated.h1>
      <AnimatedText
        text="Configure your preferences"
        colors={RAINBOWGRADIENT}
      />
      <p className="mt-6 text-white/50 text-center max-w-md">
        Connect your wallet to access account settings and preferences
      </p>
      <div className="mt-8">
        <LoginButton />
      </div>
    </div>
  );
}
