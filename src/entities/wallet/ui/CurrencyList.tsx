import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { AnimatedCounter, AnimatedList } from 'shared/ui';
import { themeStore } from 'shared/model';
import { CurrencyListController } from '../model/CurrencyListController';
import { CURRENCY_COLORS, STAGGER_DELAY } from '../config/currency-list.config';

// Icons
import {
  TronIcon,
  UsdtIcon,
  UsdtTronIcon,
} from 'shared/ui/animated';

// ============================================================================
// Types
// ============================================================================

export interface CurrencyItem {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  isLoading?: boolean;
  value?: number;
  change?: number;
  type: 'tron' | 'usdt' | 'usdt-trc20' | 'native';
}

export interface CurrencyListProps {
  items: CurrencyItem[];
  selectedId?: string;
  onSelect?: (item: CurrencyItem, index: number) => void;
  className?: string;
  showValue?: boolean;
  showChange?: boolean;
}

// ============================================================================
// Currency Icon
// ============================================================================

interface CurrencyIconProps {
  type: CurrencyItem['type'];
  size?: number;
  isActive?: boolean;
}

const CurrencyIcon = ({ type, size = 40, isActive = false }: CurrencyIconProps) => {
  switch (type) {
    case 'tron':
    case 'native':
      return <TronIcon size={size} isActive={isActive} />;
    case 'usdt':
      return <UsdtIcon size={size} isActive={isActive} />;
    case 'usdt-trc20':
      return <UsdtTronIcon size={size} isActive={isActive} />;
    default:
      return <TronIcon size={size} isActive={isActive} />;
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
      className="relative flex items-center gap-4 px-4 py-3 cursor-pointer"
      style={{
        transform: itemCtrl.scaleTransform,
      }}
    >
      {/* Glow Effect */}
      <animated.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          opacity: itemCtrl.glowOpacity,
          boxShadow: `0 0 25px oklch(${glow[0]} ${glow[1]} ${glow[2]} / 0.25)`,
        }}
      />

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
            {item.isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
            ) : (
              <AnimatedCounter
                value={item.balance}
                decimals={item.balance < 0.01 ? 4 : 2}
                duration={800}
                easing="spring"
              />
            )}
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

    </animated.div>
  );
});

// ============================================================================
// Currency List
// ============================================================================

export const CurrencyList = observer(function CurrencyList({
  items,
  selectedId,
  onSelect,
  className,
  showValue = true,
  showChange = false,
}: CurrencyListProps) {
  // Controller for hover/select effects (lazy init)
  const ctrlRef = useRef<CurrencyListController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new CurrencyListController(themeStore.springConfig);
  }
  const ctrl = ctrlRef.current;

  // Update selection when selectedId changes
  useEffect(() => {
    ctrl.selectById(selectedId, items);
  }, [selectedId, items, ctrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => ctrl.dispose();
  }, [ctrl]);

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
    <AnimatedList
      items={items}
      keyExtractor={(item) => item.id}
      animation="slideLeft"
      staggerDelay={STAGGER_DELAY}
      className={cn('w-full !space-y-1', className)}
      renderItem={(item, index) => (
        <CurrencyListItem
          item={item}
          index={index}
          isSelected={item.id === selectedId}
          ctrl={ctrl}
          onClick={() => onSelect?.(item, index)}
          showValue={showValue}
          showChange={showChange}
        />
      )}
    />
  );
});

export default CurrencyList;
