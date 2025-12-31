// ============================================================================
// Transaction Cost Display
// ============================================================================

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import { resourceStore } from '../model/resource.store';
import { walletStore } from '../model/wallet.store';

// ============================================================================
// Types
// ============================================================================

interface TransactionCostProps {
  recipientAddress: string;
  amount: string;
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

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

// ============================================================================
// Resource Bar
// ============================================================================

interface ResourceBarProps {
  label: string;
  icon: React.ReactNode;
  available: number;
  needed: number;
  unit: string;
}

function ResourceBar({ label, icon, available, needed, unit }: ResourceBarProps) {
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
// Main Component
// ============================================================================

export const TransactionCost = observer(function TransactionCost({
  recipientAddress,
  amount,
  className,
}: TransactionCostProps) {
  const { costEstimate, isEstimating, availableEnergy, availableBandwidth } = resourceStore;
  const { currentAddress, currentBalance } = walletStore;

  // Fetch resources and estimate cost when params change
  useEffect(() => {
    if (!currentAddress) return;

    // Fetch wallet resources
    resourceStore.fetchResources(currentAddress);

    // Estimate cost if we have recipient and amount
    if (recipientAddress && amount && parseFloat(amount) > 0) {
      const trxBalance = parseFloat(currentBalance?.balance || '0');
      resourceStore.estimateCost(currentAddress, recipientAddress, amount, trxBalance);
    } else {
      resourceStore.clearEstimate();
    }
  }, [currentAddress, recipientAddress, amount]);

  // Don't show if no estimate needed
  if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
    return null;
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
          Вартість транзакції
        </animated.span>
        {isEstimating && (
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        )}
      </div>

      {/* Resources */}
      {costEstimate && (
        <>
          {/* Energy */}
          <ResourceBar
            label="Енергія"
            icon={<EnergyIcon className="w-3.5 h-3.5" />}
            available={availableEnergy}
            needed={costEstimate.energyNeeded}
            unit=""
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

      {/* Loading state */}
      {isEstimating && !costEstimate && (
        <div className="py-4 text-center">
          <span className="text-zinc-500 text-sm">Розрахунок вартості...</span>
        </div>
      )}
    </div>
  );
});
