import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { themeStore, networkStore } from 'shared/model';
import { cn } from 'shared/lib';
import { resourceStore } from '../model/resource.store';
import { walletStore } from '../model/wallet.store';

// Types

interface TransactionCostProps {
  recipientAddress: string;
  amount: string;
  className?: string;
}

// Icons

function EnergyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function BandwidthIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatTimeSince(timestamp: number | null): string {
  if (!timestamp) return '';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'щойно';
  if (seconds < 120) return '1 хв';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} хв`;

  return `${Math.floor(seconds / 3600)} год`;
}

// Resource Bar

interface ResourceBarProps {
  label: string;
  icon: React.ReactNode;
  available: number;
  needed: number;
  unit?: string;
}

function ResourceBar({ label, icon, available, needed, unit = '' }: ResourceBarProps) {
  const percentage = needed > 0 ? Math.min(100, (available / needed) * 100) : 100;
  const hasEnough = available >= needed;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          {icon}
          <span>{label}</span>
        </div>
        <span className={cn(
          'tabular-nums',
          hasEnough ? 'text-emerald-400' : 'text-amber-400'
        )}>
          {available.toLocaleString()} / {needed.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            hasEnough ? 'bg-emerald-500' : 'bg-amber-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component - Works for both TRX and USDT
// ============================================================================

export const TransactionCost = observer(function TransactionCost({
  recipientAddress,
  amount,
  className,
}: TransactionCostProps) {
  const {
    costEstimate,
    isEstimating,
    availableEnergy,
    availableBandwidth,
    trxBandwidthNeeded,
    trxTransferCost,
    isTrxTransferFree,
    isLoadingResources,
    resourcesError,
    lastUpdated,
  } = resourceStore;
  const { currentAddress, currentBalance, selectedToken } = walletStore;

  const isNative = selectedToken === 'native';
  const hasAmount = amount && parseFloat(amount) > 0;

  // Estimate cost for USDT when params change
  // Resources are fetched by walletStore.fetchBalances(), no need to duplicate
  useEffect(() => {
    if (!currentAddress) return;

    // Estimate cost only for USDT when we have recipient and amount
    if (!isNative && recipientAddress && hasAmount) {
      const trxBalance = parseFloat(currentBalance?.balance || '0');
      resourceStore.estimateCost(currentAddress, recipientAddress, amount, trxBalance);
    } else {
      resourceStore.clearEstimate();
    }
  }, [currentAddress, recipientAddress, amount, isNative, networkStore.selectedNetwork]);

  // Manual refresh handler
  const handleRefresh = async () => {
    if (currentAddress && !isLoadingResources) {
      await resourceStore.refresh(currentAddress);
    }
  };

  // Don't show if no address
  if (!currentAddress) {
    return null;
  }

  const isLoading = isLoadingResources || isEstimating;

  // Error state
  if (resourcesError && !resourceStore.resources) {
    return (
      <div className={cn(
        'p-4 rounded-2xl',
        'bg-zinc-900/60 backdrop-blur-sm',
        'border border-red-500/30',
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-400">Помилка завантаження</span>
          <button
            onClick={handleRefresh}
            disabled={isLoadingResources}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <RefreshIcon className={cn('w-4 h-4', isLoadingResources && 'animate-spin')} />
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Не вдалося отримати ресурси. Спробуйте оновити.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-2xl space-y-3',
        'bg-zinc-900/60 backdrop-blur-sm',
        'border border-zinc-800/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <animated.span style={themeStore.grayStyle} className="text-sm font-medium">
          {isNative ? 'Вартість TRX переказу' : 'Вартість USDT переказу'}
        </animated.span>
        <div className="flex items-center gap-2">
          {/* Last updated */}
          {lastUpdated && !isLoading && (
            <span className="text-xs text-zinc-600">
              {formatTimeSince(lastUpdated)}
            </span>
          )}
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'p-1.5 rounded-lg',
              'text-zinc-500 hover:text-zinc-300',
              'hover:bg-zinc-800/50',
              'transition-colors duration-200',
              'disabled:opacity-50'
            )}
          >
            <RefreshIcon className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* TRX Transfer - Bandwidth only */}
      {isNative && (
        <>
          {resourceStore.resources ? (
            <>
              <ResourceBar
                label="Bandwidth"
                icon={<BandwidthIcon className="w-3.5 h-3.5" />}
                available={availableBandwidth}
                needed={trxBandwidthNeeded}
                unit="bytes"
              />

              {/* Total Cost */}
              <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <animated.span style={themeStore.grayStyle} className="text-sm font-medium">
                    Комісія
                  </animated.span>
                  <span className={cn(
                    'text-sm font-bold tabular-nums',
                    isTrxTransferFree ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {isTrxTransferFree
                      ? 'Безкоштовно'
                      : `${trxTransferCost.toFixed(4)} TRX`
                    }
                  </span>
                </div>

                {!isTrxTransferFree && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Недостатньо bandwidth — буде списано з балансу
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="py-2 text-center">
              <span className="text-zinc-500 text-sm">Завантаження ресурсів...</span>
            </div>
          )}
        </>
      )}

      {/* USDT Transfer - Energy + Bandwidth */}
      {!isNative && costEstimate && (
        <>
          {/* Energy */}
          <ResourceBar
            label="Енергія"
            icon={<EnergyIcon className="w-3.5 h-3.5" />}
            available={availableEnergy}
            needed={costEstimate.energyNeeded}
          />

          {/* Bandwidth */}
          <ResourceBar
            label="Bandwidth"
            icon={<BandwidthIcon className="w-3.5 h-3.5" />}
            available={availableBandwidth}
            needed={costEstimate.bandwidthNeeded}
            unit="bytes"
          />

          {/* Cost Breakdown */}
          <div className="pt-2 border-t border-zinc-800/50 space-y-1.5">
            {/* Energy cost */}
            {costEstimate.energyCostTrx > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Енергія (спалювання TRX)</span>
                <span className="text-amber-400 tabular-nums">
                  {costEstimate.energyCostTrx.toFixed(2)} TRX
                </span>
              </div>
            )}

            {/* Bandwidth cost */}
            {costEstimate.bandwidthCostTrx > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Bandwidth (спалювання TRX)</span>
                <span className="text-amber-400 tabular-nums">
                  {costEstimate.bandwidthCostTrx.toFixed(4)} TRX
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-1">
              <animated.span style={themeStore.grayStyle} className="text-sm font-medium">
                Всього
              </animated.span>
              <span className={cn(
                'text-sm font-bold tabular-nums',
                costEstimate.hasEnoughResources
                  ? 'text-emerald-400'
                  : costEstimate.hasEnoughTrx
                    ? 'text-amber-400'
                    : 'text-red-400'
              )}>
                {costEstimate.hasEnoughResources
                  ? 'Безкоштовно'
                  : `${costEstimate.totalCostTrx.toFixed(4)} TRX`
                }
              </span>
            </div>

            {/* Warning if not enough TRX */}
            {!costEstimate.hasEnoughTrx && !costEstimate.hasEnoughResources && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 rounded-lg">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs text-red-400">
                  Недостатньо TRX для оплати комісії
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* USDT - Loading state when no estimate yet but recipient provided */}
      {!isNative && !costEstimate && recipientAddress && hasAmount && (
        <div className="py-4 text-center">
          <span className="text-zinc-500 text-sm">Розрахунок вартості...</span>
        </div>
      )}

      {/* USDT - No recipient hint */}
      {!isNative && !recipientAddress && (
        <div className="py-2 text-center">
          <span className="text-zinc-500 text-xs">
            Введіть адресу отримувача для розрахунку
          </span>
        </div>
      )}
    </div>
  );
});
