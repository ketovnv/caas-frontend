import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { LoginButton, authStore } from 'features/auth';
import {
  BalanceDisplay,
  ChainSelector,
  TokenSelector,
  walletStore,
} from 'features/wallet';
import { PageLayout, RippleButton } from 'shared/ui';
import { router } from 'app/router';

// ============================================================================
// Home Page - Auth or Balance Display
// ============================================================================

export const HomePage = observer(function HomePage() {
  const { isConnected, status } = authStore;

  // Fetch balances when connected
  useEffect(() => {
    if (isConnected) {
      walletStore.fetchBalances();
    }
  }, [isConnected]);

  // Loading state
  if (status === 'initializing') {
    return (
      <PageLayout centerContent>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-zinc-400" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-zinc-400">Loading...</span>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Connected - show balance and quick actions
  if (isConnected) {
    return (
      <PageLayout className="gap-6 p-4 sm:p-8">
        {/* Chain & Token Selectors */}
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
          <ChainSelector className="justify-center" />
          <TokenSelector className="justify-center" />
        </div>

        {/* Balance Display */}
        <BalanceDisplay showAddress className="py-8" />

        {/* Refresh Button */}
        <button
          onClick={() => walletStore.fetchBalances()}
          disabled={walletStore.isRefreshing}
          className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${walletStore.isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm text-zinc-300">
            {walletStore.isRefreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </button>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center w-full max-w-sm mx-auto mt-4">
          <RippleButton
            onClick={() => router.navigate('wallet')}
            className="flex-1 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span className="font-medium">Send</span>
            </div>
          </RippleButton>

          <RippleButton
            onClick={() => {
              // Copy address
              const address = walletStore.currentAddress;
              if (address) {
                navigator.clipboard.writeText(address);
              }
            }}
            variant="outline"
            className="flex-1 py-4 rounded-2xl"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="font-medium">Receive</span>
            </div>
          </RippleButton>
        </div>

        {/* Disconnect Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => authStore.disconnect()}
            className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </PageLayout>
    );
  }

  // Not connected - show login options
  return (
    <PageLayout centerContent>
      <LoginButton />
    </PageLayout>
  );
});
