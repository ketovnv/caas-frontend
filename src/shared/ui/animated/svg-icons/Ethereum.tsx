import { useRef, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { IconSpring, type OklchTuple } from 'shared/lib';
import { themeStore } from 'shared/model';

// ============================================================================
// Types
// ============================================================================

interface EthereumProps {
  className?: string;
  size?: number | string;
  /** Active state (gold color) */
  isActive?: boolean;
  /** Animate on hover */
  animated?: boolean;
}

// ============================================================================
// Color Presets
// ============================================================================

const ETHEREUM_COLORS = {
  light: {
    primary: [0.45, 0.12, 265] as OklchTuple,    // Blue-purple
    secondary: [0.55, 0.15, 200] as OklchTuple,  // Cyan
    accent: [0.35, 0.01, 0] as OklchTuple,       // Dark
  },
  dark: {
    primary: [0.75, 0.12, 265] as OklchTuple,    // Light blue-purple
    secondary: [0.65, 0.18, 200] as OklchTuple,  // Light cyan
    accent: [0.15, 0.01, 0] as OklchTuple,       // Very dark
  },
  active: {
    primary: [0.8, 0.2, 85] as OklchTuple,       // Gold
    secondary: [0.75, 0.18, 45] as OklchTuple,   // Orange-gold
    accent: [0.15, 0.01, 0] as OklchTuple,
  },
};

// ============================================================================
// Component
// ============================================================================

export const Ethereum = observer(function Ethereum({
  className,
  size = '1em',
  isActive = false,
  animated: enableAnimation = true,
}: EthereumProps) {
  // Controllers for different parts
  const primaryRef = useRef<IconSpring | null>(null);
  const secondaryRef = useRef<IconSpring | null>(null);
  const accentRef = useRef<IconSpring | null>(null);

  // Initialize controllers
  if (!primaryRef.current) {
    const colors = themeStore.isDark ? ETHEREUM_COLORS.dark : ETHEREUM_COLORS.light;
    primaryRef.current = new IconSpring({ fill: colors.primary }, themeStore.springConfig);
    secondaryRef.current = new IconSpring({ fill: colors.secondary }, themeStore.springConfig);
    accentRef.current = new IconSpring({ fill: colors.accent }, themeStore.springConfig);
  }

  const primary = primaryRef.current;
  const secondary = secondaryRef.current!;
  const accent = accentRef.current!;

  // React to theme changes
  useEffect(() => {
    const colors = isActive
      ? ETHEREUM_COLORS.active
      : themeStore.isDark
        ? ETHEREUM_COLORS.dark
        : ETHEREUM_COLORS.light;

    primary.fillTo(colors.primary, themeStore.springConfig);
    secondary.fillTo(colors.secondary, themeStore.springConfig);
    accent.fillTo(colors.accent, themeStore.springConfig);
  }, [themeStore.isDark, isActive, primary, secondary, accent]);

  // Cleanup
  useEffect(() => {
    return () => {
      primary.dispose();
      secondary.dispose();
      accent.dispose();
    };
  }, [primary, secondary, accent]);

  // Hover handlers
  const handleMouseEnter = () => {
    if (!enableAnimation) return;
    primary.scaleTo(1.05);
    secondary.scaleTo(1.05);
  };

  const handleMouseLeave = () => {
    if (!enableAnimation) return;
    primary.scaleTo(1);
    secondary.scaleTo(1);
  };

  return (
    <animated.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 784.37 1277.38"
      className={className}
      width={size}
      height={size}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: primary.transform,
        transformOrigin: 'center',
      }}
    >
      <g>
        {/* Primary polygons */}
        <animated.polygon
          style={{ fill: primary.fill }}
          fillRule="nonzero"
          points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54"
        />
        <animated.polygon
          style={{ fill: primary.fill }}
          fillRule="nonzero"
          points="392.07,1277.38 392.07,956.52 0,724.89"
        />

        {/* Secondary polygons */}
        <animated.polygon
          style={{ fill: secondary.fill }}
          fillRule="nonzero"
          points="392.07,0 0,650.54 392.07,882.29 392.07,472.33"
        />
        <animated.polygon
          style={{ fill: secondary.fill }}
          fillRule="nonzero"
          points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89"
        />

        {/* Accent polygon */}
        <animated.polygon
          style={{ fill: accent.fill }}
          fillRule="nonzero"
          points="392.07,882.29 784.13,650.54 392.07,472.33"
        />
        <animated.polygon
          style={{ fill: primary.fill }}
          fillRule="nonzero"
          points="0,650.54 392.07,882.29 392.07,472.33"
        />
      </g>
    </animated.svg>
  );
});

export default Ethereum;
