import { useRef, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { IconSpring, type OklchTuple } from 'shared/lib';
import { themeStore } from 'shared/model';

// ============================================================================
// Types
// ============================================================================

interface UsdcIconProps {
  className?: string;
  size?: number | string;
  isActive?: boolean;
  animated?: boolean;
}

// ============================================================================
// Color Presets
// ============================================================================

const USDC_COLORS = {
  bg: {
    default: [0.55, 0.2, 260] as OklchTuple,   // USDC blue
    active: [0.65, 0.24, 260] as OklchTuple,
  },
  text: {
    default: [0.99, 0.01, 0] as OklchTuple,
  },
};

// ============================================================================
// Component
// ============================================================================

export const UsdcIcon = observer(function UsdcIcon({
  className,
  size = '1em',
  isActive = false,
  animated: enableAnimation = true,
}: UsdcIconProps) {
  const bgRef = useRef<IconSpring | null>(null);
  const textRef = useRef<IconSpring | null>(null);

  if (!bgRef.current) {
    bgRef.current = new IconSpring(
      { fill: isActive ? USDC_COLORS.bg.active : USDC_COLORS.bg.default },
      themeStore.springConfig
    );
    textRef.current = new IconSpring(
      { fill: USDC_COLORS.text.default },
      themeStore.springConfig
    );
  }

  const bg = bgRef.current;
  const text = textRef.current!;

  useEffect(() => {
    bg.fillTo(isActive ? USDC_COLORS.bg.active : USDC_COLORS.bg.default);
    if (isActive) bg.scaleTo(1.1);
    else bg.scaleTo(1);
  }, [isActive, bg]);

  useEffect(() => () => {
    bg.dispose();
    text.dispose();
  }, [bg, text]);

  const handleMouseEnter = () => {
    if (!enableAnimation || isActive) return;
    bg.scaleTo(1.1);
    bg.fillTo(USDC_COLORS.bg.active);
  };

  const handleMouseLeave = () => {
    if (!enableAnimation || isActive) return;
    bg.scaleTo(1);
    bg.fillTo(USDC_COLORS.bg.default);
  };

  return (
    <animated.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      style={{ transform: bg.transform, transformOrigin: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background circle */}
      <animated.circle
        cx="16"
        cy="16"
        r="15"
        style={{ fill: bg.fill }}
      />
      {/* Dollar sign */}
      <animated.g style={{ fill: text.fill }}>
        <path d="M16 7v2.5c-2.5 0-4.5 1.5-4.5 3.5 0 1.5 1 2.5 2.5 3l2 .5c1 .25 1.5.75 1.5 1.5 0 1-1 1.5-2 1.5s-2-.5-2.5-1.5l-2 1c.5 1.5 2 2.5 4 2.5V23h2v-1.5c2.5 0 4.5-1.5 4.5-3.5 0-1.5-1-2.5-2.5-3l-2-.5c-1-.25-1.5-.75-1.5-1.5 0-1 1-1.5 2-1.5s2 .5 2.5 1.5l2-1c-.5-1.5-2-2.5-4-2.5V7h-2z" />
      </animated.g>
    </animated.svg>
  );
});

export default UsdcIcon;
