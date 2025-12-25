import { LoginButton } from 'features/auth';
import { AnimatedText } from 'shared/ui';
import { RAINBOWGRADIENT } from '@/shared';

export function ExchangePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 min-h-[60vh]">
      <h1 className="text-5xl font-bold mb-2 text-yellow-200">Exchange</h1>
      <AnimatedText
        text="Swap crypto instantly"
        colors={RAINBOWGRADIENT}
      />
      <p className="mt-6 text-white/50 text-center max-w-md">
        Connect your wallet to exchange between currencies with best rates
      </p>
      <div className="mt-8">
        <LoginButton />
      </div>
    </div>
  );
}
