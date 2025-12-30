import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import {
  CurrencyList,
  type CurrencyItem,
  walletStore,
  CHAIN_CONFIGS,
  TOKENS,
} from 'features/wallet';
import { authStore } from 'features/auth';
import {
  PageLayout,
  MorphingText,
  Card,
  CardContent,
} from 'shared/ui';
import { themeStore } from 'shared/model';

// ============================================================================
// Wallet Page - Currency List
// ============================================================================

export const WalletPage = observer(function WalletPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  // Fetch balances on mount
  useEffect(() => {
    if (authStore.isConnected) {
      walletStore.fetchBalances();
    }
  }, []);

  // Convert wallet balances to CurrencyItem format
  const currencies = useMemo((): CurrencyItem[] => {
    const items: CurrencyItem[] = [];

    // Add native balances (TRX, ETH)
    for (const [chainId, balance] of walletStore.balances) {
      const config = CHAIN_CONFIGS[chainId];
      if (!config) continue;

      items.push({
        id: chainId,
        symbol: config.symbol,
        name: config.name,
        balance: parseFloat(balance.balance) || 0,
        type: chainId as CurrencyItem['type'],
      });
    }

    // Add token balances (USDT, USDC on each chain)
    for (const [key, balance] of walletStore.tokenBalances) {
      const tokenConfig = TOKENS[balance.tokenId];
      if (!tokenConfig) continue;

      items.push({
        id: key,
        symbol: `${balance.symbol} (${CHAIN_CONFIGS[balance.chainId]?.symbol || balance.chainId})`,
        name: tokenConfig.name,
        balance: parseFloat(balance.balance) || 0,
        type: balance.tokenId as CurrencyItem['type'],
      });
    }

    return items;
  }, [
    walletStore.balances.size,
    walletStore.tokenBalances.size,
    // Re-compute when any balance updates
    ...Array.from(walletStore.balances.values()).map(b => b.balance),
    ...Array.from(walletStore.tokenBalances.values()).map(b => b.balance),
  ]);

  const handleCurrencySelect = (item: CurrencyItem) => {
    setSelectedCurrency(item.id);

    // Update walletStore selection
    if (item.type === 'tron' || item.type === 'ethereum') {
      walletStore.setSelectedChain(item.type);
      walletStore.setSelectedToken('native');
    } else if (item.type === 'usdt' || item.type === 'usdc') {
      // Parse chain from id (format: "chainId:tokenId")
      const [chainId] = item.id.split(':');
      if (chainId === 'tron' || chainId === 'ethereum') {
        walletStore.setSelectedChain(chainId);
        walletStore.setSelectedToken(item.type);
      }
    }
  };

  // Not connected state
  if (!authStore.isConnected) {
    return (
      <PageLayout centerContent>
        <animated.p style={themeStore.grayStyle} className="text-center">
          Подключите кошелёк для просмотра баланса
        </animated.p>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="gap-6 p-4 sm:p-8">
      {/* Header */}
      <div className="text-center">
        <MorphingText
          text="Мои активы"
          morphTime={0.8}
          coolDownTime={0.2}
          className="h-8 sm:h-10 text-xl sm:text-2xl font-bold"
        />
      </div>

      {/* Currency List */}
      <Card
        style={themeStore.backgroundStyle as unknown as React.CSSProperties}
        className="w-full border-0"
      >
        <CardContent className="p-4">
          <CurrencyList
            items={currencies}
            selectedId={selectedCurrency ?? undefined}
            onSelect={handleCurrencySelect}
            showValue={false}
            showChange={false}
          />
        </CardContent>
      </Card>

      {/* Selected Currency Info */}
      {selectedCurrency && (
        <animated.div
          style={themeStore.grayStyle}
          className="text-center text-sm"
        >
          Выбрано: {currencies.find(c => c.id === selectedCurrency)?.symbol}
        </animated.div>
      )}
    </PageLayout>
  );
});
