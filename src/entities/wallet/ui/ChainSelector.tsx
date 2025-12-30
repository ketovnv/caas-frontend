import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { walletStore } from '../model/wallet.store';
import { CHAIN_CONFIGS } from '../config/chains';
import type { ChainId } from '../model/types';
import { themeStore } from 'shared/model';
import { ChainButtonController } from '../model/ChainSelectorController.ts';

// ============================================================================
// Chain Selector - Currently Tron only
// ============================================================================

interface ChainSelectorProps {
  className?: string;
}

export const ChainSelector = observer(function ChainSelector({
  className,
}: ChainSelectorProps) {
  // Single chain mode - Tron only
  const chains = Object.keys(CHAIN_CONFIGS) as ChainId[];

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      {chains.map((chainId) => {
        const config = CHAIN_CONFIGS[chainId];
        const isActive = walletStore.selectedChain === chainId;
        const balance = walletStore.balances.get(chainId);

        return (
          <ChainButton
            key={chainId}
            chainId={chainId}
            symbol={config.symbol}
            isActive={isActive}
            balance={balance?.balance}
            isLoading={balance?.isLoading}
            onClick={() => walletStore.setSelectedChain(chainId)}
          />
        );
      })}
    </div>
  );
});

// ============================================================================
// Chain Button with Controller
// ============================================================================

interface ChainButtonProps {
  chainId: ChainId;
  symbol: string;
  isActive: boolean;
  balance?: string;
  isLoading?: boolean;
  onClick: () => void;
}

const ChainButton = observer(function ChainButton({
  symbol,
  isActive,
  balance,
  isLoading,
  onClick,
}: ChainButtonProps) {
  // Controller persists between renders
  const ctrlRef = useRef<ChainButtonController | null>(null);

  // Initialize controller once
  if (!ctrlRef.current) {
    ctrlRef.current = new ChainButtonController(isActive, themeStore.springConfig);
  }

  const ctrl = ctrlRef.current;

  // Animate on active state change
  useEffect(() => {
    ctrl.animateTo(isActive, themeStore.springConfig);
  }, [isActive, ctrl]);

  // Cleanup
  useEffect(() => {
    return () => ctrl.dispose();
  }, [ctrl]);

  const formattedBalance = balance ? parseFloat(balance).toFixed(4) : '0.0000';

  return (
    <animated.button
      style={{
        transform: ctrl.transform,
        opacity: ctrl.opacity,
        borderColor: ctrl.borderColor,
      }}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-4 py-3 rounded-xl
        transition-colors min-w-[100px]
        ${
          isActive
            ? 'bg-zinc-800/80 border-violet-500/50'
            : 'bg-zinc-900/50 border-zinc-800'
        }
        border backdrop-blur-sm
      `}
    >
      <span className="text-lg font-bold">{symbol}</span>
      <span className="text-xs text-zinc-400">
        {isLoading ? '...' : formattedBalance}
      </span>
    </animated.button>
  );
});

export default ChainSelector;
