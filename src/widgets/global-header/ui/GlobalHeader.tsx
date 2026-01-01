import { observer } from 'mobx-react-lite';
import { MorphingText, AnimatedText } from 'shared/ui';
import { router, routeConfigs } from 'app/router';
import { RAINBOWGRADIENT, type OklchTuple } from '@/shared';

// GlobalHeader - App-level header with morphing title

export const GlobalHeader = observer(function GlobalHeader() {
  const config = routeConfigs[router.currentRoute];
  const { displayTitle, subtitle } = config;

  return (
    <header className="flex-shrink-0 pt-2 sm:pt-4 sm:pb-6 w-full px-4">
      {/* Title */}
      <div className="text-center">
        <MorphingText
          text={displayTitle}
          morphTime={0.8}
          coolDownTime={0.2}
          className="h-10 sm:h-12 text-3xl sm:text-4xl lg:text-5xl text-center mx-auto"
        />
        {subtitle && (
          <AnimatedText
            text={subtitle}
            colors={RAINBOWGRADIENT as unknown as OklchTuple[]}
            className="text-sm sm:text-base mt-2"
          />
        )}
      </div>
    </header>
  );
});
