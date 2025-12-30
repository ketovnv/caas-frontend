import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { LoginButton, authStore } from 'features/auth';
import {
  BalanceDisplay,
  ChainSelector,
  TokenSelector,
  TransactionForm,
  NotesSection,
  StatsSection,
  walletStore,
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
import { walletPageController } from 'pages/wallet/model';
import { TAB_LABELS, type WalletTabId } from 'pages/wallet/config';

// ============================================================================
// Home Page - Auth or Wallet Dashboard
// ============================================================================

export const HomePage = observer(function HomePage() {
  const { isConnected, status } = authStore;
  const ctrl = walletPageController;
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch balances when connected
  useEffect(() => {
    if (isConnected) {
      walletStore.fetchBalances();
    }
  }, [isConnected]);

  // Setup ResizeObserver for tab content
  useEffect(() => {
    if (isConnected) {
      ctrl.observeElement(contentRef.current);
      return () => ctrl.disconnectObserver();
    }
  }, [isConnected, ctrl]);

  // Loading state - simple spinner without text
  if (status === 'initializing') {
    return (
      <PageLayout centerContent>
        <div className="flex items-center justify-center">
          <svg className="w-8 h-8 animate-spin text-violet-500" viewBox="0 0 24 24">
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
        </div>
      </PageLayout>
    );
  }

  // Connected - show dashboard with tabs
  if (isConnected) {
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
        {/* Chain & Token Selectors */}
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          <ChainSelector className="justify-center" />
          <TokenSelector className="justify-center" />
        </div>

        {/* Balance Display */}
        <BalanceDisplay showAddress className="py-6" />

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
        <Card
          style={themeStore.backgroundStyle as unknown as React.CSSProperties}
          className="w-full border-0"
        >
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

        {/* Disconnect Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => authStore.disconnect()}
            className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
          >
            Отключиться
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
