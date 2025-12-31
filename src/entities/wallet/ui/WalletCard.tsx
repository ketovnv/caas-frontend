import {useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {animated} from '@react-spring/web';
import {cn} from 'shared/lib';
import {AnimatedCounter, TronIcon, UsdtTronIcon} from 'shared/ui/animated';
import {walletStore} from '../model/wallet.store';
import {walletCardController} from '../model/WalletCardController';
import type {TokenId} from '../model/types';
import {themeStore} from "@/shared";

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
    const ctrl = walletCardController;

    // Notify parent of currency change
    useEffect(() => {
        onCurrencyChange?.(ctrl.currentToken);
    }, [ctrl.currentToken, onCurrencyChange]);

    // Get balances
    const trxBalance = walletStore.balances.get('tron');
    const usdtBalance = walletStore.tokenBalances.get('tron:usdt');

    const trxAmount = trxBalance?.balance || '0';
    const usdtAmount = usdtBalance?.balance || '0';
    const isLoading = trxBalance?.isLoading || usdtBalance?.isLoading;

    return (
        <div
            className={cn(
                'relative w-72 h-72 cursor-pointer',
                '[perspective:1200px]',
                className
            )}
            onMouseEnter={ctrl.handleMouseEnter}
            onMouseLeave={ctrl.handleMouseLeave}
            onClick={ctrl.handleClick}
        >
            <animated.div
                className="relative w-full h-full"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: ctrl.rotationTransform,
                    scale: ctrl.scaleValue,
                }}
            >
                {/* Front - TRX */}
                <animated.div
                    style={themeStore.backgroundStyle}
                    className={cn(
                        'absolute inset-0 rounded-3xl overflow-hidden',
                        'border border-zinc-700/50',
                        'shadow-2xl shadow-red-500/10',
                        '[backface-visibility:hidden]',
                        'flex flex-col items-center justify-center gap-6 p-8'
                    )}
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none"/>

                    {/* Icon */}
                    <div className="relative">
                        <TronIcon size={165} isActive={!ctrl.isFlipped}/>
                    </div>

                    {/* Balance */}
                    <div className="relative text-center">
                        <div className="text-4xl font-bold text-white tabular-nums">
                            {isLoading ? (
                                    <span
                                        className="inline-block w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"/>
                                ) :
                                <AnimatedCounter value={parseFloat(trxAmount)} decimals={2}/>}
                        </div>
                        <div className="text-xl text-red-400 font-semibold mt-1">TRX</div>
                    </div>

                    {/* Lock indicator */}
                    {ctrl.isLocked && !ctrl.isFlipped && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                    )}
                </animated.div>

                {/* Back - USDT */}
                <animated.div
                    style={themeStore.backgroundStyle}
                    className={cn(
                        'absolute inset-0 rounded-3xl overflow-hidden',
                        'border border-zinc-700/50',
                        'shadow-2xl shadow-emerald-500/10',
                        '[backface-visibility:hidden]',
                        '[transform:rotateY(180deg)]',
                        'flex flex-col items-center justify-center gap-6 p-8'
                    )}
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none"/>

                    {/* Icon */}
                    <div className="relative">
                        <UsdtTronIcon size={120} isActive={ctrl.isFlipped}/>
                    </div>

                    {/* Balance */}
                    <div className="relative text-center">
                        <div className="text-4xl font-bold text-white tabular-nums">
                            {isLoading ? (
                                <span
                                    className="inline-block w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"/>
                            ) : <AnimatedCounter value={parseFloat(usdtAmount)} decimals={2}/>}
                        </div>
                        <div className="text-xl text-emerald-400 font-semibold mt-1">USDT</div>
                    </div>

                    {/* Lock indicator */}
                    {ctrl.isLocked && ctrl.isFlipped && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                    )}
                </animated.div>
            </animated.div>

            {/* Hint */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-xs text-zinc-500">
          {ctrl.hintText}
        </span>
            </div>
        </div>
    );
});

export default WalletCard;
