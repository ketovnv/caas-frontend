import { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { AnimatedCounter, GlowingEffect } from 'shared/ui';
import { themeStore } from 'shared/model';
import { CurrencyListController } from '../model/CurrencyListController.ts';
import {
  CURRENCY_COLORS,
  ENTRANCE_DELAY,
  STAGGER_DELAY,
} from '../config/currency-list.config.ts';

// Icons
import {
  TronIcon,
  Ethereum,
  UsdtIcon,
  UsdcIcon,
} from 'shared/ui/animated/svg-icons';

// ============================================================================
// Types
// ============================================================================

export interface CurrencyItem {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  /** USD value */
  value?: number;
  /** Price change 24h (percentage) */
  change?: number;
  /** Chain or token type for icon */
  type: 'tron' | 'ethereum' | 'usdt' | 'usdc' | 'native';
}

export interface CurrencyListProps {
  items: CurrencyItem[];
  selectedId?: string;
  onSelect?: (item: CurrencyItem, index: number) => void;
  className?: string;
  /** Show USD values */
  showValue?: boolean;
  /** Show price change */
  showChange?: boolean;
  /** Animation preset */
  animation?: 'slideUp' | 'fadeIn' | 'scaleUp';
}

// ============================================================================
// Currency Icon Component
// ============================================================================

interface CurrencyIconProps {
  type: CurrencyItem['type'];
  size?: number;
  isActive?: boolean;
}

const CurrencyIcon = ({ type, size = 40, isActive = false }: CurrencyIconProps) => {
  switch (type) {
    case 'tron':
      return <TronIcon size={size} isActive={isActive} />;
    case 'ethereum':
      return <Ethereum size={size} isActive={isActive} />;
    case 'usdt':
      return <UsdtIcon size={size} isActive={isActive} />;
    case 'usdc':
      return <UsdcIcon size={size} isActive={isActive} />;
    case 'native':
    default:
      // Generic coin icon
      return (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold',
            'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
            'transition-transform',
            isActive && 'scale-110'
          )}
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          $
        </div>
      );
  }
};

// ============================================================================
// Currency List Item
// ============================================================================

interface CurrencyListItemProps {
  item: CurrencyItem;
  index: number;
  isSelected: boolean;
  ctrl: CurrencyListController;
  onClick: () => void;
  showValue?: boolean;
  showChange?: boolean;
}

const CurrencyListItem = observer(function CurrencyListItem({
  item,
  index,
  isSelected,
  ctrl,
  onClick,
  showValue = true,
  showChange = true,
}: CurrencyListItemProps) {
  const itemCtrl = ctrl.get(index);
  const colors = CURRENCY_COLORS[item.type] ?? CURRENCY_COLORS.native!;
  const glow = colors.glow;

  return (
    <animated.div
      onClick={onClick}
      onMouseEnter={() => itemCtrl.hover()}
      onMouseLeave={() => itemCtrl.unhover()}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer',
        'border border-zinc-800/50',
        'transition-colors duration-200',
        isSelected && 'border-violet-500/50'
      )}
      style={{
        opacity: itemCtrl.opacity,
        transform: itemCtrl.transform,
        backgroundColor: itemCtrl.background,
      }}
    >
      {/* Glow Effect */}
      <animated.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          opacity: itemCtrl.glowOpacity,
          boxShadow: `0 0 30px oklch(${glow[0]} ${glow[1]} ${glow[2]} / 0.3)`,
        }}
      />

      {/* Glowing border on selection */}
      {isSelected && (
        <GlowingEffect
          spread={80}
          proximity={100}
          borderWidth={2}
          glow
        />
      )}

      {/* Icon */}
      <div className="relative z-10 shrink-0">
        <CurrencyIcon type={item.type} size={44} isActive={isSelected} />
      </div>

      {/* Info */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <animated.span
            style={themeStore.colorStyle}
            className="font-semibold text-lg"
          >
            {item.symbol}
          </animated.span>
          <span className="font-bold text-lg tabular-nums">
            <AnimatedCounter
              value={item.balance}
              decimals={item.balance < 1 ? 6 : 4}
              duration={800}
              easing="spring"
            />
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <animated.span
            style={themeStore.grayStyle}
            className="text-sm truncate"
          >
            {item.name}
          </animated.span>
          <div className="flex items-center gap-2">
            {showValue && item.value !== undefined && (
              <span className="text-zinc-400 text-sm tabular-nums">
                $<AnimatedCounter
                  value={item.value}
                  decimals={2}
                  duration={600}
                  easing="easeOut"
                />
              </span>
            )}
            {showChange && item.change !== undefined && (
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg
            className="w-5 h-5 text-violet-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </animated.div>
  );
});

// ============================================================================
// Currency List Component
// ============================================================================

export const CurrencyList = observer(function CurrencyList({
  items,
  selectedId,
  onSelect,
  className,
  showValue = true,
  showChange = false,
}: CurrencyListProps) {
  const ctrlRef = useRef<CurrencyListController | null>(null);
  const prevItemsLengthRef = useRef(0);

  // Initialize controller
  if (!ctrlRef.current) {
    ctrlRef.current = new CurrencyListController(items.length, themeStore.springConfig);
  }
  const ctrl = ctrlRef.current;

  // Resize controller when items change
  useEffect(() => {
    ctrl.resize(items.length);
  }, [items.length, ctrl]);

  // Animate in on mount / items change
  useEffect(() => {
    const timer = setTimeout(() => {
      ctrl.animateIn(STAGGER_DELAY);
    }, ENTRANCE_DELAY);
    return () => clearTimeout(timer);
  }, [ctrl]);

  // Re-animate when items length changes significantly
  useEffect(() => {
    if (prevItemsLengthRef.current > 0 && items.length !== prevItemsLengthRef.current) {
      ctrl.reset();
      setTimeout(() => ctrl.animateIn(STAGGER_DELAY), 50);
    }
    prevItemsLengthRef.current = items.length;
  }, [items.length, ctrl]);

  // Update selection
  useEffect(() => {
    const selectedIndex = selectedId
      ? items.findIndex(item => item.id === selectedId)
      : -1;
    ctrl.select(selectedIndex);
  }, [selectedId, items, ctrl]);

  // Cleanup
  useEffect(() => {
    return () => ctrl.dispose();
  }, [ctrl]);

  const handleItemClick = useCallback((item: CurrencyItem, index: number) => {
    onSelect?.(item, index);
  }, [onSelect]);

  if (items.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <animated.p style={themeStore.grayStyle} className="text-sm">
          No currencies available
        </animated.p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item, index) => (
        <CurrencyListItem
          key={item.id}
          item={item}
          index={index}
          isSelected={item.id === selectedId}
          ctrl={ctrl}
          onClick={() => handleItemClick(item, index)}
          showValue={showValue}
          showChange={showChange}
        />
      ))}
    </div>
  );
});

export default CurrencyList;
