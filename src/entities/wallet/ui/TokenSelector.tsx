import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { walletStore } from 'entities/wallet';
import { TOKENS } from '../config/tokens';
import type { TokenId } from '../model/types';
import { createAssetKey } from '../model/types';
import { themeStore } from 'shared/model';
import { TokenButtonController } from '../model/TokenSelectorController.ts';
import { TOKEN_DISPLAY } from '../config/token-selector.config.ts';

// ============================================================================
// Token Selector - Select token within the current chain
// ============================================================================

interface TokenSelectorProps {
  className?: string;
}

export const TokenSelector = observer(function TokenSelector({
  className,
}: TokenSelectorProps) {
  const availableTokens = walletStore.availableTokens;

  return (
    <div className={`flex gap-2 flex-wrap ${className || ''}`}>
      {availableTokens.map((tokenId) => {
        const isActive = walletStore.selectedToken === tokenId;
        const tokenConfig = TOKENS[tokenId];

        // Get balance for this token
        let balance = '0';
        if (tokenId === 'native') {
          balance = walletStore.currentBalance?.balance || '0';
        } else {
          const key = createAssetKey(walletStore.selectedChain, tokenId);
          balance = walletStore.tokenBalances.get(key)?.balance || '0';
        }

        // Get symbol based on chain for native
        const symbol =
          tokenId === 'native'
            ? walletStore.currentChainConfig.symbol
            : tokenConfig.symbol;

        return (
          <TokenButton
            key={tokenId}
            tokenId={tokenId}
            symbol={symbol}
            isActive={isActive}
            balance={balance}
            onClick={() => walletStore.setSelectedToken(tokenId)}
          />
        );
      })}
    </div>
  );
});

// ============================================================================
// Token Button with Controller
// ============================================================================

interface TokenButtonProps {
  tokenId: TokenId;
  symbol: string;
  isActive: boolean;
  balance: string;
  onClick: () => void;
}

const TokenButton = observer(function TokenButton({
  tokenId,
  symbol,
  isActive,
  balance,
  onClick,
}: TokenButtonProps) {
  // Controller persists between renders
  const ctrlRef = useRef<TokenButtonController | null>(null);

  // Initialize controller once
  if (!ctrlRef.current) {
    ctrlRef.current = new TokenButtonController(isActive, themeStore.springConfig);
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

  const formattedBalance = balance ? parseFloat(balance).toFixed(2) : '0.00';
  const display = TOKEN_DISPLAY[tokenId];

  return (
    <animated.button
      style={{
        transform: ctrl.transform,
        opacity: ctrl.opacity,
      }}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        transition-colors text-sm
        ${isActive ? 'bg-zinc-800/80 ring-1 ring-violet-500/50' : 'bg-zinc-900/50'}
      `}
    >
      {/* Token icon/badge */}
      <span
        className={`
          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
          ${display.bgClass} ${display.color}
        `}
      >
        {symbol.charAt(0)}
      </span>

      {/* Token info */}
      <div className="flex flex-col items-start">
        <span className={`font-medium ${isActive ? 'text-white' : 'text-zinc-400'}`}>
          {symbol}
        </span>
        <span className="text-xs text-zinc-500">{formattedBalance}</span>
      </div>
    </animated.button>
  );
});

export default TokenSelector;
