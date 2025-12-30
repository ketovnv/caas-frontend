import { useRef, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { IconSpring, type OklchTuple } from 'shared/lib';
import { themeStore } from 'shared/model';

// ============================================================================
// Types
// ============================================================================

interface UsdtTronIconProps {
  className?: string;
  size?: number | string;
  isActive?: boolean;
  animated?: boolean;
}

// ============================================================================
// Color Presets (Tron-inspired teal/green)
// ============================================================================

const USDT_TRON_COLORS = {
  bg: {
    default: [0.55, 0.12, 175] as OklchTuple,   // Tron teal
    active: [0.65, 0.15, 175] as OklchTuple,
  },
  text: {
    default: [0.99, 0.01, 0] as OklchTuple,     // White
  },
};

// ============================================================================
// Component
// ============================================================================

export const UsdtTronIcon = observer(function UsdtTronIcon({
  className,
  size = '1em',
  isActive = false,
  animated: enableAnimation = true,
}: UsdtTronIconProps) {
  const bgRef = useRef<IconSpring | null>(null);
  const textRef = useRef<IconSpring | null>(null);

  if (!bgRef.current) {
    bgRef.current = new IconSpring(
      { fill: isActive ? USDT_TRON_COLORS.bg.active : USDT_TRON_COLORS.bg.default },
      themeStore.springConfig
    );
    textRef.current = new IconSpring(
      { fill: USDT_TRON_COLORS.text.default },
      themeStore.springConfig
    );
  }

  const bg = bgRef.current;
  const text = textRef.current!;

  useEffect(() => {
    bg.fillTo(isActive ? USDT_TRON_COLORS.bg.active : USDT_TRON_COLORS.bg.default);
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
    bg.fillTo(USDT_TRON_COLORS.bg.active);
  };

  const handleMouseLeave = () => {
    if (!enableAnimation || isActive) return;
    bg.scaleTo(1);
    bg.fillTo(USDT_TRON_COLORS.bg.default);
  };

  return (
    <animated.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ transform: bg.transform, transformOrigin: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Diamond background + USDT symbol */}
      <animated.path
        style={{ fill: bg.fill }}
        d="M12 20L2 10.135L5.815 4h12.37L22 10.135z"
      />
      <animated.path
        style={{ fill: text.fill }}
        d="M13 11V9.78c1.8.09 3.48.44 4 .895c-.605.53-2.77.915-5 .915s-4.395-.385-5-.915c.515-.455 2.2-.8 4-.9V11zm-6-.33v.735c.515.455 2.195.8 4 .9V15h2v-2.7c1.8-.09 3.485-.44 4-.895V9.94c-.515-.455-2.2-.805-4-.9V8h3V6.5H8V8h3v1.04c-1.805.095-3.485.445-4 .9z"
      />
    </animated.svg>
  );
});

export default UsdtTronIcon;
