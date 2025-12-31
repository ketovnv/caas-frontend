import { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useSpring, animated, config } from '@react-spring/web';
import { LoginButton, authStore } from 'features/auth';
import { WalletCard, walletStore, TransactionForm } from 'entities/wallet';
import { PageLayout } from 'shared/ui';
import { themeStore } from 'shared/model';

// ============================================================================
// Animated Address Component
// ============================================================================

interface AnimatedAddressProps {
  address: string;
  className?: string;
}

const AnimatedAddress = observer(function AnimatedAddress({
  address,
  className
}: AnimatedAddressProps) {
  const [displayAddress, setDisplayAddress] = useState(address);

  const spring = useSpring({
    opacity: 1,
    y: 0,
    from: { opacity: 0, y: -10 },
    reset: address !== displayAddress,
    onRest: () => setDisplayAddress(address),
    config: config.gentle,
  });

  // Shorten address for display
  const shortAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : '';

  const copyToClipboard = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  }, [address]);

  if (!address) return null;

  return (
    <animated.button
      style={spring}
      onClick={copyToClipboard}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl
        bg-zinc-800/50 border border-zinc-700/50
        hover:bg-zinc-700/50 hover:border-zinc-600/50
        transition-colors group
        ${className}
      `}
    >
      <span className="font-mono text-sm text-zinc-400 group-hover:text-zinc-300">
        {shortAddress}
      </span>
      <svg
        className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </animated.button>
  );
});

// ============================================================================
// Home Page - Simplified with WalletCard
// ============================================================================

export const HomePage = observer(function HomePage() {
  const { isConnected} = authStore;

  // Handle send transaction
  const handleSend = useCallback(async (amount: string, address: string): Promise<string> => {
    try {
      const txHash = await walletStore.sendTransaction(address, amount);
      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, []);

  // Get current address


  // Loading state
  // if (status === 'initializing') {
  //   return (
  //     <PageLayout centerContent>
  //       <div className="flex items-center justify-center">
  //         <svg className="w-10 h-10 animate-spin text-violet-500" viewBox="0 0 24 24">
  //           <circle
  //             className="opacity-25"
  //             cx="12" cy="12" r="10"
  //             stroke="currentColor"
  //             strokeWidth="3"
  //             fill="none"
  //           />
  //           <path
  //             className="opacity-75"
  //             fill="currentColor"
  //             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //           />
  //         </svg>
  //       </div>
  //     </PageLayout>
  //   );
  // }

  // Connected - show wallet card
  if (isConnected) {
    return (
      <PageLayout className="items-center justify-center gap-6 p-4 sm:p-8">
        {/* Address */}
        {/* Wallet Card */}
        <WalletCard
          className="my-2"
        />
        <AnimatedAddress address={walletStore.balances.get('tron')?.address || ''} />

        {/* Send Form */}
        <animated.div
          style={themeStore.backgroundStyle}
          className="w-full max-w-sm rounded-2xl  p-4"
        >
          <TransactionForm
            onSend={handleSend}
            isActive={true}
          />
        </animated.div>

        {/* Error */}
        {walletStore.sendError && (
          <div className="w-full max-w-sm p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-red-400 text-sm">{walletStore.sendError}</p>
              <button
                onClick={() => walletStore.clearSendError()}
                className="text-red-400 hover:text-red-300 ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Disconnect */}
        <button
          onClick={() => authStore.disconnect()}
          className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors mt-4"
        >
          Отключиться
        </button>
      </PageLayout>
    );
  }

  // Not connected - show login
  return (
    <PageLayout centerContent>
      <LoginButton />
    </PageLayout>
  );
});
