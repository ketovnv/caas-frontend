import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { walletStore } from '../model/wallet.store';
import { getExplorerAddressUrl } from '../config/chains';
import { themeStore } from 'shared/model';
import { BalanceDisplayController } from './BalanceDisplayController';

// ============================================================================
// Balance Display - Shows current chain balance with animation
// ============================================================================

interface BalanceDisplayProps {
  className?: string;
  showAddress?: boolean;
}

export const BalanceDisplay = observer(function BalanceDisplay({
  className,
  showAddress = true,
}: BalanceDisplayProps) {
  const balance = walletStore.currentTokenBalance;
  const chainConfig = walletStore.currentChainConfig;

  // Controller persists between renders
  const ctrlRef = useRef<BalanceDisplayController | null>(null);

  if (!ctrlRef.current) {
    ctrlRef.current = new BalanceDisplayController(themeStore.springConfig);
  }

  const ctrl = ctrlRef.current;

  // Animate in on mount
  useEffect(() => {
    ctrl.show(themeStore.springConfig);
  }, [ctrl]);

  // Reset animation on chain or token change
  useEffect(() => {
    ctrl.reset(themeStore.springConfig);
    ctrl.resetCopied();
  }, [walletStore.selectedChain, walletStore.selectedToken, ctrl]);

  // Cleanup
  useEffect(() => {
    return () => ctrl.dispose();
  }, [ctrl]);

  if (!balance) {
    return (
      <div className={`text-center py-8 ${className || ''}`}>
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  const balanceStr = balance.balance
    ? parseFloat(balance.balance).toFixed(4)
    : '0.0000';

  const explorerUrl = balance.address
    ? getExplorerAddressUrl(chainConfig.id, balance.address)
    : null;

  const handleCopyAddress = () => {
    if (balance.address) {
      ctrl.copyAddress(balance.address);
    }
  };

  return (
    <animated.div
      style={ctrl.mainStyle}
      className={`text-center py-6 ${className || ''}`}
    >
      {/* Label */}
      <animated.p
        style={{ ...ctrl.getTrailStyle(0), ...themeStore.grayStyle }}
        className="text-sm mb-2"
      >
        {balance.symbol} Balance
      </animated.p>

      {/* Balance */}
      <animated.div style={ctrl.getTrailStyle(1)} className="mb-1">
        <animated.span
          style={themeStore.accentStyle}
          className="text-4xl font-bold tabular-nums"
        >
          {balance.isLoading ? '...' : balanceStr}
        </animated.span>
      </animated.div>

      {/* Symbol */}
      <animated.p
        style={{ ...ctrl.getTrailStyle(2), ...themeStore.colorStyle }}
        className="text-xl font-medium"
      >
        {balance.symbol}
      </animated.p>

      {/* Address */}
      {showAddress && balance.address && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={handleCopyAddress}
            className="text-zinc-500 text-xs font-mono truncate max-w-[200px] hover:text-zinc-300 transition-colors"
            title={balance.address}
          >
            {balance.address.slice(0, 8)}...{balance.address.slice(-6)}
          </button>

          {ctrl.copied && (
            <span className="text-emerald-400 text-xs animate-pulse">
              Copied!
            </span>
          )}

          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-violet-400 transition-colors"
              title="Open in explorer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {balance.error && (
        <p className="text-red-400 text-sm mt-2">{balance.error}</p>
      )}
    </animated.div>
  );
});

export default BalanceDisplay;
