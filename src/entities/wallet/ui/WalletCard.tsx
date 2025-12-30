import { useState, useCallback, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSpring, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';
import { TronIcon, UsdtTronIcon } from 'shared/ui/animated';
import { walletStore } from '../model/wallet.store';
import type { TokenId } from '../model/types';

// ============================================================================
// Types
// ============================================================================

export interface WalletCardProps {
  className?: string;
  onCurrencyChange?: (currency: TokenId) => void;
}

// ============================================================================
// WalletCard - Flippable card with TRX/USDT
// ============================================================================

export const WalletCard = observer(function WalletCard({
  className,
  onCurrencyChange,
}: WalletCardProps) {
  // State: which side is shown (false = TRX front, true = USDT back)
  const [isFlipped, setIsFlipped] = useState(false);
  // State: is the flip locked (clicked)
  const [isLocked, setIsLocked] = useState(false);
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(hover: none)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Spring animation for flip
  const { rotation, scale } = useSpring({
    rotation: isFlipped ? 180 : 0,
    scale: isFlipped ? 1.02 : 1,
    config: {
      ...config.wobbly,
      tension: 200,
      friction: 20,
    },
  });

  // Get current currency based on flip state
  const currentCurrency: TokenId = isFlipped ? 'usdt' : 'native';

  // Notify parent of currency change
  useEffect(() => {
    onCurrencyChange?.(currentCurrency);
    walletStore.setSelectedToken(currentCurrency);
  }, [currentCurrency, onCurrencyChange]);

  // Handlers
  const handleMouseEnter = useCallback(() => {
    if (isMobile || isLocked) return;
    setIsFlipped(true);
  }, [isMobile, isLocked]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile || isLocked) return;
    setIsFlipped(false);
  }, [isMobile, isLocked]);

  const handleClick = useCallback(() => {
    if (isMobile) {
      // Mobile: toggle flip
      setIsFlipped(prev => !prev);
      setIsLocked(true);
    } else {
      // Desktop: toggle lock
      if (isLocked) {
        // Unlock and flip back
        setIsLocked(false);
        setIsFlipped(false);
      } else {
        // Lock current state
        setIsLocked(true);
      }
    }
  }, [isMobile, isLocked]);

  // Get balances
  const trxBalance = walletStore.balances.get('tron');
  const usdtBalance = walletStore.tokenBalances.get('tron:usdt');

  const trxAmount = trxBalance?.balance || '0';
  const usdtAmount = usdtBalance?.balance || '0';
  const isLoading = trxBalance?.isLoading || usdtBalance?.isLoading;

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative w-72 h-96 cursor-pointer',
        '[perspective:1200px]',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <animated.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: rotation.to(r => `rotateY(${r}deg)`),
          scale,
        }}
      >
        {/* Front - TRX */}
        <div
          className={cn(
            'absolute inset-0 rounded-3xl overflow-hidden',
            'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900',
            'border border-zinc-700/50',
            'shadow-2xl shadow-red-500/10',
            '[backface-visibility:hidden]',
            'flex flex-col items-center justify-center gap-6 p-8'
          )}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none" />

          {/* Icon */}
          <div className="relative">
            <TronIcon size={120} isActive={!isFlipped} />
          </div>

          {/* Balance */}
          <div className="relative text-center">
            <div className="text-4xl font-bold text-white tabular-nums">
              {isLoading ? (
                <span className="inline-block w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              ) : (
                parseFloat(trxAmount).toFixed(4)
              )}
            </div>
            <div className="text-xl text-red-400 font-semibold mt-1">TRX</div>
          </div>

          {/* Lock indicator */}
          {isLocked && !isFlipped && (
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        {/* Back - USDT */}
        <div
          className={cn(
            'absolute inset-0 rounded-3xl overflow-hidden',
            'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900',
            'border border-zinc-700/50',
            'shadow-2xl shadow-emerald-500/10',
            '[backface-visibility:hidden]',
            '[transform:rotateY(180deg)]',
            'flex flex-col items-center justify-center gap-6 p-8'
          )}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />

          {/* Icon */}
          <div className="relative">
            <UsdtTronIcon size={120} isActive={isFlipped} />
          </div>

          {/* Balance */}
          <div className="relative text-center">
            <div className="text-4xl font-bold text-white tabular-nums">
              {isLoading ? (
                <span className="inline-block w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                parseFloat(usdtAmount).toFixed(2)
              )}
            </div>
            <div className="text-xl text-emerald-400 font-semibold mt-1">USDT</div>
          </div>

          {/* Lock indicator */}
          {isLocked && isFlipped && (
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>
      </animated.div>

      {/* Hint */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-xs text-zinc-500">
          {isMobile ? 'Tap to flip' : isLocked ? 'Click to unlock' : 'Hover to preview, click to lock'}
        </span>
      </div>
    </div>
  );
});

export default WalletCard;
