import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import {
  TransactionForm,
  NotesSection,
  StatsSection,
  ChainSelector,
  BalanceDisplay,
  TokenSelector,
  walletStore,
  getExplorerTxUrl,
} from 'features/wallet';
import {
  PageLayout,
  MorphingText,
  AnimatedTabs,
  Card,
  CardContent,
  CardHeader,
  type Tab,
} from 'shared/ui';
import { themeStore } from 'shared/model';
import { walletPageController } from '../model';
import { TAB_LABELS, type WalletTabId } from '../config';

// ============================================================================
// Wallet Page - Multi-chain wallet with send/receive functionality
// ============================================================================

export const WalletPage = observer(function WalletPage() {
  const ctrl = walletPageController;
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch balances on mount
  useEffect(() => {
    ctrl.fetchBalances();
  }, [ctrl]);

  // Setup ResizeObserver
  useEffect(() => {
    ctrl.observeElement(contentRef.current);
    return () => ctrl.disconnectObserver();
  }, [ctrl]);

  // Build tabs array
  const tabs: Tab[] = [
    {
      id: 'send',
      label: TAB_LABELS.send,
      content: (
        <TransactionForm
          onSend={ctrl.handleSend}
          isActive={ctrl.activeTab === 'send'}
        />
      ),
    },
    {
      id: 'notes',
      label: TAB_LABELS.notes,
      content: <NotesSection maxNotes={10} isActive={ctrl.activeTab === 'notes'} />,
    },
    {
      id: 'stats',
      label: TAB_LABELS.stats,
      content: <StatsSection isActive={ctrl.activeTab === 'stats'} />,
    },
  ];

  const handleTabChange = (tabId: string) => {
    ctrl.setActiveTab(tabId as WalletTabId);
  };

  return (
    <PageLayout className="gap-4 p-4 sm:p-8">
      {/* Chain Selector */}
      <ChainSelector className="justify-center" />

      {/* Token Selector */}
      <TokenSelector className="justify-center" />

      {/* Balance Display */}
      <BalanceDisplay showAddress />

      {/* Refresh Button */}
      <button
        onClick={ctrl.fetchBalances}
        disabled={walletStore.isRefreshing}
        className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
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
        <span className="text-sm">
          {walletStore.isRefreshing ? 'Refreshing...' : 'Refresh'}
        </span>
      </button>

      {/* Tabs outside the card */}
      <AnimatedTabs
        tabs={tabs}
        activeTab={ctrl.activeTab}
        onTabChange={handleTabChange}
        transition="fade"
        className="w-full"
        tabListClass="justify-center border-0"
        contentClass="hidden"
      />

      {/* Card with content only */}
      <Card style={themeStore.backgroundStyle as unknown as React.CSSProperties} className="w-full border-0">
        <CardHeader>
          <MorphingText
            text={ctrl.activeTitle}
            morphTime={0.8}
            coolDownTime={0.2}
            className="h-7 sm:h-8 text-lg sm:text-xl"
          />
        </CardHeader>
        <CardContent>
          {/* Animated height container */}
          <animated.div style={ctrl.heightStyle}>
            {/* Content measurement wrapper */}
            <div ref={contentRef}>
              <AnimatedTabs
                tabs={tabs}
                activeTab={ctrl.activeTab}
                onTabChange={handleTabChange}
                transition="fade"
                className="w-full"
                tabListClass="hidden"
              />
            </div>
          </animated.div>
        </CardContent>
      </Card>

      {/* Send Error */}
      {walletStore.sendError && (
        <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-red-400 text-sm">{walletStore.sendError}</p>
            <button
              onClick={() => walletStore.clearSendError()}
              className="text-red-400 hover:text-red-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {walletStore.transactions.length > 0 && (
        <Card className="w-full bg-zinc-900/30 border-zinc-800/50">
          <CardHeader>
            <p className="text-zinc-400 text-sm font-medium">Recent Transactions</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {walletStore.transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg
                      className="size-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-200 text-sm font-medium">
                      -{tx.amount} {tx.symbol}
                    </p>
                    <p className="text-zinc-500 text-xs truncate max-w-[150px]">{tx.to}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      tx.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : tx.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.status === 'confirmed' ? '✓' : tx.status === 'pending' ? '...' : '✗'}
                  </span>
                  <a
                    href={getExplorerTxUrl(tx.chainId, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-violet-400 transition-colors"
                    title="Open in explorer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
});
