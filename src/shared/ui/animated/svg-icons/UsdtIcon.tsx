import { useRef, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { IconSpring, type OklchTuple } from 'shared/lib';
import { themeStore } from 'shared/model';

// ============================================================================
// Types
// ============================================================================

interface UsdtIconProps {
  className?: string;
  size?: number | string;
  isActive?: boolean;
  animated?: boolean;
}

// ============================================================================
// Color Presets
// ============================================================================

const USDT_COLORS = {
  bg: {
    default: [0.6, 0.18, 165] as OklchTuple,   // Tether green
    active: [0.7, 0.22, 165] as OklchTuple,
  },
  text: {
    default: [0.99, 0.01, 0] as OklchTuple,    // White
  },
};

// ============================================================================
// Component
// ============================================================================

export const UsdtIcon = observer(function UsdtIcon({
  className,
  size = '1em',
  isActive = false,
  animated: enableAnimation = true,
}: UsdtIconProps) {
  const bgRef = useRef<IconSpring | null>(null);
  const textRef = useRef<IconSpring | null>(null);

  if (!bgRef.current) {
    bgRef.current = new IconSpring(
      { fill: isActive ? USDT_COLORS.bg.active : USDT_COLORS.bg.default },
      themeStore.springConfig
    );
    textRef.current = new IconSpring(
      { fill: USDT_COLORS.text.default },
      themeStore.springConfig
    );
  }

  const bg = bgRef.current;
  const text = textRef.current!;

  useEffect(() => {
    bg.fillTo(isActive ? USDT_COLORS.bg.active : USDT_COLORS.bg.default);
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
    bg.fillTo(USDT_COLORS.bg.active);
  };

  const handleMouseLeave = () => {
    if (!enableAnimation || isActive) return;
    bg.scaleTo(1);
    bg.fillTo(USDT_COLORS.bg.default);
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
      {/* T symbol */}
      <animated.g style={{ fill: text.fill }}>
        <rect x="8" y="8" width="16" height="3" rx="1" />
        <rect x="14.5" y="8" width="3" height="16" rx="1" />
      </animated.g>
    </animated.svg>
  );
});

export default UsdtIcon;
